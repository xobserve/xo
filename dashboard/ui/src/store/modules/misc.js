import Cookies from 'js-cookie'

const misc = {
  state: {
    service: Cookies.get('sel-service') || 'empty',
    theme: Cookies.get('tc-theme') || 'light',
    lang: Cookies.get('tc-lang') || 'en',
  },
  mutations: {
    SET_SERVICE: (state, service) => {
      state.service = service
      Cookies.set('sel-service', service)
    },
    SET_THEME: (state, theme) => {
      state.theme = theme
      Cookies.set('tc-theme', theme)
    },
    SET_LANG: (state, lang) => {
      state.lang = lang
      Cookies.set('tc-lang', lang)
    }
  },
  actions: {
    setService({ commit }, service) {
      commit('SET_SERVICE', service)
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme)
    },
    setLang({ commit }, val) {
      commit('SET_LANG', val)
    }
  }
}

export default misc
