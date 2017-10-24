package broker

import (
	"net/http"
	"time"

	"github.com/labstack/echo"
	"github.com/teamsaas/meq/common/security"
	"github.com/teamsaas/meq/config"
)

/* apis for broker admin: topic access、key gen etc */
type Admin struct{}

func NewAdmin() *Admin {
	return &Admin{}
}

func (ap *Admin) Start() {
	e := echo.New()

	e.POST("/admin/keygen", ap.keyGen)
	e.Logger.Fatal(e.Start(":" + config.Conf.Broker.AdminAddr))
}

type keyGenResponse struct {
	Status  int    `json:"status"`
	Key     string `json:"key"`
	Channel string `json:"channel"`
}

func (ap *Admin) keyGen(c echo.Context) error {
	mk := c.FormValue("master_key")
	channel := c.FormValue("channel")

	masterKey, err := broker.Cipher.DecryptKey([]byte(mk))
	if err != nil || !masterKey.IsMaster() || masterKey.IsExpired() {
		return c.String(http.StatusOK, ErrUnauthorized.Message)
	}

	// Attempt to fetch the contract using the key. Underneath, it's cached.
	contract, contractFound := broker.Contract.Get(masterKey.Contract())
	if !contractFound {
		return c.String(http.StatusOK, ErrNotFound.Message)
	}

	// Validate the contract
	if !contract.Validate(masterKey) {
		return c.String(http.StatusOK, ErrUnauthorized.Message)
	}

	// // Use the cipher to generate the key
	key, err := broker.Cipher.GenerateKey(masterKey, channel, keyAccess(), time.Unix(0, 0), -1)
	if err != nil {
		return c.String(http.StatusOK, ErrServerError.Message)
	}
	ok, e := broker.ChannelMap.Exist(channel)
	if e == nil && !ok {
		broker.ChannelMap.Store(channel, 0)
	}

	return c.JSON(http.StatusOK, &keyGenResponse{
		Status:  200,
		Key:     key,
		Channel: channel,
	})
}

func keyAccess() uint32 {
	return security.AllowDefault
}
