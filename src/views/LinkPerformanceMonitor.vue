<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">🛰️ 战术平台检索调度</span>

        <div class="search-item">
          <label>平台名称</label>
          <input
            type="text"
            v-model="platformQueryParams.PTMC"
            @input="handlePlatformSearch"
            placeholder="输入平台名称（如：战斗机）..."
            class="global-input"
          />
        </div>

        <div class="search-item">
          <label>平台类型</label>
          <select
            v-model="platformQueryParams.PTLX"
            @change="handlePlatformSearch"
            class="global-select"
          >
            <option value="">全部类型</option>
            <option
              v-for="(val, key) in platformTypeMap"
              :key="key"
              :value="Number(key)"
            >
              {{ val }}
            </option>
          </select>
        </div>
      </div>

      <div class="monitor-legend">
        <div class="legend-node">
          <span class="dot bg-running"></span>正常运行
        </div>
        <div class="legend-node"><span class="dot bg-busy"></span>高能负载</div>
        <div class="legend-node">
          <span class="dot bg-fault"></span>故障告警
        </div>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="monitor-column-panel width-28">
        <div class="panel-header-summary">
          <span class="title">⚙️ 物理外设硬件集群监视</span>
          <span class="badge">数量: {{ deviceList.length }}</span>
        </div>

        <div class="sub-filter-bar">
          <input
            type="text"
            v-model="deviceFilterText"
            placeholder="过滤当前设备型号/名称..."
            class="mini-input"
          />
        </div>

        <div class="scroll-container-box" v-loading="loadingDevice">
          <div v-if="filteredDevices.length === 0" class="sub-empty">
            当前未加载到物理外设硬件
          </div>

          <div
            v-for="sb in filteredDevices"
            :key="sb.SBXXID"
            class="brief-glass-card"
            :class="[
              getDeviceStatusClass(sb.JKZT, sb.CPU),
              {'is-active': activeDeviceId === sb.SBXXID}
            ]"
            @click="selectDevice(sb)"
          >
            <div class="card-title-bar">
              <span class="name-text" :title="sb.SBXHMC">{{
                sb.SBXHMC || '物理网元硬件'
              }}</span>
              <span class="type-tag">{{ getDeviceTypeName(sb.SBLX) }}</span>
            </div>

            <div class="device-mini-metrics">
              <div class="metric-block">
                <label>算力内核 (CPU)</label>
                <div class="progress-wrapper">
                  <el-progress
                    :percentage="Math.floor(sb.CPU || 0)"
                    :status="sb.CPU > 80 ? 'exception' : 'success'"
                    :stroke-width="3"
                    :show-text="false"
                  />
                  <span
                    class="val font-num"
                    :class="sb.CPU > 80 ? 'text-red' : ''"
                    >{{ sb.CPU || 0 }}%</span
                  >
                </div>
              </div>
              <div class="metric-block">
                <label>缓冲内存 (RAM)</label>
                <div class="progress-wrapper">
                  <el-progress
                    :percentage="Math.floor(sb.RAM || 0)"
                    color="#3b82f6"
                    :stroke-width="3"
                    :show-text="false"
                  />
                  <span class="val font-num text-blue">{{ sb.RAM || 0 }}%</span>
                </div>
              </div>
            </div>

            <div class="card-footer-info">
              <span>🆔 设备信息ID: #{{ sb.SBXXID }}</span>
              <span :class="sb.TEMP > 75 ? 'text-red' : 'text-cyan'"
                >🌡️ 核温 {{ sb.TEMP || 0 }}℃</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="monitor-column-panel width-34 bg-center-radar">
        <div class="panel-header-summary">
          <span class="title">🧭 检索平台时空航迹态势</span>
          <span class="badge font-num text-orange animate-flash"
            >LIVE SYNC</span
          >
        </div>

        <div class="scroll-container-box flex-half" v-loading="loadingPlatform">
          <div v-if="platformList.length === 0" class="sub-empty">
            未检索到匹配的平台实体航迹
          </div>

          <div
            v-for="pt in platformList"
            :key="pt.PTBSH"
            class="radar-track-dashboard"
            :class="{'is-active': activePlatformId === pt.PTBSH}"
            @click="activePlatformId = pt.PTBSH"
          >
            <div class="track-header-meta">
              <span class="pt-title">📍 {{ pt.PTMC || '未知测控节点' }}</span>
              <span class="pt-bsh font-num">{{
                platformTypeMap[pt.PTLX] || '常规平台'
              }}</span>
            </div>

            <div class="track-grid-matrix">
              <div class="track-cell">
                <span class="label">当前经度</span>
                <span class="value font-num text-blue"
                  >{{ pt.PTJD || '0.00000' }} °</span
                >
              </div>
              <div class="track-cell">
                <span class="label">当前纬度</span>
                <span class="value font-num text-blue"
                  >{{ pt.PTWD || '0.00000' }} °</span
                >
              </div>
              <div class="track-cell">
                <span class="label">测地高度</span>
                <span class="value font-num text-green"
                  >{{ pt.PTGD || 0 }} m</span
                >
              </div>
              <div class="track-cell">
                <span class="label">矢量速度</span>
                <span class="value font-num text-orange"
                  >{{ pt.PTSD || 0 }} km/h</span
                >
              </div>
            </div>

            <div class="track-timestamp">
              <span
                >⏳ 原子时元:
                <span class="font-num text-gray">{{
                  pt.PTSJ || '-'
                }}</span></span
              >
              <span class="font-num text-blue">#{{ pt.PTBSH }}</span>
            </div>
          </div>
        </div>

        <div class="center-chart-box">
          <div class="chart-header-title">
            📊 激活硬件外设性能特征历史演进图谱
          </div>
          <div ref="perfLineChart" class="echart-container"></div>
        </div>
      </div>

      <div class="monitor-column-panel width-38">
        <div class="panel-header-summary">
          <span class="title">📡 链网动态运行状态监控 (`wlzt`)</span>
          <span class="badge font-num text-blue"
            >总计: {{ totalLinks }} 条</span
          >
        </div>

        <div class="network-inner-search-bar">
          <div class="search-grid">
            <input
              type="text"
              v-model="networkQueryParams.WLMC"
              @input="handleNetworkSearch"
              placeholder="搜索网络名称..."
              class="inner-input"
            />
            <select
              v-model="networkQueryParams.JKZT"
              @change="handleNetworkSearch"
              class="inner-select"
            >
              <option value="">全部健康状态</option>
              <option value="0">🟢 正常健康</option>
              <option value="1">🔴 故障告警</option>
            </select>
            <select
              v-model="networkQueryParams.WLLX"
              @change="handleNetworkSearch"
              class="inner-select"
            >
              <option value="">全组网体制</option>
              <option
                v-for="(val, key) in networkTypeMap"
                :key="key"
                :value="Number(key)"
              >
                {{ val }}
              </option>
            </select>
          </div>
        </div>

        <div class="scroll-container-box" v-loading="loadingLink">
          <div v-if="linkList.length === 0" class="sub-empty">
            未检索到符合条件的网络遥测状态
          </div>

          <div
            v-for="link in linkList"
            :key="link.WLZTID"
            class="link-status-card"
            :class="[
              getNetworkStatusClass(link.JKZT),
              {'is-active': activeLinkId === link.WLZTID}
            ]"
            @click="activeLinkId = link.WLZTID"
          >
            <div
              class="alarm-strip"
              :class="
                Number(link.JKZT) === 1
                  ? 'strip-level-crit'
                  : 'strip-level-safe'
              "
            ></div>

            <div class="link-card-top">
              <div class="wl-meta">
                <span class="wl-name">🌐 {{ link.WLMC }}</span>
                <span class="wl-code font-num"
                  >网络号 (WLH): {{ link.WLH || '-' }}</span
                >
              </div>
              <div
                class="health-score-badge"
                :class="Number(link.JKZT) === 1 ? 'score-bad' : 'score-good'"
              >
                <span class="score-val">{{
                  Number(link.JKZT) === 1 ? '⚠️ 告警' : '✔ 稳健'
                }}</span>
              </div>
            </div>

            <div class="freq-range-bar">
              <span class="freq-label">📡 工作频段范围:</span>
              <span class="freq-value font-num text-cyan"
                >{{ link.PDXX || 0 }} ~ {{ link.PDSX || 0 }} MHz</span
              >
            </div>

            <div class="link-tech-spec">
              🛠️ 组网体制组件：<span class="spec-highlight">{{
                networkTypeMap[link.WLLX] || '未知体制组件'
              }}</span>
            </div>

            <div class="link-perf-grid">
              <div class="spec-cell">
                <label>总带宽(最小)</label>
                <span class="val font-num text-blue"
                  >{{ link.DK || 0 }} <small>Mbps</small></span
                >
              </div>
              <div class="spec-cell">
                <label>剩余带宽</label>
                <span
                  class="val font-num"
                  :class="
                    (link.SYDK || 0) < (link.DK || 1) * 0.2
                      ? 'text-red'
                      : 'text-green'
                  "
                >
                  {{ link.SYDK || 0 }} <small>Mbps</small>
                </span>
              </div>
              <div class="spec-cell">
                <label>实时丢包率</label>
                <span
                  class="val font-num"
                  :class="(link.DBL || 0) > 0.05 ? 'text-red' : 'text-orange'"
                >
                  {{ ((link.DBL || 0) * 100).toFixed(2) }}%
                </span>
              </div>
              <div class="spec-cell">
                <label>状态标识符</label>
                <span
                  class="val font-num text-gray ellipsis-text"
                  :title="link.WLZTID"
                  >{{ link.WLZTID }}</span
                >
              </div>
            </div>

            <div class="link-card-bottom-bar">
              <span class="time font-num">⏳ 索引: #{{ link.WLZTID }}</span>
              <el-button
                type="text"
                class="detail-text-btn"
                @click.stop="showLinkDetailDialog(link)"
                >遥测详情 ＞</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      title="📡 网络运行状态遥测详情"
      :visible.sync="detailDialogVisible"
      width="520px"
      custom-class="dark-custom-dialog"
      append-to-body
    >
      <div v-if="activeLinkDetail" class="dialog-detail-matrix">
        <div class="detail-row">
          <span class="lbl">网络状态标识 (WLZTID):</span
          ><span class="val font-num text-blue">{{
            activeLinkDetail.WLZTID
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">网络名称 (WLMC):</span
          ><span class="val text-white">{{ activeLinkDetail.WLMC }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">网络号 (WLH):</span
          ><span class="val font-num text-cyan">{{
            activeLinkDetail.WLH
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">网络组网类型 (WLLX):</span
          ><span class="val text-green">{{
            networkTypeMap[activeLinkDetail.WLLX]
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">工作频段下限 (PDXX):</span
          ><span class="val font-num text-orange"
            >{{ activeLinkDetail.PDXX }} MHz</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">工作频段上限 (PDSX):</span
          ><span class="val font-num text-orange"
            >{{ activeLinkDetail.PDSX }} MHz</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">最小规划总带宽 (DK):</span
          ><span class="val font-num text-blue"
            >{{ activeLinkDetail.DK }} Mbps</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">动态剩余带宽 (SYDK):</span
          ><span class="val font-num text-green"
            >{{ activeLinkDetail.SYDK }} Mbps</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">最大容许丢包率 (DBL):</span
          ><span class="val font-num text-red"
            >{{ ((activeLinkDetail.DBL || 0) * 100).toFixed(3) }} %</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">健康遥测状态 (JKZT):</span>
          <span class="val">
            <el-tag
              size="mini"
              :type="Number(activeLinkDetail.JKZT) === 1 ? 'danger' : 'success'"
            >
              {{
                Number(activeLinkDetail.JKZT) === 1
                  ? '故障告警 (1)'
                  : '正常健康 (0)'
              }}
            </el-tag>
          </span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {getsbxxPage, getPlatformPage, wlzt} from '@/api/platform'

export default {
  name: 'LinkPerformanceMonitor',
  data() {
    return {
      loadingDevice: false,
      loadingPlatform: false,
      loadingLink: false,
      pollingTimer: null, // 15秒统一高阶轮询时钟

      // 数据源相互独立，不再共享深度穿透参数
      deviceList: [],
      platformList: [],
      linkList: [],
      totalLinks: 0,

      deviceFilterText: '',
      activeDeviceId: null, // 绑定 SBXXID
      activePlatformId: null,
      activeLinkId: null,

      detailDialogVisible: false,
      activeLinkDetail: null,

      // 顶部平台专属查询参数
      platformQueryParams: {
        PTMC: '',
        PTLX: ''
      },
      // 右侧网络专属查询参数
      networkQueryParams: {
        WLMC: '',
        JKZT: '',
        WLLX: ''
      },

      pageConfig: {pageNum: 1, pageSize: 10},
      perfChartIns: null,
      chartHistory: {timeline: [], cpu: [], ram: [], temp: []},

      platformTypeMap: {
        1: '地基节点',
        2: '海基舰艇',
        3: '空基战机',
        4: '天基卫星'
      },
      networkTypeMap: {
        1: '地基接入数据链组件',
        2: '天基信息直接入链星弹数据链组件',
        3: '天基侦察信息分发数据链组件',
        4: '天基接入数据链专用组件',
        5: '宽频段混合组网数据链组件',
        6: '视距/超视距一体化组网数据链组件',
        7: '全向低时延数据链组件',
        8: '定向低时延数据链组件',
        9: '低成本短距离导弹控制数据链组件',
        10: '高频段高带宽数据链组件',
        11: '激光频射一体化数据链组件',
        12: '波形动态调整体制组件',
        13: '波形在线定义体制组件'
      }
    }
  },
  computed: {
    // 过滤设备列表（基于 SBXXID 和型号名称进行检索）
    filteredDevices() {
      if (!this.deviceFilterText) return this.deviceList
      const txt = this.deviceFilterText.toLowerCase()
      return this.deviceList.filter(
        d =>
          (d.SBXHMC && d.SBXHMC.toLowerCase().includes(txt)) ||
          (d.SBXXID && String(d.SBXXID).includes(txt))
      )
    }
  },
  created() {
    this.masterWorkflowInit()
    // 【变更核心】：合并三大系统的数据请求，严格执行 15000ms（15秒）统一轮询一次
    this.pollingTimer = setInterval(() => {
      this.syncPollingWorkflow()
    }, 15000)
  },
  mounted() {
    this.initPerformanceChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    if (this.pollingTimer) clearInterval(this.pollingTimer)
    window.removeEventListener('resize', this.resizeChart)
    if (this.perfChartIns) this.perfChartIns.dispose()
  },
  methods: {
    /**
     * 各大板块首次初始化独立加载
     */
    async masterWorkflowInit() {
      this.loadingDevice = true
      this.loadingPlatform = true
      this.loadingLink = true

      await Promise.all([
        this.fetchPlatformPage(),
        this.fetchDevicePage(),
        this.fetchWlztPage()
      ])

      this.loadingDevice = false
      this.loadingPlatform = false
      this.loadingLink = false
    },

    /**
     * 1. 平台数据集抓取
     */
    async fetchPlatformPage() {
      try {
        const payload = {
          pageNum: this.pageConfig.pageNum,
          pageSize: this.pageConfig.pageSize,
          params: {
            PTMC: this.platformQueryParams.PTMC || undefined,
            PTLX:
              this.platformQueryParams.PTLX !== ''
                ? this.platformQueryParams.PTLX
                : undefined
          }
        }
        const res = await getPlatformPage(payload)
        this.platformList = res?.rows || res?.data?.list || []

        if (this.platformList.length > 0 && !this.activePlatformId) {
          this.activePlatformId = this.platformList[0].PTBSH
        }
      } catch (e) {
        console.warn('时空平台调度链路受限')
      }
    },

    /**
     * 2. 物理层集群抓取（ZYXH 已升级为 SBXXID）
     */
    async fetchDevicePage() {
      try {
        const res = await getsbxxPage({pageNum: 1, pageSize: 50, params: {}})
        this.deviceList = res?.rows || res?.data?.list || []
        if (this.deviceList.length > 0 && !this.activeDeviceId) {
          this.selectDevice(this.deviceList[0])
        }
      } catch (e) {
        console.warn('硬件外设总线扫描阻断')
      }
    },

    /**
     * 3. wlzt 网络数据集抓取
     */
    async fetchWlztPage() {
      try {
        const payload = {
          pageNum: this.pageConfig.pageNum,
          pageSize: this.pageConfig.pageSize,
          params: {
            WLMC: this.networkQueryParams.WLMC || undefined,
            JKZT:
              this.networkQueryParams.JKZT !== ''
                ? Number(this.networkQueryParams.JKZT)
                : undefined,
            WLLX:
              this.networkQueryParams.WLLX !== ''
                ? Number(this.networkQueryParams.WLLX)
                : undefined
          }
        }
        const res = await wlzt(payload)
        this.linkList = res?.rows || res?.data?.list || []
        this.totalLinks = res?.total || this.linkList.length
      } catch (e) {
        console.error('WLZT 调度中心遥测解析异常：', e)
      }
    },

    /**
     * 独立点击：激活当前设备信息ID，填充下层 ECharts 指标
     */
    selectDevice(sb) {
      this.activeDeviceId = sb.SBXXID
      this.chartHistory = {timeline: [], cpu: [], ram: [], temp: []}
      this.pushChartDataPoint(sb.CPU, sb.RAM, sb.TEMP)
    },

    /**
     * 【15秒高集成、全静默轮询管道】
     * 彻底对齐客户要求：15秒对三大独立核心实体进行一次性并发轮询更新
     */
    async syncPollingWorkflow() {
      console.log('--- [15秒战术周期同步启动] 并行触发全量基础数据遥测任务 ---')

      // 三路接口并发无缝提取，互不级联干扰
      await Promise.all([
        this.fetchPlatformPage(),
        this.fetchDevicePage(),
        this.fetchWlztPage()
      ])

      // 增量为当前高亮的激活物理硬件压入图表演进点
      if (this.activeDeviceId) {
        const curSb = this.deviceList.find(
          d => d.SBXXID === this.activeDeviceId
        )
        if (curSb) {
          this.pushChartDataPoint(curSb.CPU, curSb.RAM, curSb.TEMP)
        }
      }
    },

    handlePlatformSearch() {
      this.fetchPlatformPage()
    },
    handleNetworkSearch() {
      this.fetchWlztPage()
    },
    pushChartDataPoint(cpu, ram, temp) {
      const timeStr = new Date().toLocaleTimeString('zh-CN', {hour12: false})
      this.chartHistory.timeline.push(timeStr)
      this.chartHistory.cpu.push(cpu || 0)
      this.chartHistory.ram.push(ram || 0)
      this.chartHistory.temp.push(temp || 0)

      if (this.chartHistory.timeline.length > 12) {
        this.chartHistory.timeline.shift()
        this.chartHistory.cpu.shift()
        this.chartHistory.ram.shift()
        this.chartHistory.temp.shift()
      }
      this.renderPerformanceChart()
    },
    initPerformanceChart() {
      this.perfChartIns = echarts.init(this.$refs.perfLineChart, 'dark')
      this.renderPerformanceChart()
    },
    renderPerformanceChart() {
      if (!this.perfChartIns) return
      this.perfChartIns.setOption(
        {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#070c14',
            borderColor: '#172438',
            textStyle: {color: '#cbd5e1', fontSize: 10}
          },
          legend: {
            data: ['内核算力 (CPU)', '内存吞吐 (RAM)', '芯片热能 (TEMP)'],
            textStyle: {color: '#64748b', fontSize: 10},
            bottom: 0,
            icon: 'rect'
          },
          grid: {top: 20, bottom: 45, left: 35, right: 15},
          xAxis: {
            type: 'category',
            data: this.chartHistory.timeline,
            axisLine: {lineStyle: {color: '#111b2b'}},
            axisLabel: {fontSize: 9, color: '#475569'}
          },
          yAxis: {
            type: 'value',
            min: 0,
            max: 100,
            splitLine: {lineStyle: {color: '#111b2b'}},
            axisLabel: {fontSize: 9}
          },
          series: [
            {
              name: '内核算力 (CPU)',
              data: this.chartHistory.cpu,
              type: 'line',
              smooth: true,
              itemStyle: {color: '#10b981'},
              showSymbol: false
            },
            {
              name: '内存吞吐 (RAM)',
              data: this.chartHistory.ram,
              type: 'line',
              smooth: true,
              itemStyle: {color: '#3b82f6'},
              showSymbol: false
            },
            {
              name: '芯片热能 (TEMP)',
              data: this.chartHistory.temp,
              type: 'line',
              smooth: true,
              itemStyle: {color: '#ef4444'},
              showSymbol: false
            }
          ]
        },
        false
      )
    },
    showLinkDetailDialog(link) {
      this.activeLinkDetail = link
      this.detailDialogVisible = true
    },
    resizeChart() {
      if (this.perfChartIns) this.perfChartIns.resize()
    },
    getDeviceStatusClass(jkzt, cpu) {
      if (Number(jkzt) === 1 || cpu > 85) return 'status-fault'
      return 'status-running'
    },
    getDeviceTypeName(t) {
      return (
        {1: '计算核心', 2: '存储矩阵', 3: '通信路由', 4: '供电伺服'}[t] ||
        '通用硬件'
      )
    },
    getNetworkStatusClass(jkzt) {
      return Number(jkzt) === 1 ? 'lvl-crit' : 'lvl-safe'
    }
  }
}
</script>

<style scoped>
/* ==========================================================================
   全解耦战术大屏 CSS 骨架样式
   ========================================================================== */
.screen-container {
  width: 100%;
  height: 100vh;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 14px;
}

/* 顶层战略条件检索面板 */
.top-search-header {
  height: 52px;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
  letter-spacing: 1px;
  margin-right: 8px;
}
.search-flex {
  display: flex;
  align-items: center;
  gap: 18px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-item label {
  font-size: 11px;
  color: #52637a;
  font-weight: bold;
  white-space: nowrap;
}

.global-input {
  background: #0d1522;
  border: 1px solid #1e3557;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 11px;
  width: 200px;
  outline: none;
}
.global-select {
  background: #0d1522;
  border: 1px solid #1e3557;
  color: #38bdf8;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 11px;
  width: 130px;
  outline: none;
}

/* 状态图例 */
.monitor-legend {
  display: flex;
  gap: 12px;
}
.legend-node {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #7c8ba1;
}
.legend-node .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.bg-running {
  background: #10b981;
}
.bg-busy {
  background: #f59e0b;
}
.bg-fault {
  background: #ef4444;
}

/* 主体分栏骨架 */
.main-body-layout {
  display: flex;
  flex: 1;
  gap: 14px;
  height: calc(100% - 64px);
  min-height: 0;
}

.monitor-column-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  min-height: 0;
}
.width-28 {
  width: 28%;
}
.width-34 {
  width: 34%;
}
.width-38 {
  width: 38%;
}

.panel-header-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 6px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 11px;
  font-weight: bold;
  color: #38bdf8;
}
.panel-header-summary .badge {
  font-size: 10px;
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 10px;
  font-family: monospace;
}

.sub-filter-bar {
  margin-bottom: 8px;
  flex-shrink: 0;
}
.mini-input {
  width: 100%;
  background: #070c14;
  border: 1px solid #172438;
  color: #cbd5e1;
  padding: 5px 8px;
  border-radius: 3px;
  font-size: 10px;
  outline: none;
}

/* 右侧网络专属内嵌式检索组件 */
.network-inner-search-bar {
  background: #0b121f;
  border: 1px solid #15233a;
  padding: 8px;
  border-radius: 3px;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.search-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 6px;
}
.inner-input,
.inner-select {
  background: #070c14;
  border: 1px solid #1a293d;
  color: #fff;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.inner-select {
  color: #8a99ad;
}

/* 独立容器滚动槽 */
.scroll-container-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
}
.scroll-container-box.flex-half {
  flex: 0.55;
  margin-bottom: 10px;
}
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: #172438;
  border-radius: 2px;
}

/* ==================== 设备层卡片 ==================== */
.brief-glass-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #475569;
  padding: 8px 10px;
  border-radius: 3px;
  cursor: pointer;
}
.brief-glass-card:hover,
.brief-glass-card.is-active {
  background: #121f35;
  border-color: #38bdf8;
}
.card-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-title-bar .name-text {
  font-size: 11px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}
.card-title-bar .type-tag {
  font-size: 9px;
  color: #475569;
  background: #070c14;
  padding: 0px 4px;
  border-radius: 2px;
}
.device-mini-metrics {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 6px 0;
}
.metric-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  color: #52637a;
}
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 68%;
}
.progress-wrapper .el-progress {
  flex: 1;
}
.progress-wrapper .val {
  min-width: 30px;
  text-align: right;
  color: #cbd5e1;
}
.card-footer-info {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #415169;
  font-family: monospace;
}

/* ==================== 平台航迹卡片 (中栏) ==================== */
.bg-center-radar {
  background-image: radial-gradient(
    circle at 50% 20%,
    rgba(6, 182, 212, 0.04) 0%,
    transparent 75%
  );
}
.radar-track-dashboard {
  background: #0c1424;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.radar-track-dashboard:hover,
.radar-track-dashboard.is-active {
  border-color: #06b6d4;
  background: #101b2e;
}
.track-header-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  border-bottom: 1px solid #172438;
  padding-bottom: 4px;
}
.track-header-meta .pt-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.track-header-meta .pt-bsh {
  font-size: 9px;
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 4px;
  border-radius: 2px;
}
.track-grid-matrix {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}
.track-cell {
  background: #070c14;
  padding: 4px 6px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
}
.track-cell .label {
  font-size: 8px;
  color: #415169;
  scale: 0.9;
}
.track-cell .value {
  font-size: 11px;
  font-weight: bold;
  margin-top: 1px;
}
.track-timestamp {
  margin-top: 5px;
  font-size: 9px;
  color: #415169;
  display: flex;
  justify-content: space-between;
}

/* 中央演进图表舱 */
.center-chart-box {
  flex: 1;
  background: #070c14;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chart-header-title {
  font-size: 11px;
  color: #52637a;
  font-weight: bold;
  margin-bottom: 4px;
}
.echart-container {
  flex: 1;
  width: 100%;
}

/* ==================== 网络状态卡片 (右栏) ==================== */
.link-status-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 10px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.link-status-card:hover,
.link-status-card.is-active {
  background: #111d30;
  border-color: #1f375c;
}
.alarm-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.strip-level-safe {
  background: #10b981;
}
.strip-level-crit {
  background: #ef4444;
  box-shadow: 0 0 6px #ef4444;
}

.link-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.wl-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.wl-name {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.wl-code {
  font-size: 10px;
  color: #415169;
}

.health-score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #070c14;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #172438;
}
.health-score-badge .score-val {
  font-size: 10px;
  font-weight: bold;
}

.freq-range-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #070c14;
  padding: 3px 6px;
  border-radius: 3px;
  margin: 5px 0;
  border: 1px dashed #142235;
}
.freq-label {
  font-size: 10px;
  color: #52637a;
}
.freq-value {
  font-size: 10px;
  font-weight: bold;
}

.link-tech-spec {
  font-size: 10px;
  color: #415169;
  margin-bottom: 4px;
}
.spec-highlight {
  color: #cbd5e1;
}

.link-perf-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  background: #070c14;
  padding: 6px;
  border-radius: 2px;
}
.spec-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
}
.spec-cell label {
  color: #415169;
}
.spec-cell .val {
  font-weight: bold;
}

.link-card-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}
.link-card-bottom-bar .time {
  font-size: 9px;
  color: #334155;
}
.detail-text-btn {
  font-size: 10px !important;
  color: #38bdf8 !important;
  padding: 0 !important;
}

/* ==================== 弹出视窗定制 ==================== */
::v-deep .dark-custom-dialog {
  background: #0c1424 !important;
  border: 1px solid #1a293d !important;
}
::v-deep .dark-custom-dialog .el-dialog__title {
  color: #38bdf8 !important;
  font-size: 12px;
  font-weight: bold;
}
.dialog-detail-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.detail-row {
  background: #070c14;
  padding: 6px 10px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-row .lbl {
  font-size: 10px;
  color: #415169;
}
.detail-row .val {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.status-running {
  border-left-color: #10b981 !important;
}
.status-fault {
  border-left-color: #ef4444 !important;
  border-color: rgba(239, 68, 68, 0.2);
}

.score-good {
  border-color: #10b981;
}
.score-good .score-val {
  color: #10b981;
}
.score-bad {
  border-color: #ef4444;
}
.score-bad .score-val {
  color: #ef4444;
}

.lvl-crit {
  border-color: rgba(239, 68, 68, 0.2);
}
.lvl-safe {
}

.sub-empty {
  text-align: center;
  font-size: 10px;
  color: #223147;
  padding: 25px;
  border: 1px dashed #111b2b;
}

@keyframes flash {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
.animate-flash {
  animation: flash 1.5s infinite ease-in-out;
}

.font-num {
  font-family: monospace;
}
.text-blue {
  color: #38bdf8 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-red {
  color: #ef4444 !important;
}
.text-gray {
  color: #415169 !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 85px;
  display: inline-block;
}
</style>
