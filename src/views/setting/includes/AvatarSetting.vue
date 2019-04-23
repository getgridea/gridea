<template>
  <div>
    <a-upload
      action=""
      listType="picture-card"
      class="feature-uploader"
      :showUploadList="false"
      :beforeUpload="beforeUpload"
    >
      <div v-if="avatarPath">
        <img class="favicon-image" :src="avatarPath" width="88px" height="88px" />
      </div>
      <div v-else>
        <a-icon type="plus" />
        <div class="ant-upload-text">Upload</div>
      </div>
    </a-upload>
    <a-alert class="file-name" v-if="file" :message="file && file.path" type="info" />
    <a-button type="primary" @click="submit">{{ $t('save') }}</a-button>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import * as path from 'path'

@Component
export default class AvatarSetting extends Vue {
  @State('site') site!: any

  file: any = null

  avatarPath = ''

  mounted() {
    this.avatarPath = path.join('file://', this.site.appDir, 'images', `avatar.png?a=${Math.random()}`)
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
    console.log('click avatar upload', this.file)
    ipcRenderer.send('avatar-upload', this.file.path)
    ipcRenderer.once('avatar-uploaded', (event: Event, result: any) => {
      this.file = null
      this.$bus.$emit('site-reload')
      this.avatarPath = path.join('file://', this.site.appDir, 'images', `avatar.png?a=${Math.random()}`)
      this.$message.success(this.$t('avatarSettingSuccess'))
    })
  }
}
</script>


<style lang="less" scoped>
.file-name {
  margin-bottom: 8px;
}
</style>
