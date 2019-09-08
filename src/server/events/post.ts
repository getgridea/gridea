import { ipcMain, IpcMainEvent } from 'electron'
import { IPost, IPostDb } from '../interfaces/post'
import Posts from '../posts'

export default class PostEvents {
  constructor(appInstance: any) {
    ipcMain.removeAllListeners('app-post-create')
    ipcMain.removeAllListeners('app-post-created')
    ipcMain.removeAllListeners('app-post-delete')
    ipcMain.removeAllListeners('app-post-deleted')
    ipcMain.removeAllListeners('app-post-list-delete')
    ipcMain.removeAllListeners('app-post-list-deleted')
    ipcMain.removeAllListeners('image-upload')
    ipcMain.removeAllListeners('image-uploaded')

    const posts = new Posts(appInstance)

    ipcMain.on('app-post-create', async (event: IpcMainEvent, post: IPost) => {
      const data = await posts.savePostToFile(post)
      event.sender.send('app-post-created', data)
    })

    ipcMain.on('app-post-delete', async (event: IpcMainEvent, post: IPostDb) => {
      const data = await posts.deletePost(post)
      event.sender.send('app-post-deleted', data)
    })

    ipcMain.on('app-post-list-delete', async (event: IpcMainEvent, postList: IPostDb[]) => {
      let data: any = false
      for (const post of postList) {
        data = posts.deletePost(post)
      }

      event.sender.send('app-post-list-deleted', data)
    })

    ipcMain.on('image-upload', async (event: IpcMainEvent, files: any[]) => {
      console.log('执行了上传图片', files)
      const data = await posts.uploadImages(files)
      event.sender.send('image-uploaded', data)
    })
  }
}
