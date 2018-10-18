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
      path: '/menu',
      name: 'menu',
      component: require('@/components/menu/Index').default
    },
    {
      path: '/tags',
      name: 'tags',
      component: require('@/components/tags/Index').default
    },
    {
      path: '/theme',
      name: 'theme',
      component: require('@/components/theme/Index').default
    },
    {
      path: '/setting',
      name: 'setting',
      component: require('@/components/setting/Index').default
    },
    {
      path: '*',
      redirect: '/articles'
    }
  ]
})
