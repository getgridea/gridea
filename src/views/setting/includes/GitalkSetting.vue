<template>
  <div>
    <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a @click.prevent="openPage('https://github.com/gitalk/gitalk')">Gitalk Document</a>
    </a-form-item>
    <a-form-item label="Client ID" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.clientId"></a-input>
    </a-form-item>
    <a-form-item label="Client Secret" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.clientSecret"></a-input>
    </a-form-item>
    <a-form-item :label="$t('repository')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.repository"></a-input>
    </a-form-item>
    <a-form-item label="Owner" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.owner"></a-input>
    </a-form-item>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class GitalkSetting extends Vue {
  @State('site') site!: any

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

  form = {
    clientId: '',
    clientSecret: '',
    repository: '',
    owner: '',
  }

  mounted() {
    const { gitalkSetting } = this.site.commentSetting

    this.form.clientId = gitalkSetting.clientId
    this.form.clientSecret = gitalkSetting.clientSecret
    this.form.repository = gitalkSetting.repository
    this.form.owner = gitalkSetting.owner
  }

  openPage(url: string) {
    shell.openExternal(url)
  }
}
</script>


<style lang="less" scoped>
</style>
