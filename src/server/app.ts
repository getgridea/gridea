import { BrowserWindow } from 'electron'
import * as fse from 'fs-extra'
import * as path from 'path'
import EventClasses from './events/index'
import Posts from './posts'
import Tags from './tags'
import Menus from './menus'
import Theme from './theme'
import Renderer from './renderer'
import Setting from './setting'

import { IApplicationDb, IApplicationSetting } from './interfaces/application'

export default class App {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string
  db: IApplicationDb

  constructor(setting: IApplicationSetting) {
    this.mainWindow = setting.mainWindow
    this.app = setting.app
    this.baseDir = setting.baseDir
    this.appDir = path.join(this.app.getPath('documents'), 'hve-next')
    
    this.db = {
      posts: [],
      tags: [],
      menus: [],
      themeConfig: {
        themeName: '',
        pageSize: 10,
        siteName: '',
        siteDescription: '',
        footerInfo: 'Powered by Hve',
        showFeatureImage: true,
        domain: '',
      },
      themes: [],
      setting: {
        domain: '',
        repository: '',
        branch: '',
        username: '',
        email: '',
        token: '',
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
      path.join(__dirname, '..', 'default-config'),
      path.join(this.appDir, 'config')
    )

    fse.copySync(
      path.join(__dirname, '..', 'default-themes'),
      path.join(this.appDir, 'themes')
    )
  }

  /**
   *  Load site config and data
   */
  public async loadSite() {
    const postsInstance = new Posts(this)
    const posts = await postsInstance.list()

    const tagsInstance = new Tags(this)
    const tags = await tagsInstance.list()

    const menusInstance = new Menus(this)
    const menus = await menusInstance.list()

    const themeInstance = new Theme(this)
    const themeConfig = await themeInstance.getThemeConfig()
    const themes = await themeInstance.getThemeList()

    const settingInstance = new Setting(this)
    const setting = await settingInstance.getSetting()
    
    this.db = {
      posts,
      tags,
      menus,
      themeConfig,
      themes,
      setting,
    }

    this.initEvents()
    return this.db
  }

  private initEvents(): void {
    const classNames = Object.keys(EventClasses)
    for (const className of classNames) {

      // tslint:disable-next-line
      new EventClasses[className](this)
    }
  }

  public renderHtml() {
    const renderer = new Renderer(this)
    console.log(renderer)
    // renderer.renderPostList()
  }

}

