import request from '@/utils/request'

/**
 * 网络统计查询API
 * 包含任务、网络拓扑、群组、链路等相关API
 */

// ==================== 任务信息统计 ====================

// 任务信息统计概览
export function getTaskOverview() {
  return request({
    url: '/rest/sumrw/overview',
    method: 'get'
  })
}

// ==================== 网络拓扑 ====================

// 返回所有任务的网络拓扑
export function getAllTaskNetworkTopology() {
  return request({
    url: '/rest/zzrwwl/trees',
    method: 'get'
  })
}

// 获取单个任务的网络拓扑
export function getTaskNetworkTopology(zzrwid) {
  return request({
    url: `/rest/zzrwwl/findTree/${zzrwid}`,
    method: 'get'
  })
}

// 获取单个子网拓扑
export function getSubnetTopology(zzrwwlid) {
  return request({
    url: `/rest/zzrwwl/${zzrwwlid}`,
    method: 'get'
  })
}

// ==================== 群组 ====================

// 获得单个群组网络信息
export function getGroupNetworkInfo(zzrwqzwlid) {
  return request({
    url: `/rest/zzrwqzwl/${zzrwqzwlid}`,
    method: 'get'
  })
}

// ==================== 平台信息 ====================

// 获取单个成员详情(平台信息)
export function getPlatformDetails(ptxxid) {
  return request({
    url: `/rest/ptxx/${ptxxid}`,
    method: 'get'
  })
}

// ==================== 链路 ====================

// 查询链路列表
export function getNetworkLinks(zzrwwlid) {
  return request({
    url: `/rest/zzrwwl/${zzrwwlid}`,
    method: 'get'
  })
}

// 获取网络告警列表
export function getNetworkAlarms(wlh) {
  return request({
    url: `/rest/wlllDetect/warenInfos/${wlh}`,
    method: 'get'
  })
}

// 实时指标推送 (WebSocket)
export function subscribeNetworkMetrics(wlh, ptid) {
  return `/ws/wlllzt/${wlh}/${ptid}`
}

// 新增链路
export function createNetworkLink(data) {
  return request({
    url: '/rest/wlllzt',
    method: 'post',
    data
  })
}

// 修改链路状态
export function updateNetworkLinkStatus(data) {
  return request({
    url: '/rest/wlllzt',
    method: 'put',
    data
  })
}

// ==================== 任务网络管理 ====================

// 新增任务网络
export function createTaskNetwork(data) {
  return request({
    url: '/rest/zzrwwl',
    method: 'post',
    data
  })
}

// ==================== 任务群组 ====================

// 新增任务群组
export function createTaskGroup(data) {
  return request({
    url: '/rest/zzrwqz',
    method: 'post',
    data
  })
}

// 新增任务群组网络
export function createTaskGroupNetwork(data) {
  return request({
    url: '/rest/zzrwqzwl',
    method: 'post',
    data
  })
}

// ==================== 任务管理 ====================

// 删除任务
export function deleteTask(zzrwid) {
  return request({
    url: `/rest/zzrwxx/${zzrwid}`,
    method: 'delete'
  })
}
