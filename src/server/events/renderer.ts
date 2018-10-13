import { ipcMain, Event } from 'electron'
import Renderer from '../renderer'

export default class RendererEvents {
  constructor(appInstance: any) {
    const renderer = new Renderer(appInstance)

    ipcMain.on('html-render', async (event: Event, params: any) => {
      
      renderer.db.themeConfig.domain = renderer.outputDir // 预览时 domain 是输出目录

      if (renderer.db.themeConfig.themeName) {
        await renderer.formatPostsForRender()
        await renderer.buildCss()
        await renderer.renderPostList()
        await renderer.renderPostDetail()
      }
      event.sender.send('html-rendered', null)
    })

  }

}