<template>
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
      <div class="tip-text">{{ $t('htmlSupport') }}</div>
    </a-form-item>
    <a-form-item :label="$t('footerInfo')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input type="textarea" v-model="form.footerInfo" />
      <div class="tip-text">{{ $t('htmlSupport') }}</div>
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
    <a-form-item :label="$t('dateFormat')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-input v-model="form.dateFormat" />
      <div><a @click.prevent="openPage('http://momentjs.cn/docs/#/displaying/format/')">Momentjs Format</a></div>
    </a-form-item>
    <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
      <a-button class="btn" type="primary" @click="saveTheme">{{ $t('save') }}</a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { Site } from '../../../store/modules/site'
import { UrlFormats } from '../../../helpers/constants'

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
    dateFormat: 'YYYY-MM-DD',
  }

  lCol = { span: 5 }

  wCol = { span: 12 }

  urlFormats = UrlFormats

  saveTheme() {
    ipcRenderer.send('theme-save', this.form)
    ipcRenderer.once('theme-saved', async (event: Event, result: any) => {
      await this.$bus.$emit('site-reload')
      this.$router.push({ name: 'loading', query: { redirect: 'theme?tab=basic' } })
      this.$message.success(this.$t('themeConfigSaved'))
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
    this.form.dateFormat = config.dateFormat || 'YYYY-MM-DD'
  }

  openPage(url: string) {
    shell.openExternal(url)
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-slider-rail {
  background: #e1e1e1;
}
</style>
