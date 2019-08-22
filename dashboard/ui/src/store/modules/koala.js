/* eslint-disable */
import Cookies from 'js-cookie'
const apm = {
  state: {
    appid:  Cookies.get('apm-appid') || '',
    appName:  Cookies.get('apm-appName') || '', // 当前选择的APP name
    selDate: Cookies.get('sel-date'), // APM内的日历
    dateList: Cookies.get('date-list'),// APM内的日历列表,
    realTime: Cookies.get('real-time') || 0,// 日历实时设置,
    refresh: Cookies.get('refresh') || 0,// 日历实时刷新,
  },

  mutations: {
    SET_APPID: (state, appid) => {
      state.appid = appid
      Cookies.set('apm-appid', appid)
    },
    SET_APPName: (state, name) => {
        state.appName = name
        Cookies.set('apm-appName', name)
      },
    SET_SEL_DATE: (state, date) => {
      state.selDate = date
      Cookies.set('sel-date', date)
    },
    SET_DATE_LIST: (state, date) => {
      state.dateList = date
      Cookies.set('date-list', date)
    },
    REMOVE_DATE_LIST: (state, date) => {
      state.dateList = undefined
      Cookies.remove('date-list')
    },

    SET_REAL_TIME: (state, val) => {
      state.realTime = val
      Cookies.set('real-time', val)
    },
    SET_REFRESH: (state, val) => {
      state.refresh = val
      Cookies.set('refresh', val)
    },
  },

  actions: {
    setAPPID({ commit }, appid) {
        commit('SET_APPID', appid)
    },
    setAPPName({ commit }, name) {
        commit('SET_APPName', name)
    },
    setSelDate({ commit }, date) {
      commit('SET_SEL_DATE', date)
    } ,
    setDateList({ commit }, date) {
      commit('SET_DATE_LIST', date)
    } ,
    removeDateList({ commit }, date) {
      commit('REMOVE_DATE_LIST', date)
    } ,
    setRealTime({ commit }, val) {
      commit('SET_REAL_TIME', val)
    } ,
    setRefresh({ commit }, val) {
      commit('SET_REFRESH', val)
    } ,
  }
}

export default apm