<template>
  <div ref="editor"></div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import Muya from '../muya/lib'
import TablePicker from '../muya/lib/ui/tablePicker'
import QuickInsert from '../muya/lib/ui/quickInsert'
import CodePicker from '../muya/lib/ui/codePicker'
import EmojiPicker from '../muya/lib/ui/emojiPicker'
import ImagePathPicker from '../muya/lib/ui/imagePicker'
import ImageSelector from '../muya/lib/ui/imageSelector'
import FormatPicker from '../muya/lib/ui/formatPicker'
import FrontMenu from '../muya/lib/ui/frontMenu'


@Component
export default class ArticleUpdate extends Vue {
  editor: any = null

  created() {
    this.$nextTick(() => {
      const ele = this.$refs.editor

      Muya.use(TablePicker)
      Muya.use(QuickInsert)
      Muya.use(CodePicker)
      Muya.use(EmojiPicker)
      Muya.use(ImagePathPicker)
      Muya.use(ImageSelector)
      Muya.use(FormatPicker)
      Muya.use(FrontMenu)

      this.editor = new Muya(ele, {
        markdown: 'Welcome to use muya...',
      })
      this.editor.on('change', () => {
        // console.log(changes)
      })
    })
  }
}
</script>

<style lang="less" scoped>
@import '../muya/themes/default.css';
</style>
