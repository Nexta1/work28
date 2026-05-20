import request from '@/utils/request'

/**
 * 杀伤链群组成员管理API
 * 模块名称: 杀伤链群组成员 (SSLQZCY)
 * 基础路径: /rest/sslqzcy
 */

// 分页查询杀伤链群组成员
export function pageQueryKillChainMember(data) {
  return request({
    url: '/rest/sslqzcy/page',
    method: 'post',
    data
  })
}
