import request from '@/utils/request'

/**
 * 作战任务管理API
 * 模块名称: 作战任务 (ZZRWXX)
 * 基础路径: /rest/zzrwxx
 */

// 分页查询作战任务

export function pageQueryTask(data) {
  return request({
    url: '/rest/zzrwxx/page',
    method: 'post',
    data
  })
}

// 新增作战任务
export function createTask(data) {
  return request({
    url: '/rest/zzrwxx',
    method: 'post',
    data
  })
}

// 查询单个作战任务
export function queryTask(zzrwid) {
  return request({
    url: `/rest/zzrwxx/${zzrwid}`,
    method: 'get'
  })
}

// 删除作战任务
export function deleteTask(zzrwid) {
  return request({
    url: `/rest/zzrwxx/${zzrwid}`,
    method: 'delete'
  })
}

// 获取任务类型列表
export function getTaskTypeList() {
  return request({
    url: '/rest/zzrwxx/rwlbMap',
    method: 'get'
  })
}
