<template>
    <div>
        <a-form-item label=" " :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
            <span v-text="$t('privatePostTips')"></span>
        </a-form-item>
        <a-form-item :label="$t('privatePostSwitch')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-switch v-model="form.enable" un-checked-children="OFF" checked-children="ON"></a-switch>
        </a-form-item>
        <a-form-item :label="$t('privatePostKey')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-input v-model="form.key"></a-input>
        </a-form-item>
        <a-form-item
                label=" "
                :labelCol="formLayout.label"
                :wrapperCol="formLayout.wrapper"
                :colon="false"
        >
            <a-button @click="submit" type="primary">{{ $t('save') }}</a-button>
        </a-form-item>
    </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import ga from '../../../helpers/analytics'


    @Component
export default class PrivatePostSetting extends Vue {
        @State('site') site!: any;

        formLayout = {
          label: { span: 6 },
          wrapper: { span: 12 },
        };

        form = {
          enable: false,
          key: '',
        };

        mounted() {
          const { privatePostSetting } = this.site
          this.form.enable = privatePostSetting.enable
          this.form.key = privatePostSetting.key
        }

        submit() {
          ipcRenderer.send('private-post-setting-save', this.form)
          ipcRenderer.once(
            'private-post-setting-saved',
            (event: IpcRendererEvent, result: any) => {
              this.$bus.$emit('site-reload')
              this.$message.success(this.$t('PrivatePostSettingSuccess'))
            },
          )
          ga.event('Setting', 'Setting - private-post-save', {
            evLabel: this.form.enable,
          })
        }
}
</script>


<style lang="less" scoped>
</style>
