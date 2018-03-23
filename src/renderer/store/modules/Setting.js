import { setting as types } from '../types'

const state = {
  source: null,
  domain: null,
  repo: null,
  branch: null,
  email: null,
  username: null,
  backupRepo: null,
}

const mutations = {
  [types.mutations.UPDATE_SETTING](state, payload) {
    state.source = payload.source
    state.domain = payload.domain
    state.repo = payload.repo
    state.branch = payload.branch
    state.token = payload.token
    state.email = payload.email
    state.username = payload.username
    state.backupRepo = payload.backupRepo
  },
}

const actions = {
  [types.actions.UPDATE_SETTING]({ commit }, form) {
    commit(types.mutations.UPDATE_SETTING, form)
  },
}

export default {
  state,
  mutations,
  actions,
}
