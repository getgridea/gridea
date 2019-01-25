<template>
  <div>
    <a-form :form="form">
      <a-form-item label="Platform" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-radio-group name="platform" v-model="form.platform">
          <a-radio value="github">Github Pages</a-radio>
          <a-radio value="coding">Coding Pages</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('domain')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input v-model="form.domain" />
      </a-form-item>
      <a-form-item :label="$t('repository')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input v-model="form.repository" />
      </a-form-item>
      <a-form-item :label="$t('branch')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input v-model="form.branch" />
      </a-form-item>
      <a-form-item :label="$t('username')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input v-model="form.username" />
      </a-form-item>
      <a-form-item :label="$t('email')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input v-model="form.email" />
      </a-form-item>
      <a-form-item label="Token" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input :type="showToken ? '' : 'password'" v-model="form.token">
          <a-icon class="icon" slot="addonAfter" :type="showToken ? 'eye-invisible' : 'eye'" @click="showToken = !showToken" />
        </a-input>
      </a-form-item>
      <a-form-item label="CNAME" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input v-model="form.cname" />
      </a-form-item>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-button @click="submit" type="primary">{{ $t('save') }}</a-button>
      </a-form-item>
      
    </a-form>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class BasicSetting extends Vue {
  @State('site') site!: any

  showToken = false

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

  form = {
    platform: 'github',
    domain: '',
    repository: '',
    branch: '',
    username: '',
    email: '',
    token: '',
    cname: '',
  }

  mounted() {
    this.form.platform = this.site.setting.platform || 'github'
    this.form.domain = this.site.setting.domain
    this.form.repository = this.site.setting.repository
    this.form.branch = this.site.setting.branch
    this.form.username = this.site.setting.username
    this.form.email = this.site.setting.email
    this.form.token = this.site.setting.token
    this.form.cname = this.site.setting.cname
  }

  submit() {
    ipcRenderer.send('setting-save', this.form)
    ipcRenderer.once('setting-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('basicSettingSuccess'))
    })
  }
}
</script>


<style lang="less" scoped>
.icon {
  cursor: pointer;
}
</style>
