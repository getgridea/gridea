import Vue from 'vue'
import Router from 'vue-router'
import Main from './components/Main.vue'
// import ArticleUpdate from './views/article/ArticleUpdate.vue'
import Articles from './views/article/Articles.vue'
import Menu from './views/menu/Index.vue'
import Tags from './views/tags/Index.vue'
import Theme from './views/theme/Index.vue'
import Setting from './views/setting/Index.vue'
import System from './views/system/Index.vue'
import Loading from './views/loading/Index.vue'

Vue.use(Router)

export default new Router({
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main,
      children: [
        {
          path: '/articles',
          name: 'articles',
          component: Articles,
        },
        {
          path: '/menu',
          name: 'menu',
          component: Menu,
        },
        {
          path: '/tags',
          name: 'tags',
          component: Tags,
        },
        {
          path: '/theme',
          name: 'theme',
          component: Theme,
        },
        {
          path: '/setting',
          name: 'setting',
          component: Setting,
        },
        {
          path: '/system',
          name: 'system',
          component: System,
        },
        {
          path: '/loading',
          name: 'loading',
          component: Loading,
        },
        {
          path: '*',
          redirect: '/articles',
        },
      ],
    },
  ],
})
