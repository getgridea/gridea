import * as path from 'path'
import * as fse from 'fs-extra'
import junk from 'junk'
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
   * Get the theme list
   */
  async getThemeList() {
    let themes = await fse.readdir(this.themeDir)
    themes = themes.filter(junk.not)
    const result = await Promise.all(themes.map(async (item: string) => {
      const data = {
        folder: item,
        name: item,
        version: '',
        author: '',
        repository: '',
      }
      const themeConfigPath = path.join(this.themeDir, item, 'config.json')
      if (fse.existsSync(themeConfigPath)) {
        const config = await fse.readJSONSync(themeConfigPath)
        data.name = config.name
        data.version = config.version
        data.author = config.repository
        data.repository = config.repository
      }
      return data
    }))

    return result
  }

  /**
   * Get the theme configuration
   */
  async getThemeConfig() {
    this.themeConfig = await this.$theme.get('config').value()
    this.currentThemePath = path.join(this.appDir, 'themes', this.themeConfig.themeName)
    return this.themeConfig
  }

  /**
   * Save the theme configuration
   */
  public async saveThemeConfig(themeConfig: ITheme) {
    await this.$theme.set('config', themeConfig).write()

    // If there is a backup of the custom configuration, copy the backup to the custom configuration
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
   * Save the theme custom configuration
   */
  public async saveThemeCustomConfig(config: any) {
    // Save the picture type configuration
    for (const item of this.db.currentThemeConfig) {
      const value = config[item.name]
      if (item.type === 'picture-upload') {
        const toPath = path.join(this.appDir, 'themes', this.db.themeConfig.themeName, 'assets', 'media', 'images')
        
        if (typeof value === 'string' && value !== item.value && !value.startsWith('/media/')) {
          const extendName = value.split('.').pop()
          const fileName = `custom-${item.name}.${extendName}`
          fse.ensureDirSync(toPath)
          fse.copySync(value, path.join(toPath, fileName))
          config[item.name] = path.join('/', 'media', 'images', fileName)
        } else if (typeof value === 'undefined' || value === item.value) {
          const extendName = this.db.themeCustomConfig[item.name].split('.').pop()
          const fileName = `custom-${item.name}.${extendName}`
          fse.removeSync(path.join(toPath, fileName))
        }
      }
    }

    await this.$theme.set('customConfig', config).write()

    // Backup theme custom config
    const themeConfigBackupPath = path.join(this.appDir, 'config', `theme.${this.db.themeConfig.themeName}.config.json`)
    await fse.writeJSONSync(themeConfigBackupPath, config)
    return config
  }

  /**
   * Get the theme custom configuration
   */

  public async getThemeCustomConfig() {
    const config = await this.$theme.get('customConfig').value()
    return config
  }

  /**
   * Get current theme custom configuration
   */
  public async getCurrentThemeCustomConfig() {
    const themeConfigPath = path.join(this.currentThemePath, 'config.json')
    const existThemeConfigFile = await fse.pathExists(themeConfigPath)
    if (existThemeConfigFile) {
      const themeConfig = await fse.readJSONSync(themeConfigPath)
      if (themeConfig && themeConfig.customConfig) {
        return themeConfig.customConfig
      }
    }

    return []
  }
}
