import { ipcMain, IpcMainEvent } from 'electron'
import Deploy from '../deploy'
import Renderer from '../renderer'

export default class DeployEvents {
  constructor(appInstance: any) {
    const deploy = new Deploy(appInstance)
    const renderer = new Renderer(appInstance)

    ipcMain.removeAllListeners('site-publish')
    ipcMain.removeAllListeners('site-published')
    ipcMain.removeAllListeners('remote-detect')
    ipcMain.removeAllListeners('remote-detected')

    ipcMain.on('site-publish', async (event: IpcMainEvent, params: any) => {
      // render
      renderer.db.themeConfig.domain = renderer.db.setting.domain
      await renderer.renderAll()
      
      // publish
      const result = await deploy.publish()
      event.sender.send('site-published', result)
    })

    ipcMain.on('remote-detect', async (event: IpcMainEvent, params: any) => {
      const result = await deploy.remoteDetect()
      event.sender.send('remote-detected', result)
    })
  }
}
