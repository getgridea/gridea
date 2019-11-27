import { ipcMain, IpcMainEvent } from 'electron'
import Deploy from '../deploy'
import Renderer from '../renderer'
import SftpDeploy from '../plugins/deploys/sftp'

export default class DeployEvents {
  constructor(appInstance: any) {
    const { platform } = appInstance.db.setting
    
    const deploy = new Deploy(appInstance)
    const sftp = new SftpDeploy(appInstance)
    const renderer = new Renderer(appInstance)

    ipcMain.removeAllListeners('site-publish')
    ipcMain.removeAllListeners('site-published')
    ipcMain.removeAllListeners('remote-detect')
    ipcMain.removeAllListeners('remote-detected')

    ipcMain.on('site-publish', async (event: IpcMainEvent, params: any) => {
      const client = ({
        'github': deploy,
        'coding': deploy,
        'sftp': sftp,
      } as any)[platform]
      
      // render
      renderer.db.themeConfig.domain = renderer.db.setting.domain
      await renderer.renderAll()
      
      // publish
      const result = await client.publish()
      event.sender.send('site-published', result)
    })

    ipcMain.on('remote-detect', async (event: IpcMainEvent, params: any) => {
      const client = ({
        'github': deploy,
        'coding': deploy,
        'sftp': sftp,
      } as any)[platform]

      const result = await client.remoteDetect()
      event.sender.send('remote-detected', result)
    })
  }
}
