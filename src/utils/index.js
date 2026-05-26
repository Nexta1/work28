/**
 * 根据 PARENTPTID 组装树结构
 * 保留原有全部字段
 *
 * @param {Array} list 原始数组
 * @param {String} idKey 当前ID字段
 * @param {String} parentKey 父ID字段
 * @param {String|Number|null} rootValue 根节点父值
 * @returns {Array}
 */
export function buildTree(
  list,
  idKey = 'PTID',
  parentKey = 'PARENTPTID',
  rootValue = null
) {
  const map = {}
  const tree = []
  console.log(list)
  // 先生成映射
  list.forEach(item => {
    map[item[idKey]] = {
      ...item,
      children: []
    }
  })

  // 组装树
  list.forEach(item => {
    const current = map[item[idKey]]

    const parentId = item[parentKey]

    // 根节点
    if (parentId === rootValue || parentId === undefined || parentId === '') {
      tree.push(current)
    } else {
      // 有父节点
      if (map[parentId]) {
        map[parentId].children.push(current)
      } else {
        // 找不到父节点时也作为根节点
        tree.push(current)
      }
    }
  })

  return tree
}
