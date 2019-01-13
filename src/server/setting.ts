import * as fse from 'fs-extra'
import * as path from 'path'
import Model from './model'
import { ISetting, IGitalkSetting } from './interfaces/setting'

export default class Setting extends Model {

  constructor(appInstance: any) {
    super(appInstance)
  }

  getSetting() {
    const setting = this.$setting.get('config').value()
    return setting
  }

  getGitalkSetting() {
    const setting = this.$setting.get('gitalk').value()
    return setting
  }

  public async saveSetting(setting: ISetting) {
    await this.$setting.set('config', setting).write()
    return true
  }

  public async saveGitalkSetting(setting: IGitalkSetting) {
    await this.$setting.set('gitalk', setting).write()
    return true
  }

  async uploadFavicon(filePath: string) {
    const faviconPath = path.join(this.appDir, 'output/favicon.ico')
    await fse.copySync(filePath, faviconPath)
  }

  async uploadAvatar(filePath: string) {
    const avatarPath = path.join(this.appDir, 'images/avatar.png')
    await fse.copySync(filePath, avatarPath)
  }

}
