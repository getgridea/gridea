import path from 'path'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { BrowserWindow } from 'electron'
import { IApplicationDb, IApplication } from './interfaces/application'

export default class Model {
  appDir: string

  $setting: any

  $posts: any

  $theme: any

  db: IApplicationDb

  mainWindow: BrowserWindow

  constructor(appInstance: IApplication) {
    this.appDir = appInstance.appDir
    this.db = appInstance.db
    this.mainWindow = appInstance.mainWindow

    this.initDataStore()
  }

  private initDataStore(): void {
    const settingAdapter = new FileSync(path.join(this.appDir, 'config/setting.json'))
    const setting = low(settingAdapter)
    this.$setting = setting

    const postsAdapter = new FileSync(path.join(this.appDir, 'config/posts.json'))
    const posts = low(postsAdapter)
    this.$posts = posts

    const themeAdapter = new FileSync(path.join(this.appDir, 'config/theme.json'))
    const theme = low(themeAdapter)
    this.$theme = theme
  }
}
