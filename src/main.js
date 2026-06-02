import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.config.productionTip = false
import '@/assets/style.scss'
import '@/assets/icons.js'

// ============ DataV 炫酷大屏组件库（一键全量注册） ============
import dataV from '@jiaminghi/data-view'
Vue.use(dataV)

// ============ vue-count-to 数字滚动 ============
import countTo from 'vue-count-to'
Vue.component('count-to', countTo)

console.log(window.Iconify)
import request from './utils/request'
window.addEventListener('error', e => {
  if (
    e.message &&
    e.message.includes(
      'ResizeObserver loop completed with undelivered notifications'
    )
  ) {
    e.stopImmediatePropagation()
  }
})
// 挂载到原型
import store from './store' // 自动引入 store/index.js
Vue.prototype.$http = request

// 全局配置 Element UI 组件默认尺寸为 mini
Vue.use(ElementUI, {
  size: 'mini'
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
