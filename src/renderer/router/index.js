import Vue from 'vue'
import Router from 'vue-router'
import Main from '@/components/main/Main'
import PostList from '@/components/post/PostList'
import PostNew from '@/components/post/PostNew'
import Setting from '@/components/setting/Setting'
import Theme from '@/components/theme/Theme'
import Page from '@/components/page/Page'
import PageNew from '@/components/page/PageNew'
import Resource from '@/components/resource/Resource'
import Welcome from '@/components/welcome/Welcome'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/welcome',
      name: 'welcome',
      component: Welcome,
      props: true,
    },
    {
      path: '/main',
      component: Main,
      children: [
        {
          path: '/post-list',
          name: 'post-list',
          component: PostList,
          props: true,
        },
        {
          path: '/new',
          name: 'new-post',
          component: PostNew,
          props: true,
        },
        {
          path: '/theme',
          name: 'theme',
          component: Theme,
        },
        {
          path: '/page',
          name: 'page',
          component: Page,
        },
        {
          path: '/page-new',
          name: 'page-new',
          component: PageNew,
          props: true,
        },
        {
          path: '/setting',
          name: 'setting',
          component: Setting,
        },
        {
          path: '/resource',
          name: 'resource',
          component: Resource,
        },
        {
          path: '*',
          redirect: '/post-list',
        },
      ],
    },
    {
      path: '*',
      redirect: '/welcome',
    },
  ],
})
