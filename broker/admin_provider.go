package broker

import (
	"github.com/labstack/echo"
	"github.com/teamsaas/meq/broker/config"
)

/* apis for broker admin: topic access、key gen etc */
type AdminProvider struct{}

func NewAdminProvider() *AdminProvider {
	return &AdminProvider{}
}

func (ap *AdminProvider) Start() {
	e := echo.New()

	e.POST("/admin/api/keygen", ap.keyGen)
	e.Logger.Fatal(e.Start(":" + config.Conf.Broker.AdminHost))
}

func (ap *AdminProvider) keyGen(c echo.Context) error {
	return nil
}
