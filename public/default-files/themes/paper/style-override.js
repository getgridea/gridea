const generateOverride = (params = {}) => {
  let result = ''

  // 内容区背景色 - contentBgColor
  if (params.contentBgColor && params.contentBgColor !== '#ffffff') {
    result += `
      .paper {
        background: ${params.contentBgColor};
      }
    `
  }

  // 导航栏背景色 - contentBgColor
  if (params.navBgColor && params.navBgColor !== '#ffffff') {
    result += `
      .navbar {
        background: ${params.navBgColor};
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
