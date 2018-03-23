<template>
  <div class="">
    <div class="tool">
      <i-upload :before-upload="handleUpload" action="">
        <i-button long type="primary" icon="ios-cloud-upload-outline">选择图片</i-button>
      </i-upload>
      <div v-if="file !== null">
        Upload file: {{ file.name }}
        <i-button type="text" @click="upload">点击上传</i-button>
      </div>
    </div>
    <div class="images-container">
      <div class="item"
        v-if="images"
        v-for="(image, index) of images"
        :key="index"
      >
        <i-poptip
          confirm
          title="你确认删除这张图片吗？"
          @on-ok="deleteImage(image)"
        >
          <img :src="`static/post-images/${image}`" width="100%" height="100%">
        </i-poptip>
      </div>
    </div>
  </div>
</template>

<script>
import fse from 'fs-extra'

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
    handleUpload(file) {
      this.file = file
      return false
    },
    async fetchPostImages() {
      this.images = await fse.readdir(`${__static}/post-images`)
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
    async deleteImage(image) {
      await fse.removeSync(`${__static}/post-images/${image}`)
      await fse.removeSync(`${this.setting.source}/post-images/${image}`)
      this.$Message.success('图片已删除')
      await this.fetchPostImages()
    },
  },
}
</script>

<style lang="scss" scoped>
.images-container {
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
.tool {
  text-align: center;
  padding: 32px 0;
  background: #eee;
}
</style>
