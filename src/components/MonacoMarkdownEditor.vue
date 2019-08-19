<template>
  <div id="monaco-markdown-editor" style="width: 800px; height: 600px; border: 1px solid #ccc;">
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import * as monaco from 'monaco-editor'
import * as MonacoMarkdown from 'monaco-markdown'

// const MonacoMarkdown = require('../plugins/monaco/umd/monaco-markdown.js')

@Component
export default class MonacoMarkdownEditor extends Vue {
  mounted() {
    const editor = monaco.editor.create(document.getElementById('monaco-markdown-editor') as any, {
      language: 'markdown-math',
      value: 'Hello World',
    })

    console.log('lalala', MonacoMarkdown)

    const extension = new MonacoMarkdown.MonacoMarkdownExtension()
    extension.activate(editor)
  }
}
</script>

<style lang="less" scoped>

</style>
