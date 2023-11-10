package tenant

import (
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/xObserve/xObserve/query/internal/user"
	"github.com/xObserve/xObserve/query/pkg/colorlog"
	"github.com/xObserve/xObserve/query/pkg/common"
	"github.com/xObserve/xObserve/query/pkg/db"
	"github.com/xObserve/xObserve/query/pkg/e"
	"github.com/xObserve/xObserve/query/pkg/models"
)

var logger = colorlog.RootLogger.New("logger", "tenant")

func QueryTenants(c *gin.Context) {
	u := user.CurrentUser(c)

	if !u.Role.IsAdmin() {
		c.JSON(403, common.RespError(e.NoPermission))
		return
	}

	rows, err := db.Conn.QueryContext(c.Request.Context(), `SELECT id,name,owner_id,created FROM tenant`)
	if err != nil {
		logger.Warn("Error get all tenants", "error", err)
		c.JSON(500, common.RespInternalError())
		return
	}

	tenants := make(models.Tenants, 0)
	defer rows.Close()

	for rows.Next() {
		tenant := &models.Tenant{}
		err := rows.Scan(&tenant.Id, &tenant.Name, &tenant.OwnerId, &tenant.Created)
		if err != nil {
			logger.Warn("get all users scan error", "error", err)
			continue
		}

		owner, _ := models.QueryUserById(c.Request.Context(), tenant.OwnerId)
		tenant.Owner = owner.Username

		tenants = append(tenants, tenant)
	}

	sort.Sort(tenants)
	c.JSON(200, common.RespSuccess(tenants))
}
