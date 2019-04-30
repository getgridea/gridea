const generateOverride = (params = {}) => {
  let result = ''

  // 侧边栏宽度 - sidebarWidth
  if (params.sidebarWidth && params.sidebarWidth !== '320px') {
    result += `
      .sidebar {
        width: ${params.sidebarWidth};
      }
      .main-container {
        margin-left: ${params.sidebarWidth};
      }
    `
  }

  // 菜单颜色 - menuColor
  if (params.menuColor && params.menuColor !== '#dee2e6') {
    result += `
      .sidebar .top-container .site-nav {
        color: ${params.menuColor};
      }
    `
  }

  // 封面图圆角 - featureBorderRadius
  if (params.featureBorderRadius && params.featureBorderRadius !== '3px') {
    result += `
      .post-item .right .feature-container {
        border-radius: ${params.featureBorderRadius};
      }
    `
  }

  // 内容区背景色 - contentBgColor
  if (params.contentBgColor && params.contentBgColor !== '#f8f9fa') {
    result += `
      body {
        background: ${params.contentBgColor};
      }
    `
  }

  if (params.customCss) {
    result += `
      ${params.customCss}
    `
  }


  console.log('result', result)

  return result
}

module.exports = generateOverride
