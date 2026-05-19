<template>
  <div class="flow-wrapper">
    <!-- 流程图画布 -->
    <div class="x6-graph-container" ref="graphContainer"></div>

    <!-- 右侧详情面板 -->
    <div class="detail-panel" v-if="selectedItem">
      <div class="panel-header">
        <h3>{{ itemType === 'node' ? '节点信息' : '连线信息' }}</h3>
        <button @click="closePanel" class="close-btn">×</button>
      </div>

      <div class="panel-body">
        <!-- 节点表单 -->
        <div v-if="itemType === 'node'">
          <div class="form-item">
            <label>节点ID</label>
            <input type="text" v-model="selectedItem.id" disabled />
          </div>
          <div class="form-item">
            <label>节点名称</label>
            <input type="text" v-model="editForm.label" />
          </div>
          <div class="form-item">
            <label>备注说明</label>
            <textarea v-model="editForm.remark" rows="3"></textarea>
          </div>
          <div class="btn-group">
            <button @click="updateNode" class="btn save">保存</button>
            <button @click="deleteNode" class="btn delete">删除节点</button>
          </div>
        </div>

        <!-- 连线表单 -->
        <div v-else-if="itemType === 'edge'">
          <div class="form-item">
            <label>源节点</label>
            <input type="text" :value="selectedItem.source" disabled />
          </div>
          <div class="form-item">
            <label>目标节点</label>
            <input type="text" :value="selectedItem.target" disabled />
          </div>
          <div class="form-item">
            <label>连线备注</label>
            <textarea v-model="editForm.remark" rows="3"></textarea>
          </div>
          <div class="btn-group">
            <button @click="deleteEdge" class="btn delete">删除连线</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Graph } from '@antv/x6'

export default {
  name: 'X6FlowChart',
  props: {
    nodes: {
      type: Array,
      default: () => []
    },
    edges: {
      type: Array,
      default: () => []
    },
    layoutDirection: {
      type: String,
      default: 'south',
      validator: (val) => ['south', 'east'].includes(val)
    }
  },
  data() {
    return {
      graph: null,
      selectedItem: null, // 当前选中的节点/连线
      itemType: '', // node / edge
      editForm: {}, // 编辑表单
      layoutConfig: {
        nodeWidth: 180,
        nodeHeight: 60,
        hGap: 100,
        vGap: 80,
        startX: 80,
        startY: 60
      }
    }
  },
  watch: {
    nodes: { handler: 'renderGraph', deep: true },
    edges: { handler: 'renderGraph', deep: true },
    layoutDirection: 'renderGraph'
  },
  mounted() {
    this.initGraph()
    this.renderGraph()
  },
  beforeDestroy() {
    if (this.graph) this.graph.dispose()
  },
  methods: {
    // 初始化画布
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.graphContainer,
        width: this.$refs.graphContainer.offsetWidth,
        height: this.$refs.graphContainer.offsetHeight,
        background: { color: '#0a0e1a' },
        grid: {
          size: 10,
          visible: true,
          type: 'dot',
          args: { color: '#1f2937', thickness: 1 }
        },
        panning: true,
        mousewheel: { enabled: true, modifiers: 'ctrl', minScale: 0.5, maxScale: 2 },
        selecting: { enabled: true, className: 'x6-selection', showNodeSelectionBox: true },
        connecting: { enabled: false, sourceAnchor: 'bottom', targetAnchor: 'top' },
        snapline: true,
        keyboard: true,
        clipboard: true
      })

      // ========== 核心：绑定点击事件 ==========
      // 点击节点
      this.graph.on('node:click', ({ node }) => {
        this.itemType = 'node'
        this.selectedItem = {
          id: node.id,
          label: node.attr('label/text'),
          ...node.getData()
        }
        this.editForm = { ...this.selectedItem }
      })

      // 点击连线
      this.graph.on('edge:click', ({ edge }) => {
        this.itemType = 'edge'
        this.selectedItem = {
          id: edge.id,
          source: edge.getSourceCellId(),
          target: edge.getTargetCellId(),
          ...edge.getData()
        }
        this.editForm = { ...this.selectedItem }
      })

      // 点击空白关闭面板
      this.graph.on('blank:click', () => {
        this.closePanel()
      })
    },

    // 渲染画布
    renderGraph() {
      if (!this.graph || !this.nodes.length) return
      this.graph.clearCells()
      const computedNodes = this.computeNodePositions()
      this.graph.addNodes(computedNodes)
      this.graph.addEdges(this.formatEdges())
      this.autoCenterGraph()
    },

    // 自动居中
    autoCenterGraph() {
      setTimeout(() => {
        this.graph.zoomToFit({ padding: 50, maxScale: 1, minScale: 0.5 })
        this.graph.centerContent()
      }, 100)
    },

    // 计算节点位置
    computeNodePositions() {
      const { nodeWidth, nodeHeight, hGap, vGap, startX, startY } = this.layoutConfig
      const { layoutDirection } = this
      const nodeMap = {}
      const rootNodes = this.nodes.filter(node => !this.edges.some(edge => edge.target === node.id))

      const traverse = (nodeId, level, index) => {
        const node = this.nodes.find(n => n.id === nodeId)
        if (!node || nodeMap[nodeId]) return

        let x, y
        if (layoutDirection === 'east') {
          x = startX + level * (nodeWidth + hGap)
          y = startY + index * (nodeHeight + vGap)
        } else {
          x = startX + index * (nodeWidth + hGap)
          y = startY + level * (nodeHeight + vGap)
        }
        nodeMap[nodeId] = { x, y }

        const childNodes = this.edges.filter(e => e.source === nodeId).map(e => e.target)
        childNodes.forEach((cid, i) => traverse(cid, level + 1, i))
      }

      rootNodes.forEach((root, i) => traverse(root.id, 0, i))

      return this.nodes.map(node => ({
        id: node.id,
        shape: 'rect',
        x: nodeMap[node.id].x,
        y: nodeMap[node.id].y,
        width: nodeWidth,
        height: nodeHeight,
        data: { label: node.label, remark: node.remark || '' },
        attrs: {
          body: { fill: '#1e293b', stroke: '#38bdf8', strokeWidth: 2, rx: 8, ry: 8 },
          label: { text: node.label, fill: '#fff', fontSize: 14, fontWeight: 'bold' }
        }
      }))
    },

    // 格式化连线
    formatEdges() {
      return this.edges.map(edge => ({
        id: `edge-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        data: { remark: edge.remark || '' },
        sourceAnchor: this.layoutDirection === 'east' ? 'right' : 'bottom',
        targetAnchor: this.layoutDirection === 'east' ? 'left' : 'top',
        attrs: {
          line: { stroke: '#38bdf8', strokeWidth: 2, targetMarker: { name: 'block', width: 8, height: 8, fill: '#38bdf8' } }
        }
      }))
    },

    // ========== 面板操作 ==========
    closePanel() {
      this.selectedItem = null
      this.itemType = ''
      this.editForm = {}
    },
    // 更新节点
    updateNode() {
      const node = this.graph.getCellById(this.selectedItem.id)
      if (node) {
        node.attr('label/text', this.editForm.label)
        node.setData(this.editForm)
        this.selectedItem = { ...this.editForm }
        alert('节点已更新')
      }
    },
    // 删除节点
    deleteNode() {
      if (!confirm('确定删除该节点？')) return
      this.graph.removeNode(this.selectedItem.id)
      this.$emit('update:nodes', this.nodes.filter(n => n.id !== this.selectedItem.id))
      this.closePanel()
    },
    // 删除连线
    deleteEdge() {
      if (!confirm('确定删除该连线？')) return
      this.graph.removeEdge(this.selectedItem.id)
      this.$emit('update:edges', this.edges.filter(e => e.source+e.target !== this.selectedItem.source+this.selectedItem.target))
      this.closePanel()
    }
  }
}
</script>

<style scoped>
.flow-wrapper {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 600px;
  position: relative;
}

.x6-graph-container {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #0a0e1a;
}

/* 右侧详情面板 */
.detail-panel {
  width: 320px;
  background: #111827;
  border-radius: 8px;
  border: 2px solid #38bdf8;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(56, 189, 248, 0.2);
  flex-shrink: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #374151;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 20px;
  cursor: pointer;
}

.panel-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  max-height: calc(100% - 60px);
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  color: #d1d5db;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 4px;
  border: 2px solid #38bdf8;
  background: #0f172a;
  color: #fff;
  box-sizing: border-box;
  font-size: 13px;
}

.form-item input:focus,
.form-item textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.3);
}

.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  flex: 1;
  padding: 8px 0;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn.save {
  background: #2563eb;
  color: #fff;
}

.btn.delete {
  background: #ef4444;
  color: #fff;
}
</style>

<style>
.x6-selection {
  background-color: rgba(56, 189, 248, 0.1);
  border: 1px solid #38bdf8;
}
.x6-node-selected .x6-node-body {
  stroke: #fbbf24 !important;
  stroke-width: 3px !important;
}
</style>