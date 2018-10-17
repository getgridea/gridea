import { ipcMain, Event } from 'electron'

export default class SiteEvents {
  constructor(appInstance: any) {
    /**
     * load site config and data
     */
    ipcMain.removeAllListeners('app-site-reload')

    ipcMain.on('app-site-reload', async (event: Event) => {
      const result = await appInstance.loadSite()
      event.sender.send('app-site-loaded', result)
    })
  }
}