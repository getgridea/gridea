import { tags as types } from '../types'

const state = {
  tags: [],
}

const mutations = {
  [types.mutations.UPDATE_TAGS](state, payload) {
    state.tags = []
    payload.forEach(i => {
      state.tags.push({
        name: i,
        checked: false,
      })
    })
  },
  [types.mutations.ADD_TAG](state, tag) {
    state.tags.push({
      name: tag,
      checked: false,
    })
  },
}

const actions = {
  [types.actions.UPDATE_TAGS]({ commit }, tags) {
    commit(types.mutations.UPDATE_TAGS, tags)
  },
  [types.actions.ADD_TAG]({ commit }, tag) {
    commit(types.mutations.ADD_TAG, tag)
  },
}

export default {
  state,
  mutations,
  actions,
}
