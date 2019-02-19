import { ipcMain, Event } from 'electron'

export default class SiteEvents {
  constructor(appInstance: any) {
    /**
     * load site config and data
     */
    ipcMain.removeAllListeners('app-site-reload')
    ipcMain.removeAllListeners('app-site-loaded')
    ipcMain.removeAllListeners('app-source-folder-setting')
    ipcMain.removeAllListeners('app-source-folder-set')

    ipcMain.on('app-site-reload', async (event: Event, params: any) => {
      const result = await appInstance.loadSite()
      event.sender.send('app-site-loaded', result)
    })

    ipcMain.on('app-source-folder-setting', async (event: Event, params: string) => {
      const result = await appInstance.saveSourceFolderSetting(params)
      event.sender.send('app-source-folder-set', result)
    })
  }
}
