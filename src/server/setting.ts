import Model from './model'
import { ISetting } from './interfaces/setting'

export default class Setting extends Model {

  constructor(appInstance: any) {
    super(appInstance)
  }

  getSetting() {
    const setting = this.$setting.get('config').value()
    return setting
  }

  public async saveSetting(setting: ISetting) {
    await this.$setting.set('config', setting).write()
    return true
  }

}
