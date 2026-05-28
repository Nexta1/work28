import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.config.productionTip = false
import '@/assets/style.scss'
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
Vue.use(ElementUI)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
