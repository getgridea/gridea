<template>
  <div class="article-update-page" v-if="visible">
    <div class="page-title">
      <a-row type="flex" justify="end">
        <a-button class="btn" @click="close">{{ $t('cancel') }}</a-button>
        <a-button class="btn" :disabled="!canSubmit" @click="saveDraft">{{ $t('saveDraft') }}</a-button>
        <a-button class="btn" type="primary" :disabled="!canSubmit" @click="savePost">{{ $t('save') }}</a-button>
      </a-row>
    </div>
    <div class="page-content">
      <a-row :gutter="16">
        <a-col :span="16">
          <a-input class="post-title" size="large" :placeholder="$t('title')" v-model="form.title" @change="handleTitleChange"></a-input>
          <div class="tip-text">{{ $t('editorTip') }}</div>
          <markdown-editor
            id="markdown-editor"
            ref="editor"
            class="md-editor"
            :configs="configs"
            preview-class="markdown-body"
            v-model="form.content"
            @click.native.capture="preventDefault($event)"
          ></markdown-editor>
        </a-col>
        <a-col :span="8" class="right-container">
          <a-collapse v-model="activeKey">
            <a-collapse-panel header="URL" key="1">
              <a-input v-model="form.fileName" @change="handleFileNameChange"></a-input>
            </a-collapse-panel>
            <a-collapse-panel :header="$t('tag')" key="2">
              <div>
                <a-select mode="multiple" style="width: 100%" v-model="form.tags">
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
                <a-radio-button value="DEFAULT">默认</a-radio-button>
                <a-radio-button value="EXTERNAL">外链</a-radio-button>
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
                    <a-icon type="plus" />
                    <div class="ant-upload-text">Upload</div>
                  </div>
                </a-upload>
                <a-button v-if="form.featureImage.path" type="danger" block icon="delete" @click="form.featureImage = {}" />
              </div>
              <div v-if="featureType === 'EXTERNAL'">
                <a-input v-model="form.featureImagePath"></a-input>
                <div class="tip-text">路径必须包含 http 或 https</div>
                <div class="feature-image-container" v-if="form.featureImagePath">
                  <img class="feature-image" :src="form.featureImagePath" height="150">
                </div>
              </div>
            </a-collapse-panel>
            <a-collapse-panel :header="$t('hideInList')" key="5">
              <a-switch v-model="form.hideInList"></a-switch>
            </a-collapse-panel>
          </a-collapse>
        </a-col>
      </a-row>

      <!-- 编辑器点击图片上传用 -->
      <input ref="uploadInput" class="upload-input" type="file" @change="fileChangeHandler">
    </div>
  </div>
</template>

<script lang="ts">
import {
  ipcRenderer, Event, shell, clipboard, remote,
} from 'electron'
import { Vue, Component, Prop } from 'vue-property-decorator'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor.vue'
import { State } from 'vuex-class'
import shortid from 'shortid'
import moment from 'moment'
import * as fse from 'fs-extra'
import slug from '../../helpers/slug'
import { IPost } from '../../interfaces/post'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/enums'

@Component({
  components: { MarkdownEditor },
})
export default class ArticleUpdate extends Vue {
  @Prop(Boolean) visible!: boolean

  @Prop(String) articleFileName!: string

  $refs!: {
    editor: any,
    uploadInput: any,
    image: any,
    articlePage: HTMLElement,
  }

  @State('site') site!: Site

  configs = {
    toolbar: ['bold', 'italic', 'heading', 'code', 'quote', 'unordered-list', 'ordered-list', {
      name: 'image',
      action: (editor: any) => {
        this.$refs.uploadInput.click()
      },
      className: 'fa fa-picture-o',
      title: '图片',
    }, {
      name: 'more',
      action: (editor: any) => {
        this.insertMore()
      },
      className: 'fa fa-ellipsis-h',
      title: '摘要',
    }, {
      name: 'link',
      action: (editor: any) => {
        this.insertLink()
      },
      className: 'fa fa-link',
      title: '链接',
    }, 'preview'],
    promptURLs: true,
    spellChecker: false,
    placeholder: '输入内容...',
  }

  form = {
    title: '',
    fileName: '',
    tags: [] as string[],
    date: moment(new Date()),
    content: '',
    published: false,
    hideInList: false,
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

  mounted() {
    this.buildCurrentForm()
    this.initEditor()
  }

  buildCurrentForm() {
    const { articleFileName } = this
    console.log('articleFileName: ', articleFileName)
    if (articleFileName) {
      this.currentPostIndex = this.site.posts.findIndex((item: IPost) => item.fileName === articleFileName)
      const currentPost = this.site.posts[this.currentPostIndex]
      this.originalFileName = currentPost.fileName

      if (currentPost) {
        this.form.title = currentPost.data.title
        this.form.fileName = currentPost.fileName
        this.form.tags = currentPost.data.tags || []
        this.form.date = moment(currentPost.data.date)
        this.form.content = currentPost.content
        this.form.published = currentPost.data.published
        this.form.hideInList = currentPost.data.hideInList

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
    return false
  }

  cancel() {
    this.close()
  }

  close() {
    this.$emit('close')
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
    if (this.form.fileName === '') {
      if (this.site.themeConfig.postUrlFormat === UrlFormats.Slug) {
        this.form.fileName = slug(this.form.title)
      }
      if (this.site.themeConfig.postUrlFormat === UrlFormats.ShortId) {
        this.form.fileName = shortid.generate()
      }
    }
  }

  checkArticleUrlValid() {
    const restPosts = JSON.parse(JSON.stringify(this.site.posts))
    const foundPostIndex = restPosts.findIndex((post: IPost) => post.fileName === this.form.fileName)
    if (foundPostIndex !== -1) {
      // 新增
      if (this.currentPostIndex === -1) {
        return false
      }
      restPosts.splice(this.currentPostIndex, 1)
      const index = restPosts.findIndex((post: IPost) => post.fileName === this.form.fileName)
      if (index !== -1) {
        return false
      }
    }

    return true
  }

  formatForm(published: boolean) {
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
    if (this.form.fileName !== this.originalFileName) {
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
    form.published = published

    return form
  }

  saveDraft() {
    const form = this.formatForm(false)

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$message.success(`🎉  ${this.$t('draftSuccess')}`)
      this.close()
      this.$emit('fetchData')
    })
  }

  savePost() {
    const form = this.formatForm(true)

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$message.success(`🎉  ${this.$t('saveSuccess')}`)
      this.close()
      this.$emit('fetchData')
    })
  }

  initEditor() {
    console.log(this.$refs.editor)
    if (this.$refs.editor !== null) {
      const { codemirror } = this.$refs.editor.simplemde

      // 拖拽上传
      codemirror.on(('drop'), (editor: any, e: DragEvent) => {
        if (e && e.dataTransfer) {
          const dataList = e.dataTransfer.files
          const imageFiles = []

          for (const data of dataList as any) {
            if (data.type.indexOf('image') === -1) {
              this.$message.error(this.$t('onlyPicDrag'))
              return
            }
            imageFiles.push({
              name: data.name,
              path: data.path,
              type: data.type,
            })
          }
          console.log(imageFiles)
          this.uploadImageFiles(imageFiles)
          e.preventDefault()
        }
      })
      codemirror.on(('paste'), (editor: any, e: any) => {
        if (!(e.clipboardData && e.clipboardData.items)) {
          return
        }
        try {
          const file = e.clipboardData.files[0]
          const data = e.clipboardData.items[0]
          if (data.kind === 'file' && data.type.indexOf('image') !== -1 && file.type.indexOf('image') !== -1 && file.path === '') { // file.path === '' 说明是剪切板来的
            const parseImg = clipboard.readImage()
            const imgBuffer = parseImg.toPNG()
            const tempImageFile = `${remote.app.getPath('temp')}gridea_temp.png`
            fse.writeFileSync(tempImageFile, imgBuffer)

            this.uploadImageFiles([{
              name: 'gridea_post.png',
              path: tempImageFile,
              type: data.type,
            }])
          }
        } catch (error) {
          console.log(error)
        }
      })
    }
  }

  uploadImageFiles(files: any[]) {
    ipcRenderer.send('image-upload', files)
    ipcRenderer.once('image-uploaded', (event: Event, data: any) => {
      const editor = this.$refs.editor.simplemde.codemirror
      for (const path of data) {
        let url = `![](file://${path})`
        url = url.replace(/\\/g, '/')

        // 在光标处插入 https://codemirror.net/doc/manual.html#replaceSelection
        editor.replaceSelection(url)
      }
      editor.focus()
    })
  }

  insertMore() {
    const editor = this.$refs.editor.simplemde.codemirror

    editor.replaceSelection('\n<!-- more -->\n')
    editor.focus()
  }

  insertLink() {
    const editor = this.$refs.editor.simplemde.codemirror

    editor.replaceSelection('[]()')
    editor.focus()
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
    padding: 16px 32px;
    border-bottom: 1px solid #e4e2dd;
    box-shadow: 0 3px 20px #4343430d;
    z-index: 1026;
    background: #fff;
  }
  .page-content {
    flex: 1;
    padding: 24px 16px;
    overflow: scroll;
  }
}

.tip-text {
  margin-top: 8px;
}

.right-container {
  position: fixed;
  height: 100vh;
  overflow: scroll;
  right: 8px;
  top: 0px;
  padding: 89px 0 32px;
  z-index: 999;
}

.post-title {
  font-weight: bold;
}
</style>

<style>
@import '~simplemde/dist/simplemde.min.css';
/* @import '~github-markdown-css'; */
.CodeMirror {
  border-radius: 2px;
  transition: all 0.3s;
  color: #434343;
  border: none;
  background: #f9f7f3;
}
.CodeMirror.CodeMirror-focused {
  border-color: #4f4a4a;
  outline: 0;
  -webkit-box-shadow: 0 0 0 2px rgba(67, 67, 67, 0.2);
  box-shadow: 0 0 0 2px rgba(67, 67, 67, 0.2);
  border-right-width: 1px !important;
}
.editor-toolbar {
  border-color: #fff;
  box-shadow: none;
  border-radius: 2px;
  padding: 0;
}
.editor-toolbar a.active, .editor-toolbar a:hover {
  border-color: #95a5a6;
  background: #95a5a6;
  border-radius: 0;
}
.editor-toolbar a {
  color: #000 !important;
  background: #fafafa;
  width: 32px;
  height: 32px;
}
.editor-toolbar.fullscreen {
  z-index: 1025;
}
.CodeMirror .editor-preview.markdown-body.editor-preview-active {
  line-height: 1.618;
  background: #f9f7f3;
}
.CodeMirror .editor-preview.markdown-body.editor-preview-active img {
  max-width: 100%;
  display: block;
  margin: 8px 0;
}

.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
</style>
