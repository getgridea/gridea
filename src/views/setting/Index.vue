<template>
  <div class="">
    <a-tabs class="menu-tab" defaultActiveKey="1" :animated="false">
      <a-tab-pane :tab="$t('basicSetting')" key="1">
        <basic-setting></basic-setting>
      </a-tab-pane>
      <a-tab-pane :tab="$t('commentSetting')" key="2">
        <comment-setting></comment-setting>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import BasicSetting from './includes/BasicSetting.vue'
import CommentSetting from './includes/CommentSetting.vue'

@Component({
  components: {
    BasicSetting,
    CommentSetting,
  },
})
export default class Setting extends Vue {

}
</script>

<style lang="less" scoped>
</style>
