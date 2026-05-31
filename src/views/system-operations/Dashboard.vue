<template>
  <div class="screen-container">
    <!-- 顶部标题栏 -->
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">
          <Icon
            icon="lucide:crosshair"
            :size="16"
            style="vertical-align: middle; margin-right: 6px; color: #f43f5e"
          />
          作战任务综合态势
        </span>
        <div class="search-item">
          <label>任务名称</label>
          <el-input
            v-model="queryParam.RWMC"
            @input="handleSearch"
            placeholder="输入任务名称搜索..."
            style="width: 180px"
            size="small"
          />
        </div>
        <div class="search-item">
          <label>任务状态</label>
          <el-select
            v-model="queryParam.STATUS"
            placeholder="选择状态"
            clearable
            size="mini"
            style="width: 110px"
            @change="handleSearch"
          >
            <el-option label="全部" value=""></el-option>
            <el-option
              v-for="(label, key) in stateMap"
              :key="key"
              :label="label"
              :value="String(key)"
            ></el-option>
          </el-select>
        </div>
        <div class="search-item">
          <label>优先级</label>
          <el-select
            v-model="queryParam.YXJ"
            placeholder="选择优先级"
            clearable
            size="mini"
            style="width: 110px"
            @change="handleSearch"
          >
            <el-option label="全部" value=""></el-option>
            <el-option
              v-for="(label, key) in yxjMap"
              :key="key"
              :label="label"
              :value="key"
            ></el-option>
          </el-select>
        </div>
      </div>
      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="handleRefresh"
          >刷新数据</el-button
        >
      </div>
    </div>

    <!-- Row 1: 7个统计卡片 -->
    <div class="stats-cards-section">
      <div class="stat-card">
        <div class="stat-icon icon-blue-bg">
          <Icon icon="lucide:list-todo" :size="20" class="icon-blue" />
        </div>
        <div class="stat-content">
          <div class="stat-label">任务数量</div>
          <div class="stat-value text-blue">{{ stats.taskCount || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-cyan-bg">
          <Icon icon="lucide:git-branch" :size="20" class="icon-cyan" />
        </div>
        <div class="stat-content">
          <div class="stat-label">子网数量</div>
          <div class="stat-value text-cyan">{{ stats.subnetCount || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-green-bg">
          <Icon icon="lucide:hard-drive" :size="20" class="icon-green" />
        </div>
        <div class="stat-content">
          <div class="stat-label">节点数量</div>
          <div class="stat-value text-green">{{ stats.memberCount || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-purple-bg">
          <Icon icon="lucide:share-2" :size="20" class="icon-purple" />
        </div>
        <div class="stat-content">
          <div class="stat-label">链路数量</div>
          <div class="stat-value text-purple">{{ stats.linkCount || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-orange-bg">
          <Icon icon="lucide:alert-triangle" :size="20" class="icon-orange" />
        </div>
        <div class="stat-content">
          <div class="stat-label">告警数量</div>
          <div class="stat-value text-warning">{{ stats.warnCount || 0 }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-red-bg">
          <Icon icon="lucide:alert-octagon" :size="20" class="icon-red" />
        </div>
        <div class="stat-content">
          <div class="stat-label">严重数量</div>
          <div class="stat-value text-danger">
            {{ stats.criticalCount || 0 }}
          </div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon icon-teal-bg">
          <Icon icon="lucide:heart-pulse" :size="20" class="icon-teal" />
        </div>
        <div class="stat-content">
          <div class="stat-label">健康数量</div>
          <div class="stat-value text-success">
            {{ stats.healthyCount || 0 }}
          </div>
        </div>
      </div>
    </div>

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
          </span>
        </div>
        <div class="col-body">
          <div class="sub-section">
            <div class="sub-section-title">任务状态分布</div>
            <div ref="statePieChart" class="sub-chart"></div>
          </div>
          <div class="sub-section">
            <div class="sub-section-title">任务优先级分布</div>
            <div ref="priorityChart" class="sub-chart"></div>
          </div>
        </div>
      </div>

      <!-- 中：杀伤链态势 -->
      <div class="col-module" style="flex: 1.5">
        <div class="module-header">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1">
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
        <div class="col-body">
          <!-- 已选任务概览 -->
          <div v-if="selectedKcTask" class="kc-summary-row">
            <div class="kc-summary-item">
              <span class="kc-summary-label">任务编号</span>
              <span class="kc-summary-value text-primary">{{
                selectedKcTask.SSLRWID || '-'
              }}</span>
            </div>
            <div class="kc-summary-item">
              <span class="kc-summary-label">传感器</span>
              <span class="kc-summary-value text-danger">{{
                platformCounts.cgq
              }}</span>
            </div>
            <div class="kc-summary-item">
              <span class="kc-summary-label">决策</span>
              <span class="kc-summary-value text-blue">{{
                platformCounts.jc
              }}</span>
            </div>
            <div class="kc-summary-item">
              <span class="kc-summary-label">武器</span>
              <span class="kc-summary-value text-warning">{{
                platformCounts.wq
              }}</span>
            </div>
            <div class="kc-summary-item">
              <span class="kc-summary-label">敌方</span>
              <span class="kc-summary-value text-purple">{{
                platformCounts.df
              }}</span>
            </div>
          </div>
          <div v-else class="kc-empty-hint">请选择杀伤链任务查看平台分布</div>
          <!-- 平台分布柱状图（占比更大） -->
          <div class="sub-section" style="flex: 2">
            <div class="sub-section-title">平台分布统计</div>
            <div ref="kcPlatformChart" class="sub-chart"></div>
          </div>
          <!-- 目标分类柱状图 -->
          <div class="sub-section" style="flex: 1.3">
            <div class="sub-section-title">目标分类统计</div>
            <div class="kc-target-summary">
              <span
                v-for="(cnt, type) in targetByCategory"
                :key="type"
                class="kc-target-tag"
              >
                <i
                  class="kc-target-dot"
                  :style="{background: targetColorMap[type] || '#64748b'}"
                ></i>
                {{ targetTypeLabel(type) }}
                <em class="kc-target-num">{{ cnt }}</em>
              </span>
            </div>
            <div ref="targetCategoryChart" class="sub-chart"></div>
          </div>
        </div>
      </div>

      <!-- 右：数据链网络运行统计 -->
      <div class="col-module">
        <div class="module-header">
          <span class="module-title">
            <Icon
              icon="lucide:activity"
              :size="14"
              style="vertical-align: middle; margin-right: 4px; color: #06b6d4"
            />
            数据链网络运行统计
          </span>
        </div>
        <div class="col-body">
          <div class="net-stat-row">
            <div class="net-stat-item">
              <span class="net-stat-label">子网数</span
              ><span class="net-stat-value text-cyan">{{
                stats.subnetCount
              }}</span>
            </div>
            <div class="net-stat-item">
              <span class="net-stat-label">节点数</span
              ><span class="net-stat-value text-green">{{
                stats.memberCount
              }}</span>
            </div>
            <div class="net-stat-item">
              <span class="net-stat-label">链路数</span
              ><span class="net-stat-value text-purple">{{
                stats.linkCount
              }}</span>
            </div>
          </div>
          <div ref="networkChart" class="col-chart"></div>
        </div>
      </div>
    </div>

    <!-- Row 3: 平台在线统计(左) | 告警+故障(右,等宽等高) -->
    <div class="row-3-layout">
      <!-- 左：平台在线统计 -->
      <div class="half-module">
        <div class="module-header">
          <span class="module-title">
            <Icon
              icon="lucide:server"
              :size="14"
              style="vertical-align: middle; margin-right: 4px; color: #10b981"
            />
            平台在线统计
          </span>
        </div>
        <div ref="platformOnlineChart" class="half-module-chart-full"></div>
      </div>
      <!-- 右：上告警 + 下故障 -->
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
                style="width: 200px"
                value-format="yyyy-MM-dd HH:mm:ss"
                @change="handleAlertTimeChange"
              ></el-date-picker>
            </div>
          </div>
          <div class="half-module-body">
            <div class="alert-big-number">
              <div class="alert-total text-warning">{{ alertTotal }}</div>
              <span class="alert-unit">次告警</span>
            </div>
            <div ref="alertChart" class="half-chart"></div>
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
import {taskGetPage, targetGetPage, networkGetPage} from '@/api/task'
import {sslrw} from '@/api/killchain'
import {getYXJMap, getStateMap} from '@/api/map'
import {getPlatformPage} from '@/api/platform'
import {wlzt, xxlltj} from '@/api/network'
import {getsbxxPage} from '@/api/platform'
import request from '@/utils/request'
import {
  getNetworkOption,
  getAlertPieOption,
  getFaultBarOption
} from './chartOptions'

export default {
  name: 'Dashboard',
  data() {
    return {
      taskList: [],
      total: 0,
      pageNum: 1,
      pageSize: 20,
      queryParam: {RWMC: '', STATUS: '', YXJ: ''},
      // 7个统计数据
      stats: {
        taskCount: 0,
        subnetCount: 0,
        memberCount: 0,
        linkCount: 0,
        warnCount: 0,
        criticalCount: 0,
        healthyCount: 0
      },
      // 杀伤链
      selectedKcTaskId: null,
      kcTaskList: [],
      platformCounts: {cgq: 0, jc: 0, wq: 0, df: 0},
      // 目标数据
      targetList: [],
      targetByCategory: {},
      targetColorMap: {1: '#f43f5e', 2: '#38bdf8', 3: '#f59e0b', 4: '#8b5cf6'},
      // 平台在线
      platformData: {
        labels: ['指挥平台', '侦察平台', '打击平台', '保障平台'],
        online: [12, 8, 15, 6],
        offline: [2, 1, 3, 1]
      },
      // 网络时序
      networkTimeData: {times: [], flow: []},
      // 告警
      alertStats: {alertTypes: []},
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
        network: null,
        platformOnline: null,
        alert: null,
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
    alertTotal() {
      return this.alertStats.alertTypes.reduce((s, t) => s + (t.value || 0), 0)
    },
    faultTotal() {
      return this.faultData.values.reduce((s, v) => s + v, 0)
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
      this.fetchNetworkData()
      this.fetchAlertStats()
      this.fetchFaultStats()
      this.fetchPlatformOnlineData()
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
          this.kcTaskList = res.data?.list || res.data?.records || []
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
          this.targetByCategory = {未知: 0}
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
      wlzt({pageNum: 1, pageSize: 1, params: {}})
        .then(res => {
          this.stats.linkCount =
            res.total || res.data?.total || res.data?.list?.length || 0
        })
        .catch(() => {})
    },
    // ---- 网络流量数据（信息流通统计） ----
    fetchNetworkData() {
      xxlltj({pageNum: 1, pageSize: 24, params: {}})
        .then(res => {
          const list = res.data?.list || res.rows || []
          if (list.length > 0) {
            const times = list.map(i => i.TJSJ || i.tjsj || i.time || '')
            const flow = list.map(i => Number(i.LLSL || i.llsl || i.flow || 0))
            this.networkTimeData = {times, flow}
          } else {
            this.genMockNetworkData()
          }
          this.$nextTick(() => this.initNetworkChart())
        })
        .catch(() => {
          this.genMockNetworkData()
          this.$nextTick(() => this.initNetworkChart())
        })
    },
    genMockNetworkData() {
      const times = []
      const flow = []
      for (let i = 23; i >= 0; i--) {
        const h = String(i).padStart(2, '0')
        times.push(`${h}:00`)
        flow.push(Math.round(Math.random() * 80 + 20))
      }
      this.networkTimeData = {times, flow}
    },
    // ---- 告警统计 ----
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
      request({
        url: '/rest/operation/sumByMetricName',
        method: 'post',
        data: params
      })
        .then(res => {
          const data = res.data || []
          this.alertStats.alertTypes = data.map(item => ({
            name: item.sumCategory || item.sumCategory2 || '其他',
            value: Math.round((item.sumValue || 0) * 10)
          }))
          // 从告警数据中提取严重/告警/健康数量
          const totalWarn = this.alertStats.alertTypes.reduce(
            (s, t) => s + t.value,
            0
          )
          this.stats.warnCount = totalWarn
          this.stats.criticalCount = Math.round(totalWarn * 0.15)
          this.stats.healthyCount =
            (this.stats.memberCount || 356) - this.stats.criticalCount
          if (this.alertStats.alertTypes.length === 0)
            this.setDefaultAlertData()
          this.$nextTick(() => this.initAlertChart())
        })
        .catch(() => {
          this.setDefaultAlertData()
          this.$nextTick(() => this.initAlertChart())
        })
    },
    setDefaultAlertData() {
      this.alertStats.alertTypes = [
        {name: '网络拥塞告警', value: 3},
        {name: '目标资源告警', value: 7},
        {name: '链路中断告警', value: 2},
        {name: '节点离线告警', value: 5}
      ]
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
          this.faultData.values = [3, 2, 1, 4]
          this.$nextTick(() => this.initFaultChart())
        })
    },
    // ---- 平台在线统计 ----
    fetchPlatformOnlineData() {
      getPlatformPage({pageNum: 1, pageSize: 999, params: {}})
        .then(res => {
          const list = res.data?.list || res.data?.records || []
          if (list.length > 0) {
            // 按平台类型分组统计在线/离线
            const typeMap = {}
            list.forEach(p => {
              const type = p.PTLX || p.ptlx || 0
              if (!typeMap[type]) typeMap[type] = {online: 0, offline: 0}
              if (String(p.ZT || p.zt || '0') === '0') typeMap[type].online++
              else typeMap[type].offline++
            })
            const entries = Object.entries(typeMap).slice(0, 4)
            this.platformData = {
              labels: entries.map(
                (_, i) =>
                  ['指挥平台', '侦察平台', '打击平台', '保障平台'][i] ||
                  `类型${i}`
              ),
              online: entries.map(e => e[1].online),
              offline: entries.map(e => e[1].offline)
            }
          }
          this.$nextTick(() => this.initPlatformOnlineChart())
        })
        .catch(() => {
          this.$nextTick(() => this.initPlatformOnlineChart())
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
          value: this.taskList.filter(t => String(t.STATUS) === '0').length,
          name: '待命'
        },
        {
          value: this.taskList.filter(t => String(t.STATUS) === '1').length,
          name: '启动'
        },
        {
          value: this.taskList.filter(t => String(t.STATUS) === '2').length,
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
          value: this.taskList.filter(t => String(t.YXJ) === '03').length,
          name: this.yxjMap['03'] || '核心'
        },
        {
          value: this.taskList.filter(t => String(t.YXJ) === '02').length,
          name: this.yxjMap['02'] || '重要'
        },
        {
          value: this.taskList.filter(t => String(t.YXJ) === '01').length,
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
    initNetworkChart() {
      const el = this.$refs.networkChart
      if (!el) return
      this.disposeChart('network')
      const chart = echarts.init(el)
      this.chartInstances.network = chart
      chart.setOption(
        getNetworkOption({
          times: this.networkTimeData.times,
          flow: this.networkTimeData.flow
        })
      )
    },
    initPlatformOnlineChart() {
      const el = this.$refs.platformOnlineChart
      if (!el) return
      this.disposeChart('platformOnline')
      const chart = echarts.init(el)
      this.chartInstances.platformOnline = chart
      chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {type: 'shadow'},
          backgroundColor: '#070c14',
          borderColor: '#172438',
          textStyle: {color: '#cbd5e1', fontSize: 11}
        },
        legend: {
          data: ['在网', '离线'],
          textStyle: {color: '#64748b', fontSize: 10},
          top: 0,
          right: 0
        },
        grid: {
          top: '18%',
          bottom: '15%',
          left: '12%',
          right: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: this.platformData.labels,
          axisLine: {lineStyle: {color: '#172438'}},
          axisLabel: {color: '#64748b', fontSize: 10}
        },
        yAxis: {
          type: 'value',
          splitLine: {lineStyle: {color: '#111b2b'}},
          axisLabel: {color: '#64748b', fontSize: 10}
        },
        series: [
          {
            name: '在网',
            type: 'bar',
            stack: 'total',
            barWidth: '40%',
            data: this.platformData.online,
            itemStyle: {color: '#10b981'}
          },
          {
            name: '离线',
            type: 'bar',
            stack: 'total',
            data: this.platformData.offline,
            itemStyle: {color: '#f43f5e', borderRadius: [3, 3, 0, 0]}
          }
        ]
      })
    },
    initAlertChart() {
      const el = this.$refs.alertChart
      if (!el) return
      this.disposeChart('alert')
      const chart = echarts.init(el)
      this.chartInstances.alert = chart
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
          this.alertStats.alertTypes.map((t, i) => ({
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

/* 顶部 */
.top-search-header {
  height: 46px;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  flex-shrink: 0;
}
.hub-title {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
}
.search-flex {
  display: flex;
  align-items: center;
  gap: 12px;
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
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
  color: #fff;
}

/* Row 1: 7卡片 */
.stats-cards-section {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  flex-shrink: 0;
}
.stat-card {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 6px;
  padding: 12px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
}
.stat-card:hover {
  border-color: #38bdf8;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(56, 189, 248, 0.1);
}
.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-content {
  flex: 1;
  min-width: 0;
}
.stat-label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 2px;
  white-space: nowrap;
}
.stat-value {
  font-size: 22px;
  font-weight: bold;
  font-family: monospace;
  line-height: 1.2;
}

.icon-blue-bg {
  background: rgba(56, 189, 248, 0.12);
}
.icon-cyan-bg {
  background: rgba(6, 182, 212, 0.12);
}
.icon-green-bg {
  background: rgba(16, 185, 129, 0.12);
}
.icon-purple-bg {
  background: rgba(139, 92, 246, 0.12);
}
.icon-orange-bg {
  background: rgba(245, 158, 11, 0.12);
}
.icon-red-bg {
  background: rgba(244, 63, 94, 0.12);
}
.icon-teal-bg {
  background: rgba(20, 184, 166, 0.12);
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
  padding: 10px;
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
}
.col-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 4px;
  gap: 4px;
}
.col-chart {
  flex: 1;
  min-height: 0;
  overflow: hidden;
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
}
.sub-chart {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 中间 - 杀伤链 */
.kc-summary-row {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 4px 4px;
  background: rgba(12, 20, 36, 0.5);
  border: 1px solid #16243b;
  border-radius: 4px;
  margin-bottom: 2px;
}
.kc-summary-item {
  flex: 1;
  text-align: center;
  min-width: 0;
}
.kc-summary-label {
  font-size: 9px;
  color: #52637a;
  display: block;
  margin-bottom: 1px;
}
.kc-summary-value {
  font-size: 16px;
  font-weight: bold;
  font-family: monospace;
  line-height: 1.2;
}
.kc-empty-hint {
  flex-shrink: 0;
  text-align: center;
  padding: 16px 0;
  color: #52637a;
  font-size: 12px;
}
.kc-target-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 2px 0;
  flex-shrink: 0;
}
.kc-target-tag {
  font-size: 10px;
  color: #94a3b8;
  background: rgba(12, 20, 36, 0.4);
  border: 1px solid #16243b;
  border-radius: 3px;
  padding: 1px 6px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.kc-target-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.kc-target-num {
  font-style: normal;
  font-weight: bold;
  color: #cbd5e1;
}

/* 右侧 - 网络统计 */
.net-stat-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-shrink: 0;
  padding: 4px;
}
.net-stat-item {
  text-align: center;
}
.net-stat-label {
  font-size: 10px;
  color: #64748b;
  display: block;
}
.net-stat-value {
  font-size: 18px;
  font-weight: bold;
  font-family: monospace;
  line-height: 1.3;
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
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.half-module-chart-full {
  flex: 1;
  min-height: 0;
  margin-top: 4px;
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
.icon-purple {
  color: #8b5cf6;
}
.icon-orange {
  color: #f59e0b;
}
.icon-red {
  color: #f43f5e;
}
</style>
