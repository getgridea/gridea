import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/articles/create',
      name: 'articles-create',
      component: require('@/components/article/ArticleUpdate').default
    },
    {
      path: '/articles/:articleFileName',
      name: 'articles-edit',
      component: require('@/components/article/ArticleUpdate').default
    },
    {
      path: '/articles',
      name: 'articles',
      component: require('@/components/article/Articles').default
    },
    {
      path: '/tags',
      name: 'tags',
      component: require('@/components/tags/Index').default
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
