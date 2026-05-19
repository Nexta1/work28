import request from '@/utils/request'

/**
 * 任务网络需求管理API
 * 模块名称: 任务网络需求 (ZZRWWL)
 * 基础路径: /rest/zzrwwl
 */

// 分页查询任务网络需求
export function pageQueryNetworkRequirement(data) {
  return request({
    url: '/rest/zzrwwl/page',
    method: 'post',
    data
  })
}

// 新增任务网络需求
export function createNetworkRequirement(data) {
  return request({
    url: '/rest/zzrwwl/',
    method: 'post',
    data
  })
}

// 修改任务网络需求
export function updateNetworkRequirement(data) {
  return request({
    url: '/rest/zzrwwl/',
    method: 'put',
    data
  })
}

// 删除任务网络需求
export function deleteNetworkRequirement(zzrwwlid) {
  return request({
    url: `/rest/zzrwwl/${zzrwwlid}`,
    method: 'delete'
  })
}

// 查询任务网络需求
export function queryNetworkRequirement(zzrwwlid) {
  return request({
    url: `/rest/zzrwwl/${zzrwwlid}`,
    method: 'get'
  })
}

// 查询任务网络树
export function queryNetworkTree(zzrwid) {
  return request({
    url: `/rest/zzrwwl/findTree/${zzrwid}`,
    method: 'get'
  })
}

// 查询网络类型映射
export function getNetworkTypeMap() {
  return request({
    url: '/rest/zzrwwl/wllxMap',
    method: 'get'
  })
}

// 根据作战任务查询网络拓扑
export function queryNetworkTopology(zzrwid) {
  return request({
    url: `/rest/zzrwwl/topology/${zzrwid}`,
    method: 'get'
  })
}
