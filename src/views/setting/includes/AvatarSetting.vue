<template>
  <v-card flat>
    <v-card-text>
      <img class="img" v-if="avatarPath" :src="avatarPath" alt="" width="88px">
      <upload-button
        uniqueId
        :fileChangedCallback="handleFileChange"
      >
      </upload-button>
      {{ file && file.path }}
      <v-btn color="primary" depressed @click="submit">{{ $t('save') }}</v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import UploadButton from 'vuetify-upload-button'
import * as path from 'path'

@Component({
  components: {
    UploadButton,
  },
})
export default class AvatarSetting extends Vue {
  @State('site') site!: any

  file: any = null

  avatarPath = ''

  mounted() {
    this.avatarPath = path.join('file://', this.site.appDir, 'images', `avatar.png?a=${Math.random()}`)
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
      this.$bus.$emit('snackbar-display', this.$t('avatarSettingSuccess'))
    })
  }

  handleFileChange(file: any) {
    this.file = file
    console.log('头像文件', file)
  }
}
</script>


<style lang="stylus" scoped>
>>> .upload-btn
  padding: 0 !important;

.img
  margin 6px 8px
</style>

