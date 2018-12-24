import { BrowserWindow } from 'electron'
import { IPostDb } from './post'
import { ITag } from './tag'
import { ITheme } from './theme'
import { IMenu } from './menu'

export interface Setting {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
}

export interface IApplicationDb {
  posts: IPostDb[],
  tags: ITag[],
  menus: IMenu[],
  themeConfig: ITheme,
  themes: string[],
}

export interface IApplication {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string
  db: IApplicationDb
}