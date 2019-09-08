<template>
  <div>
    <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a @click.prevent="openPage('https://github.com/SukkaW/DisqusJS')">DisqusJS Document</a>
    </a-form-item>
    <a-form-item label="shortname" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.shortname"></a-input>
    </a-form-item>
    <a-form-item label="apikey" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.apikey"></a-input>
    </a-form-item>
    <a-form-item label="api" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.api" placeholder="default: https://disqus.skk.moe/disqus/"></a-input>
    </a-form-item>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'

@Component
export default class DisqusSetting extends Vue {
  @State('site') site!: any

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

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


<style lang="less" scoped>
</style>
