module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // disallow a space before function parenthesis 
    'space-before-function-paren': ['error', 'never'],
    // require trailing commas
    'comma-dangle': ['error', 'always-multiline'],
    // allow multiple spances
    'no-multi-spaces': [1, {
        'exceptions': {
            'VariableDeclarator': true
        }
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
