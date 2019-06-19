<template>
  <div class="markdown-editor">
    <textarea :name="name"></textarea>
  </div>
</template>

<script>
import EasyMDE from 'easymde'
import marked from 'marked'
import markdown from '../server/plugins/markdown'

export default {
  name: 'markdown-editor',
  props: {
    value: String,
    name: String,
    previewClass: String,
    autoinit: {
      type: Boolean,
      default() {
        return true
      },
    },
    highlight: {
      type: Boolean,
      default() {
        return false
      },
    },
    sanitize: {
      type: Boolean,
      default() {
        return false
      },
    },
    configs: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  mounted() {
    if (this.autoinit) this.initialize()
  },
  activated() {
    const editor = this.easymde
    if (!editor) return
    const isActive = editor.isSideBySideActive() || editor.isPreviewActive()
    if (isActive) editor.toggleFullScreen()
  },
  methods: {
    initialize() {
      const configs = Object.assign({
        element: this.$el.firstElementChild,
        initialValue: this.value,
        renderingConfig: {},
        previewRender: function (text) {
          return markdown.render(text)
        },
      }, this.configs)
      // 同步 value 和 initialValue 的值 \ Synchronize the values of value and initialValue
      if (configs.initialValue) {
        this.$emit('input', configs.initialValue)
      }
      // 判断是否开启代码高亮 \ Determine whether to enable code highlighting
      if (this.highlight) {
        configs.renderingConfig.codeSyntaxHighlighting = true
      }
      // 设置是否渲染输入的html \ Set whether to render the input html
      marked.setOptions({ sanitize: this.sanitize })
      // 实例化编辑器 \ Instantiated editor
      this.easymde = new EasyMDE(configs)
      // 添加自定义 previewClass \ Add a custom previewClass
      const className = this.previewClass || ''
      this.addPreviewClass(className)
      // 绑定事件 \ Binding event
      this.bindingEvents()
    },
    bindingEvents() {
      this.easymde.codemirror.on('change', () => {
        this.$emit('input', this.easymde.value())
      })
    },
    addPreviewClass(className) {
      const wrapper = this.easymde.codemirror.getWrapperElement()
      const preview = document.createElement('div')
      wrapper.nextSibling.className += ` ${className}`
      preview.className = `editor-preview ${className}`
      wrapper.appendChild(preview)
    },
  },
  destroyed() {
    this.easymde = null
  },
  watch: {
    value(val) {
      if (val === this.easymde.value()) return
      this.easymde.value(val)
    },
  },
}
</script>

<style lang="less" scoped>
/deep/ .editor-toolbar {
  border: none;

  &:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }
  .fa {
    font-family: 'zwicon' !important;
    font-size: 16px;
    font-weight: bold;
  }
  .fa-bold:before {
    content: '\eae7';
  }
  .fa-italic:before {
    content: "\eaf2";
  }
  .fa-header:before {
    content: "\eaed";
  }
  .fa-code:before {
    content: "\e983";
  }
  .fa-quote-left:before {
    content: "\e920";
  }
  .fa-list-ul:before {
    content: "\eaf3";
  }
  .fa-list-ol:before {
    content: "\eaf4";
  }
  .fa-picture-o:before {
    content: "\eaac";
  }
  .fa-ellipsis-h:before {
    content: "\ea6a";
  }
  .fa-link:before {
    content: "\ea61";
  }
  .fa-eye:before {
    content: "\ea57";
  }
}

/deep/ .editor-preview pre, .editor-preview-side pre {
  background: #f7f6f3;
  padding: 16px;
  border-radius: 2px;
  code {
    color: #000;
  }
}
/deep/ .editor-preview {
  code {
    background: #ededeb;
    padding: 0px 4px;
    border-radius: 2px;
    color: #db615d;
  }
  pre code {
    background: none;
    padding: 0;
    border: none;
    border-radius: none;
  }

  .contains-task-list {
    list-style-type: none;
    padding-left: 30px;
  }
  .task-list-item {
    position: relative;
  }
  .task-list-item-checkbox {
    position: absolute;
    cursor: pointer;
    width: 16px;
    height: 16px;
    margin: 4px 0 0;
    top: 0;
    left: -22px;
    transform-origin: center;
    transform: rotate(-90deg);
    transition: all .2s ease;
    &:checked {
      transform: rotate(0);
      &:before {
        border: transparent;
        background-color: #66a80f;
      }
      &:after {
        transform: rotate(-45deg) scale(1);
      }
      + .task-list-item-label {
        color: #adb5bd;
        text-decoration: line-through;
      }
    }
    &:before {
      content: "";
      width: 16px;
      height: 16px;
      box-sizing: border-box;
      display: inline-block;
      border: 2px solid #ced4da;
      border-radius: 2px;
      background-color: #fff;
      position: absolute;
      top: 0;
      left: 0;
      transition: all .2s ease;
    }
    &:after {
      content: "";
      transform: rotate(-45deg) scale(0);
      width: 9px;
      height: 5px;
      border: 2px solid #fff;
      border-top: none;
      border-right: none;
      position: absolute;
      display: inline-block;
      top: 3px;
      left: 3px;
      transition: all .2s ease;
    }
  }
}
</style>


<style lang="less">
@import '~easymde/dist/easymde.min.css';
.markdown-editor .markdown-body {
  padding: 0.5em
}
.markdown-editor .editor-preview-active, .markdown-editor .editor-preview-active-side {
  display: block;
}

/* @import '~github-markdown-css'; */
.CodeMirror {
  border-radius: 2px;
  transition: all 0.3s;
  color: #000;
  border: none;
  font-size: 14px;
  letter-spacing: 0.05em;
  padding: 16px 0;
  line-height: 24px;
}

.editor-toolbar {
  border-color: #fff;
  box-shadow: none;
  border-radius: 2px;
  padding: 0;
}
.editor-toolbar button.active, .editor-toolbar button:hover {
  border-color: #d2c7b3;
  background: #f9f7f3;
}
.editor-toolbar button {
  color: #000 !important;
  width: 32px;
  height: 32px;
  border-radius: 2px;
  margin-right: 8px;
  transition: all 0.3s;
}
.editor-toolbar.fullscreen {
  z-index: 1025;
}
.CodeMirror .editor-preview.markdown-body.editor-preview-active {
  background: #fff;
}
.CodeMirror .editor-preview.markdown-body.editor-preview-active img {
  max-width: 100%;
  display: block;
  margin: 8px 0;
}
.CodeMirror-line {
  margin: .5em 0;
}
.CodeMirror-cursor {
  border-left: 2px solid #efb73f;
}

.cm-s-easymde {
  .cm-formatting,
  .cm-formatting-header,
  .cm-formatting-strong,
  .cm-formatting-link {
    // color: rgba(0,0,0,.28);
    color: #efb73f;
    font-weight: normal;
    padding: 0 2px;
  }

  .cm-formatting-list-ol,
  .cm-formatting-list-ul {
    padding-left: 24px;
  }
  .cm-header-1 {
    font-size: 28px;
    line-height: 36px;
    padding: 7px 0;
    position: relative;
  }
  .cm-header-2 {
    font-size: 24px;
    line-height: 32px;
    padding: 7px 0;
  }
  .cm-header-3 {
    font-size: 20px;
    line-height: 28px;
    padding: 7px 0;
  }
  .cm-header-4 {
    font-size: 16px;
    line-height: 24px;
    padding: 7px 0;
  }
  .cm-header-5 {
    font-size: 14px;
    line-height: 24px;
    padding: 7px 0;
  }
  .cm-header-6 {
    font-size: 14px;
    line-height: 24px;
    padding: 7px 0;
    font-weight: normal;
  }
  
  .cm-quote {
    font-style: normal;
    color: rgba(0,0,0,.48);
  }
  .cm-link:not(.cm-formatting-link):not(.cm-formatting-image) {
    color: #000;
  }

  .cm-url:not(.cm-formatting-link-string) {
    color: #1971c2;
    letter-spacing: normal;
  }
  .cm-comment:not(.cm-formatting-code) {
    box-shadow: 0 0 0 2px rgba(0,0,0,.05);
  }

  .cm-comment.cm-formatting-code {
    background: none;
  }
}
</style>
