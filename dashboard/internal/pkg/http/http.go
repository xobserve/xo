package http

import (
	"time"

	"github.com/valyala/fasthttp"
)

// Resp is the structure for http response
type Resp struct {
	ErrCode int `json:"err_code"`

	Message string `json:"message"`

	Data interface{} `json:"data"`
}

// Cli is the http client
var Cli = &fasthttp.Client{
	MaxConnsPerHost:     500,
	MaxIdleConnDuration: 60 * time.Second,
}
