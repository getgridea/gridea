import Vue from 'vue'
import Vuex from 'vuex'
import site from './modules/site'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    site,
  },
  strict: process.env.NODE_ENV !== 'production',
})
