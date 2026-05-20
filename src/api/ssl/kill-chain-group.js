import request from '@/utils/request'

/**
 * 杀伤链群组管理API
 * 模块名称: 杀伤链群组 (SSLQZ)
 * 基础路径: /rest/sslqz
 */

// 分页查询杀伤链群组
export function pageQueryKillChainGroup(data) {
  return request({
    url: '/rest/sslqz/page',
    method: 'post',
    data
  })
}
