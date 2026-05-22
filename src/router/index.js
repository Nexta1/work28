import Vue from 'vue'
import VueRouter from 'vue-router'
import KillChainVisualization from '@/components/KillChainVisualization.vue'
import AgentFlowEditor from '@/components/AgentFlowEditor.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'KillChain',
    component: KillChainVisualization,
    meta: {
      title: '杀伤链路构建系统',
      requiresAuth: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '作战态势 dashboard',
      requiresAuth: true
    }
  },
  {
    path: '/network',
    name: 'Network',
    component: () => import('@/views/NetworkTopology.vue'),
    meta: {
      title: '网络拓扑',
      requiresAuth: true
    }
  },
  {
    path: '/kill-chain-situation',
    name: 'KillChainSituation',
    component: () => import('@/views/KillChainSituation.vue'),
    meta: {
      title: '杀伤链运行态势',
      requiresAuth: true
    }
  },
  {
    path: '/DeviceMonitor',
    name: 'DeviceMonitor',
    component: () => import('@/views/DeviceMonitor.vue'),
    meta: {
      title: 'DeviceMonitor',
      requiresAuth: true
    }
  },
  {
    path: '/LinkPerformanceMonitor',
    name: 'LinkPerformanceMonitor',
    component: () => import('@/views/LinkPerformanceMonitor.vue'),
    meta: {
      title: 'LinkPerformanceMonitor',
      requiresAuth: true
    }
  },
  {
    path: '/BusinessQualityMonitor',
    name: 'BusinessQualityMonitor',
    component: () => import('@/views/BusinessQualityMonitor.vue'),
    meta: {
      title: 'BusinessQualityMonitor',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '系统登录',
      requiresAuth: false
    }
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return {x: 0, y: 0}
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title
    ? `${to.meta.title} - 杀伤链路系统`
    : '杀伤链路系统'

  // 简单的权限检查（实际项目中替换为真实的认证逻辑）
  const isAuthenticated = localStorage.getItem('token') || !to.meta.requiresAuth

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
