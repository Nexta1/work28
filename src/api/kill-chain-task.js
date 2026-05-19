import request from '@/utils/request'

/**
 * 杀伤链任务管理API
 * 模块名称: 杀伤链任务 (SSLRW)
 * 基础路径: /rest/sslrw
 */

// 分页查询杀伤链任务
export function pageQueryKillChainTask(data) {
  return request({
    url: '/rest/sslrw/page',
    method: 'post',
    data
  })
}

// 查询杀伤链任务
export function queryKillChainTask(sslrwid) {
  return request({
    url: `/rest/sslrw/${sslrwid}`,
    method: 'get'
  })
}

// 查询作战任务ID的杀伤链任务列表
export function queryKillChainTasksByTask(zzrwid) {
  return request({
    url: `/rest/sslrw/sslrws/${zzrwid}`,
    method: 'get'
  })
}
