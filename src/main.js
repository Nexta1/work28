import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.config.productionTip = false

import request from './utils/request'

// 挂载到原型
Vue.prototype.$http = request
Vue.use(ElementUI)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
