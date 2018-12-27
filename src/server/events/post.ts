import { ipcMain, Event } from 'electron'
import { IPost } from '../interfaces/post'
import Posts from '../posts'
export default class PostEvents {
  constructor(appInstance: any) {

    ipcMain.removeAllListeners('app-post-create')
    ipcMain.removeAllListeners('image-upload')

    const posts = new Posts(appInstance)

    ipcMain.on('app-post-create', async (event: Event, post: IPost) => {
      const data = await posts.savePostToFile(post)
      event.sender.send('app-post-created', data)
    })

    ipcMain.on('image-upload', async (event: Event, files: any[]) => {
      console.log('执行了上传图片', files)
      const data = await posts.uploadImages(files)
      event.sender.send('image-uploaded', data)
    })
  }

}