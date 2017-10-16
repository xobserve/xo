package broker

import (
	"net/http"
	"github.com/teamsaas/meq/common/logging"
	"github.com/teamsaas/meq/broker/config"
	"go.uber.org/zap"
)

type HttpProvider struct {
}

func (hp *HttpProvider) Start() {
	//websocket
	http.HandleFunc("/", webSocketFunc)

	// http mqtt or http json
	http.HandleFunc("/Connect", connectFunc)

	logging.Logger.Info("webSocket and Http provider startted", zap.String("addr", config.Conf.Broker.HttpHost))

	err := http.ListenAndServe(config.Conf.Broker.HttpHost, nil)
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
