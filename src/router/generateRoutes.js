/**
 * 后端模块数据转Vue2 Router配置 + 构建菜单树
 * 后端字段约定：
 * moduleId、parentModuleId、moduleCode(name)、moduleName、moduleTitle、moduleUrl(path)
 * frontUrl(@/views/xxx.vue)、moduleIcon、serviceNames="requiresAuth,isVisible,redirect"
 */

/**
 * 懒加载组件工具（Vue2 Webpack require.context 安全版，无动态import字符串）
 */
const viewsContext = require.context('@/views', true, /\.vue$/)
// 预缓存所有页面相对路径，用于校验文件是否存在
const ctxKeys = viewsContext.keys()

/**
 * 根据后端frontUrl生成路由懒加载函数
 * @param {string} frontUrl 组件路径 @/views/xxx.vue
 * @returns {Function}
 */
function lazyLoadComponent(frontUrl) {
  if (!frontUrl || !frontUrl.trim()) return null
  let rawPath = frontUrl.trim()
  let relPath = ''

  // 统一多种路径格式转为 ./xxx.vue 匹配require.context
  if (rawPath.startsWith('@/views/')) {
    relPath = './' + rawPath.slice(8)
  } else if (rawPath.startsWith('/src/views/')) {
    relPath = './' + rawPath.slice(11)
  } else if (rawPath.startsWith('src/views/')) {
    relPath = './' + rawPath.slice(10)
  } else if (rawPath.startsWith('views/')) {
    relPath = './' + rawPath.slice(6)
  } else {
    console.warn('【动态路由】无法识别的组件路径格式：', rawPath)
    // 路径格式非法，兜底404页面
    return () => import('@/views/error/404.vue')
  }

  // 判断文件真实存在
  if (ctxKeys.includes(relPath)) {
    // 必须返回 Promise（Vue Router 3 异步组件解析要求），兼容同步 require.context
    return () => Promise.resolve(viewsContext(relPath).default)
  }

  console.error(`【动态路由】页面文件不存在：原始=${rawPath} 转换后=${relPath}`)
  return () => import('@/views/error/404.vue')
}

/**
 * 后端模块数组 → Vue Router 路由数组
 * @param {Array} modules 后端返回模块列表
 * @returns {Array} 路由配置
 */
export function generateRoutes(modules) {
  if (!Array.isArray(modules) || modules.length === 0) return []

  // 建立 moduleId -> moduleTitle 映射，用于子路由取父标题
  const titleMap = {}
  modules.forEach(item => {
    if (item.moduleId != null) {
      titleMap[item.moduleId] = item.moduleTitle || ''
    }
  })

  return modules
    .filter(item => !!item.moduleUrl) // 过滤无路由地址的纯权限项
    .map(item => {
      // 解析配置字符串：requiresAuth,isVisible,redirect
      const configStr = item.serviceNames || 'true,true,'
      const config = configStr.split(',').map(s => s.trim())
      const requiresAuth = config[0] === 'true'
      const isVisible = config[1] === 'true'
      const redirectPath = config[2]?.trim() || ''

      // 判断是否顶层模块
      const isTopLevel = item.parentModuleId == null
      const parentTitle = titleMap[item.parentModuleId] || ''
      const category = isTopLevel ? item.moduleTitle || '' : parentTitle

      // 基础路由对象
      const route = {
        path: item.moduleUrl,
        name: item.moduleCode,
        meta: {
          title: item.moduleTitle || '',
          subsystem: item.moduleName || '',
          category,
          icon: item.moduleIcon || '',
          requiresAuth,
          isVisible
        }
      }

      // 重定向存入meta
      if (redirectPath) {
        route.meta.redirect = redirectPath
      }

      // 顶层/子模块标记
      if (isTopLevel) {
        route.meta.isModule = true
      } else if (parentTitle) {
        route.meta.parentModule = parentTitle
      }

      // 挂载页面组件，无frontUrl标记为纯分组菜单
      if (item.frontUrl) {
        route.component = lazyLoadComponent(item.frontUrl)
      } else {
        route.meta.isGroup = true
      }

      return route
    })
}

/**
 * 一维模块数组 → 树形菜单（侧边栏渲染用）
 * @param {Array} modules 后端原始模块列表
 * @returns {Array} 树形菜单数组，带children
 */
export function buildMenuTree(modules) {
  if (!Array.isArray(modules) || modules.length === 0) return []

  const nodeMap = {}
  const treeRoot = []

  // 先创建全量节点映射
  modules.forEach(item => {
    const configStr = item.serviceNames || 'true,true,'
    const config = configStr.split(',').map(s => s.trim())
    const requiresAuth = config[0] === 'true'
    const isVisible = config[1] === 'true'
    const redirect = config[2]?.trim() || ''

    nodeMap[item.moduleId] = {
      ...item,
      requiresAuth,
      isVisible,
      redirect,
      children: []
    }
  })

  // 递归组装父子树
  modules.forEach(item => {
    const currNode = nodeMap[item.moduleId]
    const parentId = item.parentModuleId
    if (parentId && nodeMap[parentId]) {
      nodeMap[parentId].children.push(currNode)
    } else {
      treeRoot.push(currNode)
    }
  })

  return treeRoot
}
