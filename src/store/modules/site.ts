import { ActionTree, Module, MutationTree } from 'vuex'
import { IPost } from '../../interfaces/post'
import { ITag } from '../../interfaces/tag'
import { ITheme } from '../../interfaces/theme'
import { IMenu } from '../../interfaces/menu'
import { ISetting, IGitalkSetting } from '../../interfaces/setting'

export interface Site {
  appDir: string,
  config: any
  posts: IPost[]
  tags: ITag[]
  menus: IMenu[]
  themeConfig: ITheme
  themes: string[]
  setting: ISetting
  gitalkSetting: IGitalkSetting
}
const siteState: Site = {
  appDir: '',
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
    cname: '',
  },
  gitalkSetting: {
    showComment: false,
    clientId: '',
    clientSecret: '',
    repository: '',
    owner: '',
  },
}

const mutations: MutationTree<Site> = {
  updateSite(state, siteData: Site) {
    console.log('data', siteData)
    state.appDir = siteData.appDir
    state.posts = siteData.posts
    state.tags = siteData.tags
    state.menus = siteData.menus
    state.config = siteData.config
    state.themeConfig = siteData.themeConfig
    state.themes = siteData.themes
    state.setting = siteData.setting
    state.gitalkSetting = siteData.gitalkSetting
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
  state: siteState,
  mutations,
  actions,
}

export default module
