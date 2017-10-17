package config

import (
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v1"
)

type Config struct {
	Common struct {
		Version  string
		IsDebug  bool `yaml:"debug"`
		LogPath  string
		LogLevel string
		Service  string
	}
	Broker struct {
		HttpHost          string
		TcpHost           string
		AdminHost         string
		ConnectionTimeout int
		MaxConnSperIp     int
	}
}

var Conf = &Config{}

func InitConfig() {
	data, err := ioutil.ReadFile("meq.yaml")
	if err != nil {
		log.Fatal("read config error :", err)
	}

	err = yaml.Unmarshal(data, &Conf)
	if err != nil {
		log.Fatal("yaml decode error :", err)
	}

	log.Printf("config of meq broker: %#v\n", Conf)
}
