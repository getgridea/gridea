<template>
  <div class="">
    <v-card flat>
      <v-card-title>
        <span class="headline">⚙️ 配置</span>
      </v-card-title>
      <v-card-text>
        <v-text-field label="域名" v-model="form.domain"></v-text-field>
        <v-text-field label="仓库" v-model="form.repository"></v-text-field>
        <v-text-field label="分支" v-model="form.branch"></v-text-field>
        <v-text-field label="用户名" v-model="form.username"></v-text-field>
        <v-text-field label="邮箱" v-model="form.email"></v-text-field>
        <v-text-field
          label="Token"
          v-model="form.token"
          :append-icon="showToken ? 'visibility_off' : 'visibility'"
          :type="showToken ? 'text' : 'password'"
          @click:append="showToken = !showToken"
        ></v-text-field>
        <v-btn block color="primary" depressed>保 存</v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class Setting extends Vue {
  showToken = false

  form = {
    domain: '',
    repository: '',
    branch: '',
    username: '',
    email: '',
    token: '',
  }
}
</script>


<style lang="stylus" scoped>
</style>
