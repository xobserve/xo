package annotation

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "annotation")

type AnnotationSettings struct {
	Enable     bool            `json:"enable"`
	EnableRole models.RoleType `json:"enableRole"`
}

func SetAnnotation(c *gin.Context) {
	anno := &models.Annotation{}
	err := c.Bind(&anno)
	if err != nil {
		logger.Warn("bind annotation err", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError("annotation invalid"))
		return
	}

	tags, err := json.Marshal(anno.Tags)
	if err != nil {
		logger.Warn("marshal tags err", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError("annotation invalid"))
		return
	}
	u := c.MustGet("currentUser").(*models.User)
	canEdit, err := canUserEdit(c.Request.Context(), anno.NamespaceId, u)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	if !canEdit {
		c.JSON(http.StatusForbidden, common.RespError("no permission"))
		return
	}

	now := time.Now()

	if anno.Id == 0 {
		res, err := db.Conn.ExecContext(c.Request.Context(), "INSERT INTO annotation (text,time,duration,tags,namespace_id,group_id,userId,created,updated) VALUES (?,?,?,?,?,?,?,?,?)",
			anno.Text, anno.Time, anno.Duration, tags, anno.NamespaceId, anno.GroupId, u.Id, now, now)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(http.StatusBadRequest, common.RespError("annotation already exist in this time point"))
				return
			}
			logger.Warn("insert annotation err", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError("insert annotation err"))
			return
		}

		id, err := res.LastInsertId()
		if err != nil {
			logger.Warn("get last insert id err", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError("insert annotation err"))
			return
		}
		anno.Id = id
	} else {
		_, err := db.Conn.ExecContext(c.Request.Context(), "UPDATE annotation SET text=?,tags=?,duration=?, updated=? WHERE id=?",
			anno.Text, tags, anno.Duration, now, anno.Id)
		if err != nil {
			logger.Warn("update annotation err", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError("update annotation err"))
			return
		}
	}

	c.JSON(200, common.RespSuccess(anno.Id))
}

func QueryNamespaceAnnotations(c *gin.Context) {
	namespace := c.Param("namespace")
	start := c.Query("start")
	end := c.Query("end")
	rows, err := db.Conn.QueryContext(c.Request.Context(), "SELECT id,text,time,duration,tags,group_id,userId,created FROM annotation WHERE namespace_id=? and time >= ? and time <= ?", namespace, start, end)
	if err != nil {
		logger.Warn("query annotation err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("query annotation err"))
		return
	}
	defer rows.Close()
	annos := make([]*models.Annotation, 0)
	for rows.Next() {
		anno := &models.Annotation{}
		var tags []byte
		err := rows.Scan(&anno.Id, &anno.Text, &anno.Time, &anno.Duration, &tags, &anno.GroupId, &anno.UserId, &anno.Created)
		if err != nil {
			logger.Warn("scan annotation err", "error", err)
			continue
		}
		err = json.Unmarshal(tags, &anno.Tags)
		if err != nil {
			logger.Warn("unmarshal tags err", "error", err)
			continue
		}

		anno.NamespaceId = namespace
		annos = append(annos, anno)
	}

	c.JSON(200, common.RespSuccess(annos))
}

func RemoveAnnotation(c *gin.Context) {
	namespace := c.Param("namespace")
	id := c.Param("id")

	u := c.MustGet("currentUser").(*models.User)
	canEdit, err := canUserEdit(c.Request.Context(), namespace, u)
	if err != nil {
		c.JSON(400, common.RespError(err.Error()))
		return
	}

	if !canEdit {
		c.JSON(http.StatusForbidden, common.RespError("no permission"))
		return
	}

	_, err = db.Conn.ExecContext(c.Request.Context(), "DELETE FROM annotation WHERE id=?", id)
	if err != nil {
		logger.Warn("delete annotation err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("delete annotation err"))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func RemoveGroupAnnotations(c *gin.Context) {
	namespace := c.Param("namespace")
	group := c.Param("group")
	expires, err := strconv.Atoi(c.Param("expires"))
	if err != nil {
		c.JSON(http.StatusBadRequest, common.RespError("invalid expires"))
		return
	}

	u := c.MustGet("currentUser").(*models.User)
	ownedBy, err := models.QueryDashboardBelongsTo(c.Request.Context(), namespace)
	if err != nil {
		logger.Warn("query dashboard err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("query dashboard err"))
		return
	}
	isTeamAdmin, err := models.IsTeamAdmin(c.Request.Context(), ownedBy, u.Id)
	if err != nil {
		logger.Warn("check team admin err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("check team admin err"))
		return
	}

	if !isTeamAdmin {
		c.JSON(http.StatusForbidden, common.RespError("no permission"))
		return
	}

	deleteBefore := time.Now().Add(-time.Duration(expires) * time.Hour * 24)
	_, err = db.Conn.ExecContext(c.Request.Context(), "DELETE FROM annotation WHERE namespace_id=? and group_id=? and created < ?", namespace, group, deleteBefore)
	if err != nil {
		logger.Warn("delete annotation err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("delete annotation err"))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}

func canUserEdit(ctx context.Context, dashboardId string, u *models.User) (bool, error) {
	dash, err := models.QueryDashboard(ctx, dashboardId)
	if err != nil {
		return false, fmt.Errorf("query dashboard error: %w", err)
	}

	enableAnnotation, err := dash.Data.Get("annotation").Get("enable").Bool()
	if err != nil {
		return false, fmt.Errorf("get annotation enable err: %w", err)
	}

	if !enableAnnotation {
		return false, errors.New("dashboard annotation disabled")
	}

	enableRole, err := dash.Data.Get("annotation").Get("enableRole").String()
	if err != nil {
		return false, fmt.Errorf("get annotation enable role err: %w", err)
	}

	teamMember, err := models.QueryTeamMember(ctx, dash.OwnedBy, u.Id)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, errors.New(e.NotTeamMember)
		}

		return false, fmt.Errorf("query team member err: %w", err)
	}

	if enableRole == models.ROLE_ADMIN {
		if !teamMember.Role.IsAdmin() {
			return false, errors.New(e.NeedTeamAdmin)
		}
	}

	return true, nil

}
