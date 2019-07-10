import * as fs from 'fs'
import path from 'path'
import Bluebird from 'bluebird'
import * as fse from 'fs-extra'
import ejs from 'ejs'
import simpleGit, { SimpleGit } from 'simple-git/promise'
import moment from 'moment'
import less from 'less'
import { Feed } from 'feed'
import readingTime from 'reading-time'
import Model from './model'
import ContentHelper from '../helpers/content-helper'
import {
  IPostDb, IPostRenderData, ITagRenderData, ISiteTagsData,
} from './interfaces/post'
import { ITag } from './interfaces/tag'
import { DEFAULT_POST_PAGE_SIZE, DEFAULT_ARCHIVES_PAGE_SIZE } from '../helpers/constants'
import markdown from './plugins/markdown'
import { IMenu } from './interfaces/menu'

Bluebird.promisifyAll(fs)
const helper = new ContentHelper()

export default class Renderer extends Model {
  outputDir: string = `${this.appDir}/output`

  themePath: string = ''

  postsData: IPostRenderData[] = []

  tagsData: ISiteTagsData[] = []

  menuData: IMenu[] = []

  git: SimpleGit

  platformAddress = ''

  remoteUrl = ''

  utils: any = {}

  constructor(appInstance: any) {
    super(appInstance)

    this.loadConfig()

    const { setting } = this.db
    this.platformAddress = ({
      github: 'github.com',
      coding: 'git.coding.net',
    } as any)[setting.platform || 'github']

    this.remoteUrl = `https://${setting.username}:${setting.token}@${this.platformAddress}/${setting.username}/${setting.repository}.git`

    this.git = simpleGit(this.outputDir)

    this.utils.now = Date.now()
    this.utils.moment = moment
  }

  async preview() {
    this.db.themeConfig.domain = this.outputDir
    await this.renderAll('preview')
  }

  async publish() {
    this.db.themeConfig.domain = this.db.setting.domain
    console.log('domain', this.db.themeConfig.domain)
    await this.renderAll('publish')
    console.log('渲染完毕')
    let result = {
      success: true,
      message: '',
      localBranchs: {},
    }
    const isRepo = await this.git.checkIsRepo()
    console.log(isRepo)
    if (isRepo) {
      result = await this.commonPush()
    } else {
      result = await this.firstPush()
    }
    return result
  }

  /**
   * Check whether the remote connection is normal
   */
  async remoteDetect() {
    const result = {
      success: true,
      message: '',
    }
    try {
      const { setting } = this.db
      const isRepo = await this.git.checkIsRepo()
      if (!setting.username || !setting.repository || !setting.token) {
        return {
          success: false,
          message: 'Username、repository、token is required',
        }
      }
      if (!isRepo) {
        await this.git.init()
        await this.git.addConfig('user.name', setting.username)
        await this.git.addConfig('user.email', setting.email)
        await this.git.add('./*')
        await this.git.commit('first commit')
        await this.git.addRemote('origin', this.remoteUrl)
      }

      await this.git.raw(['remote', 'set-url', 'origin', this.remoteUrl])
      const data = await this.git.listRemote([])
    } catch (e) {
      console.log('Test Remote Error: ', e.message)
      result.success = false
      result.message = e.message
    }
    return result
  }

  /**
   * Check whether the branch needs to be switched
   */
  async checkCurrentBranch() {
    const { setting } = this.db
    const currentBranch = (await this.git.revparse(['--abbrev-ref', 'HEAD']) || 'master').replace(/\n/g, '')
    let hasNewBranch = true
    console.log(currentBranch)

    const list = await this.git.branch([])
    list.all.forEach((item: string) => {
      if (item === setting.branch) {
        hasNewBranch = false
      }
    })

    if (currentBranch !== setting.branch) {
      if (hasNewBranch) {
        await this.git.checkout(['-b', setting.branch])
      } else {
        try {
          await this.git.deleteLocalBranch(setting.branch)
        } catch (e) {
          console.log(e)
        } finally {
          await this.git.checkout(['-b', setting.branch])
        }
      }
    }
    return {}
  }

  async firstPush() {
    const { setting } = this.db
    let localBranchs = {}
    console.log('first push')

    try {
      await this.git.init()
      await this.git.addConfig('user.name', setting.username)
      await this.git.addConfig('user.email', setting.email)
      await this.git.add('./*')
      await this.git.commit('first commit')
      await this.git.addRemote('origin', this.remoteUrl)
      localBranchs = await this.checkCurrentBranch()
      await this.git.push('origin', setting.branch, { '--force': true })
      return {
        success: true,
        data: localBranchs,
        message: '',
        localBranchs,
      }
    } catch (e) {
      console.error(e)
      return {
        success: false,
        data: localBranchs,
        message: e.message,
        localBranchs,
      }
    }
  }

  async commonPush() {
    console.log('common push')
    const { setting } = this.db
    let localBranchs = {}
    try {
      const statusSummary = await this.git.status()
      console.log(statusSummary)
      await this.git.raw(['remote', 'set-url', 'origin', this.remoteUrl])

      if (statusSummary.modified.length > 0 || statusSummary.not_added.length > 0) {
        await this.git.add('./*')
        await this.git.commit(`update from gridea: ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
        localBranchs = await this.checkCurrentBranch()
        await this.git.push('origin', this.db.setting.branch, { '--force': true })
      } else {
        await this.checkCurrentBranch()
        await this.git.push('origin', this.db.setting.branch, { '--force': true })
      }
      return {
        success: true,
        data: localBranchs,
        message: '',
        localBranchs,
      }
    } catch (e) {
      console.log(e)
      return {
        success: false,
        message: e.message,
        data: localBranchs,
        localBranchs,
      }
    }
  }


  async renderAll(mode: string) {
    await this.clearOutputFolder()
    await this.formatDataForRender(mode)
    await this.buildCss()

    // Render post list page
    await this.renderPostList('', mode)

    // Render archives page
    await this.renderPostList('/archives', mode)
    // Render tag list page
    await this.renderTags()
    await this.renderPostDetail()
    await this.renderTagDetail(mode)
    await this.copyFiles()
    await this.buildCname()

    await this.buildFeed()
  }

  /**
   * Load Config
   */
  async loadConfig() {
    this.themePath = `${this.appDir}/themes/${this.db.themeConfig.themeName}`

    await fse.ensureDir(`${this.appDir}/output`)
    await fse.ensureDir(`${this.appDir}/output/post`)
  }

  /**
   * Format data for rendering pages
   */
  public formatDataForRender(mode: string): any {
    const { themeConfig } = this.db

    this.postsData = this.db.posts.filter((item: IPostDb) => item.data.published)
      .map((item: IPostDb) => {
        const currentTags = item.data.tags || []
        let toc = ''
        const content = markdown.render(helper.changeImageUrlLocalToDomain(item.content, this.db.themeConfig.domain), {
          tocCallback(tocMarkdown: any, tocArray: any, tocHtml: any) {
            toc = tocHtml
          },
        })

        const result: IPostRenderData = {
          content,
          fileName: item.fileName,
          abstract: markdown.render(helper.changeImageUrlLocalToDomain(item.abstract, this.db.themeConfig.domain)),
          title: item.data.title,
          tags: this.db.tags
            .filter((tag: ITag) => currentTags.find(i => i === tag.name))
            .map((tag: ITag) => ({ ...tag, link: `${this.db.themeConfig.domain}/tag/${tag.slug}${mode === 'preview' ? '/index.html' : ''}` })),
          date: item.data.date,
          dateFormat: (themeConfig.dateFormat && moment(item.data.date).format(themeConfig.dateFormat)) || item.data.date,
          feature: item.data.feature && !item.data.feature.includes('http')
            ? `${helper.changeFeatureImageUrlLocalToDomain(item.data.feature, this.db.themeConfig.domain, mode)}`
            : item.data.feature || '',
          link: `${this.db.themeConfig.domain}/post/${item.fileName}${mode === 'preview' ? '/index.html' : ''}`,
          hideInList: (item.data.hideInList === undefined && false) || item.data.hideInList,
          stats: readingTime(content),
        }

        result.toc = toc
        return result
      })
      .sort((a: IPostRenderData, b: IPostRenderData) => moment(b.date).unix() - moment(a.date).unix())


    this.tagsData = []
    this.postsData.forEach((item: IPostRenderData) => {
      if (!item.hideInList) {
        item.tags.forEach((tag: ITagRenderData) => {
          const foundTag = this.tagsData.find((t: ITagRenderData) => t.link === tag.link)
          if (!foundTag) {
            this.tagsData.push({
              ...tag,
              count: 1,
            })
          } else {
            foundTag.count += 1
          }
        })
      }
    })

    this.menuData = this.db.menus.map((menu: IMenu) => {
      let link = menu.link.replace(this.db.setting.domain, this.db.themeConfig.domain)

      const isSiteLink = menu.link.includes(this.db.setting.domain)
      if (isSiteLink) {
        link = `${link}${mode === 'preview' ? '/index.html' : ''}`
      }

      return {
        ...menu,
        link,
      }
    })
  }

  /**
   * Render the article list, excluding hidden articles.
   */
  public async renderPostList(extraPath?: string, mode?: string) {
    const { postPageSize, archivesPageSize } = this.db.themeConfig

    // Compatible: < v0.7.0
    const pageSize = extraPath === '/archives'
      ? archivesPageSize || DEFAULT_ARCHIVES_PAGE_SIZE
      : postPageSize || DEFAULT_POST_PAGE_SIZE

    const excludeHidePostsData = this.postsData.filter((item: IPostRenderData) => !item.hideInList)

    // If there is no article to render
    if (!excludeHidePostsData.length) {
      const renderData = {
        menus: this.menuData,
        posts: [],
        pagination: {
          prev: '',
          next: '',
        },
        themeConfig: this.db.themeConfig,
        site: {
          posts: excludeHidePostsData,
          tags: this.tagsData,
          customConfig: this.db.themeCustomConfig,
          utils: this.utils,
        },
      }
      let html = ''
      const renderTemplatePath = extraPath === '/archives'
        ? `${this.themePath}/templates/archives.ejs`
        : `${this.themePath}/templates/index.ejs`

      await ejs.renderFile(renderTemplatePath, renderData, {}, async (err: any, str) => {
        if (err) {
          console.log(err)
        }
        if (str) {
          html = str
        }
      })
      const renderPath = `${this.outputDir}${extraPath}/index.html`
      await fs.writeFileSync(renderPath, html)
    }

    for (let i = 0; i * pageSize < excludeHidePostsData.length; i += 1) {
      const renderData = {
        menus: this.menuData,
        posts: excludeHidePostsData.slice(i * pageSize, (i + 1) * pageSize),
        pagination: {
          prev: '',
          next: '',
        },
        themeConfig: this.db.themeConfig,
        site: {
          posts: excludeHidePostsData,
          tags: this.tagsData,
          customConfig: this.db.themeCustomConfig,
          utils: this.utils,
        },
      }

      let renderPath = `${this.outputDir}${extraPath}/index.html`

      if (i === 0 && excludeHidePostsData.length > pageSize) {
        fse.ensureDir(`${this.outputDir}${extraPath}/page`)

        renderData.pagination.next = `${this.db.themeConfig.domain}${extraPath}/page/2/${mode === 'preview' ? 'index.html' : ''}`
      } else if (i > 0 && excludeHidePostsData.length > pageSize) {
        fse.ensureDir(`${this.outputDir}${extraPath}/page/${i + 1}`)

        renderPath = `${this.outputDir}${extraPath}/page/${i + 1}/index.html`

        renderData.pagination.prev = i === 1
          ? `${this.db.themeConfig.domain}${extraPath}/${mode === 'preview' ? 'index.html' : ''}`
          : `${this.db.themeConfig.domain}${extraPath}/page/${i}/${mode === 'preview' ? 'index.html' : ''}`

        renderData.pagination.next = (i + 1) * pageSize < excludeHidePostsData.length
          ? `${this.db.themeConfig.domain}${extraPath}/page/${i + 2}/${mode === 'preview' ? 'index.html' : ''}`
          : ''
      } else {
        fse.ensureDir(`${this.outputDir}${extraPath}`)
      }

      let html = ''
      const renderTemplatePath = extraPath === '/archives'
        ? `${this.themePath}/templates/archives.ejs`
        : `${this.themePath}/templates/index.ejs`

      ejs.renderFile(renderTemplatePath, renderData, {}, async (err: any, str) => {
        if (err) {
          console.log(err)
        }
        if (str) {
          html = str
        }
      })

      console.log('👏  PostList Page:', renderPath)
      fs.writeFileSync(renderPath, html)
    }
  }

  /**
   * Render the article details page, including hidden articles.
   */
  async renderPostDetail() {
    for (let i = 0; i < this.postsData.length; i += 1) {
      const post: any = { ...this.postsData[i] }
      const excludeHidePostsData = this.postsData.filter((item: IPostRenderData) => !item.hideInList)

      if (!post.hideInList) {
        if (i < this.postsData.length - 1) {
          const nexPost = this.postsData.slice(i + 1, this.postsData.length).find((item: IPostRenderData) => !item.hideInList)
          if (nexPost) {
            post.nextPost = nexPost
          }
        }
        if (i > 0) {
          const prevPost = this.postsData.slice(0, i).reverse().find((item: IPostRenderData) => !item.hideInList)
          if (prevPost) {
            post.prevPost = prevPost
          }
        }
      }


      const renderData = {
        menus: this.menuData,
        post,
        themeConfig: this.db.themeConfig,
        commentSetting: this.db.commentSetting,
        site: {
          posts: excludeHidePostsData,
          tags: this.tagsData,
          customConfig: this.db.themeCustomConfig,
          utils: this.utils,
        },
      }
      let html = ''
      ejs.renderFile(`${this.themePath}/templates/post.ejs`, renderData, {}, async (err: any, str) => {
        if (err) {
          console.error('EJS Render Error', err)
        }
        if (str) {
          html = str
        }
      })

      const renderFolerPath = `${this.outputDir}/post/${post.fileName}`
      fse.ensureDirSync(renderFolerPath)
      fs.writeFileSync(`${renderFolerPath}/index.html`, html)
    }
  }

  /**
   * Render tags page
   */
  async renderTags() {
    await fse.ensureDir(`${this.outputDir}/tags`)
    const excludeHidePostsData = this.postsData.filter((item: IPostRenderData) => !item.hideInList)

    const renderData = {
      tags: this.tagsData,
      menus: this.menuData,
      themeConfig: this.db.themeConfig,
      site: {
        posts: excludeHidePostsData,
        tags: this.tagsData,
        customConfig: this.db.themeCustomConfig,
        utils: this.utils,
      },
    }

    const renderPath = `${this.outputDir}/tags/index.html`
    let html = ''
    await ejs.renderFile(`${this.themePath}/templates/tags.ejs`, renderData, {}, async (err: any, str) => {
      if (err) {
        console.log('❌', err)
      }
      if (str) {
        html = str
      }
    })
    console.log('👏  Tags Page:', renderPath)
    await fs.writeFileSync(renderPath, html)
  }

  /**
   * Render tag detail page
   */
  async renderTagDetail(mode?: string) {
    const usedTags = this.db.tags.filter((tag: ITag) => tag.used)
    const { postPageSize } = this.db.themeConfig
    const excludeHidePostsData = this.postsData.filter((item: IPostRenderData) => !item.hideInList)

    // Compatible: < v0.7.0
    const pageSize = postPageSize || DEFAULT_POST_PAGE_SIZE

    for (const usedTag of usedTags) {
      const posts = this.postsData.filter((post: IPostRenderData) => {
        return post.tags.find((tag: ITagRenderData) => tag.slug === usedTag.slug) && !post.hideInList
      })

      const currentTag = usedTag

      const tagFolderPath = `${this.outputDir}/tag/${currentTag.slug}`
      const tagDomainPath = `${this.db.themeConfig.domain}/tag/${currentTag.slug}/`
      fse.ensureDirSync(`${this.outputDir}/tag`)
      fse.ensureDirSync(tagFolderPath)

      for (let i = 0; i * pageSize < posts.length; i += 1) {
        const renderData = {
          tag: currentTag,
          menus: this.menuData,
          posts: posts.slice(i * pageSize, (i + 1) * pageSize),
          pagination: {
            prev: '',
            next: '',
          },
          themeConfig: this.db.themeConfig,
          site: {
            posts: excludeHidePostsData,
            tags: this.tagsData,
            customConfig: this.db.themeCustomConfig,
            utils: this.utils,
          },
        }

        // Paging
        let renderPath = `${tagFolderPath}/index.html`

        if (i === 0 && posts.length > pageSize) {
          fse.ensureDirSync(`${tagFolderPath}/page`)

          renderData.pagination.next = `${tagDomainPath}/page/2/${mode === 'preview' ? 'index.html' : ''}`
        } else if (i > 0 && posts.length > pageSize) {
          fse.ensureDirSync(`${tagFolderPath}/page/${i + 1}`)

          renderPath = `${tagFolderPath}/page/${i + 1}/index.html`

          renderData.pagination.prev = i === 1
            ? `${tagDomainPath}${mode === 'preview' ? '/index.html' : ''}`
            : `${tagDomainPath}/page/${i}/${mode === 'preview' ? 'index.html' : ''}`

          renderData.pagination.next = (i + 1) * pageSize < posts.length
            ? `${tagDomainPath}/page/${i + 2}/${mode === 'preview' ? 'index.html' : ''}`
            : ''
        }

        let html = ''
        ejs.renderFile(`${this.themePath}/templates/tag.ejs`, renderData, {}, async (err: any, str) => {
          if (str) {
            html = str
          }
        })
        console.log('👏  Tag Page:', renderPath)
        fs.writeFileSync(renderPath, html)
      }
    }
  }

  /**
   * Build CSS and write file
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
      let { css } = cssString

      // if have override
      const customConfig = this.db.themeCustomConfig
      const currentThemePath = path.join(this.appDir, 'themes', this.db.themeConfig.themeName)

      const styleOverridePath = path.join(currentThemePath, 'style-override.js')
      const existOverrideFile = await fse.pathExists(styleOverridePath)

      console.log('渲染 css 时', customConfig, currentThemePath, styleOverridePath, existOverrideFile)
      if (existOverrideFile) {
        // clean cache
        delete __non_webpack_require__.cache[__non_webpack_require__.resolve(styleOverridePath)]

        const generateOverride = __non_webpack_require__(styleOverridePath)
        const customCss = generateOverride(customConfig)
        console.log('customCss', customCss)
        css += customCss
      }

      await fs.writeFileSync(`${cssFolderPath}/main.css`, css)
    })
  }

  /**
   * Create CNAME file
   */
  async buildCname() {
    const cnamePath = `${this.outputDir}/CNAME`

    if (this.db.setting.cname) {
      await fs.writeFileSync(cnamePath, this.db.setting.cname)
    } else {
      await fse.removeSync(cnamePath)
    }
  }

  /**
   * Build Feed
   */
  async buildFeed() {
    const DEFAULT_FEED_COUNT = 10
    const feed = new Feed({
      title: this.db.themeConfig.siteName,
      description: this.db.themeConfig.siteDescription,
      id: this.db.themeConfig.domain,
      link: this.db.themeConfig.domain,
      image: `${this.db.themeConfig.domain}/images/avatar.png`,
      favicon: `${this.db.themeConfig.domain}/favicon.ico`,
      copyright: `All rights reserved ${(new Date()).getFullYear()}, ${this.db.themeConfig.siteName}`,
      feedLinks: {
        atom: `${this.db.themeConfig.domain}/atom.xml`,
      },
    })

    const postsData = this.postsData
      .filter((item: IPostRenderData) => !item.hideInList)
      .slice(0, this.db.themeConfig.feedCount || DEFAULT_FEED_COUNT)

    const feedFullText = (typeof this.db.themeConfig.feedFullText) === 'undefined' ? true : this.db.themeConfig.feedFullText

    postsData.forEach((post: IPostRenderData) => {
      feed.addItem({
        title: post.title,
        id: post.link,
        link: post.link,
        description: post.abstract,
        content: feedFullText ? post.content : post.abstract,
        image: post.feature,
        date: new Date(post.date),
      })
    })

    await fs.writeFileSync(`${this.outputDir}/atom.xml`, feed.atom1())
  }

  /**
   * Copy file to output folder
   */
  async copyFiles() {
    const postImageInputPath = `${this.appDir}/post-images`
    const postImageOutputPath = `${this.outputDir}/post-images`

    await fse.ensureDir(postImageOutputPath)
    await fse.copySync(postImageInputPath, postImageOutputPath)

    const imagesInputPath = `${this.appDir}/images`
    const imagesOutputPath = `${this.outputDir}/images`

    await fse.ensureDir(imagesOutputPath)
    await fse.copySync(imagesInputPath, imagesOutputPath)

    const mediaInputPath = `${this.themePath}/assets/media`
    const mediaOutputPath = `${this.outputDir}/media`

    await fse.ensureDir(mediaInputPath)
    await fse.copySync(mediaInputPath, mediaOutputPath)
  }

  async clearOutputFolder() {
    await fse.removeSync(`${this.outputDir}/images`)
    await fse.removeSync(`${this.outputDir}/media`)
    await fse.removeSync(`${this.outputDir}/page`)
    await fse.removeSync(`${this.outputDir}/post`)
    await fse.removeSync(`${this.outputDir}/post-images`)
    await fse.removeSync(`${this.outputDir}/styles`)
    await fse.removeSync(`${this.outputDir}/tag`)
  }
}
