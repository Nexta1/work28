<template>
  <div class="x6-graph-wrapper">
    <div class="canvas-floating-toolbar" v-if="steps && steps.length">
      <el-button
        type="primary"
        size="mini"
        circle
        icon="el-icon-rank"
        title="适应画布"
        @click="resetLayout"
      />
    </div>

    <div v-if="!steps || !steps.length" class="empty-fallback">
      <div class="radar-scan-loader"></div>
      <p>请选择左侧数据采集项目以激活 X6 步骤流程图...</p>
    </div>

    <div
      id="data-project-x6-canvas"
      ref="canvasContainer"
      class="x6-graph-instance"
    ></div>
  </div>
</template>

<script>
import {Graph} from '@antv/x6'
import {DagreLayout} from '@antv/layout'

export default {
  name: 'ProjectGraphX6',
  props: {
    steps: {
      type: Array,
      default: () => []
    },
    layoutDirection: {
      type: String,
      default: 'LR' // 'LR' 朝东(左右)，'TB' 朝南(上下)
    }
  },
  data() {
    return {
      graph: null,
      resizeObserver: null,
      renderTimestamp: Date.now()
    }
  },
  watch: {
    steps: {
      handler(newVal) {
        if (newVal && newVal.length) {
          this.renderTimestamp = Date.now()
          this.$nextTick(() => {
            this.renderStepGraph()
          })
        } else {
          this.clearCanvas()
        }
      },
      deep: true
    },
    layoutDirection() {
      this.$nextTick(() => {
        this.renderStepGraph()
      })
    }
  },
  mounted() {
    this.initGraph()
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
    if (this.graph) {
      this.graph.dispose()
    }
  },
  methods: {
    initGraph() {
      this.$nextTick(() => {
        const container = document.getElementById('data-project-x6-canvas')
        if (!container) return

        this.graph = new Graph({
          container,
          background: {color: '#070c14'},
          grid: {
            visible: true,
            type: 'dot',
            args: {color: '#1f2d44', thickness: 1}
          },
          panning: true,
          mousewheel: {enabled: true, modifiers: ['ctrl', 'meta']},
          connecting: {
            connector: 'rounded',
            router: {name: 'manhattan'},
            allowBlank: false
          }
        })

        // 监听业务节点的双击事件
        this.graph.on('node:dblclick', ({node}) => {
          this.$emit('node-dblclick', node.getData())
        })

        // 精准监听容器大小变化
        this.resizeObserver = new ResizeObserver(() => {
          this.resizeGraph()
        })
        const parentContainer = container.parentElement
        if (parentContainer) {
          this.resizeObserver.observe(parentContainer)
        }

        if (this.steps && this.steps.length) {
          this.renderStepGraph()
        }
      })
    },

    resizeGraph() {
      if (!this.graph) return
      const container = document.getElementById('data-project-x6-canvas')
      const parent = container ? container.parentElement : null
      if (container && parent) {
        const width = parent.clientWidth
        const height = parent.clientHeight
        if (width > 0 && height > 0) {
          this.graph.resize(width, height)
          // 彻底禁止了随容器改变时自动缩放
        }
      }
    },

    clearCanvas() {
      if (!this.graph) return
      this.graph.clearCells({silent: true})
    },

    toIdArray(value) {
      if (!value) return []
      if (Array.isArray(value)) return value.map(v => Number(v)).filter(Boolean)
      return String(value)
        .split(',')
        .map(v => Number(v))
        .filter(Boolean)
    },

    renderStepGraph() {
      if (!this.graph) return

      this.clearCanvas()

      const steps = this.steps || []
      if (!steps.length) return

      const nodesData = []
      const edgesData = []
      const nodeMap = {}

      steps.forEach(step => {
        nodeMap[step.dataProjectStepId] = step
      })

      const nodeWidth = 160
      const nodeHeight = 42
      const isLR = this.layoutDirection === 'LR'

      steps.forEach(step => {
        const inputStr = step.inputStepIds
          ? String(step.inputStepIds).replace(/,/g, '_')
          : 'none'
        const uniqueNodeId = `step-${step.dataProjectStepId}-${this.renderTimestamp}-${inputStr}`

        nodesData.push({
          id: uniqueNodeId,
          width: nodeWidth,
          height: nodeHeight,
          data: step
        })

        const inputIds = this.toIdArray(step.inputStepIds)
        inputIds.forEach(inputId => {
          if (nodeMap[inputId]) {
            const parentStep = nodeMap[inputId]
            const parentInputStr = parentStep.inputStepIds
              ? String(parentStep.inputStepIds).replace(/,/g, '_')
              : 'none'
            const uniqueSourceId = `step-${inputId}-${this.renderTimestamp}-${parentInputStr}`

            edgesData.push({
              source: uniqueSourceId,
              target: uniqueNodeId,
              sourcePort: isLR ? 'out-right' : 'out-bottom',
              targetPort: isLR ? 'in-left' : 'in-top'
            })
          }
        })
      })

      // 调整间距：朝东时左右间距 35，朝南时左右列间距收紧到较小的 45
      const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: this.layoutDirection,
        nodesep: isLR ? 35 : 55,
        ranksep: isLR ? 65 : 25,
        controlPoints: false
      })

      const layoutResult = dagreLayout.layout({
        nodes: nodesData,
        edges: edgesData
      })

      const cellsToConfirm = []

      // 渲染步骤节点
      layoutResult.nodes.forEach(nodeItem => {
        const step = nodeItem.data
        const ports = [
          {id: 'in-left', group: 'left'},
          {id: 'out-right', group: 'right'},
          {id: 'in-top', group: 'top'},
          {id: 'out-bottom', group: 'bottom'}
        ]

        const newNode = this.graph.createNode({
          id: nodeItem.id,
          x: nodeItem.x,
          y: nodeItem.y,
          width: nodeItem.width,
          height: nodeItem.height,
          shape: 'rect',
          ports: {
            groups: {
              left: {position: 'left', attrs: {circle: {r: 0, magnet: true}}},
              right: {position: 'right', attrs: {circle: {r: 0, magnet: true}}},
              top: {position: 'top', attrs: {circle: {r: 0, magnet: true}}},
              bottom: {
                position: 'bottom',
                attrs: {circle: {r: 0, magnet: true}}
              }
            },
            items: ports
          },
          attrs: {
            body: {
              rx: 6,
              ry: 6,
              fill: Number(step.stepState) === 1 ? '#0d2531' : '#1b2431',
              stroke: Number(step.stepState) === 1 ? '#38bdf8' : '#475569',
              strokeWidth: 1.4
            },
            label: {
              text: `${step.stepNumber || '-'} ${step.stepName || '未命名步骤'}`,
              fill: '#e2e8f0',
              fontSize: 12
            }
          },
          data: step
        })
        cellsToConfirm.push(newNode)
      })

      // 渲染连线
      layoutResult.edges.forEach(edgeItem => {
        const newEdge = this.graph.createEdge({
          source: {cell: edgeItem.source, port: edgeItem.sourcePort},
          target: {cell: edgeItem.target, port: edgeItem.targetPort},
          attrs: {
            line: {
              stroke: '#38bdf8',
              strokeWidth: 1.2,
              targetMarker: {name: 'classic', size: 7}
            }
          },
          router: {name: 'manhattan'},
          connector: {name: 'rounded'}
        })
        cellsToConfirm.push(newEdge)
      })

      // 将节点推入画布
      this.graph.resetCells(cellsToConfirm)

      // 核心调整：数据初次刷新时，以 1:1 默认比例把画幅居中，绝不执行任何“自动撑满自适应”
      this.graph.zoomTo(1)
      this.graph.centerContent()
    },

    // 2. 增量修改：供左上角按钮手动点击时触发的“适应画布”逻辑
    resetLayout() {
      if (!this.graph || !this.steps.length) return

      // 让画布内所有节点和边自适应当前视口大小并充满
      this.graph.zoomToFit({
        padding: 40, // 缩放充满后四周留白大小
        maxZoom: 1.1, // 限制节点过少时被过度放大的上限
        minZoom: 0.15, // 缩小的下限
        includeEdges: true // 将连线段一并计算进缩放边界内
      })
      this.graph.centerContent() // 精准居中
    }
  }
}
</script>

<style scoped>
.x6-graph-wrapper {
  width: 100%;
  height: 100%;
  position: relative; /* 保证子元素能做绝对定位 */
}

/* 3. 增量修改：添加左上角浮动工具栏的样式配置 */
.canvas-floating-toolbar {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10; /* 确保悬浮在画布 DOM 之上 */
  pointer-events: auto;
}

/* 让 Element 圆形按钮带有轻微的高级科技悬浮感 */
.canvas-floating-toolbar .el-button {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5) !important;
  transition: transform 0.15s ease !important;
}
.canvas-floating-toolbar .el-button:hover {
  transform: scale(1.08);
}

.x6-graph-instance {
  width: 100%;
  height: 100%;
}
.empty-fallback {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #070c14;
  color: #415169;
  font-size: 11px;
}
.radar-scan-loader {
  width: 32px;
  height: 32px;
  border: 2px dashed #172438;
  border-radius: 50%;
  animation: spin 4s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
