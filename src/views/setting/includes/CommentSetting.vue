<template>
  <div>
    <a-form :form="form" style="padding-bottom: 48px;">
      <a-form-item :label="$t('platform')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-radio-group name="commentPlatform" v-model="form.commentPlatform">
          <a-radio value="gitalk">Gitalk</a-radio>
          <a-radio value="disqus">Disqus</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('isShowComment')" :labelCol="formLayout.label" :wrapperCol="formLayout.wrapper" :colon="false">
        <a-switch v-model="form.showComment" />
      </a-form-item>
      <gitalk-setting ref="gitalkSetting" v-show="form.commentPlatform === 'gitalk'"></gitalk-setting>
      <disqus-setting ref="disqusSetting" v-show="form.commentPlatform === 'disqus'"></disqus-setting>
      <footer-box>
        <div class="flex justify-end">
          <a-button @click="submit" type="primary">{{ $t('save') }}</a-button>
        </div>
      </footer-box>
    </a-form>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, IpcRendererEvent } from 'electron'
import { Vue, Component } from 'vue-property-decorator'
import { State } from 'vuex-class'
import GitalkSetting from './GitalkSetting.vue'
import DisqusSetting from './DisqusSetting.vue'
import FooterBox from '../../../components/FooterBox/Index.vue'
import ga from '../../../helpers/analytics'

@Component({
  components: {
    GitalkSetting,
    DisqusSetting,
    FooterBox,
  },
})
export default class CommentSetting extends Vue {
  @State('site') site!: any

  $refs!: {
    gitalkSetting: HTMLFormElement,
    disqusSetting: HTMLFormElement,
  }

  formLayout = {
    label: { span: 6 },
    wrapper: { span: 12 },
  }

  form = {
    commentPlatform: 'gitalk',
    showComment: false,
  }

  mounted() {
    const { commentSetting } = this.site
    this.form.commentPlatform = commentSetting.commentPlatform
    this.form.showComment = commentSetting.showComment
  }

  submit() {
    const form = {
      ...this.form,
      gitalkSetting: this.$refs.gitalkSetting.form,
      disqusSetting: this.$refs.disqusSetting.form,
    }
    console.log('click comment setting save', form)
    ipcRenderer.send('comment-setting-save', form)
    ipcRenderer.once('comment-setting-saved', (event: IpcRendererEvent, result: any) => {
      this.$bus.$emit('site-reload')
      this.$message.success(this.$t('commentSettingSuccess'))

      ga.event('Setting', 'Setting - comment-save', { evLabel: this.form.commentPlatform })
    })
  }
}
</script>


<style lang="less" scoped>
</style>
