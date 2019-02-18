<template>
  <div>
    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="Language" key="1">
        <language-setting></language-setting>
      </a-tab-pane>
      <a-tab-pane tab="源文件夹" key="2">
        <source-folder-setting></source-folder-setting>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import LanguageSetting from './includes/LanguageSetting.vue'
import SourceFolderSetting from './includes/SourceFolderSetting.vue'

@Component({
  components: {
    LanguageSetting,
    SourceFolderSetting,
  },
})
export default class System extends Vue {

}
</script>

<style lang="less" scoped>
</style>
