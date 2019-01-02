<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">🌁 主 题</span>
      </v-card-title>
      <v-container fluid>
        <v-form>
          <v-select v-model="form.themeName" :items="site.themes" label="选择主题" outline />
          <v-text-field label="网站名称" v-model="form.siteName" />
          <v-text-field label="网站描述" v-model="form.siteDescription" />
          <v-text-field label="底部信息" v-model="form.footerInfo" />
          <v-switch label="是否显示文章大图" v-model="form.showFeatureImage" />
          <v-slider label="每页文章数" v-model="form.pageSize" thumb-label="always" :min="1" :max="20" always-dirty />
          <div>
            <v-btn depressed color="primary" @click="saveTheme">保 存</v-btn>
          </div>
        </v-form>
      </v-container>
    </v-card>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { Site } from '../../store/modules/site'

@Component
export default class Theme extends Vue {
  @State('site') site!: Site

  form = {
    themeName: '',
    pageSize: 10,
    siteName: '',
    siteDescription: '',
    footerInfo: '',
    showFeatureImage: true,
  }

  saveTheme() {
    ipcRenderer.send('theme-save', this.form)
    ipcRenderer.once('theme-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$bus.$emit('snackbar-display', '主题已保存')
    })
  }

  mounted() {
    const config = this.site.themeConfig
    this.form.themeName = config.themeName
    this.form.pageSize = config.pageSize
    this.form.siteName = config.siteName
    this.form.siteDescription = config.siteDescription
    this.form.footerInfo = config.footerInfo
    this.form.showFeatureImage = config.showFeatureImage
  }

}
</script>

<style scoped>
</style>
