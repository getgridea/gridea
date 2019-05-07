import { ipcRenderer, Event } from 'electron'
import { Vue, Component, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'

enum Platform {
  qiniu
}
interface IMap {
  [key: string]: any
}


@Component
export default class BasicSetting extends Vue {
  @State('site') site!: any

  showToken = false

  detectLoading = false

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

  form: IMap = {
    platform: Platform.qiniu,
    domain: '',
    accessKey: '',
    secretKey: '',
    bucket: '',
  }

  get canSubmit() {
    return this.form.domain
      && this.form.accessKey
      && this.form.secretKey
      && this.form.bucket
  }

  mounted() {
    Object.assign(this.form, this.site.cdnSetting, {
      platform: this.site.cdnSetting.platform || Platform.qiniu,
    })
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

    ipcRenderer.send('cdn-setting-save', this.form)
    ipcRenderer.once('cdn-setting-save-success', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('cdnSettingSuccess'))
    })
  }

  async remoteDetect() {
    ipcRenderer.send('cdn-setting-save', this.form)
    ipcRenderer.once('cdn-setting-save-success', () => {
      ipcRenderer.send('app-site-reload')
      ipcRenderer.once('app-site-loaded', () => {
        this.detectLoading = true
        ipcRenderer.send('cdn-detect')

        ipcRenderer.once('cdn-detect-success', (event: Event, result: any) => {
          this.detectLoading = false
          this.$message.success(this.$t('testUploadSuccess'))
        })
        ipcRenderer.once('cdn-detect-fail', (event: Event, error: any) => {
          this.detectLoading = false
          // console.error(error)
          this.$message.error(error)
        })
      })
    })
  }

  handlePlatformInput(val: Platform) {
    this.form.platform = val
  }

  handleInput({ currentTarget: { dataset: { key } }, target: { value } }: any) {
    this.form[key] = value
  }

  render() {
    return (
      <div>
        <a-form form={this.form}>
          <a-form-item label="Platform" labelCol={this.formLayout.label} wrapperCol={this.formLayout.wrapper} colon={false}>
            <a-radio-group name="platform" value={this.form.platform} onInput={this.handlePlatformInput}>
              <a-radio value={Platform.qiniu}>qiniu</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="Domain" labelCol={this.formLayout.label} wrapperCol={this.formLayout.wrapper} colon={false}>
            <a-input data-key="domain" value={this.form.domain} onInput={this.handleInput} />
          </a-form-item>
          <a-form-item label="AccessKey" labelCol={this.formLayout.label} wrapperCol={this.formLayout.wrapper} colon={false}>
            <a-input data-key="accessKey" value={this.form.accessKey} onInput={this.handleInput} />
          </a-form-item>
          <a-form-item label="SecretKey" labelCol={this.formLayout.label} wrapperCol={this.formLayout.wrapper} colon={false}>
            <a-input data-key="secretKey" value={this.form.secretKey} onInput={this.handleInput} />
          </a-form-item>
          <a-form-item label="Bucket" labelCol={this.formLayout.label} wrapperCol={this.formLayout.wrapper} colon={false}>
            <a-input data-key="bucket" value={this.form.bucket} onInput={this.handleInput} />
          </a-form-item>
          <a-form-item label=" " labelCol={this.formLayout.label} wrapperCol={this.formLayout.wrapper} colon={false}>
            <a-button disabled={!this.canSubmit} loading={this.detectLoading} onClick={this.remoteDetect} style="margin-right: 16px;">{ this.$t('testUpload') }</a-button>
            <a-button disabled={!this.canSubmit} onClick={this.submit} type="primary">{ this.$t('save') }</a-button>
          </a-form-item>
        </a-form>
      </div>
    )
  }
}
