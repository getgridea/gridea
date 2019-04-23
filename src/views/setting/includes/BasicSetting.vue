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
        <a-button :disabled="!canSubmit" :loading="detectLoading" @click="remoteDetect" style="margin-right: 16px;">{{ $t('testConnection') }}</a-button>
        <a-button :disabled="!canSubmit" @click="submit" type="primary">{{ $t('save') }}</a-button>
      </a-form-item>
      
    </a-form>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class BasicSetting extends Vue {
  @State('site') site!: any

  showToken = false

  detectLoading = false

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

  get canSubmit() {
    return this.form.domain
      && this.form.repository
      && this.form.branch
      && this.form.username
      && this.form.token
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

  /**
   * check form validate
   * @returns {boolean}
   */
  checkFormValid() {
    if (!['https://', 'http://'].some(d => this.form.domain.startsWith(d))) {
      this.$message.warn(this.$t('domainShouldStartsWithWarn'))
      return false
    }
    return true
  }

  submit() {
    const formValid = this.checkFormValid()
    if (!formValid) { return false }

    ipcRenderer.send('setting-save', this.form)
    ipcRenderer.once('setting-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('basicSettingSuccess'))
    })
  }

  async remoteDetect() {
    ipcRenderer.send('setting-save', this.form)
    ipcRenderer.once('setting-saved', () => {
      ipcRenderer.send('app-site-reload')
      ipcRenderer.once('app-site-loaded', () => {
        this.detectLoading = true
        ipcRenderer.send('remote-detect')
        ipcRenderer.once('remote-detected', (event: Event, result: any) => {
          console.log('检测结果', result)
          this.detectLoading = false
          if (result.success) {
            this.$message.success(this.$t('connectSuccess'))
          } else {
            this.$message.error(this.$t('connectFailed'))
          }
        })
      })
    })
  }

  @Watch('form.token')
  onTokenChanged(val: string) {
    this.form.token = this.form.token.trim()
  }
}
</script>


<style lang="less" scoped>
.icon {
  cursor: pointer;
}
</style>
