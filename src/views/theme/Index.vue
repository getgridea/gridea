<template>
  <div class="">
    <a-tabs defaultActiveKey="basic" v-model="currentTab" forceRender>
      <a-tab-pane :tab="$t('basicSetting')" key="basic">
        <basic-setting />
      </a-tab-pane>
      <a-tab-pane :tab="$t('customConfig')" key="custom">
        <custom-setting />
      </a-tab-pane>
      <a-tab-pane :tab="$t('themeManager')" key="manager">
        <theme-manager />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import BasicSetting from './includes/BasicSetting.vue'
import CustomSetting from './includes/CustomSetting.vue'
import ThemeManager from './includes/ThemeManager.vue'

@Component({
  components: {
    BasicSetting,
    CustomSetting,
    ThemeManager,
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
