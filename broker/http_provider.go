package broker

import (
	"net/http"

	"github.com/teamsaas/meq/broker/config"
	"github.com/teamsaas/meq/common/logging"
	"go.uber.org/zap"
)

type HttpProvider struct {
}

func (hp *HttpProvider) Start() {
	//websocket
	http.HandleFunc("/", webSocketFunc)

	// http mqtt or http json
	http.HandleFunc("/Connect", connectFunc)

	logging.Logger.Info("webSocket and Http provider startted", zap.String("addr", config.Conf.Broker.HttpAddr))

	err := http.ListenAndServe(config.Conf.Broker.HttpAddr, nil)
	if err != nil {
		logging.Logger.Fatal("webSocket and Http ListenAndServe error ", zap.Error(err))
	}
}

func (hp *HttpProvider) Close() {

}

func connectFunc(w http.ResponseWriter, r *http.Request) {
	c := []byte("hello world")
	w.Write(c)
}
