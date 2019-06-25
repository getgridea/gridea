module.exports = {
  presets: [
    '@vue/app',
  ],
  plugins: [
    ['prismjs', {
      'languages': ['javascript', 'css', 'markup', 'json', 'bash', 'sass', 'python', 'typescript', 'java', 'less', 'php', 'pug', 'jsx', 'c', 'ruby', 'rust', 'dart', 'stylus', 'swift', 'yaml'],
      'plugins': ['line-numbers'],
      'theme': 'default',
      'css': true,
    }],
  ],
}
