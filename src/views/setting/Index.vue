<template>
  <div class="">
    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="基础配置" key="1">
        <basic-setting></basic-setting>
      </a-tab-pane>
      <a-tab-pane tab="评论配置" key="2">
        <comment-setting></comment-setting>
      </a-tab-pane>
      <a-tab-pane tab="Favicon 配置" key="3">
        <favicon-setting></favicon-setting>
      </a-tab-pane>
      <a-tab-pane tab="头像配置" key="4">
        <avatar-setting></avatar-setting>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import BasicSetting from './includes/BasicSetting.vue'
import CommentSetting from './includes/CommentSetting.vue'
import FaviconSetting from './includes/FaviconSetting.vue'
import AvatarSetting from './includes/AvatarSetting.vue'

@Component({
  components: {
    BasicSetting,
    CommentSetting,
    FaviconSetting,
    AvatarSetting, 
  },
})
export default class Setting extends Vue {

}
</script>

<style lang="less" scoped>
</style>
