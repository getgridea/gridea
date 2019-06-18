<template>
  <div class="muya-editor" ref="editor"></div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
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
import bus from '../helpers/bus'


@Component
export default class ArticleUpdate extends Vue {
  editor: any = null

  content: string = ''

  created() {
    ipcRenderer.on('editor-undo', () => {
      this.editor && this.editor.undo()
    })

    ipcRenderer.on('editor-redo', () => {
      this.editor && this.editor.redo()
    })
    
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
        markdown: this.content,
      })
      this.editor.on('change', (changes: any) => {
        console.log('changes', changes)
        this.$emit('updateContent', changes.markdown)
      })
    })
  }
}
</script>

<style lang="less" scoped>
</style>
