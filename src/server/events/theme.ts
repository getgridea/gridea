import { ipcMain, Event } from 'electron'
import { ITheme } from '../interfaces/theme'
import Theme from '../theme'

export default class ThemeEvents {
  constructor(appInstance: any) {
    const theme = new Theme(appInstance)
    
    ipcMain.removeAllListeners('theme-save')

    ipcMain.on('theme-save', async (event: Event, themeConfig: ITheme) => {
      const config = await theme.saveThemeConfig(themeConfig)
      event.sender.send('theme-saved', config)
    })
  }

}