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
import { AxiosError } from 'axios'

import { ApiError } from './types'
import { KEYS } from './constants'

export const createError = (error: any) => {
  const axiosError: AxiosError = error
  const axiosResponse = axiosError?.response
  if (axiosResponse) {
    const { status, statusText = '', data } = axiosResponse
    const apiError: ApiError = { status, statusText, data }
    return apiError
  } else {
    const { code: statusText = '', message: data } = axiosError
    const apiError: ApiError = { statusText, data }
    return apiError
  }
}

export const createWrapperError = (error: any = {}) => ({
  [KEYS.error]: error,
})

export const isObject = (data: any) => typeof data === 'object'

export const TestError = (data: any) =>
  data && isObject(data) && KEYS.error in data

export const unWrapError = (error: any) => error && error[KEYS.error]
