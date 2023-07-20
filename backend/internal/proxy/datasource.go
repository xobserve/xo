// Copyright 2023 Datav.io Team
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
package proxy

import (
	"bytes"
	"io"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"time"

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

	client := &http.Client{
		Transport: &http.Transport{
			DialContext: (&net.Dialer{
				Timeout:   time.Duration(time.Minute * 1),
				KeepAlive: time.Duration(time.Minute * 2),
			}).DialContext,
		},
	}

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
