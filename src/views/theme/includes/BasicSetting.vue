<template>
    <a-form :form="form">
        <a-form-item :label="$t('selectTheme')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-select v-model="form.themeName" optionLabelProp="name">
                <a-select-option v-for="item in site.themes" :key="item.folder" :name="item.name" :value="item.folder">
                    <div class="theme-option">
                        <div class="left">
                            <div class="theme-name">{{ item.name }}</div>
                            <div class="theme-version" v-if="item.version">{{ item.version }}</div>
                        </div>
                        <div class="extra" v-if="item.repository">
                            <a-button @click.stop="openPage(item.repository)" type="dashed" shape="circle" size="small"
                                      icon="github"></a-button>
                        </div>
                    </div>
                </a-select-option>
                <div slot="dropdownRender" slot-scope="menu">
                    <v-nodes :vnodes="menu"/>
                    <a-divider style="margin: 4px 0;"/>
                    <div style="padding: 8px; cursor: pointer;" @click="openPage('https://gridea.dev/themes/')">
                        <a-icon type="picture"/>
                        {{ $t('moreThemes') }}
                    </div>
                </div>
            </a-select>
        </a-form-item>
        <a-form-item :label="$t('siteName')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-input v-model="form.siteName"/>
        </a-form-item>
        <a-form-item :label="$t('siteDescription')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-input type="textarea" v-model="form.siteDescription"/>
            <div class="tip-text">{{ $t('htmlSupport') }}</div>
        </a-form-item>
        <a-form-item :label="$t('footerInfo')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-input type="textarea" v-model="form.footerInfo"/>
            <div class="tip-text">{{ $t('htmlSupport') }}</div>
        </a-form-item>
        <a-form-item :label="$t('isShowFeatureImage')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-switch v-model="form.showFeatureImage"/>
        </a-form-item>
        <a-form-item :label="$t('articlesPerPage')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-slider v-model="form.postPageSize" :min="1" :max="50"/>
        </a-form-item>
        <a-form-item :label="$t('archivesPerPage')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-slider v-model="form.archivesPageSize" :min="1" :max="100"/>
        </a-form-item>
        <a-form-item :label="$t('articleDefault')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-radio-group name="postUrlFormat" v-model="form.postUrlFormat">
                <a-radio v-for="item in urlFormats" :key="item.value" :value="item.value">{{ item.text }}</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('tagDefault')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-radio-group name="tagUrlFormat" v-model="form.tagUrlFormat">
                <a-radio v-for="item in urlFormats" :key="item.value" :value="item.value">{{ item.text }}</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('dateFormat')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-input v-model="form.dateFormat"/>
            <div><a @click.prevent="openPage('http://momentjs.cn/docs/#/displaying/format/')">Momentjs Format</a></div>
        </a-form-item>
        <a-form-item label="RSS/Feed" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
            <a-radio-group name="tagUrlFormat" v-model="form.feedFullText">
                <a-radio :value="true">显示全文</a-radio>
                <a-radio :value="false">仅显示摘要</a-radio>
            </a-radio-group>
        </a-form-item>
        <a-form-item label="RSS/Feed 文章数量" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
            <a-input-number :min="0" :max="10000" v-model="form.feedCount"/>
        </a-form-item>
        <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
            <a-button class="btn" type="primary" @click="saveTheme">{{ $t('save') }}</a-button>
        </a-form-item>
    </a-form>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import { Site } from '../../../store/modules/site'
import { UrlFormats, DEFAULT_FEED_COUNT } from '../../../helpers/constants'
import ga from '../../../helpers/analytics'

    @Component({
      name: 'ThemeBasicSetting',
      components: {
        VNodes: {
          functional: true,
          render: (h: any, ctx: any) => ctx.props.vnodes,
        },
      },
    })
export default class ThemeBasicSetting extends Vue {
        @State('site') site!: Site;

        formLayout = {
          label: { span: 6 },
          wrapper: { span: 12 },
        };

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
          feedFullText: true,
          feedCount: DEFAULT_FEED_COUNT,
        };

        lCol = { span: 5 };

        wCol = { span: 12 };

        urlFormats = UrlFormats;

        saveTheme() {
          ipcRenderer.send('theme-save', this.form)
          ipcRenderer.once('theme-saved', async (event: IpcRendererEvent, result: any) => {
            await this.$bus.$emit('site-reload')
            this.$router.push({ name: 'loading', query: { redirect: 'theme?tab=basic' } })
            this.$message.success(this.$t('themeConfigSaved'))

            ga.event('Theme', 'Theme - save', { evLabel: this.form.themeName })
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
          this.form.postUrlFormat = config.postUrlFormat
          this.form.tagUrlFormat = config.tagUrlFormat
          this.form.dateFormat = config.dateFormat
          this.form.feedFullText = config.feedFullText
          this.form.feedCount = config.feedCount
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

    .theme-option {
        display: flex;
        justify-content: space-between;

        .theme-name {
            padding-bottom: 8px;
        }

        .theme-version {
            font-size: 12px;
            color: #ced4da;
            font-weight: lighter !important;
        }
    }
</style>
