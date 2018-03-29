<template>
  <div class="post-import">
    <div style="padding: 8px;">
      <upload
        multiple
        action=""
        :before-upload="handleUpload"
      >
        <i-button icon="ios-cloud-upload-outline">Upload Markdown</i-button>
      </upload>
    </div>
    <div v-if="files.length > 0">
      <div>
        已选择文件: <span class="count">{{ files.length }}</span> 个
      </div>
      <div>
        <i-button type="text" @click="upload">点击上传</i-button>
      </div>
    </div>
  </div>
</template>

<script>
import fse from 'fs-extra'

export default {
  props: {
    postList: Array,
  },
  data() {
    return {
      files: [],
      setting: null,
    }
  },
  mounted() {
    this.setting = this.$store.state.setting
  },
  methods: {
    handleUpload(file) {
      this.files.push(file)
      return false
    },
    async upload() {
      for (let i in this.files) {
        const matchPost = this.postList.filter(post => `${post.fileName}.md` === this.files[i].name)
        if (matchPost.length > 0) {
          this.$Message.error(`😔 您有文件名重名文章, 文件名：${this.files[i].name}`)
        } else {
          await fse.copySync(`${this.files[i].path}`, `${this.setting.source}/posts/${this.files[i].name}`)
        }
      }
      this.$Message.success('🎉 文章导入完毕')
      this.$emit('fetchPost')
    },
  },
}
</script>

<style lang="scss" scoped>
.post-import {
  text-align: center;
}
.count {
  font-size: 24px;
}
</style>
