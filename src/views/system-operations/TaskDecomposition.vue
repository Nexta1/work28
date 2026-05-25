<template>
  <div class="system-container">
    <!-- 顶部 -->
    <div class="header">
      <div class="header-left">
        <div class="logo" />
        <div class="title">体系运控分系统</div>
      </div>

      <div class="header-right">
        <div class="status-card online">
          <div class="label">在线网络</div>
          <div class="value">24</div>
        </div>

        <div class="status-card running">
          <div class="label">执行任务</div>
          <div class="value">12</div>
        </div>

        <div class="status-card warning">
          <div class="label">告警数量</div>
          <div class="value">3</div>
        </div>
      </div>
    </div>

    <!-- 主体 -->
    <div class="main">
      <!-- 左侧 -->
      <div class="left-panel">
        <div class="panel-title">作战任务树</div>

        <el-tree
          :data="treeData"
          node-key="id"
          default-expand-all
          highlight-current
          @node-click="handleNodeClick"
        >
          <span slot-scope="{data}" class="tree-node">
            <i :class="data.icon" />
            <span>{{ data.label }}</span>
          </span>
        </el-tree>
      </div>

      <!-- 中间 -->
      <div class="center-panel">
        <div class="toolbar">
          <el-button size="mini" type="primary" @click="changeDirection('LR')">
            左右布局
          </el-button>

          <el-button size="mini" @click="changeDirection('TB')">
            上下布局
          </el-button>

          <el-button size="mini" type="success" @click="fitView">
            自适应
          </el-button>
        </div>

        <div ref="container" class="graph-container" />
      </div>

      <!-- 右侧 -->
      <div class="right-panel">
        <div class="panel-title">节点详情</div>

        <div v-if="currentNode" class="detail-card">
          <div class="detail-item">
            <span class="label">名称：</span>
            <span>{{ currentNode.label }}</span>
          </div>

          <div class="detail-item">
            <span class="label">类型：</span>
            <span>{{ currentNode.type }}</span>
          </div>

          <div class="detail-item">
            <span class="label">状态：</span>
            <el-tag size="mini" type="success"> 正常 </el-tag>
          </div>

          <div class="detail-item">
            <span class="label">描述：</span>
            <span>当前节点运行正常</span>
          </div>
        </div>

        <div class="panel-title chart-title">任务状态统计</div>

        <div ref="chart" class="chart-container" />
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {Graph} from '@antv/x6'
import dagre from 'dagre'

export default {
  name: 'TaskTopology',

  data() {
    return {
      graph: null,

      chart: null,

      direction: 'LR',

      currentNode: null,

      treeData: [
        {
          id: 1,
          label: '联合打击任务',
          type: '任务',
          icon: 'el-icon-s-operation',
          children: [
            {
              id: 11,
              label: '侦察群组',
              type: '群组',
              icon: 'el-icon-connection',
              children: [
                {
                  id: 111,
                  label: '数据链网络',
                  type: '网络',
                  icon: 'el-icon-share'
                },
                {
                  id: 112,
                  label: '无人机平台',
                  type: '平台',
                  icon: 'el-icon-cpu'
                }
              ]
            },
            {
              id: 12,
              label: '火力群组',
              type: '群组',
              icon: 'el-icon-s-grid',
              children: [
                {
                  id: 121,
                  label: '火控网络',
                  type: '网络',
                  icon: 'el-icon-share'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  mounted() {
    this.initGraph()
    this.renderGraph()
    this.initChart()
  },

  methods: {
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,

        grid: true,

        background: {
          color: '#0f172a'
        },

        mousewheel: {
          enabled: true,
          zoomAtMousePosition: true,
          minScale: 0.5,
          maxScale: 2
        },

        connecting: {
          router: 'manhattan',
          connector: 'rounded'
        }
      })
    },

    renderGraph() {
      const nodes = [
        {
          id: 'task',
          label: '作战任务',
          type: 'task'
        },
        {
          id: 'group1',
          label: '侦察群组',
          type: 'group'
        },
        {
          id: 'group2',
          label: '火力群组',
          type: 'group'
        },
        {
          id: 'network1',
          label: '数据链网络',
          type: 'network'
        },
        {
          id: 'network2',
          label: '火控网络',
          type: 'network'
        },
        {
          id: 'target',
          label: '目标系统',
          type: 'target'
        }
      ]

      const edges = [
        {
          source: 'task',
          target: 'group1'
        },
        {
          source: 'task',
          target: 'group2'
        },
        {
          source: 'group1',
          target: 'network1'
        },
        {
          source: 'group2',
          target: 'network2'
        },
        {
          source: 'network2',
          target: 'target'
        }
      ]

      const g = new dagre.graphlib.Graph()

      g.setGraph({
        rankdir: this.direction,
        ranksep: 80,
        nodesep: 40
      })

      g.setDefaultEdgeLabel(() => ({}))

      nodes.forEach(node => {
        g.setNode(node.id, {
          width: 180,
          height: 60
        })
      })

      edges.forEach(edge => {
        g.setEdge(edge.source, edge.target)
      })

      dagre.layout(g)

      this.graph.clearCells()

      nodes.forEach(node => {
        const pos = g.node(node.id)

        this.graph.addNode({
          id: node.id,

          x: pos.x,

          y: pos.y,

          width: 180,

          height: 60,

          label: node.label,

          attrs: {
            body: {
              fill: this.getNodeColor(node.type),
              stroke: '#3b82f6',
              strokeWidth: 1,
              rx: 10,
              ry: 10
            },

            label: {
              fill: '#fff',
              fontSize: 14
            }
          },

          data: node
        })
      })

      edges.forEach(edge => {
        this.graph.addEdge({
          source: edge.source,
          target: edge.target,

          attrs: {
            line: {
              stroke: '#60a5fa',
              strokeWidth: 2,
              targetMarker: {
                name: 'classic',
                size: 8
              },
              strokeDasharray: 6,
              style: {
                animation: 'lineFlow 20s infinite linear'
              }
            }
          }
        })
      })

      this.graph.centerContent()

      this.graph.on('node:click', ({node}) => {
        this.currentNode = node.getData()
      })
    },

    getNodeColor(type) {
      const map = {
        task: '#2563eb',
        group: '#059669',
        network: '#7c3aed',
        target: '#dc2626'
      }

      return map[type] || '#334155'
    },

    changeDirection(direction) {
      this.direction = direction
      this.renderGraph()
    },

    fitView() {
      this.graph.zoomToFit({
        padding: 20
      })
    },

    handleNodeClick(data) {
      this.currentNode = data
    },

    initChart() {
      this.chart = echarts.init(this.$refs.chart)

      this.chart.setOption({
        backgroundColor: 'transparent',

        tooltip: {},

        grid: {
          left: 30,
          right: 10,
          top: 30,
          bottom: 30
        },

        xAxis: {
          type: 'category',
          data: ['执行中', '待执行', '完成', '告警'],
          axisLabel: {
            color: '#cbd5e1'
          },
          axisLine: {
            lineStyle: {
              color: '#475569'
            }
          }
        },

        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#cbd5e1'
          },
          splitLine: {
            lineStyle: {
              color: '#1e293b'
            }
          }
        },

        series: [
          {
            type: 'bar',

            data: [12, 8, 20, 3],

            barWidth: 30,

            itemStyle: {
              borderRadius: [6, 6, 0, 0],
              color(params) {
                const colors = ['#3b82f6', '#eab308', '#10b981', '#ef4444']

                return colors[params.dataIndex]
              }
            }
          }
        ]
      })
    }
  }
}
</script>

<style scoped>
.system-container {
  width: 100%;
  height: 100vh;
  background: #020617;
  color: #fff;
  overflow: hidden;
}

/* 顶部 */

.header {
  height: 70px;
  border-bottom: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: #0f172a;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  margin-right: 14px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
}

.header-right {
  display: flex;
  gap: 14px;
}

.status-card {
  width: 120px;
  height: 50px;
  border-radius: 10px;
  padding: 6px 12px;
  background: #111827;
  border: 1px solid #1e293b;
}

.status-card .label {
  font-size: 12px;
  color: #94a3b8;
}

.status-card .value {
  font-size: 20px;
  font-weight: bold;
  margin-top: 4px;
}

/* 主体 */

.main {
  display: flex;
  height: calc(100vh - 70px);
}

/* 左侧 */

.left-panel {
  width: 260px;
  border-right: 1px solid #1e293b;
  background: #0f172a;
  overflow: auto;
}

/* 中间 */

.center-panel {
  flex: 1;
  position: relative;
  background: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 30px 30px;
}

/* 右侧 */

.right-panel {
  width: 320px;
  border-left: 1px solid #1e293b;
  background: #0f172a;
  overflow: auto;
}

.panel-title {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #1e293b;
}

.toolbar {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  display: flex;
  gap: 10px;
}

.graph-container {
  width: 100%;
  height: 100%;
}

.detail-card {
  padding: 16px;
}

.detail-item {
  margin-bottom: 16px;
  font-size: 14px;
}

.detail-item .label {
  color: #94a3b8;
}

.chart-title {
  margin-top: 10px;
}

.chart-container {
  height: 260px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e2e8f0;
}

/* element */

::v-deep .el-tree {
  background: transparent;
  color: #fff;
}

::v-deep .el-tree-node__content:hover {
  background: #1e293b;
}

::v-deep .el-tree-node:focus > .el-tree-node__content {
  background: #1d4ed8;
}

/* 动画 */

@keyframes lineFlow {
  from {
    stroke-dashoffset: 1000;
  }

  to {
    stroke-dashoffset: 0;
  }
}
</style>
