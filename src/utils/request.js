import axios from 'axios'
import {Message} from 'element-ui'

/**
 * 防止重复弹窗
 */
let messageInstance = null

function showMessage(msg, type = 'error') {
  if (messageInstance) return

  messageInstance = Message({
    message: msg,
    type,
    duration: 3000,
    onClose: () => {
      messageInstance = null
    }
  })
}

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 15000
})

/**
 * 请求拦截
 */
service.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 响应拦截
 */
service.interceptors.response.use(
  response => {
    const contentType = response.headers['content-type'] || ''

    /**
     * 文件流直接返回
     */
    if (
      response.config.responseType === 'blob' ||
      response.config.responseType === 'arraybuffer'
    ) {
      return response.data
    }

    /**
     * 后端返回 HTML
     */
    if (contentType.includes('text/html')) {
      showMessage('服务器返回了 HTML 页面')

      return Promise.reject(new Error('服务器返回了非预期 HTML'))
    }

    const res = response.data

    /**
     * 返回为空
     */
    if (res === null || res === undefined) {
      showMessage('接口返回为空')

      return Promise.reject(new Error('response is null'))
    }

    /**
     * 字符串类型异常
     */
    if (typeof res === 'string') {
      // 某些网关错误
      if (res.includes('<html') || res.includes('Whitelabel Error Page')) {
        showMessage('服务器内部异常')

        return Promise.reject(new Error('html response'))
      }

      return res
    }

    /**
     * 业务状态码处理
     */
    const code = res.code

    /**
     * 成功
     */
    if (code === 0 || code === 200) {
      return res
    }

    /**
     * token失效
     */
    if (code === 401) {
      showMessage('登录已过期')

      localStorage.removeItem('token')

      setTimeout(() => {
        location.href = '/login'
      }, 500)

      return Promise.reject(res)
    }

    /**
     * 业务异常
     */
    showMessage(res.message || '请求失败')

    return Promise.reject(res)
  },

  error => {
    /**
     * 超时
     */
    if (error.message && error.message.includes('timeout')) {
      showMessage('请求超时')

      return Promise.reject(error)
    }

    /**
     * 网络异常
     */
    if (!error.response) {
      showMessage('网络异常')

      return Promise.reject(error)
    }

    const status = error.response.status

    switch (status) {
      case 400:
        showMessage('请求错误')
        break

      case 401:
        showMessage('登录失效')

        localStorage.removeItem('token')

        setTimeout(() => {
          location.href = '/login'
        }, 500)

        break

      case 403:
        showMessage('无权限访问')
        break

      case 404:
        showMessage('接口不存在')
        break

      case 500:
        showMessage('服务器异常')
        break

      case 502:
        showMessage('网关异常')
        break

      case 503:
        showMessage('服务不可用')
        break

      case 504:
        showMessage('网关超时')
        break

      default:
        showMessage(error.message || '请求失败')
    }

    return Promise.reject(error)
  }
)

export default service
