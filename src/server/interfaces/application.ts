import { BrowserWindow } from 'electron'
import { IPost } from './post'
import { ITag } from './tag'
import { ITheme } from './theme'

export interface Setting {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
}

export interface IApplicationDb {
  posts: IPost[],
  tags: ITag[],
  themeConfig: ITheme,
}

export interface IApplication {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string
  db: IApplicationDb
}