<template>
  <a-modal :visible="visible" :footer="null" :closable="false" width="100%" style="top: 0px; padding-bottom: 0px; height: 100%;">
    <div slot="title">
      <a-row type="flex" justify="end">
        <a-button class="btn" @click="close">取消</a-button>
        <a-button class="btn" :disabled="!canSubmit" @click="saveDraft">存草稿</a-button>
        <a-button class="btn" type="primary" :disabled="!canSubmit" @click="savePost">保存</a-button>
      </a-row>
    </div>
    <div>
      <a-row :gutter="8">
        <a-col :span="16">
          <a-input size="large" :placeholder="$t('title')" v-model="form.title" @change="handleTitleChange"></a-input>
          <markdown-editor
            id="markdown-editor"
            ref="editor"
            class="md-editor"
            :configs="configs"
            preview-class="markdown-body"
            v-model="form.content"
          ></markdown-editor>
        </a-col>
        <a-col :span="8">
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
            </a-collapse-panel>
          </a-collapse>
        </a-col>
      </a-row>

      <!-- 编辑器点击图片上传用 -->
      <input ref="uploadInput" class="upload-input" type="file" @change="fileChangeHandler">
    </div>
  </a-modal>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import { Vue, Component, Prop } from 'vue-property-decorator'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor.vue'
import { State } from 'vuex-class'
import shortid from 'shortid'
import moment from 'moment'
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
    }, 'link', 'preview', 'fullscreen'],
    promptURLs: true,
    spellChecker: false,
  }

  form = {
    title: '',
    fileName: '',
    tags: [] as string[],
    date: moment(new Date()),
    content: '',
    published: false,
    featureImage: {
      path: '',
      name: '',
      type: '',
    },
    deleteFileName: '',
  }

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
        this.form.tags = currentPost.data.tags && currentPost.data.tags.split(' ') || []
        this.form.date = moment(currentPost.data.date)
        this.form.content = currentPost.content
        this.form.published = currentPost.data.published
        this.form.featureImage.path = currentPost.data.feature && currentPost.data.feature.substring(7) || ''
        this.form.featureImage.name = this.form.featureImage.path.replace(/^.*[\\\/]/, '')
      }
    } else {
      if (this.site.themeConfig.postUrlFormat === UrlFormats.ShortId) {
        this.form.fileName = shortid.generate()
      }
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

  checkArticleValid() {
    const restPosts = JSON.parse(JSON.stringify(this.site.posts))
    const foundPostIndex = restPosts.findIndex((post: IPost) => post.fileName === this.form.fileName)
    if (foundPostIndex !== -1) {
      // 新增
      if (this.currentPostIndex === -1) {
        return false
      } else {
        restPosts.splice(this.currentPostIndex, 1)
        const index = restPosts.findIndex((post: IPost) => post.fileName === this.form.fileName)
        if (index !== -1) {
          return false
        }
      }
    }

    return true
  }

  saveDraft() {
    this.buildFileName()
    const valid = this.checkArticleValid()
    if (!valid) {
      this.$message.error('文章的 URL 与其他文章重复')
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
    form.published = false

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$message.success(`🎉  ${this.$t('draftSuccess')}`)
      this.close()
      this.$emit('fetchData')
    })
  }

  savePost() {
    this.buildFileName()
    const valid = this.checkArticleValid()
    if (!valid) {
      this.$message.error('文章的 URL 与其他文章重复')
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
    form.published = true

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
              this.$message.error('仅支持图片拖拽')
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
    }
  }

  uploadImageFiles(files: any[]) {
    ipcRenderer.send('image-upload', files)
    ipcRenderer.once('image-uploaded', (event: Event, data: any) => {
      for (const path of data) {
        const url = `![](file://${path})`
        const editor = this.$refs.editor.simplemde.codemirror

        // 在光标处插入 https://codemirror.net/doc/manual.html#replaceSelection
        editor.replaceSelection(url)
      }
    })
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

.feature-image {
  max-width: 100%
}
/deep/ .ant-upload.ant-upload-select-picture-card {
  width: 100%
}

/deep/ .ant-modal-content {
  height: 100%;
}
</style>

<style>
@import '~simplemde/dist/simplemde.min.css';
/* @import '~github-markdown-css'; */
.CodeMirror {
  border-radius: 2px;
  border-color: #b3b3b3;
  box-shadow: 0 0 5px #eee;
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
.CodeMirror .editor-preview .markdown-body .editor-preview-active img {
  max-width: 100%;
  display: block;
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
