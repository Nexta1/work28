import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    name: '/',
    redirect: '/task-decomposition'
  },
  // 体系运营管理 - 任务需求分解
  {
    path: '/task-decomposition',
    name: 'TaskDecomposition',
    component: () =>
      import('@/views/system-operations/rwxqfj/TaskDecomposition.vue'),
    meta: {
      title: '任务需求分解',
      subsystem: '体系运营管理',
      category: '任务需求分解',
      icon: 'lucide:clipboard-list', // 任务列表
      isModule: true,
      requiresAuth: true
    }
  },
  {
    path: '/decomposition',
    name: 'Decomposition',
    component: () =>
      import('@/views/system-operations/rwxqfj/TaskDecomposition.vue'),
    meta: {
      title: '作战筹划信息',
      subsystem: '体系运营管理',
      category: '任务需求分解 ',
      icon: 'lucide:compass', // 作战筹划
      parentModule: '任务需求分解',
      requiresAuth: true
    }
  },
  {
    path: '/datalink-assurance-requirements',
    name: 'DataLinkAssuranceRequirements',
    component: () =>
      import('@/views/system-operations/rwxqfj/DataLinkAssuranceRequirements.vue'),
    meta: {
      title: '数据链保障需求分析',
      subsystem: '体系运营管理',
      category: '任务需求分解',
      icon: 'lucide:shield-check', // 保障需求
      parentModule: '任务需求分解',
      requiresAuth: true
    }
  },

  // 体系运营管理 - 运控策略制定
  {
    path: '/control-strategy',
    name: 'ControlStrategy',
    component: () =>
      import('@/views/system-operations/ykclzd/ControlStrategy.vue'),
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
    component: () =>
      import('@/views/system-operations/ykclzd/ScenarioStrategy.vue'),
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
    component: () =>
      import('@/views/system-operations/ykclzd/OcStrategyConfig.vue'),
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
    component: () =>
      import('@/views/system-operations/ykclzd/DataLinkGuarantee.vue'),
    meta: {
      title: '数据链保障方案构建',
      subsystem: '体系运营管理',
      category: '任务需求分解',
      icon: 'lucide:shield-check',
      parentModule: '任务需求分解',
      requiresAuth: true
    }
  },
  {
    path: '/parallel-system-simulation',
    name: 'ParallelSystemSimulation',
    component: () =>
      import('@/views/system-operations/ykclzd/ParallelSystemSimulation.vue'),
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
    component: () =>
      import('@/views/system-operations/ykclzd/FaultStrategy.vue'),
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
      import('@/views/system-operations/zhddgl/SchedulingManagement.vue'),
    meta: {
      title: '综合调度管理',
      subsystem: '体系运营管理',
      category: '综合调度管理',
      icon: 'lucide:gantt-chart', // 调度、甘特图、规划时间轴
      isModule: false,
      requiresAuth: true
    }
  },
  {
    path: '/task-monitoring',
    name: 'TaskMonitoring',
    component: () =>
      import('@/views/system-operations/zhddgl/TaskMonitoring.vue'),
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
      import('@/views/system-operations/zhddgl/TaskGroupManagement.vue'),
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
      import('@/views/system-operations/zhddgl/ResourceConflictResolution.vue'),
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
    component: () =>
      import('@/views/system-operations/zhddgl/FaultHandling.vue'),
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
    component: () =>
      import('@/views/system-operations/ywktyx/BusinessOperation.vue'),
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
    component: () =>
      import('@/views/system-operations/ywktyx/BusinessOperation.vue'),
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
      import('@/views/system-operations/ywktyx/ServiceTemplateDashboard.vue'),
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
    component: () => import('@/views/system-operations/yktsjs/Dashboard.vue'),
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
    component: () => import('@/views/system-operations/yktsjs/Dashboard.vue'),
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
    component: () =>
      import('@/views/system-operations/yktsjs/KillChainSituation.vue'),
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
    component: () =>
      import('@/views/system-operations/yktsjs/DeviceMonitor.vue'),
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
    component: () =>
      import('@/views/system-operations/yktsjs/NetworkTopology.vue'),
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
    path: '/gj-monitoring',
    name: 'gjMonitoring',
    component: () =>
      import('@/views/system-maintenance/gjjscl/WarnInfoDashboard.vue'),
    meta: {
      title: '告警信息处理',
      subsystem: '系统运维',
      category: '告警监视处理',
      icon: 'lucide:bell-ring', // 告警
      parentModule: '告警监视处理',
      requiresAuth: true
    }
  },
  {
    path: '/performance-events',
    name: 'PerformanceEvents',
    component: () =>
      import('@/views/system-maintenance/components/EventQueryPage.vue'),
    meta: {
      title: '性能事件',
      subsystem: '系统运维',
      category: '告警监视处理',
      icon: 'lucide:zap',
      parentModule: '告警监视处理',
      requiresAuth: true
    }
  },
  {
    path: '/business-quality-events',
    name: 'BusinessQualityEvents',
    component: () =>
      import('@/views/system-maintenance/components/EventQueryPage.vue'),
    meta: {
      title: '业务质量事件',
      subsystem: '系统运维',
      category: '告警监视处理',
      icon: 'lucide:clipboard-list',
      parentModule: '告警监视处理',
      requiresAuth: true
    }
  },
  // {
  //   path: '/ai-intelligent-alert',
  //   name: 'AiIntelligentAlert',
  //   component: () =>
  //     import('@/views/system-maintenance/gjjscl/AiIntelligentAlert.vue'),
  //   meta: {
  //     title: 'AI智能告警',
  //     subsystem: '系统运维',
  //     category: '告警监视处理',
  //     icon: 'lucide:bot',
  //     parentModule: '告警监视处理',
  //     requiresAuth: true
  //   }
  // },

  {
    path: '/performance-monitoring',
    name: 'PerformanceMonitoring',
    component: () =>
      import('@/views/system-maintenance/xnjscl/LinkPerformanceMonitor.vue'),
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
      import('@/views/system-maintenance/ywzljkcl/BusinessQualityMonitor.vue'),
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
      import('@/views/system-maintenance/zbwhcs/EquipmentMaintenance.vue'),
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
    component: () =>
      import('@/views/system-resource/sjcj/DataCollectionProject.vue'),
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
    component: () =>
      import('@/views/system-resource/zygl/ResourceManagement.vue'),
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
      import('@/views/system-resource/zygl/InformationResourceManagement.vue'),
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
      import('@/views/system-resource/zygl/DatalinkEquipmentLifecycle.vue'),
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
      import('@/views/system-resource/zygl/DatalinkSpectrumResource.vue'),
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
    component: () =>
      import('@/views/system-resource/zygl/DatalinkUserInfo.vue'),
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
    component: () => import('@/views/system-resource/sjgl/DataManagement.vue'),
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
    component: () =>
      import('@/views/system-resource/sjgl/PermissionManagement.vue'),
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
    component: () =>
      import('@/views/system-resource/sjgl/DataGovernanceModel.vue'),
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
      import('@/views/system-resource/sjgl/ClassificationStorage.vue'),
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
      import('@/views/system-resource/sjgl/SubscriptionDistribution.vue'),
    meta: {
      title: '订阅分发',
      subsystem: '资源和数据管理',
      category: '数据管理',
      icon: 'lucide:share-2', // 分发、节点共享
      parentModule: '数据管理',
      requiresAuth: true
    }
  },
  // 系统运维 - 性能监视处理（含分析子页面）
  {
    path: '/device-status-analysis',
    name: 'DeviceStatusAnalysis',
    component: () => import('@/views/data-analysis/DeviceStatusAnalysis.vue'),
    meta: {
      title: '设备状态分析',
      subsystem: '系统运维',
      category: '性能监视处理',
      icon: 'lucide:monitor',
      parentModule: '性能监视处理',
      requiresAuth: true
    }
  },
  {
    path: '/network-status-analysis',
    name: 'NetworkStatusAnalysis',
    component: () => import('@/views/data-analysis/NetworkStatusAnalysis.vue'),
    meta: {
      title: '网络状态分析',
      subsystem: '系统运维',
      category: '性能监视处理',
      icon: 'lucide:network',
      parentModule: '性能监视处理',
      requiresAuth: true
    }
  },
  // 404 兜底 - 匹配所有未定义路由，重定向到首页
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

// 路由错误处理（防止异步组件加载失败等导致白屏）
router.onError(error => {
  console.error('路由导航错误:', error)
  // 当异步组件加载失败时，尝试刷新页面
  if (/Loading chunk |Failed to fetch/i.test(error.message)) {
    window.location.reload()
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
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
  } else {
    next()
  }
})

export default router
