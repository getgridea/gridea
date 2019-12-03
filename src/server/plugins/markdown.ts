import MarkdownIt from 'markdown-it'
import MarkdownItKatex from '@iktakahiro/markdown-it-katex'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'
import MarkdownItTaskLists from 'markdown-it-task-lists'
import MarkdownItMark from 'markdown-it-mark'
import MarkdownItSup from 'markdown-it-sup'
import MarkdownItSub from 'markdown-it-sub'
import MarkdownItAbbr from 'markdown-it-abbr'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItImsize from 'markdown-it-imsize'
import MarkdownItEmoji from 'markdown-it-emoji'
import MarkdownItImplicitFigures from 'markdown-it-implicit-figures'
import MarkdownItImageLazyLoading from 'markdown-it-image-lazy-loading'

const markdownIt = new MarkdownIt({
  html: true,
  breaks: true,
})

const BAD_PROTO_RE = /^(vbscript|javascript|data):/
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/

markdownIt.validateLink = function (url) {
  url = url.trim().toLowerCase()

  return BAD_PROTO_RE.test(url) ? (!!GOOD_DATA_RE.test(url)) : true
}

markdownIt.use(MarkdownItKatex)
markdownIt.use(markdownItTocAndAnchor, {
  anchorLink: false,
})
markdownIt.use(MarkdownItTaskLists, {
  label: true,
  labelAfter: true,
})
markdownIt.use(MarkdownItMark)
markdownIt.use(MarkdownItSup)
markdownIt.use(MarkdownItSub)
markdownIt.use(MarkdownItAbbr)
markdownIt.use(MarkdownItFootnote)
markdownIt.use(MarkdownItImsize)
markdownIt.use(MarkdownItEmoji)
markdownIt.use(MarkdownItImplicitFigures, {
  dataType: true, // <figure data-type="image">, default: false
  figcaption: false, // <figcaption>alternative text</figcaption>, default: false
  tabindex: true, // <figure tabindex="1+n">..., default: false
  link: false, // <a href="img.png"><img src="img.png"></a>, default: false
})
markdownIt.use(MarkdownItImageLazyLoading)

export default markdownIt
