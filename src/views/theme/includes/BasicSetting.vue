<template>
  <div>
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <a-form :form="form" style="padding-bottom: 48px;">
        <a-form-item :label="$t('selectTheme')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-select v-model="form.themeName" optionLabelProp="name">
            <a-select-option v-for="item in site.themes" :key="item.folder" :name="item.name" :value="item.folder">
              <div class="theme-option">
                <div class="left">
                  <div class="theme-name">{{ item.name }}</div>
                  <div class="theme-version" v-if="item.version">{{ item.version }}</div>
                </div>
                <div class="extra" v-if="item.repository">
                  <a-button @click.stop="openPage(item.repository)" type="dashed" shape="circle" size="small" icon="github"></a-button>
                </div>
              </div>
            </a-select-option>
            <div slot="dropdownRender" slot-scope="menu">
              <v-nodes :vnodes="menu"/>
              <a-divider style="margin: 4px 0;" />
              <div class="p-2 flex items-center cursor-pointer" @click="openPage('https://gridea.dev/themes/')">
                <i class="ri-t-shirt-line mr-2"></i> {{ $t('moreThemes') }}
              </div>
            </div>
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
          <a-slider v-model="form.postPageSize" :min="0" :max="50" />
        </a-form-item>
        <a-form-item :label="$t('archivesPerPage')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-slider v-model="form.archivesPageSize" :min="0" :max="100" />
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


        <a-form-item :label="$t('articleUrlPath')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-radio-group name="postPath" v-model="form.postPath">
            <a-tooltip placement="bottom" title="example.com/post/xxx">
              <a-radio value="post">{{$t('default')}}</a-radio>
            </a-tooltip>
            <a-tooltip placement="bottom" title="example.com/xxx">
              <a-radio value="">{{$t('concise')}}</a-radio>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>

        <a-form-item :label="$t('tagUrlPath')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-radio-group name="tagPath" v-model="form.tagPath">
            <a-tooltip placement="bottom" title="example.com/tag/xxx">
              <a-radio value="tag">{{$t('default')}}</a-radio>
            </a-tooltip>
            <a-tooltip placement="bottom" title="example.com/xxx">
              <a-radio value="">{{$t('concise')}}</a-radio>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>

        <ValidationProvider name="archivesPath" rules="required" v-slot="slotProps">
          <a-form-item
            :label="$t('archivePathPrefix')"
            :labelCol="formLayout.label"
            :wrapperCol="formLayout.wrapper"
            :colon="false"
            :validateStatus="resolveState(slotProps)"
            :help="slotProps.errors[0]"
          >
            <a-input v-model="form.archivesPath" />
          </a-form-item>
        </ValidationProvider>

        <a-form-item :label="$t('dateFormat')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-input v-model="form.dateFormat" />
          <div><a @click.prevent="openPage('http://momentjs.cn/docs/#/displaying/format/')">Momentjs Format</a></div>
        </a-form-item>
        <a-form-item label="RSS/Feed" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-radio-group name="tagUrlFormat" v-model="form.feedFullText">
            <a-radio :value="true">{{$t('showFullText')}}</a-radio>
            <a-radio :value="false">{{$t('showAbstractOnly')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('numberArticlesRSS')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
          <a-input-number :min="0" :max="10000" v-model="form.feedCount" />
        </a-form-item>
        <footer-box>
          <div class="flex justify-end">
            <a-button class="btn" type="primary" :disabled="invalid" @click="saveTheme">{{ $t('save') }}</a-button>
          </div>
        </footer-box>
      </a-form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { ValidationProvider, ValidationObserver } from 'vee-validate'
import { State } from 'vuex-class'
import FooterBox from '../../../components/FooterBox/Index.vue'
import { Site } from '../../../store/modules/site'
import {
  UrlFormats,
  DEFAULT_POST_PAGE_SIZE,
  DEFAULT_ARCHIVES_PAGE_SIZE,
  DEFAULT_FEED_COUNT,
  DEFAULT_ARCHIVES_PATH,
  DEFAULT_POST_PATH,
  DEFAULT_TAG_PATH,
} from '../../../helpers/constants'
import ga from '../../../helpers/analytics'

@Component({
  name: 'ThemeBasicSetting',
  components: {
    VNodes: {
      functional: true,
      render: (h: any, ctx: any) => ctx.props.vnodes,
    },
    ValidationProvider,
    ValidationObserver,
    FooterBox,
  },
})
export default class ThemeBasicSetting extends Vue {
  @State('site') site!: Site

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

  form = {
    themeName: '',
    postPageSize: DEFAULT_POST_PAGE_SIZE,
    archivesPageSize: DEFAULT_ARCHIVES_PAGE_SIZE,
    siteName: '',
    siteDescription: '',
    footerInfo: '',
    showFeatureImage: true,
    postUrlFormat: 'SLUG',
    tagUrlFormat: 'SLUG',
    dateFormat: 'YYYY-MM-DD',
    feedFullText: true,
    feedCount: DEFAULT_FEED_COUNT,
    archivesPath: DEFAULT_ARCHIVES_PATH,
    postPath: DEFAULT_POST_PATH,
    tagPath: DEFAULT_TAG_PATH,
  }

  lCol = { span: 5 }

  wCol = { span: 12 }

  urlFormats = UrlFormats

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
    this.form.archivesPath = config.archivesPath
    this.form.postPath = config.postPath
    this.form.tagPath = config.tagPath
  }

  openPage(url: string) {
    shell.openExternal(url)
  }

  resolveState({ errors }: { errors: any }) {
    if (errors[0]) {
      return 'error'
    }

    return ''
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
