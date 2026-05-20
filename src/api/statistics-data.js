import request from '@/utils/request'

/**
 * 统计数据API
 * 模块名称: 任务信息 (ZZRWXX)
 * 基础路径: /rest/zzrwxx
 */

// 获取任务类型列表
export function getTaskTypeList() {
  return request({
    url: '/rest/zzrwxx/rwlbMap',
    method: 'get'
  })
}
