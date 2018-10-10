import Model from './model'

export default class Renderer extends Model {
  outputDir: string

  constructor(appInstance: any)  {
    super(appInstance)
    this.outputDir = `${this.appDir}/output`
  }

  /**
   * 加载配置
   */
  loadConfig() {
    // TODO: 加载配置
  }

  /**
   * 渲染文章页面
   */
  public renderPost() {
    // const post = this.$posts.get('posts')

  }

}