import { ActionTree, Module, MutationTree } from 'vuex'
import { IPost } from '../../interfaces/post'
import { ITag } from '../../interfaces/tag'
import { ITheme } from '../../interfaces/theme'
import { IMenu } from '../../interfaces/menu'
import { ISetting, ICommentSetting } from '../../interfaces/setting'
import { DEFAULT_POST_PAGE_SIZE, DEFAULT_ARCHIVES_PAGE_SIZE, DEFAULT_FEED_COUNT } from '../../helpers/constants'
import { IPrivatePostSetting } from '@/server/interfaces/setting'

export interface Site {
  appDir: string
  config: any
  posts: IPost[]
  tags: ITag[]
  menus: IMenu[]
  themeConfig: ITheme
  themeCustomConfig: any
  currentThemeConfig: any
  themes: string[]
  setting: ISetting
  commentSetting: ICommentSetting
  privatePostSetting: IPrivatePostSetting
}

const siteState: Site = {
  appDir: '',
  config: {},
  posts: [],
  tags: [],
  menus: [],
  themeConfig: {
    themeName: '',
    postPageSize: DEFAULT_POST_PAGE_SIZE,
    archivesPageSize: DEFAULT_ARCHIVES_PAGE_SIZE,
    siteName: '',
    siteDescription: '',
    footerInfo: 'Powered by Gridea',
    showFeatureImage: true,
    postUrlFormat: 'SLUG',
    tagUrlFormat: 'SLUG',
    dateFormat: 'YYYY-MM-DD',
    feedCount: DEFAULT_FEED_COUNT,
    feedFullText: true,
  },
  themeCustomConfig: {},
  currentThemeConfig: {},
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
    valineSetting: {
      appId: '',
      appKey: '',
      placeholder: 'Just go go',
      notify: false,
      verify: false,
      avatar: 'mp',
      pageSize: 10,
      visitor: false,
      highlight: false,
      recordIP: false,
    },
  },
  privatePostSetting: {
    enable: false,
    key: '',
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
    state.themeConfig.dateFormat = siteData.themeConfig.dateFormat || 'YYYY-MM-DD'
    state.themeConfig.postPageSize = siteData.themeConfig.postPageSize || DEFAULT_POST_PAGE_SIZE
    state.themeConfig.archivesPageSize = siteData.themeConfig.archivesPageSize || DEFAULT_ARCHIVES_PAGE_SIZE
    state.themeConfig.feedCount = siteData.themeConfig.feedCount || DEFAULT_FEED_COUNT
    state.themeConfig.feedFullText = (typeof siteData.themeConfig.feedFullText) === 'undefined' ? true : siteData.themeConfig.feedFullText // from > 0.8.0
    state.themes = siteData.themes
    state.setting = siteData.setting
    state.commentSetting = siteData.commentSetting
    state.themeCustomConfig = siteData.themeCustomConfig
    state.currentThemeConfig = siteData.currentThemeConfig
    state.privatePostSetting = siteData.privatePostSetting
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
