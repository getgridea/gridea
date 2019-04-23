<template>
  <div>
    <a-form>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-radio-group name="currentLanguage" v-model="currentLanguage">
          <a-radio value="zhHans">简体中文</a-radio>
          <a-radio value="en">English</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
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
