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

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

import { getHost, getNavigateTo } from '../url'
import { ApiConfig } from './config'
import {
  autoWithClientToken,
  calcRequestTimeEnd,
  calcRequestTimeStart,
  handleError,
  printResUrlTime,
  reThrowError,
  rewriteApiUrl,
} from './interceptors'

// const JSONbigString = require('json-bigint')({ storeAsString: true })
import type { OutgoingHttpHeaders } from 'http'

import { createStandaloneToast } from '@chakra-ui/react'
import storage from 'utils/localStorage'
import { isEmpty } from 'lodash'

const { toast } = createStandaloneToast()

// this will transform the startTime field(number) in span data of jaeger trace to a string
// axios.defaults.transformResponse = [
//   text => {
//     return JSONbigString.parse(text)
//   },
// ]

/**
 * 用于客户端请求(Ajax)使用的axios实例
 * > 请求proxy
 */
const requestApiConfig: AxiosRequestConfig = {
  baseURL: ApiConfig.target + ApiConfig.proxyApi,
  timeout: ApiConfig.timeout,
  //   withCredentials: true,
}

const requestApi: AxiosInstance = axios.create(requestApiConfig)

// 自动携带token
requestApi.interceptors.request.use(autoWithClientToken)
// // 开始计算请求时间
// requestApi.interceptors.request.use(calcRequestTimeStart)

// // 结束计算请求时间
// requestApi.interceptors.response.use(calcRequestTimeEnd)

// // 打印请求url
// requestApi.interceptors.response.use(printResUrlTime)

// // 打印返回值信息
// requestApi.interceptors.response.use(printResData)

// 对返回信息进行处理
requestApi.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // error.response {
    //    config :{url: '/datasource/all', method: 'get', headers: {…}, baseURL: 'http://localhost:10086/api', transformRequest: Array(1), …}
    //    data: {status: 'success', data: Array(4), version: 'xobserve'}
    //    status: 400
    //    statusText: "Bad Request"
    // }
    const isSystemError = isEmpty(error.response)
    if (!isSystemError) {
      const message = JSON.stringify(error.response.data)
      const status = error.response.status

      // check if it's proxy request error
      if (error.response.data.version != 'xobserve') {
        // request route to other servers, not our xobserve api-server
        // so it's proxy request error
        // DONT'T throw error, just return error.response.data, we need to handle it in the caller
        return error.response.data
      }

      // request to our api server
      if (status == 401) {
        // session expires
        const id = 'You need to signin, redirect to login page..'
        if (!toast.isActive(id)) {
          toast({
            id: id,
            title: id,
            status: 'error',
            duration: 4000,
            isClosable: true,
          })
        }
        setTimeout(() => {
          const oldPath = location.href
          storage.set('current-page', oldPath)
          location.href = getNavigateTo('/login')
        }, 2000)
      } else {
        // normal backend error
        const id = message
        if (!toast.isActive(id)) {
          toast({
            id: id,
            // title: `请求错误`,
            description: JSON.parse(message).message,
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
        throw message
      }
    } else {
      // network error or proxy down error
      // when in these cases, the error.response is null
      // we need to check this error is network error or proxy down error

      let title
      if (error.name == 'Error') {
        // network error
        title = 'Request to backend failed'
      } else {
        title = 'Request to datasource server failed'
      }

      const message = error.text ?? error.message
      const id = message
      if (!toast.isActive(id)) {
        toast({
          id: id,
          title: title,
          description: message,
          status: 'error',
          duration: 8000,
          isClosable: true,
        })
      }
      throw message
    }

    // return error.response
  },
)
// 抛出被服务端吞掉的错误
requestApi.interceptors.response.use(reThrowError)

/**
 * 工厂函数
 * 用于服务端请求使用的axios实例
 * 代理服务端无状态,所以使用函数式,保证每个请求都是新的实例
 */
const createRequestRoot = (headers?: OutgoingHttpHeaders) => {
  let baseURL = ApiConfig.target
  if (ApiConfig.changeOrigin) {
    headers.host = getHost(ApiConfig.target)
    if (ApiConfig.useProxyOrigin) {
      baseURL += ApiConfig.proxyApi
    }
  }
  const requestRoot = axios.create({
    baseURL,
    timeout: ApiConfig.timeout,
    headers,
  })

  // 转发到target前，去除^/api前缀
  requestRoot.interceptors.request.use(rewriteApiUrl)
  // 开始计算请求时间
  requestRoot.interceptors.request.use(calcRequestTimeStart)

  // 结束计算请求时间
  requestRoot.interceptors.response.use(calcRequestTimeEnd)

  // 打印请求url， 捕获异常
  requestRoot.interceptors.response.use(printResUrlTime, handleError)

  return requestRoot
}

const createPureRequest = (config?: AxiosRequestConfig) => {
  const request = axios.create(config)

  request.interceptors.request.use(calcRequestTimeStart)
  request.interceptors.request.use(rewriteApiUrl)

  request.interceptors.response.use(calcRequestTimeEnd)
  request.interceptors.response.use(printResUrlTime, handleError)

  return request
}

export { requestApi, createRequestRoot, createPureRequest }
