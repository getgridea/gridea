<template>
  <v-card flat>
    <v-card-text>
      <v-switch label="是否显示评论" v-model="form.showComment" />
      <v-text-field label="Client ID" v-model="form.clientId"></v-text-field>
      <v-text-field label="Client Secret" v-model="form.clientSecret"></v-text-field>
      <v-text-field label="仓库" v-model="form.repository"></v-text-field>
      <v-text-field label="Owner" v-model="form.owner"></v-text-field>
      <v-btn color="primary" depressed @click="submit">保 存</v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'

@Component
export default class GitalkSetting extends Vue {
  @State('site') site!: any

  form = {
    showComment: false,
    clientId: '',
    clientSecret: '',
    repository: '',
    owner: '',
  }

  mounted() {
    console.log(this.site)
    this.form.showComment = this.site.gitalkSetting.showComment
    this.form.clientId = this.site.gitalkSetting.clientId
    this.form.clientSecret = this.site.gitalkSetting.clientSecret
    this.form.repository = this.site.gitalkSetting.repository
    this.form.owner = this.site.gitalkSetting.owner
  }

  submit() {
    console.log('click gitalk setting save', this.form)
    ipcRenderer.send('gitalk-setting-save', this.form)
    ipcRenderer.once('gitalk-setting-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', 'Gitalk 配置已保存')
    })
  }
}
</script>


<style lang="stylus" scoped>
</style>
