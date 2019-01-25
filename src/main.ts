import Vue from 'vue'
import 'font-awesome/css/font-awesome.css'
import * as Dayjs from 'dayjs'
import moment from 'moment'
import Antd from 'ant-design-vue'
import '@/assets/styles/main.less'
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

Vue.use(Antd)
Vue.use(VueBus)
Vue.prototype.$dayjs = Dayjs
Vue.prototype.$moment = moment

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
