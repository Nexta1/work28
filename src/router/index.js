import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: '/',
    redirect: '/task-decomposition'
  },
  // 体系运营管理 - 任务需求分解
  {
    path: '/task-decomposition',
    name: 'TaskDecomposition',
    component: () => import('@/views/system-operations/TaskDecomposition.vue'),
    meta: {
      title: '任务需求分解',
      subsystem: '体系运营管理',
      category: '任务需求分解',
      icon: '📋',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/battlefield-planning-info',
    name: 'BattlefieldPlanningInfo',
    component: () => import('@/views/system-operations/TaskDecomposition.vue'),
    meta: {
      title: '作战筹划信息获取',
      subsystem: '体系运营管理',
      category: '任务需求分解',
      icon: '📍',
      parentModule: '任务需求分解',
      requiresAuth: true
    }
  },
  {
    path: '/datalink-requirement-generation',
    name: 'DatalinkRequirementGeneration',
    component: () => import('@/views/system-operations/TaskDecomposition.vue'),
    meta: {
      title: '数据链保障需求生成',
      subsystem: '体系运营管理',
      category: '任务需求分解',
      icon: '🔗',
      parentModule: '任务需求分解',
      requiresAuth: true
    }
  },

  // 体系运营管理 - 运控策略制定
  {
    path: '/control-strategy',
    name: 'ControlStrategy',
    component: () => import('@/views/system-operations/ControlStrategy.vue'),
    meta: {
      title: '运控策略制定',
      subsystem: '体系运营管理',
      category: '运控策略制定',
      icon: '⚙️',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/task-group-config-strategy',
    name: 'TaskGroupConfigStrategy',
    component: () => import('@/views/system-operations/ScenarioStrategy.vue'),
    meta: {
      title: '任务群组配置策略生成',
      subsystem: '体系运营管理',
      category: '运控策略制定',
      icon: '👥',
      parentModule: '运控策略制定',
      requiresAuth: true
    }
  },
  {
    path: '/hierarchical-control-strategy',
    name: 'OcStrategyConfig',
    component: () => import('@/views/system-operations/OcStrategyConfig.vue'),
    meta: {
      title: '分级体系运控策略生成',
      subsystem: '体系运营管理',
      category: '运控策略制定',
      icon: '🏢',
      parentModule: '运控策略制定',
      requiresAuth: true
    }
  },
  {
    path: '/datalink-assurance-plan',
    name: 'DataLinkGuarantee',
    component: () => import('@/views/system-operations/DataLinkGuarantee.vue'),
    meta: {
      title: '数据链保障方案构建',
      subsystem: '体系运营管理',
      category: '运控策略制定',
      icon: '🔐',
      parentModule: '运控策略制定',
      requiresAuth: true
    }
  },
  {
    path: '/parallel-system-simulation',
    name: 'ParallelSystemSimulation',
    component: () => import('@/views/system-operations/ControlStrategy.vue'),
    meta: {
      title: '平行系统推演',
      subsystem: '体系运营管理',
      category: '运控策略制定',
      icon: '🔄',
      parentModule: '运控策略制定',
      requiresAuth: true
    }
  },
  {
    path: '/datalink-fault-diagnosis',
    name: 'DatalinkFaultDiagnosis',
    component: () => import('@/views/system-operations/FaultStrategy.vue'),
    meta: {
      title: '数据链故障诊断和处理策略',
      subsystem: '体系运营管理',
      category: '运控策略制定',
      icon: '🔧',
      parentModule: '运控策略制定',
      requiresAuth: true
    }
  },
  // {
  //   path: '/control-strategy-library',
  //   name: 'ControlStrategyLibrary',
  //   component: () => import('@/views/system-operations/ControlStrategy.vue'),
  //   meta: {
  //     title: '运控策略库构建',
  //     subsystem: '体系运营管理',
  //     category: '运控策略制定',
  //     icon: '📚',
  //     parentModule: '运控策略制定',
  //     requiresAuth: true
  //   }
  // },

  // 体系运营管理 - 综合调度管理
  {
    path: '/scheduling-management',
    name: 'SchedulingManagement',
    component: () =>
      import('@/views/system-operations/SchedulingManagement.vue'),
    meta: {
      title: '综合调度管理',
      subsystem: '体系运营管理',
      category: '综合调度管理',
      icon: '🎯',
      isModule: true,
      requiresAuth: true
    }
  },

  // 体系运营管理 - 业务开通运行
  {
    path: '/business-operation',
    name: 'BusinessOperation',
    component: () => import('@/views/system-operations/BusinessOperation.vue'),
    meta: {
      title: '业务开通运行',
      subsystem: '体系运营管理',
      category: '业务开通运行',
      icon: '🚀',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/control-strategy-optimization',
    name: 'ControlStrategyOptimization',
    component: () => import('@/views/system-operations/BusinessOperation.vue'),
    meta: {
      title: '运控策略优选与生成',
      subsystem: '体系运营管理',
      category: '业务开通运行',
      icon: '✨',
      parentModule: '业务开通运行',
      requiresAuth: true
    }
  },
  {
    path: '/config-strategy-deployment',
    name: 'ConfigStrategyDeployment',
    component: () => import('@/views/system-operations/BusinessOperation.vue'),
    meta: {
      title: '配置策略下发',
      subsystem: '体系运营管理',
      category: '业务开通运行',
      icon: '📤',
      parentModule: '业务开通运行',
      requiresAuth: true
    }
  },

  // 体系运营管理 - 运控态势监视
  {
    path: '/control-situation-monitoring',
    name: 'ControlSituationMonitoring',
    component: () => import('@/views/system-operations/Dashboard.vue'),
    meta: {
      title: '运控态势监视',
      subsystem: '体系运营管理',
      category: '运控态势监视',
      icon: '👁️',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/statistic-data-monitoring',
    name: 'StatisticDataMonitoring',
    component: () => import('@/views/system-operations/Dashboard.vue'),
    meta: {
      title: '统计数据监视',
      subsystem: '体系运营管理',
      category: '运控态势监视',
      icon: '📊',
      parentModule: '运控态势监视',
      requiresAuth: true
    }
  },
  {
    path: '/kill-chain-situation',
    name: 'KillChainSituation',
    component: () => import('@/views/system-operations/KillChainSituation.vue'),
    meta: {
      title: '杀伤链运行态势监视',
      subsystem: '体系运营管理',
      category: '运控态势监视',
      icon: '⛓️',
      parentModule: '运控态势监视',
      requiresAuth: true
    }
  },
  {
    path: '/combat-resource-status',
    name: 'CombatResourceStatus',
    component: () => import('@/views/system-operations/DeviceMonitor.vue'),
    meta: {
      title: '资源装备状态监视',
      subsystem: '体系运营管理',
      category: '运控态势监视',
      icon: '🎖️',
      parentModule: '运控态势监视',
      requiresAuth: true
    }
  },

  {
    path: '/network-status-monitoring',
    name: 'NetworkStatusMonitoring',
    component: () => import('@/views/system-operations/NetworkTopology.vue'),
    meta: {
      title: '网络状态信息监视',
      subsystem: '体系运营管理',
      category: '运控态势监视',
      icon: '🌐',
      parentModule: '运控态势监视',
      requiresAuth: true
    }
  },

  // 系统运维
  {
    path: '/alarm-monitoring',
    name: 'AlarmMonitoring',
    component: () => import('@/views/system-operations/DeviceMonitor.vue'),
    meta: {
      title: '研制告警监控处理',
      subsystem: '系统运维',
      category: '研制告警监控处理',
      icon: '🚨',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/performance-monitoring',
    name: 'PerformanceMonitoring',
    component: () =>
      import('@/views/system-maintenance/LinkPerformanceMonitor.vue'),
    meta: {
      title: '性能监控处理',
      subsystem: '系统运维',
      category: '性能监控处理',
      icon: '⚡',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/business-quality-monitor',
    name: 'BusinessQualityMonitorModule',
    component: () =>
      import('@/views/system-maintenance/BusinessQualityMonitor.vue'),
    meta: {
      title: '业务质量监控',
      subsystem: '系统运维',
      category: '业务质量监控',
      icon: '📈',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/equipment-maintenance-test',
    name: 'EquipmentMaintenanceTest',
    component: () =>
      import('@/views/system-maintenance/EquipmentMaintenance.vue'),
    meta: {
      title: '装备维护测试',
      subsystem: '系统运维',
      category: '装备维护测试',
      icon: '🔧',
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/device-monitor',
    name: 'DeviceMonitor',
    component: () => import('@/views/system-operations/DeviceMonitor.vue'),
    meta: {
      title: '设备监控',
      subsystem: '系统运维',
      category: '研制告警监控处理',
      icon: '💻',
      parentModule: '研制告警监控处理',
      requiresAuth: true
    }
  },
  {
    path: '/link-performance',
    name: 'LinkPerformanceMonitor',
    component: () =>
      import('@/views/system-maintenance/LinkPerformanceMonitor.vue'),
    meta: {
      title: '链路性能监控',
      subsystem: '系统运维',
      category: '性能监控处理',
      icon: '📊',
      parentModule: '性能监控处理',
      requiresAuth: true
    }
  },
  {
    path: '/business-quality-detail',
    name: 'BusinessQualityMonitor',
    component: () =>
      import('@/views/system-maintenance/BusinessQualityMonitor.vue'),
    meta: {
      title: '业务质量详情',
      subsystem: '系统运维',
      category: '业务质量监控',
      icon: '📑',
      parentModule: '业务质量监控',
      requiresAuth: true
    }
  },
  {
    path: '/equipment-test-report',
    name: 'EquipmentTestReport',
    component: () =>
      import('@/views/system-maintenance/EquipmentMaintenance.vue'),
    meta: {
      title: '测试报告',
      subsystem: '系统运维',
      category: '装备维护测试',
      icon: '📋',
      parentModule: '装备维护测试',
      requiresAuth: true
    }
  },
  {
    path: '/equipment-maintenance-log',
    name: 'EquipmentMaintenanceLog',
    component: () =>
      import('@/views/system-maintenance/EquipmentMaintenance.vue'),
    meta: {
      title: '维护日志',
      subsystem: '系统运维',
      category: '装备维护测试',
      icon: '📝',
      parentModule: '装备维护测试',
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
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
