import request from '@/utils/request'

/**
 * 杀伤链状态管理API
 * 模块名称: 杀伤链运行态势 (SSLXX/SSLYX)
 * 基础路径: /rest/sslxx, /rest/sslyx
 */

// 分页查询杀伤链状态
export function pageQueryKillChainStatus(data) {
  return request({
    url: '/rest/sslxx/page',
    method: 'post',
    data
  })
}

// 通过杀伤链ID查询杀伤链信息
export function queryKillChainById(killchainId) {
  return request({
    url: `/rest/sslxx/KILLCHAIN_ID/${killchainId}`,
    method: 'get'
  })
}

// 分页查询杀伤链运行态势
export function pageQueryKillChainSituation(data) {
  return request({
    url: '/rest/sslyx/page',
    method: 'post',
    data
  })
}

// 返回杀伤链状态<值，显示>映射
export function getKillChainStateMap() {
  return request({
    url: '/rest/sslxx/sslStateMap',
    method: 'get'
  })
}

// 返回杀伤链执行阶段<值，显示>映射
export function getKillChainPhraseMap() {
  return request({
    url: '/rest/sslxx/sslPhraseMap',
    method: 'get'
  })
}
