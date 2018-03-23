<template>
  <div class="theme">
    <h2>网站设置</h2>
    <div>
      <i-form :model="form" :label-width="130" label-position="left">
        <i-form-item label="网站头像">
          <img :src="`${avatarSrc}?${Date.now()}`" alt="" width="100px" height="100px">
          <div class="tool">
            <i-upload :before-upload="handleUpload" action="">
              <i-button long type="primary" icon="ios-cloud-upload-outline">选择图片</i-button>
            </i-upload>
            <div v-if="file !== null">
              Upload file: {{ file.name }}
              <i-button type="text" @click="upload">点击上传</i-button>
            </div>
          </div>
        </i-form-item>
        <i-form-item label="网站标题">
          <i-input v-model="form.title" placeholder="Hve"></i-input>
        </i-form-item>
        <i-form-item label="每页文章数">
          <i-input-number :min="1" v-model="form.pageSize"></i-input-number>
        </i-form-item>
        <i-form-item label="Gitment Owner">
          <i-input v-model="form.gitmentOwner" placeholder="Owner"></i-input>
        </i-form-item>
        <i-form-item label="Gitment Repo">
          <i-input v-model="form.gitmentRepo" placeholder="Repo"></i-input>
        </i-form-item>
        <i-form-item label="Gitment Client ID">
          <i-input v-model="form.gitmentClientId" placeholder="Client ID"></i-input>
        </i-form-item>
        <i-form-item label="Gitment Client Secret">
          <i-input v-model="form.gitmentClientSecret" placeholder="Client Secret"></i-input>
        </i-form-item>
        <i-form-item>
          <i-button type="primary" @click="save">保存</i-button>
        </i-form-item>
      </i-form>
    </div>
  </div>
</template>

<script>
import fse from 'fs-extra'
import { mapActions } from 'vuex'
import { website as types } from '@/store/types'

export default {
  data() {
    return {
      form: {
        title: '',
        pageSize: 5,
        gitmentOwner: '',
        gitmentRepo: '',
        gitmentClientId: '',
        gitmentClientSecret: '',
      },
      file: null,
      setting: null,
      avatarSrc: null,
    }
  },
  async created() {
    const website = this.$store.state.website
    this.form.title = website.title
    this.form.pageSize = website.pageSize
    this.form.gitmentOwner = website.gitmentOwner
    this.form.gitmentRepo = website.gitmentRepo
    this.form.gitmentClientId = website.gitmentClientId
    this.form.gitmentClientSecret = website.gitmentClientSecret

    this.setting = this.$store.state.setting
    this.fetchAvatar()
  },
  methods: {
    ...mapActions({
      acUpdateSetting: types.actions.UPDATE_SETTING,
    }),
    async save() {
      await this.$site.set('config', this.form).write()
      await this.acUpdateSetting(this.form)
      this.$Message.success('网站设置已保存')
      console.log('saved')
    },
    fetchAvatar() {
      this.avatarSrc = 'static/images/default.png'
      this.avatarSrc = 'static/images/avatar.jpg'
    },
    handleUpload(file) {
      this.file = file
      return false
    },
    async upload() {
      // 上传到应用
      await fse.copySync(`${this.file.path}`, `${__static}/images/avatar.jpg`)
      // 上传到源文件目录
      await fse.copySync(`${this.file.path}`, `${this.setting.source}/images/avatar.jpg`)
      this.file = null
      this.$Message.success('🎉 图片更换成功')
      this.fetchAvatar()
    },
  },
}
</script>

<style lang="scss" scoped>
.theme {
  padding: 20px;
}
</style>
