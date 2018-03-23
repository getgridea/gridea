<template>
  <div class="">
    <i-button
      type="success"
      long
      :loading="loading"
      @click="publish"
    >Publish</i-button>
  </div>
</template>

<script>
import fs from 'fs'
import simpleGit from 'simple-git/promise'
import moment from 'moment'
import Build from '@/lib/build'
const build = new Build()

let git

export default {
  data() {
    return {
      setting: null,
      loading: false,
    }
  },
  created() {
  },
  methods: {
    async publish() {
      this.loading = true
      // Build blog
      await build.publishBuild()

      // Initialize setting from db
      this.setting = await this.$db.get('remote').value()

      // Check whether there is a local git repository
      git = simpleGit(`${this.setting.source}/public`)
      const exist = await fs.existsSync(`${this.setting.source}/public/.git/`)
      if (exist) {
        await this.commonPush()
      } else {
        await this.firstPush()
      }
      this.loading = false
    },
    async firstPush() {
      console.log('first push')
      try {
        await git.init()
        await git.addConfig('user.name', `${this.setting.username}`)
        await git.addConfig('user.email', `${this.setting.email}`)
        await git.add('./*')
        await git.commit('first commit!')
        await git.addRemote('origin', `https://${this.setting.username}:${this.setting.token}@github.com/${this.setting.username}/${this.setting.repo}.git`)
        await git.push('origin', `${this.setting.branch}`, {'--force': true}) // Forced push
        this.$Message.success('🎉 恭喜! 您的第一次发布成功啦，快去看看吧!')
      } catch (e) {
        console.log(e)
        this.$Message.error(`😞 抱歉，我们似乎遇到了一些问题...`)
      }
    },
    async commonPush() {
      console.log('common push')
      const statusSummary = await git.status()
      console.log('statusSummary', statusSummary)
      if (statusSummary.modified.length > 0 || statusSummary.not_added.length > 0) {
        try {
          await git.add('./*')
          await git.commit(`update from hve: ${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')}`)
          await git.push('origin', `${this.setting.branch}`)
          this.$Message.success('🎉 您的站点已成功更新发布！')
        } catch (e) {
          console.log(e)
          this.$Message.error(`😞 抱歉，我们似乎遇到了一些问题...`)
        }
      } else {
        this.$Message.warning('😧 您的站点最近没有新内容，该加油创作啦！')
      }
    },
  },
}
</script>

<style lang="scss" scoped>

</style>
