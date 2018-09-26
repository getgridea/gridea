import { BrowserWindow } from 'electron'
import * as fse from 'fs-extra'
import * as path from 'path'

type Setting = {
  mainWindow: BrowserWindow,
  app: any,
  baseDir: string,
}

export default class App {
  mainWindow: BrowserWindow
  app: any
  baseDir: string
  appDir: string

  constructor(setting: Setting) {
    this.mainWindow = setting.mainWindow
    this.app = setting.app
    this.baseDir = setting.baseDir
    this.appDir = path.join(this.app.getPath('documents'), 'hve-next')
    
    this.checkDir()
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
      path.join(__dirname, '..', 'default-themes'),
      path.join(this.appDir, 'themes')
    )
  }

}

