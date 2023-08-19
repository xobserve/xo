package annotation

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/DataObserve/datav/backend/internal/user"
	"github.com/DataObserve/datav/backend/pkg/common"
	"github.com/DataObserve/datav/backend/pkg/db"
	"github.com/DataObserve/datav/backend/pkg/e"
	"github.com/DataObserve/datav/backend/pkg/log"
	"github.com/DataObserve/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "annotation")

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

	dash, err := models.QueryDashboard(anno.NamespaceId)
	if err != nil {
		logger.Warn("query dashboard error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError("dashboard not found"))
		return
	}

	enableAnnotation, err := dash.Data.Get("annotation").Get("enable").Bool()
	if err != nil {
		logger.Warn("get annotation enable err", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError("dashboard annotation settings invalid"))
		return
	}

	if !enableAnnotation {
		c.JSON(http.StatusBadRequest, common.RespError("dashboard annotation disabled"))
		return
	}

	enableRole, err := dash.Data.Get("annotation").Get("enableRole").String()
	if err != nil {
		logger.Warn("get annotation enable role err", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError("dashboard annotation settings invalid"))
		return
	}

	u := user.CurrentUser(c)
	if enableRole != models.ROLE_VIEWER {
		if !u.Role.IsAdmin() {
			isTeamAdmin, err := models.IsTeamAdmin(dash.OwnedBy, u.Id)
			if err != nil {
				logger.Warn("check team admin err", "error", err)
				c.JSON(http.StatusInternalServerError, common.RespError("check team admin err"))
				return
			}

			if !isTeamAdmin {
				c.JSON(http.StatusForbidden, common.RespError("no permission"))
				return
			}
		}
	}

	now := time.Now()

	if anno.Id == 0 {
		res, err := db.Conn.Exec("INSERT INTO annotation (text,time,duration,tags,namespaceId,groupId,userId,created,updated) VALUES (?,?,?,?,?,?,?,?,?)",
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
		_, err := db.Conn.Exec("UPDATE annotation SET text=?,tags=?,duration=?, updated=? WHERE id=?",
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
	rows, err := db.Conn.Query("SELECT id,text,time,duration,tags,groupId,userId,created FROM annotation WHERE namespaceId=? and time >= ? and time <= ?", namespace, start, end)
	if err != nil {
		logger.Warn("query annotation err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("query annotation err"))
		return
	}

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

	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		ownedBy, err := models.QueryDashboardBelongsTo(namespace)
		if err != nil {
			logger.Warn("query dashboard err", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError("query dashboard err"))
			return
		}

		isTeamAdmin, err := models.IsTeamAdmin(ownedBy, u.Id)
		if err != nil {
			logger.Warn("check team admin err", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError("check team admin err"))
			return
		}

		if !isTeamAdmin {
			c.JSON(http.StatusForbidden, common.RespError("no permission"))
			return
		}
	}

	_, err := db.Conn.Exec("DELETE FROM annotation WHERE id=?", id)
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

	u := user.CurrentUser(c)
	if !u.Role.IsAdmin() {
		ownedBy, err := models.QueryDashboardBelongsTo(namespace)
		if err != nil {
			logger.Warn("query dashboard err", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError("query dashboard err"))
			return
		}
		isTeamAdmin, err := models.IsTeamAdmin(ownedBy, u.Id)
		if err != nil {
			logger.Warn("check team admin err", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespError("check team admin err"))
			return
		}

		if !isTeamAdmin {
			c.JSON(http.StatusForbidden, common.RespError("no permission"))
			return
		}
	}

	_, err := db.Conn.Exec("DELETE FROM annotation WHERE namespaceId=? and groupId=?", namespace, group)
	if err != nil {
		logger.Warn("delete annotation err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("delete annotation err"))
		return
	}

	c.JSON(200, common.RespSuccess(nil))
}
