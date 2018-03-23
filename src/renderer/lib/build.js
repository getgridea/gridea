import Post from './util/post'
import Theme from './util/theme'
const post = new Post()
const theme = new Theme()

const fse = require('fs-extra')
const DB = require('../datastore')

class Build {
  async _build(type) {
    const posts = await DB.db
      .get('posts')
      .sortBy('data.date')
      .desc()
      .value()
    const pages = await DB.db
      .get('pages')
      .sortBy('data.index')
      .value()

    const setting = await DB.db.get('remote').value()
    const websiteConfig = await DB.site.get('config').value()
    const websiteMenus = await DB.site.get('menus').value()

    const sourcePath = setting.source
    const outputPath = `${sourcePath}/${type === 'preview' ? 'preview' : 'public'}`
    const domain = type === 'preview' ? `${sourcePath}/preview` : setting.domain

    const config = {
      website: {
        config: websiteConfig,
        title: websiteConfig.title,
        menus: websiteMenus,
      },
      templatePath: `${sourcePath}/theme/easy/layout`,
      outputPath: outputPath,
      domain: domain,
      pageSize: websiteConfig.pageSize,
    }
    console.log('...config...', config)

    // 渲染文章
    await fse.ensureDir(`${outputPath}/post`)
    await fse.emptyDir(`${outputPath}/post`)

    for (let p of posts) {
      await post.renderPost(p, config)
    }

    // 渲染列表页
    await post.renderPostList(posts, config)

    // 渲染单页
    await post.renderSinglePage(pages, config)

    // 编译 stylus
    const stylusPath = `${sourcePath}/theme/easy/source/stylus`
    const cssPath = `${outputPath}/css`
    await fse.ensureDir(`${outputPath}/css`)
    await fse.emptyDir(`${outputPath}/css`)
    await theme.renderStylus(stylusPath, cssPath)

    // 同步文章图片
    await fse.copySync(`${sourcePath}/post-images`, `${outputPath}/post-images`)
    // 同步头像
    await fse.copySync(`${sourcePath}/images`, `${outputPath}/images`)
  }

  async previewBuild() {
    await this._build('preview')
  }

  async publishBuild() {
    await this._build('publish')
  }
}

export default Build
