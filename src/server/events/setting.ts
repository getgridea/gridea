import { ipcMain, IpcMainEvent } from 'electron'
import Setting from '../setting'
import { ISetting, ICommentSetting } from '../interfaces/setting'

export default class SettingEvents {
  constructor(appInstance: any) {
    const settingInstance = new Setting(appInstance)

    ipcMain.removeAllListeners('setting-save')
    ipcMain.removeAllListeners('setting-saved')
    ipcMain.removeAllListeners('comment-setting-save')
    ipcMain.removeAllListeners('comment-setting-saved')
    ipcMain.removeAllListeners('favicon-upload')
    ipcMain.removeAllListeners('favicon-uploaded')
    ipcMain.removeAllListeners('avatar-upload')
    ipcMain.removeAllListeners('avatar-uploaded')
    ipcMain.removeAllListeners('private-post-setting-save')
    ipcMain.removeAllListeners('private-post-setting-saved')
    ipcMain.on('setting-save', async (event: IpcMainEvent, setting: ISetting) => {
      const data = await settingInstance.saveSetting(setting)
      event.sender.send('setting-saved', data)
    })

    ipcMain.on('comment-setting-save', async (event: IpcMainEvent, setting: ICommentSetting) => {
      const data = await settingInstance.saveCommentSetting(setting)
      event.sender.send('comment-setting-saved', data)
    })

    ipcMain.on('favicon-upload', async (event: IpcMainEvent, filePath: string) => {
      console.log('执行了上传图片', filePath)
      const data = await settingInstance.uploadFavicon(filePath)
      event.sender.send('favicon-uploaded', data)
    })

    ipcMain.on('avatar-upload', async (event: IpcMainEvent, filePath: string) => {
      console.log('执行了上传头像', filePath)
      const data = await settingInstance.uploadAvatar(filePath)
      event.sender.send('avatar-uploaded', data)
    })
    ipcMain.on('private-post-setting-save', async (event, form) => {
      console.log(`private-post-setting-save:${JSON.stringify(form)}`)
      const data = await settingInstance.savePrivatePostSetting(form)
      event.sender.send('private-post-setting-saved', data)
    })
  }
}
