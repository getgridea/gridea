import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'
import 'font-awesome/css/font-awesome.css'
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
    primary: '#1067de',
  },
})

Vue.use(VueBus)
Vue.prototype.$dayjs = Dayjs

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App),
  mounted() {
    this.$router.push('/')
  },
}).$mount('#app')
