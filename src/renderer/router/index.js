import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/posts',
      name: 'welcome-view',
      component: require('@/components/WelcomeView').default
    },
    {
      path: '/theme',
      name: 'inspire',
      component: require('@/components/InspireView').default
    },
    {
      path: '*',
      redirect: '/posts'
    }
  ]
})
