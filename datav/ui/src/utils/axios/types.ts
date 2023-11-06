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
import type {
    AxiosInterceptorManager,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig,
  } from 'axios'
  
  export interface APIResponse<T = any> {
    status: 'success' | 'failed' | 'failure' | 'pending'
    data: T
  }
  
  type AxiosInterceptor<T, U extends 'OnFulfilled' | 'OnRejected'> = {
    OnFulfilled: Parameters<AxiosInterceptorManager<T>['use']>[0]
    OnRejected: Parameters<AxiosInterceptorManager<T>['use']>[1]
  }[U]
  
  export type ResOnFulfilledInterceptor = AxiosInterceptor<
    AxiosResponse,
    'OnFulfilled'
  >
  export type ResOnRejectedInterceptor = AxiosInterceptor<
    AxiosResponse,
    'OnRejected'
  >
  export type ReqOnFulfilledInterceptor = AxiosInterceptor<
    InternalAxiosRequestConfig,
    'OnFulfilled'
  >
  export type ReqOnRejectedInterceptor = AxiosInterceptor<
  InternalAxiosRequestConfig,
    'OnRejected'
  >
  
  export type ApiError = {
    status?: number
    statusText?: string
    message?: string
    data?: any
  }
  