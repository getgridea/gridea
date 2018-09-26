import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.css'

import App from './App.vue'
import router from './router'
// import store from './store'

Vue.use(Vuetify)
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  // store,
  render(createElement: any) {
    return createElement(App)
  },
  // template: '<App/>'
} as any).$mount('#app')
