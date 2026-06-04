<template>
  <div class="ai-topology-container">
    <div class="ai-summary-bar">
      <div class="ai-brand">
        <span class="ai-robot-icon">🧠</span>
        <span class="ai-brand-text">AI 智能告警 · 体系态势感知</span>
        <span class="model-badge">DeepSeek V4</span>
      </div>
      <div class="ai-ticker-wrap">
        <div class="ai-ticker-track">
          <span class="ticker-item pulse-green">●</span>
          <span class="ticker-text">AI 推理引擎运行中 · 已检测 <b>4</b> 条告警链</span>
          <span class="ticker-divider">|</span>
          <span class="ticker-item pulse-red">●</span>
          <span class="ticker-text">网络层告警 <b>2</b> · 平台层告警 <b>3</b> · 设备层告警 <b>5</b></span>
          <span class="ticker-divider">|</span>
          <span class="ticker-item pulse-yellow">★</span>
          <span class="ticker-text">置信度最高 <b>96.3%</b> · 模式库 v2.4.0</span>
        </div>
      </div>
      <div class="ai-header-actions">
        <span class="live-dot"></span><span class="live-text">实时</span>
        <el-button size="mini" type="text" class="ai-action-btn" @click="resetHighlight">
          <Icon icon="lucide:refresh-cw" :size="12" style="vertical-align:middle;margin-right:2px" />重置
        </el-button>
      </div>
    </div>

    <div class="ai-metrics-dashboard">
      <div class="metric-card mc-network">
        <div class="mc-icon"><Icon icon="lucide:radio" :size="18" color="#3b82f6" /></div>
        <div class="mc-body">
          <span class="mc-label">网络层告警</span>
          <div class="mc-counter"><span class="counter-num">2</span><span class="counter-unit">条</span></div>
        </div>
        <div class="mc-trend danger">链路中断</div>
        <div class="mc-glow blue"></div>
      </div>
      <div class="metric-card mc-platform">
        <div class="mc-icon"><Icon icon="lucide:cpu" :size="18" color="#a855f7" /></div>
        <div class="mc-body">
          <span class="mc-label">平台层告警</span>
          <div class="mc-counter"><span class="counter-num">3</span><span class="counter-unit">条</span></div>
        </div>
        <div class="mc-trend danger">节点脱联</div>
        <div class="mc-glow purple"></div>
      </div>
      <div class="metric-card mc-device">
        <div class="mc-icon"><Icon icon="lucide:radio-receiver" :size="18" color="#f97316" /></div>
        <div class="mc-body">
          <span class="mc-label">设备层告警</span>
          <div class="mc-counter"><span class="counter-num">5</span><span class="counter-unit">条</span></div>
        </div>
        <div class="mc-trend danger">传感器异常</div>
        <div class="mc-glow orange"></div>
      </div>
      <div class="metric-card mc-chain">
        <div class="mc-icon"><Icon icon="lucide:git-branch" :size="18" color="#10b981" /></div>
        <div class="mc-body">
          <span class="mc-label">AI 告警关联链</span>
          <div class="mc-counter"><span class="counter-num">4</span><span class="counter-unit">条</span></div>
        </div>
        <div class="mc-trend ok">追溯完成</div>
        <div class="mc-glow green"></div>
      </div>
    </div>

    <div class="main-content">
      <div id="x6-canvas-container" class="canvas-box"></div>
      <div class="ai-analysis-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            <Icon icon="lucide:search" :size="13" style="vertical-align:middle;margin-right:4px;color:#a855f7" />
            AI 告警链诊断
          </div>
          <div v-if="selectedNode" class="diagnosis-panel">
            <div class="diag-header">
              <span class="diag-badge" :class="'badge-' + selectedNode.layer">{{ layerLabel(selectedNode.layer) }}</span>
              <span class="diag-emoji">{{ getNodeEmoji(selectedNode) }}</span>
              <div class="diag-node-info">
                <span class="diag-node-name">{{ selectedNode.label }}</span>
                <span class="diag-node-type">{{ selectedNode.type }}</span>
              </div>
            </div>
            <div class="diag-confidence-bar">
              <div class="conf-label">告警置信度</div>
              <div class="conf-track">
                <div class="conf-fill alert-fill" :style="{ width: selectedNode.confidence + '%' }"></div>
              </div>
              <span class="conf-value">{{ selectedNode.confidence }}%</span>
            </div>
            <div class="diag-alert-type">{{ selectedNode.alertType }}</div>
            <div class="diag-text">{{ selectedNode.diagnosis }}</div>
            <div class="diag-suggestion">
              <Icon icon="lucide:lightbulb" :size="12" style="vertical-align:middle;margin-right:3px;color:#fbbf24" />
              {{ selectedNode.suggestion }}
            </div>
            <div v-if="selectedNode.affected" class="diag-affected">
              <Icon icon="lucide:share-2" :size="11" style="vertical-align:middle;margin-right:3px" />
              波及影响: {{ selectedNode.affected }}
            </div>
          </div>
          <div v-else class="diag-placeholder">
            <Icon icon="lucide:mouse-pointer-2" :size="24" style="color:#1e293b;margin-bottom:8px" />
            <p>点击拓扑节点查看 AI 告警链诊断</p>
          </div>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            <Icon icon="lucide:trending-up" :size="13" style="vertical-align:middle;margin-right:4px;color:#f97316" />
            异常演进趋势
          </div>
          <div id="ai-trend-chart" class="trend-chart"></div>
        </div>
        <div class="sidebar-divider"></div>
        <div class="sidebar-section">
          <div class="sidebar-section-title">
            <Icon icon="lucide:list" :size="13" style="vertical-align:middle;margin-right:4px;color:#10b981" />
            实时告警事件流
          </div>
          <div class="event-stream">
            <div v-for="(evt, idx) in aiEvents" :key="idx" class="event-item" :class="'evt-' + evt.severity">
              <span class="evt-dot"></span>
              <span class="evt-time font-num">{{ evt.time }}</span>
              <span class="evt-layer-tag" :class="'layer-' + evt.layer">{{ evt.layer }}</span>
              <span class="evt-desc">{{ evt.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {Graph} from '@antv/x6'
import * as echarts from 'echarts'

const layerEmoji = {
  网络: {icon: '🌐', label: '网络层'},
  平台: {icon: '🚛', label: '平台层'},
  设备: {icon: '📡', label: '设备层'}
}
const getEmoji = type => (layerEmoji[type] || {icon: '🔹'}).icon
const layerLabel = l => layerEmoji[l]?.label || l

Graph.registerNode('alert-node', {
  inherit: 'rect', width: 84, height: 86,
  markup: [
    {tagName: 'rect', selector: 'body'},
    {tagName: 'circle', selector: 'icon-bg'},
    {tagName: 'text', selector: 'icon-text'},
    {tagName: 'text', selector: 'label'},
    {tagName: 'text', selector: 'sub-label'}
  ],
  attrs: {
    body: {fill: '#0f1930', stroke: '#1e3a5f', strokeWidth: 1, rx: 10, ry: 10},
    'icon-bg': {r: 18, cx: 42, cy: 26, fill: 'rgba(56,189,248,0.1)', stroke: 'rgba(56,189,248,0.2)', strokeWidth: 1.5},
    'icon-text': {text: '📡', fontSize: 18, textAnchor: 'middle', refX: 42, refY: 31, fill: '#e2e8f0'},
    label: {text: '节点', fontSize: 9, textAnchor: 'middle', refX: 42, refY: 58, fill: '#94a3b8', fontWeight: 'bold'},
    'sub-label': {text: '', fontSize: 7, textAnchor: 'middle', refX: 42, refY: 70, fill: '#475569'}
  }
})

export default {
  name: 'AiIntelligentAlert',
  filters: { typeLabel: l => layerLabel(l) },
  data() {
    return {
      graph: null, selectedNode: null, trendChart: null,
      aiEvents: [
        {time: '09:28:15', severity: 'critical', layer: '网络', text: '数据链A链路中断 → 级联影响预警机平台'},
        {time: '09:26:42', severity: 'major', layer: '平台', text: '预警机平台脱联 → 下属传感器全部离线'},
        {time: '09:25:10', severity: 'major', layer: '设备', text: '机载雷达告警 → 通信中断导致目标丢失'},
        {time: '09:24:08', severity: 'minor', layer: '设备', text: '光电传感器 #03 信号异常'},
        {time: '09:21:30', severity: 'critical', layer: '网络', text: '通信骨干网节点 #1024 心跳丢失'},
        {time: '09:15:00', severity: 'major', layer: '平台', text: '指挥车平台 GNSS 信号受到干扰'},
        {time: '09:08:22', severity: 'warning', layer: '设备', text: '武器系统 #03 通信自检超时'}
      ]
    }
  },
  mounted() { this.initGraph(); this.renderTopology(); this.initTrendChart() },
  beforeDestroy() {
    if (this.graph) { this.graph.dispose(); this.graph = null }
    if (this.trendChart) { this.trendChart.dispose(); this.trendChart = null }
  },
  methods: {
    getNodeEmoji(n) { return getEmoji(n.layer) },
    layerLabel,

    initGraph() {
      this.graph = new Graph({
        container: document.getElementById('x6-canvas-container'),
        autoResize: true,
        background: {color: '#060a18'},
        grid: {size: 10, visible: true, type: 'doubleMesh', args: [{color: '#0d1a30', thickness: 1}, {color: '#142240', thickness: 1, factor: 4}]},
        connecting: {connector: 'smooth', router: 'manhattan', attrs: {line: {stroke: '#1e3a5f', strokeWidth: 3, strokeLinecap: 'round', targetMarker: {name: 'block', size: 6}, strokeDasharray: '0, 14', style: 'animation: dot-flow 2s linear infinite'}}},
        interacting: false
      })
      this.graph.on('node:click', ({node}) => {
        const d = node.getData()
        this.selectedNode = d || null
        this.highlightChain(d)
        this.updateTrendChart(d)
      })
    },

    renderTopology() {
      // ============ 三层真实体系架构 ============
      // 网络层 - 左列
      // 平台层 - 中列 (平台隶属于网络)
      // 设备/传感器/武器层 - 右列 (隶属于平台)

      const nodes = [
        // ======== 网络层 (左) ========
        {id: 'net-1', x: 50, y: 120, label: '数据链A', type: 'Link-16', layer: '网络', status: 'error', confidence: 96.3, alertType: '🔴 链路中断告警', diagnosis: '数据链A于09:27:35完全中断。AI 分析: 物理层信号丢失, 疑似节点#1024被压制干扰。过去5分钟信噪比从12dB骤降至-3dB。', suggestion: '1. 立即切换至数据链B备用通道\n2. 启动跳频抗干扰模式\n3. 派出电子战单元侦察干扰源', affected: '2个平台脱联, 5个传感器离线'},
        {id: 'net-2', x: 50, y: 320, label: '通信骨干网', type: '战术互联网', layer: '网络', status: 'warning', confidence: 82.5, alertType: '🟡 节点心跳丢失', diagnosis: '骨干网节点#1024心跳超时。AI 时序分析显示该节点CPU利用率在09:20-09:25期间从32%飙升至97%, 随后失联。', suggestion: '1. 远程重启节点#1024\n2. 检查供电和散热\n3. 冗余路径已自动切换', affected: '影响3个子网段路由'},

        // ======== 平台层 (中) - 隶属于网络 ========
        {id: 'plat-1', x: 320, y: 60, label: '预警机', type: '空基平台', layer: '平台', status: 'error', confidence: 91.8, alertType: '🔴 平台脱联告警', diagnosis: '预警机平台与数据链A断开连接。AI 关联分析: 数据链A中断(09:27:35) → 预警机脱联(09:27:38) → 机载传感器离线(09:27:42)。根因为数据链A链路故障。', suggestion: '1. 等待数据链A恢复\n2. 尝试通过通信骨干网迂回接入\n3. 启动机载备用数据链终端', affected: '3个传感器离线'},
        {id: 'plat-2', x: 320, y: 210, label: '指挥车', type: '地面平台', layer: '平台', status: 'warning', confidence: 75.4, alertType: '🟡 GNSS干扰告警', diagnosis: '指挥车GNSS信号受到电磁干扰, 定位精度从0.5m恶化至25m。AI 模式匹配为车载式欺骗干扰, 特征码 #JAM-2026-003。', suggestion: '1. 启用惯性导航+北斗双模备份\n2. 电子战分队定位干扰源方位\n3. 上报指挥中心调整部署', affected: '武器系统瞄准偏差'},
        {id: 'plat-3', x: 320, y: 360, label: '发射车', type: '地面平台', layer: '平台', status: 'normal', confidence: 8.2, alertType: '🟢 运行正常', diagnosis: '发射车平台所有指标正常, 通信链路冗余正常。', suggestion: '无需处理。', affected: ''},

        // ======== 设备/传感器/武器层 (右) ========
        {id: 'dev-1', x: 590, y: 30, label: '机载雷达', type: '传感器', layer: '设备', status: 'error', confidence: 89.6, alertType: '🔴 传感器离线', diagnosis: '预警机机载雷达因平台脱联而离线。最后数据: 探测到3批不明目标, 距离120km。', suggestion: '1. 待平台恢复后自动重连\n2. 切换至另一预警机接力监视', affected: '目标跟踪中断'},
        {id: 'dev-2', x: 590, y: 110, label: '光电传感器', type: '传感器', layer: '设备', status: 'warning', confidence: 68.3, alertType: '🟡 信号异常', diagnosis: '光电传感器 #03 红外信号出现周期性噪声, 疑似受到激光致眩。频率特征与已知激光武器 #LWS-2024 匹配度78%。', suggestion: '1. 关闭该传感器光学窗口\n2. 切换至雷达跟踪模式\n3. 记录干扰源方位'},
        {id: 'dev-3', x: 590, y: 190, label: '武器系统#03', type: '武器', layer: '设备', status: 'warning', confidence: 72.1, alertType: '🟡 通信超时', diagnosis: '武器系统 #03 通信自检超时, 导弹与发射车之间火控链路延迟从5ms增至120ms。AI 判断为GNSS干扰的间接影响。', suggestion: '1. 切换至有线火控模式\n2. 确认导弹自身惯导状态\n3. 上报待发射武器状态'},
        {id: 'dev-4', x: 590, y: 270, label: '电子战吊舱', type: '武器', layer: '设备', status: 'normal', confidence: 6.5, alertType: '🟢 运行正常', diagnosis: '电子战吊舱运行正常, 干扰功率储备充足。', suggestion: '无需处理。'},
        {id: 'dev-5', x: 590, y: 350, label: '红外告警器', type: '传感器', layer: '设备', status: 'normal', confidence: 4.8, alertType: '🟢 运行正常', diagnosis: '红外告警器工作正常, 未探测到导弹逼近。', suggestion: '无需处理。'},
        {id: 'dev-6', x: 590, y: 430, label: '数据链终端', type: '通信设备', layer: '设备', status: 'warning', confidence: 65.3, alertType: '🟡 链路质量下降', diagnosis: '发射车数据链终端信号强度下降40%, 误码率从1e-6升至1e-3。', suggestion: '1. 检查天线方位\n2. 增大发射功率\n3. 切换至定向天线模式'}
      ]

      const edges = [
        // 网络→平台
        {source: 'net-1', target: 'plat-1', id: 'e-n1p1'},
        {source: 'net-1', target: 'plat-2', id: 'e-n1p2'},
        {source: 'net-2', target: 'plat-2', id: 'e-n2p2'},
        {source: 'net-2', target: 'plat-3', id: 'e-n2p3'},
        // 平台→设备
        {source: 'plat-1', target: 'dev-1', id: 'e-p1d1'},
        {source: 'plat-1', target: 'dev-2', id: 'e-p1d2'},
        {source: 'plat-1', target: 'dev-4', id: 'e-p1d4'},
        {source: 'plat-2', target: 'dev-3', id: 'e-p2d3'},
        {source: 'plat-2', target: 'dev-5', id: 'e-p2d5'},
        {source: 'plat-3', target: 'dev-6', id: 'e-p3d6'}
      ]

      // 添加节点
      nodes.forEach(item => {
        const isErr = item.status === 'error'
        const isWarn = item.status === 'warning'
        let bodyFill = '#0f1930', bodyStroke = '#1e3a5f', iconBgFill = 'rgba(56,189,248,0.08)', iconBgStroke = 'rgba(56,189,248,0.15)', labelColor = '#94a3b8', subColor = '#475569', glow = ''
        if (isErr) {
          bodyFill = 'rgba(239,68,68,0.07)'; bodyStroke = '#ef4444'; iconBgFill = 'rgba(239,68,68,0.15)'; iconBgStroke = 'rgba(239,68,68,0.3)'; labelColor = '#fca5a5'; subColor = '#ef4444'
          glow = 'filter:drop-shadow(0 0 16px rgba(239,68,68,0.6))'
        } else if (isWarn) {
          bodyFill = 'rgba(249,115,22,0.05)'; bodyStroke = '#f97316'; iconBgFill = 'rgba(249,115,22,0.12)'; iconBgStroke = 'rgba(249,115,22,0.25)'; labelColor = '#fdba74'; subColor = '#f97316'
          glow = 'filter:drop-shadow(0 0 10px rgba(249,115,22,0.3))'
        }

        const hasPulse = isErr || isWarn
        const markup = [
          {tagName: 'rect', selector: 'body'},
          {tagName: 'circle', selector: 'icon-bg'},
          ...(hasPulse ? [{tagName: 'circle', selector: 'pulse-ring', attrs: {r: 22, cx: 42, cy: 26, fill: 'none', stroke: isErr ? 'rgba(239,68,68,0.3)' : 'rgba(249,115,22,0.3)', strokeWidth: 2, class: 'pulse-ring'}}] : []),
          ...(isErr ? [{tagName: 'circle', selector: 'pulse-ring2', attrs: {r: 28, cx: 42, cy: 26, fill: 'none', stroke: 'rgba(239,68,68,0.15)', strokeWidth: 2, class: 'pulse-ring-delay'}}] : []),
          {tagName: 'text', selector: 'icon-text'},
          {tagName: 'text', selector: 'label'},
          {tagName: 'text', selector: 'sub-label'}
        ]

        const sh = `alert-node-${item.id}`
        Graph.registerNode(sh, {
          inherit: 'rect', width: 84, height: 86, markup,
          attrs: {
            body: {fill: bodyFill, stroke: bodyStroke, strokeWidth: isErr ? 2 : 1, rx: 10, ry: 10, style: glow},
            'icon-bg': {r: 18, cx: 42, cy: 26, fill: iconBgFill, stroke: iconBgStroke, strokeWidth: 1.5},
            'icon-text': {text: getEmoji(item.layer), fontSize: 18, textAnchor: 'middle', refX: 42, refY: 31, fill: '#e2e8f0'},
            label: {text: item.label, fontSize: 9, textAnchor: 'middle', refX: 42, refY: 58, fill: labelColor, fontWeight: 'bold'},
            'sub-label': {text: item.type, fontSize: 7, textAnchor: 'middle', refX: 42, refY: 70, fill: subColor}
          }
        })

        this.graph.addNode({shape: sh, id: item.id, x: item.x, y: item.y, data: item})
      })

      // 添加边
      edges.forEach(edge => {
        this.graph.addEdge({
          source: edge.source, target: edge.target, id: edge.id,
          attrs: {line: {stroke: '#1e3a5f', strokeWidth: 3, strokeLinecap: 'round', targetMarker: {name: 'block', size: 6}, strokeDasharray: '0, 14', style: 'animation: dot-flow 2s linear infinite'}}
        })
      })

      // 添加层标签
      const layers = [
        {label: '🌐 网络层', x: 55, y: 8, color: '#3b82f6'},
        {label: '🚛 平台层', x: 325, y: 8, color: '#a855f7'},
        {label: '📡 设备/传感器/武器层', x: 570, y: 8, color: '#f97316'}
      ]
      layers.forEach(({label, x, y, color}) => {
        this.graph.addNode({
          shape: 'rect', x, y, width: label.length * 8, height: 20,
          attrs: {body: {fill: 'transparent', stroke: 'transparent'}, label: {text: label, fontSize: 10, fill: color, fontWeight: 'bold', textAnchor: 'start', refX: 0, refY: 14}}
        })
      })

      this.graph.zoomToFit({padding: 20, maxScale: 1})

      // 默认选中第一条告警链
      setTimeout(() => {
        const cell = this.graph.getCellById('net-1')
        if (cell) {
          const d = cell.getData()
          this.selectedNode = d
          this.highlightChain(d)
        }
      }, 300)
    },

    // 高亮告警链: BFS 查找上下游 + 闪烁效果
    highlightChain(nodeData) {
      if (!nodeData) return
      this.graph.getEdges().forEach(e => {
        e.attr('line/stroke', '#1e3a5f')
        e.attr('line/strokeWidth', 3)
        e.attr('line/strokeDasharray', '0, 14')
        e.attr('line/style', 'animation: dot-flow 2s linear infinite')
        e.attr('line/filter', null)
      })

      const visited = new Set()
      const q = [nodeData.id]
      const chain = new Set()

      while (q.length) {
        const cur = q.shift()
        visited.add(cur)
        this.graph.getEdges().forEach(e => {
          const s = e.getSourceCellId(), t = e.getTargetCellId()
          if (s === cur && !visited.has(t)) { chain.add(e.id); q.push(t) }
          if (t === cur && !visited.has(s)) { chain.add(e.id); q.push(s) }
        })
        if (visited.size > 12) break
      }

      // 高亮告警链路 - 使用告警红/橙闪烁
      const isErrChain = nodeData.status === 'error'
      chain.forEach(eid => {
        const e = this.graph.getCellById(eid)
        if (e) {
          const alertColor = isErrChain ? '#ef4444' : '#f97316'
          e.attr('line/stroke', alertColor)
          e.attr('line/strokeWidth', 4)
          e.attr('line/strokeDasharray', '0, 12')
          e.attr('line/style', `animation: alert-flash 0.5s ease-in-out infinite`)
          e.attr('line/filter', `drop-shadow(0 0 6px ${alertColor}88)`)
        }
      })
    },

    resetHighlight() {
      this.selectedNode = null
      this.graph.getEdges().forEach(e => {
        e.attr('line/stroke', '#1e3a5f')
        e.attr('line/strokeWidth', 3)
        e.attr('line/strokeDasharray', '0, 14')
        e.attr('line/style', 'animation: dot-flow 2s linear infinite')
        e.attr('line/filter', null)
      })
      if (this.trendChart) { this.trendChart.clear(); this.initTrendChart() }
    },

    initTrendChart() {
      const dom = document.getElementById('ai-trend-chart')
      if (!dom) return
      this.trendChart = echarts.init(dom)
      this.trendChart.setOption(this.getTrendOption(null))
    },
    updateTrendChart(d) {
      if (!this.trendChart) return
      this.trendChart.setOption(this.getTrendOption(d))
    },
    getTrendOption(d) {
      const bad = d && (d.status === 'error' || d.status === 'warning')
      return {
        grid: {top: 8, bottom: 6, left: 2, right: 2},
        xAxis: {type: 'category', show: false, data: ['T-10', 'T-8', 'T-6', 'T-4', 'T-2', 'T-0']},
        yAxis: {type: 'value', show: false, min: 0, max: 100},
        series: [{
          data: bad ? [8, 15, 22, 45, 78, 95] : [5, 8, 10, 12, 14, 18],
          type: 'line', smooth: true, symbol: 'none',
          lineStyle: {color: bad ? '#ef4444' : '#06b6d4', width: 2},
          areaStyle: {color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {offset: 0, color: bad ? 'rgba(239,68,68,0.35)' : 'rgba(6,182,212,0.25)'},
            {offset: 1, color: 'transparent'}
          ])}
        }]
      }
    }
  }
}
</script>

<style scoped>
.ai-topology-container { display:flex; flex-direction:column; width:100%; height:100%; background-color:#040812; color:#e2e8f0; font-family:'Inter','Segoe UI',sans-serif; overflow:hidden; }
.ai-summary-bar { display:flex; align-items:center; justify-content:space-between; background:linear-gradient(90deg,rgba(88,28,135,0.25) 0%,rgba(15,23,42,0.8) 100%); border-bottom:1px solid rgba(107,33,168,0.3); padding:8px 16px; flex-shrink:0; min-height:40px; }
.ai-brand { display:flex; align-items:center; gap:8px; }
.ai-robot-icon { font-size:20px; }
.ai-brand-text { font-size:13px; font-weight:bold; color:#e2e8f0; }
.model-badge { font-size:9px; background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.25); color:#a78bfa; padding:1px 6px; border-radius:8px; font-weight:bold; }
.ai-ticker-wrap { flex:1; margin:0 20px; overflow:hidden; position:relative; height:22px; }
.ai-ticker-track { display:flex; align-items:center; gap:6px; white-space:nowrap; animation:ticker-scroll 20s linear infinite; position:absolute; left:0; top:2px; }
.ticker-item { font-size:8px; } .ticker-text { font-size:11px; color:#94a3b8; } .ticker-text b { color:#e2e8f0; }
.ticker-divider { color:#334155; font-size:11px; }
.pulse-green { color:#10b981; animation:pulse-dot 1.5s ease-in-out infinite; }
.pulse-red { color:#ef4444; animation:pulse-dot 1.2s ease-in-out infinite; }
.pulse-yellow { color:#fbbf24; animation:pulse-dot 2s ease-in-out infinite; }
@keyframes ticker-scroll { 0%{transform:translateX(100%)} 100%{transform:translateX(-100%)} }
.ai-header-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.live-dot { width:6px; height:6px; border-radius:50%; background:#10b981; animation:pulse-dot 1.2s ease-in-out infinite; }
.live-text { font-size:10px; color:#10b981; font-weight:bold; }
.ai-action-btn { color:#64748b!important; font-size:11px!important; }
.ai-action-btn:hover { color:#94a3b8!important; }

.ai-metrics-dashboard { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:8px 12px; flex-shrink:0; }
.metric-card { background:linear-gradient(135deg,#0c1424 0%,#0a101e 100%); border:1px solid #162240; border-radius:6px; padding:10px 12px; display:flex; align-items:center; gap:10px; position:relative; overflow:hidden; }
.mc-icon { flex-shrink:0; width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.03); border-radius:8px; }
.mc-body { flex:1; display:flex; flex-direction:column; gap:1px; }
.mc-label { font-size:10px; color:#64748b; }
.mc-counter { display:flex; align-items:baseline; gap:3px; }
.counter-num { font-size:22px; font-weight:bold; font-family:monospace; background:linear-gradient(180deg,#f1f5f9 0%,#94a3b8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
.counter-unit { font-size:10px; color:#475569; }
.mc-trend { font-size:9px; padding:1px 5px; border-radius:3px; flex-shrink:0; }
.mc-trend.danger { background:rgba(239,68,68,0.12); color:#ef4444; }
.mc-trend.ok { background:rgba(16,185,129,0.12); color:#10b981; }
.mc-glow { position:absolute; top:-30px; right:-30px; width:80px; height:80px; border-radius:50%; opacity:0.08; pointer-events:none; }
.mc-glow.blue { background:#3b82f6; } .mc-glow.purple { background:#a855f7; } .mc-glow.orange { background:#f97316; } .mc-glow.green { background:#10b981; }

.main-content { flex:1; display:flex; min-height:0; padding:0 12px 8px 12px; gap:10px; }
.canvas-box { flex:1; background:#080c18; border:1px solid #111b2b; border-radius:4px; }

.ai-analysis-sidebar { width:300px; background:#080c18; border:1px solid #111b2b; border-radius:4px; display:flex; flex-direction:column; padding:10px; overflow-y:auto; gap:6px; }
.sidebar-section-title { font-size:11px; font-weight:bold; color:#64748b; margin-bottom:6px; padding-bottom:4px; border-bottom:1px solid #111b2b; }
.sidebar-divider { height:1px; background:#111b2b; margin:4px 0; }

.diagnosis-panel { background:#0c1424; border:1px solid #162240; border-radius:4px; padding:8px; }
.diag-header { display:flex; align-items:center; gap:6px; margin-bottom:6px; flex-wrap:wrap; }
.diag-badge { font-size:9px; padding:1px 5px; border-radius:2px; font-weight:bold; flex-shrink:0; }
.badge-网络 { background:rgba(59,130,246,0.15); color:#60a5fa; }
.badge-平台 { background:rgba(168,85,247,0.15); color:#c084fc; }
.badge-设备 { background:rgba(249,115,22,0.15); color:#fdba74; }
.diag-emoji { font-size:20px; }
.diag-node-info { display:flex; flex-direction:column; }
.diag-node-name { font-size:12px; font-weight:bold; color:#e2e8f0; }
.diag-node-type { font-size:9px; color:#475569; }
.diag-confidence-bar { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
.conf-label { font-size:10px; color:#64748b; flex-shrink:0; }
.conf-track { flex:1; height:4px; background:#1e293b; border-radius:2px; overflow:hidden; }
.conf-fill { height:100%; border-radius:2px; transition:width 0.6s ease; }
.alert-fill { background:linear-gradient(90deg,#06b6d4,#f97316,#ef4444); }
.conf-value { font-size:11px; font-weight:bold; font-family:monospace; color:#e2e8f0; }
.diag-alert-type { font-size:11px; font-weight:bold; color:#ef4444; margin-bottom:4px; }
.diag-text { font-size:11px; color:#94a3b8; line-height:1.5; margin-bottom:6px; display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; line-clamp:4; overflow:hidden; }
.diag-suggestion { font-size:11px; color:#fbbf24; background:rgba(251,191,36,0.06); border:1px solid rgba(251,191,36,0.12); border-radius:3px; padding:4px 6px; line-height:1.4; margin-bottom:4px; white-space:pre-line; }
.diag-affected { font-size:10px; color:#f97316; background:rgba(249,115,22,0.06); border-radius:2px; padding:3px 5px; }
.diag-placeholder { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; color:#334155; font-size:11px; text-align:center; }
.diag-placeholder p { margin:0; }

.trend-chart { width:100%; height:80px; }
.event-stream { display:flex; flex-direction:column; gap:2px; max-height:150px; overflow-y:auto; }
.event-item { display:flex; align-items:center; gap:4px; font-size:10px; padding:2px 4px; border-radius:2px; }
.evt-dot { width:4px; height:4px; border-radius:50%; flex-shrink:0; }
.evt-critical .evt-dot { background:#ef4444; box-shadow:0 0 4px #ef4444; }
.evt-critical { background:rgba(239,68,68,0.04); }
.evt-major .evt-dot { background:#f97316; }
.evt-major { background:rgba(249,115,22,0.02); }
.evt-minor .evt-dot { background:#eab308; }
.evt-warning .evt-dot { background:#64748b; }
.evt-layer-tag { font-size:8px; padding:0 3px; border-radius:2px; flex-shrink:0; }
.layer-网络 { background:rgba(59,130,246,0.12); color:#60a5fa; }
.layer-平台 { background:rgba(168,85,247,0.12); color:#c084fc; }
.layer-设备 { background:rgba(249,115,22,0.12); color:#fdba74; }
.evt-time { color:#475569; font-family:monospace; flex-shrink:0; }
.evt-desc { color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.font-num { font-family:monospace; }

@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
.event-stream::-webkit-scrollbar { width:3px; }
.event-stream::-webkit-scrollbar-track { background:transparent; }
.event-stream::-webkit-scrollbar-thumb { background:#1e293b; border-radius:2px; }
</style>

<style>
@keyframes dot-flow { to { stroke-dashoffset: -28; } }
@keyframes alert-flash {
  0%, 100% { stroke-opacity: 1; }
  50% { stroke-opacity: 0.3; }
}
@keyframes pulse-ring {
  0% { opacity: 0.6; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
}
@keyframes pulse-ring-delay {
  0% { opacity: 0.4; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.6); }
}
.pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
.pulse-ring-delay { animation: pulse-ring-delay 1.5s ease-out 0.5s infinite; }
</style>
