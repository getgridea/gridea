import { ipcMain, Event } from 'electron'
import Setting from '../setting'
import { ISetting, IGitalkSetting } from '../interfaces/setting'

export default class SettingEvents {
  constructor(appInstance: any) {
    const settingInstance = new Setting(appInstance)

    ipcMain.removeAllListeners('setting-save')
    ipcMain.removeAllListeners('gitalk-setting-save')

    ipcMain.on('setting-save', async (event: Event, setting: ISetting) => {
      const data = await settingInstance.saveSetting(setting)
      event.sender.send('setting-saved', data)
    })

    ipcMain.on('gitalk-setting-save', async (event: Event, setting: IGitalkSetting) => {
      const data = await settingInstance.saveGitalkSetting(setting)
      event.sender.send('gitalk-setting-saved', data)
    })

  }

}
