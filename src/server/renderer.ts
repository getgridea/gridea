import * as fs from 'fs'
import * as Bluebird from 'bluebird'
Bluebird.promisifyAll(fs)
import * as fse from 'fs-extra'
import * as marked from 'marked'
import * as pug from 'pug'
import * as dayjs from 'dayjs'
import * as stylus from 'stylus'
import Model from './model'
import { IPostDb, IPostRenderData, ITagRenderData } from './interfaces/post'
import { ITag } from './interfaces/tag'


export default class Renderer extends Model {
  outputDir: string = `${this.appDir}/output`
  themePath: string = ''
  postsData: IPostRenderData[] = []

  constructor(appInstance: any)  {
    super(appInstance)

    this.loadConfig()
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
          content: marked(item.content, { breaks: true }),
          fileName: item.fileName,
          abstract: item.abstract,
          title: item.data.title,
          tags: this.db.tags
            .filter((tag: ITag) => currentTags.find(item => item === tag.name))
            .map((tag: ITag) => ({ ...tag, link: `${this.db.themeConfig.domain}/tag/${tag.slug}` })),
          date: dayjs(item.data.date).format('MMMM Do YYYY, a'),
          feature: item.data.feature || '',
          link: `${this.db.themeConfig.domain}/post/${item.fileName}`,
        }
        return result
      })
  }

  /**
   * 渲染文章列表
   */
  public async renderPostList() {
    const template = pug.compileFile(`${this.themePath}/templates/index.pug`, {
      pretty: true,
    })
    const { pageSize } = this.db.themeConfig

    for (let i = 0; i * pageSize < this.postsData.length; i += 1) {
      const renderData = {
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

      const html = template(renderData)
      console.log('👏  PostList Page:', renderPath)
      await fs.writeFileSync(renderPath, html)
    }
  }

  /**
   * 渲染文章详情页
   */
  async renderPostDetail() {
    const template = pug.compileFile(`${this.themePath}/templates/post.pug`, {
      pretty: true,
    })
    
    for (let i = 0; i < this.postsData.length; i += 1) {
      const post: any = { ...this.postsData[i] }
      if (i < this.postsData.length - 1) {
        post.nextPost = this.postsData[i + 1]
      }

      const html = template({
        post,
        themeConfig: this.db.themeConfig,
      })
      const renderFolerPath = `${this.db.themeConfig.domain}/post/${post.fileName}`
      await fse.ensureDir(renderFolerPath)
      await fs.writeFileSync(`${renderFolerPath}/index.html`, html)
    }
  }

  /**
   * 渲染标签详情页
   */
  async renderTagDetail() {
    const template = pug.compileFile(`${this.themePath}/templates/tag.pug`, {
      pretty: true,
    })

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
  
        const html = template(renderData)
        console.log('👏  Tag Page:', renderPath)
        await fs.writeFileSync(renderPath, html)
      }
    }
  }

  /**
   * 生成 CSS
   */
  async buildCss() {
    const stylusFilePath = `${this.themePath}/assets/styles/main.styl`
    const cssFolderPath = `${this.outputDir}/styles`
    
    await fse.ensureDir(cssFolderPath)
    
    const stylusString = await fs.readFileSync(stylusFilePath, 'utf8')

    await stylus.render(stylusString, { filename: `${this.themePath}/assets/styles/main.styl` }, async (err: any, cssString: string) => {
      if (err) {
        console.log(err)
      }
      console.log('cssString: ', cssString)
      await fs.writeFileSync(`${cssFolderPath}/main.css`, cssString)
    })
  }
}