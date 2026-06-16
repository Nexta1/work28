import request from '@/utils/request-maintenance'
// 返回值都是数组
// 查询所有数据类型
export function unitInfo() {
  return request({
    url: `/rest/unitInfo/unitInfos`,
    method: 'get'
  })
}
// 查询所有窗口类型
export function windowTypes() {
  return request({
    url: `/rest/performanceMetric/windowTypes`,
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
export function dataTypes() {
  return request({
    url: `/rest/performanceMetric/dataTypes`,
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
    url: `/rest/performanceStandard/performanceEvaluations`,
    method: 'get'
  })
}
// 所有业务状态
export function qualityStates() {
  return request({
    url: `/rest/operationStandard/qualityStates`,
    method: 'get'
  })
}

/**
 * 分页查询业务质量标准事件
 * @param {Object} params - { start, length, groupValue, metricName, eventTimestampBegin, eventTimestampEnd }
 */
export function getOperationStandardEventPage(params) {
  return request({
    url: '/rest/operationStandardEvent',
    method: 'get',
    params
  })
}

/**
 * 分页查询性能标准事件
 * @param {Object} params - { start, length, groupValue, metricName, eventTimestampBegin, eventTimestampEnd }
 */
export function getPerformanceStandardEventPage(params) {
  return request({
    url: '/rest/performanceStandardEvent',
    method: 'get',
    params
  })
}
