import { ipcMain, Event } from 'electron'
import { IPost } from '../interfaces/post'
import Posts from '../posts'
export default class PostEvents {
  constructor(appInstance: any) {
    ipcMain.on('app-post-list', (event: Event) => {
      // const post = new Post()
    })

    ipcMain.on('app-post-create', async (event: Event, post: IPost) => {
      const posts = new Posts(appInstance)
      const data = await posts.savePostToFile(post)
      event.sender.send('app-post-created', data)
    })
  }

}