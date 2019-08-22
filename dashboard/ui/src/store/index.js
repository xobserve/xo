import Vue from 'vue'
import Vuex from 'vuex'
import misc from './modules/misc'
import user from './modules/account'
import apm from './modules/koala'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    misc,
    user,
    apm
  },
  getters
})

export default store
 