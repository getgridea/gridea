import * as fs from 'fs'
import Model from './model'
import * as fse from 'fs-extra'
import * as path from 'path'
const junk = require('junk')
import { IPost, IPostDb } from './interfaces/post'
import ContentHelper from '../helpers/content-helper'
import * as matter from 'gray-matter'
import * as Bluebird from 'bluebird'
Bluebird.promisifyAll(fs)

export default class Posts extends Model {
  postDir: string
  postImageDir: string

  constructor(appInstance: any) {
    super(appInstance)
    this.postDir = path.join(this.appDir, 'posts')
    this.postImageDir = path.join(this.appDir, 'post-images')
    this.savePosts()
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
    results.forEach((result: any, index: any) => {
      const postMatter = matter(result)
      delete postMatter.orig // Remove orig <Buffer>
      const post = {
        ...postMatter,
        abstract: '',
        fileName: '',
      }
      
      post.abstract = (post.content).substring(0, post.content.indexOf('<!-- more -->')) // 摘要
      post.fileName = files[index].substring(0, files[index].length - 3) // 有待优化!
      resultList.push(post)
    })
    
    const list : any = []
    resultList.forEach((item: any) => {
      // 从 hexo 或其他平台迁移过来的文章不带有 published 字段
      if (item.data.published === undefined) {
        item.data.published = false
        list.push(item)
      } else {
        list.push(item)
      }
    })
    this.$posts.set('posts', list).write()
    return true
  }

  async list() {
    await this.savePosts()
    // await this.$posts.defaults({ posts: [] }).write()
    const posts = await this.$posts.get('posts').value()
    const helper = new ContentHelper()

    const list = posts.map((post: IPostDb) => {
      const item = JSON.parse(JSON.stringify(post))
      item.content = helper.changeImageUrlDomainToLocal(item.content, this.appDir)
      item.data.feature = item.data.feature ? helper.changeFeatureImageUrlDomainToLocal(item.data.feature, this.appDir) : item.data.feature
      return item
    })
    return list
  }

  /**
   * 保存文章到文件
   * @param post 文章
   */
  async savePostToFile(post: IPost): Promise<IPost | null> {
    const helper = new ContentHelper()
    const content = helper.changeImageUrlLocalToDomain(post.content, this.db.setting.domain)
    const extendName = (post.featureImage.name || 'jpg').split('.').pop()

    const mdStr = `---
title: ${post.title}
date: ${post.date}
tags: ${post.tags.join(' ')}
published: ${post.published}
feature: ${post.featureImage.name ? `/post-images/${post.fileName}.${extendName}` : ''}
---
${content}
`
    try {

      // 存在文章大图
      if (post.featureImage.path) {
        
        const filePath = `${this.postImageDir}/${post.fileName}.${extendName}`

        if (post.featureImage.path !== filePath) {
          await fse.copySync(post.featureImage.path, filePath)
        }
      }

      // write file must use fse, beause fs.writeFile need callback
      await fse.writeFile(`${this.postDir}/${post.fileName}.md`, mdStr)
    } catch (e) {
      console.error('ERROR: ', e)
    }
    return post
  }

  async uploadImages(files: any[]) {
    console.log('传过来的 files', files)
    await fse.ensureDir(this.postImageDir)
    const results = []
    for (let i = 0; i < files.length; i += 1) {
      const extendName = files[i].name.split('.').pop()
      const newFileName = new Date().getTime()
      const filePath = `${this.postImageDir}/${newFileName}.${extendName}`
      await fse.copySync(files[i].path, filePath)
      results.push(filePath)
      console.log('复制成功')
    }
    return results
  }
}