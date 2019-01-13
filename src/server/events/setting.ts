import { ipcMain, Event } from 'electron'
import Setting from '../setting'
import { ISetting, IGitalkSetting } from '../interfaces/setting'

export default class SettingEvents {
  constructor(appInstance: any) {
    const settingInstance = new Setting(appInstance)

    ipcMain.removeAllListeners('setting-save')
    ipcMain.removeAllListeners('gitalk-setting-save')
    ipcMain.removeAllListeners('favicon-upload')
    ipcMain.removeAllListeners('avatar-upload')

    ipcMain.on('setting-save', async (event: Event, setting: ISetting) => {
      const data = await settingInstance.saveSetting(setting)
      event.sender.send('setting-saved', data)
    })

    ipcMain.on('gitalk-setting-save', async (event: Event, setting: IGitalkSetting) => {
      const data = await settingInstance.saveGitalkSetting(setting)
      event.sender.send('gitalk-setting-saved', data)
    })

    ipcMain.on('favicon-upload', async (event: Event, filePath: string) => {
      console.log('执行了上传图片', filePath)
      const data = await settingInstance.uploadFavicon(filePath)
      event.sender.send('favicon-uploaded', data)
    })

    ipcMain.on('avatar-upload', async (event: Event, filePath: string) => {
      console.log('执行了上传头像', filePath)
      const data = await settingInstance.uploadAvatar(filePath)
      event.sender.send('avatar-uploaded', data)
    })

  }

}
