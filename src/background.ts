import {
  app, protocol, BrowserWindow, Menu, shell,
} from 'electron'
import {
  createProtocol,
} from 'vue-cli-plugin-electron-builder/lib'
import { autoUpdater } from 'electron-updater'
import { init } from '@sentry/electron/dist/main'
import App from './server/app'
import messages from './assets/locales-menu'
import initServer from './server'

init({ dsn: 'https://6a6dacc57a6a4e27a88eb31596c152f8@sentry.io/1887150' })

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: any
let menu: Menu
let httpServer: any

// Standard scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])
function createWindow() {
  // Create the browser window.
  const winOption: any = {
    width: 1200,
    height: 800,
    minHeight: 642,
    minWidth: 1000,
    webPreferences: {
      webSecurity: false, // FIXED: Not allowed to load local resource
      nodeIntegration: true,
    },
    // frame: false, // 去除默认窗口栏
    titleBarStyle: 'hiddenInset' as ('hidden' | 'default' | 'hiddenInset' | 'customButtonsOnHover' | undefined),
  }

  if (process.platform !== 'darwin') {
    winOption.icon = `${__dirname}/app-icons/gridea.png`
  }
  
  win = new BrowserWindow(winOption)
  win.setTitle('Gridea')

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) { win.webContents.openDevTools() }
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdater.checkForUpdatesAndNotify()
  }

  win.on('closed', () => {
    win = null
  })

  const locale: string = app.getLocale() || 'zh-CN'
  const menuLabels = messages[locale] || messages['zh-CN']
  // menu
  const template: any = [
    {
      label: menuLabels.edit,
      submenu: [
        {
          label: menuLabels.save,
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            win.webContents.send('click-menu-save')
          },
        },
        { type: 'separator' },
        { role: 'undo', label: menuLabels.undo },
        { role: 'redo', label: menuLabels.redo },
        { type: 'separator' },
        { role: 'cut', label: menuLabels.cut },
        { role: 'copy', label: menuLabels.copy },
        { role: 'paste', label: menuLabels.paste },
        { role: 'delete', label: menuLabels.delete },
        { role: 'selectall', label: menuLabels.selectall },
        { role: 'toggledevtools', label: menuLabels.toggledevtools },
        { type: 'separator' },
        { role: 'close', label: menuLabels.close },
        { role: 'quit', label: menuLabels.quit },
      ],
    },
    {
      role: 'windowMenu',
    },
    {
      role: menuLabels.help,
      submenu: [
        {
          label: 'Learn More',
          click() { shell.openExternal('https://github.com/getgridea/gridea') },
        },
      ],
    },
  ]

  menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  const s = initServer()
  httpServer = s.server

  const setting = {
    mainWindow: win,
    app,
    baseDir: __dirname,
    previewServer: s.app,
  }

  // Init app
  const appInstance = new App(setting)
  console.log('Main process runing...', appInstance.appDir) // DELETE ME
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  httpServer && httpServer.close()
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   await installVueDevtools()
  // }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// ipcMain.on('min-window', () => {
//   if (win) {
//     win.minimize()
//   }
// })

// ipcMain.on('max-window', () => {
//   if (win) {
//     if (win.isMaximized()) {
//       win.unmaximize()
//     } else {
//       win.maximize()
//     }
//   }
// })

// ipcMain.on('close-window', () => {
//   if (win) {
//     win.close()
//   }
// })

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
