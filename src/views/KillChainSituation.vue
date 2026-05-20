<template>
  <div class="kill-chain-x6-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <h2 class="title">
          <i class="el-icon-cpu"></i> 杀伤链运行态势监控 - X6 可视化
        </h2>
        <p class="subtitle">
          数据同步时间：{{ lastRefreshTime || '等待同步...' }}
          <span class="view-hint"
            >| 操作：右键/左键拖拽平移，Ctrl+滚轮缩放</span
          >
        </p>
      </div>
      <el-form :model="filterForm" inline size="small" class="toolbar-form">
        <el-form-item label="任务选择">
          <el-select
            v-model="filterForm.taskId"
            placeholder="请选择作战任务"
            @change="loadData"
            style="width: 250px"
          >
            <el-option
              v-for="task in taskList"
              :key="task.ZZRWID"
              :label="task.RWMC"
              :value="task.ZZRWID"
            />
          </el-select>
        </el-form-item>
        <el-button type="primary" icon="el-icon-rank" @click="resetGraph"
          >居中视图</el-button
        >
        <el-button icon="el-icon-download" @click="exportImage">导出</el-button>
      </el-form>
    </div>

    <div class="graph-layout">
      <!-- 左侧控制图例 -->
      <div class="control-panel">
        <div class="panel-section">
          <h3>网络图层显隐</h3>
          <div class="network-legend">
            <div
              v-for="network in networks"
              :key="network.id"
              class="legend-item clickable"
              :class="{inactive: !activeNetworks[network.id]}"
              @click="toggleNetwork(network.id)"
            >
              <span
                class="network-dot"
                :style="{backgroundColor: network.color}"
              ></span>
              <span class="network-text">{{ network.name }}</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3>态势统计</h3>
          <div class="status-info">
            <div class="status-item">
              <span class="status-label">在线节点</span>
              <span class="status-value">{{ activePlatformsCount }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">通信链路</span>
              <span class="status-value">{{ activeEdgesCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 画布容器 -->
      <div class="graph-container" ref="graphContainer"></div>
    </div>

    <!-- 右侧详情面板 -->
    <transition name="panel-slide">
      <div v-if="selectedNode" class="detail-panel">
        <div class="panel-header">
          <span><i class="el-icon-aim"></i> 节点实时属性</span>
          <i class="el-icon-close" @click="selectedNode = null"></i>
        </div>
        <div class="panel-content">
          <div class="detail-section">
            <h4>身份标识</h4>
            <div class="info-row">
              <span class="label">平台名称:</span
              ><span class="value">{{ selectedNode.label }}</span>
            </div>
            <div class="info-row">
              <span class="label">网络层级:</span
              ><span class="value">{{ selectedNode.network }}</span>
            </div>
            <div class="info-row">
              <span class="label">作战阶段:</span
              ><span class="value">{{ selectedNode.stage }}</span>
            </div>
          </div>
          <div class="detail-section">
            <h4>载荷状态</h4>
            <div class="sensor-list">
              <span
                v-for="s in selectedNode.sensors"
                :key="s"
                class="sensor-tag"
                >{{ s }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {Graph} from '@antv/x6'

export default {
  name: 'KillChainFullView',
  data() {
    return {
      graph: null,
      lastRefreshTime: '', // 显式声明，修复变量未定义错误
      filterForm: {taskId: null},
      taskList: [
        {ZZRWID: '101', RWMC: '年度联合海空演习'},
        {ZZRWID: '102', RWMC: '边境态势常规监测'}
      ],
      platforms: [],
      phases: ['发现', '定位', '跟踪', '瞄准', '交战', '评估'],
      networks: [
        {id: 'strategic', name: '战略网 (SATCOM)', color: '#ff003c'},
        {id: 'tactical', name: '战术链 (LINK-16)', color: '#00f3ff'},
        {id: 'data', name: '数据链 (TCDL)', color: '#0aff00'}
      ],
      activeNetworks: {strategic: true, tactical: true, data: true},
      selectedNode: null,
      activePlatformsCount: 0,
      activeEdgesCount: 0
    }
  },
  mounted() {
    this.initGraph()
    // 默认加载第一个任务
    this.filterForm.taskId = this.taskList[0].ZZRWID
    this.loadData()
  },
  methods: {
    initGraph() {
      const container = this.$refs.graphContainer
      this.graph = new Graph({
        container: container,
        autoResize: true,
        background: {color: '#0a192f'},
        // --- 核心配置：拖拽与缩放 ---
        panning: {
          enabled: true,
          eventTypes: ['leftMouseDown', 'rightMouseDown']
        },
        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          modifiers: ['ctrl', 'meta'], // 按住 Ctrl 缩放
          minScale: 0.1,
          maxScale: 2
        },
        // ------------------------
        interacting: {nodeMovable: false},
        grid: {visible: false}
      })

      // 点击节点事件
      this.graph.on('node:click', ({node}) => {
        const data = node.getData()
        if (data && data.type !== 'header') {
          this.selectedNode = {
            label: node.getAttrByPath('label/text').split('\n').pop(),
            ...data
          }
        }
      })
    },

    loadData() {
      // 模拟接口请求
      this.generatePlatformData()
      this.renderGraph()
      this.lastRefreshTime = new Date().toLocaleTimeString()
    },

    generatePlatformData() {
      // 生成全量矩阵数据
      this.platforms = []
      this.networks.forEach((net, netIdx) => {
        this.phases.forEach((phase, phaseIdx) => {
          this.platforms.push({
            id: `node-${net.id}-${phaseIdx}`,
            label: `${net.name.split(' ')[0]}-${phase}`,
            network: net.name,
            networkId: net.id,
            stage: phase,
            stageIndex: phaseIdx,
            networkIndex: netIdx,
            icon: phaseIdx < 2 ? '🛰' : phaseIdx < 4 ? '✈' : '🚀',
            sensors: ['加密通信', '态势共享'],
            status: 'active'
          })
        })
      })
    },

    renderGraph() {
      if (!this.graph) return
      this.graph.clearCells()

      const phaseSpacing = 220 // 横向间距
      const networkSpacing = 160 // 纵向间距
      const startX = 120
      const startY = 150

      // 1. 绘制阶段标题头
      this.phases.forEach((phase, idx) => {
        this.graph.addNode({
          id: `header-${idx}`,
          x: startX + idx * phaseSpacing - 50,
          y: startY - 100,
          width: 100,
          height: 40,
          shape: 'rect',
          data: {type: 'header'},
          attrs: {
            body: {fill: 'rgba(0, 243, 255, 0.1)', stroke: '#00f3ff', rx: 20},
            label: {text: phase, fill: '#00f3ff', fontWeight: 'bold'}
          }
        })
      })

      // 2. 绘制节点
      const visibleNodes = this.platforms.filter(
        p => this.activeNetworks[p.networkId]
      )
      visibleNodes.forEach(p => {
        this.graph.addNode({
          id: p.id,
          x: startX + p.stageIndex * phaseSpacing - 60,
          y: startY + p.networkIndex * networkSpacing - 30,
          width: 120,
          height: 60,
          shape: 'rect',
          data: p,
          attrs: {
            body: {
              fill: '#0d2540',
              stroke: this.networks[p.networkIndex].color,
              strokeWidth: 2,
              rx: 4,
              style: {
                filter: `drop-shadow(0 0 5px ${
                  this.networks[p.networkIndex].color
                }44)`
              }
            },
            label: {text: `${p.icon}\n${p.label}`, fill: '#fff', fontSize: 12}
          }
        })
      })

      // 3. 绘制连接线
      this.addEdges(visibleNodes)

      // --- 关键：渲染后自动适配全屏 ---
      this.$nextTick(() => {
        this.graph.zoomToFit({padding: 50, maxScale: 1})
        this.graph.centerContent()
      })

      this.activePlatformsCount = visibleNodes.length
      this.activeEdgesCount = this.graph.getEdges().length
    },

    addEdges(nodes) {
      this.networks.forEach(net => {
        if (!this.activeNetworks[net.id]) return
        const lineNodes = nodes
          .filter(n => n.networkId === net.id)
          .sort((a, b) => a.stageIndex - b.stageIndex)
        for (let i = 0; i < lineNodes.length - 1; i++) {
          this.graph.addEdge({
            source: lineNodes[i].id,
            target: lineNodes[i + 1].id,
            connector: {name: 'smooth'},
            attrs: {
              line: {stroke: net.color, strokeWidth: 2, targetMarker: 'classic'}
            }
          })
        }
      })
    },

    toggleNetwork(networkId) {
      this.activeNetworks[networkId] = !this.activeNetworks[networkId]
      this.renderGraph()
    },

    resetGraph() {
      this.graph.zoomToFit({padding: 50, maxScale: 1})
      this.graph.centerContent()
    },

    exportImage() {
      this.graph.toPNG(dataUri => {
        const link = document.createElement('a')
        link.download = '杀伤链态势图.png'
        link.href = dataUri
        link.click()
      })
    }
  }
}
</script>

<style scoped>
.kill-chain-x6-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0a192f;
  overflow: hidden;
}

.toolbar {
  height: 80px;
  background: rgba(13, 37, 64, 0.95);
  border-bottom: 1px solid #1e3f66;
  padding: 0 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.title {
  color: #00f3ff;
  margin: 0;
  font-size: 20px;
  letter-spacing: 1px;
}
.subtitle {
  color: #8899af;
  margin-top: 5px;
  font-size: 13px;
}
.view-hint {
  color: #5c7a99;
  margin-left: 10px;
}

.graph-layout {
  flex: 1;
  display: flex;
  position: relative;
}

.control-panel {
  width: 240px;
  background: rgba(13, 37, 64, 0.8);
  border-right: 1px solid #1e3f66;
  padding: 20px;
}

.panel-section h3 {
  font-size: 14px;
  color: #00f3ff;
  margin-bottom: 15px;
  border-left: 3px solid #00f3ff;
  padding-left: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  cursor: pointer;
  transition: 0.3s;
}
.legend-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
.legend-item.inactive {
  opacity: 0.3;
  grayscale: 1;
}
.network-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 8px currentColor;
}

.status-info {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 10px;
}
.status-item {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  font-size: 13px;
  color: #b0c4de;
}
.status-value {
  color: #00f3ff;
  font-weight: bold;
}

.graph-container {
  flex: 1;
  cursor: grab;
}
.graph-container:active {
  cursor: grabbing;
}

.detail-panel {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: rgba(10, 25, 47, 0.98);
  border-left: 2px solid #00f3ff;
  z-index: 100;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #1e3f66;
  display: flex;
  justify-content: space-between;
  color: #00f3ff;
}
.panel-content {
  padding: 20px;
  color: #fff;
}
.detail-section h4 {
  font-size: 13px;
  color: #8899af;
  margin-bottom: 15px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}
.sensor-tag {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid #00f3ff;
  border-radius: 4px;
  margin: 0 8px 8px 0;
  font-size: 12px;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-slide-enter,
.panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
