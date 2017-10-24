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
		HttpAddr          string `yaml:"http_addr"`
		TcpAddr           string `yaml:"tcp_addr"`
		AdminAddr         string `yaml:"admin_addr"`
		ConnectionTimeout int    `yaml:"connection_timeout"`
		MaxConnSperIp     int    `yaml:"max_conns_per_ip"`

		License string
		Cluster struct {
			NodeName      string `yaml:"node_name"`
			ListenAddr    string `yaml:"listen_addr"`
			AdvertiseAddr string `yaml:"advertise_addr"`
			SeedAddr      string `yaml:"seed_addr"`
			Passphrase    string `yaml:"passphrase"`
		}
		Mysql struct {
			Addr     string
			Port     int
			Acc      string
			Pw       string
			Database string
		}
	}
}

var Conf = &Config{}

func InitConfig(conf string) {
	var data []byte
	var err error
	if conf == "" {
		data, err = ioutil.ReadFile("meq.conf")
	} else {
		data, err = ioutil.ReadFile(conf)
	}

	if err != nil {
		log.Fatal("read config error :", err)
	}

	err = yaml.Unmarshal(data, &Conf)
	if err != nil {
		log.Fatal("yaml decode error :", err)
	}

	log.Printf("config of meq broker: %#v\n", Conf)
}
