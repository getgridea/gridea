<template>
  <div>
    <a-form>
      <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-alert :message="currentFolderPath" type="warning" />
        <a-upload action="" directory :beforeUpload="handleFolderChange" :showUploadList="false">
          <a-button style="margin-top: 8px;" type="primary" block>
            <a-icon type="folder-open" /> {{ $t('change') }}
          </a-button>
        </a-upload>
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

  currentFolderPath = '-'

  mounted() {
    this.currentFolderPath = localStorage.getItem('sourceFolder') || '-'
  }

  saveLanguage() {
    localStorage.setItem('sourceFolder', this.currentFolderPath)
    this.$message.success(this.$t('saved'))
  }

  handleFolderChange(data: any) {
    this.currentFolderPath = data.path
    return false
  }
}
</script>

<style lang="less" scoped>
</style>
