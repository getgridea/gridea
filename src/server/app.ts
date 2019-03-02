import { BrowserWindow, app } from 'electron'
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
        postPageSize: 10,
        archivesPageSize: 50,
        siteName: '',
        siteDescription: '',
        footerInfo: 'Powered by Hve',
        showFeatureImage: true,
        domain: '',
        postUrlFormat: 'SLUG',
        tagUrlFormat: 'SLUG',
        dateFormat: 'YYYY-MM-DD',
      },
      themeCustomConfig: {},
      themes: [],
      setting: {
        platform: '',
        domain: '',
        repository: '',
        branch: '',
        username: '',
        email: '',
        token: '',
        cname: '',
      },
      commentSetting: {
        showComment: false,
        commentPlatform: 'gitalk',
        gitalkSetting: {
          clientId: '',
          clientSecret: '',
          repository: '',
          owner: '',
        },
        disqusSetting: {
          api: '',
          apikey: '',
          shortname: '',
        },
      },
    }

    this.checkDir()
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
    const themeCustomConfig = await themeInstance.getThemeCustomConfig()
    const currentThemeConfig = await themeInstance.getCurrentThemeCustomConfig()

    const settingInstance = new Setting(this)
    const setting = await settingInstance.getSetting()
    const commentSetting = await settingInstance.getCommentSetting()

    this.db = {
      posts,
      tags,
      menus,
      themeConfig,
      themeCustomConfig,
      themes,
      setting,
      commentSetting: commentSetting || this.db.commentSetting,
    }

    this.initEvents()
    return {
      ...this.db,
      currentThemeConfig,
      appDir: this.appDir,
    }
  }

  public renderHtml() {
    const renderer = new Renderer(this)
    console.log(renderer)
    // renderer.renderPostList()
  }

  public async saveSourceFolderSetting(sourceFolderPath: string = '') {
    try {
      const appConfigFolder = path.join(this.app.getPath('home'), '.hve-notes')
      const appConfigPath = path.join(appConfigFolder, 'config.json')
      const jsonString = `{"sourceFolder": "${sourceFolderPath || this.appDir}"}`

      await fse.writeFileSync(appConfigPath, jsonString)
      const appConfig = await fse.readJsonSync(appConfigPath)
      this.appDir = appConfig.sourceFolder

      return true
    } catch (e) {
      console.log(e)
      return false
    }
  }

  /**
   * Check if the hve-next folder exists, if it does not exist, it is initialized
   */
  private async checkDir() {
    // 检查是否有自定义文件夹配置，若有则加载对应的文件夹，若无则加载默认文件夹
    const appConfigFolder = path.join(this.app.getPath('home'), '.hve-notes')
    const appConfigPath = path.join(appConfigFolder, 'config.json')
    let defaultAppDir = path.join(this.app.getPath('documents'), 'hve-notes')
    defaultAppDir = defaultAppDir.replace(/\\/g, '/')

    try {
      if (!fse.pathExistsSync(appConfigFolder)) {
        await fse.mkdirSync(appConfigFolder)
        const jsonString = `{"sourceFolder": "${defaultAppDir}"}`
        await fse.writeFileSync(appConfigPath, jsonString)
      }

      const appConfig = await fse.readJsonSync(appConfigPath)
      this.appDir = appConfig.sourceFolder

      // 存在站点文件夹
      if (fse.pathExistsSync(this.appDir)) {

        // check if the images folder exists, if it does not exist, copy it from default-files
        const imagesPath = path.join(this.appDir, 'images')
        if (!fse.pathExistsSync(imagesPath)) {
          fse.copySync(
            path.join(__static, 'default-files', 'images'),
            imagesPath,
          )
        }

        // 检查 默认 theme 是不是包含 notes、fly、simple 主题
        this.checkTheme('notes')
        this.checkTheme('fly')
        this.checkTheme('simple')

        return
      } else {
        // 不存在站点文件夹
        this.appDir = defaultAppDir
        const jsonString = `{"sourceFolder": "${defaultAppDir}"}`
        await fse.writeFileSync(appConfigPath, jsonString)
        fse.mkdirSync(this.appDir)

        fse.copySync(
          path.join(__static, 'default-files'),
          path.join(this.appDir),
        )
      }
    } catch (e) {
      console.log('Error', e)
    } finally {
      this.initEvents()
    }

  }

  /**
   * 检查是否包含主题，若不包含，则将应用内主题初始化一份
   */
  private checkTheme(themeName: string): void {
    const themePath = path.join(this.appDir, 'themes', themeName)
    if (!fse.pathExistsSync(themePath)) {
      fse.copySync(
        path.join(__static, 'default-files', 'themes', themeName),
        themePath,
      )
    }
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

