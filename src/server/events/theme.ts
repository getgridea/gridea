import { ipcMain, Event } from 'electron'
import { ITheme } from '../interfaces/theme'
import Theme from '../theme'

export default class ThemeEvents {
  constructor(appInstance: any) {
    const theme = new Theme(appInstance)

    ipcMain.removeAllListeners('theme-save')
    ipcMain.removeAllListeners('theme-saved')
    ipcMain.removeAllListeners('theme-update')
    ipcMain.removeAllListeners('theme-update-success')
    ipcMain.removeAllListeners('theme-update-fail')
    ipcMain.removeAllListeners('theme-delete')
    ipcMain.removeAllListeners('theme-delete-success')
    ipcMain.removeAllListeners('theme-load')
    ipcMain.removeAllListeners('theme-load-success')
    ipcMain.removeAllListeners('theme-load-fail')
    ipcMain.removeAllListeners('theme-custom-config-save')
    ipcMain.removeAllListeners('theme-custom-config-saved')

    ipcMain.on('theme-save', async (event: Event, themeConfig: ITheme) => {
      const config = await theme.saveThemeConfig(themeConfig)
      event.sender.send('theme-saved', config)
    })

    ipcMain.on('theme-load', async (event: Event, address: string) => {
      theme.loadTheme(address).then((res) => {
        event.sender.send('theme-load-success', res)
      }).catch((err) => {
        event.sender.send('theme-load-fail', err)
      })
    })

    ipcMain.on('theme-update', async (event: Event, folder: string) => {
      theme.updateTheme(folder).then((res) => {
        event.sender.send('theme-update-success', res)
      }).catch((err) => {
        event.sender.send('theme-update-fail', err)
      })
    })

    ipcMain.on('theme-delete', (event: Event, folder: string) => {
      theme.deleteTheme(folder)
      event.sender.send('theme-delete-success')
    })

    ipcMain.on('theme-custom-config-save', async (event: Event, config: any) => {
      const result = await theme.saveThemeCustomConfig(config)
      event.sender.send('theme-custom-config-saved', result)
    })
  }
}
