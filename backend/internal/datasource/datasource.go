package datasource

import (
	"net/http"
	"time"

	"github.com/MyStarship/starship/backend/internal/user"
	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/db"
	"github.com/MyStarship/starship/backend/pkg/e"
	"github.com/MyStarship/starship/backend/pkg/log"
	"github.com/MyStarship/starship/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "datasource")

func SaveDatasource(c *gin.Context) {
	ds := &models.Datasource{}
	err := c.Bind(&ds)
	if err != nil {
		logger.Warn("save datasource request data error", "error", err)
		c.JSON(http.StatusBadRequest, common.RespError(err.Error()))
		return
	}

	u := user.CurrentUser((c))
	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	now := time.Now()
	if ds.Id == 0 {
		// create
		res, err := db.Conn.Exec("INSERT INTO datasource (name,type,url,created,updated) VALUES (?,?,?,?,?)", ds.Name, ds.Type, ds.URL, now, now)
		if err != nil {
			if e.IsErrUniqueConstraint(err) {
				c.JSON(http.StatusBadRequest, common.RespError("name alread exist"))
				return
			}
			logger.Warn("insert datasource error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespInternalError())
			return
		}

		id, _ := res.LastInsertId()
		ds.Id = id

	} else {
		// update
		_, err = db.Conn.Exec("UPDATE datasource SET name=?,type=?,url=?,updated=? WHERE id=?", ds.Name, ds.Type, ds.URL, now, ds.Id)
		if err != nil {
			logger.Warn("insert datasource error", "error", err)
			c.JSON(http.StatusInternalServerError, common.RespInternalError())
			return
		}
	}

	c.JSON(http.StatusOK, common.RespSuccess(ds.Id))
}
