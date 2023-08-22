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
import { isDev  } from './utils'


type APIS = {
  target: string
  allowOrigin: string
}

//@ts-ignore
const env = import.meta.env
// api地址结尾不要带'/' ,2
const apis = ({
  development: {
    target: env.VITE_API_SERVER_DEV,
    allowOrigin: '*',
  },
  production: {
    target: env.VITE_API_SERVER_PROD,
    allowOrigin: '*',
  },
  testing: {
    target: 'xxx.xxx.xxx',
    allowOrigin: '*',
  },
} as Record<string, APIS>)[process.env.NODE_ENV]

export const ApiConfig = {
  /**
   * 启用调试
   */
  log: isDev,
  /**
   * 跨域
   */
  changeOrigin: true,
  /**
   * node代理。next规定为/api
   */
  proxyApi: '/api',
  /**
   * origin侧是否为^/api代理.用来连接自己线上的代理
   */
  useProxyOrigin: /xxx\.xxx\.xxx/.test(apis.target),
  /**
   * 接口超时时间
   */
  timeout: 1000 * 60,
  // cdn
  static: 'cdn.xxx.com',

  /**
   * 启用接口加密
   */
  enablePtbk: false,

  ...apis,
} as const
