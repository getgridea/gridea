import { ipcMain, Event } from 'electron'
import { IPost } from '../interfaces/post'

export default class PostController {
  constructor(appInstance: any) {
    ipcMain.on('app-post-list', (event: Event) => {
      // const post = new Post()
    })

    ipcMain.on('app-post-create', (event: Event, post: IPost) => {
      this.savePost(post)
    })
  }

  savePost(post: IPost) {
    console.log(post)
  }
}