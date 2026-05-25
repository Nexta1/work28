<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <div class="search-item">
          <label>平台检索</label>
          <input
            type="text"
            v-model="queryParams.PTMC"
            @input="handleSearch"
            placeholder="输入平台名称..."
          />
        </div>
        <div class="search-item">
          <label>平台类型</label>
          <select v-model="queryParams.PTLX" @change="handleSearch">
            <option value="">全部类型</option>
            <option
              v-for="(val, key) in platformTypeMap"
              :key="key"
              :value="key"
            >
              {{ val }}
            </option>
          </select>
        </div>
      </div>

      <div class="monitor-legend">
        <div class="legend-node">
          <span class="dot bg-running"></span>正常空闲
        </div>
        <div class="legend-node">
          <span class="dot bg-busy"></span>高负荷占用
        </div>
        <div class="legend-node">
          <span class="dot bg-fault"></span>严重故障
        </div>
        <div class="legend-node">
          <span class="dot bg-offline"></span>未激活/离线
        </div>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-platform-sidebar">
        <div class="sidebar-header-summary">
          <span class="title">🛡️ 受控平台</span>
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
              getStatusClass(pt.JKZT, pt.ZYZYZT),
              {'is-active': activePtId === pt.PTXXID},
              {'data-bounce': pt._bounce}
            ]"
            @click="selectPlatform(pt)"
          >
            <div class="card-top">
              <span class="pt-name" :title="pt.PTMC">{{ pt.PTMC }}</span>
            </div>
            <div class="card-sub-info">
              <span class="bsh-txt">#{{ pt.PTBSH || '未标号' }}</span>
              <span class="pt-type-tag">{{
                platformTypeMap[pt.PTLX] || '平台'
              }}</span>
            </div>
            <div class="brief-dynamics">
              <span>🧭 {{ pt.PTHX || 0 }}°</span>
              <span>⚡ {{ pt.PTSD || 0 }}k/h</span>
            </div>
            <div v-if="pt.JKZT === 2" class="alarm-flash-dot"></div>
          </div>

          <div class="scroll-loading-tip" v-if="pageConfig.pageNum >= 15">
            ⚠️ 已锁死最大加载上限 (15页)
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
            ⏳ 正在同步下一页态势...
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
            <div class="panel-inner-title">
              🛰️ 当前靶向：{{ selectedPlatform.PTMC }} ({{
                selectedPlatform.PTXXID
              }})
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
              <div class="summary-label">📊 挂载资产态势统计：</div>
              <div class="summary-indicators">
                <div class="indicator-item text-green">
                  <span class="status-dot dot-running"></span>
                  运行中 (正常/占用)：<span class="count-num">{{
                    statusStatistics.running
                  }}</span>
                </div>
                <div class="indicator-item text-gray">
                  <span class="status-dot dot-offline"></span>
                  未运行 (离线/未激活)：<span class="count-num">{{
                    statusStatistics.offline
                  }}</span>
                </div>
                <div class="indicator-item text-red">
                  <span class="status-dot dot-fault"></span>
                  严重故障：<span class="count-num">{{
                    statusStatistics.fault
                  }}</span>
                </div>
                <div class="indicator-item text-blue">
                  📦 资产总计：<span class="count-num">{{
                    statusStatistics.total
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sub-fluid-layout">
            <div class="matrix-column">
              <div class="column-title">
                ⚔️ 挂载武器矩阵 (全量 {{ weaponList.length }})
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
                    getStatusClass(wq.JKZT, wq.ZYZYZT),
                    {'data-bounce': wq._bounce}
                  ]"
                >
                  <div
                    class="card-status-dot"
                    :class="getStatusDotClass(wq.JKZT, wq.ZYZYZT)"
                  ></div>

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
                📡 边缘传感器网络 (全量 {{ sensorList.length }})
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
                    getStatusClass(cg.JKZT, cg.ZYZYZT),
                    {'data-bounce': cg._bounce}
                  ]"
                >
                  <div
                    class="card-status-dot"
                    :class="getStatusDotClass(cg.JKZT, cg.ZYZYZT)"
                  ></div>

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
                ⚙️ 机载核心物理外设 (全量 {{ deviceList.length }})
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
                    getStatusClass(sb.JKZT, sb.ZYZYZT),
                    {'data-bounce': sb._bounce}
                  ]"
                >
                  <div
                    class="card-status-dot"
                    :class="getStatusDotClass(sb.JKZT, sb.ZYZYZT)"
                  ></div>

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
              <div class="column-title">📊 数字化效能深度剖析</div>
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
  // 🔥 新增：利用 computed 计算属性，实时高效统计当前选中平台下的状态总数
  computed: {
    statusStatistics() {
      // 聚合当前平台下所有的挂载资产节点
      const allAssets = [
        ...this.weaponList,
        ...this.sensorList,
        ...this.deviceList
      ]

      let running = 0
      let offline = 0
      let fault = 0

      allAssets.forEach(asset => {
        const jkzt = Number(asset.JKZT)
        if (jkzt === 2) {
          fault++
        } else if (jkzt === 1) {
          offline++
        } else {
          running++ // jkzt 为 0 (运行中)
        }
      })

      return {
        running,
        offline,
        fault,
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
            if (matching.JKZT !== oldPt.JKZT || matching.PTSD !== oldPt.PTSD)
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
            text: '⚔️ 核心武器打击概率',
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
            text: '📡 传感器边界覆盖(km)',
            textStyle: {fontSize: 11, color: '#38bdf8'},
            left: 'center',
            top: 5
          },
          grid: {top: 45, bottom: 25, left: 35, right: 10},
          xAxis: {
            type: 'category',
            data: this.sensorList.slice(0, 6).map(s => s.CGQMC || '感知'),
            axisLabel: {fontSize: 9, color: '#475569'}
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
    getStatusClass(jkzt, zyzyzt) {
      if (Number(jkzt) === 2) return 'status-fault'
      if (Number(jkzt) === 1) return 'status-offline'
      return Number(zyzyzt) === 1 ? 'status-busy' : 'status-running'
    },
    getStatusDotClass(jkzt, zyzyzt) {
      if (Number(jkzt) === 2) return 'dot-fault'
      if (Number(jkzt) === 1) return 'dot-offline'
      return Number(zyzyzt) === 1 ? 'dot-busy' : 'dot-running'
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
  height: 100vh;
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
  color: #52637a;
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
.bg-offline {
  background: #475569;
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
  width: 22%;
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
  margin-bottom: 10px;
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
  border-radius: 10px;
  font-family: monospace;
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

/* 卡片精致化 */
.platform-brief-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #172438;
  border-radius: 3px;
  padding: 8px 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
.platform-brief-card:hover {
  background: #131f33;
}
.platform-brief-card.is-active {
  border-color: #38bdf8 !important;
  background: #13233c;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pt-name {
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 95%;
}
.card-sub-info {
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
  font-size: 10px;
}
.bsh-txt {
  color: #415169;
  font-family: monospace;
}
.pt-type-tag {
  color: #64748b;
}
.brief-dynamics {
  display: flex;
  gap: 10px;
  margin-top: 5px;
  font-size: 10px;
  color: #8a99ad;
  font-family: monospace;
}

.scroll-loading-tip {
  text-align: center;
  font-size: 10px;
  color: #3b4b61;
  padding: 10px 0;
}

/* RIGHT: 宽域级联详情 */
.right-cascade-panel {
  width: 78%;
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
  padding: 10px;
  margin-bottom: 12px;
  border-left: 3px solid #38bdf8;
}
.panel-inner-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 6px;
}
.params-matrix {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* 调整为 6 列平铺 */
  gap: 6px;
}
.matrix-item {
  background: #070c14;
  padding: 5px 8px;
  border-radius: 2px;
  display: flex;
  flex-direction: column; /* 调整为上下结构，更节省大屏幕横向空间 */
  align-items: flex-start;
  gap: 2px;
  font-size: 11px;
}
.matrix-item label {
  color: #415169;
  font-size: 10px;
}
.matrix-item .val {
  font-weight: bold;
  color: #fff;
}

/* 🔥 新增：平台状态统计行样式 */
.platform-status-summary-bar {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #1c2d42;
  display: flex;
  align-items: center;
  font-size: 11px;
}
.summary-label {
  color: #64748b;
  font-weight: bold;
}
.summary-indicators {
  display: flex;
  gap: 18px;
  align-items: center;
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
  font-family: monospace;
  font-size: 13px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.04);
  padding: 0px 6px;
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
  color: #52637a;
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

/* 基础节点卡片 */
.monitor-node {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #172438;
  border-radius: 4px;
  padding: 8px;
  position: relative;
}
.node-name-bar {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 3px;
  margin-bottom: 5px;
  padding-right: 16px;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 6px;
  font-size: 10px;
  color: #52637a;
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

/* 呼吸小圆点 */
.card-status-dot {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  z-index: 5;
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
    box-shadow: 0 0 6px 2px currentColor;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.5;
    box-shadow: 0 0 0 0 currentColor;
  }
}
.dot-running {
  background-color: #10b981;
  color: rgba(16, 185, 129, 0.6);
  animation: dot-pulsate 2s infinite ease-in-out;
}
.dot-busy {
  background-color: #f59e0b;
  color: rgba(245, 158, 11, 0.6);
  animation: dot-pulsate 1.6s infinite ease-in-out;
}
.dot-fault {
  background-color: #ef4444;
  color: rgba(239, 68, 68, 0.8);
  animation: dot-pulsate 0.8s infinite ease-in-out;
}
.dot-offline {
  background-color: #475569;
  animation: none;
  opacity: 0.4;
}

/* 最右侧 ECharts 垂直专属列 */
.charts-exclusive-column {
  background: rgba(13, 21, 34, 0.3);
  padding: 6px;
  border-radius: 4px;
}
.chart-vertical-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.status-running {
  border-left-color: #10b981 !important;
}
.status-busy {
  border-left-color: #f59e0b !important;
}
.status-fault {
  border-left-color: #ef4444 !important;
}
.status-offline {
  opacity: 0.35;
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
  color: #415169;
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
  font-size: 10px;
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
  color: #415169 !important;
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
  color: #52637a !important;
  font-size: 9px !important;
}
</style>
