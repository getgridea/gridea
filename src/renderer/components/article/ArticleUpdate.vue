<template>
  <div class="">
    <v-card flat>
      <v-container fluid>
        <v-form>
          <v-text-field v-model="form.title" :counter="24" label="标题"></v-text-field>
          <v-text-field v-show="false" v-model="form.fileName" label="文件名（文章链接地址）"></v-text-field>
          <v-select v-model="form.tags" :items="tags" label="标签" multiple small-chips deletable-chips></v-select>
          <v-dialog ref="dialog" v-model="modal" :return-value.sync="form.date" persistent lazy full-width width="290px">
            <v-text-field slot="activator" v-model="form.date" label="写作日期" prepend-icon="event" readonly></v-text-field>
            <v-date-picker locale="zh-cn" :first-day-of-week="0" v-model="form.date" scrollable>
              <v-spacer></v-spacer>
              <v-btn flat @click="modal = false">取消</v-btn>
              <v-btn flat color="primary" @click="$refs.dialog.save(form.date)">选择</v-btn>
            </v-date-picker>
          </v-dialog>
          <div>内容</div>
          <markdown-editor
            id="markdown-editor"
            ref="editor"
            class="md-editor"
            :configs="configs"
            preview-class="markdown-body"
            v-model="form.content"
          ></markdown-editor>
          <v-btn depressed @click="$router.push('/articles')">取消</v-btn>
          <v-btn depressed @click="saveDraft">存草稿</v-btn>
          <v-btn depressed color="primary" @click="publish">发布</v-btn>
        </v-form>
      </v-container>
    </v-card>
    <!-- 编辑器点击图片上传用 -->
    <input ref="uploadInput" class="upload-input" type="file" @change="fileChangeHandler">
    
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor.vue'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import slug from '../../../helpers/slug'
import { IPost } from '../../interfaces/post'
import { Site } from '../../store/modules/site'

@Component({
  components: { MarkdownEditor },
})
export default class ArticleUpdate extends Vue {
  $refs!: {
    editor: any
    uploadInput: any
  }

  @State('site') site!: Site

  modal = false
  form = {
    title: '',
    fileName: '',
    tags: [] as string[],
    date: this.$dayjs(new Date()).format('YYYY-MM-DD'),
    content: '',
    published: false,
  }
  
  get tags() {
    return this.site.tags.map((tag: any) => tag.name)
  }

  configs = {
    toolbar: ['bold', 'italic', 'heading', 'code', 'quote', 'unordered-list', 'ordered-list', {
      name: 'image',
      action: (editor: any) => {
        this.$refs.uploadInput.click()
      },
      className: 'fa fa-picture-o',
      title: '图片',
    }, 'link', 'preview', 'fullscreen', 'guide'],
    promptURLs: true,
    spellChecker: false,
  }

  mounted() {
    const { articleFileName } = this.$route.params
    const currentPost: IPost | undefined = this.site.posts.find((item: IPost) => item.fileName === articleFileName)
    if (currentPost) {
      this.form.title = currentPost.data.title
      this.form.fileName = currentPost.fileName
      this.form.tags = currentPost.data.tags && currentPost.data.tags.split(' ') || []
      this.form.date = this.$dayjs(currentPost.data.date).format('YYYY-MM-DD')
      this.form.content = currentPost.content
      this.form.published = currentPost.data.published
    }
    
    this.initEditor()
  }

  saveDraft() {
    const form = {
      ...this.form,
    }
    form.fileName = form.fileName === '' ? slug(form.title) : form.fileName
    form.published = false

    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$bus.$emit('snackbar-display', '🎉  草稿保存成功')
      this.$router.push({ name: 'articles' })
    })
  }

  publish() {
    const form = {
      ...this.form,
    }
    form.fileName = form.fileName === '' ? slug(form.title) : form.fileName
    form.published = true
    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$bus.$emit('snackbar-display', '🎉  文章发布成功')
      this.$router.push({ name: 'articles' })
    })
  }

  initEditor() {
    console.log(this.$refs.editor)
    if (this.$refs.editor !== null) {
      const { codemirror } = this.$refs.editor.simplemde

      // 拖拽上传
      codemirror.on(('drop'), (editor: any, e: DragEvent) => {
        const dataList = e.dataTransfer.files
        const imageFiles = []
        
        for (let i = 0; i < dataList.length; i += 1) {
          if (dataList[i].type.indexOf('image') === -1) {
            console.log('仅支持图片拖拽')
          }
          imageFiles.push({
            name: dataList[i].name,
            path: dataList[i].path,
            type: dataList[i].type,
          })
        }
        console.log(imageFiles)
        this.uploadImageFiles(imageFiles)
        e.preventDefault()
      })

      // 复制、截图上传
      // codemirror.on('paste', (editor: any, e: any) => {
      //   if (!(e.clipboardData && e.clipboardData.items)) {
      //     return
      //   }
      //   try {
      //     const dataList = e.clipboardData.items
      //     const image = dataList[0].getAsFile()

      //     if (dataList[0].kind === 'file' && image.type.indexOf('image') !== -1) {
      //       console.log(image)
      //       this.uploadImageFiles([{
      //         name: image.name,
      //         path: image.path,
      //         type: image.type,
      //       }])
      //     }
      //   } catch (e) {
      //     this.$bus.$emit('snackbar-display', { color: 'error', message: '粘贴的不是图片' })
      //   }
      // })
    }
  }

  uploadImageFiles(files: any[]) {
    ipcRenderer.send('image-upload', files)
    ipcRenderer.once('image-uploaded', (event: Event, data: any) => {
      for (let i = 0; i < data.length; i += 1) {
        const url = `![](file://${data[i]})`
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
        }
      ])
    }
  }

}
</script>

<style lang="stylus" scoped>
.upload-input
  display none
</style>


<style>
@import '~simplemde/dist/simplemde.min.css';
/* @import '~github-markdown-css'; */
.CodeMirror {
  border-radius: 0;
  border-color: #fff;
  box-shadow: 0 0 5px #eee;
}
.editor-toolbar {
  border-color: #fff;
  box-shadow: none;
  border-radius: 2px;
}
.editor-toolbar a.active, .editor-toolbar a:hover {
  border-color: #95a5a6;
  background: #95a5a6;
  border-radius: 0;
}
.editor-toolbar a {
  color: #000 !important;
}
.CodeMirror .editor-preview .markdown-body .editor-preview-active img {
  max-width: 100%;
  display: block;
}
</style>
