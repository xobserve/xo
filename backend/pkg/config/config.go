package config

import (
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2"
)

// Config ...
type Config struct {
	Common struct {
		Version  string
		LogLevel string `yaml:"log_level"`
		IsProd   bool   `yaml:"is_prod"`
		AppName  string `yaml:"app_name"`
	}

	User struct {
		SessionExpire int64 `yaml:"session_expire"`
	}

	Server struct {
		Addr    string
		BaseUrl string `yaml:"base_url"`
	}

	SMTP struct {
		Addr         string `yaml:"addr"`
		FromAddress  string `yaml:"from_address"`
		FromName     string `yaml:"from_name"`
		AuthUsername string `yaml:"auth_username"`
		AuthPassword string `yaml:"auth_password"`
	}
}

// Data ...
var Data *Config

// Init ...
func Init(path string) {
	conf := &Config{}
	data, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("read config error :", err)
	}

	err = yaml.Unmarshal(data, &conf)
	if err != nil {
		log.Fatal("yaml decode error :", err)
	}

	Data = conf
}
