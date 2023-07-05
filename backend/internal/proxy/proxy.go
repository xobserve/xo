package proxy

import (

	// "time"

	"bytes"
	"io"
	"net/http"
	"net/url"

	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/MyStarship/starship/backend/pkg/log"
	"github.com/gin-gonic/gin"
)

var logger = log.RootLogger.New("logger", "datasource")

func Proxy(c *gin.Context) {
	targetURL := c.Query("proxy_url")

	client := &http.Client{}

	var params = url.Values{}

	for k, v := range c.Request.URL.Query() {
		params.Add(k, v[0])
	}

	var url1 = targetURL + "?" + params.Encode()

	// read request json body and write to new request body
	jsonData, _ := c.GetRawData()
	reqBody := bytes.NewBuffer(jsonData)

	outReq, err := http.NewRequest(c.Request.Method, url1, reqBody)
	if err != nil {
		logger.Warn("build datasource proxy req error", "url", url1, "error", err.Error())
		c.JSON(502, common.RespError(err.Error()))
		return
	}

	// step 3
	for key, value := range c.Request.Header {
		for _, v := range value {
			// 这个暂时不能加，会乱码，后面看看怎么解决
			if key == "Accept-Encoding" {
				continue
			}
			outReq.Header.Add(key, v)
		}
	}

	res, err := client.Do(outReq)
	if err != nil {
		logger.Warn("request to datasource error", "url", url1, "error", err.Error())
		c.JSON(502, common.RespError(err.Error()))
		return
	}

	buffer := bytes.NewBuffer(nil)
	io.Copy(buffer, res.Body)
	c.String(res.StatusCode, buffer.String())
}
