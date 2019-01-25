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
        },
        mac: {
          icon: './public/app-icons/logo-fang2.icns',
        },
        asar: false,
      },
    },
  },
}
