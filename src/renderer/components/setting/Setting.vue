<template>
  <div class="setting">
    <h2>配置</h2>
    <i-form :model="form" :label-width="80">
      <i-form-item label="源文件目录">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.source" disabled></i-input>
          </i-col>
          <i-col span="8">
            <label for="file-path" class="btn-path">更改目录</label>
            <input id="file-path" style="display: none;" type="file" webkitdirectory @change="updateSource">
          </i-col>
        </i-row>
      </i-form-item>
      <i-form-item label="Domain">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.domain"></i-input>
          </i-col>          
        </i-row>
      </i-form-item>
      <i-form-item label="Repository">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.repo"></i-input>
          </i-col>
        </i-row>
      </i-form-item>
      <i-form-item label="Branch">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.branch"></i-input>
          </i-col>
        </i-row>
      </i-form-item>
      <i-form-item label="Username">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.username"></i-input>
          </i-col>
        </i-row>
      </i-form-item>
      <i-form-item label="Email">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.email"></i-input>
          </i-col>
        </i-row>
      </i-form-item>
      <i-form-item label="Token">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.token"></i-input>
          </i-col>
        </i-row>
      </i-form-item>
      <i-form-item label="BackupRepo">
        <i-row>
          <i-col span="16">
            <i-input v-model="form.backupRepo"></i-input>
          </i-col>
        </i-row>
      </i-form-item>
      <i-form-item>
        <i-button type="primary" @click="save">保存</i-button>
      </i-form-item>
    </i-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { setting as types } from '@/store/types'

export default {
  data() {
    return {
      form: {
        source: null,
        domain: null,
        repo: null,
        branch: null,
        token: null,
        email: null,
        username: null,
      },
    }
  },
  created() {
    const setting = this.$store.state.setting
    this.form.source = setting.source
    this.form.domain = setting.domain
    this.form.repo = setting.repo
    this.form.branch = setting.branch
    this.form.token = setting.token
    this.form.email = setting.email
    this.form.username = setting.username
    this.form.backupRepo = setting.backupRepo
  },
  methods: {
    ...mapActions({
      acUpdateSetting: types.actions.UPDATE_SETTING,
    }),
    updateSource(e) {
      this.form.source = e.target.files[0].path
    },
    async save() {
      await this.$db.set('remote', this.form).write()
      this.acUpdateSetting(this.form)
      this.$Message.success('update success.')
    },
  },
}
</script>

<style lang="scss" scoped>
  .setting {
    padding: 20px;
  }
  .btn-path {
    margin-left: 20px;
    display: inline-block;
    border: 1px solid #dddee1;
    border-radius: 4px;
    line-height: 1.5;
    white-space: nowrap;
    padding: 6px 15px;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    transition: color .2s linear,background-color .2s linear,border .2s linear;
    &:hover {
      color: #57a3f3;
      border-color: #57a3f3;
    }
  }
</style>
