<template>
  <div
    class="topology-container"
    v-loading="globalLoading"
    element-loading-background="rgba(3, 6, 12, 0.8)"
  >
    <div class="top-search-header-refined">
      <div class="search-flex-zone">
        <span class="hub-title-refined">
          <Icon icon="mdi:satellite" size="14px" /> 战术拓扑网络资源调度
        </span>

        <div class="search-item-refined">
          <label>作战任务</label>
          <el-select
            v-model="filterForm.ZZRWID"
            placeholder="请选择绑定的作战任务..."
            @change="onTaskSelect"
            popper-class="monitor-select-dropdown"
            class="refined-select"
            size="mini"
          >
            <el-option
              v-for="task in taskList"
              :key="task.ZZRWID"
              :label="`${task.RWMC} (${task.ZZRWID})`"
              :value="task.ZZRWID"
            />
          </el-select>
        </div>
      </div>

      <div class="monitor-legend-refined">
        <div class="legend-node-refined">
          <span class="dot-refined bg-running"></span>内核引擎: 实时连通
        </div>
        <div class="system-time-stamp font-mono">实时同步</div>
      </div>
    </div>

    <div class="main-canvas-area">
      <topology-canvas :topology-data="currentTopology" />
    </div>

    <div class="left-bus-drawer" :class="{'is-hidden': !leftBusVisible}">
      <div
        class="drawer-left-trigger"
        @click="leftBusVisible = !leftBusVisible"
        :title="leftBusVisible ? '隐藏综合监测舱' : '展开综合监测舱'"
      >
        <i
          :class="leftBusVisible ? 'el-icon-arrow-left' : 'el-icon-arrow-right'"
        ></i>
        <span class="trigger-txt">{{
          leftBusVisible ? '收起面板' : '展开面板'
        }}</span>
      </div>

      <div class="drawer-left-body" v-if="leftBusVisible">
        <div class="bus-panel-header">
          <div class="bus-title">
            <div class="animate-pulse-dot"></div>
            <span>多维网络遥测要素态势舱</span>
          </div>
          <div class="bus-timer font-mono">{{ lastRefreshTime }}</div>
        </div>

        <div class="tactical-btn-tabs">
          <button
            class="tab-btn"
            :class="{active: activeLeftTab === 'xxlltj'}"
            @click="activeLeftTab = 'xxlltj'"
          >
            流量
          </button>
          <button
            class="tab-btn"
            :class="{active: activeLeftTab === 'wlllzt'}"
            @click="activeLeftTab = 'wlllzt'"
          >
            链路状态
          </button>
          <button
            class="tab-btn"
            :class="{active: activeLeftTab === 'xxfsjg'}"
            @click="activeLeftTab = 'xxfsjg'"
          >
            发送结果
          </button>
        </div>

        <div class="tab-content-container">
          <div v-if="activeLeftTab === 'xxlltj'" class="tab-scroll-pane">
            <div v-if="trafficList.length === 0" class="empty-hint-dark">
              当前周期无流量快照
            </div>
            <div
              v-for="item in trafficList"
              :key="'lltj-' + item.XXLLTJID"
              class="refined-tactical-row border-ok"
            >
              <div class="row-top-meta font-mono">
                <span class="time-node">
                  <Icon icon="mdi:clock-outline" size="11px" /> 时间:
                  {{ formatTime(item.SJ) }}
                </span>
                <span class="wlh-tag">网号: {{ item.WLH }}</span>
              </div>

              <div class="vector-route-pipeline">
                <div class="vector-node">
                  <span class="name text-cyan">{{
                    item.PT1MC || '源平台'
                  }}</span>
                  <span class="id font-mono">#{{ item.PT1BSH }}</span>
                </div>
                <div class="vector-arrow">
                  <span class="link-lbl">代码: {{ item.XXDM }}</span>
                  <div class="line-body"></div>
                </div>
                <div class="vector-node text-right">
                  <span class="name text-green">{{
                    item.PT2MC || '目的平台'
                  }}</span>
                  <span class="id font-mono">#{{ item.PT2BSH }}</span>
                </div>
              </div>

              <div class="row-footer-details font-mono">
                <div class="detail-line">
                  <span class="lbl">链路体制:</span>
                  <span class="text-white truncate" :title="item.LLLXMC">{{
                    item.LLLXMC || '常规通信链路'
                  }}</span>
                </div>
                <div class="data-matrix-counter">
                  <div class="counter-box tx">
                    <span class="lbl">发送:</span
                    ><span class="val">{{ item.FSXXTS }}</span>
                  </div>
                  <div class="counter-box rx">
                    <span class="lbl">接收:</span
                    ><span class="val">{{ item.JSXXTS }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeLeftTab === 'wlllzt'" class="tab-scroll-pane">
            <div v-if="wlllztDataList.length === 0" class="empty-hint-dark">
              暂无网络链路遥测状态上报
            </div>
            <div
              v-for="link in wlllztDataList"
              :key="link.WLLLZTID"
              class="refined-tactical-row"
              :class="Number(link.LLJKZT) === 1 ? 'border-err' : 'border-ok'"
            >
              <div class="row-title-flex">
                <span class="net-title">
                  <Icon
                    icon="mdi:globe-model"
                    size="12px"
                    style="color: #38bdf8"
                  />
                  {{ link.WLMC || '未命名网络' }}
                </span>
                <span
                  class="health-indicator-tag"
                  :class="Number(link.LLJKZT) === 1 ? 'alarm' : 'healthy'"
                >
                  {{ Number(link.LLJKZT) === 1 ? '故障告警' : '健康运行' }}
                </span>
              </div>

              <div class="data-matrix font-mono">
                <div><span class="lbl">网络号:</span>{{ link.WLH }}</div>
                <div><span class="lbl">平台号:</span>#{{ link.PTBSH }}</div>
                <div style="grid-column: span 2">
                  <span class="lbl">网络IP:</span
                  ><span class="text-cyan">{{ link.PTWLDZ }}</span>
                </div>
              </div>

              <div class="single-data-line font-mono">
                <span class="lbl">链路体制:</span>
                <span
                  class="text-orange truncate"
                  :title="getLinkTypeName(link.LLLX)"
                  >{{ getLinkTypeName(link.LLLX) }}</span
                >
              </div>

              <div class="neighbor-sub-box font-mono">
                <div>
                  <span class="lbl">邻接标识:</span> #{{ link.JDBSH || '无' }}
                </div>
                <div>
                  <span class="lbl">邻接状态:</span>
                  <span class="node-st-val" :class="'st-' + link.JDZT">{{
                    getJdStatusText(link.JDZT)
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeLeftTab === 'xxfsjg'" class="tab-scroll-pane">
            <div v-if="trafficList.length === 0" class="empty-hint-dark">
              当前任务无发送流水明细结果
            </div>

            <div
              v-for="detail in trafficList"
              :key="'fsjg-' + detail.XXFSJGID"
              class="rich-result-vertical-card"
              :class="Number(detail.XXCSQK) === 1 ? 'border-err' : 'border-ok'"
            >
              <div class="result-header-flex font-mono">
                <span class="time-node">
                  <Icon icon="mdi:clock-outline" size="11px" /> 时标:
                  {{ detail.TIME || '-' }}
                </span>
                <span
                  class="status-indicator-tag"
                  :class="Number(detail.XXCSQK) === 1 ? 'err' : 'ok'"
                >
                  {{
                    Number(detail.XXCSQK) === 1
                      ? '✕ 传输失败(1)'
                      : '✓ 传输成功(0)'
                  }}
                </span>
              </div>

              <div class="vector-route-pipeline">
                <div class="vector-node">
                  <span class="name text-cyan" :title="detail.YPTMC">{{
                    detail.YPTMC || '源平台'
                  }}</span>
                  <span class="id font-mono">源:#{{ detail.YPTBSH }}</span>
                </div>
                <div
                  class="vector-arrow"
                  :class="{'is-broken': Number(detail.XXCSQK) === 1}"
                >
                  <span class="link-lbl" :title="detail.XXLXMC || detail.XXLX"
                    >类型:{{ detail.XXLXMC || detail.XXLX }}</span
                  >
                  <div class="line-body"></div>
                </div>
                <div class="vector-node text-right">
                  <span class="name text-green" :title="detail.MDPTMC">{{
                    detail.MDPTMC || '目的机'
                  }}</span>
                  <span class="id font-mono">目:#{{ detail.MDPTBSH }}</span>
                </div>
              </div>

              <div class="row-footer-details font-mono">
                <div class="detail-line">
                  <span class="lbl">作战任务:</span>
                  <span class="text-white truncate">{{
                    detail.ZZRWID || filterForm.ZZRWID
                  }}</span>
                </div>
                <div class="detail-line">
                  <span class="lbl">网络归属:</span>
                  <span class="text-cyan truncate"
                    >[{{ detail.WLH }}] {{ detail.WLMC || '战术网' }}</span
                  >
                </div>
                <div class="detail-line" style="grid-column: span 2">
                  <span class="lbl">链路体制:</span>
                  <span
                    class="text-orange truncate"
                    :title="getLinkTypeName(detail.LLLX)"
                  >
                    [{{ detail.LLLX }}]
                    {{ detail.LLLXMC || getLinkTypeName(detail.LLLX) }}
                  </span>
                </div>
              </div>

              <div class="time-stamp-matrix font-mono">
                <div class="time-cell">
                  <span class="lbl">发送毫秒:</span>
                  <span class="value-time text-white">{{
                    detail.PTFSSJ || '--:--:--'
                  }}</span>
                </div>
                <div class="time-cell">
                  <span class="lbl">接收毫秒:</span>
                  <span class="value-time text-white">{{
                    detail.PTJSSJ || '--:--:--'
                  }}</span>
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
import TopologyCanvas from '../../components/TopologyCanvas.vue'
import {taskGetPage} from '@/api/task'
import {xxlltj, findTree} from '@/api/network'
import {transformTopologyData} from '../../methods/network'
import {wllxMap} from '@/api/map'

export default {
  name: 'NetworkTopology',
  components: {
    TopologyCanvas
  },
  data() {
    return {
      globalLoading: false,
      lastRefreshTime: '',
      leftBusVisible: true,
      activeLeftTab: 'xxlltj',
      trafficList: [],
      wlllztDataList: [],
      refreshTimer: null,
      taskList: [],
      filterForm: {
        ZZRWID: ''
      },
      currentTopology: [],
      networkTypeMap: {}
    }
  },
  mounted() {
    this.startLiveMonitoring()
    this.loadTaskList()
    this.fetchNetworkTypeMap()
  },
  beforeDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer)
  },
  methods: {
    formatTime(sj) {
      if (!sj) return '--:--:--'
      const date = new Date(sj.toString().length === 10 ? sj * 1000 : sj)
      return date.toLocaleTimeString('zh-CN', {hour12: false})
    },
    async startLiveMonitoring() {
      this.fetchGlobalTraffic()
      this.refreshTimer = setInterval(() => {
        this.fetchGlobalTraffic()
      }, 5000)
    },
    async fetchGlobalTraffic() {
      try {
        const res = await xxlltj({
          pageNum: 1,
          pageSize: 50,
          params: {}
        })
        const list = res.data?.list || []
        this.trafficList = list.sort((a, b) => b.SJ - a.SJ)
        this.lastRefreshTime = new Date().toLocaleTimeString()

        this.wlllztDataList = this.trafficList.map((t, idx) => ({
          WLLLZTID: 'ZT_LINK_' + t.XXFSJGID,
          PTBSH: t.YPTBSH,
          WLH: t.WLH,
          WLMC: t.WLMC,
          PTWLDZ: '10.12.96.' + (idx + 21),
          LLLX: t.LLLX || 6,
          LLJKZT: t.XXCSQK,
          JDBSH: t.MDPTBSH,
          JDZT: t.XXCSQK === 1 ? 4 : 1,
          TIME: t.TIME
        }))
      } catch (err) {
        console.error('动态指标综合链路树加载失败', err)
      }
    },
    loadTaskList() {
      this.globalLoading = true
      taskGetPage({pageNum: 1, pageSize: 100})
        .then(res => {
          this.taskList = res.data.list || []
          if (this.taskList.length > 0) {
            this.filterForm.ZZRWID = this.taskList[0].ZZRWID
            this.onTaskSelect()
          }
        })
        .catch(() => {
          this.currentTopology = []
        })
        .finally(() => {
          this.globalLoading = false
        })
    },
    onTaskSelect() {
      if (!this.filterForm.ZZRWID) return
      this.globalLoading = true
      findTree(this.filterForm.ZZRWID)
        .then(res => {
          const topologyData = [res.data]
          if (topologyData && topologyData.length > 0) {
            this.currentTopology = transformTopologyData(topologyData)
          } else {
            this.currentTopology = []
          }
        })
        .catch(() => {
          this.currentTopology = []
        })
        .finally(() => {
          this.globalLoading = false
        })
    },
    getLinkTypeName(type) {
      return this.networkTypeMap[type] || '通用未识别多维信息组件'
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
    getJdStatusText(st) {
      const statusMap = {
        0: '无报告',
        1: '入网',
        2: '退网',
        3: '静默',
        4: '脱网'
      }
      return statusMap[st] || '未知'
    }
  }
}
</script>

<style scoped>
.topology-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);
  color: var(--color-text-main);
  overflow: hidden;
}
.main-canvas-area {
  position: absolute;
  top: 76px;
  left: 12px;
  right: 12px;
  bottom: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  z-index: 1;
  overflow: hidden;
}
.top-search-header-refined {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  height: 52px;
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1001;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
.search-flex-zone {
  display: flex;
  align-items: center;
  gap: 24px;
}
.hub-title-refined {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-primary);
  letter-spacing: 0.5px;
}
.search-item-refined {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-item-refined label {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: bold;
}
.search-item-refined ::v-deep .el-input__inner {
  background: var(--bg-input) !important;
  border: 1px solid var(--border-dark) !important;
  color: #fff !important;
  height: 30px !important;
  line-height: 30px !important;
  font-size: 11px !important;
  width: 280px;
}
.monitor-legend-refined {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 11px;
}
.legend-node-refined {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(56, 189, 248, 0.05);
  padding: 4px 11px;
  border-radius: 12px;
  border: 1px solid rgba(56, 189, 248, 0.1);
  color: #6b7d99;
}
.legend-node-refined .dot-refined {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot-refined.bg-running {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}
.system-time-stamp {
  color: #6b7d99;
  font-size: 11px;
  font-weight: bold;
}
.left-bus-drawer {
  position: absolute;
  top: 76px;
  left: 12px;
  bottom: 12px;
  width: 360px;
  background: rgba(26, 45, 74, 0.9);
  backdrop-filter: blur(4px);
  border: 1px solid var(--border-dark);
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
}
.left-bus-drawer.is-hidden {
  transform: translateX(-372px);
}
.drawer-left-trigger {
  position: absolute;
  right: -24px;
  top: 42%;
  width: 24px;
  padding: 14px 0;
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--color-primary);
  box-shadow: 4px 2px 11px rgba(0, 0, 0, 0.4);
}
.drawer-left-trigger:hover {
  background: var(--bg-hover);
  color: var(--color-text-main);
}
.drawer-left-trigger .trigger-txt {
  font-size: 9px;
  writing-mode: vertical-lr;
  letter-spacing: 1px;
  font-weight: bold;
}
.drawer-left-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}
.bus-panel-header {
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-dark);
  margin-bottom: 8px;
}
.bus-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}
.bus-timer {
  font-size: 11px;
  color: var(--color-text-muted);
}
.animate-pulse-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse-effect 2s infinite;
}
@keyframes pulse-effect {
  0% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(56, 189, 248, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(56, 189, 248, 0);
  }
}
.tactical-btn-tabs {
  display: flex;
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  padding: 2px;
  border-radius: 3px;
  gap: 2px;
  margin-bottom: 11px;
}
.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-size: 11px;
  padding: 6px 0;
  cursor: pointer;
  border-radius: 2px;
  transition: all 0.15s ease;
  font-weight: bold;
  outline: none;
}
.tab-btn:hover {
  color: var(--color-primary);
  background: rgba(56, 189, 248, 0.05);
}
.tab-btn.active {
  color: var(--color-primary);
  background: var(--bg-panel);
  box-shadow: inset 0 0 5px rgba(56, 189, 248, 0.25);
  border: 1px solid rgba(56, 189, 248, 0.35);
}
.tab-content-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.tab-scroll-pane {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
}
.tab-scroll-pane::-webkit-scrollbar {
  width: 4px;
}
.tab-scroll-pane::-webkit-scrollbar-thumb {
  background: #172438;
  border-radius: 2px;
}
.refined-tactical-row {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 3px;
  padding: 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.refined-tactical-row:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}
.rich-result-vertical-card {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 3px;
  padding: 11px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: all 0.2s;
}
.rich-result-vertical-card:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
}
.result-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.status-indicator-tag.ok {
  color: #10b981;
  font-weight: bold;
}
.status-indicator-tag.err {
  color: #ef4444;
  font-weight: bold;
}
.rich-result-vertical-card .row-footer-details {
  border-top: 1px dashed #162235;
  padding-top: 6px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3px 6px;
  font-size: 11px;
}
.detail-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  font-size: 11px;
}
.rich-result-vertical-card .time-stamp-matrix {
  border-top: 1px dashed #162235;
  padding-top: 5px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.rich-result-vertical-card .time-cell {
  background: var(--bg-input);
  padding: 4px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.rich-result-vertical-card .time-cell .lbl {
  color: var(--color-text-muted);
  font-size: 9px;
}
.rich-result-vertical-card .time-cell .value-time {
  font-size: 11px;
  font-weight: bold;
}
.border-ok {
  border-left: 3px solid var(--color-success);
}
.border-err {
  border-left: 3px solid var(--color-danger);
}
.row-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.net-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.health-indicator-tag {
  font-size: 9px;
  font-weight: bold;
  padding: 1px 4px;
  border-radius: 2px;
}
.health-indicator-tag.healthy {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}
.health-indicator-tag.alarm {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}
.row-top-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  align-items: center;
}
.time-node {
  color: #6b7d99;
}
.wlh-tag {
  background: rgba(56, 189, 248, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 9px;
}
.vector-route-pipeline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-input);
  padding: 6px;
  border-radius: 2px;
}
.vector-node {
  display: flex;
  flex-direction: column;
  max-width: 95px;
}
.vector-node .name {
  font-size: 11px;
  font-weight: bold;
  color: #cbd5e1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vector-node .id {
  font-size: 9px;
  color: var(--color-text-muted);
}
.vector-arrow {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 4px;
  position: relative;
}
.vector-arrow .link-lbl {
  font-size: 8px;
  color: #6b7d99;
  transform: scale(0.85);
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vector-arrow .line-body {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
  margin-top: 2px;
  position: relative;
}
.vector-arrow .line-body::after {
  content: '▶';
  position: absolute;
  right: 2px;
  top: -5px;
  font-size: 7px;
  color: #38bdf8;
}
.vector-arrow.is-broken .line-body {
  background: #ef4444;
}
.vector-arrow.is-broken .line-body::after {
  content: '✕';
  color: #ef4444;
  right: 46%;
  top: -5px;
}
.data-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  font-size: 11px;
  background: var(--bg-input);
  padding: 5px;
  border-radius: 2px;
}
.matrix-cell .lbl,
.single-data-line .lbl,
.row-footer-details .lbl {
  color: var(--color-text-muted);
  margin-right: 4px;
}
.single-data-line {
  font-size: 11px;
  color: var(--color-text-main);
}
.data-matrix-counter {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  margin-top: 2px;
}
.counter-box {
  padding: 2px 6px;
  border-radius: 2px;
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  background: rgba(255, 255, 255, 0.01);
  border-left: 2px solid transparent;
}
.counter-box.tx {
  border-left-color: #38bdf8;
}
.counter-box.rx {
  border-left-color: #a855f7;
}
.counter-box .val {
  font-weight: bold;
  color: #fff;
}
.neighbor-sub-box {
  border-top: 1px dashed #1e293b;
  padding-top: 4px;
  display: flex;
  gap: 12px;
  font-size: 11px;
}
.node-st-val {
  font-weight: bold;
}
.node-st-val.st-1 {
  color: #10b981;
}
.node-st-val.st-2 {
  color: #38bdf8;
}
.node-st-val.st-3 {
  color: #f59e0b;
}
.node-st-val.st-4 {
  color: #ef4444;
}
.empty-hint-dark {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 11px;
  padding: 60px 11px;
  border: 1px dashed var(--border-dark);
  border-radius: 4px;
}
.text-cyan {
  color: var(--color-primary) !important;
}
.text-green {
  color: var(--color-success) !important;
}
.text-orange {
  color: var(--color-warning) !important;
}
.text-white {
  color: #fff !important;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.el-select-dropdown.monitor-select-dropdown {
  background-color: #080e18 !important;
  border: 1px solid #111b2b !important;
}
</style>
