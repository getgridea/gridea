import * as fs from 'fs'
import Bluebird from 'bluebird'
Bluebird.promisifyAll(fs)
import * as fse from 'fs-extra'
import marked from 'marked'
import ejs, { render } from 'ejs'
import simpleGit, { SimpleGit } from 'simple-git/promise'
import dayjs from 'dayjs'
import less from 'less'
import Model from './model'
import ContentHelper from '../helpers/content-helper'
const helper = new ContentHelper()
import { IPostDb, IPostRenderData, ITagRenderData } from './interfaces/post'
import { ITag } from './interfaces/tag'

export default class Renderer extends Model {
  outputDir: string = `${this.appDir}/output`
  themePath: string = ''
  postsData: IPostRenderData[] = []
  git: SimpleGit

  constructor(appInstance: any)  {
    super(appInstance)

    this.loadConfig()

    this.git = simpleGit(this.outputDir)
  }

  async preview() {
    this.db.themeConfig.domain = this.outputDir
    await this.renderAll()
  }

  async publish() {
    this.db.themeConfig.domain = this.db.setting.domain
    console.log('domain', this.db.themeConfig.domain)
    await this.renderAll()
    console.log('渲染完毕')
    let result = false
    const isRepo = await this.git.checkIsRepo()
    console.log(isRepo)
    if (isRepo) {
      result = await this.commonPush()
    } else {
      result = await this.firstPush()
    }
    return result
  }

  async firstPush() {
    const { setting } = this.db
    console.log('first push')

    try {
      await this.git.init()
      await this.git.addConfig('user.name', setting.username)
      await this.git.addConfig('user.email', setting.email)
      await this.git.add('./*')
      await this.git.commit('first commit')
      await this.git.addRemote('origin', `https://${setting.username}:${setting.token}@github.com/${setting.username}/${setting.repository}.git`)
      await this.git.push('origin', setting.branch, {'--force': true})
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }

  async commonPush() {
    console.log('common push')
    const statusSummary = await this.git.status()
    console.log(statusSummary)
    if (statusSummary.modified.length > 0 || statusSummary.not_added.length > 0) {
      try {
        await this.git.add('./*')
        await this.git.commit(`update from hve: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)
        await this.git.push('origin', this.db.setting.branch, {'--force': true})
        return true
      } catch (e) {
        console.error(e)
        return false
      }
    } else {
      await this.git.push('origin', this.db.setting.branch, {'--force': true})
      console.log('没有更新')
      return false
    }
  }


  async renderAll() {
    await this.formatPostsForRender()
    await this.buildCss()
    await this.renderPostList()
    await this.renderPostDetail()
    await this.renderTagDetail()
    await this.copyFiles()
  }

  /**
   * 加载配置
   */
  async loadConfig() {
    this.themePath = `${this.appDir}/themes/${this.db.themeConfig.themeName}`

    await fse.ensureDir(`${this.appDir}/output`)
    await fse.ensureDir(`${this.appDir}/output/post`)
  }

  /**
   * 格式化文章数据，为渲染页面准备
   */
  public formatPostsForRender(): any {
    this.postsData = this.db.posts.filter((item: IPostDb) => item.data.published)
      .map((item: IPostDb) => {
        const currentTags = item.data.tags.split(' ')
        const result: IPostRenderData = {
          content: marked(helper.changeImageUrlLocalToDomain(item.content, this.db.themeConfig.domain), { breaks: true }),
          fileName: item.fileName,
          abstract: item.abstract,
          title: item.data.title,
          tags: this.db.tags
            .filter((tag: ITag) => currentTags.find((i) => i === tag.name))
            .map((tag: ITag) => ({ ...tag, link: `${this.db.themeConfig.domain}/tag/${tag.slug}` })),
          date: dayjs(item.data.date).format('MMMM Do YYYY, a'),
          feature: item.data.feature && `${helper.changeFeatureImageUrlLocalToDomain(item.data.feature, this.db.themeConfig.domain)}` || '',
          link: `${this.db.themeConfig.domain}/post/${item.fileName}`,
        }
        return result
      })
  }

  /**
   * 渲染文章列表
   */
  public async renderPostList() {
    const { pageSize } = this.db.themeConfig

    for (let i = 0; i * pageSize < this.postsData.length; i += 1) {
      const renderData = {
        menus: this.db.menus,
        posts: this.postsData.slice(i * pageSize, (i + 1) * pageSize),
        pagination: {
          prev: '',
          next: '',
        },
        themeConfig: this.db.themeConfig,
      }

      let renderPath = `${this.outputDir}/index.html`

      if (i === 0 && this.postsData.length > pageSize) {
        await fse.ensureDir(`${this.outputDir}/page`)

        renderData.pagination.next = `${this.db.themeConfig.domain}/page/2/`

      } else if (i > 0 && this.postsData.length > pageSize) {
        await fse.ensureDir(`${this.outputDir}/page/${i + 1}`)

        renderPath = `${this.outputDir}/page/${i + 1}/index.html`

        renderData.pagination.prev = i === 1
          ? `${this.db.themeConfig.domain}/`
          : `${this.db.themeConfig.domain}/page/${i}/`

        renderData.pagination.next = (i + 1) * pageSize < this.postsData.length
          ? `${this.db.themeConfig.domain}/page/${i + 2}/`
          : ''
      }
      let html = ''
      await ejs.renderFile(`${this.themePath}/templates/index.ejs`, renderData, {}, async (err: any, str) => {
        if (str) {
          html = str
        }
      })

      console.log('👏  PostList Page:', renderPath)
      await fs.writeFileSync(renderPath, html)
    }
  }

  /**
   * 渲染文章详情页
   */
  async renderPostDetail() {
    for (let i = 0; i < this.postsData.length; i += 1) {
      const post: any = { ...this.postsData[i] }
      if (i < this.postsData.length - 1) {
        post.nextPost = this.postsData[i + 1]
      }
      console.log('渲染文章详情页', this.db.themeConfig)

      const renderData = {
        menus: this.db.menus,
        post,
        themeConfig: this.db.themeConfig,
      }
      let html = ''
      await ejs.renderFile(`${this.themePath}/templates/post.ejs`, renderData, {}, async (err: any, str) => {
        if (str) {
          html = str
        }
      })
      const renderFolerPath = `${this.outputDir}/post/${post.fileName}`
      await fse.ensureDir(renderFolerPath)
      await fs.writeFileSync(`${renderFolerPath}/index.html`, html)
    }
  }

  /**
   * 渲染标签详情页
   */
  async renderTagDetail() {
    const usedTags = this.db.tags.filter((tag: ITag) => tag.used)
    const { pageSize } = this.db.themeConfig

    for (let i = 0; i < usedTags.length; i += 1) {
      const posts = this.postsData.filter((post: IPostRenderData) => {
        return post.tags.find((tag: ITagRenderData) => tag.slug === usedTags[i].slug)
      })

      const currentTag = usedTags[i]

      const tagFolderPath = `${this.outputDir}/tag/${currentTag.slug}`
      const tagDomainPath = `${this.db.themeConfig.domain}/tag/${currentTag.slug}/`
      await fse.ensureDir(`${this.outputDir}/tag`)
      await fse.ensureDir(tagFolderPath)

      for (let i = 0; i * pageSize < posts.length; i += 1) {
        const renderData = {
          tag: currentTag,
          menus: this.db.menus,
          posts: posts.slice(i * pageSize, (i + 1) * pageSize),
          pagination: {
            prev: '',
            next: '',
          },
          themeConfig: this.db.themeConfig,
        }

        // 分页
        let renderPath = `${tagFolderPath}/index.html`

        if (i === 0 && posts.length > pageSize) {
          await fse.ensureDir(`${tagFolderPath}/page`)

          renderData.pagination.next = `${tagDomainPath}/page/2/`

        } else if (i > 0 && posts.length > pageSize) {
          await fse.ensureDir(`${tagFolderPath}/page/${i + 1}`)

          renderPath = `${tagFolderPath}/page/${i + 1}/index.html`

          renderData.pagination.prev = i === 1
            ? `${tagDomainPath}`
            : `${tagDomainPath}/page/${i}/`

          renderData.pagination.next = (i + 1) * pageSize < posts.length
            ? `${tagDomainPath}/page/${i + 2}/`
            : ''
        }

        let html = ''
        await ejs.renderFile(`${this.themePath}/templates/tag.ejs`, renderData, {}, async (err: any, str) => {
          if (str) {
            html = str
          }
        })
        console.log('👏  Tag Page:', renderPath)
        await fs.writeFileSync(renderPath, html)
      }
    }
  }

  /**
   * 生成 CSS
   */
  async buildCss() {
    const lessFilePath = `${this.themePath}/assets/styles/main.less`
    const cssFolderPath = `${this.outputDir}/styles`

    await fse.ensureDir(cssFolderPath)

    const lessString = await fs.readFileSync(lessFilePath, 'utf8')
    await less.render(lessString, { filename: lessFilePath }, async (err: any, cssString: Less.RenderOutput) => {
      if (err) {
        console.log(err)
      }
      await fs.writeFileSync(`${cssFolderPath}/main.css`, cssString.css)
    })
  }

  /**
   * 复制文件到输出文件夹
   */
  async copyFiles() {
    const imageInputPath = `${this.appDir}/post-images`
    const imageOutputPath = `${this.outputDir}/post-images`

    await fse.ensureDir(imageOutputPath)
    await fse.copySync(imageInputPath, imageOutputPath)

  }
}
