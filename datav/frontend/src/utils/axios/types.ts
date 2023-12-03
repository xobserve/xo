// Copyright 2023 xObserve.io Team

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
