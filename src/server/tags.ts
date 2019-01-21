import Model from './model'
import { ITag } from './interfaces/tag'
import slug from '../helpers/slug'
import shortid from 'shortid'
import { UrlFormats } from '../helpers/enums'

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

    const themeConfig = this.$theme.get('config')
    const tagUrlFormat = themeConfig.tagUrlFormat || UrlFormats.Slug

    const existUsedTags = this.$posts.get('tags').filter({ used: true }).value()

    // 导入文章的 tag 则为新使用过的
    const newUsedTags = list
      .filter((item: any) => !existUsedTags.find((tag: ITag) => tag.name === item))
      .map((item: any) => {
        return {
          name: item,
          slug: tagUrlFormat === UrlFormats.Slug ? slug(item) : shortid.generate(),
          used: true,
        }
      })

    const UnusedTags = this.$posts.get('tags').filter({ used: false }).value()

    const tags = [...newUsedTags, ...existUsedTags, ...UnusedTags]

    this.$posts.set('tags', tags).write()
  }

  list() {
    const tags = this.$posts.get('tags').value()
    return tags
  }

  public async saveTag(tag: ITag) {
    const tags = await this.$posts.get('tags').value()
    if (tag.index && tag.index >= 0) {
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
