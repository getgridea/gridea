import { ipcMain, Event } from 'electron'

export default class SiteEvents {
  constructor(appInstance: any) {
    /**
     * load site config and data
     */
    ipcMain.on('app-site-reload', async (event: Event) => {
      console.log('接收到了 reload 事件', appInstance, appInstance.loadSite())
      const result = await appInstance.loadSite()
      event.sender.send('app-site-loaded', result)
    })
    this.sayHello()
  }

  sayHello() {
    console.log('hello world')
  }
}