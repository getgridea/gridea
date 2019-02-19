<template>
  <div>
    <a-form>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-alert :message="currentFolderPath" type="warning" />
        <a-upload action="" directory :beforeUpload="handleFolderChange" :showUploadList="false">
          <a-button style="margin-top: 8px;" type="primary" block>
            <a-icon type="folder-open" /> {{ $t('change') }}
          </a-button>
        </a-upload>
      </a-form-item>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-button type="primary" @click="saveLanguage">{{ $t('save') }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class System extends Vue {
  @State('site') site!: any

  formLayout = {
    label: { span: 5 },
    wrapper: { span: 12 },
  }

  currentFolderPath = '-'

  mounted() {
    this.currentFolderPath = this.site.appDir
  }

  saveLanguage() {
    ipcRenderer.send('app-source-folder-setting', this.currentFolderPath)
    ipcRenderer.once('app-source-folder-set', (event: Event, data: any) => {
      if (data) {
        this.$message.success(this.$t('saved'))
        this.$bus.$emit('site-reload')
      } else {
        this.$message.error(this.$t('saveError'))
      }
    })
  }

  handleFolderChange(data: any) {
    this.currentFolderPath = data.path.replace(/\\/g, '/')
    return false
  }
}
</script>

<style lang="less" scoped>
</style>
