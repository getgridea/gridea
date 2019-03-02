import * as path from 'path'
import * as fse from 'fs-extra'
// tslint:disable-next-line
const junk = require('junk')
import Model from './model'
import { ITheme } from './interfaces/theme'

export default class Theme extends Model {
  themeDir: string
  themeList: string[]
  themeConfig: any
  currentThemePath = ''

  constructor(appInstance: any) {
    super(appInstance)
    this.themeDir = path.join(this.appDir, 'themes')
    this.themeConfig = {}
    this.themeList = []
  }

  /**
   * 获取主题列表
   */
  async getThemeList() {
    let themes = await fse.readdir(this.themeDir)
    themes = themes.filter(junk.not)
    return themes
  }

  /**
   * 获取主题配置
   */
  async getThemeConfig() {
    this.themeConfig = await this.$theme.get('config').value()
    this.currentThemePath = path.join(this.appDir, 'themes', this.themeConfig.themeName)
    return this.themeConfig
  }

  /**
   * 保存主题配置
   */
  public async saveThemeConfig(themeConfig: ITheme) {
    await this.$theme.set('config', themeConfig).write()

    // 如果有自定义配置的备份，则复制备份到自定义配置
    const themeConfigBackupPath = path.join(this.appDir, 'config', `theme.${themeConfig.themeName}.config.json`)
    const existThemeConfigBackupFile = await fse.pathExists(themeConfigBackupPath)
    if (existThemeConfigBackupFile) {
      const config = await fse.readJSONSync(themeConfigBackupPath)
      await this.$theme.set('customConfig', config).write()
    } else {
      await this.$theme.set('customConfig', {}).write()
    }
    return themeConfig
  }

  /**
   * 保存主题自定义配置
   */
  public async saveThemeCustomConfig(config: any) {
    await this.$theme.set('customConfig', config).write()

    // Backup theme custom config
    console.log(this.db.themeConfig.themeName)
    const themeConfigBackupPath = path.join(this.appDir, 'config', `theme.${this.db.themeConfig.themeName}.config.json`)
    await fse.writeJSONSync(themeConfigBackupPath, config)
    return config
  }

  /**
   * 获取主题自定义配置
   */

  public async getThemeCustomConfig() {
    const config = await this.$theme.get('customConfig').value()
    return config
  }

  /**
   * 获取当前主题自定义配置项
   */
  public async getCurrentThemeCustomConfig() {
    const themeConfigPath = path.join(this.currentThemePath, 'config.json')
    const existThemeConfigFile = await fse.pathExists(themeConfigPath)
    if (existThemeConfigFile) {
      const themeConfig = await fse.readJSONSync(themeConfigPath)
      console.log(themeConfig)
      if (themeConfig && themeConfig.customConfig) {
        return themeConfig.customConfig
      }
    }

    return []
  }

}
