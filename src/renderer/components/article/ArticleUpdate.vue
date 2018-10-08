<template>
  <div class="">
    <v-card flat>
      <v-container fluid>
        <div class="form-container">
          <v-form>
            <v-text-field v-model="form.title" :counter="24" label="标题"></v-text-field>
            <v-text-field v-model="form.fileName" label="文件名（同文章链接名）"></v-text-field>
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
            <markdown-editor class="md-editor" :configs="configs" preview-class="markdown-body" v-model="form.content"></markdown-editor>
            <div class="btn-container">
              <v-btn depressed @click="$router.push('/articles')">取消</v-btn>
              <v-btn depressed @click="saveDraft">存草稿</v-btn>
              <v-btn depressed color="primary" @click="publish">发布</v-btn>
            </div>
          </v-form>
        </div>
      </v-container>
    </v-card>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor.vue'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import { IPost } from '../../interfaces/post'
import { Post } from '../../store/modules/post'

@Component({
  components: { MarkdownEditor },
})
export default class ArticleUpdate extends Vue {
  @State('post') post!: Post

  modal = false
  form = {
    title: '',
    fileName: '',
    tags: [] as string[],
    date: this.$dayjs(new Date()).format('YYYY-MM-DD'),
    content: '',
    published: false,
  }
  tags = ['测试', '前端', 'Vue.js', 'JavaScript']
  configs = {
    toolbar: ['bold', 'italic', 'heading', 'code', 'quote', 'unordered-list', 'ordered-list', 'link', 'preview', 'fullscreen', 'guide', {
      name: 'image',
      action: function insertImage(editor: any) {
        console.log('editor', editor)
      },
      className: 'fa fa-picture-o',
      title: '图片',
    }],
    promptURLs: true,
    spellChecker: false,
  }

  mounted() {
    const { articleFileName } = this.$route.params
    const currentPost: IPost | undefined = this.post.posts.find((item: IPost) => item.fileName === articleFileName)
    if (currentPost) {
      this.form.title = currentPost.data.title
      this.form.fileName = currentPost.fileName
      this.form.tags = currentPost.data.tags && currentPost.data.tags.split(' ') || []
      this.form.date = this.$dayjs(currentPost.data.date).format('YYYY-MM-DD')
      this.form.content = currentPost.content
      this.form.published = currentPost.data.published
    }
  }

  saveDraft() {
    const form = {
      ...this.form,
    }
    console.log('form: ', form)
    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      this.$router.push({ name: 'articles' })
    })
  }

  publish() {

  }
}
</script>

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

.form-container {
  padding-bottom: 24px;
}
.btn-container {
  position: fixed;
  bottom: 36px;
  right: 16px;
  background: #f5f5f5;
  padding: 8px 16px;
  z-index: 1000;
  text-align: right;
  border-radius: 4px 4px 0 0;
}
</style>
