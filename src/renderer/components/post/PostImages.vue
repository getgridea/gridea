<template>
  <div class="">
    <div class="images-list">
      <div class="item"
        v-if="images"
        v-for="(image, index) of images"
        :key="index"
        @click="copyMarkdownImage(image)"
      >
        <img :src="`static/post-images/${image}`" width="100%" height="100%">
      </div>
    </div>
    <div class="upload-container">
      <i-upload :before-upload="handleUpload" action="">
        <Button type="ghost" icon="ios-cloud-upload-outline">选择图片</Button>
      </i-upload>
      <div v-if="file !== null">
        Upload file: {{ file.name }}
        <i-button type="text" @click="upload">点击上传</i-button>
      </div>
    </div>
  </div>
</template>

<script>
import Clipboard from 'clipboard'
import fse from 'fs-extra'
import PostImages from '@/lib/util/post-images'
const postImages = new PostImages()

export default {
  data() {
    return {
      setting: null,
      images: null,
      file: null,
    }
  },
  async mounted() {
    this.setting = this.$store.state.setting
    await this.fetchPostImages()
  },
  methods: {
    async fetchPostImages() {
      this.images = await postImages.getImages(`${__static}/post-images`)
    },
    handleUpload(file) {
      this.file = file
      return false
    },
    async upload() {
      if (this.images.includes(this.file.name)) {
        this.$Message.error('😞 抱歉已经存在同名的图片，请修改名称后重新上传。')
        return
      }
      // 上传到应用
      await fse.copySync(`${this.file.path}`, `${__static}/post-images/${this.file.name}`)
      // 上传到源文件目录
      await fse.copySync(`${this.file.path}`, `${this.setting.source}/post-images/${this.file.name}`)
      this.file = null
      this.$Message.success('🎉 图片上传成功')
      await this.fetchPostImages()
    },
    copyMarkdownImage(image) {
      const clip =  new Clipboard('.item', {
        text: () => `![描述文字](${this.setting.domain}/post-images/${image})`,
      })
      console.log('clip', clip)
      this.$Message.success('😏 已复制!')
    },
  },
}
</script>

<style lang="scss" scoped>
.images-list {
  display: flex;
  padding: 8px;
}
.item {
  width: 25%;
  padding: 16px;
  cursor: pointer;
  &:hover {
    border: 1px solid #b6d7f1;
  }
  img {
    border-radius: 3%;
  }
}
.upload-container {
  text-align: center;
  padding: 8px 0;
}
</style>
