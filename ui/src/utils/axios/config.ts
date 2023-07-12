import getConfig from 'next/config'
// import { isDev  } from './utils'
// const { publicRuntimeConfig } = getConfig()

type APIS = {
  target: string
  allowOrigin: string
}

// api地址结尾不要带'/' ,2
const apis = ({
  development: {
    target: 'http://localhost:10086',
    allowOrigin: '*',
  },
  production: {
    target: 'https://api.codecc.com',
    allowOrigin: '*',
  },
  testing: {
    target: 'xxx.xxx.xxx',
    allowOrigin: '*',
  },
} as Record<string, APIS>)['development']

export const ApiConfig = {
  /**
   * 启用调试
   */
  log: true,
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
