module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', '@vue/airbnb', '@vue/typescript'],
  rules: {
    // js 和 ts 不需要检查 import 的文件后缀
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never',
        ts: 'never',
      },
    ],
    'no-restricted-syntax': [
      'error',
      'WithStatement',
      'BinaryExpression[operator=\'in\']',
    ],
    // 可以 debugger
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 不要分号
    semi: [2, 'never'],
    // 全部单引号
    quotes: [2, 'single'],
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
    'no-unused-vars': 0,
    // 不用强制 export default
    'import/prefer-default-export': 0,
    // 不禁止箭头函数直接return对象
    'arrow-body-style': 0,
    // 允许空行
    'no-trailing-spaces': ['error', { skipBlankLines: true }],
    // 允许short circuit evaluations
    'no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true },
    ],
    // 最长字符
    'max-len': ['error', { code: 1500 }],
    'vue/no-parsing-error': [
      2,
      {
        'invalid-first-character-of-tag-name': false,
      },
    ],
    // no-plusplus
    'no-plusplus': 0,
    'class-methods-use-this': 0,
    'no-irregular-whitespace': 0,
    'consistent-return': 0,
    'import/no-extraneous-dependencies': 0,
    'global-require': 0,
    'no-continue': 0,
    'linebreak-style': 0,
  },
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
}
