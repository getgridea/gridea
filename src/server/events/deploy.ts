import { ipcMain, IpcMainEvent } from 'electron'
import Deploy from '../deploy'
import Renderer from '../renderer'
import SftpDeploy from '../plugins/deploys/sftp'
import GitHubDeploy from '../plugins/deploys/github'
import NetlifyDeploy from '../plugins/deploys/netlify'

export default class DeployEvents {
  constructor(appInstance: any) {
    const { platform } = appInstance.db.setting
    
    const deploy = new Deploy(appInstance)
    const sftp = new SftpDeploy(appInstance)
    const github = new GitHubDeploy(appInstance)
    const netlify = new NetlifyDeploy(appInstance)
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
        'netlify': netlify,
      } as any)['netlify' || platform]
      
      // render
      console.time('site-publish-render')

      renderer.db.themeConfig.domain = renderer.db.setting.domain
      await renderer.renderAll()
      console.timeEnd('site-publish-render')
      
      // publish
      console.time('site-publish')
      const result = await client.publish(params.proxy)
      console.timeEnd('site-publish')
      event.sender.send('site-published', result)
    })

    ipcMain.on('remote-detect', async (event: IpcMainEvent, params: any) => {
      const client = ({
        'github': github,
        'coding': deploy,
        'sftp': sftp,
        'netlify': netlify,
      } as any)['netlify' || platform]

      const result = await client.remoteDetect(params.proxy)
      event.sender.send('remote-detected', result)
    })
  }
}
