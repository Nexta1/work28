import request from '@/utils/request'
import request2 from '@/utils/request-maintenance'

/**
 * ===================================================================
 * 通用 CRUD 接口封装 (适用于 zzrwqz 及类似模块)
 * ===================================================================
 *
 * 设计思路：
 * 1. 通过传入 baseUrl (如 '/rest/zzrwqz') 来动态决定请求路径。
 * 2. 方法命名通用化 (page, add, update, remove, get, list)。
 * 3. 支持图片中定义的 6 种接口模式。
 */

/**
 * @description 通用分页查询 (POST)

 * @param {String} baseUrl - 基础路径，例如 '/rest/zzrwqz'
 * @param {Object} data - 请求体参数 (pageNum, pageSize, 查询条件)
 */
export function apiPage(baseUrl, data) {
  return request({
    url: `/rest/${baseUrl}/page`,
    method: 'post',
    data
  })
}
export function mainPage(baseUrl, data) {
  const {pageNum, pageSize, ...rest} = data
  const params = {
    start: (pageNum - 1) * pageSize,
    length: pageSize,
    draw: 1,
    ...rest // 3. 只展开剔除后的剩余字段，这样就不会包含 pageNum 和 pageSize 了
  }
  return request2({
    url: `/rest/${baseUrl}`,
    method: 'get',
    params
  })
}
/**
 * @description 通用新增 (POST)

 * @param {String} baseUrl - 基础路径
 * @param {Object} data - 实体数据
 */
export function apiAdd(baseUrl, data) {
  return request({
    url: '/rest/' + baseUrl,
    method: 'post',
    data
  })
}

/**
 * @description 通用修改 (PUT)

 * @param {String} baseUrl - 基础路径
 * @param {Object} data - 包含 ID 的实体数据
 */
export function apiUpdate(baseUrl, data) {
  return request({
    url: '/rest/' + baseUrl,
    method: 'put',
    data
  })
}

/**
 * @description 通用删除 (DELETE)

 * @param {String} baseUrl - 基础路径
 * @param {String|Number} id - 主键 ID
 */
export function apiDelete(baseUrl, id) {
  return request({
    url: `/rest/${baseUrl}/${id}`,
    method: 'delete'
  })
}
export function mainDelete(baseUrl, id) {
  return request({
    url: `/rest/${baseUrl}/${id}`,
    method: 'delete'
  })
}

/**
 * @description 通用详情查询 (GET)
 * 对应图片: rest/zzrwqz/{zzrwqzId}
 * @param {String} baseUrl - 基础路径
 * @param {String|Number} id - 主键 ID
 */
export function apiGetDetail(baseUrl, id) {
  return request({
    url: `/rest/${baseUrl}/${id}`,
    method: 'get'
  })
}

/**
 * @description 通用列表查询 (GET)

 * @param {String} baseUrl - 基础路径
 * @param {Object} params - URL 查询参数
 */
export function apiGetAll(baseUrl, params, s) {
  return request({
    url: `/rest/${baseUrl}/${s}`,
    method: 'get',
    params
  })
}
export function apiFindAllTrees(baseUrl) {
  return request({
    url: `/rest/${baseUrl}/findAllTrees`,
    method: 'get'
  })
}
