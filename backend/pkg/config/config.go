package config

import (
	"io/ioutil"
	"log"

	"path/filepath"

	"gopkg.in/yaml.v2"
)

// Config ...
type Config struct {
	Common struct {
		Version        string
		LogLevel       string
		StaticRootPath string `yaml:"static_root_path"`
		HomePath       string `yaml:"home_path"`
		UIRootURL      string `yaml:"ui_root_url"`
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

	SMTP struct {
		Enabled     bool
		Host        string
		User        string
		Password    string
		CertFile    string `yaml:"cert_file"`
		KeyFile     string `yaml:"key_file"`
		skipVerify  bool   `yaml:"skip_verify"`
		FromAddress string `yaml:"from_address"`
		FromName    string `yaml:"from_name"`
	}

	Security struct {
		SecretKey string `yaml:"secret_key"`
	}

	Alerting struct {
		Enabled             bool
		ExecuteAlerts       bool  `yaml:"execute_alerts"`
		EvaluationTimeout   int   `yaml:"evaluation_timeout_seconds"`
		NotificationTimeout int   `yaml:"notification_timeout_seconds"`
		MaxAttempts         int   `yaml:"max_attempts"`
		MinInterval         int64 `yaml:"min_interval_seconds"`
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
		conf.Common.HomePath, _ = filepath.Abs(".")
		conf.Plugins.ExternalPluginsPath = makeAbsolute(conf.Plugins.ExternalPluginsPath, conf.Common.HomePath)
	}

	Data = conf
}

func makeAbsolute(path string, root string) string {
	if filepath.IsAbs(path) {
		return path
	}
	return filepath.Join(root, path)
}
