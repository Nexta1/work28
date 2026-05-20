import request from '@/utils/request'

export function getUserInfo(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  })
}

// 杀伤链模块导出
export * from './ssl'
export * from './kill-chain-task'

// 网络统计和统计数据导出
export * from './network-statistics'
export * from './statistics-data'
