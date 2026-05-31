const IMAGE_MAP = {
  // 网络类型图标
  核心网: 'https://cdn-icons-png.flaticon.com/512/2111/2111303.png',
  外部网: 'https://cdn-icons-png.flaticon.com/512/711/711284.png',
  // 成员设备图标
  手机: 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png',
  电脑: 'https://cdn-icons-png.flaticon.com/512/3067/3067260.png',
  默认: 'https://cdn-icons-png.flaticon.com/512/633/633600.png'
}
/**
 * 图标路径解析函数
 * @param {string} type - 业务类型 (如：核心网, 手机)
 * @returns {string} - 完整的静态资源路径
 */
/**
 * 根据网络名称模糊匹配静态图标
 * @param {string} wlmc - 传入的网络名称 (例如: "核心网", "卫星设备")
 * @returns {string} - 匹配到的静态资源路径
 */
export const getIconByWLMC = wlmc => {
  // 1. 定义你 static 目录下的所有文件名清单
  const iconFiles = [
    '1-核心网波形.png',
    '2-移动终端.png',
    '3-固定终端.png',
    '4-卫星链路.png',
    '5-外部网络.png'
  ]

  // 2. 查找文件名中包含 wlmc 的项
  const match = iconFiles.find(fileName => fileName.includes(wlmc))

  // 3. 返回路径，如果没找到则返回默认图标
  if (match) {
    return `/static/${match}`
  }

  return '/static/default-node.png' // 兜底图标
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
      // 根据 wllx 判断图标
      icon: IMAGE_MAP[net.wllx] || IMAGE_MAP['默认'],

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
            // 根据 ptmc 字符串包含关系判断图标
            let nodeIcon = IMAGE_MAP['默认']
            if (node.ptmc.includes('手机')) nodeIcon = IMAGE_MAP['手机']
            else if (node.ptmc.includes('电脑')) nodeIcon = IMAGE_MAP['电脑']

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
