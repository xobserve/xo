package datasources

import (
	"strconv"

	"github.com/opendatav/datav/backend/pkg/i18n"
	"github.com/opendatav/datav/backend/pkg/models"

	// "time"
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"

	"github.com/opendatav/datav/backend/pkg/common"

	"github.com/gin-gonic/gin"
)

func Proxy(c *gin.Context) {
	dsID, _ := strconv.ParseInt(c.Param("datasourceID"), 10, 64)
	// find datasource store url
	ds, err := models.QueryDataSource(dsID, "")
	if err != nil {
		logger.Warn("query datasource error", "error", err)
		c.JSON(500, common.ResponseI18nError("error.loadDatasourceError"))
		return
	}

	targetURL := c.Param("target")

	client := &http.Client{}

	var params = url.Values{}

	for k, v := range c.Request.URL.Query() {
		params.Add(k, v[0])
	}

	var url1 = ds.Url + targetURL + "?" + params.Encode()

	// read request json body and write to new request body
	jsonData, _ := c.GetRawData()
	reqBody := bytes.NewBuffer(jsonData)

	outReq, err := http.NewRequest(c.Request.Method, url1, reqBody)
	if err != nil {
		fmt.Println(err)
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
		c.JSON(502, common.ResponseErrorMessage(nil, i18n.OFF, err.Error()))
		return
	}

	buffer := bytes.NewBuffer(nil)
	io.Copy(buffer, res.Body)
	c.String(res.StatusCode, buffer.String())
}
