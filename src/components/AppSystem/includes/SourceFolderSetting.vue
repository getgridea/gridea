<template>
  <div>
    <a-form>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-input v-model="currentFolderPath" read-only>
          <a-upload slot="addonAfter" action="" directory :beforeUpload="handleFolderChange" :showUploadList="false">
            <a-icon class="folder-btn" type="folder-open" />
          </a-upload>
        </a-input>
      </a-form-item>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-button type="primary" @click="save">{{ $t('save') }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, remote } from 'electron'
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

  save() {
    ipcRenderer.send('app-source-folder-setting', this.currentFolderPath)
    ipcRenderer.once('app-source-folder-set', (event: IpcRendererEvent, data: any) => {
      if (data) {
        this.$message.success(this.$t('saved'))
        this.$bus.$emit('site-reload')
        remote.app.relaunch()
        remote.app.quit()
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
/deep/ .ant-input-group-addon {
  padding: 0;
}
.folder-btn {
  padding: 0 8px;
}
</style>
