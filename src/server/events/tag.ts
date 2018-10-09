import { ipcMain, Event } from 'electron'
import Tags from '../tags'
export default class TagEvents {
  constructor(appInstance: any) {

    ipcMain.on('tag-delete', async (event: Event, tagValue: string) => {
      const tags = new Tags(appInstance)
      const data = await tags.deleteTag(tagValue)
      event.sender.send('tag-deleted', data)
    })
  }

}