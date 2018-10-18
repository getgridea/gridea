export default class ContentHelper {
  localReg: RegExp
  domainReg: RegExp
  featureReg: RegExp
  
  constructor() {
    this.localReg = /\(file.*\/post-images\//g
    this.domainReg = /\(.*\/post-images\//g
    this.featureReg = /\.*\/post-images\//g
  }

  /**
   * 将文章中本地图片路径，变更为线上路径
   * @param content 内容
   * @param domainPath 线上路径
   */
  changeImageUrlLocalToDomain(content: string, domainPath: string) {
    return content.replace(this.localReg, `(${domainPath}/post-images/`)
  }

  /**
   * 将文章中线上图片路径，变更为本地路径
   * @param content 内容
   * @param localPath 本地路径
   */
  changeImageUrlDomainToLocal(content: string, localPath: string) {
    return content.replace(this.domainReg, `(file://${localPath}/post-images/`)
  }

  /**
   * 将 feature 图片路径，变更为本地路径
   */
  changeFeatureImageUrlDomainToLocal(content: string, localPath: string) {
    return content.replace(this.featureReg, `file://${localPath}/post-images/`)
  }

}