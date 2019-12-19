import * as fs from 'fs'
import * as fse from 'fs-extra'
import * as path from 'path'
import matter from 'gray-matter'
import moment from 'moment'
import Bluebird from 'bluebird'
import junk from 'junk'
import Model from './model'
import { IPost, IPostDb } from './interfaces/post'
import ContentHelper from '../helpers/content-helper'
import { formatYamlString } from '../helpers/utils'

Bluebird.promisifyAll(fs)

export default class Posts extends Model {
  postDir: string

  postImageDir: string

  constructor(appInstance: any) {
    super(appInstance)
    this.postDir = path.join(this.appDir, 'posts')
    this.postImageDir = `${this.appDir}/post-images`
  }

  public async savePosts() {
    const resultList: any = []
    const requestList: any = []
    let files = await fse.readdir(this.postDir)

    files = files.filter(junk.not)
    files.forEach((item) => {
      requestList.push(fs.readFileSync(path.join(this.postDir, item), 'utf8'))
    })
    const results = await Bluebird.all(requestList)
    const fixedResults = JSON.parse(JSON.stringify(results))
    /**
     * The format of the correction `tag` is changed from a string to an array, and the article source file is updated. from v0.7.6
     */
    await Promise.all(results.map(async (result: any, index: any) => {
      const postMatter = matter(result)
      const data = (postMatter.data as any)

      data.title = formatYamlString(data.title)

      if (data && data.date) {
        if (typeof data.date === 'string') {
          data.date = moment(data.date).format('YYYY-MM-DD HH:mm:ss')
        } else {
          data.date = moment(data.date).subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss')
        }
      }

      // If there is a `tag` and it is of string type, it is corrected to array type.
      if (data && typeof data.tags === 'string') {
        const tagReg = /tags: [^\s[]/i
        const newTagString = data.tags.split(' ').toString()

        if (tagReg.test(result)) {
          const mdStr = `---
title: '${data.title}'
date: ${data.date}
tags: [${newTagString}]
published: ${data.published || false}
hideInList: ${data.hideInList || false}
feature: ${data.feature || ''}
isTop: ${data.isTop || false}
---
${postMatter.content}`

          fixedResults[index] = mdStr
          fse.writeFileSync(`${this.postDir}/${files[index]}`, mdStr)
        }
      }
    }))

    fixedResults.forEach((result: any, index: any) => {
      const postMatter = matter(result)

      const data = (postMatter.data as any)

      // Remove useless `'` in formatYamlString generate
      if (data && data.title) {
        data.title = String(data.title).replace(/''/g, '\'')
      }
      
      // Fix matter's formatted `date` problem
      if (data && data.date) {
        if (typeof data.date === 'string') {
          data.date = moment(data.date).format('YYYY-MM-DD HH:mm:ss')
        } else {
          data.date = moment(data.date).subtract(8, 'hours').format('YYYY-MM-DD HH:mm:ss')
        }
      }

      delete postMatter.orig // Remove orig <Buffer>
      const post = {
        ...postMatter,
        abstract: '',
        fileName: '',
      }

      const moreReg = /\n\s*<!--\s*more\s*-->\s*\n/i
      const matchMore = moreReg.exec(post.content)
      if (matchMore) {
        post.abstract = (post.content).substring(0, matchMore.index) // Abstract
      }

      post.fileName = files[index].substring(0, files[index].length - 3) // To be optimized!
      resultList.push(post)
    })

    const list: any = []
    resultList.forEach((item: any) => {
      // Articles migrated from hexo or other platforms do not have a `published` field
      if (item.data.published === undefined) {
        item.data.published = false
      }

      // Articles migrated from other platforms or old articles do not have `hideInList` fields
      if (item.data.hideInList === undefined) {
        item.data.hideInList = false
      }

      // Articles migrated from other platforms or old articles do not have `isTop` fields
      if (item.data.isTop === undefined) {
        item.data.isTop = false
      }

      list.push(item)
    })

    list.sort((a: any, b: any) => moment(b.data.date).unix() - moment(a.data.date).unix())

    this.$posts.set('posts', list).write()
    return true
  }

  async list() {
    await this.savePosts()
    const posts = await this.$posts.get('posts').value()
    const helper = new ContentHelper()

    const list = posts.map((post: IPostDb) => {
      const item = JSON.parse(JSON.stringify(post))
      item.content = helper.changeImageUrlDomainToLocal(item.content, this.appDir)
      item.data.feature = item.data.feature && !item.data.feature.includes('http')
        ? helper.changeFeatureImageUrlDomainToLocal(item.data.feature, this.appDir)
        : item.data.feature
      return item
    })

    return list
  }

  /**
   * Save Post to file
   * @param post
   */
  async savePostToFile(post: IPost): Promise<IPost | null> {
    const helper = new ContentHelper()
    const content = helper.changeImageUrlLocalToDomain(post.content, this.db.setting.domain)
    const extendName = (post.featureImage.name || 'jpg').split('.').pop()

    post.title = formatYamlString(post.title)

    const mdStr = `---
title: '${post.title}'
date: ${post.date}
tags: [${post.tags.join(',')}]
published: ${post.published}
hideInList: ${post.hideInList}
feature: ${post.featureImage.name ? `/post-images/${post.fileName}.${extendName}` : post.featureImagePath}
isTop: ${post.isTop}
---
${content}`

    try {
      // If exist feature image
      if (post.featureImage.path) {
        const filePath = `${this.postImageDir}/${post.fileName}.${extendName}`

        if (post.featureImage.path !== filePath) {
          fse.copySync(post.featureImage.path, filePath)

          // Clean the old file
          if (post.featureImage.path.includes(this.postImageDir)) {
            fse.removeSync(post.featureImage.path)
          }
        }
      }

      // Write file must use fse, beause fs.writeFile need callback
      await fse.writeFile(`${this.postDir}/${post.fileName}.md`, mdStr)

      // Clean the old file
      if (post.deleteFileName) {
        fse.removeSync(`${this.postDir}/${post.deleteFileName}.md`)
      }
    } catch (e) {
      console.error('ERROR: ', e)
    }
    return post
  }

  async deletePost(post: IPostDb) {
    try {
      const postUrl = `${this.postDir}/${post.fileName}.md`
      fse.removeSync(postUrl)

      // Clean feature image
      if (post.data.feature) {
        fse.removeSync(post.data.feature.replace('file://', ''))
      }

      // Clean post content image
      const imageReg = /(!\[.*?\]\()(.+?)(\))/g
      const imageList = post.content.match(imageReg)
      if (imageList) {
        const postImagePaths = imageList.map((item: string) => {
          const index = item.indexOf('(')
          return item.substring(index + 1, item.length - 1)
        })
        postImagePaths.forEach(async (filePath: string) => {
          fse.removeSync(filePath.replace('file://', ''))
        })
      }
      return true
    } catch (e) {
      console.error('Delete Error', e)
      return false
    }
  }

  async uploadImages(files: any[]) {
    await fse.ensureDir(this.postImageDir)
    const results = []
    for (const file of files) {
      const extendName = file.name.split('.').pop()
      const newFileName = new Date().getTime()
      const filePath = `${this.postImageDir}/${newFileName}.${extendName}`
      fse.copySync(file.path, filePath)
      results.push(filePath)
    }
    return results
  }
}
