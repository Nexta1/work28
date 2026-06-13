<template>
  <div class="analysis-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-title">
        设备状态智能监控诊断
        <span class="ai-badge">人工智能分析引擎</span>
      </div>
      <div>
        <el-select
          v-model="selectedDevice"
          size="medium"
          class="device-select"
          @change="onDeviceChange"
        >
          <el-option
            v-for="d in deviceOptions"
            :key="d.value"
            :label="d.label"
            :value="d.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 上排 四大核心模块 -->
    <div ref="rowTop" class="row-top">
      <!-- 模块1：实时运行状态 -->
      <div ref="card1" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">设备实时运行状态</div>
        <div class="status-wrap">
          <div class="status-item">
            <Icon
              icon="lucide:cpu"
              :size="20"
              color="#38bdf8"
              class="status-icon"
            />
            <div class="status-label">CPU 平均使用率</div>
            <div class="status-value" :style="getValueColor('cpu', cpuUsage)">
              <vue-count-to
                :start-val="0"
                :end-val="cpuUsage"
                :duration="1800"
                :decimals="1"
                separator=""
              /><span class="status-unit">%</span>
            </div>
          </div>
          <div class="status-item">
            <Icon
              icon="lucide:hard-drive"
              :size="20"
              color="#22c55e"
              class="status-icon"
            />
            <div class="status-label">内存平均使用率</div>
            <div class="status-value" :style="getValueColor('mem', memUsage)">
              <vue-count-to
                :start-val="0"
                :end-val="memUsage"
                :duration="1800"
                :decimals="2"
                separator=""
              /><span class="status-unit">%</span>
            </div>
          </div>
          <div class="status-item">
            <Icon
              icon="lucide:thermometer"
              :size="20"
              color="#f59e0b"
              class="status-icon"
            />
            <div class="status-label">设备实时温度</div>
            <div
              class="status-value"
              :style="getValueColor('temp', temperature)"
            >
              <vue-count-to
                :start-val="0"
                :end-val="temperature"
                :duration="1800"
                :decimals="1"
                separator=""
              /><span class="status-unit">℃</span>
            </div>
          </div>
        </div>
        <div class="level-box">
          <span class="level-tag" :class="'level-' + statusLevel">{{
            statusText
          }}</span>
        </div>
      </div>

      <!-- 模块2：孤立森林 - AI异常诊断 -->
      <div ref="card2" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">
          设备异常诊断
          <span class="model-tag tag-iso">孤立森林算法</span>
        </div>
        <p class="desc-text">
          健康得分：
          <vue-count-to
            :start-val="0"
            :end-val="healthScore"
            :duration="2000"
            :decimals="1"
            separator=""
          />
          &nbsp;&nbsp; 检测窗口：近10分钟
        </p>
        <div class="chart-container">
          <div ref="anomalyChart" class="chart-canvas"></div>
        </div>
      </div>

      <!-- 模块3：LSTM - AI状态预测 -->
      <div ref="card3" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">
          设备状态预测
          <span class="model-tag tag-lstm">LSTM时序网络</span>
        </div>
        <p class="desc-text">
          基于连续12帧时序数据，预测下一阶段：<span
            :style="{color: nextLevelColor}"
            >{{ nextStatus }}</span
          >
        </p>
        <div class="chart-container">
          <div ref="predictChart" class="chart-canvas"></div>
        </div>
      </div>

      <!-- 模块4：综合指标趋势 -->
      <div ref="card4" class="col-top card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">综合运行趋势</div>
        <p class="desc-text">CPU/内存/温度 全局走势监控</p>
        <div class="chart-container">
          <div ref="totalChart" class="chart-canvas"></div>
        </div>
      </div>
    </div>

    <!-- 下排 两大综合区域 -->
    <div ref="rowBottom" class="row-bottom">
      <!-- 左侧：根因分析 + 影响分析 -->
      <div ref="card5" class="col-bottom-left card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">AI根因分析 &amp; 业务影响分析</div>
        <div class="analysis-block">
          <div class="analysis-subtitle">一、异常根因定位</div>
          <ul class="analysis-list">
            <li v-for="(item, i) in rootCauseList" :key="i">{{ item }}</li>
          </ul>
        </div>
        <div class="analysis-block">
          <div class="analysis-subtitle">二、业务影响评估</div>
          <ul class="analysis-list">
            <li v-for="(item, i) in impactList" :key="i">{{ item }}</li>
          </ul>
        </div>
      </div>

      <!-- 右侧：诊断&预测历史记录 -->
      <div ref="card6" class="col-bottom-right card-base">
        <div class="card-glow"></div>
        <span class="card-corner-inner"></span>
        <span class="card-corner-inner2"></span>
        <div class="card-title">设备诊断与预测历史日志</div>
        <div class="table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>检测时间</th>
                <th>CPU(%)</th>
                <th>内存(%)</th>
                <th>温度(℃)</th>
                <th>AI诊断结果</th>
                <th>AI预测结果</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in historyList" :key="i">
                <td>{{ row.time }}</td>
                <td>{{ row.cpu }}</td>
                <td>{{ row.mem }}</td>
                <td>{{ row.temp }}</td>
                <td>{{ row.diagnosis }}</td>
                <td>{{ row.predict }}</td>
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
import CountTo from 'vue-count-to'
import {
  getDeviceList,
  getDeviceLatestDetect,
  getDeviceTenMinutes,
  getDevicePredict
} from '@/api/deviceStatus'

/**
 * 诊断状态映射
 * 0:正常 1:轻度 2:中度 3:严重
 */
const ANOMALY_MAP = {
  0: {level: 'normal', text: '正常', nextText: '正常'},
  1: {level: 'mild', text: '轻度异常', nextText: '轻度异常'},
  2: {level: 'moderate', text: '中度异常', nextText: '中度异常'},
  3: {level: 'severe', text: '重度异常', nextText: '严重异常'}
}

export default {
  name: 'DeviceStatusAnalysis',
  components: {
    'vue-count-to': CountTo
  },
  data() {
    return {
      // 设备选择
      selectedDevice: null,
      deviceOptions: [],
      deviceList: [],

      // 实时状态
      cpuUsage: 0,
      memUsage: 0,
      temperature: 0,
      healthScore: 0,

      // 等级
      statusLevel: 'normal',
      statusText: '当前综合状态：正常',
      nextStatus: '正常',

      // 根因 & 影响
      rootCauseList: [],
      impactList: [],

      // 历史日志
      historyList: [],

      // 图表数据缓存
      anomalyChartData: {cpu: [], mem: [], time: []},
      predictChartData: {score: [], time: []},
      totalChartData: {cpu: [], mem: [], temp: [], time: []},

      // 图表实例
      anomalyChart: null,
      predictChart: null,
      totalChart: null,

      // 轮询定时器
      refreshTimer: null
    }
  },
  computed: {
    nextLevelColor() {
      const map = {
        正常: 'var(--color-success)',
        轻度异常: 'var(--color-warning)',
        中度异常: '#f97316',
        严重异常: 'var(--color-danger)'
      }
      return map[this.nextStatus] || 'var(--color-danger)'
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      setTimeout(() => this.handleResize(), 100)
    })
    this.fetchDeviceList().then(() => {
      this.fetchAllData()
    })
    this.refreshTimer = setInterval(() => {
      this.fetchAllData()
    }, 30000)
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.anomalyChart) this.anomalyChart.dispose()
    if (this.predictChart) this.predictChart.dispose()
    if (this.totalChart) this.totalChart.dispose()
    if (this._animTimeline) this._animTimeline.kill()
    if (this.refreshTimer) clearInterval(this.refreshTimer)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /* ================ 数据请求 ================ */

    /**
     * 获取设备列表（填充下拉框）
     */
    async fetchDeviceList() {
      try {
        const res = await getDeviceList()
        const list = res.data || []
        this.deviceList = list
        this.deviceOptions = list.map(d => ({
          value: String(d.SBID || d.sbid),
          label: d.SBXHMC || d.sbxhmc || `设备 ${d.PTMC || ''}`
        }))
        if (!this.selectedDevice && list.length > 0) {
          this.selectedDevice = String(list[0].SBID || list[0].sbid)
        }
      } catch (e) {
        console.error('获取设备列表失败', e)
        this.deviceOptions = [
          {value: '6', label: '服务器型号01'},
          {value: '7', label: '路由器型号01'}
        ]
        this.selectedDevice = '6'
      }
    },

    /**
     * 拉取全部数据（最新诊断 + 近10分钟 + 预测）
     */
    async fetchAllData() {
      if (!this.selectedDevice) return
      const sbid = Number(this.selectedDevice)

      try {
        const [latestRes, tenMinRes, predictRes] = await Promise.allSettled([
          getDeviceLatestDetect(sbid),
          getDeviceTenMinutes(sbid),
          getDevicePredict(sbid)
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

      this.cpuUsage = +(data.cpuAvg ?? 0).toFixed(1)
      this.memUsage = +(data.ramAvg ?? 0).toFixed(1)
      this.temperature = +(data.tempAvg ?? 0).toFixed(1)
      this.healthScore = +(data.healthScore ?? 0).toFixed(1)

      const status = data.anomalyStatus ?? 0
      const map = ANOMALY_MAP[status] || ANOMALY_MAP[0]
      this.statusLevel = map.level
      this.statusText = `当前综合状态：${map.text}`
      this.nextStatus = map.nextText

      this.rootCauseList = this.parseTextList(data.rootCauseList)
      this.impactList = this.parseBusinessImpact(data.businessImpact)
    },

    /**
     * 应用近10分钟诊断数据（异常诊断图 + 历史日志）
     */
    applyTenMinutesData(list) {
      if (!list || list.length === 0) return

      const slice = list.slice(-6)
      const cpuData = slice.map(d => +(d.cpuAvg ?? 0).toFixed(1))
      const memData = slice.map(d => +(d.ramAvg ?? 0).toFixed(1))
      const timeLabels = slice.map((d, i) => {
        if (i < slice.length - 1) return `${(slice.length - i) * 2}分钟前`
        return '当前'
      })

      this.anomalyChartData = {cpu: cpuData, mem: memData, time: timeLabels}
      this.updateAnomalyChart()

      const recent = list.slice(-20).reverse()
      this.historyList = recent.map(d => ({
        time: d.opTime || '',
        cpu: (d.cpuAvg ?? 0).toFixed(2),
        mem: (d.ramAvg ?? 0).toFixed(2),
        temp: (d.tempAvg ?? 0).toFixed(1),
        diagnosis: ANOMALY_MAP[d.anomalyStatus ?? 0]?.text || '未知',
        predict: '—'
      }))
    },

    /**
     * 应用预测数据（预测图 + 综合趋势图）
     */
    applyPredictData(list) {
      if (!list || list.length === 0) return

      const slice = list.slice(0, 6)
      const scoreData = slice.map(d => +(d.healthScore ?? 0).toFixed(1))
      const timeLabels = ['当前']
      for (let i = 1; i < slice.length; i++) {
        timeLabels.push(`+${i}分钟`)
      }

      this.predictChartData = {score: scoreData, time: timeLabels}
      this.updatePredictChart()

      const last = slice[slice.length - 1]
      if (last) {
        const status = last.predictStatus ?? 0
        this.nextStatus = ANOMALY_MAP[status]?.nextText || '正常'
      }

      const cpuT = slice.map(d => +(d.cpuAvg ?? 0).toFixed(1))
      const memT = slice.map(d => +(d.ramAvg ?? 0).toFixed(1))
      const tempT = slice.map(d => +(d.tempAvg ?? 0).toFixed(1))
      this.totalChartData = {
        cpu: cpuT,
        mem: memT,
        temp: tempT,
        time: timeLabels
      }
      this.updateTotalChart()
    },

    /**
     * 尝试将 Python 单引号格式字符串解析为 JS 对象
     * 支持: ['item1', 'item2'] 或 {'key': 'value'}
     */
    tryParseJSON(val) {
      if (typeof val !== 'string') return null
      // 先尝试标准 JSON 解析
      try {
        return JSON.parse(val)
      } catch {
        /* 非标准 JSON */
      }
      // 尝试将 Python 单引号替换为双引号
      try {
        const fixed = val.replace(/'/g, '"')
        return JSON.parse(fixed)
      } catch {
        /* 仍解析失败 */
      }
      return null
    },

    /**
     * 解析根因列表
     */
    parseTextList(val) {
      if (!val) return ['暂无数据']
      if (typeof val === 'string') {
        const parsed = this.tryParseJSON(val)
        if (parsed !== null) {
          if (Array.isArray(parsed)) return parsed
          return [String(parsed)]
        }
        return val.split('\n').filter(Boolean)
      }
      if (Array.isArray(val)) return val
      return [String(val)]
    },

    /**
     * 解析业务影响数据（对象格式）
     */
    parseBusinessImpact(val) {
      if (!val) return ['暂无业务影响数据']
      let obj = val
      if (typeof val === 'string') {
        const parsed = this.tryParseJSON(val)
        if (parsed !== null) {
          obj = parsed
        } else {
          return [val]
        }
      }
      if (Array.isArray(obj)) {
        return obj.length ? obj : ['暂无业务影响数据']
      }
      if (typeof obj === 'object' && obj !== null) {
        const labels = {
          shortTerm: '短期影响',
          mediumTerm: '中期影响',
          longTerm: '长期影响',
          relatedImpact: '关联影响'
        }
        const result = []
        const order = ['shortTerm', 'mediumTerm', 'longTerm', 'relatedImpact']
        order.forEach(key => {
          if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
            let text = obj[key]
            // 移除可能的前缀（如"短期："、"中期："等）
            text = text
              .replace(/^(短期[：:]|中期[：:]|长期[：:]|关联影响[：:])/g, '')
              .trim()
            result.push(`${labels[key]}：${text}`)
          }
        })
        return result.length ? result : ['暂无业务影响数据']
      }
      return [String(obj)]
    },

    /**
     * 根据指标类型和数值返回对应的颜色样式
     * cpu/mem: 使用率越高越差
     * temp: 温度越高越差
     */
    getValueColor(type, value) {
      const v = Number(value)
      let color
      if (type === 'cpu' || type === 'mem') {
        if (v <= 50) color = '#22c55e'
        else if (v <= 80) color = '#f59e0b'
        else color = '#ef4444'
      } else if (type === 'temp') {
        if (v <= 50) color = '#22c55e'
        else if (v <= 70) color = '#f59e0b'
        else color = '#ef4444'
      } else {
        color = 'var(--color-primary)'
      }
      return {color, textShadow: `0 0 20px ${color}55, 0 0 40px ${color}22`}
    },

    /* ================ 图表更新 ================ */

    updateAnomalyChart() {
      if (!this.anomalyChart) return
      this.anomalyChart.setOption({
        xAxis: {data: this.anomalyChartData.time},
        series: [
          {data: this.anomalyChartData.cpu},
          {data: this.anomalyChartData.mem}
        ]
      })
    },

    updatePredictChart() {
      if (!this.predictChart) return
      this.predictChart.setOption({
        xAxis: {data: this.predictChartData.time},
        series: [{data: this.predictChartData.score}]
      })
    },

    updateTotalChart() {
      if (!this.totalChart) return
      this.totalChart.setOption({
        xAxis: {data: this.totalChartData.time},
        series: [
          {data: this.totalChartData.cpu},
          {data: this.totalChartData.mem},
          {data: this.totalChartData.temp}
        ]
      })
    },

    /* ================ 窗口自适应 ================ */

    handleResize() {
      setTimeout(() => {
        if (this.anomalyChart) this.anomalyChart.resize()
        if (this.predictChart) this.predictChart.resize()
        if (this.totalChart) this.totalChart.resize()
      }, 50)
    },

    /* ================ 生命周期辅助 ================ */

    onDeviceChange() {
      this.$message.success(`已切换至设备，数据加载中...`)
      this.fetchAllData()
    },

    initCharts() {
      this.initAnomalyChart()
      this.initPredictChart()
      this.initTotalChart()
    },

    initAnomalyChart() {
      const el = this.$refs.anomalyChart
      if (!el) return
      this.anomalyChart = echarts.init(el, null, {renderer: 'canvas'})
      this.anomalyChart.setOption({
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
              const color =
                p.color || p.seriesName === 'CPU使用率' ? '#38bdf8' : '#22c55e'
              html += `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0;">`
              html += `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>`
              html += `<span style="font-weight:bold;color:#fff;">${p.value}%</span>`
              html += `</div>`
            })
            return html
          }
        },
        legend: {
          data: ['CPU使用率', '内存使用率'],
          textStyle: {color: '#e2e8f0', fontSize: 12}
        },
        grid: {left: '8%', right: '5%', top: '15%', bottom: '10%'},
        xAxis: {
          type: 'category',
          data: this.anomalyChartData.time,
          axisLabel: {color: '#94a3b8'},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {color: '#94a3b8', formatter: '{value}%'},
          splitLine: {lineStyle: {color: 'rgba(255,255,255,0.08)'}},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        series: [
          {
            name: 'CPU使用率',
            type: 'line',
            smooth: true,
            data: this.anomalyChartData.cpu,
            lineStyle: {color: '#38bdf8', width: 3},
            itemStyle: {color: '#38bdf8'},
            symbol: 'circle',
            symbolSize: 6
          },
          {
            name: '内存使用率',
            type: 'line',
            smooth: true,
            data: this.anomalyChartData.mem,
            lineStyle: {color: '#22c55e', width: 3},
            itemStyle: {color: '#22c55e'},
            symbol: 'circle',
            symbolSize: 6
          }
        ]
      })
    },

    initPredictChart() {
      const el = this.$refs.predictChart
      if (!el) return
      this.predictChart = echarts.init(el, null, {renderer: 'canvas'})
      this.predictChart.setOption({
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
              `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#8b5cf6;margin-right:6px;"></span>综合状态值</span>` +
              `<span style="font-weight:bold;color:#fff;">${p.value}</span>` +
              `</div>`
            )
          }
        },
        legend: {
          data: ['设备综合状态值'],
          textStyle: {color: '#e2e8f0', fontSize: 12}
        },
        grid: {left: '8%', right: '5%', top: '15%', bottom: '10%'},
        xAxis: {
          type: 'category',
          data: this.predictChartData.time,
          axisLabel: {color: '#94a3b8'},
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
            name: '设备综合状态值',
            type: 'line',
            smooth: true,
            data: this.predictChartData.score,
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
                  {offset: 0, color: 'rgba(139, 92, 246, 0.3)'},
                  {offset: 1, color: 'rgba(139, 92, 246, 0.02)'}
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
      const el = this.$refs.totalChart
      if (!el) return
      this.totalChart = echarts.init(el, null, {renderer: 'canvas'})
      this.totalChart.setOption({
        animation: true,
        animationDuration: 1000,
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
            const colorMap = {CPU: '#38bdf8', 内存: '#22c55e', 温度: '#f59e0b'}
            params.forEach(p => {
              const color = colorMap[p.seriesName] || '#38bdf8'
              const unit = p.seriesName === '温度' ? '℃' : '%'
              html += `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0;">`
              html += `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;"></span>${p.seriesName}</span>`
              html += `<span style="font-weight:bold;color:#fff;">${p.value}${unit}</span>`
              html += `</div>`
            })
            return html
          }
        },
        legend: {
          data: ['CPU', '内存', '温度'],
          textStyle: {color: '#e2e8f0', fontSize: 12}
        },
        grid: {left: '8%', right: '5%', top: '15%', bottom: '10%'},
        xAxis: {
          type: 'category',
          data: this.totalChartData.time,
          axisLabel: {color: '#94a3b8'},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: {color: '#94a3b8', formatter: '{value}'},
          splitLine: {lineStyle: {color: 'rgba(255,255,255,0.08)'}},
          axisLine: {show: false},
          axisTick: {show: false}
        },
        series: [
          {
            name: 'CPU',
            type: 'line',
            smooth: true,
            data: this.totalChartData.cpu,
            lineStyle: {color: '#38bdf8', width: 3},
            itemStyle: {color: '#38bdf8'},
            symbol: 'circle',
            symbolSize: 5
          },
          {
            name: '内存',
            type: 'line',
            smooth: true,
            data: this.totalChartData.mem,
            lineStyle: {color: '#22c55e', width: 3},
            itemStyle: {color: '#22c55e'},
            symbol: 'circle',
            symbolSize: 5
          },
          {
            name: '温度',
            type: 'line',
            smooth: true,
            data: this.totalChartData.temp,
            lineStyle: {color: '#f59e0b', width: 3},
            itemStyle: {color: '#f59e0b'},
            symbol: 'circle',
            symbolSize: 5
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
.device-select {
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
  overflow-y: auto;
  min-width: 0;
}
.col-bottom-left::-webkit-scrollbar {
  width: 3px;
}
.col-bottom-left::-webkit-scrollbar-thumb {
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
.tag-iso {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.2);
}
.tag-lstm {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.2);
}

/* ==================== 状态数值区（竖向排列） ==================== */
.status-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  gap: 6px;
}
.status-item {
  flex: 1;
  text-align: center;
  position: relative;
  padding: 8px 12px;
  border-radius: 4px;
  background: rgba(5, 11, 20, 0.4);
  border: 1px solid rgba(30, 41, 59, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}
.status-item:hover {
  background: rgba(5, 11, 20, 0.6);
  border-color: rgba(56, 189, 248, 0.2);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.05);
}
.status-icon {
  flex-shrink: 0;
  opacity: 0.9;
}
.status-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 0;
  letter-spacing: 0.3px;
  white-space: nowrap;
  text-align: left;
  flex: 1;
}
.status-value {
  font-size: 24px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  text-align: right;
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
.level-severe {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
}
.level-critical {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  box-shadow: 0 0 12px rgba(185, 28, 28, 0.3);
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
