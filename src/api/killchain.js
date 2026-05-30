import request from '@/utils/request'

/**
 * ===================================================================
 * 杀伤链 API（统一使用 @/utils/request）
 * ===================================================================
 * request.js 已配置 baseURL + token 拦截 + 响应码处理，
 * 各方法只需提供具体路径（含 /rest 前缀）。
 * 返回结果经过拦截器处理，res 即响应体本身。
 */

// 1. 杀伤链基础配置与群组
export const getSslPhraseMap = () => request.get('/rest/sslxx/sslPhraseMap')

export const getSslqzPage = params =>
  request.post('/rest/sslqz/page', {pageNum: 1, pageSize: 100, params})

export const getSslxxPage = params =>
  request.post('/rest/sslxx/page', {pageNum: 1, pageSize: 100, params})

export const getSslyxPage = params =>
  request.post('/rest/sslyx/page', {pageNum: 1, pageSize: 100, params})

export const getSslqzcyPage = (killchainId, qzId) =>
  request.post('/rest/sslqzcy/page', {
    pageNum: 1,
    pageSize: 100,
    params: {KILLCHAIN_ID: killchainId, SSLQZID: qzId}
  })

// 2. 武器与传感器
export const getptxPage = ptId => request.get(`/rest/ptxx/${ptId}`)

export const getptWarnInfos = ptId =>
  request.get(`/rest/warnInfo/ptWarnInfos/${ptId}`)

/**
 * 3. 获取作战任务网络态势接口
 * @param {Object} queryParams - 包含 RWMC / WLMC 等参数
 */
export const getZzrwwlPage = queryParams =>
  request.post('/rest/zzrwwl/page', {
    pageNum: 1,
    pageSize: 10,
    params: {
      RWMC: queryParams.RWMC || '',
      WLMC: queryParams.WLMC || '',
      ...queryParams
    }
  })

/**
 * 4. 杀伤链任务分页查询
 * @param {Object} data - { pageNum, pageSize, params }
 */
export function sslrw(data) {
  return request({
    url: '/rest/sslrw/page',
    method: 'post',
    data
  })
}
