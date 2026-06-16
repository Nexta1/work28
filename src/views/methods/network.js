const IMAGE_MAP = {
  // 网络类型图标（1-13 对应不同数据链体制）
  1: '/static/icon-net-1.svg',
  2: '/static/icon-net-2.svg',
  3: '/static/icon-net-3.svg',
  4: '/static/icon-net-4.svg',
  5: '/static/icon-net-5.svg',
  6: '/static/icon-net-6.svg',
  7: '/static/icon-net-7.svg',
  8: '/static/icon-net-8.svg',
  9: '/static/icon-net-9.svg',
  10: '/static/icon-net-10.svg',
  11: '/static/icon-net-11.svg',
  12: '/static/icon-net-12.svg',
  13: '/static/icon-net-13.svg',
  // 也支持中文名称查找
  地基接入网: '/static/icon-net-1.svg',
  天基信息直接入链星弹网: '/static/icon-net-2.svg',
  天基侦察信息分发网: '/static/icon-net-3.svg',
  天基接入网: '/static/icon-net-4.svg',
  宽频段混合组网网: '/static/icon-net-5.svg',
  视距超视距一体化组网网: '/static/icon-net-6.svg',
  全向低时延网: '/static/icon-net-7.svg',
  定向低时延网: '/static/icon-net-8.svg',
  低成本短距离导弹控制网: '/static/icon-net-9.svg',
  高频段高带宽网: '/static/icon-net-10.svg',
  激光频射一体化网: '/static/icon-net-11.svg',
  波形动态调整网: '/static/icon-net-12.svg',
  波形在线定义网: '/static/icon-net-13.svg',
  // 核心节点图标
  核心网: '/static/icon-network.svg',

  默认: '/static/icon-device.svg'
}

/**
 * 格式转换函数
 * @param {Array} rawData 后端传递的原始数组
 * @returns {Array} 适配 X6 拓扑组件的数据格式
 */
export const transformTopologyData = rawData => {
  if (!rawData || !Array.isArray(rawData)) return []

  return rawData.map(net => {
    // 1. 处理网络层 (Network)
    return {
      id: net.ZZRWWLID + 'wl',
      wlmc: net.WLMC,
      wllx: net.WLLX,
      wlh: net.WLH,
      // 根据 WLLX 判断图标
      icon: IMAGE_MAP[net.WLLX] || IMAGE_MAP['默认'],

      // 2. 处理子网层 (Subnet) - 假设后端结构中 children 对应子网
      children: (net.children || []).map(sub => ({
        id: sub.ZZRWWLID + 'zwwl', // 子网如果没变则沿用
        name: sub.WLMC,
        wllx: sub.WLLX,
        wlh: net.WLH,
        // 3. 处理群组层 (Groups)
        groups: (sub.zzrwqzwls || []).map(group => ({
          id: group.ZZRWQZID + 'qz',
          name: group.QZMC,

          // 4. 处理成员节点 (Nodes)
          nodes: (group.zzrwpts || []).map(node => {
            const ptmc = node.PTMC || node.ptmc || ''
            // 根据 ptmc 字符串包含关系判断图标
            let nodeIcon = IMAGE_MAP['默认']

            return {
              id: group.ZZRWQZID + 'qz' + node.PTID + 'pt',
              name: node.PTMC,
              type: node.ptlx || '终端', // 假设有类型字段
              icon: nodeIcon
            }
          })
        }))
      }))
    }
  })
}
