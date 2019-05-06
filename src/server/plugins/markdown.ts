import MarkdownIt from 'markdown-it'
import MarkdownItKatex from '@iktakahiro/markdown-it-katex'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'

const markdownIt = new MarkdownIt({
  html: true,
})

markdownIt.use(MarkdownItKatex)
markdownIt.use(markdownItTocAndAnchor, {
  anchorLink: false,
})

export default markdownIt
