import { ipcMain, Event } from 'electron'
import Menus from '../menus'
import { IMenu } from '../interfaces/menu'

export default class MenuEvents {
  constructor(appInstance: any) {
    const menus = new Menus(appInstance)

    ipcMain.removeAllListeners('menu-delete')
    ipcMain.removeAllListeners('menu-deleted')
    ipcMain.removeAllListeners('menu-save')
    ipcMain.removeAllListeners('menu-saved')

    ipcMain.on('menu-delete', async (event: Event, menuName: string) => {
      const data = await menus.deleteMenu(menuName)
      event.sender.send('menu-deleted', data)
    })

    ipcMain.on('menu-save', async (event: Event, menu: IMenu) => {
      const data = await menus.saveMenu(menu)
      event.sender.send('menu-saved', data)
    })
  }
}
