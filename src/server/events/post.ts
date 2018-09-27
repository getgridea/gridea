import { ipcMain, Event } from 'electron'
import { IPost } from '../interfaces/post'

export default class PostEvents {
  constructor(appInstance: any) {
    ipcMain.on('app-post-list', (event: Event) => {
      // const post = new Post()
    })

    ipcMain.on('app-post-create', (event: Event, post: IPost) => {
      const data = this.savePost(post)
      event.sender.send('app-post-created', data)
    })
  }

  savePost(post: IPost): IPost | null {
    console.log(post)
    const data = null
    return data
  }
}