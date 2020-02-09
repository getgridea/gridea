import fs from 'fs'
import moment from 'moment'
// @ts-ignore
import * as git from 'isomorphic-git/dist/for-node/isomorphic-git'
import Model from './model'

export default class Deploy extends Model {
  outputDir: string = `${this.appDir}/output`

  remoteUrl = ''

  platformAddress = ''

  constructor(appInstance: any) {
    super(appInstance)
    
    const { setting } = this.db
    this.platformAddress = ({
      github: 'github.com',
      coding: 'e.coding.net',
    } as any)[setting.platform || 'github']
    const preUrl = ({
      github: `${setting.username}:${setting.token}`,
      coding: `${setting.tokenUsername}:${setting.token}`,
    } as any)[setting.platform || 'github']

    this.remoteUrl = `https://${preUrl}@${this.platformAddress}/${setting.username}/${setting.repository}.git`
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
        await git.config({
          fs,
          dir: this.outputDir,
          path: 'user.name',
          value: setting.username,
        })
        await git.config({
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
        core: 'default',
        url: this.remoteUrl,
      })
      console.log('info', info)
      result.message = info
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

  async firstPush() {
    const { setting } = this.db
    const localBranchs = {}
    console.log('first push')

    try {
      await git.init({ fs, dir: this.outputDir })
      await git.config({
        fs,
        dir: this.outputDir,
        path: 'user.name',
        value: setting.username,
      })
      await git.config({
        fs,
        dir: this.outputDir,
        path: 'user.email',
        value: setting.email,
      })
      await git.add({ fs, dir: this.outputDir, filepath: '.' })
      await git.commit({
        fs,
        dir: this.outputDir,
        message: `update from gridea: ${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      })
      await git.addRemote({
        fs, dir: this.outputDir, remote: 'origin', url: this.remoteUrl, force: true,
      })

      await this.checkCurrentBranch()
      const pushRes = await git.push({
        fs,
        dir: this.outputDir,
        remote: 'origin',
        ref: setting.branch,
        force: true,
      })
      return {
        success: true,
        data: pushRes,
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

      await git.fastCheckout({ fs, dir: this.outputDir, ref: setting.branch })
    }
  }
}
