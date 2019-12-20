<template>
  <div>
     <a-upload
      action=""
      listType="picture-card"
      class="feature-uploader"
      :showUploadList="false"
      :beforeUpload="beforeUpload"
    >
      <div v-if="faviconPath">
        <img class="favicon-image" :src="faviconPath" width="88px" height="88px" />
      </div>
      <div v-else>
        <a-icon type="plus" />
        <div class="ant-upload-text">Upload</div>
      </div>
    </a-upload>
    <div class="tip-text" v-if="file">
      {{ file.path }}
    </div>
    <footer-box>
      <div class="flex justify-end">
        <a-button type="primary" @click="submit">{{ $t('save') }}</a-button>
      </div>
    </footer-box>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import * as path from 'path'
import FooterBox from '../../../components/FooterBox/Index.vue'

@Component({
  components: {
    FooterBox,
  },
})
export default class FaviconSetting extends Vue {
  @State('site') site!: any

  file: any = null

  faviconPath = ''

  mounted() {
    this.faviconPath = path.join('file://', this.site.appDir, `favicon.ico?a=${Math.random()}`)
  }

  beforeUpload(file: any) {
    if (!file) {
      return
    }
    const isImage = file.type.indexOf('image') !== -1
    if (!isImage) {
      return
    }
    if (file && isImage) {
      this.file = file
    }
    return false
  }

  submit() {
    if (!this.file) {
      return
    }
    console.log('click favicon upload', this.file)
    ipcRenderer.send('favicon-upload', this.file.path)
    ipcRenderer.once('favicon-uploaded', (event: IpcRendererEvent, result: any) => {
      this.file = null
      this.$bus.$emit('site-reload')
      this.faviconPath = path.join('file://', this.site.appDir, `favicon.ico?a=${Math.random()}`)
      this.$message.success(this.$t('faviconSettingSuccess'))
    })
  }
}
</script>


<style lang="less" scoped>
.file-name {
  margin-bottom: 8px;
}
</style>
