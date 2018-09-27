import { ipcMain } from 'electron'

export default class PostController {
  constructor(appInstance: any) {
    ipcMain.on('app-post-list', (event: any) => {
      // const post = new Post()
    })
  }
}