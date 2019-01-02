import { ipcMain, Event } from 'electron'
import Setting from '../setting'
import { ISetting } from '../interfaces/setting'

export default class SettingEvents {
  constructor(appInstance: any) {
    const settingInstance = new Setting(appInstance)

    ipcMain.removeAllListeners('setting-save')

    ipcMain.on('setting-save', async (event: Event, setting: ISetting) => {
      const data = await settingInstance.saveSetting(setting)
      event.sender.send('setting-saved', data)
    })

  }

}
