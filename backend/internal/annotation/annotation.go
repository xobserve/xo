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

	u := user.CurrentUser(c)
	now := time.Now()

	if anno.Id == 0 {
		res, err := db.Conn.Exec("INSERT INTO annotation (text,time,timeEnd,tags,namespaceId,groupId,userId,created,updated) VALUES (?,?,?,?,?,?,?,?,?)",
			anno.Text, anno.Time, anno.TimeEnd, tags, anno.NamespaceId, anno.GroupId, u.Id, now, now)
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
		_, err := db.Conn.Exec("UPDATE annotation SET text=?,tags=?, updated=? WHERE id=?",
			anno.Text, tags, now, anno.Id)
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
	rows, err := db.Conn.Query("SELECT id,text,time,timeEnd,tags,groupId,userId,created FROM annotation WHERE namespaceId=? and time >= ? and time <= ?", namespace, start, end)
	if err != nil {
		logger.Warn("query annotation err", "error", err)
		c.JSON(http.StatusInternalServerError, common.RespError("query annotation err"))
		return
	}

	annos := make([]*models.Annotation, 0)
	for rows.Next() {
		anno := &models.Annotation{}
		var tags []byte
		err := rows.Scan(&anno.Id, &anno.Text, &anno.Time, &anno.TimeEnd, &tags, &anno.GroupId, &anno.UserId, &anno.Created)
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
