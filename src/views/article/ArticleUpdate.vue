<template>
  <div class="article-update-page">
    <div class="page-header">
      <h3>𝗛𝘃𝗲 𝗡𝗼𝘁𝗲𝘀</h3>
    </div>
    <div class="page-content">
      <v-slide-y-transition mode="out-in">
        <v-form>
          <v-layout fill-height row wrap>
            <v-flex xs8>
              <v-text-field v-model="form.title" :counter="50" :label="$t('title')" @input="handleTitleChange"></v-text-field>
              <markdown-editor
                id="markdown-editor"
                ref="editor"
                class="md-editor"
                :configs="configs"
                preview-class="markdown-body"
                v-model="form.content"
              ></markdown-editor>
              <v-btn depressed @click="cancel">{{ $t('cancel') }}</v-btn>
              <v-btn :disabled="!canSubmit" depressed @click="saveDraft">{{ $t('saveDraft') }}</v-btn>
              <v-btn :disabled="!canSubmit" depressed color="primary" @click="savePost">{{ $t('save') }}</v-btn>
            </v-flex>
            <v-flex xs4>
              <div class="right-container">
                <v-select v-model="form.tags" :items="tags" :label="$t('tag')" multiple small-chips deletable-chips></v-select>
                <v-text-field v-model="form.fileName" label="URL" @input="handleFileNameChange"></v-text-field>
                <v-menu
                  :close-on-content-click="false"
                  v-model="dateMenu"
                  :nudge-right="40"
                  lazy
                  transition="scale-transition"
                  offset-y
                  full-width
                  min-width="290px"
                >
                  <v-text-field
                    slot="activator"
                    v-model="form.date"
                    :label="$t('createAt')"
                    prepend-icon="event"
                    readonly
                  ></v-text-field>
                  <v-date-picker v-model="form.date" @input="dateMenu = false" :locale="dateLocale"></v-date-picker>
                </v-menu>
                <!-- 文章大图 -->
                <v-flex xs12 class="text-xs-center text-sm-center text-md-center text-lg-center">
                  <img class="feature-image" :src="`file://${form.featureImage.path}`" height="150" v-if="form.featureImage.path"/>
                  <div>
                    <v-btn v-if="!form.featureImage.name" outline :block="!form.featureImage.path" @click="pickFile">{{ `🏞 ${$t('featureImage')}` }}</v-btn>
                    <p class="feature-name" v-else>{{ form.featureImage.name }}</p>
                    <v-btn flat outline v-if="form.featureImage.path" @click="form.featureImage = {}"><v-icon>clear</v-icon></v-btn>
                  </div>
                  <input
                    type="file"
                    style="display: none"
                    ref="image"
                    accept="image/*"
                    @change="onFilePicked"
                  >
                </v-flex>
              </div>
            </v-flex>
          </v-layout>
        </v-form>
      </v-slide-y-transition>
      <!-- 编辑器点击图片上传用 -->
      <input ref="uploadInput" class="upload-input" type="file" @change="fileChangeHandler">
    </div>
    
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event, shell } from 'electron'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor.vue'
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { State } from 'vuex-class'
import shortid from 'shortid'
import slug from '../../helpers/slug'
import { IPost } from '../../interfaces/post'
import { Site } from '../../store/modules/site'
import { UrlFormats } from '../../helpers/enums'

@Component({
  components: { MarkdownEditor },
})
export default class ArticleUpdate extends Vue {
  @Prop(String) articleFileName!: string
  $refs!: {
    editor: any,
    uploadInput: any,
    image: any,
    articlePage: HTMLElement,
  }

  @State('site') site!: Site

  modal = false
  dateMenu = false

  get dateLocale() {
    return this.$root.$i18n.locale === 'zhHans' ? 'zh-cn' : 'en-us'
  }

  form = {
    title: '',
    fileName: '',
    tags: [] as string[],
    date: this.$dayjs(new Date()).format('YYYY-MM-DD'),
    content: '',
    published: false,
    featureImage: {
      path: '',
      name: '',
      type: '',
    },
    deleteFileName: '',
  }

  // 编辑文章时，当前文章的索引
  currentPostIndex = -1
  originalFileName = ''
  fileNameChanged = false

  get canSubmit() {
    return this.form.title && this.form.content
  }

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

  get tags() {
    return this.site.tags.map((tag: any) => tag.name)
  }

  mounted() {
    this.initEditor()
  }

  pickFile() {
    this.$refs.image.click()
  }

  onFilePicked(e: any) {
    console.log(e)
    const file = (e.target.files || e.dataTransfer)[0]
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
  }

  cancel() {
    this.close()
  }
  close() {
    this.form.title = ''
    this.form.fileName = ''
    this.form.tags = [] as string[]
    this.form.date = this.$dayjs(new Date()).format('YYYY-MM-DD')
    this.form.content = ''
    this.form.published = false
    this.form.featureImage.path = ''
    this.form.featureImage.name = ''
    this.form.featureImage.type = ''
    this.form.deleteFileName = ''

    this.currentPostIndex = -1
    this.originalFileName = ''
    this.fileNameChanged = false

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
      this.$bus.$emit('snackbar-display', { color: 'pink', message: '文章的 URL 与其他文章重复' })
      return
    }

    // 文件名改变之后，删除原来文件
    if (this.form.fileName !== this.originalFileName) {
      this.form.deleteFileName = this.originalFileName
    }

    const form = {
      ...this.form,
    }
    form.published = false

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$bus.$emit('snackbar-display', `🎉  ${this.$t('draftSuccess')}`)
      this.close()
      this.$emit('fetchData')
    })
  }

  savePost() {
    this.buildFileName()
    const valid = this.checkArticleValid()
    if (!valid) {
      this.$bus.$emit('snackbar-display', { color: 'pink', message: '文章的 URL 与其他文章重复' })
      return
    }

    // 文件名改变之后，删除原来文件
    if (this.form.fileName !== this.originalFileName) {
      this.form.deleteFileName = this.originalFileName
    }

    const form = {
      ...this.form,
    }
    form.published = true

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$bus.$emit('snackbar-display', `🎉  ${this.$t('saveSuccess')}`)
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
              this.$bus.$emit('snackbar-display', { color: 'error', message: '仅支持图片拖拽' })
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

  @Watch('articleFileName')
  updateForm(val: string, oldVal: string) {
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
        this.form.date = this.$dayjs(currentPost.data.date).format('YYYY-MM-DD')
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

}
</script>

<style lang="stylus" scoped>
.upload-input
  display none
.title
  padding: 16px 0 0
.right-container
  background: #f3f7f9;
  padding: 32px 16px 32px;
  margin-left: 16px;
.feature-name
  width: 100%
  text-overflow ellipsis
  white-space nowrap
  overflow hidden
.feature-image
  max-width: 100%
.article-update-page
  background #ffffff
  display flex
  flex-direction column
  min-height: 100vh
  .page-header
    height 48px
    line-height 48px
    text-align center
    position fixed
    top 0
    left 0
    right 0
    background: #fff
    border-bottom 1px solid #fafafa
    z-index 1024
  .page-content
    padding 80px 32px 32px
    flex 1
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
</style>
