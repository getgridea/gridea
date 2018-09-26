import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/articles',
      name: 'articles',
      component: require('@/components/article/Articles').default
    },
    {
      path: '/theme',
      name: 'inspire',
      component: require('@/components/InspireView').default
    },
    {
      path: '*',
      redirect: '/articles'
    }
  ]
})
