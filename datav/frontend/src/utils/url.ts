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

import { extend } from 'lodash'
import queryString from 'query-string'
import { isEmpty } from './validate'
import { URL_ROOT_PATH } from 'src/data/configs/config'
import { gnavigate } from 'layouts/PageContainer'
import { NavigateFunction } from 'react-router-dom'

export const getHost = (url: string) => {
  const urlMatched = url.match(/https?:\/\/([^/]+)\//i)
  let domain = ''
  if (url && urlMatched && urlMatched[1]) {
    domain = urlMatched[1]
  }
  return domain
}
export const clearApiVersion = (api: string) => api && api.replace(/\/v\d$/, '')

export const addParamToUrl = (param: any, isReplace = false) => {
  const currentQuery = getUrlParams()
  extend(currentQuery, param)

  for (const k of Object.keys(currentQuery)) {
    if (isEmpty(currentQuery[k])) {
      delete currentQuery[k]
    }
  }

  const params = queryString.stringify(currentQuery)
  updateUrl(params, isReplace)
}

export const setParamToUrl = (params) => {
  updateUrl(queryString.stringify(params))
}

export const removeParamFromUrl = (paramKeys: string[]) => {
  const currentQuery = getUrlParams()
  paramKeys.forEach((key) => delete currentQuery[key])

  const params = queryString.stringify(currentQuery)

  updateUrl(params)
}

export const getUrlParams = (): any => {
  return queryString.parseUrl(window?.location.href).query
}

export const updateUrl = (params: string, isReplace = false) => {
  let url = window.location.origin + window.location.pathname
  if (params != '') {
    url = url + '?' + params
  }

  // router.replace(url,url)
  isReplace
    ? window.history.replaceState({}, null, url)
    : window.history.pushState({}, null, url)
}

export const navigateTo = (url, navigate?: NavigateFunction) => {
  const nav: NavigateFunction = navigate ?? gnavigate
  nav(URL_ROOT_PATH + url)
}

export const getNavigateTo = (url) => {
  if (url.startsWith('/')) {
    return URL_ROOT_PATH + url
  }
  return URL_ROOT_PATH + '/' + url
}
