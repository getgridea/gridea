<template>
  <div>
    <v-text-field label="shortname" v-model="form.shortname"></v-text-field>
    <v-text-field label="apikey" v-model="form.apikey"></v-text-field>
    <v-text-field label="api" v-model="form.api" placeholder="default: https://disqus.skk.moe/disqus/"></v-text-field>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'

@Component
export default class DisqusSetting extends Vue {
  @State('site') site!: any

  form = {
    shortname: '',
    apikey: '',
    api: '',
  }

  mounted() {
    console.log(this.site)
  }
}
</script>


<style lang="stylus" scoped>
</style>
