const fs = require('fs')
const fse = require('fs-extra')
const junk = require('junk')
const pug = require('pug')
const matter = require('gray-matter')
const marked = require('marked')
const _ = require('lodash')
const moment = require('moment')
moment.locale('zh-cn')

const Promise = require('bluebird')
Promise.promisifyAll(fs)

class Post {
  constructor() {
    this.post = 'hve'
  }

  // 文章页
  async renderPost(post, config) {
    const contentHtml = marked(post.content, { breaks: true })
    const template = pug.compileFile(`${config.templatePath}/post.pug`, {
      filename: 'index.html',
      basedir: config.templatePath,
      pretty: true,
    })
    let postHtml = template({
      domain: config.domain,
      title: post.data.title,
      date: moment(post.data.date).format('MMMM Do YYYY, a'),
      content: contentHtml,
    })

    // 渲染评论
    const websiteConfig = config.website.config
    if (websiteConfig.gitmentOwner) {
      postHtml += `
        <script>
          var gitment = new Gitment({
            owner: '${websiteConfig.gitmentOwner}',
            repo: '${websiteConfig.gitmentRepo}',
              oauth: {
                client_id: '${websiteConfig.gitmentClientId}',
                client_secret: '${websiteConfig.gitmentClientSecret}',
              },
            })
            gitment.render('gitment-container')
        </script>
      `
    }
    console.log(postHtml)
    const html = await this._renderHtmlWithLayout(postHtml, config)
    await fs.writeFileAsync(`${config.outputPath}/post/${post.fileName}.html`, html)
  }

  // 页面
  async renderSinglePage(pages, config) {
    for (let page of pages) {
      const contentHtml = marked(page.content, { breaks: true })
      const template = pug.compileFile(`${config.templatePath}/page.pug`, {
        filename: 'index.html',
        basedir: config.templatePath,
        pretty: true,
      })
      const pageHtml = template({
        title: page.data.title,
        content: contentHtml,
      })
      const html = await this._renderHtmlWithLayout(pageHtml, config)
      fse.ensureDir(`${config.outputPath}/${page.linkName}`)
      await fs.writeFileAsync(`${config.outputPath}/${page.linkName}/index.html`, html)
    }
  }

  // 基本继承布局
  async _renderHtmlWithLayout(content, config) {
    const template = pug.compileFile(`${config.templatePath}/layout.pug`, {
      filename: 'index.html',
      basedir: config.templatePath,
      pretty: true,
    })
    const html = template({
      website: config.website,
      domain: config.domain,
      content: content,
    })
    return html
  }

  // 获取文章列表数据
  async getPostList(postPath) {
    const resultList = []
    const requestList = []
    let files = await fse.readdir(postPath)
    files = files.filter(junk.not)
    files.forEach((item) => {
      requestList.push(fs.readFileAsync(`${postPath}/${item}`, 'utf8'))
    })
    const results = await Promise.all(requestList)
    results.forEach((result, index) => {
      const post = matter(result)
      // 摘要
      post.abstract = (post.content).substring(0, post.content.indexOf('<!-- more -->'))
      post.fileName = files[index].substring(0, files[index].length - 3) // 有待优化!
      resultList.push(post)
    })
    console.log('resultList: ', resultList)
    return Promise.resolve(resultList)
  }

  // 获取页面数据
  async getPageList(pagePath) {
    const resultList = []
    const requestList = []
    let dirs = await fse.readdir(pagePath)
    dirs = dirs.filter(junk.not)
    dirs.forEach(dir => {
      requestList.push(fs.readFileAsync(`${pagePath}/${dir}/index.md`, 'utf8'))
    })
    const results = await Promise.all(requestList)
    results.forEach((result, index) => {
      const page = matter(result)
      page.linkName = dirs[index]
      resultList.push(page)
    })
    return Promise.resolve(resultList)
  }

  // 构建文章列表 - 带分页
  async renderPostList(postList, config) {
    const list = _.cloneDeep(postList).map(post => {
      post.data.date = moment(post.data.date).format('MMMM Do YYYY, a')
      if (typeof post.data.tags === 'string' && post.data.tags) {
        post.data.tags = post.data.tags.split(' ')
      } else {
        post.data.tags = post.data.tags || []
      }
      return post
    })
    const data = {
      domain: config.domain,
      articles: [],
      prevLink: '',
      nextLink: '',
    }
    // 分页
    const perPage = config.pageSize
    for (let i = 0, len = list.length; (i * perPage) < len; i = i + 1) {
      data.articles = list.slice(perPage * i, (i + 1) * perPage)
      if (i === 0) {
        data.prevLink = ''
      } else if (i === 1) {
        data.prevLink = `${config.domain}/index.html`
      } else {
        data.prevLink = `${config.domain}/page/${i}/index.html`
      }
      if (((i + 1) * perPage) >= len) {
        data.nextLink = ''
      } else {
        data.nextLink = `${config.domain}/page/${i + 2}/index.html`
      }
      let outputDir
      if (i === 0) {
        outputDir = `${config.outputPath}`
      } else {
        outputDir = `${config.outputPath}/page/${i + 1}`
      }
      await this._renderPostListHtml(config, data, outputDir)
    }
  }

  async _renderPostListHtml(config, data, outputDir) {
    const template = pug.compileFile(`${config.templatePath}/index.pug`, {
      filename: 'index.html',
      basedir: config.templatePath,
      pretty: true,
    })
    // 输出
    console.log('data: ', data)
    const postListHtml = template(data)
    const html = await this._renderHtmlWithLayout(postListHtml, config)

    await fse.ensureDir(outputDir)
    await fs.writeFileAsync(`${outputDir}/index.html`, html)
    console.log('成功')
  }
}

export default Post
