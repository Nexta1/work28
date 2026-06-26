<template>
  <div class="analysis-page">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-title">
        设备状态智能监控诊断
        <span class="ai-badge">人工智能分析引擎</span>
      </div>
      <el-button
        size="mini"
        type="primary"
        :icon="dataRefreshing ? 'el-icon-loading' : 'el-icon-refresh'"
        :disabled="dataRefreshing"
        @click="fetchAllData"
        >刷新数据</el-button
      >
    </div>

    <div class="main-body">
      <!-- 左侧：设备列表 -->
      <div class="device-sidebar">
        <div class="sidebar-title">
          <Icon icon="lucide:list" :size="14" color="#38bdf8" />
          全部设备
          <span class="sidebar-count">({{ allDeviceList.length }})</span>
        </div>
        <el-scrollbar class="sidebar-scroll" style="height: 100%">
          <div
            v-infinite-scroll="loadMore"
            infinite-scroll-disabled="deviceLoading"
            infinite-scroll-distance="10"
          >
            <div
              v-for="d in deviceList"
              :key="d.SBID || d.sbid"
              class="device-card"
              :class="{
                'is-active': selectedDevice === String(d.SBID || d.sbid)
              }"
              @click="selectDevice(d)"
            >
              <div class="device-card-header">
                <span class="status-dot" :class="getMiniStatusClass(d)"></span>
                <span class="device-name">{{
                  d.SBXHMC || d.sbxhmc || '未知设备'
                }}</span>
                <span class="device-type">{{ getDeviceTypeName(d.SBLX) }}</span>
              </div>
              <div class="device-card-metrics">
                <span
                  class="metric"
                  :class="(d.CPU || 0) > 80 ? 'text-red' : 'text-green'"
                >
                  CPU {{ d.CPU || 0 }}%
                </span>
                <span class="metric text-blue"> MEM {{ d.RAM || 0 }}% </span>
                <span
                  class="metric"
                  :class="(d.TEMP || 0) > 75 ? 'text-red' : ''"
                >
                  {{ d.TEMP || 0 }}℃
                </span>
              </div>
            </div>
          </div>
          <div v-if="deviceLoading" class="load-more-tip">加载更多...</div>
          <div
            v-if="
              deviceList.length >= allDeviceList.length &&
              allDeviceList.length > 0
            "
            class="load-more-tip"
          >
            — 已全部加载 —
          </div>
        </el-scrollbar>
      </div>

      <!-- 右侧：详细面板 -->
      <div class="detail-panel">
        <!-- 上排 四大核心模块 -->
        <div ref="rowTop" class="row-top">
          <!-- 模块1：实时运行状态 -->
          <div ref="card1" class="col-top card-base">
            <div class="card-glow"></div>
            <span class="card-corner-inner"></span>
            <span class="card-corner-inner2"></span>
            <div class="card-title">设备实时运行状态</div>
            <div class="status-wrap" :class="{'data-pulse': dataRefreshing}">
              <div class="status-item">
                <Icon
                  icon="lucide:cpu"
                  :size="20"
                  color="#38bdf8"
                  class="status-icon"
                />
                <div class="status-label">CPU 平均使用率</div>
                <div
                  class="status-value"
                  :style="getValueColor('cpu', cpuUsage)"
                >
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
                <div
                  class="status-value"
                  :style="getValueColor('mem', memUsage)"
                >
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
              <div class="status-item">
                <Icon
                  icon="lucide:heart-pulse"
                  :size="20"
                  color="#8b5cf6"
                  class="status-icon"
                />
                <div class="status-label">设备健康得分</div>
                <div class="status-value" style="color: #8b5cf6">
                  <vue-count-to
                    :start-val="0"
                    :end-val="healthScore"
                    :duration="2000"
                    :decimals="1"
                    separator=""
                  /><span class="status-unit">分</span>
                </div>
              </div>
            </div>
            <div class="level-box">
              <span class="level-tag" :class="'level-' + statusLevel">{{
                statusText
              }}</span>
            </div>
          </div>

          <!-- 模块2：全维趋势总览（过去·现在·未来） -->
          <div ref="cardMerged" class="col-top card-base col-merg-chart">
            <div class="card-glow"></div>
            <span class="card-corner-inner"></span>
            <span class="card-corner-inner2"></span>
            <div class="card-title">
              全维趋势总览
              <span
                class="model-tag"
                style="background: linear-gradient(135deg, #f59e0b, #d97706)"
                >孤立森林</span
              >
              <span
                class="model-tag"
                style="background: linear-gradient(135deg, #8b5cf6, #7c3aed)"
                >LSTM时序网络</span
              >
            </div>
            <div class="chart-container">
              <div ref="mergedChart" class="chart-canvas"></div>
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
            <div class="card-title">
              AI根因分析 &amp; 业务影响分析
              <span
                v-if="deviceFaultList.length"
                class="model-tag"
                style="
                  background: linear-gradient(135deg, #ef4444, #dc2626);
                  font-size: 9px;
                "
              >
                故障 {{ deviceFaultList.length }} 条
              </span>
            </div>
            <div class="analysis-split-layout">
              <div class="analysis-split-left">
                <div class="analysis-subtitle">最近故障记录</div>
                <ul class="analysis-list">
                  <li v-for="(item, i) in faultRecordList" :key="i">
                    {{ item }}
                  </li>
                  <li v-if="!deviceFaultList.length" style="color: #64748b">
                    暂无故障记录
                  </li>
                </ul>
              </div>
              <div class="analysis-split-right">
                <div class="analysis-block">
                  <div class="analysis-subtitle">异常根因定位</div>
                  <ul class="analysis-list">
                    <li v-for="(item, i) in rootCauseList" :key="i">
                      {{ item }}
                    </li>
                  </ul>
                </div>
                <div class="analysis-block">
                  <div class="analysis-subtitle">业务影响评估</div>
                  <ul class="analysis-list">
                    <li v-for="(item, i) in impactList" :key="i">{{ item }}</li>
                  </ul>
                </div>
              </div>
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
import {mainPage} from '@/api/common'

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
      deviceList: [],
      allDeviceList: [],
      devicePage: 1,
      pageSize: 20,
      deviceLoading: false,

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
      deviceFaultList: [],

      // 历史日志
      historyList: [],

      // 图表数据缓存
      mergedChartData: {
        time: [],
        cpuReal: [],
        memReal: [],
        tempReal: [],
        scoreReal: [],
        cpuPred: [],
        memPred: [],
        tempPred: [],
        scorePred: [],
        anomalyMark: []
      },
      cachedPast: null,
      cachedFuture: null,

      // 图表实例
      mergedChart: null,

      // 轮询定时器
      refreshTimer: null,
      dataRefreshing: false
    }
  },
  computed: {
    faultRecordList() {
      return this.deviceFaultList
        .slice(0, 6)
        .map(
          f =>
            `${this.formatFaultTime(f.warnTimestamp)} │ [${this.getLevelLabel(f.warnLevel)}] ${f.faultName || '未知'}：${f.warnContent || ''}`
        )
    },
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
      this.initMergedChart()
      setTimeout(() => this.handleResize(), 100)
    })
    this.fetchDeviceList().then(() => {
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
    if (this._animTimeline) this._animTimeline.kill()
    if (this.refreshTimer) clearInterval(this.refreshTimer)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /* ================ 设备选择 ================ */

    selectDevice(d) {
      const id = String(d.SBID || d.sbid)
      if (this.selectedDevice === id) return
      this.selectedDevice = id
      this.$message.success(
        `已切换至 ${d.SBXHMC || d.sbxhmc || '设备'}，数据加载中...`
      )
      this.fetchAllData()
    },

    getDeviceTypeName(t) {
      return (
        {1: '计算核心', 2: '存储矩阵', 3: '通信路由', 4: '供电伺服'}[t] ||
        '通用硬件'
      )
    },

    getMiniStatusClass(d) {
      if (Number(d.JKZT) === 1 || (d.CPU || 0) > 85) return 'dot-danger'
      if ((d.CPU || 0) > 70) return 'dot-warning'
      return 'dot-success'
    },

    checkRouteQuery() {
      const qDeviceId = this.$route.query.deviceId
      if (qDeviceId) {
        const match = this.deviceList.find(
          d => String(d.SBID || d.sbid) === qDeviceId
        )
        if (match) {
          this.selectedDevice = qDeviceId
          this.$nextTick(() => this.fetchAllData())
          return true
        }
        // 可能在 allDeviceList 中
        const matchAll = this.allDeviceList.find(
          d => String(d.SBID || d.sbid) === qDeviceId
        )
        if (matchAll) {
          this.selectedDevice = qDeviceId
          this.deviceList = this.allDeviceList.slice(0, this.pageSize)
          this.$nextTick(() => this.fetchAllData())
          return true
        }
      }
      return false
    },

    /* ================ 数据请求 ================ */

    /**
     * 获取设备列表（填充下拉框）
     */
    async fetchDeviceList() {
      try {
        const res = await getDeviceList()
        this.allDeviceList = res.data || []
        this.devicePage = 1
        this.deviceList = this.allDeviceList.slice(0, this.pageSize)
        if (!this.selectedDevice && this.deviceList.length > 0) {
          this.selectedDevice = String(
            this.deviceList[0].SBID || this.deviceList[0].sbid
          )
        }
      } catch (e) {
        console.error('获取设备列表失败', e)
        this.allDeviceList = [
          {
            SBID: 6,
            SBXHMC: '服务器型号01',
            SBLX: 1,
            CPU: 32,
            RAM: 45,
            TEMP: 42
          },
          {SBID: 7, SBXHMC: '路由器型号01', SBLX: 3, CPU: 18, RAM: 35, TEMP: 38}
        ]
        this.deviceList = this.allDeviceList.slice(0, this.pageSize)
        this.selectedDevice = '6'
      }
    },

    loadMore() {
      if (this.deviceLoading) return
      if (this.deviceList.length >= this.allDeviceList.length) return
      this.deviceLoading = true
      this.devicePage++
      const end = this.devicePage * this.pageSize
      this.deviceList = this.allDeviceList.slice(0, end)
      this.deviceLoading = false
    },

    /**
     * 拉取全部数据（最新诊断 + 近10分钟 + 预测）
     */
    async fetchAllData() {
      if (!this.selectedDevice) return
      this.dataRefreshing = true
      const sbid = Number(this.selectedDevice)

      try {
        const [latestRes, tenMinRes, predictRes, warnRes] =
          await Promise.allSettled([
            getDeviceLatestDetect(sbid),
            getDeviceTenMinutes(sbid),
            getDevicePredict(sbid),
            mainPage('warnInfo', {
              pageNum: 1,
              pageSize: 10,
              deviceId: sbid
            })
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
        if (warnRes.status === 'fulfilled') {
          this.applyWarnData(warnRes.value)
        }
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
      this.cachedPast = {
        time: slice.map((d, i) =>
          i < slice.length - 1 ? `${(slice.length - i) * 2}分钟前` : '当前'
        ),
        timestamps: slice.map(d => d.opTime || d.warnTimestamp || null),
        cpu: slice.map(d => +(d.cpuAvg ?? 0).toFixed(1)),
        mem: slice.map(d => +(d.ramAvg ?? 0).toFixed(1)),
        temp: slice.map(d => +(d.tempAvg ?? 0).toFixed(1)),
        score: slice.map(d => +(d.healthScore ?? 0).toFixed(1)),
        anomaly: slice.map(d => d.anomalyStatus ?? 0)
      }
      this.buildMergedChartData()

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
     * 应用预测数据
     */
    applyPredictData(list) {
      if (!list || list.length === 0) return

      const slice = list.slice(0, 6)
      this.cachedFuture = {
        time: slice.map((d, i) => (i === 0 ? '当前' : `+${i}分钟`)),
        cpu: slice.map(d => +(d.cpuAvg ?? 0).toFixed(1)),
        mem: slice.map(d => +(d.ramAvg ?? 0).toFixed(1)),
        temp: slice.map(d => +(d.tempAvg ?? 0).toFixed(1)),
        score: slice.map(d => +(d.healthScore ?? 0).toFixed(1))
      }
      this.buildMergedChartData()

      const last = slice[slice.length - 1]
      if (last) {
        const status = last.predictStatus ?? 0
        this.nextStatus = ANOMALY_MAP[status]?.nextText || '正常'
      }
    },

    /**
     * 应用告警数据：匹配当前设备的最新50条故障记录
     */
    applyWarnData(res) {
      const list = res?.data?.list || res?.list || res?.data || []
      this.deviceFaultList = list.slice(0, 50)

      // 更新图表故障标记（不覆盖右侧 AI 根因分析）
      this.buildFaultMarkers(list)
    },

    getLevelLabel(lvl) {
      const maps = {0: '无', 1: '一般', 2: '中度', 3: '严重'}
      return maps[lvl] !== undefined ? maps[lvl] : '未知'
    },

    formatFaultTime(ts) {
      if (!ts) return '--'
      const d = new Date(Number(ts))
      const Y = d.getFullYear()
      const M = (d.getMonth() + 1).toString().padStart(2, '0')
      const D = d.getDate().toString().padStart(2, '0')
      const h = d.getHours().toString().padStart(2, '0')
      const m = d.getMinutes().toString().padStart(2, '0')
      return `${Y}-${M}-${D} ${h}:${m}`
    },

    formatShortTime(ts) {
      if (!ts) return ''
      const d = new Date(Number(ts))
      const h = d.getHours().toString().padStart(2, '0')
      const m = d.getMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    },

    buildFaultMarkers(list) {
      const past = this.cachedPast
      if (!past || !past.time) return

      const len = (this.mergedChartData.time || past.time).length
      const anomalyMark = new Array(len).fill(null)

      // 取最近10分钟内的告警全部显示在图表上
      const now = Date.now()
      const recent = list
        .filter(f => {
          if ((f.warnLevel || 0) < 1) return false
          const t = Number(f.warnTimestamp)
          if (!t) return false
          const ts = t < 1e12 ? t * 1000 : t
          return now - ts < 600000 // 10分钟内
        })
        .slice(0, 8)

      // 按告警时间与当前时间的差值，映射到时间轴对应槽位
      const sorted = recent
        .filter(f => {
          const t = Number(f.warnTimestamp)
          if (!t) return false
          const ft = t < 1e12 ? t * 1000 : t
          const minAgo = (now - ft) / 60000
          return minAgo >= -1 && minAgo <= 10
        })
        .sort((a, b) => {
          const ta = Number(a.warnTimestamp) || 0
          const tb = Number(b.warnTimestamp) || 0
          return ta - tb
        })
      sorted.forEach(f => {
        const t = Number(f.warnTimestamp)
        const ft = t < 1e12 ? t * 1000 : t
        const minAgo = (now - ft) / 60000
        // 将分钟差值映射到11个槽位（10分钟前=0，当前=5，+5分钟=10）
        const slot = Math.min(Math.max(Math.floor((10 - minAgo) / 2), 0), 10)
        const content = f.warnContent || f.faultName || '故障'
        if (anomalyMark[slot]) {
          anomalyMark[slot].warnContent += ` | ${content}`
          anomalyMark[slot].count = (anomalyMark[slot].count || 1) + 1
        } else {
          anomalyMark[slot] = {
            value: 95,
            warnContent: content,
            faultTime: this.formatShortTime(ft),
            count: 1
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

      // 合并时间轴：过去去掉重复"当前"
      const time = [...past.time.slice(0, -1), ...future.time]
      const cpuReal = [...past.cpu.slice(0, -1), past.cpu[past.cpu.length - 1]]
      const memReal = [...past.mem.slice(0, -1), past.mem[past.mem.length - 1]]
      const tempReal = [
        ...past.temp.slice(0, -1),
        past.temp[past.temp.length - 1]
      ]
      const scoreReal = [
        ...past.score.slice(0, -1),
        past.score[past.score.length - 1]
      ]
      // 预测从"当前"后开始（当前值用实测值），其余填 null
      const pad = (arr, len) => {
        const result = new Array(len).fill(null)
        for (let i = 1; i < arr.length; i++)
          result[len - arr.length + i] = arr[i]
        return result
      }
      const cpuPred = pad(future.cpu, time.length)
      const memPred = pad(future.mem, time.length)
      const tempPred = pad(future.temp, time.length)
      const scorePred = pad(future.score, time.length)
      // 在"当前"位置填入实测值以便连续
      const curIdx = time.length - future.time.length
      cpuPred[curIdx] = past.cpu[past.cpu.length - 1]
      memPred[curIdx] = past.mem[past.mem.length - 1]
      tempPred[curIdx] = past.temp[past.temp.length - 1]
      scorePred[curIdx] = past.score[past.score.length - 1]

      // 故障标记由 applyWarnData/buildFaultMarkers 独立更新
      const anomalyMark = this.mergedChartData.anomalyMark?.length
        ? this.mergedChartData.anomalyMark
        : new Array(time.length).fill(null)

      this.mergedChartData = {
        time,
        cpuReal,
        memReal,
        tempReal,
        scoreReal,
        cpuPred,
        memPred,
        tempPred,
        scorePred,
        anomalyMark
      }
      this.updateMergedChart()
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

    updateMergedChart() {
      if (!this.mergedChart) return
      const d = this.mergedChartData
      if (!d.time.length) return
      this.mergedChart.setOption({
        xAxis: {data: d.time},
        series: [
          {data: d.cpuReal},
          {data: d.memReal},
          {data: d.tempReal},
          {data: d.scoreReal},
          {data: d.cpuPred},
          {data: d.memPred},
          {data: d.tempPred},
          {data: d.scorePred},
          {data: d.anomalyMark}
        ]
      })
    },

    /* ================ 窗口自适应 ================ */

    handleResize() {
      setTimeout(() => {
        if (this.mergedChart) this.mergedChart.resize()
      }, 50)
    },

    /* ================ 生命周期辅助 ================ */

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
              const color = p.color || '#38bdf8'
              let val = p.value
              let unit = '%'
              if (p.seriesName === '故障信号') {
                val = p.data?.warnContent || '故障'
                unit = ''
              } else {
                if (p.seriesName && p.seriesName.includes('温度')) unit = '℃'
                if (p.seriesName && p.seriesName.includes('状态分')) unit = '分'
              }
              html +=
                `<div style="display:flex;justify-content:space-between;gap:20px;padding:2px 0;">` +
                `<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;"></span>${p.seriesName}</span>` +
                `<span style="font-weight:bold;color:#fff;">${val}${unit}</span></div>`
            })
            return html
          }
        },
        legend: {
          data: [
            {name: 'CPU实测', icon: 'circle'},
            {name: 'MEM实测', icon: 'circle'},
            {name: '温度实测', icon: 'circle'},
            {name: '状态分实测', icon: 'circle'},
            {name: 'CPU预测', icon: 'diamond'},
            {name: 'MEM预测', icon: 'diamond'},
            {name: '温度预测', icon: 'diamond'},
            {name: '状态分预测', icon: 'diamond'},
            {name: '故障信号', icon: 'circle'}
          ],
          textStyle: {color: '#e2e8f0', fontSize: 10},
          bottom: 0
        },
        grid: {left: '6%', right: '8%', top: '10%', bottom: '18%'},
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
            min: 0,
            max: 100,
            position: 'left',
            name: '(%)',
            nameTextStyle: {color: '#64748b', fontSize: 9},
            axisLabel: {color: '#94a3b8', fontSize: 9, formatter: '{value}'},
            splitLine: {lineStyle: {color: 'rgba(255,255,255,0.06)'}},
            axisLine: {show: false},
            axisTick: {show: false}
          },
          {
            type: 'value',
            min: 0,
            max: 100,
            position: 'right',
            name: '(分)',
            nameTextStyle: {color: '#64748b', fontSize: 9},
            axisLabel: {color: '#a78bfa', fontSize: 9, formatter: '{value}'},
            splitLine: {show: false},
            axisLine: {show: false},
            axisTick: {show: false}
          }
        ],
        series: [
          {
            name: 'CPU实测',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: [],
            lineStyle: {color: '#38bdf8', width: 2},
            itemStyle: {color: '#38bdf8'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: 'MEM实测',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: [],
            lineStyle: {color: '#22c55e', width: 2},
            itemStyle: {color: '#22c55e'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: '温度实测',
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
            name: '状态分实测',
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            data: [],
            lineStyle: {color: '#8b5cf6', width: 2},
            itemStyle: {color: '#8b5cf6'},
            symbol: 'circle',
            symbolSize: 4
          },
          {
            name: 'CPU预测',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: [],
            lineStyle: {color: '#38bdf8', width: 2, type: 'dashed'},
            itemStyle: {color: '#38bdf8'},
            symbol: 'diamond',
            symbolSize: 4
          },
          {
            name: 'MEM预测',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: [],
            lineStyle: {color: '#22c55e', width: 2, type: 'dashed'},
            itemStyle: {color: '#22c55e'},
            symbol: 'diamond',
            symbolSize: 4
          },
          {
            name: '温度预测',
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            data: [],
            lineStyle: {color: '#f59e0b', width: 2, type: 'dashed'},
            itemStyle: {color: '#f59e0b'},
            symbol: 'diamond',
            symbolSize: 4
          },
          {
            name: '状态分预测',
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
            yAxisIndex: 0,
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
  /* box-shadow: 0 0 12px rgba(56, 189, 248, 0.25); */
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

/* 左侧设备列表 */
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
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-success {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}
.dot-warning {
  background: #f59e0b;
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.4);
}
.dot-danger {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
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
.device-type {
  font-size: 9px;
  color: #64748b;
  background: rgba(30, 41, 59, 0.5);
  padding: 1px 6px;
  border-radius: 3px;
  flex-shrink: 0;
}
.device-card-metrics {
  display: flex;
  gap: 8px;
  font-size: 10px;
  padding-left: 13px;
}
.device-card-metrics .metric {
  font-variant-numeric: tabular-nums;
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
.col-merg-chart {
  flex: 3;
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
