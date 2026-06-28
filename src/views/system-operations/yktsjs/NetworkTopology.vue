<template>
  <div
    class="topology-container"
    v-loading="globalLoading"
    element-loading-background="rgba(3, 6, 12, 0.8)"
  >
    <div class="top-search-header-refined">
      <div class="search-flex-zone">
        <span class="hub-title-refined"> 网络资源拓扑 </span>

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
      <topology-canvas
        :topology-data="currentTopology"
        :layout-type.sync="layoutType"
      />
    </div>

    <!-- 左侧：全量树结构 -->
    <div class="left-tree-drawer">
      <div class="tree-header">
        <Icon icon="mdi:radar" size="13px" style="color: #38bdf8" />
        <span>拓扑资源树</span>
      </div>
      <div class="tree-body">
        <el-tree
          :data="treeData"
          :props="treeProps"
          default-expand-all
          node-key="id"
          :highlight-current="true"
          size="mini"
          class="dark-tree"
        >
          <span class="custom-tree-node" slot-scope="{node, data}">
            <span
              class="tree-dot"
              :class="data.online ? 'bg-running' : 'bg-offline'"
            ></span>
            <span
              class="tree-icon-wrapper"
              style="
                margin-right: 6px;
                display: inline-flex;
                align-items: center;
              "
            >
              <Icon
                :icon="
                  data.isLeaf
                    ? 'lucide:monitor'
                    : data.isMember
                      ? 'lucide:layers'
                      : data.isGroup
                        ? 'lucide:git-fork'
                        : 'lucide:network'
                "
                :size="12"
                :style="{
                  color: data.isLeaf
                    ? '#a855f7'
                    : data.isMember
                      ? '#06b6d4'
                      : data.isGroup
                        ? '#f59e0b'
                        : '#38bdf8',
                  filter: data.isLeaf
                    ? 'drop-shadow(0 0 3px rgba(168,85,247,0.5))'
                    : data.isMember
                      ? 'drop-shadow(0 0 3px rgba(6,182,212,0.5))'
                      : data.isGroup
                        ? 'drop-shadow(0 0 3px rgba(245,158,11,0.5))'
                        : 'drop-shadow(0 0 3px rgba(56,189,248,0.5))'
                }"
              />
            </span>
            <span class="tree-label-txt">{{ node.label }}</span>
          </span>
        </el-tree>
      </div>
    </div>

    <!-- 右侧：网络要素态势（默认收缩） -->
    <div class="right-bus-drawer" :class="{'is-hidden': !rightBusVisible}">
      <div
        class="drawer-right-trigger"
        @click="rightBusVisible = !rightBusVisible"
        :title="rightBusVisible ? '隐藏网络要素态势' : '展开网络要素态势'"
      >
        <i
          :class="
            rightBusVisible ? 'el-icon-arrow-right' : 'el-icon-arrow-left'
          "
        ></i>
        <span class="trigger-txt">{{ rightBusVisible ? '收起' : '要素' }}</span>
      </div>

      <div class="drawer-right-body" v-if="rightBusVisible">
        <div class="bus-panel-header">
          <div class="bus-title">
            <div class="animate-pulse-dot"></div>
            <span>网络要素态势</span>
          </div>
          <div class="bus-timer font-mono">{{ lastRefreshTime }}</div>
        </div>

        <el-tabs v-model="activeLeftTab" class="info-tabs" stretch>
          <el-tab-pane label="流量" name="xxlltj">
            <div class="tab-scroll-pane">
              <div v-if="trafficList.length === 0" class="empty-hint-light">
                当前周期无流量快照
              </div>
              <div
                v-for="(item, tIdx) in trafficList"
                :key="'lltj-' + tIdx + '-' + item.XXLLTJID"
                class="info-card info-card-ok"
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
          </el-tab-pane>
          <el-tab-pane label="链路状态" name="wlllzt">
            <div class="tab-scroll-pane">
              <div v-if="wlllztDataList.length === 0" class="empty-hint-light">
                暂无网络链路遥测状态上报
              </div>
              <div
                v-for="link in wlllztDataList"
                :key="link.WLLLZTID"
                class="info-card"
                :class="
                  Number(link.LLJKZT) === 1 ? 'info-card-err' : 'info-card-ok'
                "
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
          </el-tab-pane>
          <el-tab-pane label="发送结果" name="xxfsjg">
            <div class="tab-scroll-pane">
              <div v-if="trafficList.length === 0" class="empty-hint-light">
                当前任务无发送流水明细结果
              </div>

              <div
                v-for="detail in trafficList"
                :key="'fsjg-' + detail.XXFSJGID"
                class="info-card info-card-vertical"
                :class="
                  Number(detail.XXCSQK) === 1 ? 'info-card-err' : 'info-card-ok'
                "
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
          </el-tab-pane>
        </el-tabs>
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
      rightBusVisible: false,
      activeLeftTab: 'xxlltj',
      trafficList: [],
      wlllztDataList: [],
      refreshTimer: null,
      taskList: [],
      filterForm: {
        ZZRWID: ''
      },
      currentTopology: [],
      networkTypeMap: {},
      layoutType: 'TB'
    }
  },
  computed: {
    treeProps() {
      return {children: 'children', label: 'name'}
    },
    treeData() {
      if (!this.currentTopology || this.currentTopology.length === 0) return []
      const buildTree = nodes =>
        nodes.map(n => ({
          id: n.id,
          name: n.wlmc || n.name || n.label || n.id,
          isMember: !!n.nodes,
          isGroup: !!n.groups,
          isLeaf: !n.children && !n.groups && !n.nodes,
          showIcon: !!n.groups || (n.children && !n.groups && !n.nodes),
          online: !n.nodes,
          children: n.children
            ? buildTree(n.children)
            : n.groups
              ? buildTree(n.groups)
              : n.nodes
                ? buildTree(n.nodes)
                : undefined
        }))
      return buildTree(this.currentTopology)
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
  background-color: #03060c;
  color: #cbd5e1;
  overflow: hidden;
}
.main-canvas-area {
  position: absolute;
  top: 76px;
  left: 272px;
  right: 12px;
  bottom: 12px;
  background: #040810;
  border: 1px solid #111b2b;
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
  background: #080e18;
  border: 1px solid #111b2b;
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
  color: #38bdf8;
  letter-spacing: 0.5px;
}
.search-item-refined {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-item-refined label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
}
.search-item-refined ::v-deep .el-input__inner {
  background: #0d1522 !important;
  border: 1px solid #1e3557 !important;
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
  color: #94a3b8;
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
  color: #94a3b8;
  font-size: 11px;
  font-weight: bold;
}
.left-tree-drawer {
  position: absolute;
  top: 76px;
  left: 12px;
  bottom: 12px;
  width: 250px;
  background: rgba(8, 14, 24, 0.92);
  backdrop-filter: blur(4px);
  border: 1px solid #111b2b;
  border-radius: 4px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.tree-header {
  height: 34px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  font-size: 11px;
  font-weight: bold;
  color: #38bdf8;
  border-bottom: 1px solid #111b2b;
  flex-shrink: 0;
}
.tree-body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}
.tree-body ::v-deep .el-tree {
  background: transparent;
  border: none;
  color: #cbd5e1;
}
.tree-body ::v-deep .el-tree-node__content {
  height: 28px;
  font-size: 11px;
  color: #94a3b8;
}
.tree-body ::v-deep .el-tree-node__content:hover {
  background: rgba(56, 189, 248, 0.06);
}
.tree-body ::v-deep .el-tree-node.is-current > .el-tree-node__content {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}
.tree-body ::v-deep .el-tree-node__expand-icon {
  color: #64748b;
  font-size: 10px;
}
.tree-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  flex-shrink: 0;
}
.tree-dot.bg-running {
  background: #10b981;
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
}
.tree-dot.bg-offline {
  background: #64748b;
}
.tree-icon-wrapper {
  margin-right: 6px;
  display: inline-flex;
  align-items: center;
}
.tree-label-txt {
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.right-bus-drawer {
  position: absolute;
  top: 76px;
  right: 12px;
  bottom: 12px;
  width: 360px;
  background: rgba(8, 14, 24, 0.9);
  backdrop-filter: blur(4px);
  border: 1px solid #111b2b;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.8);
  border-radius: 4px;
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
}
.right-bus-drawer.is-hidden {
  transform: translateX(372px);
}
.drawer-right-trigger {
  position: absolute;
  left: -24px;
  top: 42%;
  width: 24px;
  padding: 14px 0;
  background: #080e18;
  border: 1px solid #111b2b;
  border-right: none;
  border-radius: 4px 0 0 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #38bdf8;
  box-shadow: -4px 2px 11px rgba(0, 0, 0, 0.4);
}
.drawer-right-trigger:hover {
  background: #121f35;
  color: #fff;
}
.drawer-right-trigger .trigger-txt {
  font-size: 9px;
  writing-mode: vertical-lr;
  letter-spacing: 1px;
  font-weight: bold;
}
.drawer-right-body {
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
  border-bottom: 1px solid #111b2b;
  margin-bottom: 8px;
}
.bus-title {
  font-size: 12px;
  font-weight: bold;
  color: #38bdf8;
  display: flex;
  align-items: center;
  gap: 8px;
}
.bus-timer {
  font-size: 11px;
  color: #94a3b8;
}
.animate-pulse-dot {
  width: 6px;
  height: 6px;
  background: #38bdf8;
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
/* === el-tabs 覆盖样式 === */
.info-tabs {
  margin-bottom: 8px;
  background: transparent;
}
.info-tabs ::v-deep .el-tabs__header {
  margin: 0;
  border-bottom: 1px solid #1e3557;
  background: rgba(14, 28, 48, 0.5);
  border-radius: 4px 4px 0 0;
}
.info-tabs ::v-deep .el-tabs__nav-wrap::after {
  display: none;
}
.info-tabs ::v-deep .el-tabs__item {
  font-size: 12px;
  font-weight: bold;
  height: 34px;
  line-height: 34px;
  color: #7ea9cc;
  padding: 0 16px;
  border-left: none;
}
.info-tabs ::v-deep .el-tabs__item.is-active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}
.info-tabs ::v-deep .el-tabs__content {
  padding: 0;
}
/* === 信息卡片通用样式（浅色系）=== */
.info-card,
.refined-tactical-row,
.rich-result-vertical-card {
  background: rgba(14, 28, 48, 0.4);
  border: 1px solid #1e3557;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;
}
.info-card:hover,
.refined-tactorial-row:hover,
.rich-result-vertical-card:hover {
  background: rgba(20, 40, 65, 0.55);
  border-color: #38bdf8;
  box-shadow: 0 2px 12px rgba(56, 189, 248, 0.1);
}
.info-card-ok {
  border-left: 3px solid #10b981;
}
.info-card-err {
  border-left: 3px solid #ef4444;
}
.info-card-vertical {
  gap: 10px;
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
/* === 旧卡片类名兼容（已合并到 .info-card）=== */

.line-body {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
}
.line-body::after {
  content: '▶';
  position: absolute;
  right: 2px;
  top: -5px;
  font-size: 7px;
  color: #38bdf8;
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
  background: rgba(14, 28, 48, 0.3);
  padding: 4px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.rich-result-vertical-card .time-cell .lbl {
  color: #94a3b8;
  font-size: 9px;
}
.rich-result-vertical-card .time-cell .value-time {
  font-size: 11px;
  font-weight: bold;
}
.border-ok {
  border-left: 3px solid #10b981;
}
.border-err {
  border-left: 3px solid #ef4444;
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
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.health-indicator-tag.alarm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.row-top-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  align-items: center;
}
.time-node {
  color: #94a3b8;
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
  background: rgba(14, 28, 48, 0.3);
  border: 1px solid #1e3557;
  border-radius: 4px;
  padding: 8px;
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
  color: #94a3b8;
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
  color: #94a3b8;
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
  background: rgba(14, 28, 48, 0.3);
  border: 1px solid #1e3557;
  border-radius: 4px;
  padding: 8px;
}
.matrix-cell .lbl,
.single-data-line .lbl,
.row-footer-details .lbl {
  color: #94a3b8;
  margin-right: 4px;
}
.single-data-line {
  font-size: 11px;
  color: #cbd5e1;
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
.empty-hint-light {
  text-align: center;
  color: #7ea9cc;
  font-size: 12px;
  padding: 40px 12px;
  border: 1px dashed #2d4a6e;
  border-radius: 6px;
  background: rgba(14, 28, 48, 0.2);
}
.text-cyan {
  color: #38bdf8 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-orange {
  color: #f59e0b !important;
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
