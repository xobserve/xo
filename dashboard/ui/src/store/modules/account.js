/* eslint-disable */
import { getToken, setToken, removeToken } from '@/utils/auth'
import request from '@/utils/request'
import Cookies from 'js-cookie'
const user = {
  state: {
    id: Cookies.get('apm-userid') || '',
    name: Cookies.get('apm-name') || '',
    avatar: Cookies.get('apm-avatar') || '',
    priv: Cookies.get('apm-priv') || 'normal',
    token: getToken()
  },

  mutations: {
    SET_USERID: (state,userID) => {
      Cookies.set('apm-userid', userID)
      state.id = userID
    },
    SET_NAME: (state, name) => {
      Cookies.set('apm-name', name)
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      Cookies.set('apm-avatar', avatar)
      state.avatar = avatar
    },
    SET_PRIV: (state, priv) => {
      Cookies.set('apm-priv', priv)
      state.priv = priv
    },
    SET_TOKEN: (state, token) => {
      state.token = token
      setToken(token)
    }
  },

  actions: {
    setToken({ commit }, token) {
        commit('SET_TOKEN', token)
    },
    // SSO登陆成功，保存信息
    SetUserInfo({ commit,state},userInfo) {
      return new Promise(resolve => {
        setToken(userInfo.ssoToken)
        commit('SET_TOKEN', userInfo.ssoToken)
        commit('SET_PRIV', userInfo.priv)
        commit('SET_USERID', userInfo.id)
        commit('SET_NAME', userInfo.name)
        commit('SET_AVATAR', userInfo.avatar)
        resolve()
      })
    },
    // 登出
    Logout({ commit, state }) {
      return request({
        url: '/dashboard/logout',
        method: 'post',
        params:{
        }
      }).then(res => {   
        commit('SET_TOKEN', '')
        commit('SET_PRIV', 'normal')
        removeToken()
         // 记录现在的路径，登录后恢复
        Cookies.set("lastPath", window.location.pathname+window.location.search)
      })
    }   
  }
}

export default user
