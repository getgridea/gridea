import { ipcMain } from 'electron'
import Setting from '../setting'
// import { ITag } from '../interfaces/tag'

export default class TagEvents {
  constructor(appInstance: any) {
    const setting = new Setting(appInstance)
    console.log(setting)
    ipcMain.removeAllListeners('setting-delete')
    ipcMain.removeAllListeners('setting-save')

    // ipcMain.on('tag-delete', async (event: Event, tagName: string) => {
    //   const data = await tags.deleteTag(tagName)
    //   event.sender.send('tag-deleted', data)
    // })

    // ipcMain.on('tag-save', async (event: Event, tag: ITag) => {
    //   const data = await tags.saveTag(tag)
    //   event.sender.send('tag-saved', data)
    // })

  }

}