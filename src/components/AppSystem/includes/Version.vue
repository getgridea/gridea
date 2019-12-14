<template>
  <div class="mb-4 py-4 border-b border-gray-200">
    <div class="text-base font-medium mb-4">{{ $t('version') }}</div>
    <div>{{ version }}</div>
    <a href="https://gridea.dev" target="_blank"> Gridea</a>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import * as pkg from '../../../../package.json'

@Component
export default class System extends Vue {
  formLayout = {
    label: { span: 5 },
    wrapper: { span: 12 },
  }

  version = (pkg as any).version

  currentLanguage = 'zhHans'

  mounted() {
    console.log(this.$root)
    this.currentLanguage = localStorage.getItem('language') || 'zhHans'
  }

  saveLanguage() {
    localStorage.setItem('language', this.currentLanguage)
    this.$root.$i18n.locale = this.currentLanguage
  }
}
</script>

<style lang="less" scoped>
</style>
