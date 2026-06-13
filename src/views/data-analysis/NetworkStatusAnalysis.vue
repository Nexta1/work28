<template>
  <div class="analysis-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-title">
        网络链路状态智能诊断预测
        <span class="ai-badge">AI分析引擎</span>
      </div>
      <div class="header-actions">
        <el-select
          v-model="selectedNetwork"
          size="medium"
          class="network-select"
          @change="onNetworkChange"
        >
          <el-option
            v-for="d in networkOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-refresh"
          @click="refresh"
          >刷新数据</el-button
        >
      </div>
    </div>

    <!-- 上排 四个核心指标卡片 -->
    <div ref="rowTop" class="row-top">
      <!-- 模块1：链路实时运行指标 -->
      <div ref="card1" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">链路实时运行指标</div>
        <div class="status-wrap">
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
            <div class="status-value" :style="getValueColor('delay', avgDelay)">
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

      <!-- 模块2：链路异常诊断（CART决策树） -->
      <div ref="card2" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">
          链路异常诊断
          <span class="model-tag tag-cart">CART决策树算法</span>
        </div>
        <p class="desc-text">
          分析窗口：最近6条时序数据 | 综合判定链路运行状态
        </p>
        <div class="chart-container">
          <div ref="cartChart" class="chart-canvas"></div>
        </div>
      </div>

      <!-- 模块3：健康分趋势预测 -->
      <div ref="card3" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">
          健康分趋势预测
          <span class="model-tag tag-ts">线性趋势分析</span>
        </div>
        <p class="desc-text">基于连续12帧数据，分析健康分走势及未来风险</p>
        <div class="chart-container">
          <div ref="trendChart" class="chart-canvas"></div>
        </div>
      </div>

      <!-- 模块4：链路全指标走势 -->
      <div ref="card4" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">链路全指标走势</div>
        <p class="desc-text">健康分/成功率/时延/抖动 全局时序监控</p>
        <div class="chart-container">
          <div ref="totalLinkChart" class="chart-canvas"></div>
        </div>
      </div>
    </div>

    <!-- 下排 左右两大区域 -->
    <div ref="rowBottom" class="row-bottom">
      <!-- 左侧：链路自愈策略 -->
      <div ref="card5" class="col-bottom-left card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">链路自愈策略</div>
        <div class="analysis-block">
          <div class="analysis-subtitle">推荐自愈动作</div>
          <ul class="analysis-list">
            <li v-for="(item, i) in healStrategyList" :key="i">{{ item }}</li>
          </ul>
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
</template>
<script>
import * as echarts from 'echarts'
import gsap from 'gsap'
import CountTo from 'vue-count-to'
import {
  getNetworkList,
  getNetworkLatestDetect,
  getNetworkTenMinutes,
  getNetworkPredict
} from '@/api/network'

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
      networkOptions: [],
      networkList: [],

      // 概览数据（由后端接口返回）
      healthScore: 0,
      successRate: 0,
      avgDelay: 0,
      delayJitter: 0,

      // 等级
      statusLevel: 'normal',
      statusText: '正常',

      // 自愈策略
      healStrategyList: [],

      // 历史日志
      historyList: [],

      // 图表数据缓存
      cartChartData: {score: [], rate: [], time: []},
      trendChartData: {score: [], time: []},
      totalChartData: {score: [], rate: [], delay: [], jitter: [], time: []},

      // 图表实例
      cartChart: null,
      trendChart: null,
      totalChart: null,

      // 当前选中的 WLH / LLH
      currentWLH: 1,
      currentLLH: 1,

      // 轮询定时器
      refreshTimer: null
    }
  },
  computed: {},
  mounted() {
    this.$nextTick(() => {
      this.enterAnim()
      this.initCharts()
      setTimeout(() => this.handleResize(), 100)
    })
    this.fetchNetworkList().then(() => {
      this.fetchAllData()
    })
    this.refreshTimer = setInterval(() => {
      this.fetchAllData()
    }, 30000)
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.cartChart) this.cartChart.dispose()
    if (this.trendChart) this.trendChart.dispose()
    if (this.totalChart) this.totalChart.dispose()
    if (this._animTimeline) this._animTimeline.kill()
    if (this.refreshTimer) clearInterval(this.refreshTimer)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /* ================ 数据请求 ================ */

    /**
     * 获取网络列表（填充下拉框）
     */
    async fetchNetworkList() {
      try {
        const res = await getNetworkList()
        const list = res.data || []
        this.networkList = list
        // 用 index 去重，防止相同 WLH:LLH 导致 key 重复
        const seen = new Set()
        this.networkOptions = []
        list.forEach(d => {
          const wlh = d.WLH || d.wlh
          const llh = d.LLH || d.llh
          const key = `${wlh}:${llh}`
          if (!seen.has(key)) {
            seen.add(key)
            this.networkOptions.push({
              value: key,
              label: d.WLMC || d.wlmc || `网络 ${wlh || ''}`
            })
          }
        })
        if (!this.selectedNetwork && this.networkOptions.length > 0) {
          this.selectedNetwork = this.networkOptions[0].value
          const parts = this.selectedNetwork.split(':')
          this.currentWLH = Number(parts[0])
          this.currentLLH = Number(parts[1])
        }
      } catch (e) {
        console.error('获取网络列表失败', e)
        this.networkOptions = [
          {value: '1:1', label: '低海空警戒任务网'},
          {value: '2:1', label: '指挥协同子网'},
          {value: '6:1', label: '指挥协同子网1111'}
        ]
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

      try {
        const [latestRes, tenMinRes, predictRes] = await Promise.allSettled([
          getNetworkLatestDetect(this.currentWLH, this.currentLLH),
          getNetworkTenMinutes(this.currentWLH, this.currentLLH),
          getNetworkPredict(this.currentWLH, this.currentLLH)
        ])

        if (latestRes.status === 'fulfilled') {
          this.applyLatestData(latestRes.value.data)
        }
        if (tenMinRes.status === 'fulfilled') {
          this.applyTenMinutesData(tenMinRes.value.data || [])
        }
        if (predictRes.status === 'fulfilled') {
          this.applyPredictData(predictRes.value.data || [])
        }
      } catch (e) {
        console.error('数据拉取失败', e)
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
      const rateData = slice.map(d => +(d.successRate ?? 0).toFixed(1))
      const delayData = slice.map(d => +(d.delayAvg ?? 0).toFixed(1))
      const timeLabels = slice.map((d, i) => {
        if (i < slice.length - 1) return `${(slice.length - i) * 2}分钟前`
        return '当前'
      })

      this.cartChartData = {
        score: rateData.map((r, i) => (r + delayData[i]) / 2),
        rate: rateData,
        time: timeLabels
      }
      this.updateCartChart()

      const recent = list.slice(-20).reverse()
      this.historyList = recent.map(d => ({
        time: d.opTime || '',
        healthScore: (d.healthScore ?? 0).toFixed(2),
        successRate: (d.successRate ?? 0).toFixed(2),
        delayAvg: (d.delayAvg ?? 0).toFixed(2),
        jitter: (d.delayJitter ?? 0).toFixed(2),
        status: ANOMALY_MAP[d.anomalyStatus ?? 0]?.text || '未知',
        trend: this.getTrendText(d)
      }))
    },

    getTrendText(d) {
      const score = d.healthScore ?? 0
      if (score >= 90) return '平稳'
      if (score >= 80) return '小幅下滑'
      if (score >= 70) return '向好'
      return '预警'
    },

    /**
     * 应用预测数据
     */
    applyPredictData(list) {
      if (!list || list.length === 0) return

      const slice = list.slice(0, 6)
      const scoreData = slice.map(d => +(d.healthScore ?? 0).toFixed(1))
      const timeLabels = ['当前']
      for (let i = 1; i < slice.length; i++) {
        timeLabels.push(`+${i}分钟`)
      }

      this.trendChartData = {score: scoreData, time: timeLabels}
      this.updateTrendChart()

      // 全指标走势数据
      const totalLabels = [
        '10min前',
        '8min前',
        '6min前',
        '4min前',
        '2min前',
        '当前'
      ]
      const fullList = list.slice(-6)
      const rateArr = fullList.map(d => +(d.successRate ?? 0).toFixed(1))
      const delayArr = fullList.map(d => +(d.delayAvg ?? 0).toFixed(1))
      const jitterArr = fullList.map(d => +(d.delayJitter ?? 0).toFixed(1))
      this.totalChartData = {
        score: scoreData,
        rate: rateArr,
        delay: delayArr,
        jitter: jitterArr,
        time: totalLabels
      }
      this.updateTotalChart()
    },

    /* ================ 图表更新 ================ */

    updateCartChart() {
      if (!this.cartChart) return
      this.cartChart.setOption({
        xAxis: {data: this.cartChartData.time},
        series: [
          {data: this.cartChartData.score},
          {data: this.cartChartData.rate}
        ]
      })
    },

    updateTrendChart() {
      if (!this.trendChart) return
      this.trendChart.setOption({
        xAxis: {data: this.trendChartData.time},
        series: [{data: this.trendChartData.score}]
      })
    },

    updateTotalChart() {
      if (!this.totalChart) return
      this.totalChart.setOption({
        xAxis: {data: this.totalChartData.time},
        series: [
          {data: this.totalChartData.score},
          {data: this.totalChartData.rate},
          {data: this.totalChartData.delay},
          {data: this.totalChartData.jitter}
        ]
      })
    },

    /* ================ 窗口自适应 ================ */

    handleResize() {
      setTimeout(() => {
        if (this.cartChart) this.cartChart.resize()
        if (this.trendChart) this.trendChart.resize()
        if (this.totalChart) this.totalChart.resize()
      }, 50)
    },

    /* ================ 生命周期辅助 ================ */

    onNetworkChange() {
      const parts = this.selectedNetwork.split(':')
      this.currentWLH = Number(parts[0])
      this.currentLLH = Number(parts[1])
      this.$message.success('网络已切换，数据加载中...')
      this.fetchAllData()
    },

    refresh() {
      this.fetchAllData()
      this.$message.success('数据已刷新')
    },

    enterAnim() {
      const cards = [
        this.$refs.card1,
        this.$refs.card2,
        this.$refs.card3,
        this.$refs.card4
      ].filter(Boolean)
      const bottoms = [this.$refs.card5, this.$refs.card6].filter(Boolean)

      gsap.set(cards, {opacity: 0, y: 30})
      gsap.set(bottoms, {opacity: 0, y: 20})

      this._animTimeline = gsap
        .timeline({defaults: {ease: 'power3.out'}})
        .to(cards, {opacity: 1, y: 0, duration: 0.55, stagger: 0.08})
        .to(bottoms, {opacity: 1, y: 0, duration: 0.45, stagger: 0.1}, '-=0.2')
    },

    initCharts() {
      this.initCartChart()
      this.initTrendChart()
      this.initTotalChart()
    },

    initCartChart() {
      const el = this.$refs.cartChart
      if (!el) return
      this.cartChart = echarts.init(el, null, {renderer: 'canvas'})
      this.cartChart.setOption({
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
            const unitMap = {健康分: '', 链路成功率: '%'}
            params.forEach(p => {
              const unit = unitMap[p.seriesName] || ''
              html += `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0;">`
              html += `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>`
              html += `<span style="font-weight:bold;color:#fff;">${p.value}${unit}</span>`
              html += `</div>`
            })
            return html
          }
        },
        legend: {
          data: ['健康分', '链路成功率'],
          textStyle: {color: '#e2e8f0', fontSize: 12}
        },
        grid: {left: '8%', right: '5%', top: '15%', bottom: '10%'},
        xAxis: {
          type: 'category',
          data: this.cartChartData.time,
          axisLabel: {color: '#94a3b8', fontSize: 10},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {color: '#94a3b8'},
          splitLine: {lineStyle: {color: 'rgba(255,255,255,0.08)'}},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        series: [
          {
            name: '健康分',
            type: 'line',
            smooth: true,
            data: this.cartChartData.score,
            lineStyle: {color: '#38bdf8', width: 3},
            itemStyle: {color: '#38bdf8'},
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {offset: 0, color: 'rgba(56,189,248,0.25)'},
                  {offset: 1, color: 'rgba(56,189,248,0.02)'}
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 5
          },
          {
            name: '链路成功率',
            type: 'line',
            smooth: true,
            data: this.cartChartData.rate,
            lineStyle: {color: '#22c55e', width: 3},
            itemStyle: {color: '#22c55e'},
            symbol: 'circle',
            symbolSize: 5
          }
        ]
      })
    },

    initTrendChart() {
      const el = this.$refs.trendChart
      if (!el) return
      this.trendChart = echarts.init(el, null, {renderer: 'canvas'})
      this.trendChart.setOption({
        animation: true,
        animationDuration: 1500,
        animationEasing: 'cubicOut',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8, 14, 24, 0.92)',
          borderColor: 'rgba(139, 92, 246, 0.3)',
          borderWidth: 1,
          padding: [10, 14],
          textStyle: {color: '#e2e8f0', fontSize: 12},
          formatter(params) {
            const p = params[0]
            return (
              `<div style="font-size:13px;font-weight:bold;color:#8b5cf6;margin-bottom:6px;border-bottom:1px solid rgba(139,92,246,0.15);padding-bottom:4px;">${p.axisValue}</div>` +
              `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0;">` +
              `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8b5cf6;margin-right:6px;"></span>预测健康分</span>` +
              `<span style="font-weight:bold;color:#fff;">${p.value}</span>` +
              `</div>`
            )
          }
        },
        legend: {
          data: ['预测健康分'],
          textStyle: {color: '#e2e8f0', fontSize: 12}
        },
        grid: {left: '8%', right: '5%', top: '15%', bottom: '10%'},
        xAxis: {
          type: 'category',
          data: this.trendChartData.time,
          axisLabel: {color: '#94a3b8'},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        yAxis: {
          type: 'value',
          min: 80,
          max: 100,
          axisLabel: {color: '#94a3b8'},
          splitLine: {lineStyle: {color: 'rgba(255,255,255,0.08)'}},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        series: [
          {
            name: '预测健康分',
            type: 'line',
            smooth: true,
            data: this.trendChartData.score,
            lineStyle: {color: '#8b5cf6', width: 3},
            itemStyle: {color: '#8b5cf6'},
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {offset: 0, color: 'rgba(139,92,246,0.3)'},
                  {offset: 1, color: 'rgba(139,92,246,0.02)'}
                ]
              }
            },
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      })
    },

    initTotalChart() {
      const el = this.$refs.totalLinkChart
      if (!el) return
      this.totalChart = echarts.init(el, null, {renderer: 'canvas'})
      this.totalChart.setOption({
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
            const unitMap = {健康分: '', 成功率: '%', 时延: 'ms', 抖动: 'ms'}
            params.forEach(p => {
              const unit = unitMap[p.seriesName] || ''
              html += `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0;">`
              html += `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>`
              html += `<span style="font-weight:bold;color:#fff;">${p.value}${unit}</span>`
              html += `</div>`
            })
            return html
          }
        },
        legend: {
          data: ['健康分', '成功率', '时延', '抖动'],
          textStyle: {color: '#e2e8f0', fontSize: 12}
        },
        grid: {left: '8%', right: '5%', top: '15%', bottom: '10%'},
        xAxis: {
          type: 'category',
          data: this.totalChartData.time,
          axisLabel: {color: '#94a3b8', fontSize: 10},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        yAxis: {
          type: 'value',
          min: 0,
          axisLabel: {color: '#94a3b8'},
          splitLine: {lineStyle: {color: 'rgba(255,255,255,0.08)'}},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        series: [
          {
            name: '健康分',
            type: 'line',
            smooth: true,
            data: this.totalChartData.score,
            lineStyle: {color: '#38bdf8', width: 2},
            itemStyle: {color: '#38bdf8'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '成功率',
            type: 'line',
            smooth: true,
            data: this.totalChartData.rate,
            lineStyle: {color: '#22c55e', width: 2},
            itemStyle: {color: '#22c55e'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '时延',
            type: 'line',
            smooth: true,
            data: this.totalChartData.delay,
            lineStyle: {color: '#f59e0b', width: 2},
            itemStyle: {color: '#f59e0b'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '抖动',
            type: 'line',
            smooth: true,
            data: this.totalChartData.jitter,
            lineStyle: {color: '#ef4444', width: 2},
            itemStyle: {color: '#ef4444'},
            symbol: 'circle',
            symbolSize: 4
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
.network-select {
  width: 180px;
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
