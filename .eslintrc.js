module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  rules: { 'no-unused-vars': 'off',
    // 关闭多单词组件名规则
    'vue/multi-word-component-names': 'off',
    
    // 或者设置为警告而不是报错
    // 'vue/multi-word-component-names': 'warn',
    
    // 或者忽略特定组件名
    // 'vue/multi-word-component-names': ['error', {
    //   ignores: ['Dashboard', 'Login', 'Settings']
    // }]
  }
}