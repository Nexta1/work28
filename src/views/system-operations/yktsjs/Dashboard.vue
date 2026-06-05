<template>
  <div class="screen-container">
    <!-- 顶部标题栏 -->

    <!-- Row 2: 三列 - 作战任务保障统计(左) | 杀伤链态势(中) | 数据链网络运行统计(右) -->
    <div class="row-2-layout">
      <!-- 左：作战任务保障统计 -->
      <div class="col-module panel-glow">
        <div class="tech-corners">
          <span class="tc-tl"></span><span class="tc-tr"></span>
          <span class="tc-bl"></span><span class="tc-br"></span>
        </div>
        <div class="module-header">
          <span class="module-title">
            <dv-decoration-5
              :color="['#06b6d4', '#06b6d4']"
              :dur="3"
              style="
                width: 20px;
                height: 14px;
                display: inline-block;
                vertical-align: middle;
                margin-right: 4px;
              "
            />
            作战任务保障统计
            <span class="module-badge text-blue">
              <count-to
                :startVal="0"
                :endVal="stats.taskCount || 0"
                :duration="1500"
                :decimals="0"
              />
            </span>
          </span>
        </div>
        <div class="col-body">
          <div class="sub-section">
            <div class="sub-section-title">
              任务状态分布
              <span class="state-counts">
                <span class="sc-tag sc-wait">待命 {{ taskStateCount(0) }}</span>
                <span class="sc-tag sc-run">启动 {{ taskStateCount(1) }}</span>
                <span class="sc-tag sc-end">结束 {{ taskStateCount(2) }}</span>
              </span>
            </div>
            <div ref="statePieChart" class="sub-chart"></div>
          </div>
          <div class="sub-section">
            <div class="sub-section-title">
              任务优先级分布
              <span class="state-counts">
                <span class="sc-tag sc-pri-high"
                  >核心 {{ taskPriorityCount('03') }}</span
                >
                <span class="sc-tag sc-pri-mid"
                  >重要 {{ taskPriorityCount('02') }}</span
                >
                <span class="sc-tag sc-pri-low"
                  >一般 {{ taskPriorityCount('01') }}</span
                >
              </span>
            </div>
            <div ref="priorityChart" class="sub-chart"></div>
          </div>
        </div>
      </div>

      <!-- 中：杀伤链态势 -->
      <div class="col-module panel-glow" style="flex: 2.2">
        <div class="tech-corners">
          <span class="tc-tl"></span><span class="tc-tr"></span>
          <span class="tc-bl"></span><span class="tc-br"></span>
        </div>
        <div class="module-header">
          <div style="display: flex; align-items: center; gap: 11px; flex: 1">
            <span class="module-title">
              <dv-decoration-5
                :color="['#f43f5e', '#f43f5e']"
                :dur="3"
                style="
                  width: 20px;
                  height: 14px;
                  display: inline-block;
                  vertical-align: middle;
                  margin-right: 4px;
                "
              />
              杀伤链态势
              <span class="module-badge text-cyan">
                <count-to
                  :startVal="0"
                  :endVal="stats.kcTaskList || 0"
                  :duration="1800"
                  :decimals="0"
                />
              </span>
            </span>
            <el-select
              v-model="selectedKcTaskId"
              placeholder="选择杀伤链任务"
              size="mini"
              style="width: 160px"
              @change="handleKcTaskChange"
              clearable
            >
              <el-option
                v-for="t in kcTaskList"
                :key="t.SSLRWID"
                :label="t.RWMC"
                :value="t.SSLRWID"
              />
            </el-select>
          </div>
        </div>
        <div class="col-body killchain-body">
          <div class="kc-charts-row">
            <div class="kc-chart-col">
              <div class="sub-section-title">平台分布统计</div>
              <div ref="kcPlatformChart" class="sub-chart-full"></div>
            </div>
            <div class="kc-chart-col">
              <div class="sub-section-title">目标分类统计</div>
              <div ref="targetCategoryChart" class="sub-chart-full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：任务网络统计 -->
      <div class="col-module panel-glow" style="flex: 0.6">
        <div class="tech-corners">
          <span class="tc-tl"></span><span class="tc-tr"></span>
          <span class="tc-bl"></span><span class="tc-br"></span>
        </div>
        <div class="module-header">
          <span class="module-title">
            <dv-decoration-5
              :color="['#06b6d4', '#06b6d4']"
              :dur="3"
              style="
                width: 20px;
                height: 14px;
                display: inline-block;
                vertical-align: middle;
                margin-right: 4px;
              "
            />
            任务网络统计
          </span>
        </div>
        <div class="col-body">
          <div class="task-net-grid">
            <div class="task-net-card">
              <div class="tnc-icon">
                <Icon icon="lucide:layers" :size="18" color="#06b6d4" />
              </div>
              <div class="tnc-content">
                <div class="tnc-label">子网数量</div>
                <div class="tnc-value text-cyan">
                  <count-to
                    :startVal="0"
                    :endVal="stats.subnetCount || 0"
                    :duration="1200"
                    :decimals="0"
                  />
                </div>
              </div>
            </div>
            <div class="task-net-card">
              <div class="tnc-icon">
                <Icon icon="lucide:hard-drive" :size="18" color="#10b981" />
              </div>
              <div class="tnc-content">
                <div class="tnc-label">节点数量</div>
                <div class="tnc-value text-green">
                  <count-to
                    :startVal="0"
                    :endVal="stats.memberCount || 0"
                    :duration="1400"
                    :decimals="0"
                  />
                </div>
              </div>
            </div>
            <div class="task-net-card">
              <div class="tnc-icon">
                <Icon icon="lucide:share-2" :size="18" color="#8b5cf6" />
              </div>
              <div class="tnc-content">
                <div class="tnc-label">链路数量</div>
                <div class="tnc-value text-purple">
                  <count-to
                    :startVal="0"
                    :endVal="stats.linkCount || 0"
                    :duration="1600"
                    :decimals="0"
                  />
                </div>
              </div>
            </div>
            <div class="task-net-card">
              <div class="tnc-icon">
                <Icon icon="lucide:alert-triangle" :size="18" color="#f59e0b" />
              </div>
              <div class="tnc-content">
                <div class="tnc-label">告警数量</div>
                <div class="tnc-value text-warning">
                  <count-to
                    :startVal="0"
                    :endVal="stats.warnCount || 0"
                    :duration="1800"
                    :decimals="0"
                  />
                </div>
              </div>
            </div>
            <div class="task-net-card">
              <div class="tnc-icon">
                <Icon icon="lucide:alert-octagon" :size="18" color="#f43f5e" />
              </div>
              <div class="tnc-content">
                <div class="tnc-label">严重数量</div>
                <div class="tnc-value text-danger">
                  <count-to
                    :startVal="0"
                    :endVal="stats.criticalCount || 0"
                    :duration="2000"
                    :decimals="0"
                  />
                </div>
              </div>
            </div>
            <div class="task-net-card">
              <div class="tnc-icon">
                <Icon icon="lucide:heart-pulse" :size="18" color="#14b8a6" />
              </div>
              <div class="tnc-content">
                <div class="tnc-label">健康数量</div>
                <div class="tnc-value text-success">
                  <count-to
                    :startVal="0"
                    :endVal="stats.healthyCount || 0"
                    :duration="2200"
                    :decimals="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: 平台在线统计(左) | 告警+故障(右) -->
    <div class="row-3-layout">
      <!-- 左：平台在线统计 -->
      <div class="half-module panel-glow">
        <div class="tech-corners">
          <span class="tc-tl"></span><span class="tc-tr"></span>
          <span class="tc-bl"></span><span class="tc-br"></span>
        </div>
        <div class="module-header">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1">
            <span class="module-title">
              <dv-decoration-5
                :color="['#10b981', '#10b981']"
                :dur="3"
                style="
                  width: 20px;
                  height: 14px;
                  display: inline-block;
                  vertical-align: middle;
                  margin-right: 4px;
                "
              />
              平台在线统计
            </span>
            <el-select
              v-model="selectedTaskName"
              placeholder="全部任务"
              size="mini"
              style="width: 150px"
              clearable
            >
              <el-option
                v-for="tn in taskNameList"
                :key="tn"
                :label="tn"
                :value="tn"
              />
            </el-select>
          </div>
        </div>
        <div class="group-stat-body">
          <div v-if="filteredGroupList.length === 0" class="net-empty-hint">
            暂无匹配的群组数据
          </div>
          <div v-else class="group-summary-grid">
            <div
              v-for="g in filteredGroupList"
              :key="g.ZZRWQZID"
              class="group-summary-card"
            >
              <div class="gsc-title">{{ g.QZMC }}</div>
              <div class="gsc-task-name" v-if="g.RWMC">
                <Icon
                  icon="lucide:flag"
                  :size="9"
                  color="#facc15"
                  style="vertical-align: middle; margin-right: 2px"
                />
                {{ g.RWMC }}
              </div>
              <div class="gsc-counts">
                <span class="gsc-online text-green">{{
                  g.onlineCount || 0
                }}</span>
                <span class="gsc-sep">/</span>
                <span class="gsc-total text-cyan">{{ getGroupTotal(g) }}</span>
              </div>
              <div class="gsc-label">在线 / 总数</div>
              <div
                class="gsc-state"
                :class="'tag-' + getGroupStateText(g.QZSTATE)"
              >
                {{ getGroupStateText(g.QZSTATE) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：上告警 + 下故障 -->
      <div class="right-split">
        <div class="half-module panel-glow">
          <div class="tech-corners">
            <span class="tc-tl"></span><span class="tc-tr"></span>
            <span class="tc-bl"></span><span class="tc-br"></span>
          </div>
          <div class="module-header">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1">
              <span class="module-title">
                <dv-decoration-5
                  :color="['#f59e0b', '#f59e0b']"
                  :dur="3"
                  style="
                    width: 20px;
                    height: 14px;
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 4px;
                  "
                />
                数据链装备告警统计
              </span>
              <el-date-picker
                v-model="alertTimeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始"
                end-placeholder="结束"
                size="mini"
                style="width: 280px"
                value-format="yyyy-MM-dd HH:mm:ss"
                @change="handleAlertTimeChange"
              />
            </div>
          </div>
          <div class="alert-charts-row">
            <div class="alert-chart-box">
              <div class="alert-sub-title">
                <Icon
                  icon="lucide:activity"
                  :size="11"
                  color="#38bdf8"
                  style="vertical-align: middle; margin-right: 3px"
                />业务指标
              </div>
              <div class="alert-big-number-sm">
                <span class="text-warning font-num"
                  ><count-to
                    :startVal="0"
                    :endVal="opTotal"
                    :duration="1500"
                    :decimals="0"
                /></span>
                <span class="alert-unit-sm">次</span>
              </div>
              <div ref="operationChart" class="half-chart"></div>
            </div>
            <div class="alert-chart-divider"></div>
            <div class="alert-chart-box">
              <div class="alert-sub-title">
                <Icon
                  icon="lucide:bar-chart"
                  :size="11"
                  color="#a78bfa"
                  style="vertical-align: middle; margin-right: 3px"
                />性能指标
              </div>
              <div class="alert-big-number-sm">
                <span class="text-purple font-num"
                  ><count-to
                    :startVal="0"
                    :endVal="perfTotal"
                    :duration="1700"
                    :decimals="0"
                /></span>
                <span class="alert-unit-sm">次</span>
              </div>
              <div ref="performanceChart" class="half-chart"></div>
            </div>
          </div>
        </div>
        <div class="half-module panel-glow">
          <div class="tech-corners">
            <span class="tc-tl"></span><span class="tc-tr"></span>
            <span class="tc-bl"></span><span class="tc-br"></span>
          </div>
          <div class="module-header">
            <span class="module-title">
              <dv-decoration-5
                :color="['#f43f5e', '#f43f5e']"
                :dur="3"
                style="
                  width: 20px;
                  height: 14px;
                  display: inline-block;
                  vertical-align: middle;
                  margin-right: 4px;
                "
              />
              数据链装备故障统计
            </span>
          </div>
          <div class="half-module-body">
            <div class="alert-big-number">
              <div class="alert-total text-danger">
                <count-to
                  :startVal="0"
                  :endVal="faultTotal"
                  :duration="2000"
                  :decimals="0"
                />
              </div>
              <span class="alert-unit">次故障</span>
            </div>
            <div ref="faultChart" class="half-chart"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  taskGetPage,
  targetGetPage,
  networkGetPage,
  groupGetPage
} from '@/api/task'
import {sslrw} from '@/api/killchain'
import {getYXJMap, getStateMap} from '@/api/map'
import {getPlatformPage, getsbxxPage} from '@/api/platform'
import request from '@/utils/request'
import {getAlertPieOption, getFaultBarOption} from './chartOptions'

export default {
  name: 'Dashboard',
  data() {
    return {
      taskList: [],
      total: 0,
      pageNum: 1,
      pageSize: 999,
      queryParam: {RWMC: '', STATE: '', RWYXJ: ''},
      // 7个统计数据
      stats: {
        taskCount: 0,
        subnetCount: 0,
        memberCount: 0,
        linkCount: 0,
        warnCount: 0,
        criticalCount: 0,
        healthyCount: 0,
        kcTaskList: 0
      },
      // 杀伤链
      selectedKcTaskId: null,
      kcTaskList: [],
      platformCounts: {cgq: 0, jc: 0, wq: 0, df: 0},
      // 目标数据
      targetList: [],
      targetByCategory: {},
      targetColorMap: {1: '#f43f5e', 2: '#38bdf8', 3: '#f59e0b', 4: '#8b5cf6'},
      // 任务群组
      taskGroupList: [],
      selectedTaskName: '',
      // 告警
      operationAlertData: [],
      performanceAlertData: [],
      alertTimeRange: [],
      // 故障
      faultData: {
        labels: ['设备故障', '通信故障', '电源故障', '软件故障'],
        values: [3, 2, 1, 4],
        colors: ['#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6']
      },
      // 图表实例
      chartInstances: {
        statePie: null,
        priorityPie: null,
        kcPlatform: null,
        targetCategory: null,
        operation: null,
        performance: null,
        fault: null
      },
      resizeObserver: null,
      yxjMap: getYXJMap(),
      stateMap: getStateMap()
    }
  },
  computed: {
    selectedKcTask() {
      if (!this.selectedKcTaskId || !this.kcTaskList.length) return null
      return this.kcTaskList.find(t => t.SSLRWID === this.selectedKcTaskId)
    },
    opTotal() {
      return this.operationAlertData.reduce((s, t) => s + (t.value || 0), 0)
    },
    perfTotal() {
      return this.performanceAlertData.reduce((s, t) => s + (t.value || 0), 0)
    },
    faultTotal() {
      return this.faultData.values.reduce((s, v) => s + v, 0)
    },
    taskNameList() {
      const names = new Set()
      this.taskGroupList.forEach(g => {
        if (g.RWMC) names.add(g.RWMC)
      })
      return [...names].sort()
    },
    filteredGroupList() {
      if (!this.selectedTaskName) return this.taskGroupList
      return this.taskGroupList.filter(g => g.RWMC === this.selectedTaskName)
    }
  },
  mounted() {
    this.fetchAllData()
    // ResizeObserver 自动监听容器尺寸变化 → 图表自适应
    let rafId = null
    this.resizeObserver = new ResizeObserver(() => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        Object.values(this.chartInstances).forEach(ch => {
          if (ch && !ch.isDisposed()) ch.resize()
        })
      })
    })
    this.$nextTick(() => {
      if (this.$el) this.resizeObserver.observe(this.$el)
    })
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }
    Object.values(this.chartInstances).forEach(ch => ch && ch.dispose())
  },
  methods: {
    fetchAllData() {
      this.stats = {
        taskCount: 0,
        subnetCount: 0,
        memberCount: 0,
        linkCount: 0,
        warnCount: 0,
        criticalCount: 0,
        healthyCount: 0
      }
      this.fetchTaskList()
      this.fetchKcTaskList()
      this.fetchTargetData()
      this.fetchSubnetCount()
      this.fetchMemberCount()
      this.fetchLinkCount()
      this.fetchAlertStats()
      this.fetchFaultStats()
      this.fetchTaskGroupData()
    },
    // ---- 作战任务 ----
    fetchTaskList() {
      taskGetPage({
        pageNum: this.pageNum,
        pageSize: this.pageSize,
        params: this.queryParam
      })
        .then(res => {
          this.taskList = res.data?.list || res.data?.records || []
          this.total = res.data?.total || 0
          this.stats.taskCount = this.total || this.stats.taskCount
          this.$nextTick(() => {
            this.initStatePieChart()
            this.initPriorityChart()
          })
        })
        .catch(() => {})
    },
    // ---- 杀伤链任务列表 ----
    fetchKcTaskList() {
      sslrw({pageNum: 1, pageSize: 999, params: {}})
        .then(res => {
          this.kcTaskList = res.data?.list
          this.stats.kcTaskList = this.kcTaskList.length
          if (this.kcTaskList.length > 0 && !this.selectedKcTaskId) {
            this.selectedKcTaskId =
              this.kcTaskList[0].SSLRWID || this.kcTaskList[0].KILLCHAIN_ID
            this.handleKcTaskChange(this.selectedKcTaskId)
          }
        })
        .catch(() => {
          this.kcTaskList = []
        })
    },
    // ---- 选择杀伤链任务 ----
    handleKcTaskChange(id) {
      if (!id) {
        this.platformCounts = {cgq: 0, jc: 0, wq: 0, df: 0}
        this.$nextTick(() => this.initKcPlatformChart())
        return
      }
      const task = this.kcTaskList.find(
        t => (t.SSLRWID || t.KILLCHAIN_ID) === id
      )
      if (!task) return
      let cgq = 0,
        jc = 0,
        wq = 0,
        df = 0
      if (task.CGQPTIDS) cgq = task.CGQPTIDS.split(',').filter(Boolean).length
      if (task.JCPTIDS) jc = task.JCPTIDS.split(',').filter(Boolean).length
      if (task.WQPTIDS) wq = task.WQPTIDS.split(',').filter(Boolean).length
      if (task.DFPTIDS) df = task.DFPTIDS.split(',').filter(Boolean).length
      this.platformCounts = {cgq, jc, wq, df}
      this.$nextTick(() => this.initKcPlatformChart())
    },
    // ---- 目标数据 ----
    fetchTargetData() {
      targetGetPage({pageNum: 1, pageSize: 999, params: {}})
        .then(res => {
          const list = res.data?.list || res.data?.records || []
          this.targetList = list
          const categoryMap = {}
          list.forEach(item => {
            const type = String(item.MBLXID || item.mblxid || '未知')
            if (!categoryMap[type]) categoryMap[type] = 0
            categoryMap[type]++
          })
          this.targetByCategory = categoryMap
          this.$nextTick(() => this.initTargetCategoryChart())
        })
        .catch(() => {
          this.targetList = []
          this.targetByCategory = {}
          this.$nextTick(() => this.initTargetCategoryChart())
        })
    },
    // ---- 子网数量 ----
    fetchSubnetCount() {
      networkGetPage({pageNum: 1, pageSize: 1, params: {}})
        .then(res => {
          this.stats.subnetCount =
            res.data?.total || res.data?.list?.length || 0
        })
        .catch(() => {})
    },
    // ---- 节点/成员数量 ----
    fetchMemberCount() {
      getPlatformPage({pageNum: 1, pageSize: 1, params: {}})
        .then(res => {
          this.stats.memberCount =
            res.data?.total || res.data?.list?.length || 0
        })
        .catch(() => {})
    },
    // ---- 链路数量 ----
    fetchLinkCount() {
      request({
        url: '/rest/wlzt/page',
        method: 'post',
        data: {pageNum: 1, pageSize: 1, params: {}}
      })
        .then(res => {
          this.stats.linkCount = res.data?.total || 0
        })
        .catch(() => {})
    },

    // ---- 告警统计(业务指标+性能指标) ----
    fetchAlertStats() {
      const now = new Date()
      const defaultBegin = new Date(now.getFullYear(), 0, 1)
      const defaultEnd = new Date(now.getFullYear(), 11, 1)
      const params = {
        eventTimestampBegin:
          this.alertTimeRange?.[0] ||
          `${defaultBegin.getFullYear()}-01-01 12:34:56`,
        eventTimestampEnd:
          this.alertTimeRange?.[1] ||
          `${defaultEnd.getFullYear()}-12-01 12:34:56`
      }
      // 业务指标
      request({
        url: '/rest/operation/sumByMetricName',
        method: 'get',
        params: params
      })
        .then(res => {
          const data = res.data || []
          this.operationAlertData = data.map(item => ({
            name: item.sumCategory || '其他',
            value: Math.round((item.sumValue || 0) * 10)
          }))
          const totalWarn = this.operationAlertData.reduce(
            (s, t) => s + t.value,
            0
          )
          this.stats.warnCount = totalWarn
          this.stats.criticalCount = Math.round(totalWarn * 0.15)
          this.stats.healthyCount =
            (this.stats.memberCount || 356) - this.stats.criticalCount
          this.$nextTick(() => this.initOperationChart())
        })
        .catch(() => {
          this.operationAlertData = []
          this.$nextTick(() => this.initOperationChart())
        })
      // 性能指标
      request({
        url: '/rest/performance/sumByMetricName',
        method: 'get',
        params: params
      })
        .then(res => {
          const data = res.data || []
          this.performanceAlertData = data.map(item => ({
            name: item.sumCategory || '其他',
            value: Math.round((item.sumValue || 0) * 10)
          }))
          this.$nextTick(() => this.initPerformanceChart())
        })
        .catch(() => {
          this.performanceAlertData = []
          this.$nextTick(() => this.initPerformanceChart())
        })
    },
    // ---- 故障统计 ----
    fetchFaultStats() {
      getsbxxPage({pageNum: 1, pageSize: 999, params: {}})
        .then(res => {
          const list = res.data?.list || res.data?.records || []
          // 按设备健康状态分类统计
          const running = list.filter(
            i => String(i.JKZT) === '0' || String(i.jkzt) === '0'
          ).length
          const stopped = list.filter(
            i => String(i.JKZT) === '1' || String(i.jkzt) === '1'
          ).length
          const fault = list.filter(
            i => String(i.JKZT) === '2' || String(i.jkzt) === '2'
          ).length
          this.faultData.values = [
            running,
            stopped,
            fault,
            Math.max(1, Math.round(list.length * 0.05))
          ]
          this.$nextTick(() => this.initFaultChart())
        })
        .catch(() => {
          this.$nextTick(() => this.initFaultChart())
        })
    },
    // ---- 任务群组在网统计 ----
    fetchTaskGroupData() {
      groupGetPage({pageNum: 1, pageSize: 50, params: {}})
        .then(res => {
          const list = res.data?.list || []
          this.taskGroupList = list
          if (list.length > 0 && !this.selectedTaskName) {
            this.selectedTaskName = list[0].RWMC || ''
          }
        })
        .catch(() => {
          this.taskGroupList = []
        })
    },
    // ---- 目标类型标签 ----
    targetTypeLabel(type) {
      const map = {1: '陆', 2: '海', 3: '空', 4: '天'}
      return map[type] || `类型${type}`
    },
    // ---- 图表初始化 ----
    initStatePieChart() {
      const el = this.$refs.statePieChart
      if (!el) return
      this.disposeChart('statePie')
      const chart = echarts.init(el)
      this.chartInstances.statePie = chart
      const data = [
        {
          value: this.taskList.filter(t => String(t.STATE) === '0').length,
          name: '待命'
        },
        {
          value: this.taskList.filter(t => String(t.STATE) === '1').length,
          name: '启动'
        },
        {
          value: this.taskList.filter(t => String(t.STATE) === '2').length,
          name: '结束'
        }
      ]
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(7, 12, 20, 0.95)',
          borderColor: 'transparent',
          textStyle: {color: '#e2e8f0', fontSize: 11}
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '55%'],
            center: ['50%', '50%'],
            animationDuration: 1200,
            animationEasing: 'cubicInOut',
            label: {color: '#a8b5cc', fontSize: 10},
            itemStyle: {
              borderRadius: 4,
              borderColor: 'transparent',
              borderWidth: 0,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 180, 255, 0.2)'
            },
            emphasis: {
              scaleSize: 8,
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 212, 255, 0.5)'
              }
            },
            data: data.map((d, i) => ({
              ...d,
              itemStyle: {color: ['#f59e0b', '#10b981', '#4a5a78'][i]}
            }))
          }
        ]
      })
    },
    initPriorityChart() {
      const el = this.$refs.priorityChart
      if (!el) return
      this.disposeChart('priorityPie')
      const chart = echarts.init(el)
      this.chartInstances.priorityPie = chart
      const data = [
        {
          value: this.taskList.filter(t => String(t.RWYXJ) === '03').length,
          name: this.yxjMap['03'] || '核心'
        },
        {
          value: this.taskList.filter(t => String(t.RWYXJ) === '02').length,
          name: this.yxjMap['02'] || '重要'
        },
        {
          value: this.taskList.filter(t => String(t.RWYXJ) === '01').length,
          name: this.yxjMap['01'] || '一般'
        }
      ]
      chart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
          backgroundColor: 'rgba(7, 12, 20, 0.95)',
          borderColor: 'transparent',
          textStyle: {color: '#e2e8f0', fontSize: 11}
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '55%'],
            center: ['50%', '50%'],
            animationDuration: 1200,
            animationEasing: 'cubicInOut',
            label: {color: '#a8b5cc', fontSize: 10},
            itemStyle: {
              borderRadius: 4,
              borderColor: 'transparent',
              borderWidth: 0,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 180, 255, 0.2)'
            },
            emphasis: {
              scaleSize: 8,
              itemStyle: {
                shadowBlur: 20,
                shadowColor: 'rgba(0, 212, 255, 0.5)'
              }
            },
            data: data.map((d, i) => ({
              ...d,
              itemStyle: {color: ['#f43f5e', '#f59e0b', '#3b82f6'][i]}
            }))
          }
        ]
      })
    },
    initKcPlatformChart() {
      const el = this.$refs.kcPlatformChart
      if (!el) return
      this.disposeChart('kcPlatform')
      const chart = echarts.init(el)
      this.chartInstances.kcPlatform = chart
      const data = [
        {name: '传感器', value: this.platformCounts.cgq, color: '#f43f5e'},
        {name: '决策', value: this.platformCounts.jc, color: '#38bdf8'},
        {name: '武器', value: this.platformCounts.wq, color: '#f59e0b'},
        {name: '敌方', value: this.platformCounts.df, color: '#8b5cf6'}
      ]
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {type: 'shadow'},
          backgroundColor: 'rgba(7, 12, 20, 0.95)',
          borderColor: 'transparent',
          textStyle: {color: '#e2e8f0', fontSize: 11}
        },
        grid: {top: 24, bottom: 22, left: 42, right: 10, containLabel: true},
        xAxis: {
          type: 'category',
          data: data.map(d => d.name),
          axisLine: {show: false},
          axisLabel: {color: '#6b7d99', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {show: false},
          axisLabel: {color: '#6b7d99', fontSize: 9}
        },
        series: [
          {
            type: 'bar',
            barWidth: '50%',
            animationDuration: 1400,
            animationEasing: 'elasticOut',
            data: data.map(d => ({
              value: d.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {offset: 0, color: d.color},
                  {offset: 1, color: d.color + '33'}
                ]),
                borderRadius: [4, 4, 0, 0],
                shadowBlur: 8,
                shadowColor: d.color + '66'
              }
            })),
            label: {
              show: true,
              position: 'top',
              color: '#e2e8f0',
              fontSize: 10,
              fontWeight: 'bold'
            }
          }
        ]
      })
    },
    initTargetCategoryChart() {
      const el = this.$refs.targetCategoryChart
      if (!el) return
      this.disposeChart('targetCategory')
      const chart = echarts.init(el)
      this.chartInstances.targetCategory = chart
      const entries = Object.entries(this.targetByCategory)
      const typeLabel = this.targetTypeLabel
      if (entries.length === 0) {
        chart.setOption({
          title: {
            text: '暂无目标数据',
            textStyle: {color: '#6b7d99', fontSize: 12},
            left: 'center',
            top: 'center'
          }
        })
        return
      }
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {type: 'shadow'},
          backgroundColor: 'rgba(7, 12, 20, 0.95)',
          borderColor: 'transparent',
          textStyle: {color: '#e2e8f0', fontSize: 11}
        },
        grid: {top: 22, bottom: 20, left: 36, right: 10, containLabel: true},
        xAxis: {
          type: 'category',
          data: entries.map(([name]) => typeLabel(name)),
          axisLine: {show: false},
          axisLabel: {color: '#6b7d99', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {show: false},
          axisLabel: {color: '#6b7d99', fontSize: 9}
        },
        series: [
          {
            type: 'bar',
            barWidth: '45%',
            animationDuration: 1400,
            animationEasing: 'elasticOut',
            data: entries.map(([name, value]) => {
              const c = this.targetColorMap[name] || '#6b7d99'
              return {
                value,
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {offset: 0, color: c},
                    {offset: 1, color: c + '33'}
                  ]),
                  borderRadius: [4, 4, 0, 0],
                  shadowBlur: 8,
                  shadowColor: c + '66'
                }
              }
            }),
            label: {
              show: true,
              position: 'top',
              color: '#e2e8f0',
              fontSize: 10,
              fontWeight: 'bold'
            }
          }
        ]
      })
    },

    initOperationChart() {
      const el = this.$refs.operationChart
      if (!el) return
      this.disposeChart('operation')
      const chart = echarts.init(el)
      this.chartInstances.operation = chart
      const colors = [
        '#f43f5e',
        '#f59e0b',
        '#8b5cf6',
        '#3b82f6',
        '#10b981',
        '#06b6d4'
      ]
      chart.setOption(
        getAlertPieOption(
          this.operationAlertData.map((t, i) => ({
            value: t.value,
            name: t.name,
            itemStyle: {color: colors[i % colors.length]}
          }))
        )
      )
    },
    initPerformanceChart() {
      const el = this.$refs.performanceChart
      if (!el) return
      this.disposeChart('performance')
      const chart = echarts.init(el)
      this.chartInstances.performance = chart
      const colors = [
        '#a78bfa',
        '#38bdf8',
        '#f59e0b',
        '#f43f5e',
        '#10b981',
        '#06b6d4'
      ]
      chart.setOption(
        getAlertPieOption(
          this.performanceAlertData.map((t, i) => ({
            value: t.value,
            name: t.name,
            itemStyle: {color: colors[i % colors.length]}
          }))
        )
      )
    },
    initFaultChart() {
      const el = this.$refs.faultChart
      if (!el) return
      this.disposeChart('fault')
      const chart = echarts.init(el)
      this.chartInstances.fault = chart
      chart.setOption(
        getFaultBarOption({
          labels: this.faultData.labels,
          values: this.faultData.values,
          colors: this.faultData.colors
        })
      )
    },
    disposeChart(key) {
      if (this.chartInstances[key]) {
        this.chartInstances[key].dispose()
        this.chartInstances[key] = null
      }
    },
    handleAlertTimeChange(val) {
      this.alertTimeRange = val
      this.fetchAlertStats()
    },
    taskStateCount(state) {
      return this.taskList.filter(t => String(t.STATE) === String(state)).length
    },
    taskPriorityCount(yxj) {
      return this.taskList.filter(t => String(t.RWYXJ) === yxj).length
    },
    getGroupTotal(g) {
      return g.PTXXMCS ? g.PTXXMCS.split(',').filter(Boolean).length : 0
    },
    getGroupStateText(s) {
      const map = {0: '新建', 1: '启动', 2: '终止'}
      return map[s] || '未知'
    },
    handleSearch() {
      this.pageNum = 1
      this.fetchTaskList()
    },
    handleRefresh() {
      this.$message.success('正在刷新数据...')
      this.fetchAllData()
    }
  }
}
</script>

<style scoped>
.screen-container {
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);
  color: var(--color-text-main);
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  gap: 12px;
}

/* Row 2: 三列 */
.row-2-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
}
.col-module {
  flex: 1;
  background: transparent;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  overflow: hidden;
}
.module-header {
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-dark);
  flex-shrink: 0;
}
.module-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}
.module-badge {
  font-size: 13px;
  font-weight: bold;
  font-family: monospace;
  background: rgba(12, 20, 36, 0.3);
  border: 1px solid var(--border-dark);
  border-radius: 3px;
  padding: 0 6px;
  line-height: 1.6;
}
.col-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 4px;
  gap: 4px;
}

/* 左侧 - 任务保障统计 */
.sub-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.sub-section-title {
  font-size: 11px;
  color: var(--color-text-muted);
  padding: 2px 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.state-counts {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.sc-tag {
  font-size: 9px;
  padding: 0 4px;
  border-radius: 2px;
  font-weight: bold;
  line-height: 1.6;
}
.sc-wait {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.sc-run {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.sc-end {
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.2);
}
.sc-pri-high {
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.1);
  border: 1px solid rgba(244, 63, 94, 0.2);
}
.sc-pri-mid {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
}
.sc-pri-low {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
}
.sub-chart {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 杀伤链 - 左右并排图表 */
.killchain-body {
  gap: 0 !important;
}
.kc-charts-row {
  flex: 1;
  display: flex;
  gap: 10px;
  min-height: 0;
}
.kc-chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.sub-chart-full {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 右侧 - 任务网络统计 */
.task-net-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 8px;
  padding: 4px 0;
  flex: 1;
}
.task-net-card {
  background: transparent;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 10px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.tnc-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(12, 20, 36, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.tnc-content {
  flex: 1;
  min-width: 0;
}
.tnc-label {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-bottom: 1px;
}
.tnc-value {
  font-size: 20px;
  font-weight: bold;
  font-family: monospace;
  line-height: 1.2;
}

/* Row 3: 平台在线(左) + 告警故障(右) */
.row-3-layout {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
}
.half-module {
  flex: 1;
  background: transparent;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 右侧上下分割 */
.right-split {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.right-split .half-module {
  flex: 1;
  min-height: 0;
}

.half-module-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 0;
  padding-top: 4px;
}

/* 告警统计 - 两个图表左右并排 */
.alert-charts-row {
  flex: 1;
  display: flex;
  gap: 0;
  min-height: 0;
  padding-top: 4px;
}
.alert-chart-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0 4px;
}
.alert-chart-divider {
  width: 1px;
  background: var(--border-dark);
  flex-shrink: 0;
}
.alert-sub-title {
  font-size: 10px;
  color: var(--color-text-muted);
  font-weight: bold;
  margin-bottom: 2px;
  flex-shrink: 0;
}
.alert-big-number-sm {
  text-align: center;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.alert-big-number-sm .font-num {
  font-size: 22px;
  font-weight: bold;
  font-family: monospace;
}
.alert-unit-sm {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-left: 2px;
}

.alert-big-number {
  width: 72px;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.alert-total {
  font-size: 28px;
  font-weight: bold;
  font-family: monospace;
  line-height: 1;
}
.alert-unit {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.half-chart {
  flex: 1;
  height: 100%;
  min-width: 0;
}

/* 颜色工具 */
.text-blue {
  color: var(--color-primary) !important;
}
.text-cyan {
  color: var(--color-cyan) !important;
}
.text-green {
  color: var(--color-success) !important;
}
.text-warning {
  color: var(--color-warning) !important;
}
.text-success {
  color: var(--color-success) !important;
}
.text-danger {
  color: var(--color-danger) !important;
}
.text-purple {
  color: #8b5cf6 !important;
}
.text-primary {
  color: var(--color-primary) !important;
}
.icon-blue {
  color: #38bdf8;
}
.icon-cyan {
  color: #06b6d4;
}
.icon-green {
  color: #10b981;
}

/* 平台在线统计 - 群组卡片 */
.group-stat-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: 4px;
}
.group-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.group-summary-card {
  background: transparent;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 8px;
  text-align: center;
}
.gsc-title {
  font-size: 11px;
  font-weight: bold;
  color: #e2e8f0;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gsc-task-name {
  font-size: 9px;
  color: #facc15;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.gsc-counts {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 3px;
}
.gsc-online {
  font-size: 22px;
  font-weight: bold;
  font-family: monospace;
}
.gsc-sep {
  color: var(--color-disabled);
  font-size: 16px;
}
.gsc-total {
  font-size: 18px;
  font-weight: bold;
  font-family: monospace;
}
.gsc-label {
  font-size: 9px;
  color: var(--color-disabled);
  margin: 2px 0;
}
.gsc-state {
  display: inline-block;
  font-size: 9px;
  padding: 1px 6px;
  border-radius: 3px;
}

.tag-新建 {
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.06);
}
.tag-启动 {
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.06);
}
.tag-终止 {
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.06);
}

/* ================================================================
   炫酷增强样式：角标装饰 / 扫描线 / 发光边框 / 卡片动效
   ================================================================ */

/* --- 面板发光边框（悬停增强） --- */
.panel-glow {
  position: relative;
  overflow: hidden;
  transition:
    box-shadow 0.4s ease,
    border-color 0.4s ease;
}
.panel-glow:hover {
  border-color: rgba(0, 212, 255, 0.3) !important;
  box-shadow:
    0 0 18px rgba(0, 180, 255, 0.12),
    inset 0 0 12px rgba(0, 180, 255, 0.04) !important;
}

/* --- 四角科技标（渐显+自适应） --- */
.tech-corners {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  pointer-events: none;
}
.tech-corners span {
  position: absolute;
  width: 16px;
  height: 16px;
  opacity: 0.4;
  transition: opacity 0.4s ease;
}
.panel-glow:hover .tech-corners span {
  opacity: 1;
}
.tc-tl {
  top: -1px;
  left: -1px;
  border-top: 2px solid #00d4ff;
  border-left: 2px solid #00d4ff;
}
.tc-tr {
  top: -1px;
  right: -1px;
  border-top: 2px solid #00d4ff;
  border-right: 2px solid #00d4ff;
}
.tc-bl {
  bottom: -1px;
  left: -1px;
  border-bottom: 2px solid #00d4ff;
  border-left: 2px solid #00d4ff;
}
.tc-br {
  bottom: -1px;
  right: -1px;
  border-bottom: 2px solid #00d4ff;
  border-right: 2px solid #00d4ff;
}

/* --- 卡片hover上浮+发光 --- */
.task-net-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1.2);
}
.task-net-card:hover {
  transform: translateY(-3px);
  border-color: rgba(0, 212, 255, 0.35) !important;
  box-shadow: 0 6px 20px rgba(0, 180, 255, 0.15);
  background: rgba(38, 67, 103, 0.4) !important;
}
.group-summary-card {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1.2);
}
.group-summary-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 212, 255, 0.3) !important;
  box-shadow: 0 4px 14px rgba(0, 180, 255, 0.12);
  background: rgba(38, 67, 103, 0.4) !important;
}

/* --- 数字跳动过渡 --- */
.tnc-value,
.gsc-online,
.gsc-total,
.alert-total {
  transition: color 0.3s ease;
}

/* --- 标题光晕 --- */
.module-title {
  text-shadow: 0 0 8px rgba(0, 180, 255, 0.15);
}

/* --- 容器背景微动（呼吸感） --- */
.screen-container {
  animation: bgPulse 8s ease-in-out infinite;
}
@keyframes bgPulse {
  0%,
  100% {
    background-color: #1a2d4a;
  }
  50% {
    background-color: #162940;
  }
}
</style>
