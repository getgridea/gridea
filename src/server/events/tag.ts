import { ipcMain, Event } from 'electron'
import Tags from '../tags'
import { ITag } from '../interfaces/tag'

export default class TagEvents {
  constructor(appInstance: any) {
    const tags = new Tags(appInstance)

    ipcMain.on('tag-delete', async (event: Event, tagName: string) => {
      const data = await tags.deleteTag(tagName)
      event.sender.send('tag-deleted', data)
    })

    ipcMain.on('tag-save', async (event: Event, tag: ITag) => {
      const data = await tags.saveTag(tag)
      event.sender.send('tag-saved', data)
    })

  }

}