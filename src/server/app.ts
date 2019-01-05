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

declare const __static: string

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
    this.appDir = path.join(this.app.getPath('documents'), 'hve-notes')

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
        cname: '',
      },
      gitalkSetting: {
        showComment: false,
        clientId: '',
        clientSecret: '',
        repository: '',
        owner: '',
      },
    }

    this.checkDir()
    this.initEvents()
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
    const gitalkSetting = await settingInstance.getGitalkSetting()

    this.db = {
      posts,
      tags,
      menus,
      themeConfig,
      themes,
      setting,
      gitalkSetting: gitalkSetting || this.db.gitalkSetting,
    }

    this.initEvents()
    return {
      ...this.db,
      appDir: this.appDir,
    }
  }

  public renderHtml() {
    const renderer = new Renderer(this)
    console.log(renderer)
    // renderer.renderPostList()
  }

  /**
   * Check if the hve-next folder exists, if it does not exist, it is initialized
   */
  private checkDir(): void {
    if (fse.pathExistsSync(this.appDir)) {
      return
    }

    fse.mkdirSync(this.appDir)

    fse.copySync(
      path.join(__static, 'default-files'),
      path.join(this.appDir),
    )
  }

  private initEvents(): void {
    const SiteEvents = EventClasses.SiteEvents
    const site = new SiteEvents(this)

    const PostEvents = EventClasses.PostEvents
    const post = new PostEvents(this)

    const TagEvents = EventClasses.TagEvents
    const tag = new TagEvents(this)

    const MenuEvents = EventClasses.MenuEvents
    const menu = new MenuEvents(this)

    const ThemeEvents = EventClasses.ThemeEvents
    const theme = new ThemeEvents(this)

    const RendererEvents = EventClasses.RendererEvents
    const renderer = new RendererEvents(this)

    const SettingEvents = EventClasses.SettingEvents
    const setting = new SettingEvents(this)
  }

}

