import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8072/rest',
  headers: {
    Authorization: 'Bearer token',
    'Content-Type': 'application/json'
  }
})

// 1. 杀伤链基础配置
export const getSslPhraseMap = () => request.get('/sslxx/sslPhraseMap') // 获取阶段映射(0-发现, 1-定位...)
export const getSslStateMap = () => request.get('/sslxx/sslStateMap') // 获取状态映射

// 2. 杀伤链群组查询 (用于选择群组)
export const getSslqzPage = params =>
  request.post('/sslqz/page', {
    pageNum: 1,
    pageSize: 100,
    params: params
  })

// 3. 获取群组成员 (核心：获取参与平台)
export const getSslqzcyPage = (killchainId, qzId) =>
  request.post('/sslqzcy/page', {
    pageNum: 1,
    pageSize: 100,
    params: {
      KILLCHAIN_ID: killchainId,
      SSLQZID: qzId
    }
  })

// 4. 获取平台关联的武器和传感器
export const getCgqxxPage = ptId =>
  request.post('/cgqxx/page', {
    pageNum: 1,
    pageSize: 50,
    params: {PTID: ptId}
  })

export const getWqxxPage = ptId =>
  request.post('/wqxx/page', {
    pageNum: 1,
    pageSize: 50,
    params: {PTID: ptId}
  })

// 5. 获取网络态势
export const getZzrwwlPage = params =>
  request.post('/zzrwwl/page', {
    pageNum: 1,
    pageSize: 100,
    params: params
  })
