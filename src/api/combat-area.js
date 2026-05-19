import request from '@/utils/request'

/**
 * 作战区域管理API
 * 模块名称: 作战区域 (ZZQY)
 * 基础路径: /rest/zzqy
 */

// 分页查询作战区域
export function pageQueryArea(data) {
  return request({
    url: '/rest/zzqy/page',
    method: 'post',
    data
  })
}

// 查询作战区域
export function queryArea(zzqyid) {
  return request({
    url: `/rest/zzqy/${zzqyid}`,
    method: 'get'
  })
}
