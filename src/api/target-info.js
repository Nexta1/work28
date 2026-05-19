import request from '@/utils/request'

/**
 * 目标信息管理API
 * 模块名称: 目标信息 (MBXX)
 * 基础路径: /rest/mbxx
 */

// 分页查询目标信息
export function pageQueryTarget(data) {
  return request({
    url: '/rest/mbxx/page',
    method: 'post',
    data
  })
}

// 查询目标信息
export function queryTarget(mbid) {
  return request({
    url: `/rest/mbxx/mbid/${mbid}`,
    method: 'get'
  })
}
