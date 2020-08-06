package config

import (
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2"
	"path/filepath"
)

// Config ...
type Config struct {
	Common struct {
		Version        string
		LogLevel       string
		StaticRootPath string `yaml:"static_root_path"`
		HomePath string `yaml:"home_path"`
	}

	Plugins struct {
		ExternalPluginsPath string `yaml:"plugins_path"`
	}
	Storage struct {
		Keyspace string
		Cluster  []string
		NumConns int
	}

	Web struct {
		Addr string
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

	if conf.Common.HomePath == "" {
		conf.Common.HomePath,_ = filepath.Abs(".")
		conf.Plugins.ExternalPluginsPath = makeAbsolute(conf.Plugins.ExternalPluginsPath,conf.Common.HomePath)
	}

	
	Data = conf
}

func makeAbsolute(path string, root string) string {
	if filepath.IsAbs(path) {
		return path
	}
	return filepath.Join(root, path)
}