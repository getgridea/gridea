import Vue from 'vue'
import Vuex from 'vuex'

import setting from './modules/setting'
import tags from './modules/tags'
import website from './modules/website'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    setting,
    tags,
    website,
  },
  strict: process.env.NODE_ENV !== 'production',
})
