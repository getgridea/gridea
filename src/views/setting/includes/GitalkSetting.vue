<template>
  <div>
    <v-text-field label="Client ID" v-model="form.clientId"></v-text-field>
    <v-text-field label="Client Secret" v-model="form.clientSecret"></v-text-field>
    <v-text-field :label="$t('branch')" v-model="form.repository"></v-text-field>
    <v-text-field label="Owner" v-model="form.owner"></v-text-field>
  </div>
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
    clientId: '',
    clientSecret: '',
    repository: '',
    owner: '',
  }

  mounted() {
    console.log(this.site)
    this.form.clientId = this.site.gitalkSetting.clientId
    this.form.clientSecret = this.site.gitalkSetting.clientSecret
    this.form.repository = this.site.gitalkSetting.repository
    this.form.owner = this.site.gitalkSetting.owner
  }
}
</script>


<style lang="stylus" scoped>
</style>
