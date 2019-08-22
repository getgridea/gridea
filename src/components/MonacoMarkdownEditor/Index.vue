<template>
  <div id="monaco-markdown-editor" style="width: 100%; height:640px; border: 1px solid #E2E8F0;">
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import * as monaco from 'monaco-editor'
import * as MonacoMarkdown from 'monaco-markdown'
import theme from './theme'

// const MonacoMarkdown = require('../plugins/monaco/umd/monaco-markdown.js')
const markdownContent = `今天我们切换了全新的编辑器，这是一款非常**优秀**的编辑器[Muya](https://gridea.dev/)非常感谢MarkText 团队作出的贡献

- [x] 我就看看这个任务渲染怎么样

ok，继续吧！

爱上创作，爱上 Gridea ❤️
`

@Component
export default class MonacoMarkdownEditor extends Vue {
  mounted() {
    monaco.editor.defineTheme('GrideaLight', theme as any)

    const editor = monaco.editor.create(document.getElementById('monaco-markdown-editor') as any, {
      language: 'markdown-math',
      value: markdownContent,
      fontSize: 15,
      theme: 'GrideaLight',
      lineNumbers: 'off',
      minimap: {
        enabled: false,
      },
      wordWrap: 'on',
      cursorWidth: 2,
      cursorSmoothCaretAnimation: true,
      cursorBlinking: 'smooth',
      colorDecorators: true,
      extraEditorClassName: 'gridea-editor',
      folding: false,
      highlightActiveIndentGuide: false,
      renderIndentGuides: false,
      renderLineHighlight: 'none',
      scrollbar: {
        verticalScrollbarSize: 4,
      },
      lineHeight: 15 * 1.5,
    })

    console.log('lalala', MonacoMarkdown)

    const extension = new MonacoMarkdown.MonacoMarkdownExtension()
    extension.activate(editor)
  }
}
</script>

<style lang="less" scoped>
/deep/.context-view .monaco-scrollable-element {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px 0 rgba(0, 0, 0, .06) !important;
  border-radius: 4px;
}

/deep/ .monaco-menu .monaco-action-bar.vertical .action-item {
  border: none;
}

/deep/ .action-menu-item {
  color: #718096 !important;
  &:hover {
    color: #744210 !important;
    background: #FFFFF0 !important;
  }
}

/deep/ .monaco-menu .monaco-action-bar.vertical .action-label.separator {
  border-bottom-color: #E2E8F0 !important;
}
</style>
