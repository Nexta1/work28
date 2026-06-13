<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title"
          ><Icon icon="lucide:satellite" /> 性能监视处理</span
        >

        <div class="search-item">
          <label>平台名称</label>
          <el-input
            v-model="platformQueryParams.PTMC"
            @input="handlePlatformSearch"
            placeholder="输入平台名称..."
            size="small"
          />
        </div>

        <div class="search-item">
          <label>平台类型</label>
          <el-select
            v-model="platformQueryParams.PTLX"
            @change="handlePlatformSearch"
            size="small"
          >
            <el-option label="全部类型" :value="''"></el-option>
            <el-option
              v-for="(val, key) in platformTypeMap"
              :key="key"
              :label="val"
              :value="Number(key)"
            />
          </el-select>
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
        <el-button
          size="mini"
          icon="el-icon-document"
          class="event-query-btn"
          @click="eventDrawerVisible = true"
        >
          事件查询
        </el-button>
      </div>
    </div>

    <div class="top-dashboard-layout">
      <div class="stats-panel-box">
        <div class="stats-grid-matrix">
          <div class="stats-card">
            <span class="lbl">监控网络总数</span>
            <span class="val text-blue font-num"
              >{{ totalLinks }} <small>条</small></span
            >
          </div>
          <div class="stats-card">
            <span class="lbl">设备节点</span>
            <span class="val text-green font-num"
              >{{ deviceList.length }} <small>台</small></span
            >
          </div>
          <div class="stats-card">
            <span class="lbl">网络平均丢包率</span>
            <span class="val text-orange font-num">{{ avgDropRate }}%</span>
          </div>
          <div class="stats-card">
            <span class="lbl">异常告警</span>
            <span
              class="val font-num"
              :class="globalAlarmCount > 0 ? 'text-red' : 'text-gray'"
            >
              {{ globalAlarmCount }} <small>项</small>
            </span>
          </div>
        </div>
      </div>

      <div class="platform-horizontal-panel bg-center-radar">
        <div class="panel-inner-title">
          <span><Icon icon="lucide:compass" /> 检索平台时空航迹态势 </span>
          <span class="badge font-num text-orange animate-flash">实时监控</span>
        </div>

        <div class="horizontal-scroll-container" v-loading="loadingPlatform">
          <div v-if="platformList.length === 0" class="sub-empty-horizontal">
            未检索到匹配的平台实体航迹
          </div>

          <div
            v-for="pt in platformList"
            :key="pt.PTBSH"
            class="radar-track-horizontal-card"
            :class="{'is-active': activePlatformId === pt.PTBSH}"
            @click="activePlatformId = pt.PTBSH"
          >
            <div class="track-header-meta">
              <span class="pt-title"
                ><Icon icon="lucide:map-pin" />
                {{ pt.PTMC || '未知测控节点' }}</span
              >
              <span class="pt-bsh font-num">{{
                platformTypeMap[pt.PTLX] || '常规平台'
              }}</span>
            </div>

            <div class="track-grid-matrix">
              <div class="track-cell">
                <span class="label">当前经/纬度</span>
                <span class="value font-num text-blue"
                  >{{ pt.PTJD || '0.00' }}° / {{ pt.PTWD || '0.00' }}°</span
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
          </div>
        </div>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="monitor-column-panel width-28">
        <div class="panel-header-summary">
          <span class="title"
            ><Icon icon="lucide:settings" /> 设备端机集群监视</span
          >
          <span class="badge">数量: {{ deviceList.length }}</span>
        </div>

        <div class="sub-filter-bar">
          <el-input
            v-model="deviceFilterText"
            placeholder="过滤设备型号/名称..."
            size="small"
          />
        </div>

        <div class="scroll-container-box" v-loading="loadingDevice">
          <div v-if="filteredDevices.length === 0" class="sub-empty">
            当前未加载到设备端机
          </div>

          <div
            v-for="sb in filteredDevices"
            :key="sb.SBID"
            class="brief-glass-card"
            :class="[
              getDeviceStatusClass(sb.JKZT, sb.CPU),
              {'is-active': activeDeviceId === sb.SBID}
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
            </div>

            <div class="card-footer-info">
              <span><Icon icon="lucide:badge-info" /> ID: #{{ sb.SBID }}</span>
              <span :class="sb.TEMP > 75 ? 'text-red' : 'text-cyan'"
                ><Icon icon="lucide:thermometer" /> {{ sb.TEMP || 0 }}℃</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="monitor-column-panel width-34">
        <div class="panel-header-summary">
          <span class="title"
            ><Icon icon="lucide:bar-chart-3" /> 激活设备性能</span
          >
          <span class="badge font-num text-cyan" v-if="activeDeviceId"
            >ID: #{{ activeDeviceId }}</span
          >
        </div>
        <div class="center-chart-box">
          <div ref="perfLineChart" class="echart-container"></div>
        </div>
      </div>

      <div class="monitor-column-panel width-38">
        <div class="panel-header-summary">
          <span class="title"><Icon icon="lucide:satellite" /> 网络监控</span>
          <span class="badge font-num text-blue"
            >总计: {{ totalLinks }} 条</span
          >
        </div>

        <div class="network-inner-search-bar">
          <div class="search-grid">
            <el-input
              v-model="networkQueryParams.WLMC"
              @input="handleNetworkSearch"
              placeholder="搜索网络名称..."
              size="small"
            />
            <el-select
              v-model="networkQueryParams.JKZT"
              @change="handleNetworkSearch"
              size="small"
            >
              <el-option label="全部状态" :value="''"></el-option>
              <el-option label="正常" :value="'0'"></el-option>
              <el-option label="告警" :value="'1'"></el-option>
            </el-select>
            <el-select
              v-model="networkQueryParams.WLLX"
              @change="handleNetworkSearch"
              size="small"
            >
              <el-option label="全组网体制" :value="''"></el-option>
              <el-option
                v-for="(val, key) in networkTypeMap"
                :key="key"
                :label="val"
                :value="Number(key)"
              />
            </el-select>
          </div>
        </div>

        <div class="scroll-container-box" v-loading="loadingLink">
          <div v-if="linkList.length === 0" class="sub-empty">
            未检索到符合条件的网络遥测状态
          </div>

          <div
            v-for="link in linkList"
            :key="link.WLZTID"
            class="link-status-card enrichment-card"
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
                <span class="wl-name"
                  ><Icon icon="lucide:globe" /> {{ link.WLMC }}</span
                >
                <span class="wl-code font-num"
                  >网络号 (WLH): {{ link.WLH || '-' }}</span
                >
              </div>
              <div
                class="health-score-badge"
                :class="Number(link.JKZT) === 1 ? 'score-bad' : 'score-good'"
              >
                <span class="score-val">
                  <Icon
                    :icon="
                      Number(link.JKZT) === 1
                        ? 'lucide:alert-triangle'
                        : 'lucide:check-circle'
                    "
                  />
                  {{ Number(link.JKZT) === 1 ? '故障告警' : '稳健运行' }}
                </span>
              </div>
            </div>

            <div class="freq-range-bar">
              <span class="freq-label"
                ><Icon icon="lucide:satellite" /> 载波工作频段:</span
              >
              <span class="freq-value font-num text-cyan"
                >{{ link.PDXX || 0 }} ~ {{ link.PDSX || 0 }} MHz</span
              >
            </div>

            <div class="link-tech-spec">
              <span class="spec-label"
                ><Icon icon="lucide:settings" /> 组网体制组件:</span
              >
              <span class="spec-highlight text-blue">{{
                networkTypeMap[link.WLLX] || '未知体制方案'
              }}</span>
            </div>

            <div class="link-perf-grid">
              <div class="spec-cell">
                <label>规划总带宽</label>
                <span class="val font-num text-blue"
                  >{{ link.DK || 0 }} <small>Mbps</small></span
                >
              </div>
              <div class="spec-cell">
                <label>动态剩余带宽</label>
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
                <label>技术识别符</label>
                <span
                  class="val font-num text-gray ellipsis-text"
                  :title="link.WLZTID"
                  >#{{ link.WLZTID }}</span
                >
              </div>
            </div>

            <div class="link-card-bottom-bar">
              <span class="time font-num"
                ><Icon icon="lucide:clock" /> 传输索引号: #{{
                  link.WLZTID
                }}</span
              >
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
      title="网络运行状态遥测详情"
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

    <!-- 事件查询抽屉 -->
    <EventQueryDrawer
      :visible="eventDrawerVisible"
      page-title="性能监视"
      @close="eventDrawerVisible = false"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {getsbxxPage, getPlatformPage, getPlatformTypeMap} from '@/api/platform'
import {wllxMap} from '@/api/map'
import {wlzt} from '@/api/network'
import EventQueryDrawer from '../components/EventQueryDrawer.vue'

export default {
  name: 'LinkPerformanceMonitor',
  components: {
    EventQueryDrawer
  },
  data() {
    return {
      eventDrawerVisible: false,
      loadingDevice: false,
      loadingPlatform: false,
      loadingLink: false,
      pollingTimer: null,

      deviceList: [],
      platformList: [],
      linkList: [],
      totalLinks: 0,

      deviceFilterText: '',
      activeDeviceId: null,
      activePlatformId: null,
      activeLinkId: null,

      detailDialogVisible: false,
      activeLinkDetail: null,

      platformQueryParams: {PTMC: '', PTLX: ''},
      networkQueryParams: {WLMC: '', JKZT: '', WLLX: ''},

      pageConfig: {pageNum: 1, pageSize: 10},
      perfChartIns: null,
      chartHistory: {timeline: [], cpu: [], ram: [], temp: []},

      platformTypeMap: {},
      networkTypeMap: {}
    }
  },
  computed: {
    filteredDevices() {
      if (!this.deviceFilterText) return this.deviceList
      const txt = this.deviceFilterText.toLowerCase()
      return this.deviceList.filter(
        d =>
          (d.SBXHMC && d.SBXHMC.toLowerCase().includes(txt)) ||
          (d.SBID && String(d.SBID).includes(txt))
      )
    },
    // 前端根据当前轮询数据集动态统计全局网络及硬件指标
    globalAlarmCount() {
      const devAlarms = this.deviceList.filter(
        d => Number(d.JKZT) === 1 || d.CPU > 85
      ).length
      const linkAlarms = this.linkList.filter(l => Number(l.JKZT) === 1).length
      return devAlarms + linkAlarms
    },
    avgDropRate() {
      if (!this.linkList.length) return '0.00'
      const totalDrop = this.linkList.reduce(
        (acc, curr) => acc + (curr.DBL || 0),
        0
      )
      return ((totalDrop / this.linkList.length) * 100).toFixed(2)
    }
  },
  created() {
    this.masterWorkflowInit()
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
    async masterWorkflowInit() {
      this.loadingDevice = true
      this.loadingPlatform = true
      this.loadingLink = true
      await Promise.all([
        this.fetchPlatformPage(),
        this.fetchDevicePage(),
        this.fetchWlztPage(),
        this.fetchPlatformTypeMap(),
        this.fetchNetworkTypeMap()
      ])
      this.loadingDevice = false
      this.loadingPlatform = false
      this.loadingLink = false
    },
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
    async fetchDevicePage() {
      try {
        const res = await getsbxxPage({pageNum: 1, pageSize: 50, params: {}})
        this.deviceList = res?.rows || res?.data?.list || []
        if (this.deviceList.length > 0 && !this.activeDeviceId) {
          this.selectDevice(this.deviceList[0])
        }
      } catch (e) {
        console.warn('硬件外设扫描阻断')
      }
    },
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
    async fetchPlatformTypeMap() {
      try {
        const res = await getPlatformTypeMap()
        if (res?.data) {
          this.platformTypeMap = res.data
        }
      } catch (e) {
        console.warn('平台类型映射获取失败，使用默认值')
        this.platformTypeMap = {
          1: '地基节点',
          2: '海基舰艇',
          3: '空基战机',
          4: '天基卫星'
        }
      }
    },
    async fetchNetworkTypeMap() {
      try {
        const res = await wllxMap()
        if (res?.data) {
          this.networkTypeMap = res.data
        }
      } catch (e) {
        console.warn('网络类型映射获取失败，使用默认值')
        this.networkTypeMap = {
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
    selectDevice(sb) {
      this.activeDeviceId = sb.SBID
      this.chartHistory = {timeline: [], cpu: [], ram: [], temp: []}
      this.pushChartDataPoint(sb.CPU, sb.RAM, sb.TEMP)
    },
    async syncPollingWorkflow() {
      await Promise.all([
        this.fetchPlatformPage(),
        this.fetchDevicePage(),
        this.fetchWlztPage(),
        this.fetchPlatformTypeMap(),
        this.fetchNetworkTypeMap()
      ])
      if (this.activeDeviceId) {
        const curSb = this.deviceList.find(d => d.SBID === this.activeDeviceId)
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
   全新扁平重构可视化基础骨架 CSS
   ========================================================================== */
.screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px;
}

/* 顶层战略条件检索面板 */
.top-search-header {
  height: 48px;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 11px;
  flex-shrink: 0;
}
.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
  letter-spacing: 1px;
}
.search-flex {
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-item label {
  font-size: 11px;
  color: #52637a;
  white-space: nowrap;
}

.monitor-legend {
  display: flex;
  gap: 12px;
  align-items: center;
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
.event-query-btn {
  margin-left: 12px;
}

/* ==================== 上层横向平铺区 ==================== */
.top-dashboard-layout {
  display: flex;
  gap: 12px;
  height: 135px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.panel-inner-title {
  font-size: 11px;
  font-weight: bold;
  color: #38bdf8;
  margin-bottom: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 统计数据区样式 */
.stats-panel-box {
  width: 28%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 11px;
  box-sizing: border-box;
}
.stats-grid-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.stats-card {
  background: #0d1522;
  border: 1px solid #172438;
  padding: 6px 8px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stats-card .lbl {
  font-size: 11px;
  color: #52637a;
  margin-bottom: 1px;
}
.stats-card .val {
  font-size: 15px;
  font-weight: bold;
}
.stats-card .val small {
  font-size: 11px;
}

/* 平台实体横向滚动区 */
.platform-horizontal-panel {
  width: 72%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 11px;
  box-sizing: border-box;
}
.horizontal-scroll-container {
  display: flex;
  gap: 11px;
  overflow-x: auto;
  height: 92px;
  padding-bottom: 4px;
}
.horizontal-scroll-container::-webkit-scrollbar {
  height: 4px;
}
.horizontal-scroll-container::-webkit-scrollbar-thumb {
  background: #172438;
  border-radius: 2px;
}

.radar-track-horizontal-card {
  flex: 0 0 230px;
  background: #0c1424;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.radar-track-horizontal-card:hover,
.radar-track-horizontal-card.is-active {
  border-color: #06b6d4;
  background: #101b2e;
}
.track-header-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #172438;
  padding-bottom: 2px;
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
  padding: 0 4px;
  border-radius: 2px;
}
.track-grid-matrix {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}
.track-cell {
  background: #070c14;
  padding: 4px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
}
.track-cell .label {
  font-size: 8px;
  color: #415169;
  transform: scale(0.9);
}
.track-cell .value {
  font-size: 11px;
  font-weight: bold;
  margin-top: 1px;
  white-space: nowrap;
}

/* ==================== 下层中底部结构 ==================== */
.main-body-layout {
  display: flex;
  flex: 1;
  gap: 12px;
  height: calc(100% - 195px);
  min-height: 0;
}
.monitor-column-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 11px;
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
  margin-bottom: 8px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 4px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 11px;
  font-weight: bold;
  color: #38bdf8;
}
.panel-header-summary .badge {
  font-size: 11px;
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 11px;
}

.sub-filter-bar {
  margin-bottom: 6px;
  flex-shrink: 0;
}

.scroll-container-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* 设备卡片 */
.brief-glass-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #475569;
  padding: 6px 8px;
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
  color: #fff;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  max-width: 65%;
}
.card-title-bar .type-tag {
  font-size: 9px;
  color: #475569;
  background: #070c14;
  padding: 0 4px;
  border-radius: 2px;
}
.device-mini-metrics {
  margin: 4px 0;
}
.metric-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #52637a;
}
.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 62%;
}
.progress-wrapper .el-progress {
  flex: 1;
}
.progress-wrapper .val {
  min-width: 28px;
  text-align: right;
  color: #cbd5e1;
}
.card-footer-info {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #415169;
}

/* 图表区居中舱 */
.center-chart-box {
  flex: 1;
  background: #070c14;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.echart-container {
  flex: 1;
  width: 100%;
}

/* ==================== 右侧网络运行状态监控（重构强化） ==================== */
.network-inner-search-bar {
  background: #0b121f;
  border: 1px solid #15233a;
  padding: 6px;
  border-radius: 3px;
  margin-bottom: 6px;
  flex-shrink: 0;
}
.search-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr 1fr;
  gap: 4px;
}

.link-status-card.enrichment-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px 11px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  box-shadow: 0 0 4px #ef4444;
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
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.wl-code {
  font-size: 9px;
  color: #52637a;
}

.health-score-badge {
  background: #070c14;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid #1a293d;
}
.health-score-badge .score-val {
  font-size: 9px;
  font-weight: bold;
}

/* 频段和组网组件常驻样式 */
.freq-range-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #070c14;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px dashed #142235;
}
.freq-label {
  font-size: 9px;
  color: #415169;
}
.freq-value {
  font-size: 9px;
  font-weight: bold;
}

.link-tech-spec {
  font-size: 9px;
  display: flex;
  gap: 4px;
  align-items: center;
}
.link-tech-spec .spec-label {
  color: #415169;
}

/* 多维技术指标网格 */
.link-perf-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  background: #070c14;
  padding: 5px;
  border-radius: 3px;
}
.link-perf-grid .spec-cell {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
}
.link-perf-grid .spec-cell label {
  color: #415169;
}
.link-perf-grid .spec-cell .val {
  font-weight: bold;
}

.link-card-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed #142235;
  padding-top: 2px;
  margin-top: 2px;
}
.link-card-bottom-bar .time {
  font-size: 8px;
  color: #334155;
}
.detail-text-btn {
  font-size: 9px !important;
  color: #38bdf8 !important;
  padding: 0 !important;
}

/* 通用基础辅助 */
.bg-center-radar {
  background-image: radial-gradient(
    circle at 50% 20%,
    rgba(6, 182, 212, 0.04) 0%,
    transparent 75%
  );
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

.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #223147;
  padding: 20px;
  border: 1px dashed #111b2b;
}
.sub-empty-horizontal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 11px;
  color: #223147;
  border: 1px dashed #111b2b;
  height: 100%;
}

/* font-num */
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
  max-width: 80px;
  display: inline-block;
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

/* 弹出框深度覆写 */
::v-deep .dark-custom-dialog {
  background: #0c1424 !important;
  border: 1px solid #1a293d !important;
}
::v-deep .dark-custom-dialog .el-dialog__title {
  color: #38bdf8 !important;
  font-size: 11px;
  font-weight: bold;
}
.dialog-detail-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.detail-row {
  background: #070c14;
  padding: 4px 8px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.detail-row .lbl {
  font-size: 9px;
  color: #415169;
}
.detail-row .val {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
</style>
