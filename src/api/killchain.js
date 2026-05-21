import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8072/rest',
  headers: {
    Authorization: 'Bearer token',
    'Content-Type': 'application/json'
  }
})

// 1. 杀伤链基础配置与群组
export const getSslPhraseMap = () => request.get('/sslxx/sslPhraseMap')
export const getSslqzPage = params =>
  request.post('/sslqz/page', {pageNum: 1, pageSize: 100, params})
export const getSslxxPage = params =>
  request.post('/sslxx/page', {pageNum: 1, pageSize: 100, params})
export const getSslyxPage = params =>
  request.post('/sslyx/page', {pageNum: 1, pageSize: 100, params})
export const getSslqzcyPage = (killchainId, qzId) =>
  request.post('/sslqzcy/page', {
    pageNum: 1,
    pageSize: 100,
    params: {KILLCHAIN_ID: killchainId, SSLQZID: qzId}
  })

// 2. 武器与传感器
export const getptxPage = ptId => request.get(`/ptxx/${ptId}`)

/**
 * 3. 新增/完善：获取作战任务网络态势接口
 * @param {Object} queryParams - 包含 RWMC (任务名称) 或 ZZRWXXID 等参数
 */
export const getZzrwwlPage = queryParams =>
  request.post('/zzrwwl/page', {
    pageNum: 1,
    pageSize: 10,
    params: {
      RWMC: queryParams.RWMC || '',
      WLMC: queryParams.WLMC || '',
      ...queryParams
    }
  })
