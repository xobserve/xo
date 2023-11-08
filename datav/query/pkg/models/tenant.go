package models

import "github.com/gin-gonic/gin"

const DefaultTenant = "default"
const DefaultTenantId = 1

func GetTenant(c *gin.Context) string {
	return DefaultTenant
}
