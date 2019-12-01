import { BrowserWindow } from 'electron'
import { IPostDb } from './post'
import { ITag } from './tag'
import { ITheme } from './theme'
import { IMenu } from './menu'
import { ICommentSetting } from './setting'
import { ISetting } from '../../interfaces/setting'

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
  commentSetting: ICommentSetting
  currentThemeConfig: any[]
}

export interface IApplication {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string
  db: IApplicationDb
}
