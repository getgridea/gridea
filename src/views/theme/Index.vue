<template>
  <div class="">
    <a-row type="flex" justify="end" class="tool-container">
      <a-button class="btn" type="primary" @click="saveTheme">{{ $t('save') }}</a-button>
    </a-row>
    <div class="content-container">
      <a-form :form="form">
        <a-form-item :label="$t('selectTheme')">
          <a-select v-model="form.themeName">
            <a-select-option value="jack">Jack</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('siteName')">
          <a-input v-model="form.siteName" />
        </a-form-item>
        <a-form-item :label="$t('siteDescription')">
          <a-input v-model="form.siteDescription" />
        </a-form-item>
        <a-form-item :label="$t('footerInfo')">
          <a-input v-model="form.footerInfo" />
        </a-form-item>
        <a-form-item :label="$t('isShowFeatureImage')">
          <a-switch v-model="form.showFeatureImage" />
        </a-form-item>
        <a-form-item :label="$t('articlesPerPage')">
          <a-slider v-model="form.pageSize" :min="1" :max="50" />
        </a-form-item>
        <a-form-item label="文章 URL 默认格式">
          <a-radio-group name="postUrlFormat" v-model="form.postUrlFormat">
            <a-radio v-for="item in urlFormats" :key="item.value" :value="item.value">{{ item.text }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="标签 URL 默认格式">
          <a-radio-group name="tagUrlFormat" v-model="form.tagUrlFormat">
            <a-radio v-for="item in urlFormats" :key="item.value" :value="item.value">{{ item.text }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/constants'

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
    postUrlFormat: 'SLUG',
    tagUrlFormat: 'SLUG',
  }
  lCol = { span: 5 }
  wCol = { span: 12 }

  urlFormats = UrlFormats

  saveTheme() {
    ipcRenderer.send('theme-save', this.form)
    ipcRenderer.once('theme-saved', (event: Event, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success('主题配置已保存')
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
    this.form.postUrlFormat = config.postUrlFormat || 'SLUG'
    this.form.tagUrlFormat = config.tagUrlFormat || 'SLUG'
  }
}
</script>

<style lang="less" scoped>
.content-container {
  padding: 32px 20%;
}
</style>
