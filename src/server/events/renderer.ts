import { ipcMain, Event } from 'electron'
import Renderer from '../renderer'

export default class RendererEvents {
  constructor(appInstance: any) {
    const renderer = new Renderer(appInstance)

    ipcMain.removeAllListeners('html-render')
    ipcMain.removeAllListeners('html-rendered')
    ipcMain.removeAllListeners('site-publish')
    ipcMain.removeAllListeners('site-published')
    ipcMain.removeAllListeners('site-publish-fail')
    ipcMain.removeAllListeners('remote-detect')
    ipcMain.removeAllListeners('remote-detected')
    ipcMain.removeAllListeners('cdn-detect')
    ipcMain.removeAllListeners('cdn-detect-success')
    ipcMain.removeAllListeners('cdn-detect-fail')

    ipcMain.on('html-render', async (event: Event, params: any) => {
      if (renderer.db.themeConfig.themeName) {
        await renderer.preview()
      }
      event.sender.send('html-rendered', null)
    })

    ipcMain.on('site-publish', async (event: Event, params: any) => {
      try {
        const result = await renderer.publish()
        event.sender.send('site-published', result)
      } catch (error) {
        event.sender.send('site-publish-fail', error.message)
      }
    })

    ipcMain.on('remote-detect', async (event: Event, params: any) => {
      const result = await renderer.remoteDetect()
      event.sender.send('remote-detected', result)
    })

    ipcMain.on('cdn-detect', async (event: Event, params: any) => {
      renderer.cdnUpload().then((res) => {
        event.sender.send('cdn-detect-success', res)
      }).catch((err) => {
        event.sender.send('cdn-detect-fail', err.message)
      })
    })
  }
}
