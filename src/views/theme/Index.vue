<template>
  <div class="">
    <a-tabs class="menu-tab" defaultActiveKey="basic" v-model="currentTab" forceRender :animated="false">
      <a-tab-pane :tab="$t('basicSetting')" key="basic">
        <basic-setting></basic-setting>
      </a-tab-pane>
      <a-tab-pane :tab="$t('customConfig')" key="custom">
        <custom-setting></custom-setting>
      </a-tab-pane>
      <a-tab-pane :tab="$t('faviconSetting')" key="favicon">
        <favicon-setting></favicon-setting>
      </a-tab-pane>
      <a-tab-pane :tab="$t('avatarSetting')" key="avatar">
        <avatar-setting></avatar-setting>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import BasicSetting from './includes/BasicSetting.vue'
import CustomSetting from './includes/CustomSetting.vue'
import FaviconSetting from './includes/FaviconSetting.vue'
import AvatarSetting from './includes/AvatarSetting.vue'

@Component({
  name: 'Theme',
  components: {
    BasicSetting,
    CustomSetting,
    FaviconSetting,
    AvatarSetting,
  },
})
export default class Theme extends Vue {
  currentTab = 'basic'

  mounted() {
    const { tab } = this.$route.query
    if (tab && typeof tab === 'string') {
      this.currentTab = tab
      console.log(this.currentTab)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
