import request from '@/utils/request'

/**
 * 用户登录
 * @param {Object} data - { userCode, userPassword }
 */
export function login(data) {
  return request({
    url: '/rest/userInfo/login',
    method: 'post',
    data
  })
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUser() {
  return request({
    url: '/rest/userInfo/me',
    method: 'get'
  })
}

/**
 * 退出登录
 */
export function logout() {
  return request({
    url: '/rest/userInfo/logout',
    method: 'post'
  })
}
