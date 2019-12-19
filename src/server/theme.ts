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
        const config = fse.readJSONSync(themeConfigPath)
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
      const config = fse.readJSONSync(themeConfigBackupPath)
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
    if (Object.keys(config).length > 0) {
      // Save the picture type configuration
      const toPath = path.join(this.appDir, 'themes', this.db.themeConfig.themeName, 'assets', 'media', 'images')
      const includedArrayTypeImages: string[] = []
  
      for (const configItem of this.db.currentThemeConfig) {
        const configValue = config[configItem.name]
  
        // Picture upload config type data need to upload image to folder
        if (configItem.type === 'picture-upload') {
          if (
            typeof configValue === 'string'
            && configValue !== configItem.value
            && !configValue.startsWith('/media/')
          ) {
            const extendName = configValue.split('.').pop()
            const fileName = `custom-${configItem.name}.${extendName}`
  
            fse.ensureDirSync(toPath)
            fse.copySync(configValue, path.join(toPath, fileName))
  
            // Change value to finally value
            config[configItem.name] = path.join('/', 'media', 'images', fileName)
          } else if (typeof configValue === 'undefined' || configValue === configItem.value) {
            const currentConfigValue = this.db.themeCustomConfig[configItem.name]
            if (currentConfigValue && currentConfigValue !== configItem.value) {
              const extendName = this.db.themeCustomConfig[configItem.name].split('.').pop()
              const fileName = `custom-${configItem.name}.${extendName}`
    
              fse.removeSync(path.join(toPath, fileName))
            }
          }
        }
  
        // Array config type data need to find image config to upload folder
        if (configItem.type === 'array') {
          for (let arrItemIndex = 0; arrItemIndex < configValue.length; arrItemIndex += 1) {
            const foundConfigItem = this.db.currentThemeConfig.find((i: any) => i.name === configItem.name)
            const arrayItemKeys = Object.keys(configValue[arrItemIndex])
  
            for (let keyIndex = 0; keyIndex < arrayItemKeys.length; keyIndex += 1) {
              const key = arrayItemKeys[keyIndex]
              const foundPictureTypeField = foundConfigItem.arrayItems.find((i: any) => i.name === key && i.type === 'picture-upload')
  
              if (foundPictureTypeField) {
                const fieldValue = configValue[arrItemIndex][key]
    
                if (
                  typeof fieldValue === 'string'
                  && fieldValue !== foundPictureTypeField.value
                  && !fieldValue.startsWith('/media/')
                ) {
                  const extendName = fieldValue.split('.').pop()
                  const fileName = `custom-array-${configItem.name}-${new Date().getTime()}-${key}.${extendName}`
    
                  fse.ensureDirSync(toPath)
                  fse.copySync(fieldValue, path.join(toPath, fileName))
    
                  // Change value to finally value
                  configValue[arrItemIndex][key] = path.join('/', 'media', 'images', fileName)
                  includedArrayTypeImages.push(configValue[arrItemIndex][key])
                } else if (typeof fieldValue === 'undefined' || fieldValue === foundPictureTypeField.value) {
                  console.log('run...')
                } else {
                  includedArrayTypeImages.push(fieldValue)
                }
              }
            }
          }
        }
      }
  
      // Remove unused array type config images
      const assetsFolderPath = path.join(this.appDir, 'themes', this.db.themeConfig.themeName, 'assets')
      const imagesFolderPath = path.join(assetsFolderPath, 'media', 'images')
      if (fse.existsSync(imagesFolderPath)) {
        const files = await fse.readdirSync(imagesFolderPath, { withFileTypes: true })
        const arrayTypeImages = files
          .filter(item => !item.isDirectory())
          .map(item => path.join('/', 'media', 'images', item.name))
          .filter(item => item.includes('custom-array'))
    
        arrayTypeImages.forEach((name: string) => {
          if (!includedArrayTypeImages.includes(name)) {
            fse.removeSync(path.join(assetsFolderPath, name))
          }
        })
      }
    }


    await this.$theme.set('customConfig', config).write()

    // Backup theme custom config
    const themeConfigBackupPath = path.join(this.appDir, 'config', `theme.${this.db.themeConfig.themeName}.config.json`)
    fse.writeJSONSync(themeConfigBackupPath, config)
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
      const themeConfig = fse.readJSONSync(themeConfigPath)
      if (themeConfig && themeConfig.customConfig) {
        return themeConfig.customConfig
      }
    }

    return []
  }
}
