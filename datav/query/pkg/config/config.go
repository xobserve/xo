// Copyright 2023 xobserve.io Team
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
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
		RepoUrl  string `yaml:"repo_url"`
	}
	Database struct {
		ConnectTo     string `yaml:"type"`
		Account       string
		AccountSecret string `yaml:"account_secret"`
		Host          string
		Port          int
		Database      string
	}

	User struct {
		SessionExpire     int64  `yaml:"session_expire"`
		EnableMultiLogin  bool   `yaml:"enable_multi_login"`
		EnableGithubLogin bool   `yaml:"enable_github_login"`
		GithubOAuthToken  string `yaml:"github_oauth_token"`
		GithubOAuthSecret string `yaml:"github_oauth_secret"`
		AllowAnonymous    bool   `yaml:"allow_anonymous"`
	}

	Server struct {
		ListeningAddr              string `yaml:"listening_addr"`
		OverrideApiServerAddrForUI string `yaml:"override_api_server_addr_for_ui"`
		UiStaticPath               string `yaml:"ui_static_path"`
	}

	Dashboard Dashboard

	Datasource struct {
		Prometheus   string `yaml:"prometheus_addr"`
		Jaeger       string `yaml:"jaeger_addr"`
		ExternalHttp string `yaml:"external_http_addr"`
	}

	SMTP struct {
		Addr         string `yaml:"addr"`
		FromAddress  string `yaml:"from_address"`
		FromName     string `yaml:"from_name"`
		AuthUsername string `yaml:"auth_username"`
		AuthPassword string `yaml:"auth_password"`
	}

	Panel struct {
		Echarts struct {
			EnableBaiduMap bool   `yaml:"enable_baidu_map"`
			BaiduMapAK     string `yaml:"baidu_map_ak"`
		}
	}

	Paths struct {
		SqliteData string `yaml:"data"`
		Logs       string `yaml:"logs"`
	}

	Sidemenu struct {
		ShowAlertIcon bool `yaml:"show_alert_icon"`
	}

	Task struct {
		CleanAnnotations   int  `yaml:"clean_annotations"`
		DeleteAfterDays    int  `yaml:"delete_after_days"`
		EnableUserDelete   bool `yaml:"enable_user_delete"`
		EnableTenantDelete bool `yaml:"enable_tenant_delete"`
		EnableTeamDelete   bool `yaml:"enable_team_delete"`
	}

	SelfMonitoring struct {
		OtlpExportor string `yaml:"otlp_exporter"`
		OtlpEndpoint string `yaml:"otlp_endpoint"`
	}
	Plugins struct {
		DisablePanels      []string `yaml:"disable_panels"`
		DisableDatasources []string `yaml:"disable_datasources"`
	}
	Observability Observability

	Tenant struct {
		EnableSyncUsers bool `yaml:"enable_sync_users"`
	}

	AccessToken struct {
		Length int `yaml:"length"`
	}

	Provisioning struct {
		Enable bool   `yaml:"enable"`
		Path   string `yaml:"path"`
	}
}

type Observability struct {
	Enable bool `yaml:"enable" json:"enable"`
}

type Dashboard struct {
	EnableDelete      bool `yaml:"enable_delete" json:"enableDelete"`
	ShowSidemenuItems bool `yaml:"show_sidemenu_items" json:"showSidemenuItems"`
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
