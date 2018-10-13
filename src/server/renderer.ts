import * as fs from 'fs'
import * as Bluebird from 'bluebird'
Bluebird.promisifyAll(fs)
import * as fse from 'fs-extra'
import * as marked from 'marked'
import * as pug from 'pug'
import * as dayjs from 'dayjs'
import * as stylus from 'stylus'
import Model from './model'
import { IPostDb } from './interfaces/post'


export default class Renderer extends Model {
  outputDir: string
  themePath: string
  postsData = []

  constructor(appInstance: any)  {
    super(appInstance)
    this.outputDir = `${this.appDir}/output`
    this.themePath = ''

    this.loadConfig()
  }

  /**
   * 加载配置
   */
  async loadConfig() {
    this.themePath = `${this.appDir}/themes/${this.db.themeConfig.themeName}`

    this.postsData = this.formatPosts(this.db.posts)
    
    await fse.ensureDir(`${this.appDir}/output`)
    await fse.ensureDir(`${this.appDir}/output/post`)
  }

  /**
   * 格式化文章数据
   */
  private formatPosts(posts: IPostDb[]): any {
    return posts.filter((item: IPostDb) => item.data.published)
      .map((item: IPostDb) => {
        const result = {
          content: marked(item.content, { breaks: true }),
          fileName: item.fileName,
          abstract: item.abstract,
          title: item.data.title,
          tags: item.data.tags.split(' '),
          date: dayjs(item.data.date).format('MMMM Do YYYY, a'),
          feature: item.data.feature || '',
        }
        return result
      })
  }

  /**
   * 渲染文章列表
   */
  public async renderPostList() {
    const postList = this.postsData
    const template = pug.compileFile(`${this.themePath}/templates/index.pug`, {
      pretty: true,
    })
    const { pageSize } = this.db.themeConfig

    for (let i = 0; i * pageSize < postList.length; i += 1) {
      const renderData = {
        posts: this.postsData.slice(i * pageSize, (i + 1) * pageSize),
        pagination: {
          prev: '',
          next: '',
        },
        themeConfig: this.db.themeConfig,
      }

      let renderPath = `${this.outputDir}/index.html`
      
      if (i === 0 && postList.length > pageSize) {
        await fse.ensureDir(`${this.outputDir}/page`)
        
        renderPath = `${this.outputDir}/index.html`
        renderData.pagination.next = `${this.outputDir}/page/2/`

      } else if (i > 0 && postList.length > pageSize) {
        await fse.ensureDir(`${this.outputDir}/page/${i + 1}`)
        
        renderPath = `${this.outputDir}/page/${i + 1}/index.html`
        
        renderData.pagination.prev = i === 1
          ? `${this.outputDir}/`
          : `${this.outputDir}/page/${i}/`

        renderData.pagination.next = (i + 1) * pageSize < postList.length
          ? `${this.outputDir}/page/${i + 2}/`
          : ''
      }

      const html = template(renderData)
      console.log('渲染啦', renderPath)
      await fs.writeFileSync(renderPath, html)
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