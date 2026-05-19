import request from '@/utils/request'

/**
 * 编成编组管理API
 * 模块名称: 编成编组 (ZZRWPT)
 * 基础路径: /rest/zzrwpt
 */

// 分页查询编成编组
export function pageQueryFormation(data) {
  return request({
    url: '/rest/zzrwpt/page',
    method: 'post',
    data
  })
}

// 查询某个作战任务的编成编组
export function queryFormationByTask(zzrwid) {
  return request({
    url: `/rest/zzrwpt/rpts/${zzrwid}`,
    method: 'get'
  })
}

// 查询所有编成编组树
export function queryFormationTrees() {
  return request({
    url: '/rest/zzrwpt/findAllTrees',
    method: 'get'
  })
}

// 查找作战编成
export function queryFormation(zzrwptid) {
  return request({
    url: `/rest/zzrwpt/${zzrwptid}`,
    method: 'get'
  })
}

// 查询加入作战群组的作战平台列表
export function queryEnjoyedPlatforms(zzrwid) {
  return request({
    url: `/rest/zzrwpt/enjoyedqz/${zzrwid}`,
    method: 'get'
  })
}

// 查询没有加入作战群组的作战平台列表
export function queryUnEnjoyedPlatforms(zzrwid) {
  return request({
    url: `/rest/zzrwpt/unenjoyedqz/${zzrwid}`,
    method: 'get'
  })
}
