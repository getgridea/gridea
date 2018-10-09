import { ipcMain, Event } from 'electron'

export default class SiteEvents {
  constructor(appInstance: any) {
    /**
     * load site config and data
     */
    ipcMain.on('app-site-reload', async (event: Event) => {
      const result = await appInstance.loadSite()
      event.sender.send('app-site-loaded', result)
    })
    this.sayHello()
  }

  sayHello() {
    console.log('hello world')
  }
}