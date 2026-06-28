import Vue from 'vue'
import VueRouter from 'vue-router'
import {indexRoutes, staticRoutes} from './staticRoutes'
import {generateRoutes} from './generateRoutes'

Vue.use(VueRouter)

// localStorage 开关：true 使用后端路由，false 使用静态路由
const useBackendRoutes = localStorage.getItem('useBackendRoutes') === 'true'

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    ...indexRoutes,
    // 根路径重定向始终保留，避免后端路由模式下 404 死循环
    {
      path: '/',
      redirect: '/task-decomposition'
    },
    // 启用后端路由时，不再预先注册静态业务路由
    ...(useBackendRoutes ? [] : staticRoutes),
    // 404 页面（静态路由模式下使用）
    ...(useBackendRoutes
      ? []
      : [
          {
            path: '*',
            name: 'NotFound',
            component: () => import('@/views/error/404.vue'),
            meta: {title: '页面未找到', requiresAuth: false}
          }
        ])
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  }
})

// 路由错误处理（防止异步组件加载失败等导致白屏）
router.onError(error => {
  console.error('路由导航错误:', error)
  // 当异步组件加载失败时，尝试刷新页面
  if (/Loading chunk |Failed to fetch/i.test(error.message)) {
    window.location.reload()
  }
})

// 标记是否已动态注册过后端路由
let dynamicRoutesAdded = false

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 体系运控分系统`
    : '体系运控分系统'

  // 免登录页面直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 权限校验：从 localStorage 读取 token（避免 store 未初始化时的时序问题）
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // ===== 动态注册后端路由 =====
  const useBackend = localStorage.getItem('useBackendRoutes') === 'true'
  if (useBackend && !dynamicRoutesAdded) {
    try {
      const store = require('@/store').default
      let modules = store.state.permissions || []
      if (modules.length === 0 && token) {
        await store.dispatch('fetchCurrentUser')
        modules = store.state.permissions || []
      }
      if (modules.length > 0) {
        const generatedRoutes = generateRoutes(modules)
        console.log('[后端路由] 动态注册路由数:', generatedRoutes)
        generatedRoutes.forEach(route => {
          const exists = router.getRoutes().some(r => r.name === route.name)
          if (!exists && route.component) {
            router.addRoute(route)
          }
        })
        console.log(
          '[后端路由] 动态注册完成，当前路由列表:',
          router.getRoutes()
        )
        dynamicRoutesAdded = true

        // 注册 404 兜底路由（放在最后确保优先级最低）
        if (!router.getRoutes().some(r => r.name === 'NotFound')) {
          router.addRoute({
            path: '*',
            name: 'NotFound',
            component: () => import('@/views/error/404.vue'),
            meta: {title: '页面未找到', requiresAuth: false}
          })
        }

        // 注册完新路由后，强制重新解析当前导航，否则新路由不会立即生效
        // 只传递路径/query/hash，避免 Route 对象中 matched 等内部字段干扰
        next({
          path: to.path,
          query: to.query,
          hash: to.hash,
          replace: true
        })
        return
      }
    } catch (e) {
      console.warn('[后端路由] 动态注册失败:', e)
    }
  }
  // ===== 动态注册结束 =====

  next()
})

export default router
