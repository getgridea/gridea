<template>
  <div>
    <language-setting></language-setting>
    <source-folder-setting></source-folder-setting>
    <version></version>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import LanguageSetting from './includes/LanguageSetting.vue'
import SourceFolderSetting from './includes/SourceFolderSetting.vue'
import Version from './includes/Version.vue'

@Component({
  components: {
    LanguageSetting,
    SourceFolderSetting,
    Version,
  },
})
export default class System extends Vue {

}
</script>

<style lang="less" scoped>
</style>
