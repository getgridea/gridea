<template>
  <div class="">
    <a-tabs defaultActiveKey="1">
      <a-tab-pane :tab="$t('basicSetting')" key="1">
        <basic-setting></basic-setting>
      </a-tab-pane>
      <a-tab-pane :tab="$t('自定义配置')" key="2">
        <custom-setting></custom-setting>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import BasicSetting from './includes/BasicSetting.vue'
import CustomSetting from './includes/CustomSetting.vue'

@Component({
  components: {
    BasicSetting,
    CustomSetting,
  },
})
export default class Theme extends Vue {

}
</script>

<style lang="less" scoped>
</style>
