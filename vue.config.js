const path = require('path')

function resolve(dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: config => {
        config.module.rule('stylus').test(/\.styl$/).use('babel').loader('css-loader!stylus-loader?paths=node_modules/bootstrap-stylus/stylus/')
      },
      builderOptions: {
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
