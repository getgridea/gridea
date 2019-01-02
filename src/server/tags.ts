import Model from './model'
import { ITag } from './interfaces/tag'
import slug from '../helpers/slug'

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
        name: item,
        used: true,
      }
    })
    const UnusedTags = this.$posts.get('tags').filter({ used: false }).value()

    const tags = [...UsedTags, ...UnusedTags]
    const result: ITag[] = []
    tags.forEach((item: ITag) => {
      if (!result.find((tag: ITag) => tag.name === item.name)) {
        item.slug = slug(item.name)
        result.push(item)
      }
    })
    this.$posts.set('tags', result).write()
  }

  list() {
    const tags = this.$posts.get('tags').value()
    return tags
  }

  public async saveTag(tag: ITag) {
    const tags = await this.$posts.get('tags').value()
    if (tag.index >= 0) {
      tags[tag.index] = tag
    } else {
      tags.push(tag)
    }
    await this.$posts.set('tags', tags).write()
    return tags
  }

  public async deleteTag(tagValue: string) {
    const tag = await this.$posts.get('tags').remove({ name: tagValue }).write()
    return tag
  }

}
