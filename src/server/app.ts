import { BrowserWindow } from 'electron'
import * as fse from 'fs-extra'
import * as path from 'path'
import EventClasses from './events/index'
import Posts from './posts'
import Tags from './tags'
import Theme from './theme'
import Renderer from './renderer'

import { IApplicationDb, Setting } from './interfaces/application'

export default class App {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string
  db: IApplicationDb

  constructor(setting: Setting) {
    this.mainWindow = setting.mainWindow
    this.app = setting.app
    this.baseDir = setting.baseDir
    this.appDir = path.join(this.app.getPath('documents'), 'hve-next')
    
    this.db = {
      posts: [],
      tags: [],
      themeConfig: {
        themeName: '',
        pageSize: 10,
        siteName: '',
        siteDescription: '',
        footerInfo: 'Powered by Hve',
        showFeatureImage: true,
        domain: '',
      },
    }
    
    this.checkDir()
    this.initEvents()
  }

  /**
   * Check if the hve-next folder exists, if it does not exist, it is initialized
   */
  private checkDir(): void {
    if (fse.pathExistsSync(this.appDir)) {
      return
    }

    fse.mkdirSync(this.appDir)
    fse.mkdirSync(path.join(this.appDir, 'config'))
    fse.mkdirSync(path.join(this.appDir, 'themes'))

    fse.copySync(
      path.join(__dirname, '..', 'default-themes'),
      path.join(this.appDir, 'themes')
    )
  }

  /**
   *  Load site config and data
   */
  public async loadSite() {
    const posts = new Posts(this)
    const postList = await posts.list()

    const tags = new Tags(this)
    const tagList = await tags.list()

    const theme = new Theme(this)
    const themeConfig = await theme.getThemeConfig()
    
    this.db = {
      posts: postList,
      tags: tagList,
      themeConfig: themeConfig,
    }

    this.initEvents()
    return this.db
  }

  private initEvents(): void {
    const classNames = Object.keys(EventClasses)
    for (const className of classNames) {
      new EventClasses[className](this)
    }
  }

  public renderHtml() {
    const renderer = new Renderer(this)
    console.log(renderer)
    // renderer.renderPostList()
  }

}

