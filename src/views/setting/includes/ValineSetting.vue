<template>
    <div>
        <a-form-item
                label=" "
                :labelCol="formLayout.label"
                :wrapperCol="formLayout.wrapper"
                :colon="false"
        >
            <a @click.prevent="openPage('https://valine.js.org/')">Valine Document</a>
        </a-form-item>
        <a-form-item
                label="appId"
                :labelCol="formLayout.label"
                :wrapperCol="formLayout.wrapper"
                :colon="false"
        >
            <a-input v-model="form.appId"></a-input>
        </a-form-item>
        <a-form-item
                label="appKey"
                :labelCol="formLayout.label"
                :wrapperCol="formLayout.wrapper"
                :colon="false"
        >
            <a-input v-model="form.appKey"></a-input>
        </a-form-item>
        <a-form-item
                label="placeholder"
                :labelCol="formLayout.label"
                :wrapperCol="formLayout.wrapper"
                :colon="false"
        >
            <a-input v-model="form.placeholder"></a-input>
        </a-form-item>
        <a-form-item
                label="avatar"
                :labelCol="formLayout.label"
                :wrapperCol="formLayout.wrapper"
                :colon="false"
        >
            <a-select v-model="form.avatar" defaultValue="mp">
                <a-select-option value="mp">mp</a-select-option>
                <a-select-option value="identicon">identicon</a-select-option>
                <a-select-option value="monsterid">monsterid</a-select-option>
                <a-select-option value="wavatar">wavatar</a-select-option>
                <a-select-option value="retro">retro</a-select-option>
                <a-select-option value="robohash">robohash</a-select-option>
                <a-select-option value="hide">hide</a-select-option>
            </a-select>
        </a-form-item>
        <a-form-item label="notify"
                     :labelCol="formLayout.label"
                     :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-switch checked-children="ON" un-checked-children="OFF" :default-checked="form.notify"
                      v-model="form.notify"></a-switch>
        </a-form-item>
        <a-form-item label="verify"
                     :labelCol="formLayout.label"
                     :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-switch checked-children="ON" un-checked-children="OFF" :default-checked="form.verify"
                      v-model="form.verify"></a-switch>
        </a-form-item>
        <a-form-item label="visitor"
                     :labelCol="formLayout.label"
                     :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-switch checked-children="ON" un-checked-children="OFF" :default-checked="form.visitor"
                      v-model="form.visitor"></a-switch>
        </a-form-item>
        <a-form-item label="highlight"
                     :labelCol="formLayout.label"
                     :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-switch checked-children="ON" un-checked-children="OFF" :default-checked="form.highlight"
                      v-model="form.highlight"></a-switch>
        </a-form-item>
        <a-form-item label="recordIP"
                     :labelCol="formLayout.label"
                     :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-switch checked-children="ON" un-checked-children="OFF" :default-checked="form.recordIP"
                      v-model="form.recordIP"></a-switch>
        </a-form-item>
        <a-form-item label="pageSize"
                     :labelCol="formLayout.label"
                     :wrapperCol="formLayout.wrapper"
                     :colon="false">
            <a-input-number v-model="form.pageSize"></a-input-number>
        </a-form-item>
    </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent, shell } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'

    @Component
export default class ValineSetting extends Vue {
        @State('site') site!: any;

        formLayout = {
          label: { span: 6 },
          wrapper: { span: 12 },
        };

        form = {
          appId: '',
          appKey: '',
          placeholder: 'Just go go',
          notify: false,
          verify: true,
          avatar: 'mp',
          pageSize: 10,
          visitor: false,
          highlight: false,
          recordIP: false,
        };

        mounted() {
          const { valineSetting } = this.site.commentSetting

          this.form.appId = valineSetting.appId
          this.form.appKey = valineSetting.appKey
          this.form.placeholder = valineSetting.placeholder
          this.form.notify = valineSetting.notify
          this.form.avatar = valineSetting.avatar
          this.form.pageSize = valineSetting.pageSize
          this.form.visitor = valineSetting.visitor
          this.form.highlight = valineSetting.highlight
          this.form.recordIP = valineSetting.recordIP
        }

        openPage(url: string) {
          shell.openExternal(url)
        }
}
</script>


<style lang="less" scoped>
</style>
