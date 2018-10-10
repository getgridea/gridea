import { ipcMain, Event } from 'electron'
import Renderer from '../renderer'

export default class RendererEvents {
  constructor(appInstance: any) {
    const renderer = new Renderer(appInstance)

    ipcMain.on('html-render', async (event: Event, params: any) => {
      if (renderer.db.themeConfig.themeName) {
        await renderer.renderPost()
      }
      event.sender.send('html-rendered', null)
    })

  }

}