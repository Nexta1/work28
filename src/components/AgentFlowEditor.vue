<template>
  <div class="editor-container">
    <!-- 左侧侧边栏 (Stencil) -->
    <div id="stencil" class="stencil-container"></div>
    <!-- 右侧画布 (Graph) -->
    <div id="graph-container" class="graph-container"></div>
  </div>
</template>

<script>/* eslint-disable no-unused-vars */

import { Graph, Snapline, Stencil } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'
import insertCss from 'insert-css'

// 引入定义的 Vue 组件作为节点
import AgentReactCard from './nodes/AgentReactCard.vue'
import FlowCard from './nodes/FlowCard.vue'

export default {
  name: 'AgentFlowEditor',
  data() {
    return {
      graph: null,
      stencil: null,
      CARD_WIDTH: 260,
      CARD_HEIGHT: 96,
      PORT_DOT_RADIUS: 3,
      COLOR_PORT_GRAY: '#C2C8D5',
      COLOR_PORT_BLUE: '#5F95FF',
      agentConfigs: null,
    }
  },
  created(){this.registerShapes()},
  mounted() {
    this.initStyles()
    this.initGraph()
    this.initStencil()
   
    this.bindEvents()
    this.loadDataAndRender() 
    
  },
  beforeDestroy() {
    if (this.graph) {
      this.graph.dispose()
    }
  },
  methods: {
    initStyles() {
      // 将原 insertCss 内容放入此处，或直接写在 <style> 标签中
      insertCss(`
        .editor-container {
          display: flex;
          border: 1px solid #dfe3e8;
          height: 600px; /* 适当调整高度 */
        }
        .stencil-container {
          width: 260px;
          height: 100%;
          position: relative;
          border-right: 1px solid #dfe3e8;
          background: #fff;
        }
        .graph-container {
          flex: 1;
          height: 100%;
          background: #fff;
        }
        .x6-widget-stencil { background-color: #fff; }
        .x6-widget-stencil-title { background-color: #fff; }
        .x6-widget-stencil-group-title {
          background-color: #fff !important;
          border: 1px solid #d9d9d9 !important;
          border-radius: 4px !important;
          padding: 8px 12px !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
        }
        .x6-widget-stencil-group {
          margin-bottom: 12px !important;
          border-left: 4px solid #5F95FF;
          padding-left: 8px;
        }
        .x6-widget-stencil-group-content {
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          padding: 8px;
        }
      `)
    },
    initGraph() {
      const { COLOR_PORT_BLUE, COLOR_PORT_GRAY } = this
      this.graph = new Graph({
        container: document.getElementById('graph-container'),
        grid: true,
        mousewheel: { enabled: true, minScale: 0.5, maxScale: 3 },
        connecting: {
          connector: { name: 'smooth' },
          connectionPoint: 'anchor',
          allowBlank: false,
          snap: { radius: 20 },
          allowEdge: false,
          allowLoop: false,
          highlight: true,
          createEdge: () => this.graph.createEdge({ shape: 'agent-edge' }),
          validateConnection: ({ targetMagnet }) => !!targetMagnet,
        },
        highlighting: {
          magnetAdsorbed: {
            name: 'stroke',
            args: {
              attrs: { fill: COLOR_PORT_BLUE, stroke: COLOR_PORT_BLUE },
            },
          },
        },
      })
      this.graph.use(new Snapline())

      Graph.registerEdge(
        'agent-edge',
        {
          inherit: 'edge',
          attrs: {
            line: { stroke: COLOR_PORT_BLUE, strokeWidth: 2, targetMarker: 'block' },
          },
        },
        true,
      )
    },
    initStencil() {
      this.stencil = new Stencil({
        title: '智能体流程编排',
        target: this.graph,
        stencilGraphWidth: 240,
        stencilGraphHeight: 480,
        stencilGraphOptions: { panning: true },
        collapsable: true,
        groups: [
          {
            title: '业务逻辑',
            name: 'biz',
            graphHeight: 380,
            layoutOptions: { rowHeight: 88 },
          },
          {
            title: '知识库&数据',
            name: 'data',
            graphHeight: 300,
            layoutOptions: { rowHeight: 88 },
          },
        ],
        layoutOptions: { columns: 1, columnWidth: 230, rowHeight: 88, dx: 8 },
      })
      document.getElementById('stencil').appendChild(this.stencil.container)
    },
    registerShapes() {
      console.log(this.CARD_WIDTH,register)
      // 注册 Vue 组件形状
      register({
        shape: 'agent-react-card',
           width: 260,
    height: 96,
        effect: ['data'], // 监听 data 变化
        component: AgentReactCard,
      })

      register({
        shape: 'agent-start-card',
          width: 260,
    height: 96,
        effect: ['data'],
        component: FlowCard,
      })

      register({
        shape: 'agent-end-card',
          width: 260,
    height: 96,
        effect: ['data'],
        component: FlowCard,
      })
  console.log('Node registered successfully');
      // 注册侧边栏用的普通 SVG 节点
      Graph.registerNode(
        'agent-stencil-card',
        {
          inherit: 'rect',
          width: 220,
          height: 66,
          markup: [
            { tagName: 'rect', selector: 'body' },
            { tagName: 'rect', selector: 'iconRect' },
            { tagName: 'text', selector: 'iconLabel' },
            { tagName: 'text', selector: 'title' },
            { tagName: 'text', selector: 'desc' },
          ],
          attrs: {
            body: { stroke: '#5F95FF', strokeWidth: 1, fill: '#fff', rx: 8, ry: 8 },
            iconRect: { width: 32, height: 32, rx: 8, ry: 8, refX: 12, refY: 20, fill: '#F0F5FF' },
            iconLabel: { refX: 28, refY: 36, textAnchor: 'middle', textVerticalAnchor: 'middle', fontSize: 12, fontWeight: 600, fill: '#1D39C4' },
            title: { refX: 60, refY: 26, textAnchor: 'start', textVerticalAnchor: 'middle', fontSize: 14, fontWeight: 600, fill: '#141414', textWrap: { width: 170, height: 20, ellipsis: '…' } },
            desc: { refX: 60, refY: 46, textAnchor: 'start', textVerticalAnchor: 'middle', fontSize: 12, fill: 'rgba(0,0,0,0.65)', textWrap: { width: 170, height: 32, ellipsis: '…' } },
          },
          ports: this.getPortsConfig(),
        },
        true,
      )
    },
    getPortsConfig() {
      const { PORT_DOT_RADIUS, COLOR_PORT_GRAY } = this
      const basePortAttrs = {
        r: PORT_DOT_RADIUS,
        magnet: true,
        stroke: COLOR_PORT_GRAY,
        strokeWidth: 1,
        fill: COLOR_PORT_GRAY,
        style: { visibility: 'hidden' },
      }
      const createPortGroup = (position) => ({
        position,
        attrs: { circle: { ...basePortAttrs } },
      })
      return {
        groups: {
          top: createPortGroup('top'),
          right: createPortGroup('right'),
          bottom: createPortGroup('bottom'),
          left: createPortGroup('left'),
        },
        items: [
          { id: 'top', group: 'top' },
          { id: 'right', group: 'right' },
          { id: 'bottom', group: 'bottom' },
          { id: 'left', group: 'left' },
        ],
      }
    },
    bindEvents() {
      const graph = this.graph
      const { COLOR_PORT_BLUE, COLOR_PORT_GRAY } = this

      const isPortConnected = (node, portId) => {
        const edges = graph.getConnectedEdges(node)
        return edges.some(
          (e) =>
            (e.getSourceCellId() === node.id && e.getSourcePortId() === portId) ||
            (e.getTargetCellId() === node.id && e.getTargetPortId() === portId)
        )
      }

      const setPortDot = (node, portId, visible, color) => {
        node.setPortProp(portId, 'attrs/circle/style/visibility', visible ? 'visible' : 'hidden')
        if (color) {
          node.setPortProp(portId, 'attrs/circle/fill', color)
          node.setPortProp(portId, 'attrs/circle/stroke', color)
        }
      }

      const showNodePorts = (node, show) => {
        const ps = node.getPorts()
        for (let i = 0; i < ps.length; i += 1) {
          const id = ps[i].id
          if (show) {
            setPortDot(node, id, true)
          } else {
            const connected = isPortConnected(node, id)
            setPortDot(node, id, connected, connected ? COLOR_PORT_BLUE : COLOR_PORT_GRAY)
          }
        }
      }

      graph.on('node:mouseenter', ({ node }) => showNodePorts(node, true))
      graph.on('node:mouseleave', ({ node }) => showNodePorts(node, false))
      
      graph.on('edge:mouseenter', ({ edge }) => {
        edge.addTools({ name: 'button-remove', args: { distance: -40 } })
      })
      graph.on('edge:mouseleave', ({ edge }) => {
        edge.removeTools()
      })

      graph.on('edge:connected', ({ currentCell, currentPort }) => {
        if (!currentPort) return
        setPortDot(currentCell, currentPort, true, COLOR_PORT_BLUE)
      })

      const updatePortsOnEdgeChange = (edge, isAdd) => {
        const update = (cellId, portId) => {
          if (!cellId || !portId) return
          const cell = graph.getCellById(cellId)
          if (cell && cell.isNode()) {
            const stillConnected = isPortConnected(cell, portId)
            // 如果是添加边，强制显示蓝色；如果是删除边，检查是否还有其他连接
            if (isAdd) {
              setPortDot(cell, portId, true, COLOR_PORT_BLUE)
            } else {
              setPortDot(cell, portId, stillConnected, stillConnected ? COLOR_PORT_BLUE : COLOR_PORT_GRAY)
            }
          }
        }
        update(edge.getSourceCellId(), edge.getSourcePortId())
        update(edge.getTargetCellId(), edge.getTargetPortId())
      }

      graph.on('edge:added', ({ edge }) => updatePortsOnEdgeChange(edge, true))
      graph.on('edge:removed', ({ edge }) => updatePortsOnEdgeChange(edge, false))

      // 自动转换侧边栏拖入的节点
      graph.on('node:added', ({ node }) => {
        const data = node.getData()
        const type = data?.type
        if (type && node.shape !== 'agent-react-card' && this.agentConfigs) {
          const cfg = this.agentConfigs[type]
          if (cfg) {
            const { x, y } = node.position()
            const newNode = this.createAgentCard(cfg).position(x, y)
            node.remove()
            graph.addNode(newNode)
          }
        }
      })
    },
    createAgentCard(cfg) {
      return this.graph.createNode({
        shape: 'agent-react-card',
        width: this.CARD_WIDTH,
        height: this.CARD_HEIGHT,
        data: cfg,
        ports: this.getPortsConfig(),
      })
    },
    createFlowCard(kind, data) {
      return this.graph.createNode({
        shape: kind === 'start' ? 'agent-start-card' : 'agent-end-card',
        width: this.CARD_WIDTH,
        height: this.CARD_HEIGHT,
        data: data,
        ports: this.getPortsConfig(),
      })
    },
    createAgentStencilCard(cfg) {
      const themeMap = {
        blue: { rectFill: '#F0F5FF', textFill: '#1D39C4' },
        green: { rectFill: '#E6FFFB', textFill: '#08979C' },
        orange: { rectFill: '#FFF7E6', textFill: '#FA8C16' },
        red: { rectFill: '#FFF1F0', textFill: '#CF1322' },
      }
      const theme = cfg.theme ?? 'blue'
      const colors = themeMap[theme]
      return this.graph.createNode({
        shape: 'agent-stencil-card',
        attrs: {
          iconRect: { fill: colors.rectFill },
          iconLabel: { text: cfg.iconText, fill: colors.textFill },
          title: { text: cfg.title },
          desc: { text: cfg.desc },
        },
        data: { type: cfg.key },
        ports: this.getPortsConfig(),
      })
    },
    async loadDataAndRender() {
      try {
        // 模拟 fetch，实际项目中请替换为真实 API 或 require
        // const res = await fetch('/data/agent-flow.json')
        // this.agentConfigs = await res.json()
        
        // 为了演示，这里硬编码配置
        this.agentConfigs = {
          llm: { key: 'llm', iconText: 'LLM', title: '大语言模型', desc: '调用 LLM 进行推理', theme: 'blue', inputPlaceholder: '输入 Prompt' },
          code: { key: 'code', iconText: 'Code', title: '代码执行', desc: '运行 Python/JS 代码', theme: 'green' },
          branch: { key: 'branch', iconText: 'If', title: '条件分支', desc: '根据条件分流', theme: 'orange' },
          loop: { key: 'loop', iconText: 'Loop', title: '循环', desc: '重复执行任务', theme: 'red' },
          kb: { key: 'kb', iconText: 'KB', title: '知识库', desc: '检索外部知识', theme: 'blue' },
          mcp: { key: 'mcp', iconText: 'MCP', title: 'MCP 服务', desc: '模型上下文协议', theme: 'green' },
          db: { key: 'db', iconText: 'DB', title: '数据库', desc: '读写业务数据', theme: 'orange' },
        }

        const cfg = (key) => this.agentConfigs[key]

        this.stencil.load(
          [
            this.createAgentStencilCard(cfg('llm')),
            this.createAgentStencilCard(cfg('code')),
            this.createAgentStencilCard(cfg('branch')),
            this.createAgentStencilCard(cfg('loop')),
          ],
          'biz'
        )

        this.stencil.load(
          [
            this.createAgentStencilCard(cfg('kb')),
            this.createAgentStencilCard(cfg('mcp')),
            this.createAgentStencilCard(cfg('db')),
          ],
          'data'
        )

        const start = this.graph.addNode(
          this.createFlowCard('start', { title: '开始', badge: '触发器' }).position(60, 60)
        )

        const llm = this.graph.addNode(
          this.createAgentCard(cfg('llm')).position(220, 220)
        )

        const end = this.graph.addNode(
          this.createFlowCard('end', { title: '结束', badge: '输出器' }).position(360, 380)
        )

        this.graph.addEdge({
          shape: 'agent-edge',
          source: { cell: start.id, port: 'bottom' },
          target: { cell: llm.id, port: 'top' },
        })
        this.graph.addEdge({
          shape: 'agent-edge',
          source: { cell: llm.id, port: 'bottom' },
          target: { cell: end.id, port: 'top' },
        })
      } catch (err) {
        console.error('Load data failed:', err)
      }
    },
  },
}
</script>

<style scoped>
/* 将原本 insertCss 中的关键样式移到这里，注意去掉 #container 等全局选择器，改用 scoped 或特定类名 */
.editor-container {
  display: flex;
  border: 1px solid #dfe3e8;
  height: 600px;
  font-family: Inter, PingFang SC, Arial, sans-serif;
  height: 100%;
  width: 100%;
}

/* 侧边栏和画布容器样式已在 template 中通过 class 控制，此处补充细节 */
.stencil-container {
  width: 260px;
  height: 100%;
  border-right: 1px solid #dfe3e8;
  background: #fff;
}
.graph-container {
  flex: 1;
  height: 100%;
  background: #fff;
}

/* 
  注意：由于 X6 的 Vue 组件是渲染在 SVG foreignObject 中的，
  这里的 scoped 样式可能无法穿透到节点内部。
  建议在 nodes/AgentReactCard.vue 和 nodes/FlowCard.vue 中编写非 scoped 样式，
  或者在全局 styles 中定义 .agent-card 等类名。
  下面仅为示意，实际请查看下方的子组件代码。
*/
</style>