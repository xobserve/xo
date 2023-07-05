package proxy

import (
	"bytes"
	"io"
	"net/http"
	"net/url"
	"strconv"

	"github.com/MyStarship/starship/backend/internal/datasource"
	"github.com/MyStarship/starship/backend/pkg/common"
	"github.com/gin-gonic/gin"
)

func ProxyDatasource(c *gin.Context) {
	dsID, _ := strconv.ParseInt(c.Param("id"), 10, 64)
	// find datasource store url
	ds, err := datasource.GetDatasource(dsID)
	if err != nil {
		logger.Warn("query datasource error", "error", err)
		c.JSON(500, common.RespError(err.Error()))
		return
	}

	targetURL := c.Param("path")

	client := &http.Client{}

	var params = url.Values{}

	for k, v := range c.Request.URL.Query() {
		params.Add(k, v[0])
	}

	var url1 = ds.URL + targetURL + "?" + params.Encode()

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
