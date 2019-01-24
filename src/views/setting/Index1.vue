<template>
  <div class="">
    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="基础配置" key="1">Content of Tab 1</a-tab-pane>
      <a-tab-pane tab="评论配置" key="2">Content of Tab 2</a-tab-pane>
      <a-tab-pane tab="Favicon 配置" key="3">Content of Tab 3</a-tab-pane>
      <a-tab-pane tab="头像配置" key="4">Content of Tab 4</a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

@Component
export default class Setting extends Vue {

}
</script>

<style lang="less" scoped>
</style>
