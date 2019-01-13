<template>
  <v-card flat>
    <v-card-text>
      <v-text-field label="域 名" v-model="form.domain"></v-text-field>
      <v-text-field label="仓 库" v-model="form.repository"></v-text-field>
      <v-text-field label="分 支" v-model="form.branch"></v-text-field>
      <v-text-field label="用户名" v-model="form.username"></v-text-field>
      <v-text-field label="邮 箱" v-model="form.email"></v-text-field>
      <v-text-field
        label="Token"
        v-model="form.token"
        :append-icon="showToken ? 'visibility_off' : 'visibility'"
        :type="showToken ? 'text' : 'password'"
        @click:append="showToken = !showToken"
      ></v-text-field>
      <v-text-field label="CNAME" v-model="form.cname"></v-text-field>
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
export default class BasicSetting extends Vue {
  @State('site') site!: any

  showToken = false

  form = {
    domain: '',
    repository: '',
    branch: '',
    username: '',
    email: '',
    token: '',
    cname: '',
  }

  mounted() {
    this.form.domain = this.site.setting.domain
    this.form.repository = this.site.setting.repository
    this.form.branch = this.site.setting.branch
    this.form.username = this.site.setting.username
    this.form.email = this.site.setting.email
    this.form.token = this.site.setting.token
    this.form.cname = this.site.setting.cname
  }

  submit() {
    console.log('click setting save', this.form)
    ipcRenderer.send('setting-save', this.form)
    ipcRenderer.once('setting-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', '配置已保存')
    })
  }
}
</script>


<style lang="stylus" scoped>
</style>
