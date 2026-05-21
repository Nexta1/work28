<template>
  <div class="killchain-page">
    <!-- 1. 杀伤链态势独立布局空间 -->
    <div class="status-workspace">
      <div class="workspace-header">
        <div class="brand">
          <i class="el-icon-aim"></i>
          <span>杀伤链执行态势控制台</span>
        </div>
        <div class="task-info">
          <span class="label">当前任务:</span>
          <el-select
            v-model="currentTaskName"
            size="mini"
            @change="handleTaskChange"
            class="dark-select"
          >
            <el-option
              v-for="t in taskList"
              :key="t.ZZRWID"
              :label="t.RWMC"
              :value="t.RWMC"
            />
          </el-select>
        </div>
      </div>

      <div class="status-cards-container">
        <div
          v-for="item in xxList"
          :key="item.KILLCHAIN_ID"
          :class="[
            'status-card',
            {'is-active': currentKillChainId === item.KILLCHAIN_ID},
            getStatusClass(item.KILLCHAIN_STATE)
          ]"
          @click="selectKillChain(item)"
        >
          <div class="card-tag">#{{ item.KILLCHAIN_ID }}</div>
          <div class="card-main">
            <div class="target-info">
              <span class="mbmc">{{ item.MBMC || '未知目标' }}</span>
              <span class="mbid">ID:{{ item.MBID }}</span>
            </div>
            <div class="property">
              {{ item.KILLCHAIN_TARGET_PROPERTY || '默认属性' }}
            </div>
          </div>
          <div class="card-status">
            <span class="phase">{{
              phraseMap[item.KILLCHAIN_EXECUTEPHASE]
            }}</span>
            <span class="warn" v-if="item.Killchain_Warn > 0">
              <i class="el-icon-warning-outline"></i>{{ item.Killchain_Warn }}
            </span>
          </div>
          <!-- 异常闪烁呼吸灯 -->
          <div class="alarm-light" v-if="item.KILLCHAIN_STATE === 2"></div>
        </div>
      </div>
    </div>

    <!-- 2. 主体展示区 -->
    <div class="main-content">
      <div id="container" ref="container"></div>

      <!-- 侧边统计 -->
      <div class="sidebar-panel">
        <div class="panel-title">
          <i class="el-icon-pie-chart"></i> 阶段资源分布
        </div>
        <div ref="resChart" class="chart-container"></div>

        <div class="group-info-box" :class="{'group-flash': groupNameChanged}">
          <div class="label">当前协同群组</div>
          <div class="value">{{ currentGroupName || '等待同步...' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {Graph} from '@antv/x6'
import {register} from '@antv/x6-vue-shape'
import * as echarts from 'echarts'
import PtNode from './components/PtNode.vue'
import {pageQueryTask} from '@/api/combat-task'
import {getSslxxPage, getSslqzPage, getSslqzcyPage} from '@/api/killchain'

register({shape: 'pt-node', width: 185, height: 115, component: PtNode})

export default {
  name: 'KillChainPro',
  data() {
    return {
      graph: null,
      chart: null,
      timer: null,
      isPolling: false,

      // 数据集
      taskList: [],
      xxList: [],

      // 当前选中
      currentTaskName: '',
      currentKillChainId: null,
      currentGroupName: '',

      // 特效控制
      groupNameChanged: false,
      lastPhaseState: {}, // 记录 PTID -> Phase

      phraseMap: {
        0: '发现',
        1: '定位',
        2: '跟踪',
        3: '瞄准',
        4: '打击',
        5: '评估'
      },
      stateLabel: {1: '正常', 2: '异常', 3: '完成', 4: '中止'}
    }
  },
  async mounted() {
    this.initGraph()
    this.initChart()
    await this.loadTasks()
    this.startPolling()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    // --- 逻辑链路 ---

    startPolling() {
      this.timer = setInterval(async () => {
        if (this.isPolling) return
        this.isPolling = true
        await this.runSyncWorkflow()
        this.isPolling = false
      }, 5000)
    },

    async runSyncWorkflow() {
      try {
        // 1. 获取杀伤链状态列表
        const resXX = await getSslxxPage({RWMC: this.currentTaskName})
        this.xxList = resXX.data.data.list || []
        if (this.xxList.length === 0) return

        // 自动选择逻辑：若当前未选或原ID已不存在，默认选第一个
        const activeItem = this.xxList.find(
          i => i.KILLCHAIN_ID === this.currentKillChainId
        )
        if (!activeItem) {
          this.selectKillChain(this.xxList[0])
          return
        }

        // 2. 获取群组信息（默认选第一个群组）
        const resQZ = await getSslqzPage({
          KILLCHAIN_ID: this.currentKillChainId
        })
        const groups = resQZ.data.data.list || []
        if (groups.length > 0) {
          const firstGroup = groups[0]
          // 检测群组名变化特效
          if (
            this.currentGroupName !== '' &&
            this.currentGroupName !== firstGroup.QZZRW
          ) {
            this.groupNameChanged = true
            setTimeout(() => {
              this.groupNameChanged = false
            }, 2000)
          }
          this.currentGroupName = firstGroup.QZZRW

          // 3. 渲染平台成员（参数为群组任务名称 QZZRW）
          await this.loadMembersAndRender(firstGroup.QZZRW)
        }
      } catch (e) {
        console.error('Polling Error:', e)
      }
    },

    async loadMembersAndRender(groupName) {
      const resCY = await getSslqzcyPage(this.currentKillChainId, groupName)
      const members = resCY.data.data.list || []

      // 阶段变化动效计算
      let hasChange = false
      members.forEach(m => {
        if (
          this.lastPhaseState[m.PTID] !== undefined &&
          this.lastPhaseState[m.PTID] !== m.killchain_EXECUTEPHASE
        ) {
          hasChange = true
        }
        this.lastPhaseState[m.PTID] = m.killchain_EXECUTEPHASE
      })

      this.renderGraph(members, hasChange)
      this.updateChart(members)
    },

    // --- 画布渲染 ---

    renderGraph(members, animate) {
      this.graph.clearCells()
      const stages = [0, 1, 2, 3, 4, 5]

      stages.forEach((sKey, idx) => {
        const stageX = idx * 235 + 30
        const stageMembers = members.filter(
          m => m.killchain_EXECUTEPHASE == sKey
        )

        // 绘制泳道，若有变化且本阶段有成员，触发发光特效
        const isHighlight = animate && stageMembers.length > 0

        this.graph.addNode({
          x: stageX,
          y: 15,
          width: 210,
          height: 580,
          zIndex: 1,
          label: `STAGE 0${idx + 1} · ${this.phraseMap[sKey]}`,
          attrs: {
            body: {
              fill: idx % 2 === 0 ? '#141A24' : '#171E2A',
              stroke: isHighlight ? '#00ffff' : '#222C3D',
              strokeWidth: isHighlight ? 2 : 1,
              filter: isHighlight
                ? {name: 'dropShadow', args: {color: '#00ffff', blur: 5}}
                : null
            },
            label: {refY: 25, fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}
          }
        })

        // 渲染平台
        stageMembers.forEach((m, mIdx) => {
          this.graph.addNode({
            shape: 'pt-node',
            x: stageX + 12,
            y: 70 + mIdx * 135,
            zIndex: 10,
            data: {...m, resources: []}
          })
        })
      })
    },

    // --- 工具函数 ---

    async loadTasks() {
      const res = await pageQueryTask({pageNum: 1, pageSize: 100})
      this.taskList = res.data.list || []
      if (this.taskList.length > 0) this.currentTaskName = this.taskList[0].RWMC
    },
    selectKillChain(item) {
      this.currentKillChainId = item.KILLCHAIN_ID
      this.lastPhaseState = {} // 切换链条清空对比状态
      this.runSyncWorkflow()
    },
    handleTaskChange() {
      this.currentKillChainId = null
      this.currentGroupName = ''
      this.runSyncWorkflow()
    },
    getStatusClass(state) {
      return {1: 'is-normal', 2: 'is-error', 3: 'is-done', 4: 'is-stop'}[state]
    },
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        background: {color: '#11151D'},
        panning: true,
        mousewheel: true
      })
    },
    initChart() {
      this.chart = echarts.init(this.$refs.resChart)
      this.chart.setOption({
        tooltip: {},
        xAxis: {
          type: 'category',
          data: Object.values(this.phraseMap),
          axisLabel: {color: '#64748b'}
        },
        yAxis: {type: 'value', splitLine: {lineStyle: {color: '#1e293b'}}},
        series: [{type: 'bar', data: [], itemStyle: {color: '#14b8a6'}}]
      })
    },
    updateChart(members) {
      const data = [0, 1, 2, 3, 4, 5].map(
        s => members.filter(m => m.killchain_EXECUTEPHASE == s).length
      )
      this.chart.setOption({series: [{data}]})
    },
    handleResize() {
      if (this.chart) this.chart.resize()
    }
  }
}
</script>

<style scoped>
.killchain-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  color: #f8fafc;
  overflow: hidden;
}

/* 顶部态势空间 */
.status-workspace {
  background: #111827;
  padding: 12px 20px;
  border-bottom: 1px solid #1f2937;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #14b8a6;
  font-weight: bold;
}

.status-cards-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

/* 卡片样式 */
.status-card {
  min-width: 200px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}
.status-card.is-active {
  border-color: #14b8a6;
  background: #111827;
  box-shadow: 0 0 10px rgba(20, 184, 166, 0.2);
}

.card-tag {
  font-size: 10px;
  color: #64748b;
  font-family: monospace;
}
.target-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 4px 0;
}
.mbmc {
  font-weight: bold;
  font-size: 14px;
}
.mbid {
  font-size: 11px;
  color: #475569;
}
.property {
  font-size: 12px;
  color: #94a3b8;
}
.card-status {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  border-top: 1px solid #374151;
  padding-top: 6px;
}
.phase {
  font-size: 11px;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}
.warn {
  color: #ef4444;
  font-size: 11px;
  font-weight: bold;
}

/* 状态色条 */
.is-normal {
  border-left: 3px solid #10b981;
}
.is-error {
  border-left: 3px solid #ef4444;
}
.is-done {
  border-left: 3px solid #64748b;
  opacity: 0.7;
}
.is-stop {
  border-left: 3px solid #f59e0b;
}

/* 报警呼吸灯 */
.alarm-light {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: alarm-blink 1s infinite;
}

@keyframes alarm-blink {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px #ef4444;
  }
  50% {
    opacity: 0.3;
    box-shadow: 0 0 0px #ef4444;
  }
}

/* 主视图 */
.main-content {
  flex: 1;
  display: flex;
}
#container {
  flex: 1;
}

.sidebar-panel {
  width: 280px;
  background: #111827;
  border-left: 1px solid #1f2937;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.group-info-box {
  margin-top: auto;
  background: #1f2937;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #374151;
}
.group-info-box .label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
}
.group-info-box .value {
  font-weight: bold;
  color: #14b8a6;
  font-size: 14px;
}

/* 群组名称变动闪烁 */
.group-flash {
  animation: group-bg-flash 1s 2;
}

@keyframes group-bg-flash {
  0%,
  100% {
    background: #1f2937;
  }
  50% {
    background: #14b8a6;
    color: #fff;
  }
}

/* 覆盖暗色 Select */
.dark-select ::v-deep .el-input__inner {
  background-color: #1f2937 !important;
  border: 1px solid #374151 !important;
  color: #fff !important;
}
</style>
