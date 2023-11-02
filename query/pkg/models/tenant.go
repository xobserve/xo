package models

import "github.com/gin-gonic/gin"

const DefaultTenant = "default"

func GetTenant(c *gin.Context) string {
	return DefaultTenant
}
