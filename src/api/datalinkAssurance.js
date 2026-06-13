import request from '@/utils/request'

/**
 * 数据链保障需求分析 API
 * 接口文档：智能页面接口说明20260608.xlsx
 */

/**
 * 1. 分页显示作战编成
 * POST /rest/zzrwpt/page
 * @param {Object} data - {pageNum, pageSize, params: {ZZRWID}}
 */
export function getFormationPage(data) {
  return request({
    url: '/rest/zzrwpt/page',
    method: 'post',
    data
  })
}

/**
 * 2. 分页查询作战线路转向点
 * POST /rest/routePoint/page
 * @param {Object} data - {pageNum, pageSize, params: {ZZRWID}}
 */
export function getRoutePointPage(data) {
  return request({
    url: '/rest/routePoint/page',
    method: 'post',
    data
  })
}

/**
 * 3. 分页查询作战区域转向点
 * POST /rest/zzqywzd/page
 * @param {Object} data - {pageNum, pageSize, params: {ZZRWID}}
 */
export function getAreaPointPage(data) {
  return request({
    url: '/rest/zzqywzd/page',
    method: 'post',
    data
  })
}

/**
 * 4. 作战单元信息交互拓扑
 * GET /rest/zzrwxx/topology/{zzrwid}
 * @param {Number} zzrwid - 作战任务ID
 */
export function getTopology(zzrwid) {
  return request({
    url: `/rest/zzrwxx/topology/${zzrwid}`,
    method: 'get'
  })
}

/**
 * 5. 任务节点平台数量分布
 * GET /rest/zzrwxx/{ZZRWID}
 * @param {Number} ZZRWID - 作战任务ID
 */
export function getTaskNodeDistribution(ZZRWID) {
  return request({
    url: `/rest/zzrwxx/${ZZRWID}`,
    method: 'get'
  })
}

/**
 * 6. 查询作战任务任务网络列表
 * GET /rest/zzrwwl/ZZRWID/{ZZRWWLID}
 * @param {Number} ZZRWWLID - 作战任务网络ID
 */
export function getTaskNetworkList(ZZRWWLID) {
  return request({
    url: `/rest/zzrwwl/ZZRWID/${ZZRWWLID}`,
    method: 'get'
  })
}
