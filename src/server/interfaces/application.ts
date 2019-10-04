import { BrowserWindow } from 'electron'
import { IPostDb } from './post'
import { ITag } from './tag'
import { ITheme } from './theme'
import { IMenu } from './menu'
import { ISetting, ICommentSetting, IPrivatePostSetting } from './setting'

export interface IApplicationSetting {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  previewServer: any
}

export interface IApplicationDb {
  posts: IPostDb[]
  tags: ITag[]
  menus: IMenu[]
  themeConfig: ITheme
  themeCustomConfig: any
  themes: any[]
  setting: ISetting
  privatePostSetting: IPrivatePostSetting
  commentSetting: ICommentSetting
}

export interface IApplication {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string
  db: IApplicationDb
}
