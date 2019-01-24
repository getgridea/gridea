module.exports = {
  root: true,
  env: {
    node: true,
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // js 和 vue 不需要检查 import 的文件后缀
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never',
    }],
    // 不要分号
    'semi': [2, 'never'],
    // 全部单引号
    'quotes': [2, 'single'],
    // 对象缩写
    'object-shorthand': 0,
    // 可以使用 console
    'no-console': 0,
    // 允许使用匿名函数
    'func-names': 0,
    // 允许属性的 key 值加引号
    'quote-props': 0,
    // 允许对函数的参数赋值
    'no-param-reassign': 0,
    // 函数的参数可以不使用
    'no-unused-vars': ['error', { 'vars': 'all', 'args': 'none' }],
    // 不用强制 export default
    'import/prefer-default-export': 0,
    // 不禁止箭头函数直接return对象
    'arrow-body-style': 0,
    // 允许空行
    'no-trailing-spaces': ['error', { 'skipBlankLines': true }],
    // 允许short circuit evaluations
    'no-unused-expressions': ['error', { 'allowShortCircuit': true, 'allowTernary': true }],
    // 最长字符
    'max-len': ['error', { 'code': 500 }],
    'vue/no-parsing-error': 0,
    // no-plusplus
    'no-plusplus': 0,
    'line-breaks': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js','.jsx','.vue'],
      },
    },
  },
}
