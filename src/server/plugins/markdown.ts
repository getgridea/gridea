import MarkdownIt from 'markdown-it'
import MarkdownItKatex from '@iktakahiro/markdown-it-katex'
import markdownItTocAndAnchor from 'markdown-it-toc-and-anchor'
import MarkdownItTaskLists from 'markdown-it-task-lists'
import MarkdownItMark from 'markdown-it-mark'
import MarkdownItSup from 'markdown-it-sup'
import MarkdownItSub from 'markdown-it-sub'
import MarkdownItAbbr from 'markdown-it-abbr'
import MarkdownItFootnote from 'markdown-it-footnote'
import MarkdownItHighlight from 'markdown-it-highlight'
// import MakrdownItSanitizer from 'markdown-it-sanitizer'

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
markdownIt.use(MarkdownItHighlight)
// markdownIt.use(MakrdownItSanitizer)

export default markdownIt
