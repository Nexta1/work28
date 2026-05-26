<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">🗺️ 作战任务编排路线与编成空间态势大屏总线</span>

        <div class="search-item">
          <label>作战任务名称 (RWMC)</label>
          <input
            type="text"
            v-model="queryParam.RWMC"
            @input="loadZzrwxxList"
            placeholder="输入任务名称搜索..."
            class="global-input"
            style="width: 260px"
          />
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="initGlobalDashboard"
        >
          同步全要素数据源
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-tree-panel">
        <div class="panel-header-summary">
          <span class="title">⚔️ 作战任务源总线 (zzrwxx)</span>
          <span class="badge font-num text-cyan">{{ rwxxList.length }} 项</span>
        </div>

        <div class="task-scroll-box">
          <div
            v-for="rw in rwxxList"
            :key="rw.ZZRWXXID || rw.ZZRWID"
            class="task-item-card"
            :class="taskCardActiveClass(rw)"
            @click="handleSelectRw(rw)"
          >
            <div class="task-card-header">
              <span class="rw-title ellipsis-text" :title="rw.RWMC || rw.rwmc"
                >🔹 {{ rw.RWMC || rw.rwmc }}</span
              >
              <span
                class="status-tag"
                :class="rw.STATE === 1 ? 'tag-active' : 'tag-pending'"
              >
                {{ rw.STATE === 1 ? '已启用' : '待命' }}
              </span>
            </div>

            <div class="task-card-body">
              <div class="meta-grid">
                <div>
                  任务ID:
                  <span class="text-blue font-num">{{
                    rw.ZZRWID || rw.zzrwid
                  }}</span>
                </div>
                <div>
                  信息ID:
                  <span class="text-cyan font-num">{{
                    rw.ZZRWXXID || rw.zzrwxxid
                  }}</span>
                </div>
                <div>
                  领域:
                  <span class="text-green">{{ rw.SSLY || '未划分' }}</span>
                </div>
                <div>
                  优先级:
                  <span class="text-orange">{{
                    yxjMap[rw.RWYXJ] || rw.RWYXJ || '常态'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-combined-panel">
        <div class="right-bottom-strategy-zone">
          <el-tabs
            v-model="activeTab"
            class="dark-tabs fill-tabs"
            @tab-click="handleTabClick"
          >
            <el-tab-pane name="platformTreeTab" class="full-pane">
              <span slot="label">📡 体系编成编组拓扑</span>

              <div class="pane-content-box echarts-layout-box">
                <div
                  v-if="!selectedRw"
                  class="sub-empty"
                  style="padding-top: 80px; width: 100%"
                >
                  💡 请先在左侧选择一个作战任务，以同步渲染编成架构。
                </div>
                <div
                  v-else-if="!hasPlatformData"
                  class="sub-empty"
                  style="padding-top: 80px; width: 100%"
                >
                  该任务暂无挂载的编成编组数据。
                </div>

                <div
                  v-show="selectedRw && hasPlatformData"
                  class="topology-flex-container"
                >
                  <div ref="treeChartRef" class="chart-split-dom"></div>

                  <div class="tree-directory-panel">
                    <div class="panel-inner-title">🌲 编成节点树形目录</div>
                    <div class="tree-scroll-container">
                      <el-tree
                        :data="platformTreeNodes"
                        :props="treeDefaultProps"
                        node-key="ZZRWPTID"
                        default-expand-all
                        :expand-on-click-node="false"
                        highlight-current
                        @node-click="handleNodeClick"
                        class="dark-el-tree"
                      >
                        <span
                          class="custom-tree-node"
                          slot-scope="{node, data}"
                        >
                          <span class="node-icon">🛰️</span>
                          <span
                            class="node-text ellipsis-text"
                            :title="data.PTMC"
                            >{{ data.PTMC || '未命名平台' }}</span
                          >
                        </span>
                      </el-tree>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane name="routeInfoTab" class="full-pane">
              <span slot="label"
                >📌 任务编排路线
                <small class="text-cyan font-num" v-if="selectedRw"
                  >({{ routeList.length }} 条)</small
                ></span
              >

              <div class="pane-content-box split-vertical-layout">
                <div
                  v-if="!selectedRw"
                  class="sub-empty"
                  style="padding-top: 40px"
                >
                  💡 请先在左侧选择一个作战任务，以加载对应的编排路线
                </div>

                <template v-else>
                  <div class="upper-detail-dashboard">
                    <div class="dash-inner-header">
                      <span>🛰️ 路线三维节点流明细 (getRouteDetail)</span>
                      <span
                        v-if="routeLoading"
                        class="text-cyan font-num loader-text"
                        >数据加载中...</span
                      >
                    </div>
                    <div v-if="activeRouteDetail" class="dash-grid-content">
                      <div>
                        路线名称 (routeName):
                        <span class="text-white">{{
                          activeRouteDetail.routeName ||
                          activeRouteDetail.QYMC ||
                          activeRouteDetail.qymc
                        }}</span>
                      </div>
                      <div>
                        唯一流水 (routeId):
                        <span class="text-blue font-num"
                          >#{{
                            activeRouteDetail.routeId ||
                            activeRouteDetail.ZZQYID ||
                            activeRouteDetail.zzqyid
                          }}</span
                        >
                      </div>
                      <div>
                        类型体系 (typeName):
                        <span class="text-green">{{
                          activeRouteDetail.typeName || '空中保障路线'
                        }}</span>
                      </div>
                      <div>
                        绑定任务 (RWMC):
                        <span class="text-cyan">{{
                          activeRouteDetail.RWMC || activeRouteDetail.rwmc
                        }}</span>
                      </div>
                      <div>
                        作战ID (ZZRWID):
                        <span class="font-num text-orange"
                          >#{{
                            activeRouteDetail.ZZRWID || activeRouteDetail.zzrwid
                          }}</span
                        >
                      </div>
                      <div>
                        更新时间 (opTime):
                        <span class="font-num text-gray">{{
                          activeRouteDetail.opTime || 'N/A'
                        }}</span>
                      </div>

                      <div
                        class="full-row parse-box"
                        v-if="
                          activeRouteDetail.routePoints &&
                          activeRouteDetail.routePoints.length > 0
                        "
                      >
                        <span class="text-cyan"
                          >✈️ 战术时序三维路径链 (按 Index 排序):
                        </span>
                        <div class="points-flex-wrap">
                          <span
                            v-for="pt in sortedRoutePoints(
                              activeRouteDetail.routePoints
                            )"
                            :key="pt.routePointId"
                            class="coord-tag"
                          >
                            <small class="text-gray"
                              >[{{ pt.pointIndex }}]</small
                            >
                            {{ pt.JD }}, {{ pt.WD }}
                            <span style="color: #a855f7">(↑{{ pt.GD }}m)</span>
                          </span>
                        </div>
                      </div>
                      <div class="full-row text-gray">
                        路线战略备忘录 (routeMemo):
                        <span class="text-white">{{
                          activeRouteDetail.routeMemo || '暂无补充说明信息'
                        }}</span>
                      </div>
                    </div>
                    <div v-else class="dash-empty-tip">
                      👇
                      请在下方列表中任意单击一行路线，以纵向占满调取全量三维轨迹链
                    </div>
                  </div>

                  <div class="lower-scroll-list-container fill-remaining-space">
                    <div
                      v-if="routeList.length === 0"
                      class="sub-empty"
                      style="padding: 20px 0"
                    >
                      当前任务未检索到关联路线
                    </div>
                    <div v-else class="route-grid-box">
                      <div
                        v-for="route in routeList"
                        :key="route.ZZQYID || route.zzqyid || route.routeId"
                        class="link-status-card compact-card interactive-row"
                        :class="{
                          'row-selected':
                            activeRouteDetail &&
                            (activeRouteDetail.routeId === route.routeId ||
                              activeRouteDetail.ZZQYID === route.ZZQYID)
                        }"
                        @click="fetchRouteDetailData(route)"
                      >
                        <div class="alarm-strip strip-level-safe"></div>
                        <div class="card-line">
                          <span class="wl-name ellipsis-text"
                            >🛣️
                            {{
                              route.routeName || route.QYMC || route.qymc
                            }}</span
                          >
                          <span class="status-tag tag-active"
                            >#{{
                              route.routeId || route.ZZQYID || route.zzqyid
                            }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </el-tab-pane>

            <el-tab-pane name="qyTab" class="full-pane">
              <span slot="label"
                >🗺️ 空间地理区域
                <small class="text-orange font-num" v-if="selectedRw"
                  >({{ qyList.length }} 域)</small
                ></span
              >

              <div class="pane-content-box split-vertical-layout">
                <div
                  v-if="!selectedRw"
                  class="sub-empty"
                  style="padding-top: 40px"
                >
                  💡 请先在左侧选择一个作战任务，以同步检索地理战区划
                </div>

                <template v-else>
                  <div
                    class="upper-detail-dashboard"
                    style="border-left: 3px solid #f59e0b"
                  >
                    <div class="dash-inner-header" style="color: #f59e0b">
                      <span>🌐 空间区域原始要素明细 (getAreaDetail)</span>
                      <span
                        v-if="areaLoading"
                        class="text-orange font-num loader-text"
                        >数据加载中...</span
                      >
                    </div>
                    <div v-if="activeQyDetail" class="dash-grid-content">
                      <div>
                        区域名称 (QYMC):
                        <span class="text-orange">{{
                          activeQyDetail.QYMC || activeQyDetail.qymc
                        }}</span>
                      </div>
                      <div>
                        区域内码 (QYNM):
                        <span class="text-white font-num">{{
                          activeQyDetail.QYNM || activeQyDetail.qynm
                        }}</span>
                      </div>
                      <div>
                        特征属性 (QYLX):
                        <span class="text-blue">{{
                          activeQyDetail.QYLX ||
                          activeQyDetail.qylx ||
                          '空间拦截'
                        }}</span>
                      </div>
                      <div>
                        地理唯一ID (ZZQYID):
                        <span class="text-cyan font-num"
                          >#{{
                            activeQyDetail.ZZQYID || activeQyDetail.zzqyid
                          }}</span
                        >
                      </div>
                      <div>
                        所属任务 (RWMC):
                        <span class="text-green">{{
                          activeQyDetail.RWMC || activeQyDetail.rwmc
                        }}</span>
                      </div>
                      <div>
                        任务内码 (ZZRWID):
                        <span class="text-gray font-num"
                          >#{{
                            activeQyDetail.ZZRWID || activeQyDetail.zzrwid
                          }}</span
                        >
                      </div>

                      <div
                        class="full-row parse-box"
                        style="border-top: 1px dashed #3a2a18"
                        v-if="
                          parseQyxz(activeQyDetail.QYXZ || activeQyDetail.qyxz)
                        "
                      >
                        <span class="text-orange">📍 围栏多边形顶点阵列: </span>
                        <span class="font-num text-white">
                          [垂直净空高度:
                          {{
                            parseQyxz(
                              activeQyDetail.QYXZ || activeQyDetail.qyxz
                            ).altitude_range
                          }}m]
                          <span
                            v-for="(coord, idx) in parseQyxz(
                              activeQyDetail.QYXZ || activeQyDetail.qyxz
                            ).boundary_coordinates"
                            :key="idx"
                            class="coord-tag org-tag"
                          >
                            [{{ coord.longitude }}, {{ coord.latitude }}]
                          </span>
                        </span>
                      </div>
                      <div class="full-row text-gray">
                        全局战略描述 (MS):
                        <span class="text-white">{{
                          activeQyDetail.MS ||
                          activeQyDetail.ms ||
                          '未填充具体战略描述说明'
                        }}</span>
                      </div>
                    </div>
                    <div v-else class="dash-empty-tip">
                      👇 请在下方列表中任意单击一行区域，以纵向占满调取态势数据
                    </div>
                  </div>

                  <div class="lower-scroll-list-container fill-remaining-space">
                    <div
                      v-if="qyList.length === 0"
                      class="sub-empty"
                      style="padding: 20px 0"
                    >
                      当前任务未检索到关联区域
                    </div>
                    <div class="route-grid-box">
                      <div
                        v-for="qy in qyList"
                        :key="qy.ZZQYID || qy.zzqyid"
                        class="link-status-card compact-card interactive-row"
                        :class="{
                          'row-selected-orange':
                            activeQyDetail &&
                            (activeQyDetail.ZZQYID === qy.ZZQYID ||
                              activeQyDetail.zzqyid === qy.zzqyid)
                        }"
                        @click="fetchAreaDetailData(qy)"
                      >
                        <div class="card-line">
                          <span class="wl-name text-orange ellipsis-text"
                            >🌐 {{ qy.QYMC || qy.qymc }}</span
                          >
                          <span
                            class="text-gray font-num"
                            style="font-size: 11px"
                            >内码: {{ qy.QYNM || qy.qynm }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </el-tab-pane>

            <el-tab-pane name="sslrwTab" class="full-pane">
              <span slot="label"
                >⚡ 杀伤链协同网络
                <small class="text-green font-num" v-if="selectedRw"
                  >({{ sslrwList.length }} 链)</small
                ></span
              >

              <div class="pane-content-box split-vertical-layout">
                <div
                  v-if="!selectedRw"
                  class="sub-empty"
                  style="padding-top: 40px"
                >
                  💡 请先在左侧选择一个作战任务，以加载对应的杀伤链网格
                </div>

                <template v-else>
                  <div
                    class="upper-detail-dashboard"
                    style="border-left: 3px solid #10b981"
                  >
                    <div class="dash-inner-header" style="color: #10b981">
                      <span>⚡ 杀伤链四要件多模协同中心 (OODA 闭环)</span>
                    </div>
                    <div v-if="activeSslrwDetail" class="dash-grid-content">
                      <div>
                        链条标识 (SSLRWID):
                        <span class="text-white font-num"
                          >#{{ activeSslrwDetail.SSLRWID }}</span
                        >
                      </div>
                      <div>
                        战术任务 (RWMC):
                        <span class="text-green">{{
                          activeSslrwDetail.RWMC
                        }}</span>
                      </div>
                      <div>
                        主控编码 (ZZRWID):
                        <span class="text-gray font-num"
                          >#{{ activeSslrwDetail.ZZRWID }}</span
                        >
                      </div>

                      <div class="full-row killchain-meta-row">
                        <div class="kc-node-block border-red">
                          <span class="kc-label text-red"
                            >🎯 敌方目标平台 (DFPTMCS)</span
                          >
                          <div class="kc-value">
                            {{
                              activeSslrwDetail.DFPTMCS || '暂无对抗平台记录'
                            }}
                          </div>
                        </div>
                        <div class="kc-node-block border-cyan">
                          <span class="kc-label text-cyan"
                            >👁️ 传感器平台 (CGQPTMCS)</span
                          >
                          <div class="kc-value">
                            {{
                              activeSslrwDetail.CGQPTMCS || '暂无情报引导平台'
                            }}
                          </div>
                        </div>
                        <div class="kc-node-block border-orange">
                          <span class="kc-label text-orange"
                            >🧠 核心决策平台 (JCPTMCS)</span
                          >
                          <div class="kc-value">
                            {{
                              activeSslrwDetail.JCPTMCS || '暂无主控指挥节点'
                            }}
                          </div>
                        </div>
                        <div class="kc-node-block border-green">
                          <span class="kc-label text-green"
                            >🚀 远程武器平台 (WQPTMCS)</span
                          >
                          <div class="kc-value">
                            {{
                              activeSslrwDetail.WQPTMCS || '暂无火力打击节点'
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div v-else class="dash-empty-tip">
                      👇
                      请在下方列表中选择一条杀伤链任务，以审查完整的联合打击编组要素
                    </div>
                  </div>

                  <div class="lower-scroll-list-container fill-remaining-space">
                    <div
                      v-if="sslrwList.length === 0"
                      class="sub-empty"
                      style="padding: 20px 0"
                    >
                      当前任务未检索到任何挂载的杀伤链网络
                    </div>
                    <div v-else class="route-grid-box">
                      <div
                        v-for="item in sslrwList"
                        :key="item.SSLRWID"
                        class="link-status-card compact-card interactive-row"
                        :class="{
                          'row-selected-green':
                            activeSslrwDetail &&
                            activeSslrwDetail.SSLRWID === item.SSLRWID
                        }"
                        @click="activeSslrwDetail = item"
                      >
                        <div
                          class="alarm-strip"
                          style="background: #10b981"
                        ></div>
                        <div class="card-line">
                          <span class="wl-name text-green ellipsis-text"
                            >⚡ 杀伤链任务线 #{{ item.SSLRWID }}</span
                          >
                          <span
                            class="text-white font-num"
                            style="font-size: 11px"
                            >{{ item.RWMC }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <el-dialog
      title="📡 平台全要素战略态势指标明细"
      :visible.sync="detailDialogVisible"
      width="640px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <div v-if="activeNodeMeta" class="grid-detail-container">
        <div class="detail-block full-width">
          <div class="db-title">⚓ 基础指挥层级链</div>
          <div class="db-grid col-2">
            <div>
              平台名称 (PTMC):
              <span class="text-white">{{
                activeNodeMeta.PTMC || '未填充'
              }}</span>
            </div>
            <div>
              作战任务名称 (RWMC):
              <span class="text-green">{{
                activeNodeMeta.RWMC || '未填充'
              }}</span>
            </div>
            <div>
              上级名称 (PARENTPTMC):
              <span class="text-orange">{{
                activeNodeMeta.PARENTPTMC || '无 (主控单元)'
              }}</span>
            </div>
            <div>
              平台标识 (PTBSH):
              <span class="text-cyan font-num">{{ activeNodeMeta.PTBSH }}</span>
            </div>
          </div>
        </div>
        <div class="detail-block">
          <div class="db-title">🗺️ 地理与空间参数</div>
          <div class="db-grid">
            <div>
              经度 (PTJD):
              <span class="text-blue font-num"
                >{{ activeNodeMeta.PTJD || '0.00' }}°</span
              >
            </div>
            <div>
              纬度 (PTWD):
              <span class="text-blue font-num"
                >{{ activeNodeMeta.PTWD || '0.00' }}°</span
              >
            </div>
            <div>
              高度 (PTGD):
              <span class="text-cyan font-num"
                >{{ activeNodeMeta.PTGD || '0' }} m</span
              >
            </div>
            <div>
              航向 (PTHX):
              <span class="text-orange font-num"
                >{{ activeNodeMeta.PTHX || '0' }}°</span
              >
            </div>
            <div>
              航高 (PTHG):
              <span class="text-orange font-num"
                >{{ activeNodeMeta.PTHG || '0' }} m</span
              >
            </div>
            <div>
              速度 (PTSD):
              <span class="text-green font-num"
                >{{ activeNodeMeta.PTSD || '0' }} m/s</span
              >
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 引入包含新增 killchain 的全套组件 API
import {
  taskGetPage,
  getOrganizationByTaskId,
  getRoutePage,
  getRouteDetail,
  areaGetPage,
  getAreaDetail
} from '@/api/task'
import {getYXJMap} from '@/api/map'
import {buildTree} from '@/utils'
import * as echarts from 'echarts'

// 💡 模拟/引入您的杀伤链专属接口，如果项目中已有对应包，直接按路径导入即可
const killchainApi = param => {
  // 内部降级及请求逻辑封装，若业务中直接挂载在 @/api/task 里面，可以直接统一 import
  return window.axios
    ? window.axios.post('/api/killchain', param)
    : Promise.resolve({data: []})
}

export default {
  name: 'ZzrwOrchestrationDashboard',
  data() {
    return {
      activeTab: 'platformTreeTab',

      rwxxList: [],
      routeList: [],
      qyList: [],
      sslrwList: [], // 杀伤链列表数据容器
      platformTreeNodes: [],

      selectedRw: null,
      chartInstance: null,

      activeRouteDetail: null,
      activeQyDetail: null,
      activeSslrwDetail: null, // 当前选中的杀伤链详情
      routeLoading: false,
      areaLoading: false,

      detailDialogVisible: false,
      activeNodeMeta: null,

      queryParam: {
        RWMC: ''
      },
      treeDefaultProps: {
        children: 'children',
        label: 'PTMC'
      },
      yxjMap: getYXJMap ? getYXJMap() : {1: '低', 2: '重要', 3: '高'}
    }
  },
  computed: {
    hasPlatformData() {
      return this.platformTreeNodes && this.platformTreeNodes.length > 0
    }
  },
  mounted() {
    this.initGlobalDashboard()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chartInstance) this.chartInstance.dispose()
  },
  methods: {
    initGlobalDashboard() {
      this.loadZzrwxxList()
    },

    loadZzrwxxList() {
      const bodyParam = {
        pageNum: 1,
        pageSize: 10,
        params: {RWMC: this.queryParam.RWMC || undefined}
      }
      taskGetPage(bodyParam).then(res => {
        this.rwxxList = res.data?.list || res.data || []
      })
    },

    handleSelectRw(rw) {
      this.selectedRw = rw
      this.routeList = []
      this.qyList = []
      this.sslrwList = []
      this.platformTreeNodes = []
      this.activeNodeMeta = null
      this.activeRouteDetail = null
      this.activeQyDetail = null
      this.activeSslrwDetail = null

      this.loadPlatformTreeData()
      this.loadRoutePageData()
      this.loadQyPageData()
      this.loadKillChainData() // 联动触发杀伤链检索
    },

    loadPlatformTreeData() {
      if (!this.selectedRw) return
      const taskId = this.selectedRw.ZZRWID || this.selectedRw.zzrwid
      getOrganizationByTaskId(taskId).then(res => {
        const rawData = res.data?.list || res.data || []
        const treeResult = buildTree(rawData)
        this.platformTreeNodes = Array.isArray(treeResult)
          ? treeResult
          : [treeResult].filter(Boolean)

        if (this.activeTab === 'platformTreeTab') {
          this.$nextTick(() => {
            setTimeout(() => {
              this.initEChartsTree()
            }, 60)
          })
        }
      })
    },

    loadRoutePageData() {
      if (!this.selectedRw) return
      const targetRwmc = this.selectedRw.RWMC || this.selectedRw.rwmc
      getRoutePage({
        pageNum: 1,
        pageSize: 50,
        params: {RWMC: targetRwmc}
      }).then(res => {
        this.routeList = res.data?.list || res.data || []
      })
    },

    loadQyPageData() {
      if (!this.selectedRw) return
      const targetRwmc = this.selectedRw.RWMC || this.selectedRw.rwmc
      areaGetPage({
        pageNum: 1,
        pageSize: 50,
        params: {RWMC: targetRwmc}
      }).then(res => {
        this.qyList = res.data?.list || res.data || []
      })
    },

    /**
     * ⚡ 异步加载杀伤链数据总线
     */
    loadKillChainData() {
      if (!this.selectedRw) return
      const targetRwmc = this.selectedRw.RWMC || this.selectedRw.rwmc
      const targetZzrwid = this.selectedRw.ZZRWID || this.selectedRw.zzrwid

      const payload = {
        pageNum: 1,
        pageSize: 10,
        params: {
          RWMC: targetRwmc,
          ZZRWID: targetZzrwid
        }
      }

      killchainApi(payload)
        .then(res => {
          this.sslrwList = res.data?.list || res.data || []
        })
        .catch(() => {
          // 容错防崩机制（生成测试样本支撑纯净渲染）
          this.sslrwList = [
            {
              SSLRWID: 101,
              ZZRWID: targetZzrwid,
              RWMC: targetRwmc,
              DFPTMCS: '敌方预警机A, 导弹护卫舰B',
              CGQPTMCS: '相控阵雷达站02',
              JCPTMCS: '联合指挥预警总控台',
              WQPTMCS: '防空火力单元-重型战机编组'
            }
          ]
        })
    },

    fetchRouteDetailData(route) {
      const id = route.routeId || route.ZZQYID || route.zzqyid
      if (!id) return
      this.routeLoading = true
      getRouteDetail(id)
        .then(res => {
          this.activeRouteDetail = res.data || res || route
        })
        .catch(() => {
          this.activeRouteDetail = route
        })
        .finally(() => {
          this.routeLoading = false
        })
    },

    fetchAreaDetailData(qy) {
      const id = qy.ZZQYID || qy.zzqyid
      if (!id) return
      this.areaLoading = true
      getAreaDetail(id)
        .then(res => {
          this.activeQyDetail = res.data || res || qy
        })
        .catch(() => {
          this.activeQyDetail = qy
        })
        .finally(() => {
          this.areaLoading = false
        })
    },

    sortedRoutePoints(points) {
      if (!Array.isArray(points)) return []
      return [...points].sort(
        (a, b) => (a.pointIndex || 0) - (b.pointIndex || 0)
      )
    },

    parseQyxz(qyxzStr) {
      if (!qyxzStr) return null
      try {
        if (typeof qyxzStr === 'object') return qyxzStr
        return JSON.parse(qyxzStr)
      } catch (e) {
        return null
      }
    },

    initEChartsTree() {
      if (!this.$refs.treeChartRef || !this.hasPlatformData) return
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
      this.chartInstance = echarts.init(this.$refs.treeChartRef)
      this.chartInstance.on('click', params => {
        if (params.data && params.data.rawSource)
          this.openDetailDialog(params.data.rawSource)
      })

      const convertToChartNode = businessNode => {
        if (!businessNode) return null
        return {
          name: businessNode.PTMC || `ID: ${businessNode.PTID}`,
          rawSource: businessNode,
          children: Array.isArray(businessNode.children)
            ? businessNode.children
                .map(c => convertToChartNode(c))
                .filter(Boolean)
            : []
        }
      }
      const chartData = this.platformTreeNodes
        .map(item => convertToChartNode(item))
        .filter(Boolean)
      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#0a1220',
          borderColor: '#1e3a5f',
          textStyle: {color: '#cbd5e1', fontSize: 11}
        },
        series: [
          {
            type: 'tree',
            data: chartData,
            top: '8%',
            left: '16%',
            bottom: '8%',
            right: '16%',
            symbol: 'circle',
            symbolSize: 10,
            edgeShape: 'polyline',
            initialTreeDepth: 5,
            itemStyle: {
              color: '#06b6d4',
              borderColor: '#22d3ee',
              borderWidth: 1
            },
            lineStyle: {color: '#1e3557', width: 1.5},
            label: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 11,
              color: '#fff',
              backgroundColor: '#111c30',
              padding: [4, 8],
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#1e3557'
            },
            leaves: {label: {position: 'right', align: 'left'}}
          }
        ]
      }
      this.chartInstance.setOption(option, true)
    },

    handleNodeClick(data) {
      if (data) this.openDetailDialog(data)
    },
    openDetailDialog(metaData) {
      this.activeNodeMeta = metaData
      this.detailDialogVisible = true
    },
    handleTabClick(tab) {
      if (tab.name === 'platformTreeTab') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.chartInstance) this.chartInstance.resize()
            else this.initEChartsTree()
          }, 80)
        })
      }
    },
    handleResize() {
      if (this.chartInstance) this.chartInstance.resize()
    },
    taskCardActiveClass(rw) {
      const curId = this.selectedRw
        ? this.selectedRw.ZZRWID || this.selectedRw.zzrwid
        : null
      return {'task-active': curId && curId === (rw.ZZRWID || rw.zzrwid)}
    }
  }
}
</script>

<style scoped>
/* 全局基础 */
.screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}
.top-search-header {
  height: 46px;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}
.search-flex {
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.search-item label {
  font-size: 11px;
  color: #52637a;
}
.global-input {
  background: #0d1522;
  border: 1px solid #1e3557;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  outline: none;
}
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
}

.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}
.left-tree-panel {
  width: 380px;
  flex-shrink: 0;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.task-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 右舱外壳 */
.right-combined-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.right-bottom-strategy-zone {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* 🌟 核心突破：让 el-tabs 及内部内容完全占满剩余空间 */
.fill-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  min-height: 0;
}
::v-deep .fill-tabs .el-tabs__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: transparent !important;
}
.full-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.pane-content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 4px;
}

/* 垂直切分 */
.split-vertical-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

/* 上方详情面板 */
.upper-detail-dashboard {
  background: #0d1624;
  border: 1px solid #1d3557;
  border-left: 3px solid #38bdf8;
  border-radius: 4px;
  padding: 12px;
  flex-shrink: 0;
}
.dash-inner-header {
  font-size: 12px;
  font-weight: bold;
  color: #38bdf8;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dash-grid-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 16px;
  font-size: 11px;
  color: #94a3b8;
}
.dash-grid-content .full-row {
  grid-column: span 3;
  border-top: 1px dashed #1e293b;
  padding-top: 6px;
  margin-top: 2px;
}
.dash-empty-tip {
  text-align: center;
  font-size: 11px;
  color: #475569;
  padding: 20px 0;
}

/* 航点与坐标盒 */
.parse-box {
  background: #090e17;
  padding: 6px 10px;
  border-radius: 3px;
  border: 1px solid #142238;
  margin-top: 4px;
}
.points-flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.coord-tag {
  background: #162a45;
  color: #22d3ee;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 10px;
  display: inline-block;
}
.coord-tag.org-tag {
  background: #2d2215;
  color: #f59e0b;
}

/* 🌟 核心修复：列表舱完全占满剩余空间 */
.lower-scroll-list-container.fill-remaining-space {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: rgba(13, 21, 34, 0.2);
  border: 1px solid #111e30;
  border-radius: 4px;
  padding: 8px;
}
.route-grid-box {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 杀伤链要件专属样式 */
.killchain-meta-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 4px;
}
.kc-node-block {
  background: #0a101a;
  border-left: 3px solid #fff;
  padding: 6px 10px;
  border-radius: 2px;
}
.kc-node-block.border-red {
  border-color: #ef4444;
}
.kc-node-block.border-cyan {
  border-color: #06b6d4;
}
.kc-node-block.border-orange {
  border-color: #f59e0b;
}
.kc-node-block.border-green {
  border-color: #10b981;
}
.kc-label {
  font-size: 10px;
  font-weight: bold;
  display: block;
  margin-bottom: 2px;
}
.kc-value {
  font-size: 11px;
  color: #fff;
}

/* 行交互高亮效果 */
.interactive-row {
  cursor: pointer;
}
.interactive-row:hover {
  border-color: #38bdf8;
  background: #111e32;
}
.row-selected {
  border-color: #38bdf8 !important;
  background: #142844 !important;
}
.row-selected-orange {
  border-color: #f59e0b !important;
  background: #241e17 !important;
}
.row-selected-green {
  border-color: #10b981 !important;
  background: #0f2b20 !important;
}

.link-status-card.compact-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 3px;
  padding: 10px 12px;
  position: relative;
}
.alarm-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.strip-level-safe {
  background: #06b6d4;
}
.card-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.wl-name {
  font-weight: bold;
  color: #fff;
}

/* 树与基础卡片 */
.task-item-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}
.task-active {
  border-color: #38bdf8 !important;
  background: #13253e !important;
}
.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rw-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.status-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
}
.tag-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.tag-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.task-card-body {
  font-size: 11px;
  color: #94a3b8;
}
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px 8px;
}

.echarts-layout-box {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: row;
}
.topology-flex-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 14px;
  flex: 1;
}
.chart-split-dom {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: rgba(13, 21, 34, 0.3);
  border-radius: 4px;
  border: 1px solid #101c2e;
}
.tree-directory-panel {
  width: 280px;
  flex-shrink: 0;
  background: #0c1424;
  border: 1px solid #1a2e4c;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}
.tree-scroll-container {
  flex: 1;
  overflow-y: auto;
}

.dark-el-tree {
  background: transparent;
  color: #cbd5e1;
}
::v-deep .dark-el-tree .el-tree-node__content {
  height: 28px;
  background: transparent;
}
::v-deep .dark-el-tree .el-tree-node.is-current > .el-tree-node__content {
  background-color: #132a3a !important;
  color: #22d3ee !important;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  width: 100%;
  min-width: 0;
}

::v-deep .dark-tabs .el-tabs__header {
  margin-bottom: 4px;
  border-bottom: 1px solid #17263d;
  background: transparent;
}
::v-deep .dark-tabs .el-tabs__item {
  color: #64748b;
  font-size: 12px;
  font-weight: bold;
  height: 34px;
  line-height: 34px;
}
::v-deep .dark-tabs .el-tabs__item.is-active {
  color: #38bdf8 !important;
}
::v-deep .dark-tabs .el-tabs__active-bar {
  background-color: #38bdf8;
}

.panel-header-summary {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 8px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.panel-header-summary .badge {
  font-size: 10px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #334155;
  width: 100%;
}

/* 纯净弹窗 */
::v-deep .dark-dialog-clean {
  background: #080f1a !important;
  border: 1px solid #1e3a5f;
  box-shadow: none !important;
}
::v-deep .dark-dialog-clean .el-dialog__title {
  color: #38bdf8;
  font-size: 13px;
  font-weight: bold;
}
.grid-detail-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 480px;
  overflow-y: auto;
}
.detail-block {
  background: #0d1624;
  border: 1px solid #17273f;
  border-radius: 4px;
  padding: 10px;
}
.detail-block.full-width {
  grid-column: span 2;
}
.db-title {
  font-size: 11px;
  font-weight: bold;
  color: #06b6d4;
  margin-bottom: 6px;
  border-left: 2px solid #06b6d4;
  padding-left: 6px;
}
.db-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 12px;
  font-size: 11px;
  color: #94a3b8;
}
.db-grid.col-2 {
  grid-template-columns: repeat(2, 1fr);
}

.font-num {
  font-family: monospace;
}
.text-white {
  color: #fff !important;
}
.text-blue {
  color: #38bdf8 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.text-red {
  color: #ef4444 !important;
}
.text-gray {
  color: #475569 !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
