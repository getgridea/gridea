import { ActionTree, Module, MutationTree } from 'vuex'
import { IPost } from '../../interfaces/post'

export interface Post {
  posts: IPost[]
}
const postState: Post = {
  posts: [],
}

const mutations: MutationTree<Post> = {
  updatePosts(state, posts: IPost[]) {
    state.posts = posts
  }
}

const actions: ActionTree<Post, any> = {
  updatePosts({ commit }, posts: IPost[]) {
    commit('updatePosts', posts)
  }
}

const module: Module<Post, any> = {
  namespaced: true,
  state: postState,
  mutations,
  actions,
}

export default module
