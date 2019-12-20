import * as fse from 'fs-extra'
import * as path from 'path'
import Model from './model'
import { ICommentSetting } from './interfaces/setting'
import { ISetting } from '../interfaces/setting'

export default class Setting extends Model {
  getSetting() {
    const setting = this.$setting.get('config').value()
    return setting
  }

  getGitalkSetting() {
    const setting = this.$setting.get('gitalk').value()
    return setting
  }

  getCommentSetting() {
    const setting = this.$setting.get('comment').value()
    return setting
  }

  public async saveSetting(setting: ISetting) {
    await this.$setting.set('config', setting).write()
    return true
  }

  public async saveCommentSetting(setting: ICommentSetting) {
    await this.$setting.set('comment', setting).write()
    return true
  }

  async uploadFavicon(filePath: string) {
    const faviconPath = path.join(this.appDir, 'favicon.ico')
    fse.copySync(filePath, faviconPath)
  }

  async uploadAvatar(filePath: string) {
    const avatarPath = path.join(this.appDir, 'images/avatar.png')
    fse.copySync(filePath, avatarPath)
  }
}
