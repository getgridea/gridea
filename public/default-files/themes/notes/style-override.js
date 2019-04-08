const generateOverride = (params = {}) => {
  let result = ''

  // 内容区最大宽度 - contentMaxWidth
  if (params.contentMaxWidth && params.contentMaxWidth !== '800px') {
    result += `
      .main {
        max-width: ${params.contentMaxWidth};
      }
    `
  }

  // 正文内容文字大小 - textSize
  if (params.textSize && params.textSize !== '16px') {
    result += `
      .post-detail .post .post-content p {
        font-size: ${params.textSize};
      }
    `
  }

  // 内容区背景色 - contentBgColor
  if (params.contentBgColor && params.contentBgColor !== '#ffffff') {
    result += `
      .main {
        background: ${params.contentBgColor};
      }
    `
  }

  // 网页背景色 - pageBgColor
  if (params.pageBgColor && params.pageBgColor !== '#ffffff') {
    result += `
      body {
        background: ${params.pageBgColor};
      }
    `
  }

  // 文字颜色 - textColor
  if (params.textColor && params.textColor !== '#333333') {
    result += `
      body {
        color: ${params.textColor};
      }
    `
  }
  
  // 链接颜色 - linkColor
  if (params.linkColor && params.linkColor !== '#333333') {
    result += `
      a {
        color: ${params.linkColor};
      }
    `
  }
  
  // 链接 Hover 颜色 - linkHoverColor
  if (params.linkHoverColor && params.linkHoverColor !== '#006CFF') {
    result += `
      a:hover {
        color: ${params.linkHoverColor};
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
