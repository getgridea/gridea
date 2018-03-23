<template>
  <i-button
    long
    @click="backup"
    :loading="loading"
  >Backup</i-button>
</template>

<script>
import fs from 'fs'
import simpleGit from 'simple-git/promise'
import moment from 'moment'

let git

export default {
  data() {
    return {
      setting: null,
      loading: false,
    }
  },
  methods: {
    async backup() {
      this.loading = true
      this.setting = this.$store.state.setting
      console.log('dir: ', this.setting.source)
      git = simpleGit(`${this.setting.source}`)
      console.log(git, moment)
      // 判断是否存在本地 git 仓库
      const exist = await fs.existsSync(`${this.setting.source}/.git/`)
      if (exist) {
        this.commonBackup()
      } else {
        this.fristBackup()
      }
    },
    async fristBackup() {
      console.log('frist backup')
      try {
        await git.init()
        await git.addConfig('user.name', `${this.setting.username}`)
        await git.addConfig('user.email', `${this.setting.email}`)
        await git.add('./*')
        await git.commit('first commit!')
        await git.addRemote('origin', `https://${this.setting.username}:${this.setting.token}@github.com/${this.setting.username}/${this.setting.backupRepo}.git`)
        await git.push('origin', `${this.setting.branch}`, {'--force': true}) // 强制推送
        this.loading = false
        this.$Message.success('Your first backup success! Congratulations!')
      } catch (e) {
        this.loading = false
        console.log(e)
        this.$Message.error(`Error: ${e}`)
      }
    },
    async commonBackup() {
      console.log('common backup')
      const statusSummary = await git.status()
      if (statusSummary.modified.length > 0) {
        try {
          await git.add('./*')
          await git.commit(`update backup from hve: ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`)
          await git.push('origin', `${this.setting.branch}`)
          this.loading = false
          this.$Message.success('Backup done!')
        } catch (e) {
          this.loading = false
          console.log(e)
        }
      } else {
        this.loading = false
        this.$Message.warning('Your blog is not updated.')
      }
    },
  },
}
</script>

<style lang="scss" scoped>

</style>
