import * as fs from 'fs'
import * as Bluebird from 'bluebird'
Bluebird.promisifyAll(fs)
import * as fse from 'fs-extra'
import * as marked from 'marked'
import * as pug from 'pug'
import * as dayjs from 'dayjs'
import Model from './model'
import { IPostDb } from './interfaces/post'


export default class Renderer extends Model {
  outputDir: string
  themePath: string

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
    this.themePath = `${this.appDir}/themes/${this.db.themeConfig.themeName}/layout`
    
    await fse.ensureDir(`${this.appDir}/output`)
    await fse.ensureDir(`${this.appDir}/output/post`)
  }

  /**
   * 渲染完整内容
   */
  private renderHtml(content: string): string {
    const template = pug.compileFile(`${this.themePath}/layout.pug`, {
      filename: 'index.html',
      basedir: this.themePath,
      pretty: true,
    })
    const html = template({
      themeConfig: this.db.themeConfig,
      domain: '',
      content: content,
    })
    return html
  }

  /**
   * 渲染文章页面
   */
  public async renderPost() {
    const posts = await this.$posts.get('posts').value()
    const htmlList: any = []
    
    posts.forEach((post: IPostDb) => {
      const contentHtml = marked(post.content, { breaks: true })
      const template = pug.compileFile(`${this.themePath}/post.pug`, {
        filename: 'index.html',
        basedir: this.themePath,
        pretty: true,
      })

      const postHtml = template({
        title: post.data.title,
        date: dayjs(post.data.date).format('MMMM Do YYYY, a'),
        content: contentHtml,
      })
      const html = this.renderHtml(postHtml)
      htmlList.push(html)
    })
    for (const i in posts) {
      await fs.writeFileSync(`${this.outputDir}/post/${posts[i].fileName}.html`, htmlList[i])
    }
    return true
  }

}