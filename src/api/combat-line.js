import request from '@/utils/request'

/**
 * 作战线路管理API
 * 模块名称: 作战线路 (RouteInfo)
 * 基础路径: /rest/routeInfo
 */

// 分页查询作战线路
export function pageQueryRoute(data) {
  return request({
    url: '/rest/routeInfo/page',
    method: 'post',
    data
  })
}

// 查询作战线路
export function queryRoute(routeId) {
  return request({
    url: `/rest/routeInfo/${routeId}`,
    method: 'get'
  })
}

// 查询作战任务的作战线路（包含转向点列表）
export function queryRouteByTask(zzrwid) {
  return request({
    url: `/rest/routeInfo/zzrwid/${zzrwid}`,
    method: 'get'
  })
}
