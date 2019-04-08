const generateOverride = (params = {}) => {
  let result = ''

  // 暗黑皮肤
  if (params.skin && params.skin !== 'white') {
    result += `
      body {
        color: #dee2e6;
      }
      body, .site-header-container, .menu-container {
        background: #212529;
      }
      a, .link {
        color: #e9ecef;
      }
      .site-header {
        box-shadow: inset 0px -1px 0px #495057;
      }
      .post-item .content .post-title {
        color: #e9ecef;
      }
      .post-item .content .post-abstract {
        color: #868e96;
      }
      .post-info {
        color: #495057;
      }
      .post-info a {
        color: #5978f3;
      }
      a.purple-link, .post-content a {
        background: linear-gradient(180deg, transparent 70%, #5978f3 0);
      }
      .post-detail .post-title {
        color: #e9ecef;
      }
      .post-content p, .post-content table, .post-content ul, .post-content ol {
        color: #dee2e6;
      }
      .post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6 {
        color: #e9ecef;
      }
      .post-detail .feature-container, .post-content img {
        box-shadow: none;
      }
      .post-content blockquote {
        background: #343a40;
        border-left: 2px solid #5978f3;
      }
      .post-content code {
        color: #e9ecef;
      }
      .post-content p code {
        background: #495057;
      }
      .post-content pre code {
        background: #000000;
      }
      .post-content pre code:after {
        color: #495057;
      }
      .hljs-keyword, .hljs-selector-tag, .hljs-subst {
        color: #d4bdbd;
      }
      .post-content tr {
        border-top: 1px solid #495057;
      }
      .post-content td, .post-content th {
        border: 1px solid #495057;
      }
    `
  }

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
      body {
        font-size: ${params.textSize};
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
