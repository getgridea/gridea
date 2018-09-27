<template>
  <div class="">
    <v-card flat>
      <v-container fluid>
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
          <v-btn depressed @click="$router.push('/articles')">取消</v-btn>
          <v-btn depressed @click="saveDraft">存草稿</v-btn>
          <v-btn depressed color="primary" @click="publish">发布</v-btn>
        </v-form>
      </v-container>
    </v-card>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor.vue'
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  components: { MarkdownEditor },
})
export default class ArticleUpdate extends Vue {
  modal = false
  form = {
    title: '',
    fileName: '',
    tags: [],
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

  saveDraft() {
    const form = {
      ...this.form,
    }
    console.log('form: ', form)
    ipcRenderer.send('app-post-create', form)
    ipcRenderer.once('app-post-created', (event: Event, data: any) => {
      console.log(data)
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
</style>
