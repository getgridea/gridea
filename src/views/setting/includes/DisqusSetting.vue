<template>
  <div>
    <a href="#" @click="openPage('https://github.com/SukkaW/DisqusJS')">DisqusJS Document</a>
    <v-text-field label="shortname" v-model="form.shortname"></v-text-field>
    <v-text-field label="apikey" v-model="form.apikey"></v-text-field>
    <v-text-field label="api" v-model="form.api" placeholder="default: https://disqus.skk.moe/disqus/"></v-text-field>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'

@Component
export default class DisqusSetting extends Vue {
  @State('site') site!: any

  form = {
    shortname: '',
    api: '',
    apikey: '',
  }

  mounted() {
    const { disqusSetting } = this.site.commentSetting

    this.form.shortname = disqusSetting.shortname
    this.form.api = disqusSetting.api
    this.form.apikey = disqusSetting.apikey
  }

  openPage(url: string) {
    shell.openExternal(url)
  }
}
</script>


<style lang="stylus" scoped>
</style>
