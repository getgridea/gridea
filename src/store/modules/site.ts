import { ActionTree, Module, MutationTree } from 'vuex'
import { IPost } from '../../interfaces/post'
import { ITag } from '../../interfaces/tag'
import { ITheme } from '../../interfaces/theme'
import { IMenu } from '../../interfaces/menu'
import { ISetting } from '../../interfaces/setting'

export interface Site {
  config: any
  posts: IPost[]
  tags: ITag[]
  menus: IMenu[]
  themeConfig: ITheme
  themes: string[]
  setting: ISetting
}
const postState: Site = {
  config: {},
  posts: [],
  tags: [],
  menus: [],
  themeConfig: {
    themeName: '',
    pageSize: 10,
    siteName: '',
    siteDescription: '',
    footerInfo: 'Powered by Hve',
    showFeatureImage: true,
  },
  themes: [],
  setting: {
    domain: '',
    repository: '',
    branch: '',
    username: '',
    email: '',
    token: '',
  },
}

const mutations: MutationTree<Site> = {
  updateSite(state, siteData: Site) {
    state.posts = siteData.posts
    state.tags = siteData.tags
    state.menus = siteData.menus
    state.config = siteData.config
    state.themeConfig = siteData.themeConfig
    state.themes = siteData.themes
    state.setting = siteData.setting
  },
  updatePosts(state, posts: IPost[]) {
    state.posts = posts
  },
}

const actions: ActionTree<Site, any> = {
  updatePosts({ commit }, posts: IPost[]) {
    commit('updatePosts', posts)
  },
  updateSite({ commit }, siteData: Site) {
    console.log('siteData:', siteData)
    commit('updateSite', siteData)
  },
}

const module: Module<Site, any> = {
  namespaced: true,
  state: postState,
  mutations,
  actions,
}

export default module
