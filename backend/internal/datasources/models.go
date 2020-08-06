package datasources

import (
	"strings"

	"time"

	"github.com/apm-ai/datav/backend/pkg/utils/simplejson"
)

type DataSource struct {
	Id      int64  `json:"id"`
	Uid     string `json:"uid"`
	Version int    `json:"version"`

	Name        string `json:"name"`
	Type        string `json:"type"`
	TypeLogoUrl string `json:"typeLogoUrl"`
	Url         string `json:"url"`

	IsDefault bool `json:"isDefault"`

	User              string `json:"user"`
	Password          string `json:"password"`
	Database          string `json:"database"`
	BasicAuth         bool   `json:"basicAuth"`
	BasicAuthUser     string `json:"basicAuthUser"`
	BasicAuthPassword string `json:"basicAuthPassword"`
	WithCredentials   bool   `json:"withCredentials"`

	JsonData         *simplejson.Json `json:"jsonData,omitempty"`
	SecureJsonData   *simplejson.Json `json:"secureJsonData,omitempty"`
	SecureJsonFields map[string]bool  `json:"secureJsonFields"`

	ReadOnly bool `json:"readOnly"`

	Created time.Time `json:"created"`
	Updated time.Time `json:"updated"`
}

type DataSourceList []DataSource

func (slice DataSourceList) Len() int {
	return len(slice)
}

func (slice DataSourceList) Less(i, j int) bool {
	return strings.ToLower(slice[i].Name) < strings.ToLower(slice[j].Name)
}

func (slice DataSourceList) Swap(i, j int) {
	slice[i], slice[j] = slice[j], slice[i]
}
