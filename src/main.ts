import Vue from 'vue'
import Vuetify from 'vuetify'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'vuetify/dist/vuetify.css'
import 'font-awesome/css/font-awesome.css'
import zhHans from 'vuetify/src/locale/zh-Hans'
import * as Dayjs from 'dayjs'
import VuetifyDialog from 'vuetify-dialog'
import VueI18n from 'vue-i18n'
import locale from './assets/locales'
import App from './App.vue'
import router from './router'
import store from './store/index'
import VueBus from './vue-bus'

Vue.use(VueI18n)
const i18n = new VueI18n({
  locale: localStorage.getItem('language') || 'zhHans',
  messages: locale as any,
  silentTranslationWarn: true,
})

console.log('messages', locale)
Vue.use(Vuetify, {
  lang: {
    t: (key: string, ...params: any[]) => i18n.t(key, params),
  },
  theme: {
    primary: '#1067de',
    accent: '#1067de',
  },
})

Vue.use(VuetifyDialog)

Vue.use(VueBus)
Vue.prototype.$dayjs = Dayjs

Vue.config.productionTip = false

new Vue({
  router,
  store,
  i18n,
  render: (h) => h(App),
  mounted() {
    this.$router.push('/')
  },
}).$mount('#app')
