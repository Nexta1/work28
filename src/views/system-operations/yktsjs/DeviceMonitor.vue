<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <div class="search-item">
          <label>平台检索</label>
          <el-input
            v-model="queryParams.PTMC"
            @input="handleSearch"
            placeholder="输入平台名称..."
            size="small"
          />
        </div>
        <div class="search-item">
          <label>平台类型</label>
          <el-select
            v-model="queryParams.PTLX"
            @change="handleSearch"
            size="small"
          >
            <el-option label="全部类型" :value="''"></el-option>
            <el-option
              v-for="(val, key) in platformTypeMap"
              :key="key"
              :label="val"
              :value="key"
            />
          </el-select>
        </div>
      </div>

      <div class="monitor-legend">
        <div class="legend-group">
          <span class="group-label">健康状态：</span>
          <div class="legend-node">
            <span class="dot bg-jk-running"></span>运行
          </div>
          <div class="legend-node">
            <span class="dot bg-jk-offline"></span>未运行
          </div>
          <div class="legend-node">
            <span class="dot bg-jk-fault"></span>故障
          </div>
        </div>
        <div class="legend-divider"></div>
        <div class="legend-group">
          <span class="group-label">资源状态：</span>
          <div class="legend-node">
            <span class="dot bg-zy-free"></span>空闲
          </div>
          <div class="legend-node">
            <span class="dot bg-zy-busy"></span>占用
          </div>
        </div>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-platform-sidebar">
        <div class="sidebar-header-summary">
          <span class="title">
            <Icon icon="mdi:shield" size="14px" /> 受控平台
          </span>
          <span class="total-badge">总数: {{ totalPlatforms }} 条</span>
        </div>

        <div
          class="platform-scroll-list"
          ref="scrollContainer"
          @scroll="handleListScroll"
          v-loading="loadingLeft"
        >
          <div
            v-for="pt in platformList"
            :key="pt.PTXXID"
            class="platform-brief-card"
            :class="[
              getJkStatusClass(pt.JKZT),
              getZyStatusClass(pt.ZYZYZT),
              {'is-active': activePtId === pt.PTXXID},
              {'data-bounce': pt._bounce}
            ]"
            @click="selectPlatform(pt)"
          >
            <div class="card-top">
              <span class="pt-name" :title="pt.PTMC">{{ pt.PTMC }}</span>
              <div class="status-tags-box">
                <span
                  class="mini-status-tag"
                  :class="getJkStatusClass(pt.JKZT)"
                >
                  {{ jkztMap[pt.JKZT] || '未知' }}
                </span>
                <span
                  class="mini-status-tag"
                  :class="getZyStatusClass(pt.ZYZYZT)"
                >
                  {{ zyzyztMap[pt.ZYZYZT] || '未知' }}
                </span>
              </div>
            </div>
            <div class="card-sub-info">
              <span class="bsh-txt">#{{ pt.PTBSH || '未标号' }}</span>
              <span class="pt-type-tag">{{
                platformTypeMap[pt.PTLX] || '平台'
              }}</span>
            </div>
            <div class="brief-dynamics">
              <span>
                <Icon icon="mdi:navigation" size="11px" />
                {{ pt.PTHX || 0 }}°
              </span>
              <span>
                <Icon icon="mdi:lightning-bolt" size="11px" />
                {{ pt.PTSD || 0 }}k/h
              </span>
            </div>
            <div v-if="Number(pt.JKZT) === 2" class="alarm-flash-dot"></div>
          </div>

          <div class="scroll-loading-tip" v-if="pageConfig.pageNum >= 15">
            <Icon icon="mdi:alert-outline" size="11px" style="color: #f59e0b" />
            已锁死最大加载上限 (15页)
          </div>
          <div
            class="scroll-loading-tip"
            v-else-if="
              platformList.length >= totalPlatforms && totalPlatforms > 0
            "
          >
            已加载全部平台
          </div>
          <div class="scroll-loading-tip" v-else-if="loadingMore">
            <Icon icon="mdi:clock-outline" size="11px" style="color: #38bdf8" />
            正在同步下一页态势...
          </div>
        </div>
      </div>

      <div class="right-cascade-panel" v-loading="loadingRight">
        <div v-if="!activePtId" class="empty-fallback">
          <div class="radar-scan-loader"></div>
          <p>请在左侧检索列表中选择要调阅的靶向受控平台...</p>
        </div>

        <div v-show="activePtId" class="cascade-content-wrapper">
          <div class="detail-param-dashboard" v-if="selectedPlatform">
            <div class="panel-inner-title-flex">
              <div class="panel-inner-title">
                <Icon icon="mdi:satellite" size="14px" style="color: #38bdf8" />
                当前靶向：{{ selectedPlatform.PTMC }} ({{
                  selectedPlatform.PTXXID
                }})
              </div>
              <div class="main-status-display">
                <span class="status-indicator">
                  健康:
                  <strong :class="getJkTextClass(selectedPlatform.JKZT)">{{
                    jkztMap[selectedPlatform.JKZT]
                  }}</strong>
                </span>
                <span class="status-indicator">
                  资源:
                  <strong :class="getZyTextClass(selectedPlatform.ZYZYZT)">{{
                    zyzyztMap[selectedPlatform.ZYZYZT]
                  }}</strong>
                </span>
              </div>
            </div>
            <div class="params-matrix">
              <div class="matrix-item">
                <label>经度 (PTJD)</label
                ><span class="val text-blue"
                  >{{ selectedPlatform.PTJD || '0.00' }}°</span
                >
              </div>
              <div class="matrix-item">
                <label>纬度 (PTWD)</label
                ><span class="val text-blue"
                  >{{ selectedPlatform.PTWD || '0.00' }}°</span
                >
              </div>
              <div class="matrix-item">
                <label>高度 (PTGD)</label
                ><span class="val text-green font-num"
                  >{{ selectedPlatform.PTGD || 0 }} m</span
                >
              </div>
              <div class="matrix-item">
                <label>速度 (PTSD)</label
                ><span class="val text-orange font-num"
                  >{{ selectedPlatform.PTSD || 0 }} km/h</span
                >
              </div>
              <div class="matrix-item">
                <label>俯仰/横滚</label
                ><span class="val text-cyan"
                  >{{ selectedPlatform.PTFY || 0 }}° /
                  {{ selectedPlatform.PTHG || 0 }}°</span
                >
              </div>
              <div class="matrix-item">
                <label>同步时间 (PTSJ)</label
                ><span class="val font-num text-gray">{{
                  selectedPlatform.PTSJ || '-'
                }}</span>
              </div>
            </div>

            <div class="platform-status-summary-bar">
              <div class="summary-label">
                <Icon icon="mdi:chart-bar" size="12px" style="color: #38bdf8" />
                挂载资产状态审计：
              </div>
              <div class="summary-indicators">
                <div class="indicator-item text-green">
                  <span class="status-dot jk-dot-running"></span>
                  健康/运行：<span class="count-num">{{
                    statusStatistics.jkRunning
                  }}</span>
                </div>
                <div class="indicator-item text-gray">
                  <span class="status-dot jk-dot-offline"></span>
                  未运行：<span class="count-num">{{
                    statusStatistics.jkOffline
                  }}</span>
                </div>
                <div class="indicator-item text-red">
                  <span class="status-dot jk-dot-fault"></span>
                  故障：<span class="count-num">{{
                    statusStatistics.jkFault
                  }}</span>
                </div>
                <div class="indicator-divider">|</div>
                <div class="indicator-item text-cyan">
                  <span class="status-dot zy-dot-free"></span>
                  资源空闲：<span class="count-num">{{
                    statusStatistics.zyFree
                  }}</span>
                </div>
                <div class="indicator-item text-orange">
                  <span class="status-dot zy-dot-busy"></span>
                  资源占用：<span class="count-num">{{
                    statusStatistics.zyBusy
                  }}</span>
                </div>
                <div class="indicator-item text-blue">
                  <Icon icon="mdi:package-variant-closed" size="12px" />
                  总计：<span class="count-num">{{
                    statusStatistics.total
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sub-fluid-layout">
            <div class="matrix-column">
              <div class="column-title">
                <Icon
                  icon="mdi:crosshairs"
                  size="12px"
                  style="color: #ef4444"
                />
                挂载武器矩阵 (全量 {{ weaponList.length }})
              </div>
              <div class="matrix-scroll-box">
                <div v-if="weaponList.length === 0" class="sub-empty">
                  该平台未检测到挂载武器系统
                </div>
                <div
                  v-for="wq in weaponList"
                  :key="wq.ZYXH"
                  class="monitor-node node-weapon"
                  :class="[
                    getJkStatusClass(wq.JKZT),
                    getZyStatusClass(wq.ZYZYZT),
                    {'data-bounce': wq._bounce}
                  ]"
                >
                  <div class="double-dots-container">
                    <span
                      class="card-status-dot"
                      :class="getJkDotClass(wq.JKZT)"
                      title="健康状态"
                    ></span>
                    <span
                      class="card-status-dot"
                      :class="getZyDotClass(wq.ZYZYZT)"
                      title="资源状态"
                    ></span>
                  </div>

                  <div class="node-name-bar">{{ wq.WQXHMC }}</div>
                  <div class="detail-grid">
                    <div>
                      基数:
                      <span class="bounce-num highlight-orange">{{
                        wq.GZSL || 0
                      }}</span>
                    </div>
                    <div>
                      类型: <span>{{ getWeaponType(wq.WQLX) }}</span>
                    </div>
                    <div>
                      打击范围: <span>{{ wq.DJFW || 0 }}km</span>
                    </div>
                    <div>
                      打击精度: <span>{{ wq.DJJD || 0 }}km</span>
                    </div>
                    <div class="full-col">
                      成功率:
                      <el-progress
                        :percentage="Math.floor((wq.DJCGL || 0) * 100)"
                        color="#10b981"
                        :stroke-width="3"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="matrix-column">
              <div class="column-title">
                <Icon icon="mdi:radar" size="12px" style="color: #06b6d4" />
                边缘传感器网络 (全量 {{ sensorList.length }})
              </div>
              <div class="matrix-scroll-box">
                <div v-if="sensorList.length === 0" class="sub-empty">
                  该平台未检测到传感器节点
                </div>
                <div
                  v-for="cg in sensorList"
                  :key="cg.ZYXH"
                  class="monitor-node node-sensor"
                  :class="[
                    getJkStatusClass(cg.JKZT),
                    getZyStatusClass(cg.ZYZYZT),
                    {'data-bounce': cg._bounce}
                  ]"
                >
                  <div class="double-dots-container">
                    <span
                      class="card-status-dot"
                      :class="getJkDotClass(cg.JKZT)"
                      title="健康状态"
                    ></span>
                    <span
                      class="card-status-dot"
                      :class="getZyDotClass(cg.ZYZYZT)"
                      title="资源状态"
                    ></span>
                  </div>

                  <div class="node-name-bar">
                    {{ cg.CGQMC || '未知传感器点' }}
                  </div>
                  <div class="detail-grid">
                    <div>
                      探测半径:
                      <span class="bounce-num highlight-blue"
                        >{{ cg.TCFW || 0 }}km</span
                      >
                    </div>
                    <div>
                      模态: <span>{{ getSensorType(cg.CGQLX) }}</span>
                    </div>
                    <div>
                      RCS精度: <span>{{ cg.RCS || '0' }}</span>
                    </div>
                    <div>
                      模式:
                      <span class="text-cyan">{{ cg.GZMS || '自动' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="matrix-column">
              <div class="column-title">
                <Icon icon="mdi:cog" size="12px" style="color: #94a3b8" />
                机载核心物理外设 (全量 {{ deviceList.length }})
              </div>
              <div class="matrix-scroll-box">
                <div v-if="deviceList.length === 0" class="sub-empty">
                  该平台未检测到注册物理设备
                </div>
                <div
                  v-for="sb in deviceList"
                  :key="sb.ZYXH"
                  class="monitor-node node-device"
                  :class="[
                    getJkStatusClass(sb.JKZT),
                    getZyStatusClass(sb.ZYZYZT),
                    {'data-bounce': sb._bounce}
                  ]"
                >
                  <div class="double-dots-container">
                    <span
                      class="card-status-dot"
                      :class="getJkDotClass(sb.JKZT)"
                      title="健康状态"
                    ></span>
                    <span
                      class="card-status-dot"
                      :class="getZyDotClass(sb.ZYZYZT)"
                      title="资源状态"
                    ></span>
                  </div>

                  <div class="node-name-bar">
                    {{ sb.SBXHMC || '未知硬件元' }}
                  </div>
                  <div class="detail-grid">
                    <div>
                      编号: <span class="bsh-txt">#{{ sb.PTBSH || '-' }}</span>
                    </div>
                    <div>
                      类型: <span>{{ getDeviceType(sb.SBLX) }}</span>
                    </div>
                    <div class="full-col flex-between">
                      <span>算力(CPU):</span>
                      <span
                        :class="
                          sb.CPU > 80 ? 'text-orange' : 'text-green font-num'
                        "
                        >{{ sb.CPU || 0 }}%</span
                      >
                    </div>
                    <div class="full-col">
                      <el-progress
                        :percentage="Math.floor(sb.CPU || 0)"
                        :status="sb.CPU > 80 ? 'exception' : 'success'"
                        :stroke-width="2"
                        :show-text="false"
                      />
                    </div>
                    <div class="full-col flex-between">
                      <span>负载(RAM):</span>
                      <span class="text-blue font-num">{{ sb.RAM || 0 }}%</span>
                    </div>
                    <div class="full-col flex-between">
                      <span>热核温度:</span>
                      <span
                        :class="
                          sb.TEMP > 75 ? 'text-red' : 'text-cyan font-num'
                        "
                        >{{ sb.TEMP || 0 }}℃</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="matrix-column charts-exclusive-column">
              <div class="column-title">
                <Icon icon="mdi:chart-bar" size="12px" style="color: #38bdf8" />
                数字化效能深度剖析
              </div>
              <div class="chart-vertical-box">
                <div class="chart-item-wrapper">
                  <div ref="weaponRadarChart" class="echart-div"></div>
                </div>
                <div class="chart-item-wrapper">
                  <div ref="sensorBarChart" class="echart-div"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  getPlatformPage,
  getWeaponPage,
  getSensorPage,
  getPlatformTypeMap,
  getsbxxPage
} from '@/api/platform'

export default {
  name: 'SpaceMonitorDashboard',
  data() {
    return {
      loadingLeft: false,
      loadingRight: false,
      loadingMore: false,
      timer: null,
      platformList: [],
      weaponList: [],
      sensorList: [],
      deviceList: [],
      selectedPlatform: null,
      activePtId: null,
      totalPlatforms: 0,
      // 状态静态标准字典
      jkztMap: {0: '运行', 1: '未运行', 2: '故障'},
      zyzyztMap: {0: '空闲', 1: '占用'},
      platformTypeMap: {
        1: '指控平台',
        2: '舰艇平台',
        3: '航空平台',
        4: '特种飞机',
        5: '弹载平台',
        6: '星载平台'
      },
      queryParams: {PTMC: '', PTLX: ''},
      pageConfig: {pageNum: 1, pageSize: 12},
      radarChartIns: null,
      barChartIns: null
    }
  },
  computed: {
    // 独立解耦的计算属性数据审计
    statusStatistics() {
      const allAssets = [
        ...this.weaponList,
        ...this.sensorList,
        ...this.deviceList
      ]

      let jkRunning = 0
      let jkOffline = 0
      let jkFault = 0
      let zyFree = 0
      let zyBusy = 0

      allAssets.forEach(asset => {
        // 1. 统计健康状态
        const jk = Number(asset.JKZT)
        if (jk === 0) jkRunning++
        else if (jk === 1) jkOffline++
        else if (jk === 2) jkFault++

        // 2. 统计资源状态
        const zy = Number(asset.ZYZYZT)
        if (zy === 0) zyFree++
        else if (zy === 1) zyBusy++
      })

      return {
        jkRunning,
        jkOffline,
        jkFault,
        zyFree,
        zyBusy,
        total: allAssets.length
      }
    }
  },
  created() {
    this.fetchTypeMap()
    this.loadPlatforms(false, true)

    this.timer = setInterval(() => {
      this.syncPollingData()
    }, 3000)
  },
  mounted() {
    this.initCharts()
    window.addEventListener('resize', this.resizeCharts)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    window.removeEventListener('resize', this.resizeCharts)
    if (this.radarChartIns) this.radarChartIns.dispose()
    if (this.barChartIns) this.barChartIns.dispose()
  },
  methods: {
    async fetchTypeMap() {
      try {
        const res = await getPlatformTypeMap()
        if (res?.data) this.platformTypeMap = res.data
      } catch (e) {
        console.warn('使用硬编码字典渲染')
      }
    },

    async loadPlatforms(isAppend = false, showLoading = false) {
      if (showLoading) {
        if (isAppend) this.loadingMore = true
        else this.loadingLeft = true
      }
      try {
        const res = await getPlatformPage({
          pageNum: this.pageConfig.pageNum,
          pageSize: this.pageConfig.pageSize,
          params: {
            PTMC: this.queryParams.PTMC || undefined,
            PTLX: this.queryParams.PTLX || undefined
          }
        })
        const list = res?.data?.list || res?.rows || []
        this.totalPlatforms = res?.data?.total || res?.total || list.length

        const processedList = list.map(pt => ({...pt, _bounce: false}))

        if (isAppend) {
          this.platformList = [...this.platformList, ...processedList]
        } else {
          this.platformList = processedList
          if (this.platformList.length > 0) {
            this.selectPlatform(this.platformList[0])
          } else {
            this.resetActiveState()
          }
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingLeft = false
        this.loadingMore = false
      }
    },

    handleListScroll(e) {
      const {scrollTop, clientHeight, scrollHeight} = e.target
      if (scrollHeight - scrollTop - clientHeight < 15) {
        if (
          !this.loadingMore &&
          this.platformList.length < this.totalPlatforms &&
          this.pageConfig.pageNum < 15
        ) {
          this.pageConfig.pageNum += 1
          this.loadPlatforms(true, true)
        }
      }
    },

    async selectPlatform(pt) {
      this.selectedPlatform = pt
      this.activePtId = pt.PTXXID
      this.loadingRight = true
      await this.loadCascadeSubSystems(pt.PTXXID, false)
    },

    async loadCascadeSubSystems(ptId, isUpdate = false) {
      try {
        const [resWq, resCg, resSb] = await Promise.all([
          getWeaponPage({pageNum: 1, pageSize: 9999, params: {PTID: ptId}}),
          getSensorPage({pageNum: 1, pageSize: 9999, params: {PTID: ptId}}),
          getsbxxPage({pageNum: 1, pageSize: 9999, params: {PTID: ptId}})
        ])

        const wqs = resWq?.data?.list || resWq?.rows || []
        const cgs = resCg?.data?.list || resCg?.rows || []
        const sbs = resSb?.data?.list || resSb?.rows || []

        this.weaponList = wqs.map(w => {
          let b = false
          if (isUpdate) {
            const old = this.weaponList.find(o => o.ZYXH === w.ZYXH)
            if (old && old.GZSL !== w.GZSL) b = true
          }
          return {...w, _bounce: b}
        })

        this.sensorList = cgs.map(c => {
          let b = false
          if (isUpdate) {
            const old = this.sensorList.find(o => o.ZYXH === c.ZYXH)
            if (old && old.TCFW !== c.TCFW) b = true
          }
          return {...c, _bounce: b}
        })

        this.deviceList = sbs.map(s => {
          let b = false
          if (isUpdate) {
            const old = this.deviceList.find(o => o.ZYXH === s.ZYXH)
            if (old && (old.CPU !== s.CPU || old.JKZT !== s.JKZT)) b = true
          }
          return {...s, _bounce: b}
        })

        this.updateCharts()
        setTimeout(() => {
          this.weaponList.forEach(w => (w._bounce = false))
          this.sensorList.forEach(s => (s._bounce = false))
          this.deviceList.forEach(d => (d._bounce = false))
        }, 600)
      } catch (e) {
        console.error(e)
      } finally {
        this.loadingRight = false
      }
    },

    async syncPollingData() {
      try {
        const res = await getPlatformPage({
          pageNum: 1,
          pageSize: this.pageConfig.pageNum * this.pageConfig.pageSize,
          params: {
            PTMC: this.queryParams.PTMC || undefined,
            PTLX: this.queryParams.PTLX || undefined
          }
        })
        const freshList = res?.data?.list || res?.rows || []

        this.platformList.forEach(oldPt => {
          const matching = freshList.find(f => f.PTXXID === oldPt.PTXXID)
          if (matching) {
            if (
              matching.JKZT !== oldPt.JKZT ||
              matching.PTSD !== oldPt.PTSD ||
              matching.ZYZYZT !== oldPt.ZYZYZT
            )
              oldPt._bounce = true
            Object.assign(oldPt, matching)
          }
        })

        if (this.activePtId) {
          const currentLive = freshList.find(f => f.PTXXID === this.activePtId)
          if (currentLive) this.selectedPlatform = currentLive
          await this.loadCascadeSubSystems(this.activePtId, true)
        }

        this.$forceUpdate()
        setTimeout(() => {
          this.platformList.forEach(p => (p._bounce = false))
        }, 600)
      } catch (e) {
        console.warn('后台心跳网络波动')
      }
    },

    initCharts() {
      this.radarChartIns = echarts.init(this.$refs.weaponRadarChart, 'dark')
      this.barChartIns = echarts.init(this.$refs.sensorBarChart, 'dark')
    },

    updateCharts() {
      if (!this.radarChartIns || !this.barChartIns) return

      const radarIndicators = this.weaponList
        .slice(0, 5)
        .map(w => ({name: w.WQXHMC, max: 100}))
      const radarValues = this.weaponList
        .slice(0, 5)
        .map(w => (w.DJCGL || 0) * 100)

      this.radarChartIns.setOption(
        {
          backgroundColor: 'transparent',
          title: {
            text: '核心武器打击概率',
            textStyle: {fontSize: 11, color: '#38bdf8'},
            left: 'center',
            top: 5
          },
          radar: {
            indicator: radarIndicators.length
              ? radarIndicators
              : [{name: '无武器外设', max: 100}],
            radius: '50%',
            center: ['50%', '60%']
          },
          series: [
            {
              type: 'radar',
              data: [{value: radarValues}],
              itemStyle: {color: '#f59e0b'},
              areaStyle: {color: 'rgba(245,158,11,0.1)'}
            }
          ]
        },
        false
      )

      this.barChartIns.setOption(
        {
          backgroundColor: 'transparent',
          title: {
            text: '传感器边界覆盖(km)',
            textStyle: {fontSize: 11, color: '#38bdf8'},
            left: 'center',
            top: 5
          },
          grid: {top: 45, bottom: 25, left: 35, right: 10},
          xAxis: {
            type: 'category',
            data: this.sensorList.slice(0, 6).map(s => s.CGQMC || '感知'),
            axisLabel: {fontSize: 9, color: '#94a3b8'}
          },
          yAxis: {
            type: 'value',
            splitLine: {lineStyle: {color: '#141f33'}},
            axisLabel: {fontSize: 9}
          },
          series: [
            {
              data: this.sensorList.slice(0, 6).map(s => s.TCFW || 0),
              type: 'bar',
              barWidth: 10,
              itemStyle: {color: '#06b6d4'}
            }
          ]
        },
        false
      )

      this.$nextTick(() => {
        if (this.radarChartIns) this.radarChartIns.resize()
        if (this.barChartIns) this.barChartIns.resize()
      })
    },

    handleSearch() {
      this.pageConfig.pageNum = 1
      if (this.$refs.scrollContainer) this.$refs.scrollContainer.scrollTop = 0
      this.loadPlatforms(false, true)
    },
    resetActiveState() {
      this.activePtId = null
      this.selectedPlatform = null
      this.weaponList = []
      this.sensorList = []
      this.deviceList = []
    },
    resizeCharts() {
      if (this.radarChartIns) this.radarChartIns.resize()
      if (this.barChartIns) this.barChartIns.resize()
    },

    /* ==========================================
       🆕 新增/重构：显式独立分流的状态映射函数
       ========================================== */
    // 健康状态对应 Class (左侧卡片边框、标签底色)
    getJkStatusClass(jkzt) {
      const status = Number(jkzt)
      if (status === 2) return 'jk-fault'
      if (status === 1) return 'jk-offline'
      return 'jk-running'
    },
    // 资源状态对应 Class (左侧卡片边框、标签底色)
    getZyStatusClass(zyzyzt) {
      return Number(zyzyzt) === 1 ? 'zy-busy' : 'zy-free'
    },
    // 右侧大面板文本颜色分流
    getJkTextClass(jkzt) {
      const status = Number(jkzt)
      if (status === 2) return 'text-red'
      if (status === 1) return 'text-gray'
      return 'text-green'
    },
    getZyTextClass(zyzyzt) {
      return Number(zyzyzt) === 1 ? 'text-orange' : 'text-cyan'
    },
    // 小圆点(Dot) 的独立类名指定
    getJkDotClass(jkzt) {
      const status = Number(jkzt)
      if (status === 2) return 'jk-dot-fault'
      if (status === 1) return 'jk-dot-offline'
      return 'jk-dot-running'
    },
    getZyDotClass(zyzyzt) {
      return Number(zyzyzt) === 1 ? 'zy-dot-busy' : 'zy-dot-free'
    },

    getWeaponType(t) {
      return {1: '对陆', 2: '对水面', 3: '对水下', 4: '对空'}[t] || '多型'
    },
    getSensorType(t) {
      return {1: '雷达', 2: '光学', 3: '电子'}[t] || '组合'
    },
    getDeviceType(t) {
      return (
        {1: '计算核心', 2: '存储矩阵', 3: '通信路由', 4: '供电伺服'}[t] ||
        '通用硬件'
      )
    }
  }
}
</script>

<style scoped>
/* ==========================================
   主大屏视窗强制 100% 隔离锁定
   ========================================== */
.screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 14px;
}

/* 顶部流式检索区 */
.top-search-header {
  height: 50px;
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
.search-flex {
  display: flex;
  gap: 16px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-item label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
}
.search-item input,
.search-item select {
  background: #0d1522;
  border: 1px solid #1a293d;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  width: 140px;
}

/* 状态图例区重构（双状态拆分显示） */
.monitor-legend {
  display: flex;
  align-items: center;
  gap: 16px;
}
.legend-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.group-label {
  font-size: 11px;
  color: #4b5a70;
}
.legend-divider {
  width: 1px;
  height: 12px;
  background: #1e293b;
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
/* 健康图例颜色 */
.bg-jk-running {
  background: #10b981;
}
.bg-jk-offline {
  background: #94a3b8;
}
.bg-jk-fault {
  background: #ef4444;
}
/* 资源图例颜色 */
.bg-zy-free {
  background: #06b6d4;
}
.bg-zy-busy {
  background: #f59e0b;
}

/* 主体分栏骨架 */
.main-body-layout {
  display: flex;
  flex: 1;
  gap: 14px;
  height: calc(100% - 62px);
  min-height: 0;
}

/* LEFT: 瘦身型平台列表 */
.left-platform-sidebar {
  width: 24%; /* 略微拓宽确保双状态标签放得下 */
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}
.sidebar-header-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 11px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 6px;
}
.sidebar-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #38bdf8;
}
.sidebar-header-summary .total-badge {
  font-size: 11px;
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.1);
  padding: 2px 6px;
  border-radius: 11px;
}

.platform-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
}
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-thumb {
  background: #172438;
  border-radius: 2px;
}

/* 左侧简报卡片双状态融合 */
.platform-brief-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #94a3b8; /* 默认灰色 */
  border-radius: 3px;
  padding: 8px 11px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
/* 卡片左侧高亮边框以 健康状态(JKZT) 为主导 */
.platform-brief-card.jk-running {
  border-left-color: #10b981;
}
.platform-brief-card.jk-offline {
  border-left-color: #64748b;
  opacity: 0.6;
}
.platform-brief-card.jk-fault {
  border-left-color: #ef4444;
}
/* 卡片背景阴影可以体现 资源状态(ZYZYZT) 忙碌度 */
.platform-brief-card.zy-busy {
  background: #131924;
}

.platform-brief-card:hover {
  background: #131f33;
}
.platform-brief-card.is-active {
  border-right: 1px solid #38bdf8;
  box-shadow: inset 0 0 8px rgba(56, 189, 248, 0.15);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
}
.pt-name {
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* 双状态胶囊小标签 */
.status-tags-box {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}
.mini-status-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: normal;
}
.mini-status-tag.jk-running {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.mini-status-tag.jk-offline {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}
.mini-status-tag.jk-fault {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.mini-status-tag.zy-free {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
}
.mini-status-tag.zy-busy {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.card-sub-info {
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
  font-size: 11px;
}
.bsh-txt {
  color: #94a3b8;
}
.pt-type-tag {
  color: #94a3b8;
}
.brief-dynamics {
  display: flex;
  gap: 11px;
  margin-top: 5px;
  font-size: 11px;
  color: #8a99ad;
}

.scroll-loading-tip {
  text-align: center;
  font-size: 11px;
  color: #3b4b61;
  padding: 11px 0;
}

/* RIGHT: 宽域级联详情 */
.right-cascade-panel {
  width: 76%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  position: relative;
  box-sizing: border-box;
}
.cascade-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

/* 细化精密姿态监控 */
.detail-param-dashboard {
  background: #0c1424;
  border-radius: 4px;
  padding: 11px;
  margin-bottom: 12px;
  border-left: 3px solid #38bdf8;
}
.panel-inner-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.panel-inner-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.main-status-display {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #94a3b8;
}
.status-indicator strong {
  margin-left: 2px;
}

.params-matrix {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}
.matrix-item {
  background: #070c14;
  padding: 5px 8px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  font-size: 11px;
}
.matrix-item label {
  color: #94a3b8;
  font-size: 11px;
}
.matrix-item .val {
  font-weight: bold;
  color: #fff;
}

/* 平台状态统计行样式 */
.platform-status-summary-bar {
  margin-top: 11px;
  padding-top: 8px;
  border-top: 1px dashed #1c2d42;
  display: flex;
  align-items: center;
  font-size: 11px;
}
.summary-label {
  color: #94a3b8;
  font-weight: bold;
}
.summary-indicators {
  display: flex;
  gap: 14px;
  align-items: center;
}
.indicator-divider {
  color: #1e293b;
  font-size: 12px;
}
.indicator-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.indicator-item .status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.indicator-item .count-num {
  font-size: 12px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.04);
  padding: 0px 5px;
  border-radius: 3px;
}

/* 下方四分天下 layout */
.sub-fluid-layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
}
.matrix-column {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.column-title {
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
  margin-bottom: 6px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 4px;
}
.matrix-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 基础节点卡片解耦状态样式 */
.monitor-node {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #94a3b8;
  border-radius: 4px;
  padding: 8px;
  position: relative;
}
/* 卡片左边线：依旧交给健康状态绑定 */
.monitor-node.jk-running {
  border-left-color: #10b981 !important;
}
.monitor-node.jk-offline {
  border-left-color: #64748b !important;
  opacity: 0.5;
}
.monitor-node.jk-fault {
  border-left-color: #ef4444 !important;
}
/* 资产卡片：如果是占用状态，给予不易察觉的微暗背景差异 */
.monitor-node.zy-busy {
  background: #111824;
}

.node-name-bar {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 3px;
  margin-bottom: 5px;
  padding-right: 28px; /* 拓宽右边距留给并排两个小圆点 */
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 6px;
  font-size: 11px;
  color: #94a3b8;
}
.detail-grid span {
  color: #cbd5e1;
}
.full-col {
  grid-column: span 2;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
.flex-between {
  justify-content: space-between;
}

/* 右上角并排双指示灯容器 */
.double-dots-container {
  position: absolute;
  top: 9px;
  right: 9px;
  display: flex;
  gap: 5px;
  z-index: 5;
}
.card-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

@keyframes dot-pulsate {
  0% {
    transform: scale(0.9);
    opacity: 0.5;
    box-shadow: 0 0 0 0 currentColor;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
    box-shadow: 0 0 6px 1px currentColor;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.5;
    box-shadow: 0 0 0 0 currentColor;
  }
}

/* 健康状态指示灯 */
.jk-dot-running {
  background-color: #10b981;
  color: rgba(16, 185, 129, 0.4);
  animation: dot-pulsate 2s infinite ease-in-out;
}
.jk-dot-fault {
  background-color: #ef4444;
  color: rgba(239, 68, 68, 0.6);
  animation: dot-pulsate 0.8s infinite ease-in-out;
}
.jk-dot-offline {
  background-color: #64748b;
}

/* 资源状态指示灯 */
.zy-dot-free {
  background-color: #06b6d4;
}
.zy-dot-busy {
  background-color: #f59e0b;
  color: rgba(245, 158, 11, 0.5);
  animation: dot-pulsate 1.6s infinite ease-in-out;
}

/* 最右侧 ECharts 专属列 */
.charts-exclusive-column {
  background: rgba(13, 21, 34, 0.3);
  padding: 6px;
  border-radius: 4px;
}
.chart-vertical-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 11px;
  min-height: 0;
}
.chart-item-wrapper {
  flex: 1;
  min-height: 0;
  background: #070c14;
  border-radius: 4px;
  padding: 4px;
}
.echart-div {
  width: 100%;
  height: 100%;
}

/* 动效控制 */
@keyframes row-pop-flash {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.02);
    border-color: #38bdf8;
    box-shadow: 0 0 6px rgba(56, 189, 248, 0.2);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes text-pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
    text-shadow: 0 0 4px currentColor;
  }
  100% {
    transform: scale(1);
  }
}
.data-bounce {
  animation: row-pop-flash 0.5s ease-in-out;
}
.data-bounce .bounce-num {
  display: inline-block;
  animation: text-pop 0.5s ease-in-out;
}

.alarm-flash-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 5px;
  height: 5px;
  background: #ef4444;
  border-radius: 50%;
  box-shadow: 0 0 6px #ef4444;
}
.empty-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #080e18;
  z-index: 10;
  color: #94a3b8;
  font-size: 11px;
}
.radar-scan-loader {
  width: 30px;
  height: 30px;
  border: 2px dashed #172438;
  border-radius: 50%;
  animation: spin 4s linear infinite;
  margin-bottom: 8px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #223147;
  padding: 14px;
  border: 1px dashed #111b2b;
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
  color: #94a3b8 !important;
}
.highlight-orange {
  color: #f59e0b;
  font-weight: bold;
}
.highlight-blue {
  color: #38bdf8;
  font-weight: bold;
}

::v-deep .el-progress__text {
  color: #94a3b8 !important;
  font-size: 9px !important;
}
</style>
