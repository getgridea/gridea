export default [
  {
    name: '编辑',
    list: [
      {
        title: '保存文章',
        keyboard: ['⌘', 'S'],
      },
      {
        title: '剪切',
        keyboard: ['⌘', 'X'],
      },
      {
        title: '复制',
        keyboard: ['⌘', 'C'],
      },
      {
        title: '粘贴',
        keyboard: ['⌘', 'V'],
      },
    ],
  },
  {
    name: 'Markdown',
    list: [
      {
        title: '标题降级 (# -)',
        keyboard: ['⌃', '⇧', '['],
      },
      {
        title: '标题升级 (# +)',
        keyboard: ['⌃', '⇧', ']'],
      },
      {
        title: '加粗 (**)',
        keyboard: ['⌘', 'B'],
      },
      {
        title: '行内 Code(`)',
        keyboard: ['⌘', '`'],
      },
      {
        title: '斜体 (*)',
        keyboard: ['⌘', 'I'],
      },
      {
        title: '列表 (-)',
        keyboard: ['⌘', 'L'],
      },
      {
        title: 'LaTeX ($)',
        keyboard: ['⌘', 'M'],
      },
      {
        title: 'LaTeX ($$)',
        keyboard: ['⇧', '⌘', 'M'],
      },
      {
        title: '删除线 (~~)',
        keyboard: ['⌥', 'S'],
      },
    ],
  },
  {
    name: '其他',
    list: [
      {
        title: '格式化文档',
        keyboard: ['⇧', '⌥', 'F'],
      },
    ],
  },
]
