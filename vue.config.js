// vue.config.js
const path = require('path')

module.exports = {
  devServer: {
    // 关键配置：让客户端热更新连接当前的域名和端口
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws',
      overlay: {
        warnings: false, // 不显示警告
        // 或者更精确地只屏蔽 ResizeObserver 相关的运行时错误
        runtimeErrors: error => {
          return (
            error.message !==
            'ResizeObserver loop completed with undelivered notifications.'
          )
        }
      }
    },
    // 如果之前写死了 host: '192.168.43.10'，请务必删掉或改成下面这样：
    host: '0.0.0.0'
  },
  // 方式 A: 使用 configureWebpack (简单直接)
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
        // 如果有其他别名也可以加在这里
        // 'components': path.resolve(__dirname, 'src/components'),
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          quietDeps: true
        }
      }
    }
  }
  // 方式 B: 或者使用 chainWebpack (如果项目里已经用了 chainWebpack，建议用这个)
  // chainWebpack: config => {
  //   config.resolve.alias
  //     .set('@', path.resolve(__dirname, 'src'));
  // },

  // 其他配置...
}
