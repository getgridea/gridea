import { ipcMain, Event } from 'electron'
import Renderer from '../renderer'

export default class RendererEvents {
  constructor(appInstance: any) {
    const renderer = new Renderer(appInstance)

    ipcMain.removeAllListeners('html-render')
    ipcMain.removeAllListeners('site-publish')

    ipcMain.on('html-render', async (event: Event, params: any) => {
      if (renderer.db.themeConfig.themeName) {
        await renderer.preview()
      }
      event.sender.send('html-rendered', null)
    })

    ipcMain.on('site-publish', async (event: Event, params: any) => {
      const result = await renderer.publish()
      event.sender.send('site-published', result)
    })

  }

}
