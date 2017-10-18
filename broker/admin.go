package broker

import (
	"github.com/labstack/echo"
	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/security"
)

/* apis for broker admin: topic access、key gen etc */
type Admin struct{}

func NewAdmin() *Admin {
	return &Admin{}
}

func (ap *Admin) Start() {
	e := echo.New()

	e.POST("/admin/api/keygen", ap.keyGen)
	e.Logger.Fatal(e.Start(":" + config.Conf.Broker.AdminHost))
}

func (ap *Admin) keyGen(c echo.Context) error {
	// mk := c.FormValue("master_key")
	// channel := c.FormValue("channel")

	// masterKey, err := c.service.Cipher.DecryptKey([]byte(mk))
	// if err != nil || !masterKey.IsMaster() || masterKey.IsExpired() {
	// 	return ErrUnauthorized, false
	// }

	// // Attempt to fetch the contract using the key. Underneath, it's cached.
	// contract, contractFound := c.service.contracts.Get(masterKey.Contract())
	// if !contractFound {
	// 	return ErrNotFound, false
	// }

	// // Validate the contract
	// if !contract.Validate(masterKey) {
	// 	return ErrUnauthorized, false
	// }

	// // Use the cipher to generate the key
	// key, err := c.service.Cipher.GenerateKey(masterKey, message.Channel, message.access(), message.expires(), -1)
	// if err != nil {
	// 	return ErrServerError, false
	// }

	return nil
}

func keyAccess() uint32 {
	return security.AllowDefault
}
