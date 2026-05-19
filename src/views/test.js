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
 * 格式转换函数
 * @param {Array} rawData 后端传递的原始数组
 * @returns {Array} 适配 X6 拓扑组件的数据格式
 */
const transformTopologyData = rawData => {
  if (!rawData || !Array.isArray(rawData)) return []

  return rawData.map(net => {
    // 1. 处理网络层 (Network)
    return {
      id: net.WLID,
      wlmc: net.wlmc,
      type: net.wllx,
      // 根据 wllx 判断图标
      icon: IMAGE_MAP[net.wllx] || IMAGE_MAP['默认'],

      // 2. 处理子网层 (Subnet) - 假设后端结构中 children 对应子网
      children: (net.children || []).map(sub => ({
        id: sub.id, // 子网如果没变则沿用
        name: sub.name,
        type: sub.type,

        // 3. 处理群组层 (Groups)
        groups: (sub.groups || []).map(group => ({
          id: group.qzid,
          name: group.qzmc,

          // 4. 处理成员节点 (Nodes)
          nodes: (group.nodes || []).map(node => {
            // 根据 ptmc 字符串包含关系判断图标
            let nodeIcon = IMAGE_MAP['默认']
            if (node.ptmc.includes('手机')) nodeIcon = IMAGE_MAP['手机']
            else if (node.ptmc.includes('电脑')) nodeIcon = IMAGE_MAP['电脑']

            return {
              id: node.ptid,
              name: node.ptmc,
              type: node.ptlx || '终端', // 假设有类型字段
              icon: nodeIcon
            }
          })
        }))
      }))
    }
  })
}
