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
      icon: 'lucide:clipboard-list', // 任务列表
      isModule: true,
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
      icon: 'lucide:sliders', // 控制、策略调节
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
      icon: 'lucide:users-round', // 群组、用户群
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
      icon: 'lucide:network', // 分级、拓扑层级
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
      icon: 'lucide:shield-check', // 保障、安全防御
      parentModule: '运控策略制定',
      requiresAuth: true
    }
  },
  {
    path: '/parallel-system-simulation',
    name: 'ParallelSystemSimulation',
    component: () =>
      import('@/views/system-operations/ParallelSystemSimulation.vue'),
    meta: {
      title: '平行系统推演',
      subsystem: '体系运营管理',
      category: '运控策略制定',
      icon: 'lucide:refresh-cw', // 平行、推演、循环
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
      icon: 'lucide:wrench', // 诊断、工具
      parentModule: '运控策略制定',
      requiresAuth: true
    }
  },

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
      icon: 'lucide:gantt-chart', // 调度、甘特图、规划时间轴
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/task-monitoring',
    name: 'TaskMonitoring',
    component: () => import('@/views/system-operations/TaskMonitoring.vue'),
    meta: {
      title: '作战任务监视',
      subsystem: '体系运营管理',
      category: '综合调度管理',
      icon: 'lucide:activity', // 活动、监视
      parentModule: '综合调度管理',
      requiresAuth: true
    }
  },
  {
    path: '/task-group-management',
    name: 'TaskGroupManagement',
    component: () =>
      import('@/views/system-operations/TaskGroupManagement.vue'),
    meta: {
      title: '任务群组管理',
      subsystem: '体系运营管理',
      category: '综合调度管理',
      icon: 'lucide:users', // 群组、用户
      parentModule: '综合调度管理',
      requiresAuth: true
    }
  },
  {
    path: '/resource-conflict-resolution',
    name: 'ResourceConflictResolution',
    component: () =>
      import('@/views/system-operations/ResourceConflictResolution.vue'),
    meta: {
      title: '数据链资源冲突消解',
      subsystem: '体系运营管理',
      category: '综合调度管理',
      icon: 'lucide:git-merge', // 冲突、合并、消解
      parentModule: '综合调度管理',
      requiresAuth: true
    }
  },
  {
    path: '/fault-handling',
    name: 'FaultHandling',
    component: () => import('@/views/system-operations/FaultHandling.vue'),
    meta: {
      title: '数据链故障处理',
      subsystem: '体系运营管理',
      category: '综合调度管理',
      icon: 'lucide:wrench', // 工具、维修、处理
      parentModule: '综合调度管理',
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
      icon: 'lucide:play-circle', // 开通、运行状态
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
      icon: 'lucide:sparkles', // 优选、智能化生成
      parentModule: '业务开通运行',
      requiresAuth: true
    }
  },
  {
    path: '/config-strategy-deployment',
    name: 'ConfigStrategyDeployment',
    component: () =>
      import('@/views/system-operations/ServiceTemplateDashboard.vue'),
    meta: {
      title: '服务模板和信息维护',
      subsystem: '体系运营管理',
      category: '业务开通运行',
      icon: 'lucide:layout-template', // 服务模板
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
      icon: 'lucide:eye', // 态势监视
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
      icon: 'lucide:bar-chart-3', // 统计图表
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
      icon: 'mdi:sword-cross', // 杀伤链、对抗（采用 MDI 军工感更足）
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
      icon: 'lucide:milestone', // 资源装备、节点
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
      icon: 'lucide:globe', // 网络状态
      parentModule: '运控态势监视',
      requiresAuth: true
    }
  },

  // 系统运维
  {
    path: '/alarm-monitoring',
    name: 'AlarmMonitoring',
    component: () => import('@/views/system-maintenance/WarnInfoDashboard.vue'),
    meta: {
      title: '告警监视处理',
      subsystem: '系统运维',
      category: '告警监视处理',
      icon: 'lucide:bell-ring', // 告警
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
      title: '性能监视处理',
      subsystem: '系统运维',
      category: '性能监视处理',
      icon: 'lucide:zap', // 性能、闪电
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
      title: '业务质量监控处理',
      subsystem: '系统运维',
      category: '业务质量监控处理',
      icon: 'lucide:activity', // 质量监控、业务波形
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/equipment-maintenance',
    name: 'EquipmentMaintenance',
    component: () =>
      import('@/views/system-maintenance/EquipmentMaintenance.vue'),
    meta: {
      title: '装备维护测试',
      category: '装备维护测试',
      subsystem: '系统运维',
      icon: 'lucide:wrench', // 工具、维护
      isModule: true,
      requiresAuth: true
    }
  },

  {
    path: '/data-collection',
    name: 'DataCollection',
    meta: {
      title: '数据采集',
      subsystem: '资源和数据管理',
      category: '数据采集',
      icon: 'lucide:database-backup', // 数据采集流入
      isModule: true,
      requiresAuth: true
    }
  },
  // 资源和数据管理 - 资源管理
  {
    path: '/resource-management',
    name: 'ResourceManagement',
    component: () => import('@/views/system-resource/ResourceManagement.vue'),
    meta: {
      title: '资源管理',
      subsystem: '资源和数据管理',
      category: '资源管理',
      icon: 'lucide:boxes', // 资源箱、包
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/information-resource-management',
    name: 'InformationResourceManagement',
    component: () =>
      import('@/views/system-resource/InformationResourceManagement.vue'),
    meta: {
      title: '信息资源管理',
      subsystem: '资源和数据管理',
      category: '资源管理',
      icon: 'lucide:folder-git', // 结构化信息资源
      parentModule: '资源管理',
      requiresAuth: true
    }
  },
  {
    path: '/datalink-equipment-lifecycle',
    name: 'DatalinkEquipmentLifecycle',
    component: () =>
      import('@/views/system-resource/DatalinkEquipmentLifecycle.vue'),
    meta: {
      title: '数据链装备全生命周期管理',
      subsystem: '资源和数据管理',
      category: '资源管理',
      icon: 'mdi:satellite-variant', // 数据链卫星/实体装备（MDI图标很贴切）
      parentModule: '资源管理',
      requiresAuth: true
    }
  },
  {
    path: '/datalink-spectrum-resource',
    name: 'DatalinkSpectrumResource',
    component: () =>
      import('@/views/system-resource/DatalinkSpectrumResource.vue'),
    meta: {
      title: '数据链频谱资源管理',
      subsystem: '资源和数据管理',
      category: '资源管理',
      icon: 'lucide:radio', // 频谱、无线电波
      parentModule: '资源管理',
      requiresAuth: true
    }
  },
  {
    path: '/datalink-user-info',
    name: 'DatalinkUserInfo',
    component: () => import('@/views/system-resource/DatalinkUserInfo.vue'),
    meta: {
      title: '数据链用户信息',
      subsystem: '资源和数据管理',
      category: '资源管理',
      icon: 'lucide:contact-2', // 用户信息
      parentModule: '资源管理',
      requiresAuth: true
    }
  },
  // 资源和数据管理 - 数据管理
  {
    path: '/data-management',
    name: 'DataManagement',
    component: () => import('@/views/system-resource/DataManagement.vue'),
    meta: {
      title: '数据管理',
      subsystem: '资源和数据管理',
      category: '数据管理',
      icon: 'lucide:database', // 核心数据库
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/permission-management',
    name: 'PermissionManagement',
    component: () => import('@/views/system-resource/PermissionManagement.vue'),
    meta: {
      title: '权限管理',
      subsystem: '资源和数据管理',
      category: '数据管理',
      icon: 'lucide:key-round', // 权限、密钥
      parentModule: '数据管理',
      requiresAuth: true
    }
  },
  {
    path: '/data-governance-model',
    name: 'DataGovernanceModel',
    component: () => import('@/views/system-resource/DataGovernanceModel.vue'),
    meta: {
      title: '数据治理模型维护',
      subsystem: '资源和数据管理',
      category: '数据管理',
      icon: 'lucide:git-fork', // 数据治理模型分叉模型
      parentModule: '数据管理',
      requiresAuth: true
    }
  },
  {
    path: '/classification-storage',
    name: 'ClassificationStorage',
    component: () =>
      import('@/views/system-resource/ClassificationStorage.vue'),
    meta: {
      title: '分类存储',
      subsystem: '资源和数据管理',
      category: '数据管理',
      icon: 'lucide:folder-tree', // 分类存储树
      parentModule: '数据管理',
      requiresAuth: true
    }
  },
  {
    path: '/subscription-distribution',
    name: 'SubscriptionDistribution',
    component: () =>
      import('@/views/system-resource/SubscriptionDistribution.vue'),
    meta: {
      title: '订阅分发',
      subsystem: '资源和数据管理',
      category: '数据管理',
      icon: 'lucide:share-2', // 分发、节点共享
      parentModule: '数据管理',
      requiresAuth: true
    }
  },
  {
    path: '/data-collection-project',
    name: 'DataCollectionProject',
    component: () =>
      import('@/views/system-resource/DataCollectionProject.vue'),
    meta: {
      title: '数据采集项目',
      subsystem: '资源和数据管理',
      category: '数据采集',
      icon: 'lucide:database',
      requiresAuth: true
    }
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
    ? `${to.meta.title} - 体系运控分系统`
    : '体系运控分系统'

  // 简单的权限检查（实际项目中替换为真实的认证逻辑）
  const isAuthenticated = localStorage.getItem('token') || !to.meta.requiresAuth

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
