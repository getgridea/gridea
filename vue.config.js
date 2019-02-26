const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        productName: 'Hve Notes',
        win: {
          icon: './public/app-icons/logo.ico',
          // target: [
          //   {
          //     target: 'nsis',
          //     arch: [
          //       'ia32',
          //       'x64',
          //     ],
          //   },
          // ],
        },
        mac: {
          icon: './public/app-icons/logo-fang2.icns',
        },
        asar: false,
        nsis: {
          oneClick: false, // 是否一键安装
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true,// 创建开始菜单图标
          shortcutName: 'Hve Notes', // 图标名称
        },
      },
    },
  },
}
