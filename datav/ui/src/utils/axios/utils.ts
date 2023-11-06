// Copyright 2023 xObserve.io Team
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
import { ApiConfig } from './config'



export const rewriteUrl = (
  url: string,
  prefix: string = ApiConfig.proxyApi
) => {
  return url.replace(new RegExp(`^${prefix}`), '')
}


export const isDev = () => process.env.NODE_ENV === 'development'
export const isTest = () => process.env.NODE_ENV === 'testing'
export const isProd = () => process.env.NODE_ENV === 'production'

const META_KEY = '__$$metadata'
export const getMetadata = (resOrReq: any, key: string) => {
  let metadata = {}
  if (typeof resOrReq === 'object') {
    if ('config' in resOrReq) {
      metadata = resOrReq?.config?.[META_KEY]
    } else {
      metadata = resOrReq?.[META_KEY]
    }
    return metadata?.[key]
  }
}

export const setMetadata = (resOrReq: any, key: string, value: any) => {
  let metadata = {}
  if (typeof resOrReq === 'object') {
    if ('config' in resOrReq) {
      metadata = resOrReq?.config?.[META_KEY] ?? {}
    } else {
      metadata = resOrReq?.[META_KEY] ?? {}
    }
    metadata[key] = value
    resOrReq[META_KEY] = metadata
  }
}

/**
 * cors
 */
export const getOrigin = () => ApiConfig.allowOrigin
