function addPrefix(types, prefix) {
  Object.keys(types).forEach((typeKey) => {
    Object.keys(types[typeKey]).forEach((key) => {
      types[typeKey][key] = `${prefix}/${types[typeKey][key]}`
    })
  })
}

const website = {
  mutations: {
    UPDATE_SETTING: 'UPDATE_SETTING',
    UPDATE_MENUS: 'UPDATE_MENUS',
  },
  actions: {
    UPDATE_SETTING: 'UPDATE_SETTING',
    UPDATE_MENUS: 'UPDATE_MENUS',
  },
}
addPrefix(website, 'website')

const setting = {
  mutations: {
    UPDATE_SETTING: 'UPDATE_SETTING',
  },
  actions: {
    UPDATE_SETTING: 'UPDATE_SETTING',
  },
}
addPrefix(setting, 'setting')

const tags = {
  mutations: {
    UPDATE_TAGS: 'UPDATE_TAGS',
    ADD_TAG: 'ADD_TAG',
  },
  actions: {
    UPDATE_TAGS: 'UPDATE_TAGS',
    ADD_TAG: 'ADD_TAG',
  },
}
addPrefix(tags, 'tags')

export {
  website,
  setting,
  tags,
}
