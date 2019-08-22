/* eslint-disable */
// 该模块用来请求API网关
import axios from 'axios'
import { Message } from 'iview'
import { getToken } from '@/utils/auth'
import Cookies from 'js-cookie'


// create an axios instance
const service = axios.create({
  baseURL: process.env.DASHBOARD_ADDR, // api的base_url
  timeout: 30000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // 设置token
    config.headers['koala-token'] = getToken()
    return config
  }, 
  error => {
    // Do something with request error
    Promise.reject(error)
})

// respone interceptor
service.interceptors.response.use(
  response => {
    return response
  },
  error => {
    var response = error.response
    // 1002 = re-login
    if (response.data.err_code == 1002) {
      Message.error({
        content: response.data.message,
        duration: 3
      })
      
      Cookies.set("lastPath", window.location.pathname+window.location.search)

      setTimeout(function() {
        window.location.href = "/ui/login"
      },600)
      return response
    }

    if (response.data.err_code != 0) {
      Message.error({
        content: response.data.message+' : '+ response.data.err_code,
        duration: 3 
      })
      return Promise.reject(response.data.message+' : '+ response.data.err_code)
    }

    Message.error({
      content: error.message,
      duration: 3
    })
    return Promise.reject(error)
  })

export default service
