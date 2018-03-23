import { website as types } from '../types'

const state = {
  title: '',
  pageSize: 5,
  gitmentOwner: '',
  gitmentRepo: '',
  gitmentClientId: '',
  gitmentClientSecret: '',
  menus: [],
}

const mutations = {
  [types.mutations.UPDATE_SETTING](state, payload) {
    state.title = payload.title
    state.pageSize = payload.pageSize
    state.gitmentOwner = payload.gitmentOwner
    state.gitmentRepo = payload.gitmentRepo
    state.gitmentClientId = payload.gitmentClientId
    state.gitmentClientSecret = payload.gitmentClientSecret
  },
  [types.mutations.UPDATE_MENUS](state, payload) {
    state.menus = payload
  },
}

const actions = {
  [types.actions.UPDATE_SETTING]({ commit }, form) {
    console.log('form: ', form)
    commit(types.mutations.UPDATE_SETTING, form)
  },
  [types.actions.UPDATE_MENUS]({ commit }, menus) {
    console.log('menus: ', menus)
    commit(types.mutations.UPDATE_MENUS, menus)
  },
}

export default {
  state,
  mutations,
  actions,
}
