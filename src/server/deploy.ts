import fs from 'fs'
import moment from 'moment'
// @ts-ignore
import Model from './model'
import GitProxy from './plugins/deploys/gitproxy'

// const git = require('isomorphic-git')

const git: any = {}

export default class Deploy extends Model {
  outputDir: string = this.buildDir

  remoteUrl = ''

  platformAddress = ''

  http = new GitProxy(this)

  constructor(appInstance: any) {
    super(appInstance)
    const { setting } = this.db
    this.platformAddress = ({
      github: 'github.com',
      coding: 'e.coding.net',
      gitee: 'gitee.com',
    } as any)[setting.platform || 'github']

    const preUrl = ({
      github: `${setting.username}:${setting.token}`,
      coding: `${setting.tokenUsername}:${setting.token}`,
      gitee: `${setting.username}:${setting.token}`,
    } as any)[setting.platform || 'github']

    this.remoteUrl = `https://${preUrl}@${this.platformAddress}/${setting.username}/${setting.repository}.git`
  }

  /**
   * Check whether the remote connection is normal
   */
  async remoteDetect() {
    const result = {
      success: true,
      message: [''],
    }
    try {
      const { setting } = this.db
      let isRepo = false
      try {
        await git.currentBranch({ fs, dir: this.outputDir })
        isRepo = true
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
        await git.init({ fs, dir: this.outputDir })
        await git.setConfig({
          fs,
          dir: this.outputDir,
          path: 'user.name',
          value: setting.username,
        })
        await git.setConfig({
          fs,
          dir: this.outputDir,
          path: 'user.email',
          value: setting.email,
        })
      }

      await git.addRemote({
        fs, dir: this.outputDir, remote: 'origin', url: this.remoteUrl, force: true,
      })
      const info = await git.getRemoteInfo({
        http: this.http,
        url: this.remoteUrl,
      })
      console.log('info', info)
      result.message = info.capabilities
    } catch (e) {
      console.log('Test Remote Error: ', e)
      result.success = false
      result.message = e.message
    }
    return result
  }

  async publish() {
    await this.remoteDetect()
    this.db.themeConfig.domain = this.db.setting.domain
    let result = {
      success: true,
      message: '',
      localBranchs: {},
    }
    let isRepo = false
    try {
      await git.currentBranch({ fs, dir: this.outputDir })
      isRepo = true
    } catch (e) {
      console.log('Not a repo', e.message)
    }
    if (isRepo) {
      result = await this.commonPush()
    } else {
      // result = await this.firstPush()
    }
    return result
  }

  async commonPush() {
    console.log('common push')
    const { setting } = this.db
    const localBranchs = {}
    try {
      const statusSummary = await git.status({ fs, dir: this.outputDir, filepath: '.' })
      console.log('statusSummary', statusSummary)
      await git.addRemote({
        fs, dir: this.outputDir, remote: 'origin', url: this.remoteUrl, force: true,
      })

      if (statusSummary !== 'unmodified') {
        await git.add({ fs, dir: this.outputDir, filepath: '.' })
        await git.commit({
          fs,
          dir: this.outputDir,
          message: `update from gridea: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
        })
      }

      await this.checkCurrentBranch()

      const pushRes = await git.push({
        fs,
        http: this.http,
        dir: this.outputDir,
        remote: 'origin',
        ref: setting.branch,
        force: true,
      })
      console.log('pushRes', pushRes)
      return {
        success: true,
        data: pushRes,
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
   * Check whether the branch needs to be switched,
   * FIXME: if branch is change, then the fist push is not work. so need to push again.
   */
  async checkCurrentBranch() {
    const { setting } = this.db
    const currentBranch = await git.currentBranch({ fs, dir: this.outputDir, fullname: false })
    const localBranches = await git.listBranches({ fs, dir: this.outputDir })

    if (currentBranch !== setting.branch) {
      if (!localBranches.includes(setting.branch)) {
        await git.branch({ fs, dir: this.outputDir, ref: setting.branch })
      }

      await git.checkout({ fs, dir: this.outputDir, ref: setting.branch })
    }
  }
}
