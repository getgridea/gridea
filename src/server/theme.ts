import Model from './model'
import { ITheme } from './interfaces/theme'

export default class Theme extends Model {

  constructor(appInstance: any) {
    super(appInstance)
  }

  /**
   * 选择主题
   */
  async getThemeConfig() {
    const themeConfig = await this.$theme.get('config').value()
    return themeConfig
  }

  /**
   * 保存主题配置
   */
  public async saveThemeConfig(themeConfig: ITheme) {
    await this.$theme.set('config', themeConfig).write()
    return themeConfig
  }

}