import request from '@/utils/request'

/**
 * 杀伤链统计查询API
 * 模块名称: 杀伤链统计 (SUMSSL)
 * 基础路径: /rest/sumssl
 */

// 返回网络层<值,显示>映射
export function getNetworkLayerMap() {
  return request({
    url: '/rest/sumssl/networkLayerMap',
    method: 'get'
  })
}

// 查询某个网络层的<杀伤链,List<平台信息>>映射
export function getPhrasePlatformMap(layer) {
  return request({
    url: `/rest/sumssl/phrasePTXXsMap/${layer}`,
    method: 'get'
  })
}

// 实时程序平台信息
export function getPlatformInfo(ptid) {
  return request({
    url: `/rest/ptxx/${ptid}`,
    method: 'get'
  })
}

// 获取平台最新日志信息(10条)
export function getPlatformLatestLogs(ptid) {
  return request({
    url: `/ws/ptLog/${ptid}`,
    method: 'get'
  })
}

// 获取平台最新告警列表
export function getPlatformWarnings(ptid) {
  return request({
    url: `/rest/warnInfo/ptWarnInfos/${ptid}`,
    method: 'get'
  })
}
