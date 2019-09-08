import { ipcMain, IpcMainEvent } from 'electron'
import Tags from '../tags'
import { ITag } from '../interfaces/tag'

export default class TagEvents {
  constructor(appInstance: any) {
    const tags = new Tags(appInstance)

    ipcMain.removeAllListeners('tag-delete')
    ipcMain.removeAllListeners('tag-deleted')
    ipcMain.removeAllListeners('tag-save')
    ipcMain.removeAllListeners('tag-saved')

    ipcMain.on('tag-delete', async (event: IpcMainEvent, tagName: string) => {
      const data = await tags.deleteTag(tagName)
      event.sender.send('tag-deleted', data)
    })

    ipcMain.on('tag-save', async (event: IpcMainEvent, tag: ITag) => {
      const data = await tags.saveTag(tag)
      event.sender.send('tag-saved', data)
    })
  }
}
