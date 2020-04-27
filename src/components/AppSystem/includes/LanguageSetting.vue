<template>
  <div class="mb-4 py-4 border-b border-gray-200">
    <div class="text-base font-medium mb-4">{{ $t('language') }}</div>
    <a-form>
      <a-form-item :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-radio-group name="currentLanguage" v-model="currentLanguage">
          <a-radio value="zhHans">简体中文</a-radio>
          <a-radio value="en">English</a-radio>
          <a-radio value="zh_TW">繁體中文</a-radio>
          <a-radio value="fr_FR">Français</a-radio>
          <a-radio value="ja_JP">日本語</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-button type="primary" @click="saveLanguage">{{ $t('save') }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class System extends Vue {
  formLayout = {
    label: { span: 5 },
    wrapper: { span: 12 },
  }

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
