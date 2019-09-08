import { ipcMain, IpcMainEvent } from 'electron'
import Renderer from '../renderer'

export default class RendererEvents {
  constructor(appInstance: any) {
    const renderer = new Renderer(appInstance)

    ipcMain.removeAllListeners('html-render')
    ipcMain.removeAllListeners('html-rendered')
    ipcMain.removeAllListeners('site-publish')
    ipcMain.removeAllListeners('site-published')
    ipcMain.removeAllListeners('remote-detect')
    ipcMain.removeAllListeners('remote-detected')

    ipcMain.on('html-render', async (event: IpcMainEvent, params: any) => {
      if (renderer.db.themeConfig.themeName) {
        await renderer.preview()
      }
      event.sender.send('html-rendered', null)
    })

    ipcMain.on('site-publish', async (event: IpcMainEvent, params: any) => {
      const result = await renderer.publish()
      event.sender.send('site-published', result)
    })

    ipcMain.on('remote-detect', async (event: IpcMainEvent, params: any) => {
      const result = await renderer.remoteDetect()
      event.sender.send('remote-detected', result)
    })
  }
}
