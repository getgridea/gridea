<template>
  <v-card flat>
    <v-card-title>
      <v-radio-group v-model="form.commentPlatform" row>
        <v-radio label="Gitalk" value="gitalk"></v-radio>
        <v-radio label="Disqus" value="disqus"></v-radio>
      </v-radio-group>
      <v-switch :label="$t('isShowComment')" v-model="form.showComment" />
    </v-card-title>
    <v-card-text>
      <gitalk-setting ref="gitalkSetting" v-if="form.commentPlatform === 'gitalk'"></gitalk-setting>
      <disqus-setting ref="disqusSetting" v-if="form.commentPlatform === 'disqus'"></disqus-setting>
      <v-btn color="primary" depressed @click="submit">{{ $t('save') }}</v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { ipcRenderer, Event } from 'electron'
import Vue from 'vue'
import Component from 'vue-class-component'
import { State } from 'vuex-class'
import GitalkSetting from './GitalkSetting.vue'
import DisqusSetting from './DisqusSetting.vue'

@Component({
  components: {
    GitalkSetting,
    DisqusSetting,
  },
})
export default class CommentSetting extends Vue {
  @State('site') site!: any
  
  $refs!: {
    gitalkSetting: HTMLFormElement
    disqusSetting: HTMLFormElement
  }

  form = {
    commentPlatform: 'gitalk',
    showComment: false,
  }

  mounted() {
    this.form.showComment = this.site.gitalkSetting.showComment
  }

  submit() {
    console.log('llll', this.$refs.gitalkSetting.form)
    console.log('llll', this.$refs.disqusSetting)
    // const form = {
    //   ...this.form,
    //   gitalkSetting: this.$refs.gitalkSetting.form,
    //   disqusSetting: this.$refs.disqusSetting.form,
    // }
    // console.log('click comment setting save', form)
    // ipcRenderer.send('comment-setting-save', form)
    // ipcRenderer.once('comment-setting-saved', (event: Event, result: any) => {
    //   this.$bus.$emit('site-reload')
    //   this.$bus.$emit('snackbar-display', this.$t('commentSettingSuccess'))
    // })
  }
}
</script>


<style lang="stylus" scoped>
</style>
