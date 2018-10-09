import { ActionTree, Module, MutationTree } from 'vuex'
import { IPost } from '../../interfaces/post'
import { ITag } from '../../interfaces/tag'

export interface Site {
  config: any
  posts: IPost[]
  tags: ITag[]
}
const postState: Site = {
  config: {},
  posts: [],
  tags: [],
}

const mutations: MutationTree<Site> = {
  updateSite(state, siteData: Site) {
    state.posts = siteData.posts
    state.tags = siteData.tags
    state.config = siteData.config
  },
  updatePosts(state, posts: IPost[]) {
    state.posts = posts
  }
}

const actions: ActionTree<Site, any> = {
  updatePosts({ commit }, posts: IPost[]) {
    commit('updatePosts', posts)
  },
  updateSite({ commit }, siteData: Site) {
    commit('updateSite', siteData)
  }
}

const module: Module<Site, any> = {
  namespaced: true,
  state: postState,
  mutations,
  actions,
}

export default module
