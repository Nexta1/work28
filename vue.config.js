// vue.config.js
const path = require('path');

module.exports = {
  // 方式 A: 使用 configureWebpack (简单直接)
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        // 如果有其他别名也可以加在这里
        // 'components': path.resolve(__dirname, 'src/components'),
      },
    },
  },

  // 方式 B: 或者使用 chainWebpack (如果项目里已经用了 chainWebpack，建议用这个)
  // chainWebpack: config => {
  //   config.resolve.alias
  //     .set('@', path.resolve(__dirname, 'src'));
  // },
  
  // 其他配置...
};