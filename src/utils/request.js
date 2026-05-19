import axios from 'axios'
console.log(process.env)
// 1. 创建实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // 自动读取环境变量中的后端接口地址
  timeout: 5000 // 请求超时时间
})

// 2. 请求拦截器
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

// 3. 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    // 根据后端约定的状态码处理逻辑
    if (res.code !== 0) {
      alert(res.message || 'Error')
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    return Promise.reject(error)
  }
)

export default service
