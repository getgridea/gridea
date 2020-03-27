<template>
  <div class="article-update-page" :class="{ 'is-entering': entering }" v-if="visible" @mousemove="handlePageMousemove">
    <div class="page-title" ref="pageTitle">
      <a-row type="flex" justify="end">
        <a-tooltip placement="bottom" :title="$t('back')">
          <div class="op-btn" tabindex="0" @click="close">
            <i class="zwicon-arrow-left"></i>
          </div>
        </a-tooltip>
        <a-tooltip placement="bottom" :title="$t('saveDraft')">
          <div class="op-btn" tabindex="0" :class="{ 'disabled': !canSubmit }" @click="saveDraft">
            <i class="zwicon-checkmark"></i>
          </div>
        </a-tooltip>
        <a-tooltip placement="bottom" :title="$t('save')">
          <div class="op-btn save-btn" tabindex="0" :class="{ 'disabled': !canSubmit }" @click="savePost">
            <i class="zwicon-checkmark"></i>
          </div>
        </a-tooltip>
      </a-row>
    </div>
    <div class="page-content">
      <div class="editor-wrapper">
        <a-input class="post-title" size="large" :placeholder="$t('title')" v-model="form.title" @change="handleTitleChange" @keydown="handleInputKeydown"></a-input>
        <monaco-markdown-editor
          ref="monacoMarkdownEditor"
          v-model="form.content"
          @keydown="handleInputKeydown"
          :isPostPage="true"
          class="post-editor"
        ></monaco-markdown-editor>
        <div class="footer-info">
          {{ $t('writingIn') }} <a @click.prevent="openPage('https://gridea.dev')" class="link">Gridea</a>
        </div>

        <div class="right-tool-container">
          <a-popover placement="left" trigger="click">
            <template slot="content">
              <div class="post-stats">
                <div class="item">
                  <h4>{{ $t('words') }}</h4>
                  <div class="number">{{ postStats.wordsNumber }}</div>
                </div>
                <div class="item">
                  <h4>{{ $t('readingTime') }}</h4>
                  <div class="number">{{ postStats.formatTime }}</div>
                </div>
              </div>
            </template>
            <div class="op-btn" @click="handleInfoClick">
              <i class="zwicon-info-circle"></i>
            </div>
          </a-popover>
          <a-popover placement="left" trigger="click">
            <template slot="content">
              <EmojiCard @select="handleEmojiSelect" />
            </template>
            <div class="op-btn" @click="handleEmojiClick">
              <i class="zwicon-smile"></i>
            </div>
          </a-popover>
          <a-tooltip placement="left" :title="$t('insertImage')">
            <div class="op-btn" @click="insertImage">
              <i class="zwicon-image"></i>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" :title="$t('insertMore')">
            <div class="op-btn" @click="insertMore">
              <i class="zwicon-more-v"></i>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" :title="$t('postSettings')">
            <div class="op-btn" @click="handlePostSettingClick">
              <i class="zwicon-cog"></i>
            </div>
          </a-tooltip>
          <a-tooltip placement="left" :title="`${$t('preview')} [Ctrl + P]`">
            <div class="op-btn" v-shortkey="['ctrl', 'p']" @shortkey="shortPreviewPost" @click="previewPost">
              <i class="zwicon-eye"></i>
            </div>
          </a-tooltip>
        </div>
        <div class="right-bottom-tool-container">
          <a-popover placement="leftBottom" trigger="click">
            <template slot="content">
              <div class="keyboard-tip">
                💁‍♂️ 编辑区域右键能弹出快捷菜单哦
              </div>
              <div class="keyboard-container">
                <div class="item" v-for="(item, index) in shortcutKeys" :key="index">
                  <a-divider class="keyboard-group-title" orientation="left">{{ item.name }}</a-divider>
                  <div class="list">
                    <div class="list-item" v-for="(listItem, listIndex) in item.list" :key="listIndex">
                      <div class="list-item-title">{{ listItem.title }}</div>
                      <div>
                        <span v-for="(keyCode, keyIndex) in listItem.keyboard" :key="keyIndex">
                          <code>{{keyCode }}</code> <span v-if="keyIndex !== listItem.keyboard.length - 1"> + </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <div class="op-btn">
              <i class="zwicon-keyboard"></i>
            </div>
          </a-popover>
        </div>
      </div>

      <a-drawer
        :visible="previewVisible"
        @close="previewVisible = false"
        width="800"
        :wrapStyle="{
          height: 'calc(100% - 108px)',
          overflow: 'auto',
          paddingBottom: '108px',
          zIndex: 1025,
        }"
        title=" "
      >
        <img class="preview-feature-image" v-if="featureType === 'DEFAULT' && form.featureImage.path" :src="form.featureImage.path" alt="">
        <img class="preview-feature-image" v-if="featureType === 'EXTERNAL' && form.featureImagePath" :src="form.featureImagePath" alt="">
        <h1 class="preview-title">{{ form.title }}</h1>
        <div class="preview-date">{{ form.date.format(site.themeConfig.dateFormat) }}</div>
        <div class="preview-tags">
          <span class="tag" v-for="(tag, index) in form.tags" :key="index">
            {{ tag }}
          </span>
        </div>
        <div class="preview-container" ref="previewContainer"></div>
      </a-drawer>

      <a-drawer
        :title="$t('postSettings')"
        :visible="postSettingsVisible"
        @close="postSettingsVisible = false"
        width="400"
        :wrapStyle="{height: 'calc(100% - 108px)',overflow: 'auto',paddingBottom: '108px', zIndex: 1025}"
      >
        <a-collapse v-model="activeKey" class="post-settings" :bordered="false">
          <a-collapse-panel header="URL" key="1">
            <a-input v-model="form.fileName" @change="handleFileNameChange"></a-input>
          </a-collapse-panel>
          <a-collapse-panel :header="$t('tag')" key="2">
            <div>
              <a-select mode="tags" style="width: 100%" v-model="form.tags">
                <a-select-option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</a-select-option>
              </a-select>
            </div>
          </a-collapse-panel>
          <a-collapse-panel :header="$t('createAt')" key="3">
            <a-date-picker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              v-model="form.date"
              style="width: 100%"
            />
          </a-collapse-panel>

          <a-collapse-panel :header="$t('featureImage')" key="4">
            <a-radio-group style="margin-bottom: 16px;" defaultValue="a" buttonStyle="solid" v-model="featureType" size="small">
              <a-radio-button value="DEFAULT">{{$t('default')}}</a-radio-button>
              <a-radio-button value="EXTERNAL">{{$t('external')}}</a-radio-button>
            </a-radio-group>
            <div v-if="featureType === 'DEFAULT'">
              <a-upload
                action=""
                listType="picture-card"
                class="feature-uploader"
                :showUploadList="false"
                :beforeUpload="beforeFeatureUpload"
              >
                <div v-if="form.featureImage.path">
                  <img class="feature-image" :src="`file://${form.featureImage.path}`" height="150" />
                </div>
                <div v-else>
                  <img src="@/assets/images/image_upload.svg" class="upload-img">
                  <i class="zwicon-upload upload-icon"></i>
                </div>
              </a-upload>
              <a-button v-if="form.featureImage.path" type="danger" block icon="delete" @click="form.featureImage = {}" />
            </div>
            <div v-if="featureType === 'EXTERNAL'">
              <a-input v-model="form.featureImagePath"></a-input>
              <div class="tip-text">{{$t('pathContainHttps')}}</div>
              <div class="feature-image-container" v-if="form.featureImagePath">
                <img class="feature-image" :src="form.featureImagePath" height="150">
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel :header="$t('hideInList')" key="5">
            <a-switch v-model="form.hideInList"></a-switch>
          </a-collapse-panel>
          <a-collapse-panel :header="$t('topArticles')" key="6">
            <a-switch v-model="form.isTop"></a-switch>
          </a-collapse-panel>
        </a-collapse>
      </a-drawer>

      <!-- 编辑器点击图片上传用 -->
      <input ref="uploadInput" class="upload-input" type="file" accept="image/*" @change="fileChangeHandler">

      <span class="save-tip">{{ postStatusTip }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ipcRenderer, IpcRendererEvent, shell, clipboard, remote,
} from 'electron'
import {
  Vue, Component, Prop, Watch,
} from 'vue-property-decorator'
import { State } from 'vuex-class'
import shortid from 'shortid'
import moment from 'moment'
import * as fse from 'fs-extra'
import * as monaco from 'monaco-editor'
import Prism from 'prismjs'
import { wordCount, timeCalc } from '../../helpers/words-count'
import markdown from '../../server/plugins/markdown'
import MonacoMarkdownEditor from '../../components/MonacoMarkdownEditor/Index.vue'
import EmojiCard from '../../components/EmojiCard/Index.vue'
import slug from '../../helpers/slug'
import { IPost } from '../../interfaces/post'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/enums'
import shortcutKeys from '../../helpers/shortcut-keys'
import ga from '../../helpers/analytics'

@Component({
  components: {
    MonacoMarkdownEditor,
    EmojiCard,
  },
})
export default class ArticleUpdate extends Vue {
  @Prop(Boolean) visible!: boolean

  @Prop(String) articleFileName!: string

  postSettingsVisible = false

  previewVisible = false

  previewPostHTML = ''

  changedAfterLastSave = false

  entering = false

  shortcutKeys = shortcutKeys

  $refs!: {
    uploadInput: any,
    image: any,
    articlePage: HTMLElement,
    monacoMarkdownEditor: any,
    previewContainer: HTMLElement,
    pageTitle: HTMLElement,
  }

  @State('site') site!: Site

  form = {
    title: '',
    fileName: '',
    tags: [] as string[],
    date: moment(new Date()),
    content: '',
    published: false,
    hideInList: false,
    isTop: false,
    featureImage: {
      path: '',
      name: '',
      type: '',
    },
    featureImagePath: '',
    deleteFileName: '',
  }

  featureType: 'DEFAULT' | 'EXTERNAL' = 'DEFAULT'

  activeKey = ['1']

  postStatusTip = ''

  get dateLocale() {
    return this.$root.$i18n.locale === 'zhHans' ? 'zh-cn' : 'en-us'
  }

  // 编辑文章时，当前文章的索引
  currentPostIndex = -1

  originalFileName = ''

  fileNameChanged = false

  get canSubmit() {
    return this.form.title && this.form.content
  }

  get tags() {
    return this.site.tags.map((tag: any) => tag.name)
  }

  get postStats() {
    const reading = timeCalc(this.form.content)
    const second = Number((reading.second - (reading.minius - 1) * 60).toFixed(2))
    const formatTime = `${Math.floor(reading.second / 60)}m ${second < 60 ? second : ''}${second < 60 ? 's' : ''}`

    let wordsNumber = 0
    wordCount(this.form.content, (count: number) => {
      wordsNumber = count
    })

    return {
      formatTime: formatTime,
      wordsNumber: Array.isArray(wordsNumber) ? 0 : wordsNumber,
    }
  }

  mounted() {
    this.buildCurrentForm()
    ipcRenderer.removeAllListeners('click-menu-save')
    ipcRenderer.on('click-menu-save', (event: IpcRendererEvent, data: any) => {
      this.normalSavePost()
    })

    this.$watch('form', () => {
      this.changedAfterLastSave = true
    }, { deep: true })
  }

  buildCurrentForm() {
    const { articleFileName } = this
    if (articleFileName) {
      this.fileNameChanged = true // 编辑文章标题时 URL 不跟随其变化
      this.currentPostIndex = this.site.posts.findIndex((item: IPost) => item.fileName === articleFileName)
      const currentPost = this.site.posts[this.currentPostIndex]
      this.originalFileName = currentPost.fileName

      if (currentPost) {
        this.form.title = currentPost.data.title
        this.form.fileName = currentPost.fileName
        this.form.tags = currentPost.data.tags || []
        this.form.date = moment(currentPost.data.date).isValid() ? moment(currentPost.data.date) : moment()
        this.form.content = currentPost.content
        this.form.published = currentPost.data.published
        this.form.hideInList = currentPost.data.hideInList
        this.form.isTop = currentPost.data.isTop

        if (currentPost.data.feature && currentPost.data.feature.includes('http')) {
          this.form.featureImagePath = currentPost.data.feature
          this.featureType = 'EXTERNAL'
        } else {
          this.form.featureImage.path = (currentPost.data.feature && currentPost.data.feature.substring(7)) || ''
          this.form.featureImage.name = this.form.featureImage.path.replace(/^.*[\\/]/, '')
        }
      }
    } else if (this.site.themeConfig.postUrlFormat === UrlFormats.ShortId) {
      this.form.fileName = shortid.generate()
    }
  }

  beforeFeatureUpload(file: any) {
    if (!file) {
      return
    }
    const isImage = file.type.indexOf('image') !== -1
    if (!isImage) {
      return
    }
    if (file && isImage) {
      this.form.featureImage = {
        name: file.name,
        path: file.path,
        type: file.type,
      }
    }

    ga.event('Post', 'Post - set-local-feature-image', {})
    return false
  }

  close() {
    if (this.changedAfterLastSave) {
      this.$confirm({
        title: `${this.$t('warning')}`,
        content: `${this.$t('unsavedWarning')}`,
        okText: `${this.$t('noSaveAndBack')}`,
        okType: 'danger',
        cancelText: `${this.$t('cancel')}`,
        zIndex: 2000,
        onOk: () => {
          this.$emit('close')
        },
      })
      return
    }
    this.$emit('close')
  }

  updatePostSavedStatus() {
    this.postStatusTip = `${this.$t('savedIn')} ${moment().format('HH:mm:ss')}`
    this.changedAfterLastSave = false
  }

  handleTitleChange(val: string) {
    if (!this.fileNameChanged && this.site.themeConfig.postUrlFormat === UrlFormats.Slug) {
      this.form.fileName = slug(this.form.title)
    }
  }

  handleFileNameChange(val: string) {
    this.fileNameChanged = !!val
  }

  preventDefault(event: any) {
    if (event.target.tagName === 'A') {
      const href = event.target.getAttribute('href')
      if (href && !href.startsWith('#')) {
        // ignore anchor link.
        event.preventDefault()
        shell.openExternal(href)
      }
    }
  }

  buildFileName() {
    if (this.form.fileName !== '') {
      return
    }

    this.form.fileName = this.site.themeConfig.postUrlFormat === UrlFormats.Slug
      ? slug(this.form.title)
      : shortid.generate()
  }

  checkArticleUrlValid() {
    const restPosts = JSON.parse(JSON.stringify(this.site.posts))
    const foundPostIndex = restPosts.findIndex((post: IPost) => post.fileName === this.form.fileName)

    if (foundPostIndex !== -1) {
      if (this.currentPostIndex === -1) {
        // 新增文章时文件名和其他文章文件名冲突
        return false
      }
      restPosts.splice(this.currentPostIndex, 1)
      const index = restPosts.findIndex((post: IPost) => post.fileName === this.form.fileName)
      if (index !== -1) {
        return false
      }
    }

    this.currentPostIndex = this.currentPostIndex === -1 ? 0 : this.currentPostIndex

    return true
  }

  formatForm(published?: boolean) {
    this.buildFileName()
    const valid = this.checkArticleUrlValid()
    if (!valid) {
      this.$message.error(this.$t('postUrlRepeatTip'))
      return
    }

    if (this.form.fileName.includes('/')) {
      this.$message.error(this.$t('postUrlIncludeTip'))
      return
    }

    // 文件名改变之后，删除原来文件
    if (this.form.fileName.toLowerCase() !== this.originalFileName.toLowerCase()) {
      this.form.deleteFileName = this.originalFileName
    }

    const form = {
      ...this.form,
      date: this.form.date.format('YYYY-MM-DD HH:mm:ss'),
    }
    if (this.featureType !== 'EXTERNAL') {
      form.featureImagePath = ''
    }
    if (this.featureType !== 'DEFAULT') {
      form.featureImage = {
        path: '',
        name: '',
        type: '',
      }
    }
    form.published = typeof published === 'boolean' ? published : form.published

    return form
  }

  saveDraft() {
    if (!this.canSubmit) return
    const form = this.formatForm(false)

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: IpcRendererEvent, data: any) => {
      this.updatePostSavedStatus()
      this.$message.success(`🎉  ${this.$t('draftSuccess')}`)
      this.$emit('fetchData')
    })

    ga.event('Post', 'Post - click-save-draft', {})
  }

  savePost() {
    if (!this.canSubmit) return
    const form = this.formatForm(true)

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: IpcRendererEvent, data: any) => {
      this.updatePostSavedStatus()
      this.$message.success(`🎉  ${this.$t('saveSuccess')}`)
      this.$emit('fetchData')
    })

    ga.event('Post', 'Post - click-save-post', {})
  }

  normalSavePost() {
    if (!this.canSubmit) return
    const form = this.formatForm()

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: IpcRendererEvent, data: any) => {
      this.updatePostSavedStatus()
      this.$emit('fetchData')
    })
  }

  insertImage() {
    this.$refs.uploadInput.click()
    ga.event('Post', 'Post - click-insert-image', {})
  }

  handlePostSettingClick() {
    this.postSettingsVisible = true

    ga.event('Post', 'Post - click-post-setting', {})
  }

  handleInfoClick() {
    ga.event('Post', 'Post - click-post-info', {})
  }

  handleEmojiClick() {
    ga.event('Post', 'Post - click-emoji-card', {})
  }

  uploadImageFiles(files: any[]) {
    ipcRenderer.send('image-upload', files)
    ipcRenderer.once('image-uploaded', (event: IpcRendererEvent, data: any) => {
      for (const path of data) {
        let url = `![](file://${path})`
        url = url.replace(/\\/g, '/')

        this.$refs.monacoMarkdownEditor.editor.getModel().applyEdits([{
          range: monaco.Range.fromPositions(this.$refs.monacoMarkdownEditor.editor.getPosition()),
          text: url,
        }])
      }
    })
  }

  insertMore() {
    this.$refs.monacoMarkdownEditor.editor.getModel().applyEdits([{
      range: monaco.Range.fromPositions(this.$refs.monacoMarkdownEditor.editor.getPosition()),
      text: '\n<!-- more -->\n',
    }])

    ga.event('Post', 'Post - click-add-more', {})
  }

  handleEmojiSelect(emoji: any) {
    this.$refs.monacoMarkdownEditor.editor.getModel().applyEdits([{
      range: monaco.Range.fromPositions(this.$refs.monacoMarkdownEditor.editor.getPosition()),
      text: emoji,
    }])
  }

  previewPost() {
    this.previewVisible = true
    setTimeout(() => {
      this.$refs.previewContainer.innerHTML = markdown.render(this.form.content)
      Prism.highlightAll()
    }, 1)

    ga.event('Post', 'Post - click-preview-post', {})
  }

  shortPreviewPost(event: any) {
    if (this.previewVisible) {
      this.previewVisible = false
      return
    }
    this.previewPost()
  }

  /**
   * 单张图片上传
   */
  fileChangeHandler(e: any) {
    const file = (e.target.files || e.dataTransfer)[0]
    if (!file) {
      return
    }
    const isImage = file.type.indexOf('image') !== -1
    if (!isImage) {
      return
    }
    if (file && isImage) {
      this.uploadImageFiles([
        {
          name: file.name,
          path: file.path,
          type: file.type,
        },
      ])
    }
  }

  handleInputKeydown() {
    this.entering = true
  }

  handlePageMousemove() {
    this.entering = false
  }

  openPage(url: string) {
    shell.openExternal(url)
  }
}
</script>

<style lang="less" scoped>
.upload-input {
  display: none;
}

.btn {
  margin-left: 16px;
}
.feature-image-container {
  text-align: center;
  padding: 16px;
}

.feature-image {
  max-width: 100%
}
/deep/ .ant-upload.ant-upload-select-picture-card {
  width: 100%
}

/deep/ .ant-modal-content {
  height: 100%;
}

/deep/ .ant-collapse {
  background: #F7F6F3;
}
.article-update-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1025;
  background: #fff;
  display: flex;
  flex-direction: column;
  .page-title {
    padding: 8px 16px;
    z-index: 1026;
    background: #fff;
    transition: opacity 700ms ease;
    border-bottom: 1px solid #e8e8e88a;

    .op-btn {
      height: 30px;
      line-height: 30px;
      padding: 0 16px;
      font-size: 18px;
      border-radius: 20px;
      margin-left: 8px;
      outline: none;
      transition: all 0.3s;
      i {
        font-weight: bold;
      }
      &:hover {
        background: #efefef;
        color: #515457;
      }
      &:focus {
        background: #efefef;
      }
      &.save-btn:not(.disabled) {
        color: #38A169;
        &:hover {
          background: #9AE6B4;
          color: #22543D;
        }
        &:focus {
          color: #22543D;
          background: #68D391;
        }
      }
      &.disabled {
        cursor: default;
        color: #ccc;
        // background: #fafafa;
        &:hover, &:focus {
          background: #fff;
        }
      }
    }
  }
  .page-content {
    background: #fff;
    flex: 1;
    display: flex;
    overflow: scroll;
  }

  &.is-entering {
    .page-title,
    .right-tool-container,
    .right-bottom-tool-container {
      opacity: 0;
    }
  }
}

.tip-text {
  margin: 8px 0;
}

.post-title {
  font-weight: 400;
  background: #fff;
  padding: 8px 0;
  font-size: 24px;
  color: #000;
  border: none;
  // border-bottom: 1px solid #e8e8e8;
  display: block;
  width: 728px;
  margin: 12px auto 12px;
  &:focus {
    box-shadow: none;
  }
}

#markdown-editor {
  /deep/ .editor-toolbar {
    position: fixed;
    top: 0px;
    z-index: 3000;
    &:before {
      margin-bottom: 7px;
    }
  }
}
.editor-container {
  padding: 32px 89px 16px 24px;
  border: 1px solid #e8e8e8;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(115, 115, 115, 0.08);
}
.ant-drawer {
  z-index: 1025;
}

.upload-img {
  width: 80px;
}
.upload-icon {
  font-size: 18px;
  margin-top: 8px;
  display: block;
}

.post-settings {
  /deep/ .ant-collapse-item {
    border-bottom: 1px solid #e8e8e88a;
    > .ant-collapse-header {
      padding-left: 16px;
      background: #fbfbfb;
      .arrow {
        left: auto;
        right: 16px;
      }
    }
    &.ant-collapse-item-active {
      > .ant-collapse-header {
        background: #fff;
      }
    }
  }
}
.footer-info {
  text-align: center;
  color: #666;
  font-size: 12px;
  font-weight: lighter;
  -webkit-font-smoothing: antialiased;
  padding-top: 6px;
  margin-top: 8px;
  border-top: 1px solid #e8e8e88a;
  .link {
    color: #666;
    &:hover {
      color: #101010;
    }
  }
}

.editor-wrapper {
  width: 100%;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;

  .post-editor {
    flex: 1;

    /deep/ .monaco-markdown-editor {
      width: 728px;
    }

    /deep/ .monaco-editor {
      .scrollbar {
        position: fixed !important;
        top: 110px !important;
      }
    }
  }
}
.right-tool-container,
.right-bottom-tool-container {
  position: fixed;
  right: 12px;
  display: flex;
  flex-direction: column;
  color: #A0AEC0;
  transition: color 0.3s ease;
  transition: opacity 700ms ease;
  &:hover {
    color: #4A5568;
  }
  .op-btn {
    font-size: 18px;
    margin-top: 8px;
    padding: 4px;
    border-radius: 4px;
    line-height: 1;
    transition: all 0.3s;
    &:hover {
      background: #efefef;
      color: #515457;
    }
  }
}

.right-tool-container {
  bottom: 50%;
  transform: translateY(50%);
}

.right-bottom-tool-container {
  bottom: 2px;
}

.post-title-container {
  margin-left: 65px;
}

.save-tip {
  padding: 4px 10px;
  line-height: 22px;
  font-size: 12px;
  color: #b7b7b7;
  position: fixed;
  left: 0;
  bottom: 0;
}

.preview-container {
  width: 100%;
  flex-shrink: 0;
  font-family: "Droid Serif","PingFang SC","Hiragino Sans GB","Droid Sans Fallback","Microsoft YaHei",sans-serif;
  font-size: 15px;

  /deep/ a {
    color: rgba(0,0,0,.98);
    word-wrap: break-word;
    text-decoration: none;
    border-bottom: 1px solid rgba(0,0,0,.26);
    &:hover {
      color: #000;
      border-bottom: 1px solid #000;
    }
  }
  /deep/ img {
    display: block;
    max-width: 100%;
    border-radius: 2px;
    margin: 24px auto;
  }

  /deep/ p {
    line-height: 1.62;
    margin-bottom: 1.12em;
    font-size: 15px;
    letter-spacing: .05em;
    hyphens: auto;
  }

  /deep/ p, /deep/ li {
    line-height: 1.62;
    code {
      font-family: 'Source Code Pro', Consolas, Menlo, Monaco, 'Courier New', monospace;
      line-height: initial;
      word-wrap: break-word;
      border-radius: 0;
      background-color: #FFF5F5;
      color: #C53030;
      padding: .2em .33333333em;
      font-size: .875rem;
      margin-left: .125em;
      margin-right: .125em;
    }
  }

  /deep/ pre {
    background: #f7f6f3;
    padding: 16px;
    border-radius: 2px;
    code {
      color: #000;
      font-family: 'Source Code Pro', Consolas, Menlo, Monaco, 'Courier New', monospace;
    }
  }

  /deep/ blockquote {
    color: #9a9a9a;
    position: relative;
    padding: .4em 0 0 2.2em;
    font-size: .96em;
    &:before {
      position: absolute;
      top: -4px;
      left: 0;
      content: "\201c";
      font: 700 62px/1 serif;
      color: rgba(0,0,0,.1);
    }
  }

  /deep/ table {
    border-collapse: collapse;
    margin: 1rem 0;
    width: 100%;
    tr {
      border-top: 1px solid #dfe2e5;
      &:nth-child(2n) {
        background-color: #f6f8fa;
      }
    }
    td, th {
      border: 1px solid #dfe2e5;
      padding: .6em 1em;
    }
  }

  /deep/ ul, /deep/ ol {
    padding-left: 35px;
    line-height: 1.62;
    margin-bottom: 16px;
  }

  /deep/ ol {
    list-style: decimal !important;
  }

  /deep/ ul {
    list-style-type: square !important;
  }

  /deep/ h1, h2, h3, h4, h5, h6 {
    margin: 16px 0;
    font-weight: 700;
    padding-top: 16px;
  }
  /deep/ h1 {
    font-size: 1.8em;
  }
  /deep/ h2 {
    font-size: 1.42em;
  }
  /deep/ h3 {
    font-size: 1.17em;
  }
  /deep/ h4 {
    font-size: 1em;
  }
  /deep/ h5 {
    font-size: 1em;
  }
  /deep/ h6 {
    font-size: 1em;
    font-weight: 500;
  }
  /deep/ hr {
    display: block;
    border: 0;
    margin: 2.24em auto 2.86em;
    &:before {
      color: rgba(0,0,0,.2);
      font-size: 1.1em;
      display: block;
      content: "* * *";
      text-align: center;
    }
  }

  /deep/ .footnotes {
    margin-left: auto;
    margin-right: auto;
    max-width: 760px;
    padding-left: 18px;
    padding-right: 18px;
    &:before {
      content: "";
      display: block;
      border-top: 4px solid rgba(0,0,0,.1);
      width: 50%;
      max-width: 100px;
      margin: 40px 0 20px;
    }
  }

  /deep/ .contains-task-list {
    list-style-type: none;
    padding-left: 30px;
  }
  /deep/ .task-list-item {
    position: relative;
  }
  /deep/ .task-list-item-checkbox {
    position: absolute;
    cursor: pointer;
    width: 16px;
    height: 16px;
    margin: 4px 0 0;
    top: -1px;
    left: -22px;
    transform-origin: center;
    transform: rotate(-90deg);
    transition: all .2s ease;
    &:checked {
      transform: rotate(0);
      &:before {
        border: transparent;
        background-color: #9AE6B4;
      }
      &:after {
        transform: rotate(-45deg) scale(1);
      }
      + .task-list-item-label {
        color: #999;
        text-decoration: line-through;
      }
    }
    &:before {
      content: "";
      width: 16px;
      height: 16px;
      box-sizing: border-box;
      display: inline-block;
      border: 1px solid #9AE6B4;
      border-radius: 2px;
      background-color: #fff;
      position: absolute;
      top: 0;
      left: 0;
      transition: all .2s ease;
    }
    &:after {
      content: "";
      transform: rotate(-45deg) scale(0);
      width: 9px;
      height: 5px;
      border: 1px solid #22543D;
      border-top: none;
      border-right: none;
      position: absolute;
      display: inline-block;
      top: 4px;
      left: 4px;
      transition: all .2s ease;
    }
  }

  /deep/ .markdownIt-TOC {
    list-style: none;
    background: #f7fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    color: #4a5568;
  }

  /deep/ .markdownIt-TOC ul {
    list-style: none;
    padding-left: 16px;
  }

  /deep/ mark {
    background: #FAF089;
    color: #744210;
  }
}

.preview-title {
  font-size: 24px;
  font-weight: bold;
  font-family: "Droid Serif","PingFang SC","Hiragino Sans GB","Droid Sans Fallback","Microsoft YaHei",sans-serif;
}

.preview-date {
  font-size: 13px;
  color: #718096;
  margin-bottom: 16px;
}

.preview-tags {
  font-size: 12px;
  margin-bottom: 16px;
  .tag {
    display: inline-block;
    margin: 0 8px 8px 0;
    padding: 4px 8px;
    background: #F7FAFC;
    color: #4A5568;
    border-radius: 20px;
  }
}

.preview-feature-image {
  max-width: 100%;
  margin-bottom: 16px;
  border-radius: 2px;
}

.keyboard-container {
  width: 200px;
  .keyboard-group-title {
    margin: 8px 0;
    font-size: 12px;
  }
  .list {
    .list-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px;
      border-radius: 2px;
      &:not(:last-child) {
        border-bottom: 1px solid #fafafa;
      }
      &:hover {
        background: #FFFFF0;
        color: #B7791F;
      }

      code {
        padding: 0px 4px;
        border-radius: 2px;
        background: #EDF2F7;
      }
    }
  }
}

.post-stats {
  display: flex;
  .item {
    width: 50%;
    min-width: 80px;
    h4 {
      color: #718096;
      font-size: 12px;
      font-weight: normal;
    }
    .number {
      font-size: 18px;
      font-family: 'Droid Serif';
    }
  }
}

.keyboard-tip {
  font-size: 12px;
  color: #909090;
}
</style>
