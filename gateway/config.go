package gateway

import (
	"io/ioutil"
	"log"
	"gopkg.in/yaml.v2"
)

type Config struct {
	Common struct {
		Version  string
		IsDebug  bool `yaml:"debug"`
		LogPath  string
		LogLevel string
	}
	GateWay struct {
		WebSocketHost     string
		TcpHost           string
		ConnectionTimeout int
		MaxConnSperIp     int
	}
}

var Conf = &Config{}

func init() {
	data, err := ioutil.ReadFile("conf.yml")
	if err != nil {
		log.Fatal("read config error :", err)
	}
	err = yaml.Unmarshal(data, &Conf)
	if err != nil {
		log.Fatal("yaml decode error :", err)
	}
	log.Println(Conf)
}
