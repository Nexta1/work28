import request from '@/utils/request'
// 返回值都是数组
// 查询所有数据类型
export function unitInfo() {
  return request({
    url: `/rest/unitInfo/unitInfos`,
    method: 'get'
  })
}
// 查询所有窗口类型

export function dataTypes() {
  return request({
    url: `/rest/performanceMetric/dataTypes`,
    method: 'get'
  })
}
// 查询所有聚合方法
export function accumulateMethods() {
  return request({
    url: `/rest/performanceMetric/accumulateMethods`,
    method: 'get'
  })
}
// 查询所有区间类型
export function intervalTypes() {
  return request({
    url: `/rest/performanceStandard/intervalTypes`,
    method: 'get'
  })
}
// 查询所有性评价
export function performanceEvaluations() {
  return request({
    url: `/rest/performanceStandard/intervalTypes`,
    method: 'get'
  })
}
// 所有业务状态
export function qualityStates() {
  return request({
    url: `/rest/performanceStandard/qualityStates`,
    method: 'get'
  })
}
