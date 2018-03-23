<template>
  <div class="new-common-page">
    <i-form label-position="top">
      <i-form-item label="标题">
        <i-input v-model="form.title" @on-blur="checkTitle"></i-input>
      </i-form-item>
      <i-form-item label="链接（建议用英文，例如：about）" v-if="showLink">
        <i-input v-model="form.linkName">
          <span slot="prepend">http://xxx.com/</span>
        </i-input>
      </i-form-item>
      <i-form-item label="内容">
        <div class="markdown-con">
          <markdown-editor class="md-editor" preview-class="markdown-body" v-model="form.content"></markdown-editor>
          <div class="btns">
            <i-button type="primary" @click="save">保存</i-button>
          </div>
        </div>
      </i-form-item>
    </i-form>

  </div>
</template>

<script>
import fs from 'fs'
import fse from 'fs-extra'
import matter from 'gray-matter'
import MarkdownEditor from 'vue-simplemde/src/markdown-editor'
import { mapActions } from 'vuex'
import { website } from '@/store/types'

export default {
  props: {
    page: Object,
  },
  components: {
    MarkdownEditor,
  },
  data() {
    return {
      form: {
        title: '',
        linkName: '',
        content: '',
        index: 0,
      },
      showLink: false,
    }
  },
  created() {
    if (this.page) {
      this.showLink = true
      this.form.title = this.page.data.title
      this.form.content = this.page.content
      this.form.index = this.page.data.index
      this.form.linkName = this.page.linkName
    }
  },
  methods: {
    ...mapActions({
      acUpdateWebsiteMenus: website.actions.UPDATE_MENUS,
    }),
    checkTitle() {
      if (this.form.title !== '') {
        this.showLink = true
        this.form.linkName = this.form.title
      } else {
        this.showLink = false
        this.form.linkName = ''
      }
    },
    async save() {
      const mdStr = `---
title: ${this.form.title}
---
${this.form.content}
`
      const basePath = this.$store.state.setting.source
      try {
        // 写文件
        await fse.ensureDir(`${basePath}/pages/${this.form.linkName}`)
        await fs.writeFile(`${basePath}/pages/${this.form.linkName}/index.md`, mdStr)
        // 写 JSON 数据库
        const page = matter(mdStr)
        page.linkName = this.form.linkName
        if (!this.$db.has('pages').value()) {
          this.$db.defaults({ pages: [] }).write()
        }
        const pageObj = this.$db.get('pages').find({linkName: this.form.linkName})
        const pageExist = pageObj.value()
        if (pageExist) {
          await pageObj.assign(page).write()
        } else {
          await this.$db.get('pages').push(page).write()
        }
        // 更新 store 中菜单
        const menus = await this.$site.get('menus').value()
        this.acUpdateWebsiteMenus(menus)
        this.$Message.success('Page is saved!')
      } catch (e) {
        console.log(e)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
  @import '~simplemde/dist/simplemde.min.css';
  @import '~github-markdown-css';
  .new-common-page {
    padding: 20px;
  }
</style>
