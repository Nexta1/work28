import request from '@/utils/request'
export function wllxMap() {
  return request({
    url: `/rest/zzrwwl/wllxMap`,
    method: 'get'
  })
}
export function nodeTypes() {
  return request({
    url: `/rest/businessNode/nodeTypes`,
    method: 'get'
  })
}
export function zzrwwlFindTree(zzrwid) {
  return request({
    url: `rest/zzrwwl/findTree/${zzrwid}`,
    method: 'get'
  })
}
export function rwlbMap() {
  return request({
    url: `rest/zzrwxx/rwlbMap`,
    method: 'get'
  })
}

export function rwlxMap() {
  return {
    1: '指挥协同',
    2: '态势共享',
    3: '火力打击',
    4: '预警侦察',
    5: '对面拒止',
    6: '对空拒止'
  }
}
export function tlywList() {
  return ['态势', '语音', '视频', '文电', '目指', '话音', '指令', '图像']
}
export function aqbmList() {
  return ['高', '中', '低']
}

export function zzrwwlTrees() {
  return request({
    url: `/rest/zzrwpt/findAllTrees`,
    method: 'get'
  })
}
export function businessInfoTops() {
  return request({
    url: `/rest/businessInfo/tops`,
    method: 'get'
  })
}
export function getStrategyTypes() {
  return ['一级运控策略', '二级运控策略', '运控节点切换策略', '其他策略']
}
export function getAttributeMap() {
  return {
    主节点选取策略: 'mainChoice',
    备份节点选取策略: 'backupChoice',
    备份节点: 'backupNode',
    数量定制策略: 'quantity',
    主节点服务器主机CPU阈值: 'cpuThreshold',
    主节点网络中断时触发切换: 'interrupSwitch',
    '切换前数据备份时间(分)': 'backupTime',
    单链网管节点选取策略: 'nodeChoice',
    时间基准节点选取策略: 'timeChoice'
  }
}
export function getAttrTypes() {
  return ['浮点数', '整数', '长整数', '字符串', '日期时间', '选择项']
}
export function getYXJMap() {
  return {
    '01': '一般',
    '02': '重要',
    '03': '核心'
  }
}
