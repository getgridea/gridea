<template>
  <div class="form-container">
    <i-form label-position="top">
      <i-form-item label="🛫 标题">
        <i-input v-model="form.title" @on-blur="checkTitle"></i-input>
      </i-form-item>
      <i-form-item label="🔗 链接" v-if="showLink">
        <i-input v-model="form.fileName">
          <span slot="prepend">http://xxx.com/post/yyyy-mm-dd/</span>
          <span slot="append">.html</span>
        </i-input>
      </i-form-item>
      <i-form-item label="️️️🏷️ 标签">
        <i-tag
          v-for="(tag, index) in tags"
          :key="index"
          :checked="tag.checked"
          checkable
          color="blue"
          @click.native="selectTag(tag)"
        >{{ tag.name }}</i-tag>
        <i-input
          v-model="newTag"
          placeholder="New Tag"
          size="small"
          style="width: 100px;"
          @on-enter="addTag"
        ></i-input>
      </i-form-item>
      <i-form-item label="🏞 图片库">
        <i-button @click="imageModalVisible = true" icon="images"></i-button>
      </i-form-item>
      <i-form-item label="📝 内容">
        <div class="markdown-con">
          <markdown-editor class="md-editor" :configs="configs" preview-class="markdown-body" v-model="form.content"></markdown-editor>
          <div class="btns">
            <i-button type="primary" @click="save">保 存</i-button>
            <i-button type="text" @click="$router.push('/post-list')">取 消</i-button>
          </div>
        </div>
      </i-form-item>
    </i-form>

    <!-- 图片库详情 -->
    <i-modal v-model="imageModalVisible">
      <post-images></post-images>
      <div slot="footer">
        📃 点击图片复制地址粘贴到文章即可
      </div>
    </i-modal>
  </div>
</template>

<script>
import fse from 'fs-extra'
import moment from 'moment'
import matter from 'gray-matter'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor'
import PostImages from './PostImages'

export default {
  components: {
    MarkdownEditor,
    PostImages,
  },
  props: {
    post: Object,
  },
  data() {
    return {
      form: {
        title: '',
        date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'), // 24小时制 HH
        tags: [],
        content: '',
        fileName: '',
      },
      newTag: '',
      tags: [],
      showLink: false,
      configs: {
        toolbar: ['bold', 'italic', 'heading', 'code', 'quote', 'unordered-list', 'ordered-list', 'link', 'preview', 'fullscreen', 'guide'],
      },
      imageModalVisible: false,
    }
  },
  mounted() {
    console.log(this.post)
    if (this.post) {
      this.form.title = this.post.data.title
      this.form.tags = (this.post.data.tags || '').split(' ')
      this.form.date = moment(this.post.data.date).format('YYYY-MM-DD HH:mm:ss')
      this.form.content = this.post.content
      this.form.fileName = this.post.fileName
    }
    console.log(this.form)
    this.initTags()
  },
  methods: {
    async save() {
      const mdStr = `---
title: ${this.form.title}
date: ${this.form.date}
tags: ${this.form.tags.join(' ')}
---
${this.form.content}
`
      try {
        const basePath = this.$db.get('remote').value().source
        // write file must use fse, beause fs.writeFile need callback
        await fse.writeFile(`${basePath}/posts/${this.form.fileName}.md`, mdStr)
        const post = matter(mdStr)
        post.fileName = this.form.fileName // 更新DB时添加fileName字段
        await this.$db.get('posts').push(post).write()
        this.$Message.success('🎉 恭喜，您又多了一篇新创作！')
        this.$router.push('/post-list')
      } catch (e) {
        console.log(e)
      }
    },
    addTag() {
      this.tags.push({
        name: this.newTag,
        checked: false,
      })
      this.newTag = ''
    },
    selectTag(tag) {
      if (!this.form.tags.includes(tag.name)) {
        this.form.tags.push(tag.name)
      } else {
        const index = this.form.tags.indexOf(tag.name)
        this.form.tags.splice(index, 1)
      }
    },
    async initTags() {
      const posts = await this.$db.get('posts').value()
      let tags = []
      posts.forEach((item) => {
        if (item.data.tags && item.data.tags !== '') {
          tags = tags.concat(item.data.tags.split(' '))
        }
      })
      tags = Array.from(new Set(tags))
      this.tags = tags.map((tag) => {
        return {
          name: tag,
          checked: this.form.tags.includes(tag),
        }
      })
    },
    checkTitle() {
      // 编辑
      if (this.post) {
        this.showLink = true
        return
      }
      if (this.form.title !== '') {
        this.showLink = true
        this.form.fileName = this.form.title
      } else {
        this.showLink = false
        this.form.fileName = ''
      }
    },
  },
}
</script>

<style lang="scss" scoped>
@import '~simplemde/dist/simplemde.min.css';
@import '~github-markdown-css';

.form-container {
  padding: 20px;
}
.markdown-con {
  display: flex;
  flex-direction: column;
  flex: 1;
  .md-editor {
    display: flex;
    flex-direction: column;
    flex: 1;
    .CodeMirror {
      flex: 1;
    }
  }
}
.markdown-editor .CodeMirror, .markdown-editor .CodeMirror-scroll {
  min-height: 0;
  flex: 1 !important;
}
.markdown-editor .CodeMirror {
  flex: 1;
}
.ivu-tag:not(.ivu-tag-border):not(.ivu-tag-dot):not(.ivu-tag-checked) {
  background: #eee;
}
</style>
