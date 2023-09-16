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

export const isUndefined = (val: any): val is undefined =>
  typeof val === 'undefined'

export const isNull = (val: any): val is null => val === null

/**
 * 值不存在
 */
export const isNullOrUndefined = (val: any) => isNull(val) || isUndefined(val)

/**
 * 值存在
 */
export const isNotNullOrUndefined = (val: any) => !isNullOrUndefined(val)

export const isBrowser = () => typeof window !== 'undefined'

export const isMobAgent = (userAgent: string) =>
  /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
    userAgent
  ) || userAgent.toLowerCase().indexOf('micromessenger') !== -1

export const isJSON = (str: string) => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  } else {
    return false
  }
}

export const toJSON = (str: string) => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return obj
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  } else {
    return null
  }
}

export const toPrettyJSON = (str: string) => {
  if (typeof str == 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return JSON.stringify(obj, null, 2)
      } else {
        return str
      }
    } catch (e) {
      return str
    }
  } else {
    return str
  }
}

export const compareId = (a: string | number, b: string | number) => a == b
