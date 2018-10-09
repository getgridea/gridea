import Model from './model'

export default class Tags extends Model {
  
  constructor(appInstance: any) {
    super(appInstance)
    this.saveTags()
  }

  public async saveTags() {
    const posts = this.$posts.get('posts').value()
    let list: any = []
    posts.forEach((post: any) => {
      if (typeof post.data.tags === 'string') {
        list = list.concat(post.data.tags.split(' '))
      }
    })
    list = Array.from(new Set([...list]))
    const UsedTags = list.map((item: any) => {
      return {
        value: item,
        used: true,
      }
    })
    console.log('已经使用的 tags', UsedTags)
    const UnusedTags = this.$posts.get('tags').filter({ used: false }).value()
    console.log('未被使用的 tags', UnusedTags)
    this.$posts.set('tags', [...UsedTags, ...UnusedTags]).write()
  }
  
  list() {
    const tags = this.$posts.get('tags').value()
    return tags
  }

  public async deleteTag(tagValue: string) {
    const tag = await this.$posts.get('tags').remove({ value: tagValue }).write()
    return tag
  }

}