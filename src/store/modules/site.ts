import { ActionTree, Module, MutationTree } from 'vuex'
import { IPost } from '../../interfaces/post'
import { ITag } from '../../interfaces/tag'
import { ITheme } from '../../interfaces/theme'
import { IMenu } from '../../interfaces/menu'
import { ISetting, ICommentSetting } from '../../interfaces/setting'
import { DEFAULT_POST_PAGE_SIZE, DEFAULT_ARCHIVES_PAGE_SIZE } from '../../helpers/constants'

export interface Site {
  appDir: string,
  config: any
  posts: IPost[]
  tags: ITag[]
  menus: IMenu[]
  themeConfig: ITheme
  themes: string[]
  setting: ISetting
  commentSetting: ICommentSetting
}
const siteState: Site = {
  appDir: '',
  config: {},
  posts: [],
  tags: [],
  menus: [],
  themeConfig: {
    themeName: '',
    postPageSize: 10,
    archivesPageSize: 50,
    siteName: '',
    siteDescription: '',
    footerInfo: 'Powered by Hve',
    showFeatureImage: true,
    postUrlFormat: 'SLUG',
    tagUrlFormat: 'SLUG',
  },
  themes: [],
  setting: {
    platform: '',
    domain: '',
    repository: '',
    branch: '',
    username: '',
    email: '',
    token: '',
    cname: '',
  },
  commentSetting: {
    showComment: false,
    commentPlatform: 'gitalk',
    gitalkSetting: {
      clientId: '',
      clientSecret: '',
      repository: '',
      owner: '',
    },
    disqusSetting: {
      api: '',
      apikey: '',
      shortname: '',
    },
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
    state.themeConfig.postUrlFormat = siteData.themeConfig.postUrlFormat || 'SLUG'
    state.themeConfig.tagUrlFormat = siteData.themeConfig.tagUrlFormat || 'SLUG'
    state.themeConfig.postPageSize = siteData.themeConfig.postPageSize || DEFAULT_POST_PAGE_SIZE
    state.themeConfig.archivesPageSize = siteData.themeConfig.archivesPageSize || DEFAULT_ARCHIVES_PAGE_SIZE
    state.themes = siteData.themes
    state.setting = siteData.setting
    state.commentSetting = siteData.commentSetting
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
