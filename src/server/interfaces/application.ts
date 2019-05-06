import { BrowserWindow } from 'electron'
import { IPostDb } from './post'
import { ITag } from './tag'
import { ITheme } from './theme'
import { IMenu } from './menu'
import { ISetting, ICommentSetting } from './setting'

interface IThemeMore {
  version: string,
  name: string,
  author: string,
  [key: string]: string
}
export interface IApplicationSetting {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
}

export interface IApplicationDb {
  posts: IPostDb[]
  tags: ITag[]
  menus: IMenu[]
  themeConfig: ITheme
  themeCustomConfig: any
  themes: IThemeMore[]
  setting: ISetting
  commentSetting: ICommentSetting
}

export interface IApplication {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string
  db: IApplicationDb
}
