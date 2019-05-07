<template>
  <div class="">
    <a-tabs defaultActiveKey="1">
      <a-tab-pane :tab="$t('basicSetting')" key="1">
        <basic-setting />
      </a-tab-pane>
      <a-tab-pane :tab="$t('commentSetting')" key="2">
        <comment-setting />
      </a-tab-pane>
      <a-tab-pane :tab="$t('faviconSetting')" key="3">
        <favicon-setting />
      </a-tab-pane>
      <a-tab-pane :tab="$t('avatarSetting')" key="4">
        <avatar-setting />
      </a-tab-pane>
      <a-tab-pane :tab="$t('cdnSetting')" key="5">
        <cdn-setting />
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
// eslint-disable-next-line
import CdnSetting from './includes/CdnSetting'

@Component({
  components: {
    BasicSetting,
    CommentSetting,
    FaviconSetting,
    AvatarSetting,
    CdnSetting,
  },
})
export default class Setting extends Vue {

}
</script>

<style lang="less" scoped>
</style>
