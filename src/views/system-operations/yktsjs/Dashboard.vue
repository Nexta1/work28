<template>
  <div class="screen-container">
    <!-- 顶部标题栏 -->

    <!-- Row 2: 三列 - 作战任务保障统计(左) | 杀伤链态势(中) | 数据链网络运行统计(右) -->
    <div class="row-2-layout">
      <!-- 左：作战任务保障统计 -->
      <div class="col-module" style="flex: 0.7">
        <div class="module-header">
          <span class="module-title">
            <Icon
              icon="lucide:shield"
              :size="14"
              style="vertical-align: middle; margin-right: 4px; color: #06b6d4"
            />
            作战任务保障统计
            <span class="module-badge text-blue">{{
              stats.taskCount || 0
            }}</span>
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
      <div class="col-module" style="flex: 2.2">
        <div class="module-header">
          <div style="display: flex; align-items: center; gap: 11px; flex: 1">
            <span class="module-title">
              <Icon
                icon="lucide:target"
                :size="14"
                style="
                  vertical-align: middle;
                  margin-right: 4px;
                  color: #f43f5e;
                "
              />
              杀伤链态势
              <span class="module-badge text-cyan">{{
                stats.kcTaskList || 0
              }}</span>
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
          <!-- 平台分布 + 目标分类 左右并排 -->
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
      <div class="col-module" style="flex: 0.6">
        <div class="module-header">
          <span class="module-title">
            <Icon
              icon="lucide:activity"
              :size="14"
              style="vertical-align: middle; margin-right: 4px; color: #06b6d4"
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
                  {{ stats.subnetCount || 0 }}
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
                  {{ stats.memberCount || 0 }}
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
                  {{ stats.linkCount || 0 }}
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
                  {{ stats.warnCount || 0 }}
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
                  {{ stats.criticalCount || 0 }}
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
                  {{ stats.healthyCount || 0 }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Row 3: 平台在线统计(左) | 告警+故障(右,等宽等高) -->
    <div class="row-3-layout">
      <!-- 左：平台在线统计 -->
      <div class="half-module">
        <div class="module-header">
          <div style="display: flex; align-items: center; gap: 8px; flex: 1">
            <span class="module-title">
              <Icon
                icon="lucide:server"
                :size="14"
                style="
                  vertical-align: middle;
                  margin-right: 4px;
                  color: #10b981;
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
      <!-- 右：上告警(两个图表左右) + 下故障 -->
      <div class="right-split">
        <div class="half-module">
          <div class="module-header">
            <div style="display: flex; align-items: center; gap: 8px; flex: 1">
              <span class="module-title">
                <Icon
                  icon="lucide:alert-triangle"
                  :size="14"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: #f59e0b;
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
              ></el-date-picker>
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
                />
                业务指标
              </div>
              <div class="alert-big-number-sm">
                <span class="text-warning font-num">{{ opTotal }}</span>
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
                />
                性能指标
              </div>
              <div class="alert-big-number-sm">
                <span class="text-purple font-num">{{ perfTotal }}</span>
                <span class="alert-unit-sm">次</span>
              </div>
              <div ref="performanceChart" class="half-chart"></div>
            </div>
          </div>
        </div>
        <div class="half-module">
          <div class="module-header">
            <span class="module-title">
              <Icon
                icon="lucide:tool"
                :size="14"
                style="
                  vertical-align: middle;
                  margin-right: 4px;
                  color: #f43f5e;
                "
              />
              数据链装备故障统计
            </span>
          </div>
          <div class="half-module-body">
            <div class="alert-big-number">
              <div class="alert-total text-danger">{{ faultTotal }}</div>
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
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
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
          backgroundColor: '#070c14',
          borderColor: '#172438',
          textStyle: {color: '#cbd5e1', fontSize: 11}
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '55%'],
            center: ['50%', '50%'],
            label: {color: '#94a3b8', fontSize: 10},
            itemStyle: {
              borderRadius: 4,
              borderColor: '#03060c',
              borderWidth: 2
            },
            data: data.map((d, i) => ({
              ...d,
              itemStyle: {color: ['#f59e0b', '#10b981', '#64748b'][i]}
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
          backgroundColor: '#070c14',
          borderColor: '#172438',
          textStyle: {color: '#cbd5e1', fontSize: 11}
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '55%'],
            center: ['50%', '50%'],
            label: {color: '#94a3b8', fontSize: 10},
            itemStyle: {
              borderRadius: 4,
              borderColor: '#03060c',
              borderWidth: 2
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
          backgroundColor: '#070c14',
          borderColor: '#172438',
          textStyle: {color: '#cbd5e1', fontSize: 11}
        },
        grid: {top: 24, bottom: 22, left: 42, right: 10, containLabel: true},
        xAxis: {
          type: 'category',
          data: data.map(d => d.name),
          axisLine: {lineStyle: {color: '#172438'}},
          axisLabel: {color: '#64748b', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {lineStyle: {color: '#111b2b'}},
          axisLabel: {color: '#64748b', fontSize: 9}
        },
        series: [
          {
            type: 'bar',
            barWidth: '50%',
            data: data.map(d => ({
              value: d.value,
              itemStyle: {color: d.color, borderRadius: [4, 4, 0, 0]}
            })),
            label: {
              show: true,
              position: 'top',
              color: '#cbd5e1',
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
            textStyle: {color: '#64748b', fontSize: 12},
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
          backgroundColor: '#070c14',
          borderColor: '#172438',
          textStyle: {color: '#cbd5e1', fontSize: 11}
        },
        grid: {top: 22, bottom: 20, left: 36, right: 10, containLabel: true},
        xAxis: {
          type: 'category',
          data: entries.map(([name]) => typeLabel(name)),
          axisLine: {lineStyle: {color: '#172438'}},
          axisLabel: {color: '#64748b', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {lineStyle: {color: '#111b2b'}},
          axisLabel: {color: '#64748b', fontSize: 9}
        },
        series: [
          {
            type: 'bar',
            barWidth: '45%',
            data: entries.map(([name, value]) => ({
              value,
              itemStyle: {
                color: this.targetColorMap[name] || '#64748b',
                borderRadius: [4, 4, 0, 0]
              }
            })),
            label: {
              show: true,
              position: 'top',
              color: '#cbd5e1',
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
    },
    handleResize() {
      Object.values(this.chartInstances).forEach(ch => ch && ch.resize())
    }
  }
}
</script>

<style scoped>
.screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
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
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 11px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.module-header {
  padding-bottom: 6px;
  border-bottom: 1px solid #111b2b;
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
  background: rgba(12, 20, 36, 0.6);
  border: 1px solid #16233a;
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
  color: #64748b;
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
  background: #0c1424;
  border: 1px solid #16233a;
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
  background: rgba(12, 20, 36, 0.6);
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
  color: #64748b;
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
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 11px;
  display: flex;
  flex-direction: column;
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
  background: #111b2b;
  flex-shrink: 0;
}
.alert-sub-title {
  font-size: 10px;
  color: #64748b;
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
  color: #64748b;
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
  color: #64748b;
  margin-top: 2px;
}
.half-chart {
  flex: 1;
  height: 100%;
  min-width: 0;
}

/* 颜色工具 */
.text-blue {
  color: #38bdf8 !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-warning {
  color: #f59e0b !important;
}
.text-success {
  color: #10b981 !important;
}
.text-danger {
  color: #f43f5e !important;
}
.text-purple {
  color: #8b5cf6 !important;
}
.text-primary {
  color: #38bdf8 !important;
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
  background: #0a1220;
  border: 1px solid #16233a;
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
  color: #475569;
  font-size: 16px;
}
.gsc-total {
  font-size: 18px;
  font-weight: bold;
  font-family: monospace;
}
.gsc-label {
  font-size: 9px;
  color: #475569;
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
</style>
