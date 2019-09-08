import { ipcMain, IpcMainEvent } from 'electron'
import { ITheme } from '../interfaces/theme'
import Theme from '../theme'

export default class ThemeEvents {
  constructor(appInstance: any) {
    const theme = new Theme(appInstance)

    ipcMain.removeAllListeners('theme-save')
    ipcMain.removeAllListeners('theme-saved')
    ipcMain.removeAllListeners('theme-custom-config-save')
    ipcMain.removeAllListeners('theme-custom-config-saved')

    ipcMain.on('theme-save', async (event: IpcMainEvent, themeConfig: ITheme) => {
      const config = await theme.saveThemeConfig(themeConfig)
      event.sender.send('theme-saved', config)
    })

    ipcMain.on('theme-custom-config-save', async (event: IpcMainEvent, config: any) => {
      const result = await theme.saveThemeCustomConfig(config)
      event.sender.send('theme-custom-config-saved', result)
    })
  }
}
