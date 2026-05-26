import axios from 'axios'
// 1. 引入 Element UI 的 Message 组件
import {Message} from 'element-ui'

console.log(process.env)

// 2. 创建实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // 自动读取环境变量中的后端接口地址
  timeout: 5000 // 请求超时时间
})

// 3. 请求拦截器
service.interceptors.request.use(
  config => {
    // 在这里给请求头添加 Token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 4. 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 根据后端约定的状态码处理逻辑（假设 0 为成功）
    if (res.code !== 0) {
      // 使用 Element UI 的错误弹窗显示后端返回的 message
      Message({
        message: res.message || '服务器异常',
        type: 'error',
        duration: 3 * 1000 // 弹窗显示 3 秒后自动关闭
      })
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    // 处理网络异常或请求超时的情况
    Message({
      message: error.message || '网络请求异常',
      type: 'error',
      duration: 3 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
