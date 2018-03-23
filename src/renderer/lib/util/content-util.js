class ContentUtil {
  constructor() {
    this.localReg = /\(file.*\/post-images\//g
    this.domainReg = /\(.*\/post-images\//g
  }

  formatLocalToDomain(content, path) {
    return content.replace(this.localReg, `(${path}/post-images/`)
  }

  formatDomainToLocal(content, path) {
    return content.replace(this.domainReg, `(file://${path}/post-images/`)
  }
}

export default ContentUtil
