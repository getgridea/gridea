export default class ContentHelper {
  localReg: RegExp

  domainReg: RegExp

  featureDomainReg: RegExp

  featureLocalReg: RegExp

  constructor() {
    this.localReg = /\(file.*\/post-images\//g
    this.domainReg = /\(.*\/post-images\//g
    this.featureDomainReg = /\.*\/post-images\//g
    this.featureLocalReg = /file.*\/post-images\//g
  }

  /**
   * 将文章中本地图片路径，变更为线上路径
   * @param content 内容
   * @param domainPath 线上路径
   */
  changeImageUrlLocalToDomain(content: string, domainPath: string) {
    domainPath = domainPath.replace(/\\/g, '/')
    return content.replace(this.localReg, `(${domainPath}/post-images/`)
  }

  /**
   * 将文章中线上图片路径，变更为本地路径
   * @param content 内容
   * @param localPath 本地路径
   */
  changeImageUrlDomainToLocal(content: string, localPath: string) {
    localPath = localPath.replace(/\\/g, '/')
    return content.replace(this.domainReg, `(file://${localPath}/post-images/`)
  }

  /**
   * 将 feature 图片路径，变更为本地路径
   */
  changeFeatureImageUrlDomainToLocal(content: string, localPath: string) {
    return content.replace(this.featureDomainReg, `file://${localPath}/post-images/`)
  }

  /**
   * 将 feature 本地图片路径，变更为线上路径
   */
  changeFeatureImageUrlLocalToDomain(content: string, domainPath: string) {
    let url = content.replace(this.featureLocalReg, `${domainPath}/post-images/`)
    url = url.replace(/\\/g, '/')
    return url
  }
}
