<template>
  <div class="">
    <a-row type="flex" justify="end" class="tool-container">
      <a-button class="btn" type="primary" @click="saveTheme">{{ $t('save') }}</a-button>
    </a-row>
    <div class="content-container">
      <a-form :form="form">
        <a-form-item :label="$t('selectTheme')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-select v-model="form.themeName">
            <a-select-option v-for="item in site.themes" :key="item" :value="item">{{ item }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('siteName')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-input v-model="form.siteName" />
        </a-form-item>
        <a-form-item :label="$t('siteDescription')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-input type="textarea" v-model="form.siteDescription" />
        </a-form-item>
        <a-form-item :label="$t('footerInfo')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-input type="textarea" v-model="form.footerInfo" />
        </a-form-item>
        <a-form-item :label="$t('isShowFeatureImage')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-switch v-model="form.showFeatureImage" />
        </a-form-item>
        <a-form-item :label="$t('articlesPerPage')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-slider v-model="form.postPageSize" :min="1" :max="50" />
        </a-form-item>
        <a-form-item :label="$t('archivesPerPage')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-slider v-model="form.archivesPageSize" :min="1" :max="100" />
        </a-form-item>
        <a-form-item :label="$t('articleDefault')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-radio-group name="postUrlFormat" v-model="form.postUrlFormat">
            <a-radio v-for="item in urlFormats" :key="item.value" :value="item.value">{{ item.text }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('tagDefault')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
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

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

  form = {
    themeName: '',
    postPageSize: 10,
    archivesPageSize: 50,
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
    this.form.postPageSize = config.postPageSize
    this.form.archivesPageSize = config.archivesPageSize
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
  background: transparent;
}
/deep/ .ant-slider-rail {
  background: #e1e1e1;
}
</style>
