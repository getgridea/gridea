import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import zhHans from 'vuetify/src/locale/zh-Hans'
import * as Dayjs from 'dayjs'
import App from './App.vue'
import router from './router'
import store from './store/index'
import VueBus from './vue-bus'

Vue.use(Vuetify, {
  lang: {
    locales: { zhHans },
    current: 'zhHans',
  },
  theme: {
    primary: '#006cff',
  },
})
Vue.use(VueBus)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.prototype.$dayjs = Dayjs

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  render(createElement: any) {
    return createElement(App)
  },
  // template: '<App/>'
} as any).$mount('#app')
