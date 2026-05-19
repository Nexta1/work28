import request from '@/utils/request'

/**
 * 任务群组管理API
 * 模块名称: 任务群组 (ZZRWQZ)
 * 基础路径: /rest/zzrwqz
 */

// 分页查询任务群组
export function pageQueryTaskGroup(data) {
  return request({
    url: '/rest/zzrwqz/page',
    method: 'post',
    data
  })
}

// 新增任务群组
export function createTaskGroup(data) {
  return request({
    url: '/rest/zzrwqz',
    method: 'post',
    data
  })
}

// 修改任务群组
export function updateTaskGroup(data) {
  return request({
    url: '/rest/zzrwqz',
    method: 'put',
    data
  })
}

// 删除任务群组
export function deleteTaskGroup(zzrwqzid) {
  return request({
    url: `/rest/zzrwqz/${zzrwqzid}`,
    method: 'delete'
  })
}

// 查询任务群组
export function queryTaskGroup(zzrwqzid) {
  return request({
    url: `/rest/zzrwqz/${zzrwqzid}`,
    method: 'get'
  })
}

// 查询所有任务群组
export function queryAllTaskGroups() {
  return request({
    url: '/rest/zzrwqz/zzrwqzs',
    method: 'get'
  })
}
