<template>
  <div>
    <a-tabs defaultActiveKey="1">
      <a-tab-pane tab="Language" key="1">
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
      </a-tab-pane>
    </a-tabs>
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

  languageVisible = false
  currentLanguage = 'zhHans'

  mounted() {
    this.currentLanguage = localStorage.getItem('language') || 'zhHans'
  }
  test() {
    this.languageVisible = true
  }
  saveLanguage() {
    this.languageVisible = false
    localStorage.setItem('language', this.currentLanguage)
    this.$root.$i18n.locale = this.currentLanguage
  }
}
</script>

<style lang="less" scoped>
</style>
