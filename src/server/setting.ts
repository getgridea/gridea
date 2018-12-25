import Model from './model'
// import { ISetting } from './interfaces/setting'

export default class Setting extends Model {
  
  constructor(appInstance: any) {
    super(appInstance)
  }

  getSetting() {
    const setting = this.$setting.get().value()
    console.log('settting: ', setting)
    return setting
  }

  // public async saveTag(tag: ITag) {
  //   const tags = await this.$posts.get('tags').value()
  //   if (tag.index >= 0) {
  //     tags[tag.index] = tag
  //   } else {
  //     tags.push(tag)
  //   }
  //   await this.$posts.set('tags', tags).write()
  //   return tags
  // }

}