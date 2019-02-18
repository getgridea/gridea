import { ipcMain, Event } from 'electron'

export default class SiteEvents {
  constructor(appInstance: any) {
    /**
     * load site config and data
     */
    ipcMain.removeAllListeners('app-site-reload')
    ipcMain.removeAllListeners('app-site-loaded')

    ipcMain.on('app-site-reload', async (event: Event, params: any) => {
      const result = await appInstance.loadSite({ siteFolder: params && params.siteFolder || '' })
      event.sender.send('app-site-loaded', result)
    })
  }
}
