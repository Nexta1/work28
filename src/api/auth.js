import request from '@/utils/request'

/**
 * 认证管理API
 * 模块名称: 认证 (Auth)
 * 基础路径: /rest/auth
 */

// 登录
export function login(username, password) {
  return request({
    url: '/rest/auth/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

// 登出
export function logout() {
  return request({
    url: '/rest/auth/logout',
    method: 'post'
  })
}

// 获取当前用户信息
export function getCurrentUser() {
  return request({
    url: '/rest/auth/userinfo',
    method: 'get'
  })
}

// 刷新Token
export function refreshToken() {
  return request({
    url: '/rest/auth/refresh-token',
    method: 'post'
  })
}

// 修改密码
export function changePassword(oldPassword, newPassword) {
  return request({
    url: '/rest/auth/change-password',
    method: 'post',
    data: {
      oldPassword,
      newPassword
    }
  })
}

// 保存Token到本地存储
export function saveToken(token) {
  localStorage.setItem('token', token)
}

// 获取本地Token
export function getToken() {
  return localStorage.getItem('token')
}

// 清除本地Token
export function removeToken() {
  localStorage.removeItem('token')
}
