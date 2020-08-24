package alerting

import (
	"fmt"
	"github.com/datadefeat/datav/backend/pkg/models"
	"github.com/gin-gonic/gin"
)

func AddNotification(c *gin.Context) {
	notification  := &models.AlertNotification{}
	c.Bind(&notification)

	fmt.Println(notification)
}