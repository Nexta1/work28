<template>
  <div class="analysis-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-title">
        网络链路状态智能诊断预测
        <span class="ai-badge">AI分析引擎</span>
      </div>
      <el-button
        size="mini"
        type="primary"
        :icon="dataRefreshing ? 'el-icon-loading' : 'el-icon-refresh'"
        :disabled="dataRefreshing"
        @click="refresh"
        >刷新数据</el-button
      >
    </div>

    <div class="main-body">
      <!-- 左侧：网络列表 -->
      <div class="device-sidebar">
        <div class="sidebar-title">
          <Icon icon="lucide:list" :size="14" color="#38bdf8" />
          全部网络
          <span class="sidebar-count">({{ allNetworkList.length }})</span>
        </div>
        <el-scrollbar class="sidebar-scroll" style="height: 100%">
          <div
            v-infinite-scroll="loadMore"
            infinite-scroll-disabled="networkLoading"
            infinite-scroll-distance="10"
          >
            <div
              v-for="d in networkList"
              :key="d.key"
              class="device-card"
              :class="{'is-active': selectedNetwork === d.key}"
              @click="selectNetwork(d)"
            >
              <div class="device-card-header">
                <span class="device-name">{{ d.label }}</span>
              </div>
              <div class="device-card-metrics">
                <span class="metric coord-tag"
                  >WLH: <b>{{ d.wlh }}</b></span
                >
                <span class="metric coord-tag"
                  >LLH: <b>{{ d.llh }}</b></span
                >
              </div>
            </div>
          </div>
          <div v-if="networkLoading" class="load-more-tip">加载更多...</div>
          <div
            v-if="
              networkList.length >= allNetworkList.length &&
              allNetworkList.length > 0
            "
            class="load-more-tip"
          >
            — 已全部加载 —
          </div>
        </el-scrollbar>
      </div>

      <!-- 右侧：详细面板 -->
      <div class="detail-panel">
        <!-- 上排 -->
        <div ref="rowTop" class="row-top">
          <!-- 模块1：链路实时运行指标 -->
          <div ref="card1" class="col-top card-base">
            <div class="card-glow"></div>
            <span class="card-corner-inner"></span>
            <span class="card-corner-inner2"></span>
            <div class="card-title">
              链路实时运行指标
              <span class="active-coord" v-if="selectedNetwork"
                >WLH:{{ currentWLH }} LLH:{{ currentLLH }}</span
              >
            </div>
            <div class="status-wrap" :class="{'data-pulse': dataRefreshing}">
              <div class="status-item">
                <Icon
                  icon="lucide:shield"
                  :size="26"
                  color="#38bdf8"
                  class="status-icon"
                />
                <div class="status-label">健康分</div>
                <div
                  class="status-value"
                  :style="getValueColor('healthScore', healthScore)"
                >
                  <vue-count-to
                    :start-val="0"
                    :end-val="healthScore"
                    :duration="2000"
                    :decimals="1"
                    separator=""
                  /><span class="status-unit">分</span>
                </div>
              </div>
              <div class="status-item">
                <Icon
                  icon="lucide:activity"
                  :size="26"
                  color="#22c55e"
                  class="status-icon"
                />
                <div class="status-label">链路成功率</div>
                <div
                  class="status-value"
                  :style="getValueColor('successRate', successRate)"
                >
                  <vue-count-to
                    :start-val="0"
                    :end-val="successRate"
                    :duration="2000"
                    :decimals="1"
                    separator=""
                  /><span class="status-unit">%</span>
                </div>
              </div>
              <div class="status-item">
                <Icon
                  icon="lucide:clock"
                  :size="26"
                  color="#f59e0b"
                  class="status-icon"
                />
                <div class="status-label">平均时延</div>
                <div
                  class="status-value"
                  :style="getValueColor('delay', avgDelay)"
                >
                  <vue-count-to
                    :start-val="0"
                    :end-val="avgDelay"
                    :duration="2000"
                    :decimals="1"
                    separator=""
                  /><span class="status-unit">ms</span>
                </div>
              </div>
              <div class="status-item">
                <Icon
                  icon="lucide:bar-chart-3"
                  :size="26"
                  color="#f43f5e"
                  class="status-icon"
                />
                <div class="status-label">时延抖动</div>
                <div
                  class="status-value"
                  :style="getValueColor('jitter', delayJitter)"
                >
                  <vue-count-to
                    :start-val="0"
                    :end-val="delayJitter"
                    :duration="2000"
                    :decimals="1"
                    separator=""
                  /><span class="status-unit">ms</span>
                </div>
              </div>
            </div>
            <div class="level-box">
              <span class="level-tag" :class="'level-' + statusLevel"
                >当前告警等级：{{ statusText }}</span
              >
            </div>
          </div>

          <!-- 模块2：全维趋势总览（合并图表） -->
          <div ref="cardMerged" class="col-top card-base col-merg-chart">
            <div class="card-glow"></div>
            <span class="card-corner-inner"></span>
            <span class="card-corner-inner2"></span>
            <div class="card-title">
              全维趋势总览
              <span class="model-tag tag-cart">CART决策树</span>
              <span class="model-tag tag-ts">线性趋势分析</span>
            </div>
            <div class="chart-container">
              <div ref="mergedChart" class="chart-canvas"></div>
            </div>
          </div>
        </div>

        <!-- 下排 -->
        <div ref="rowBottom" class="row-bottom">
          <!-- 左侧：自愈策略 + 故障 -->
          <div ref="card5" class="col-bottom-left card-base">
            <div class="card-glow"></div>
            <span class="card-corner-inner"></span>
            <span class="card-corner-inner2"></span>
            <div class="card-title">
              链路自愈策略
              <span
                v-if="networkFaultList.length"
                class="model-tag"
                style="
                  background: linear-gradient(135deg, #ef4444, #dc2626);
                  font-size: 9px;
                "
              >
                故障 {{ networkFaultList.length }} 条
              </span>
            </div>
            <div class="analysis-split-layout">
              <div class="analysis-split-left">
                <div class="analysis-subtitle">最近故障记录</div>
                <ul class="analysis-list">
                  <li v-for="(item, i) in faultRecordList" :key="i">
                    {{ item }}
                  </li>
                  <li v-if="!networkFaultList.length" style="color: #64748b">
                    暂无故障记录
                  </li>
                </ul>
              </div>
              <div class="analysis-split-right">
                <div class="analysis-block">
                  <div class="analysis-subtitle">推荐自愈动作</div>
                  <ul class="analysis-list">
                    <li v-for="(item, i) in healStrategyList" :key="i">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：链路状态明细表 -->
          <div ref="card6" class="col-bottom-right card-base">
            <div class="card-glow"></div>
            <span class="card-corner-inner"></span>
            <span class="card-corner-inner2"></span>
            <div class="card-title">链路诊断与预测历史日志</div>
            <div class="table-wrapper">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>检测时间</th>
                    <th>健康分</th>
                    <th>成功率(%)</th>
                    <th>时延(ms)</th>
                    <th>抖动(ms)</th>
                    <th>当前状态</th>
                    <th>趋势预判</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in historyList" :key="i">
                    <td>{{ row.time }}</td>
                    <td>{{ row.healthScore }}</td>
                    <td>{{ row.successRate }}</td>
                    <td>{{ row.delayAvg }}</td>
                    <td>{{ row.jitter }}</td>
                    <td>{{ row.status }}</td>
                    <td>{{ row.trend }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as echarts from 'echarts'
import CountTo from 'vue-count-to'
import {
  getNetworkList,
  getNetworkLatestDetect,
  getNetworkTenMinutes,
  getNetworkPredict
} from '@/api/network'
import {mainPage} from '@/api/common'

/**
 * 异常状态映射
 * 0:正常 1:轻度 2:中度 3:严重
 */
const ANOMALY_MAP = {
  0: {level: 'normal', text: '正常', nextText: '正常'},
  1: {level: 'mild', text: '轻度异常', nextText: '轻度异常'},
  2: {level: 'moderate', text: '中度异常', nextText: '中度异常'},
  3: {level: 'severe', text: '重度异常', nextText: '严重异常'}
}

export default {
  name: 'NetworkStatusAnalysis',
  components: {
    'vue-count-to': CountTo
  },
  data() {
    return {
      // 网络选择
      selectedNetwork: null,
      networkList: [],
      allNetworkList: [],
      networkPage: 1,
      pageSize: 20,
      networkLoading: false,

      // 当前选中的 WLH / LLH
      currentWLH: 1,
      currentLLH: 1,

      // 概览数据
      healthScore: 0,
      successRate: 0,
      avgDelay: 0,
      delayJitter: 0,

      // 等级
      statusLevel: 'normal',
      statusText: '正常',

      // 自愈策略 & 故障
      healStrategyList: [],
      networkFaultList: [],

      // 历史日志
      historyList: [],

      // 合并图表数据
      mergedChartData: {
        time: [],
        scoreReal: [],
        rateReal: [],
        delayReal: [],
        jitterReal: [],
        scorePred: [],
        anomalyMark: []
      },
      cachedPast: null,
      cachedFuture: null,

      // 图表实例
      mergedChart: null,

      // 轮询
      refreshTimer: null,
      dataRefreshing: false
    }
  },
  computed: {
    faultRecordList() {
      return this.networkFaultList
        .slice(0, 6)
        .map(
          f =>
            `${this.formatFaultTime(f.warnTimestamp)} │ [${this.getLevelLabel(f.warnLevel)}] ${f.faultName || '未知'}：${f.warnContent || ''}`
        )
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initMergedChart()
      setTimeout(() => this.handleResize(), 100)
    })
    this.fetchNetworkList().then(() => {
      const handled = this.checkRouteQuery()
      if (!handled) this.fetchAllData()
    })
    this.refreshTimer = setInterval(() => {
      this.fetchAllData()
    }, 30000)
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.mergedChart) this.mergedChart.dispose()
    if (this.refreshTimer) clearInterval(this.refreshTimer)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /* ================ 设备选择 ================ */

    selectNetwork(d) {
      const key = d.key
      if (this.selectedNetwork === key) return
      this.selectedNetwork = key
      this.currentWLH = Number(d.wlh)
      this.currentLLH = Number(d.llh)
      this.fetchAllData()
    },

    loadMore() {
      if (this.networkLoading) return
      if (this.networkList.length >= this.allNetworkList.length) return
      this.networkLoading = true
      this.networkPage++
      this.networkList = this.allNetworkList.slice(
        0,
        this.networkPage * this.pageSize
      )
      this.networkLoading = false
    },

    checkRouteQuery() {
      const qWlh = this.$route.query.wlh
      const qLlh = this.$route.query.llh
      if (qWlh) {
        const match = this.allNetworkList.find(
          d => String(d.wlh) === qWlh && (!qLlh || String(d.llh) === qLlh)
        )
        if (match) {
          this.selectedNetwork = match.key
          this.currentWLH = Number(match.wlh)
          this.currentLLH = Number(match.llh)
          this.$nextTick(() => this.fetchAllData())
          return true
        }
      }
      return false
    },

    /* ================ 数据请求 ================ */

    /**
     * 获取网络列表（填充下拉框）
     */
    async fetchNetworkList() {
      try {
        const res = await getNetworkList()
        const list = res.data || []
        const seen = new Set()
        this.allNetworkList = []
        list.forEach(d => {
          const wlh = d.WLH || d.wlh
          const llh = d.LLH || d.llh
          const key = `${wlh}:${llh}`
          if (!seen.has(key)) {
            seen.add(key)
            this.allNetworkList.push({
              key,
              label: d.WLMC || d.wlmc || `网络 ${wlh || ''}`,
              wlh,
              llh
            })
          }
        })
        this.networkPage = 1
        this.networkList = this.allNetworkList.slice(0, this.pageSize)
        if (!this.selectedNetwork && this.networkList.length > 0) {
          this.selectedNetwork = this.networkList[0].key
          this.currentWLH = Number(this.networkList[0].wlh)
          this.currentLLH = Number(this.networkList[0].llh)
        }
      } catch (e) {
        console.error('获取网络列表失败', e)
        this.allNetworkList = [
          {key: '1:1', label: '低海空警戒任务网', wlh: 1, llh: 1},
          {key: '2:1', label: '指挥协同子网', wlh: 2, llh: 1}
        ]
        this.networkList = this.allNetworkList.slice(0, this.pageSize)
        this.selectedNetwork = '1:1'
        this.currentWLH = 1
        this.currentLLH = 1
      }
    },

    /**
     * 拉取全部数据（最新诊断 + 近10分钟 + 预测）
     */
    async fetchAllData() {
      if (!this.selectedNetwork) return
      this.dataRefreshing = true

      try {
        const [latestRes, tenMinRes, predictRes, warnRes] =
          await Promise.allSettled([
            getNetworkLatestDetect(this.currentWLH, this.currentLLH),
            getNetworkTenMinutes(this.currentWLH, this.currentLLH),
            getNetworkPredict(this.currentWLH, this.currentLLH),
            mainPage('warnInfo', {
              pageNum: 1,
              pageSize: 10,
              WLH: this.currentWLH
            })
          ])

        if (latestRes.status === 'fulfilled')
          this.applyLatestData(latestRes.value.data)
        if (tenMinRes.status === 'fulfilled')
          this.applyTenMinutesData(tenMinRes.value.data || [])
        if (predictRes.status === 'fulfilled')
          this.applyPredictData(predictRes.value.data || [])
        if (warnRes.status === 'fulfilled') this.applyWarnData(warnRes.value)
      } catch (e) {
        console.error('数据拉取失败', e)
      } finally {
        this.dataRefreshing = false
      }
    },

    /**
     * 应用最新诊断数据
     */
    applyLatestData(data) {
      if (!data) return

      this.healthScore = +(data.healthScore ?? 0).toFixed(1)
      this.successRate = +(data.successRate ?? 0).toFixed(1)
      this.avgDelay = +(data.delayAvg ?? 0).toFixed(1)
      this.delayJitter = +(data.delayJitter ?? 0).toFixed(1)

      const status = data.anomalyStatus ?? 0
      const map = ANOMALY_MAP[status] || ANOMALY_MAP[0]
      this.statusLevel = map.level
      this.statusText = map.text

      // 自愈策略
      this.healStrategyList = this.parseHealStrategy(data.anomalyStatus ?? 0)
    },

    /**
     * 根据告警等级生成自愈策略列表
     */
    parseHealStrategy(status) {
      const strategies = {
        0: [
          '当前等级【正常】：无需执行链路自愈操作',
          '持续监控时延与抖动指标，防范突发波动'
        ],
        1: [
          '当前等级【轻度异常】：建议启动链路质量优化',
          '调整传输功率与编码方式，提升链路可靠性',
          '若持续恶化则触发流量优化与QoS调整'
        ],
        2: [
          '当前等级【中度异常】：立即执行链路自愈操作',
          '自动触发流量优化与QoS调整',
          '启用备用链路进行负载分担',
          '若未改善则执行路由切换'
        ],
        3: [
          '当前等级【严重异常】：紧急链路恢复操作',
          '立即执行路由切换与端口重启',
          '上报告警至运维中心',
          '自动隔离故障链路，启用全冗余备份'
        ]
      }
      return strategies[status] || strategies[0]
    },

    /**
     * 根据指标类型和数值返回对应的颜色
     * healthScore/successRate: 越高越好
     * delay/jitter: 越低越好
     */
    getValueColor(type, value) {
      const v = Number(value)
      let color
      if (type === 'healthScore') {
        if (v >= 85) color = '#22c55e'
        else if (v >= 70) color = '#f59e0b'
        else color = '#ef4444'
      } else if (type === 'successRate') {
        if (v >= 90) color = '#22c55e'
        else if (v >= 75) color = '#f59e0b'
        else color = '#ef4444'
      } else if (type === 'delay' || type === 'jitter') {
        if (v <= 100) color = '#22c55e'
        else if (v <= 200) color = '#f59e0b'
        else color = '#ef4444'
      } else {
        color = 'var(--color-primary)'
      }
      return {color, textShadow: `0 0 20px ${color}55, 0 0 40px ${color}22`}
    },

    /**
     * 应用近10分钟诊断数据
     */
    applyTenMinutesData(list) {
      if (!list || list.length === 0) return
      const slice = list.slice(-6)
      this.cachedPast = {
        time: slice.map((d, i) =>
          i < slice.length - 1 ? `${(slice.length - i) * 2}分钟前` : '当前'
        ),
        timestamps: slice.map(d => d.opTime || null),
        score: slice.map(d => +(d.healthScore ?? 0).toFixed(1)),
        rate: slice.map(d => +(d.successRate ?? 0).toFixed(1)),
        delay: slice.map(d => +(d.delayAvg ?? 0).toFixed(1)),
        jitter: slice.map(d => +(d.delayJitter ?? 0).toFixed(1))
      }
      this.buildMergedChartData()
      const recent = list.slice(-20).reverse()
      this.historyList = recent.map(d => ({
        time: d.opTime || '',
        healthScore: (d.healthScore ?? 0).toFixed(2),
        successRate: (d.successRate ?? 0).toFixed(2),
        delayAvg: (d.delayAvg ?? 0).toFixed(2),
        jitter: (d.delayJitter ?? 0).toFixed(2),
        status: ANOMALY_MAP[d.anomalyStatus ?? 0]?.text || '未知',
        trend:
          (d.healthScore ?? 0) >= 90
            ? '平稳'
            : (d.healthScore ?? 0) >= 70
              ? '关注'
              : '预警'
      }))
    },

    /**
     * 应用预测数据
     */
    applyPredictData(list) {
      if (!list || list.length === 0) return
      const slice = list.slice(0, 6)
      this.cachedFuture = {
        time: slice.map((d, i) => (i === 0 ? '当前' : `+${i}分钟`)),
        score: slice.map(d => +(d.healthScore ?? 0).toFixed(1))
      }
      this.buildMergedChartData()
    },

    /* ================ 图表更新 ================ */

    applyWarnData(res) {
      const list = res?.data?.list || res?.list || res?.data || []
      this.networkFaultList = list.slice(0, 50)
      this.buildFaultMarkers(list)
    },

    getLevelLabel(lvl) {
      const maps = {0: '无', 1: '一般', 2: '中度', 3: '严重'}
      return maps[lvl] !== undefined ? maps[lvl] : '未知'
    },

    formatFaultTime(ts) {
      if (!ts) return '--'
      const d = new Date(Number(ts))
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    },

    formatShortTime(ts) {
      if (!ts) return ''
      const d = new Date(Number(ts))
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    },

    buildFaultMarkers(list) {
      const past = this.cachedPast
      if (!past || !past.time) return
      const len = this.mergedChartData.time?.length || past.time.length
      const anomalyMark = new Array(len).fill(null)
      const now = Date.now()
      const faults = list
        .filter(f => {
          if ((f.warnLevel || 0) < 1) return false
          const t = Number(f.warnTimestamp)
          if (!t) return false
          return now - (t < 1e12 ? t * 1000 : t) < 600000
        })
        .slice(0, 8)
      faults.forEach(f => {
        const t = Number(f.warnTimestamp)
        const ft = t < 1e12 ? t * 1000 : t
        const minAgo = (now - ft) / 60000
        const slot = Math.min(
          Math.max(Math.floor((10 - minAgo) / 2), 0),
          len - 1
        )
        const content = f.warnContent || f.faultName || '故障'
        if (anomalyMark[slot]) {
          anomalyMark[slot].warnContent += ` | ${content}`
        } else {
          anomalyMark[slot] = {
            value: 95,
            warnContent: content,
            faultTime: this.formatShortTime(ft)
          }
        }
      })
      this.mergedChartData.anomalyMark = anomalyMark
      this.updateMergedChart()
    },

    buildMergedChartData() {
      const past = this.cachedPast
      const future = this.cachedFuture
      if (!past || !future) return
      const time = [...past.time.slice(0, -1), ...future.time]
      const scoreReal = [
        ...past.score.slice(0, -1),
        past.score[past.score.length - 1]
      ]
      const rateReal = [
        ...past.rate.slice(0, -1),
        past.rate[past.rate.length - 1]
      ]
      const delayReal = [
        ...past.delay.slice(0, -1),
        past.delay[past.delay.length - 1]
      ]
      const jitterReal = [
        ...past.jitter.slice(0, -1),
        past.jitter[past.jitter.length - 1]
      ]
      const pad = (arr, len) => {
        const r = new Array(len).fill(null)
        for (let i = 1; i < arr.length; i++) r[len - arr.length + i] = arr[i]
        return r
      }
      const scorePred = pad(future.score, time.length)
      const curIdx = time.length - future.time.length
      scorePred[curIdx] = past.score[past.score.length - 1]
      const mk = this.mergedChartData.anomalyMark?.length
        ? this.mergedChartData.anomalyMark
        : new Array(time.length).fill(null)
      this.mergedChartData = {
        time,
        scoreReal,
        rateReal,
        delayReal,
        jitterReal,
        scorePred,
        anomalyMark: mk
      }
      this.updateMergedChart()
    },

    updateMergedChart() {
      if (!this.mergedChart) return
      const d = this.mergedChartData
      if (!d.time.length) return
      this.mergedChart.setOption({
        xAxis: {data: d.time},
        series: [
          {data: d.scoreReal},
          {data: d.rateReal},
          {data: d.delayReal},
          {data: d.jitterReal},
          {data: d.scorePred},
          {data: d.anomalyMark}
        ]
      })
    },

    handleResize() {
      setTimeout(() => {
        if (this.mergedChart) this.mergedChart.resize()
      }, 50)
    },

    refresh() {
      this.fetchAllData()
      this.$message.success('数据已刷新')
    },

    initMergedChart() {
      const el = this.$refs.mergedChart
      if (!el) return
      this.mergedChart = echarts.init(el, null, {renderer: 'canvas'})
      this.mergedChart.setOption({
        animation: true,
        animationDuration: 1200,
        animationEasing: 'cubicOut',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8, 14, 24, 0.92)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          borderWidth: 1,
          padding: [10, 14],
          textStyle: {color: '#e2e8f0', fontSize: 12},
          formatter(params) {
            let html = `<div style="font-size:13px;font-weight:bold;color:#38bdf8;margin-bottom:6px;border-bottom:1px solid rgba(56,189,248,0.15);padding-bottom:4px;">${params[0].axisValue}</div>`
            params.forEach(p => {
              if (p.value === null || p.value === undefined) return
              let val = p.value,
                unit = ''
              if (p.seriesName === '故障信号') {
                val = p.data?.warnContent || '故障'
              } else if (p.seriesName === '成功率') unit = '%'
              else if (p.seriesName === '时延' || p.seriesName === '抖动')
                unit = 'ms'
              html +=
                `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0;">` +
                `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>` +
                `<span style="font-weight:bold;color:#fff;">${val}${unit}</span></div>`
            })
            return html
          }
        },
        legend: {
          data: [
            {name: '健康分', icon: 'circle'},
            {name: '成功率', icon: 'circle'},
            {name: '时延', icon: 'circle'},
            {name: '抖动', icon: 'circle'},
            {name: '预测健康分', icon: 'diamond'},
            {name: '故障信号', icon: 'circle'}
          ],
          textStyle: {color: '#e2e8f0', fontSize: 10},
          bottom: 0
        },
        grid: {left: '7%', right: '5%', top: '10%', bottom: '18%'},
        xAxis: {
          type: 'category',
          axisLabel: {color: '#94a3b8', fontSize: 10},
          axisLine: {show: false},
          axisTick: {show: false},
          splitLine: {show: false}
        },
        yAxis: [
          {
            type: 'value',
            position: 'left',
            name: '时延(ms)',
            nameTextStyle: {color: '#f59e0b', fontSize: 9},
            axisLabel: {color: '#f59e0b', fontSize: 9},
            splitLine: {lineStyle: {color: 'rgba(255,255,255,0.06)'}},
            axisLine: {show: false},
            axisTick: {show: false}
          },
          {
            type: 'value',
            min: 0,
            max: 100,
            position: 'right',
            name: '分/%',
            nameTextStyle: {color: '#64748b', fontSize: 9},
            axisLabel: {color: '#94a3b8', fontSize: 9},
            splitLine: {show: false},
            axisLine: {show: false},
            axisTick: {show: false}
          },
          {
            type: 'value',
            position: 'left',
            offset: -40,
            name: '抖动(ms)',
            nameTextStyle: {color: '#ef4444', fontSize: 9},
            axisLabel: {color: '#ef4444', fontSize: 9},
            splitLine: {show: false},
            axisLine: {show: false},
            axisTick: {show: false}
          }
        ],
        series: [
          {
            name: '健康分',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: [],
            lineStyle: {color: '#38bdf8', width: 2},
            itemStyle: {color: '#38bdf8'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '成功率',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: [],
            lineStyle: {color: '#22c55e', width: 2},
            itemStyle: {color: '#22c55e'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '时延',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: [],
            lineStyle: {color: '#f59e0b', width: 2},
            itemStyle: {color: '#f59e0b'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '抖动',
            type: 'line',
            smooth: true,
            yAxisIndex: 2,
            data: [],
            lineStyle: {color: '#ef4444', width: 2},
            itemStyle: {color: '#ef4444'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '预测健康分',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: [],
            lineStyle: {color: '#8b5cf6', width: 2, type: 'dashed'},
            itemStyle: {color: '#8b5cf6'},
            symbol: 'diamond',
            symbolSize: 4
          },
          {
            name: '故障信号',
            type: 'scatter',
            yAxisIndex: 1,
            data: [],
            symbol: 'circle',
            symbolSize: 10,
            itemStyle: {color: '#ef4444'},
            label: {
              show: true,
              position: 'bottom',
              color: '#ef4444',
              fontSize: 9,
              distance: 2,
              formatter(p) {
                return p.data?.faultTime || ''
              }
            },
            z: 10
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
/* ==================== 页面主容器 ==================== */
.analysis-page {
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);
  color: var(--color-text-main);
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
/* 页面背景微光晕 */
.analysis-page::before {
  content: '';
  position: absolute;
  top: -15%;
  left: -10%;
  width: 50%;
  height: 50%;
  background: radial-gradient(
    circle,
    rgba(56, 189, 248, 0.03) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 0;
  animation: pageGlow 8s ease-in-out infinite alternate;
}
@keyframes pageGlow {
  0% {
    opacity: 0.5;
    transform: translate(0, 0);
  }
  100% {
    opacity: 1;
    transform: translate(5%, 3%);
  }
}

/* ==================== 顶部导航 ==================== */
.header {
  position: relative;
  width: 100%;
  height: 46px;
  background: linear-gradient(
    135deg,
    rgba(12, 20, 36, 0.9),
    rgba(8, 14, 24, 0.95)
  );
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 12px;
  border: 1px solid rgba(56, 189, 248, 0.15);
  flex-shrink: 0;
  z-index: 1;
  overflow: hidden;
}
/* 顶部导航-顶边光带 */
.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.5),
    transparent
  );
  animation: headerScan 3s ease-in-out infinite;
}
@keyframes headerScan {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.3;
  }
}
/* 顶部导航-底部流光 */
.header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -100%;
  width: 100%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(6, 182, 212, 0.3),
    transparent
  );
  animation: headerFlow 4s linear infinite;
}
@keyframes headerFlow {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.header-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
}
.ai-badge {
  display: inline-block;
  background: linear-gradient(90deg, #10b981, #38bdf8);
  color: #fff;
  font-size: 10px;
  padding: 2px 14px;
  border-radius: 30px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
  animation: badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.2);
  }
  50% {
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
  }
}

/* ==================== 左右主布局 ==================== */
.main-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
}

/* 左侧网络列表 */
.device-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: linear-gradient(
    160deg,
    rgba(10, 18, 34, 0.9),
    rgba(8, 14, 24, 0.95)
  );
  border: 1px solid rgba(30, 41, 59, 0.6);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sidebar-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-primary);
  padding: 12px 10px 8px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.1);
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}
.sidebar-count {
  color: #64748b;
  font-weight: normal;
  font-size: 11px;
}
.sidebar-scroll {
  flex: 1;
  height: 100%;
}
.sidebar-scroll .el-scrollbar__wrap {
  overflow-x: hidden;
}
.device-card {
  padding: 10px;
  border-bottom: 1px solid rgba(30, 41, 59, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
}
.device-card:hover {
  background: rgba(56, 189, 248, 0.06);
}
.device-card.is-active {
  background: rgba(56, 189, 248, 0.1);
  border-left: 3px solid var(--color-primary);
  padding-left: 7px;
}
.device-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.device-name {
  font-size: 12px;
  color: #e2e8f0;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.device-card-metrics {
  display: flex;
  gap: 8px;
  font-size: 10px;
  padding-left: 0;
  margin-top: 4px;
}
.device-card-metrics .metric {
  font-variant-numeric: tabular-nums;
  color: #94a3b8;
}
.coord-tag {
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.15);
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
}
.coord-tag b {
  color: #38bdf8;
}
.active-coord {
  font-size: 10px;
  font-weight: normal;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  padding: 1px 10px;
  border-radius: 3px;
  margin-left: auto;
  font-family: monospace;
}
.load-more-tip {
  text-align: center;
  font-size: 11px;
  color: #64748b;
  padding: 10px;
}

/* 右侧详细面板 */
.detail-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.col-merg-chart {
  flex: 3 !important;
}

.analysis-split-layout {
  display: flex;
  gap: 10px;
  flex: 1;
  min-height: 0;
}
.analysis-split-left {
  width: 45%;
  overflow-y: auto;
  border-right: 1px solid rgba(56, 189, 248, 0.1);
  padding-right: 8px;
}
.analysis-split-left::-webkit-scrollbar {
  width: 3px;
}
.analysis-split-left::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.analysis-split-right {
  flex: 1;
  overflow-y: auto;
}

/* ==================== 通用卡片组件 ==================== */
.card-base {
  position: relative;
  background: linear-gradient(
    160deg,
    rgba(12, 20, 36, 0.85),
    rgba(8, 14, 24, 0.9)
  );
  border-radius: 6px;
  border: 1px solid rgba(30, 41, 59, 0.6);
  padding: 10px;
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
/* 卡片装饰-四个科技角标 */
.card-base::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 18px;
  height: 18px;
  border-top: 2px solid rgba(56, 189, 248, 0.3);
  border-left: 2px solid rgba(56, 189, 248, 0.3);
  border-radius: 6px 0 0 0;
  pointer-events: none;
  transition: all 0.3s ease;
}
.card-base::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 18px;
  height: 18px;
  border-bottom: 2px solid rgba(56, 189, 248, 0.3);
  border-right: 2px solid rgba(56, 189, 248, 0.3);
  border-radius: 0 0 6px 0;
  pointer-events: none;
  transition: all 0.3s ease;
}
/* 卡片补充角标-右下对角的两个 */
.card-corner-inner {
  position: absolute;
  bottom: -1px;
  left: -1px;
  width: 10px;
  height: 10px;
  border-bottom: 1.5px solid rgba(6, 182, 212, 0.2);
  border-left: 1.5px solid rgba(6, 182, 212, 0.2);
  border-radius: 0 0 0 6px;
  pointer-events: none;
}
.card-corner-inner2 {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 10px;
  height: 10px;
  border-top: 1.5px solid rgba(6, 182, 212, 0.2);
  border-right: 1.5px solid rgba(6, 182, 212, 0.2);
  border-radius: 0 6px 0 0;
  pointer-events: none;
}
/* 卡片悬浮光效 */
.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.4),
    transparent
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.card-base:hover {
  border-color: rgba(56, 189, 248, 0.25);
  box-shadow:
    0 0 20px rgba(56, 189, 248, 0.06),
    inset 0 0 30px rgba(56, 189, 248, 0.02);
  transform: translateY(-1px);
}
.card-base:hover::before,
.card-base:hover::after {
  border-color: rgba(56, 189, 248, 0.6);
}
.card-base:hover .card-glow {
  opacity: 1;
}

/* ==================== 上排行布局 ==================== */
.row-top {
  width: 100%;
  flex: 5;
  min-height: 0;
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  z-index: 1;
}
.col-top {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

/* ==================== 下排行布局 ==================== */
.row-bottom {
  width: 100%;
  flex: 4;
  min-height: 0;
  display: flex;
  gap: 10px;
  z-index: 1;
}
.col-bottom-left {
  width: 50%;
  height: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.col-bottom-left .card-glow,
.col-bottom-left .card-corner-inner,
.col-bottom-left .card-corner-inner2 {
  display: none;
}
.col-bottom-left .card-title {
  flex-shrink: 0;
}
.col-bottom-left .analysis-block {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}
.col-bottom-left .analysis-block::-webkit-scrollbar {
  width: 3px;
}
.col-bottom-left .analysis-block::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.col-bottom-right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ==================== 卡片标题 ==================== */
.card-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-cyan);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
  position: relative;
}
.card-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 1.5px;
  background: linear-gradient(90deg, var(--color-cyan), transparent);
  border-radius: 2px;
}
.model-tag {
  font-size: 9px;
  padding: 1px 8px;
  border-radius: 3px;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}
.tag-cart {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
}
.tag-ts {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
}

/* ==================== 状态数值区（竖向排列） ==================== */
.status-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  flex: 1;
  align-content: stretch;
}
.status-icon {
  flex-shrink: 0;
  opacity: 0.9;
  margin-bottom: 2px;
}
.status-item {
  text-align: center;
  position: relative;
  padding: 12px 6px;
  border-radius: 4px;
  background: rgba(5, 11, 20, 0.4);
  border: 1px solid rgba(30, 41, 59, 0.3);
  transition: all 0.3s ease;
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.status-item:hover {
  background: rgba(5, 11, 20, 0.6);
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.05);
}
/* 数据刷新脉冲 */
.data-pulse .status-item {
  animation: refreshPulse 0.6s ease;
}
@keyframes refreshPulse {
  0% {
    box-shadow: 0 0 0 rgba(56, 189, 248, 0);
  }
  50% {
    box-shadow:
      inset 0 0 20px rgba(56, 189, 248, 0.08),
      0 0 15px rgba(56, 189, 248, 0.06);
  }
  100% {
    box-shadow: 0 0 0 rgba(56, 189, 248, 0);
  }
}
.status-label {
  font-size: 11px;
  color: var(--color-text-muted);
  letter-spacing: 0.3px;
  white-space: nowrap;
  text-align: center;
}
.status-value {
  font-size: 30px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  text-align: center;
  flex-shrink: 0;
  transition:
    color 0.5s ease,
    text-shadow 0.5s ease;
}
.status-unit {
  font-size: 12px;
  color: var(--color-text-main);
  margin-left: 2px;
  opacity: 0.7;
}
.level-box {
  margin-top: auto;
  text-align: center;
  padding: 8px 0 2px;
}
.level-tag {
  display: inline-block;
  font-size: 11px;
  padding: 5px 20px;
  border-radius: 4px;
  color: #fff;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}
.level-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  animation: tagSweep 3s ease-in-out infinite;
}
@keyframes tagSweep {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}
.level-normal {
  background: linear-gradient(135deg, #10b981, #059669);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}
.level-mild {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
}
.level-moderate {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.3);
}
.level-severe {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}

/* ==================== 图表容器 ==================== */
.chart-container {
  flex: 1;
  min-height: 0;
  width: 100%;
  position: relative;
}
.chart-canvas {
  width: 100%;
  height: 100%;
}
.desc-text {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
  line-height: 1.5;
  flex-shrink: 0;
  letter-spacing: 0.2px;
}

/* ==================== 根因 & 影响分析 ==================== */
.analysis-block {
  margin-bottom: 14px;
  position: relative;
}
.analysis-block:last-child {
  margin-bottom: 0;
}
.analysis-subtitle {
  font-size: 13px;
  color: var(--color-primary);
  margin-bottom: 8px;
  padding-left: 10px;
  border-left: 3px solid var(--color-primary);
  letter-spacing: 0.5px;
  text-shadow: 0 0 10px rgba(56, 189, 248, 0.15);
}
.analysis-list {
  font-size: 12px;
  line-height: 1.9;
  color: var(--color-text-main);
  list-style: none;
  padding: 0;
  margin: 0;
}
.analysis-list li {
  position: relative;
  padding: 3px 0 3px 18px;
  transition: all 0.2s ease;
  border-radius: 2px;
}
.analysis-list li:hover {
  color: #fff;
  background: rgba(56, 189, 248, 0.04);
  padding-left: 22px;
}
.analysis-list li::before {
  content: '▶';
  position: absolute;
  left: 0;
  top: 3px;
  color: var(--color-warning);
  font-size: 8px;
  transition: all 0.2s ease;
}
.analysis-list li:hover::before {
  color: var(--color-primary);
  left: 3px;
}

/* ==================== 历史日志表格 ==================== */
.table-wrapper {
  flex: 1;
  overflow-y: auto;
}
.table-wrapper::-webkit-scrollbar {
  width: 3px;
}
.table-wrapper::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.history-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 11px;
}
.history-table thead {
  position: sticky;
  top: 0;
  z-index: 2;
}
.history-table th {
  background: linear-gradient(
    180deg,
    rgba(5, 11, 20, 0.95),
    rgba(8, 14, 24, 0.95)
  );
  color: var(--color-primary);
  height: 34px;
  border: none;
  border-bottom: 1px solid rgba(56, 189, 248, 0.15);
  font-weight: 600;
  letter-spacing: 0.3px;
  position: relative;
}
.history-table th::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.3),
    transparent
  );
}
.history-table td {
  height: 30px;
  text-align: center;
  border: none;
  border-bottom: 1px solid rgba(30, 41, 59, 0.2);
  color: var(--color-text-main);
  transition: all 0.2s ease;
}
.history-table tr {
  transition: all 0.15s ease;
}
.history-table tbody tr:hover td {
  background: rgba(56, 189, 248, 0.06);
  color: #fff;
}
.history-table tbody tr td:first-child {
  color: var(--color-text-muted);
  font-family: monospace;
  font-size: 10px;
}
.history-table tbody tr:hover td:first-child {
  color: var(--color-primary);
}
/* 表格行交替色 */
.history-table tbody tr:nth-child(even) td {
  background: rgba(56, 189, 248, 0.015);
}
.history-table tbody tr:nth-child(even):hover td {
  background: rgba(56, 189, 248, 0.06);
}
</style>
