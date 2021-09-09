import { ipcMain, IpcMainEvent } from 'electron'
import Deploy from '../deploy'
import Renderer from '../renderer'
import SftpDeploy from '../plugins/deploys/sftp'
import GitHubDeploy from '../plugins/deploys/github'

export default class DeployEvents {
  constructor(appInstance: any) {
    const { platform } = appInstance.db.setting
    
    const deploy = new Deploy(appInstance)
    const sftp = new SftpDeploy(appInstance)
    const github = new GitHubDeploy(appInstance)
    const renderer = new Renderer(appInstance)

    ipcMain.removeAllListeners('site-publish')
    ipcMain.removeAllListeners('site-published')
    ipcMain.removeAllListeners('remote-detect')
    ipcMain.removeAllListeners('remote-detected')

    ipcMain.on('site-publish', async (event: IpcMainEvent, params: any) => {
      const client = ({
        'github': github,
        'coding': deploy,
        'sftp': sftp,
      } as any)[platform]
      
      // render
      console.time('site-publish-render')

      renderer.db.themeConfig.domain = renderer.db.setting.domain
      await renderer.renderAll()
      console.timeEnd('site-publish-render')
      
      // publish
      console.time('site-publish')
      const result = await client.publish()
      console.timeEnd('site-publish')
      event.sender.send('site-published', result)
    })

    ipcMain.on('remote-detect', async (event: IpcMainEvent, params: any) => {
      const client = ({
        'github': github,
        'coding': deploy,
        'sftp': sftp,
      } as any)[platform]

      const result = await client.remoteDetect()
      event.sender.send('remote-detected', result)
    })
  }
}
