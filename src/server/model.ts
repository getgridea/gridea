import * as path from 'path'
import * as low from 'lowdb'
import * as FileSync from 'lowdb/adapters/FileSync'


export default class Model {
  appDir: string
  $site: any
  $posts: any
  $theme: any

  constructor(appInstance: any) {
    this.appDir = appInstance.appDir
    
    this.initDataStore()
  }

  private initDataStore(): void {
    const siteAdapter = new FileSync(path.join(this.appDir, 'config/site.json'))
    const site = low(siteAdapter)
    this.$site = site

    const postsAdapter = new FileSync(path.join(this.appDir, 'config/posts.json'))
    const posts = low(postsAdapter)
    this.$posts = posts

    const themeAdapter = new FileSync(path.join(this.appDir, 'config/theme.json'))
    const theme = low(themeAdapter)
    this.$theme = theme
  }

}

