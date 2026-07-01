import request from '@/utils/request'

/** 将后端 Map 结构转为 el-select 选项 */
export function normalizeMapOptions(res) {
  const data = res && res.data ? res.data : {}
  if (Array.isArray(data)) {
    return data.map(item => ({
      value: item.value != null ? item.value : item.id,
      label: item.label || item.name || String(item.value)
    }))
  }
  return Object.keys(data).map(key => ({
    value: Number.isNaN(Number(key)) ? key : Number(key),
    label: data[key]
  }))
}

/** 编识号段 - 战区 / 军种 */
export async function getBshSegmentTheaterMap() {
  return {
    data: {
      1: '东部战区',
      2: '南部战区',
      3: '西部战区',
      4: '北部战区',
      5: '中部战区',
      6: '战区联合'
    }
  }
}
export function getBshSegmentArmyMap() {
  return request({url: '/rest/bshSegment/SSJZNMMap', method: 'get'})
}

/** 频谱 - 网络内码 / 网络类型 / 级联映射 */
export function getFrequencyWLNMMap() {
  return request({url: '/rest/frequencyInfo/WLNMMap', method: 'get'})
}
export function getFrequencyWLLXMap() {
  return request({url: '/rest/frequencyInfo/WLLXMap', method: 'get'})
}
export function getFrequencyWlnmWllxMap() {
  return request({url: '/rest/frequencyInfo/wlnmWllxMapMap', method: 'get'})
}

/** 平台型号 - 平台类型映射 / 型号列表 */
export function getPtxhPtlxMap() {
  return request({url: '/rest/ptxhInfo/ptlxMap', method: 'get'})
}
export function getPtxhInfos() {
  return request({url: '/rest/ptxhInfo/ptxhInfos', method: 'get'})
}

/** 编识号类型 */
export const BSH_TYPE_OPTIONS = [
  {value: 0, label: '平台编识号'},
  {value: 1, label: '目标编识号'}
]

/** 装备入退网状态 */
export const SBWLZT_OPTIONS = [
  {value: 1, label: '入网'},
  {value: 2, label: '退网'}
]

/** 传感器类型 */
export const CGQLX_OPTIONS = [
  {value: 1, label: '雷达传感器'},
  {value: 2, label: '光学传感器'},
  {value: 3, label: '电子传感器'}
]

/** 武器类型 */
export const WQLX_OPTIONS = [
  {value: 1, label: '对陆'},
  {value: 2, label: '对水面'},
  {value: 3, label: '对水下'},
  {value: 4, label: '对空'}
]

export function getCgqxhInfos() {
  return request({url: '/rest/cgqxhInfo/cgqxhInfos', method: 'get'})
}

export function getWqxhInfos() {
  return request({url: '/rest/wqxhInfo/wqxhInfos', method: 'get'})
}

export function getPtxxInfos() {
  return request({url: '/rest/ptxx/ptxxs', method: 'get'})
}
