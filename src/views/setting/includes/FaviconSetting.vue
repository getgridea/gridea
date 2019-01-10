<template>
  <v-card flat>
    <v-card-text>
      <img class="favicon-img" v-if="faviconPath" :src="faviconPath" alt="" width="80px">
      <upload-button
        :fileChangedCallback="handleFileChange"
      >
      </upload-button>
      {{ file && file.path }}
      <v-btn color="primary" depressed @click="submit">保 存</v-btn>
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
export default class Setting extends Vue {
  @State('site') site!: any

  file: any = null

  faviconPath = ''

  mounted() {
    this.faviconPath = path.join('file://', this.site.appDir, 'output', `favicon.ico?a=${Math.random()}`)
  }

  submit() {
    if (!this.file) {
      return
    }
    console.log('click favicon upload', this.file)
    ipcRenderer.send('favicon-upload', this.file.path)
    ipcRenderer.once('favicon-uploaded', (event: Event, result: any) => {
      this.file = null
      this.$bus.$emit('site-reload')
      this.faviconPath = path.join('file://', this.site.appDir, 'output', `favicon.ico?a=${Math.random()}`)
      this.$bus.$emit('snackbar-display', 'Favicon 配置已保存')
    })
  }

  handleFileChange(file: any) {
    this.file = file
    console.log(file)
  }
}
</script>


<style lang="stylus" scoped>
>>> .upload-btn
  padding: 0;

.favicon-img
  margin 6px 8px
</style>
