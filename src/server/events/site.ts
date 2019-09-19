import { ipcMain, IpcMainEvent } from 'electron'

export default class SiteEvents {
  constructor(appInstance: any) {
    /**
     * load site config and data
     */
    ipcMain.removeAllListeners('app-site-reload')
    ipcMain.removeAllListeners('app-site-loaded')
    ipcMain.removeAllListeners('app-source-folder-setting')
    ipcMain.removeAllListeners('app-source-folder-set')
    ipcMain.removeAllListeners('app-preview-server-port-get')
    ipcMain.removeAllListeners('app-preview-server-port-got')

    ipcMain.on('app-site-reload', async (event: IpcMainEvent, params: any) => {
      const result = await appInstance.loadSite()
      event.sender.send('app-site-loaded', result)
    })

    ipcMain.on('app-source-folder-setting', async (event: IpcMainEvent, params: string) => {
      const result = await appInstance.saveSourceFolderSetting(params)
      event.sender.send('app-source-folder-set', result)
    })

    ipcMain.on('app-preview-server-port-get', async (event: IpcMainEvent, params: string) => {
      const port = await appInstance.previewServer.get('port')
      event.sender.send('app-preview-server-port-got', port)
    })
  }
}
