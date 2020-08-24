package plugins

import "github.com/datadefeat/datav/backend/pkg/models"

type PluginRoute struct {
	Path         string                `json:"path"`
	Method       string                `json:"method"`
	ReqRole      models.RoleType       `json:"reqRole"`
	URL          string                `json:"url"`
	URLParams    []PluginRouteURLParam `json:"urlParams"`
	Headers      []PluginRouteHeader   `json:"headers"`
	TokenAuth    *JwtTokenAuth         `json:"tokenAuth"`
	JwtTokenAuth *JwtTokenAuth         `json:"jwtTokenAuth"`
}

// PluginRouteURLParam describes query string parameters for
// a url in a plugin route
type PluginRouteURLParam struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

// PluginRouteHeader describes an HTTP header that is forwarded with
// the proxied request for a plugin route
type PluginRouteHeader struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

// JwtTokenAuth struct is both for normal Token Auth and JWT Token Auth with
// an uploaded JWT file.
type JwtTokenAuth struct {
	Url    string            `json:"url"`
	Scopes []string          `json:"scopes"`
	Params map[string]string `json:"params"`
}
