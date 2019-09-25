import { BrowserWindow, app } from 'electron'
import * as fse from 'fs-extra'
import * as path from 'path'
import express from 'express'
import EventClasses from './events/index'
import Posts from './posts'
import Tags from './tags'
import Menus from './menus'
import Theme from './theme'
import Renderer from './renderer'
import Setting from './setting'

import { IApplicationDb, IApplicationSetting } from './interfaces/application'
// eslint-disable-next-line
declare const __static: string;

export default class App {
  mainWindow: BrowserWindow;

  app: any;

  baseDir: string;

  appDir: string;

  previewServer: any;

  db: IApplicationDb;

  constructor(setting: IApplicationSetting) {
    this.mainWindow = setting.mainWindow
    this.app = setting.app
    this.baseDir = setting.baseDir
    this.appDir = path.join(this.app.getPath('documents'), 'gridea')
    this.previewServer = setting.previewServer

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
        footerInfo: 'Powered by Gridea',
        showFeatureImage: true,
        domain: '',
        postUrlFormat: 'SLUG',
        tagUrlFormat: 'SLUG',
        dateFormat: 'YYYY-MM-DD',
        feedFullText: true,
        feedCount: 10,
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
        valineSetting: {
          appId: '',
          appKey: '',
          placeholder: 'just go go',
          notify: false,
          verify: true,
          avatar: 'mp',
          pageSize: 10,
          visitor: false,
          highlight: false,
          recordIP: false,
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
    this.updateStaticServer()
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
      const appConfigFolder = path.join(this.app.getPath('home'), '.gridea')
      const appConfigPath = path.join(appConfigFolder, 'config.json')
      const jsonString = `{"sourceFolder": "${sourceFolderPath || this.appDir}"}`

      await fse.writeFileSync(appConfigPath, jsonString)
      const appConfig = await fse.readJsonSync(appConfigPath)
      this.appDir = appConfig.sourceFolder
      this.updateStaticServer()

      this.checkDir()

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
    // Check if there is a .hve-notes folder, if it exists, load it, otherwise use the default configuration.
    const appConfigFolderOld = path.join(this.app.getPath('home'), '.hve-notes') // < 0.7.7

    const appConfigFolder = path.join(this.app.getPath('home'), '.gridea')
    const appConfigPath = path.join(appConfigFolder, 'config.json')
    let defaultAppDir = path.join(this.app.getPath('documents'), 'Gridea')
    defaultAppDir = defaultAppDir.replace(/\\/g, '/')

    try {
      // if exist `.hve-notes` config folder, change folder name to `.gridea`
      try {
        if (!fse.pathExistsSync(appConfigFolder) && fse.pathExistsSync(appConfigFolderOld)) {
          await fse.renameSync(appConfigFolderOld, appConfigFolder)
        }
      } catch (e) {
        console.log('Rename Error: ', e)
      }

      if (!fse.pathExistsSync(appConfigFolder)) {
        await fse.mkdirSync(appConfigFolder)
        const jsonString = `{"sourceFolder": "${defaultAppDir}"}`
        await fse.writeFileSync(appConfigPath, jsonString)
      }

      const appConfig = await fse.readJsonSync(appConfigPath)
      this.appDir = appConfig.sourceFolder

      // Site folder exists
      if (fse.pathExistsSync(this.appDir)) {
        // Check if the `images`, `config`, 'output', `post-images`, 'posts', 'themes' folder exists, if it does not exist, copy it from default-files
        ['images', 'config', 'output', 'post-images', 'posts', 'themes'].forEach((folder: string) => {
          const folderPath = path.join(this.appDir, folder)
          if (!fse.pathExistsSync(folderPath)) {
            fse.copySync(
              path.join(__static, 'default-files', folder),
              folderPath,
            )
          }
        })

        // Check default theme folder if includes [notes、fly、simple、paper] themes
        this.checkTheme('notes')
        this.checkTheme('fly')
        this.checkTheme('simple')
        this.checkTheme('paper')

        return
      }

      // Site folder not exists
      this.appDir = defaultAppDir
      const jsonString = `{"sourceFolder": "${defaultAppDir}"}`
      await fse.writeFileSync(appConfigPath, jsonString)
      fse.mkdirSync(this.appDir)

      fse.copySync(
        path.join(__static, 'default-files'),
        path.join(this.appDir),
      )
    } catch (e) {
      console.log('Error', e)
    } finally {
      this.initEvents()
    }
  }

  /**
   * Check whether the theme is included, and if not, initialize one copy of the theme within the application.
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

  private updateStaticServer(): void {
    function removeMiddleware(route: any, i: number, routes: any) {
      if (route.handle.name === 'serveStatic') {
        routes.splice(i, 1)
        console.log('Preview server: Removed old static route')
      }
    }

    const routers = this.previewServer._router // eslint-disable-line no-underscore-dangle
    if (routers) {
      const routesStack = routers.stack
      routesStack.forEach(removeMiddleware)
    }
    this.previewServer.use(express.static(`${this.appDir}/output`))
    console.log(`Preview server: Static dir change to ${this.appDir}/output`)
  }

  private initEvents(): void {
    const {
      SiteEvents,
      PostEvents,
      TagEvents,
      MenuEvents,
      ThemeEvents,
      RendererEvents,
      SettingEvents,
    } = EventClasses

    const site = new SiteEvents(this)
    const post = new PostEvents(this)
    const tag = new TagEvents(this)
    const menu = new MenuEvents(this)
    const theme = new ThemeEvents(this)
    const renderer = new RendererEvents(this)
    const setting = new SettingEvents(this)
  }
}
