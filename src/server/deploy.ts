import simpleGit, { SimpleGit } from 'simple-git/promise'
import moment from 'moment'
import Model from './model'

export default class Deploy extends Model {
  outputDir: string = `${this.appDir}/output`

  git: SimpleGit

  remoteUrl = ''

  platformAddress = ''

  constructor(appInstance: any) {
    super(appInstance)
    
    const { setting } = this.db
    this.platformAddress = ({
      github: 'github.com',
      coding: 'git.coding.net',
    } as any)[setting.platform || 'github']
    this.remoteUrl = `https://${setting.username}:${setting.token}@${this.platformAddress}/${setting.username}/${setting.repository}.git`
    this.git = simpleGit(this.outputDir)
  }

  /**
   * Check whether the remote connection is normal
   */
  async remoteDetect() {
    const result = {
      success: true,
      message: '',
    }
    try {
      const { setting } = this.db
      let isRepo = false
      try {
        isRepo = await this.git.checkIsRepo()
      } catch (e) {
        console.log('Not a repo', e.message)
      }

      if (!setting.username || !setting.repository || !setting.token) {
        return {
          success: false,
          message: 'Username、repository、token is required',
        }
      }
      if (!isRepo) {
        await this.git.init()
        await this.git.addConfig('user.name', setting.username)
        await this.git.addConfig('user.email', setting.email)
      }

      await this.git.addRemote('origin', this.remoteUrl)
      await this.git.raw(['remote', 'set-url', 'origin', this.remoteUrl])
      const data = await this.git.listRemote([])
    } catch (e) {
      console.log('Test Remote Error: ', e.message)
      result.success = false
      result.message = e.message
    }
    return result
  }

  async publish() {
    this.db.themeConfig.domain = this.db.setting.domain
    let result = {
      success: true,
      message: '',
      localBranchs: {},
    }
    const isRepo = await this.git.checkIsRepo()
    console.log(isRepo)
    if (isRepo) {
      result = await this.commonPush()
    } else {
      result = await this.firstPush()
    }
    return result
  }

  async firstPush() {
    const { setting } = this.db
    let localBranchs = {}
    console.log('first push')

    try {
      await this.git.init()
      await this.git.addConfig('user.name', setting.username)
      await this.git.addConfig('user.email', setting.email)
      await this.git.add('./*')
      await this.git.commit('first commit')
      await this.git.addRemote('origin', this.remoteUrl)
      localBranchs = await this.checkCurrentBranch()
      await this.git.push('origin', setting.branch, { '--force': true })
      return {
        success: true,
        data: localBranchs,
        message: '',
        localBranchs,
      }
    } catch (e) {
      console.error(e)
      return {
        success: false,
        data: localBranchs,
        message: e.message,
        localBranchs,
      }
    }
  }

  async commonPush() {
    console.log('common push')
    const { setting } = this.db
    let localBranchs = {}
    try {
      const statusSummary = await this.git.status()
      console.log(statusSummary)
      await this.git.raw(['remote', 'set-url', 'origin', this.remoteUrl])

      if (statusSummary.modified.length > 0 || statusSummary.not_added.length > 0) {
        await this.git.add('./*')
        await this.git.commit(`update from gridea: ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
        localBranchs = await this.checkCurrentBranch()
        await this.git.push('origin', this.db.setting.branch, { '--force': true })
      } else {
        await this.checkCurrentBranch()
        await this.git.push('origin', this.db.setting.branch, { '--force': true })
      }
      return {
        success: true,
        data: localBranchs,
        message: '',
        localBranchs,
      }
    } catch (e) {
      console.log(e)
      return {
        success: false,
        message: e.message,
        data: localBranchs,
        localBranchs,
      }
    }
  }

  /**
   * Check whether the branch needs to be switched
   */
  async checkCurrentBranch() {
    const { setting } = this.db
    const currentBranch = (await this.git.revparse(['--abbrev-ref', 'HEAD']) || 'master').replace(/\n/g, '')
    let hasNewBranch = true
    console.log(currentBranch)

    const list = await this.git.branch([])
    list.all.forEach((item: string) => {
      if (item === setting.branch) {
        hasNewBranch = false
      }
    })

    if (currentBranch !== setting.branch) {
      if (hasNewBranch) {
        await this.git.checkout(['-b', setting.branch])
      } else {
        try {
          await this.git.deleteLocalBranch(setting.branch)
        } catch (e) {
          console.log(e)
        } finally {
          await this.git.checkout(['-b', setting.branch])
        }
      }
    }
    return {}
  }
}
