<template>
  <div class="canvas-wrapper">
    <div class="floating-toolbar">
      <el-button
        type="primary"
        size="mini"
        circle
        title="适应画布"
        @click="resetLayout"
      >
        <Icon icon="mdi:fit-to-screen" size="14px" />
      </el-button>

      <div class="layout-switch-group">
        <el-radio-group
          :value="layoutType"
          @input="handleLayoutChange"
          size="mini"
          class="dir-radio-group"
        >
          <el-radio-button label="TB">纵向</el-radio-button>
          <el-radio-button label="LR">横向</el-radio-button>
          <el-radio-button label="BT">倒纵</el-radio-button>
          <el-radio-button label="RL">倒横</el-radio-button>
          <el-radio-button label="circular">环形</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div id="container" ref="container"></div>

    <div v-if="!hasData" class="empty-state">
      <Icon icon="mdi:database-off-outline" size="48px" />
      <p>暂无拓扑数据</p>
      <span>等待数据传输...</span>
    </div>

    <transition name="panel-slide">
      <div v-if="detailVisible" class="detail-panel">
        <div class="panel-header">
          <span>
            <Icon icon="mdi:cpu" size="14px" style="color: #38bdf8" />
            {{ selectedNode.isNetwork ? '网络状态监控' : '节点属性' }}
          </span>
          <i class="el-icon-close close-btn" @click="detailVisible = false"></i>
        </div>

        <div
          class="panel-content"
          v-loading="loading"
          element-loading-background="transparent"
        >
          <div style="margin-bottom: 20px">
            <h3 style="margin: 0; font-size: 18px; color: #eee">
              {{ selectedNode.WLMC || selectedNode.name }}
            </h3>
            <p style="margin: 5px 0; font-size: 12px; color: #666">
              ID: {{ selectedNode.WLH || selectedNode.id }}
            </p>
            <div style="margin-top: 11px">
              <span
                class="status-indicator"
                :style="{
                  backgroundColor: selectedNode.healthColor,
                  color: selectedNode.healthColor
                }"
              ></span>
              <span
                :style="{color: selectedNode.healthColor, fontSize: '13px'}"
              >
                {{ selectedNode.healthStatus }}
              </span>
            </div>
          </div>

          <template v-if="selectedNode.isNetwork">
            <div class="stat-card">
              <div class="stat-label">数据链组件类型</div>
              <div style="font-size: 14px; color: #ccc">
                {{ selectedNode.typeName }}
              </div>
            </div>

            <div class="stat-card" style="border-left-color: #722ed1">
              <div class="stat-label">频段覆盖 (MHz)</div>
              <div class="stat-value">
                {{ selectedNode.PDXX }}
                <span style="font-size: 12px; color: #444">~</span>
                {{ selectedNode.PDSX }}
              </div>
            </div>

            <div class="stat-card" style="border-left-color: #52c41a">
              <div style="display: flex; justify-content: space-between">
                <div class="stat-label">
                  带宽占用 (剩余 {{ selectedNode.SYDK }} /
                  {{ selectedNode.DK }} Mbps)
                </div>
                <div style="color: #52c41a; font-size: 12px">
                  {{ Math.round((selectedNode.SYDK / selectedNode.DK) * 100) }}%
                  剩余
                </div>
              </div>
              <div class="progress-container">
                <div
                  class="progress-bar"
                  :style="{
                    width: (selectedNode.SYDK / selectedNode.DK) * 100 + '%'
                  }"
                ></div>
              </div>
            </div>

            <div
              class="stat-card"
              :style="{
                borderLeftColor: selectedNode.DBL > 5 ? '#ff4d4f' : '#00e5ff'
              }"
            >
              <div class="stat-label">实时丢包率</div>
              <div
                class="stat-value"
                :style="{color: selectedNode.DBL > 5 ? '#ff4d4f' : '#00e5ff'}"
              >
                {{ selectedNode.DBL }}<span style="font-size: 14px">%</span>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="stat-card">
              <div class="stat-label">节点类型</div>
              <div style="font-size: 14px; color: #ccc">
                {{ selectedNode.type || '常规物理终端' }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {Graph, Shape} from '@antv/x6'
import {wlzt} from '@/api/network'
import {wllxMap} from '@/api/map'
import dagre from 'dagre'

export default {
  name: 'TopologyCanvas',
  props: {
    topologyData: {
      type: Array,
      default: () => []
    },
    layoutType: {
      type: String,
      default: 'TB',
      validator: v => ['TB', 'BT', 'LR', 'RL', 'circular'].includes(v)
    }
  },
  data() {
    return {
      graph: null,
      detailVisible: false,
      selectedNode: {},
      loading: false,
      networkTypeMap: {},
      theme: {
        background: '#070c14',
        network: '#00d8ff',
        subnet: '#52c41a',
        group: 'rgba(250, 173, 20, 0.05)',
        groupBorder: '#faad14',
        edge: '#00e5ff',
        edgeGradient: '#0055ff',
        text: '#cbd5e1',
        flowDot: {
          color: '#00f2fe',
          shadow: '#03a9f4',
          r: 3,
          duration: 2500
        }
      }
    }
  },
  computed: {
    hasData() {
      return this.topologyData && this.topologyData.length > 0
    }
  },
  watch: {
    topologyData: {
      deep: true,
      handler(newVal) {
        this.$nextTick(() => this.rebuildLayout())
      }
    },
    layoutType() {
      this.$nextTick(() => this.rebuildLayout())
    }
  },
  mounted() {
    this.initGraph()
    this.fetchNetworkTypeMap()
    window.addEventListener('resize', this.handleResize)
    if (this.topologyData && this.topologyData.length > 0) {
      this.buildLayout(this.topologyData)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.graph) {
      this.graph.dispose()
    }
  },
  methods: {
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        autoResize: true,
        background: {
          color: '#070c14'
        },
        grid: {
          visible: true,
          type: 'mesh',
          args: [
            {color: 'rgba(0, 162, 255, 0.06)', thickness: 1},
            {color: 'rgba(0, 162, 255, 0.03)', thickness: 1, factor: 4}
          ]
        },
        panning: true,
        mousewheel: {enabled: true, modifiers: ['ctrl', 'meta']},
        connecting: {
          router: {name: 'normal'},
          connector: {name: 'normal'},
          anchor: 'center',
          connectionPoint: 'boundary'
        }
      })

      this.graph.on('node:click', ({node}) => {
        const data = node.getData()
        if (data?.isGroup) return

        if (
          data.type === '核心层' ||
          data.type === '汇聚层' ||
          node.id.toLowerCase().includes('wl')
        ) {
          this.fetchNetworkDetail(data.wlh, node.getLabel(), data)
        } else {
          this.selectedNode = {id: node.id, name: node.getLabel(), ...data}
          this.detailVisible = true
        }
      })

      this.graph.on('blank:click', () => {
        this.detailVisible = false
      })
    },

    fetchNetworkDetail(wlh, name, originalData) {
      this.loading = true
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        params: {RWMC: '', WLMC: '', WLH: wlh}
      }

      wlzt(queryParams)
        .then(res => {
          const detail = (res.data.list && res.data.list[0]) || {}

          this.selectedNode = {
            ...originalData,
            ...detail,
            isNetwork: true,
            typeName: this.networkTypeMap[detail.WLLX] || '未知组件',
            DK: detail.DK || 100,
            SYDK: detail.SYDK || 0,
            DBL: detail.DBL || 0,
            healthStatus:
              detail.JKZT === 0 ? '运行中 / 良好' : '异常 / 故障告警',
            healthColor: detail.JKZT === 0 ? '#52c41a' : '#ff4d4f'
          }
          this.detailVisible = true
        })
        .catch(err => {
          this.$message.error('获取网络状态失败')
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
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
    rebuildLayout() {
      if (!this.graph) return
      this.graph.dispose()
      this.graph = null
      this.initGraph()
      if (this.topologyData && this.topologyData.length > 0) {
        this.buildLayout(this.topologyData)
      }
    },

    buildLayout(data) {
      if (this.layoutType === 'circular') {
        this.buildCircularLayout(data)
        return
      }
      this.buildVerticalLayout(data)
    },

    buildVerticalLayout(data) {
      // 使用 dagre 库计算分层布局
      const g = new dagre.graphlib.Graph()
      g.setGraph({
        rankdir: this.layoutType,
        nodesep: 60,
        ranksep: 120,
        align: 'UL',
        marginx: 30,
        marginy: 30
      })
      g.setDefaultEdgeLabel(() => ({}))

      // 注册节点和边到 dagre
      data.forEach(net => {
        g.setNode(net.id, {width: 40, height: 40})
        if (!net.children) return
        net.children.forEach(sub => {
          g.setNode(sub.id, {width: 40, height: 40})
          g.setEdge(net.id, sub.id)
          if (!sub.groups) return
          sub.groups.forEach(group => {
            const nodeCount = group.nodes?.length || 0
            const gHeight = 40 + nodeCount * 34
            g.setNode(group.id, {width: 120, height: gHeight})
            g.setEdge(sub.id, group.id)
          })
        })
      })

      // 执行 dagre 布局计算
      dagre.layout(g)

      // 根据 dagre 计算结果创建 X6 节点（dagre x/y 是中心坐标）
      data.forEach(net => {
        const n = g.node(net.id)
        this.createNode(
          net.id,
          net.wlmc || net.name,
          n.x - 20,
          n.y - 20,
          net.icon,
          this.theme.network,
          {...net}
        )
        if (!net.children) return

        net.children.forEach(sub => {
          const s = g.node(sub.id)
          this.createNode(
            sub.id,
            sub.name,
            s.x - 20,
            s.y - 20,
            net.icon,
            this.theme.subnet,
            {...sub}
          )
          this.createEdge(net.id, sub.id)

          if (!sub.groups) return

          sub.groups.forEach(group => {
            const gp = g.node(group.id)
            const nodeCount = group.nodes?.length || 0
            const gHeight = 40 + nodeCount * 34
            const gx = gp.x - 60
            const gy = gp.y - gHeight / 2

            const groupNode = this.graph.addNode({
              id: group.id,
              x: gx,
              y: gy,
              width: 120,
              height: gHeight,
              label: group.name,
              zIndex: 1,
              data: {isGroup: true, nodeCount},
              attrs: {
                body: {
                  fill: this.theme.group,
                  stroke: this.theme.groupBorder,
                  strokeWidth: 1,
                  rx: 6,
                  ry: 6,
                  strokeDasharray: '5,5'
                },
                label: {
                  refX: 0.5,
                  refY: 10,
                  fill: this.theme.groupBorder,
                  fontSize: 9,
                  fontWeight: 'bold'
                }
              }
            })
            this.createEdge(sub.id, group.id)

            if (group.nodes) {
              group.nodes.forEach((node, nIdx) => {
                const dev = this.graph.addNode({
                  id: node.id,
                  x: gx + Math.round((120 - 24) / 2),
                  y: gy + 26 + nIdx * 34,
                  width: 24,
                  height: 24,
                  shape: 'image',
                  imageUrl: node.icon || node.txurl,
                  label: node.name,
                  zIndex: 10,
                  data: {...node},
                  attrs: {
                    label: {
                      fill: this.theme.text,
                      fontSize: 8,
                      refY: '100%',
                      refY2: 1
                    }
                  }
                })
                groupNode.addChild(dev)
              })
            }
          })
        })
      })

      // 自适应屏幕，缩放至适配
      this.graph.zoomToFit({padding: 60, maxScale: 1})
      this.graph.centerContent()
    },

    buildCircularLayout(data) {
      const cx = 960
      const cy = 540
      const mainRadius = 300
      const layerGap = 240
      const netCount = data.length
      if (netCount === 0) return

      data.forEach((net, netIdx) => {
        const angle = (2 * Math.PI * netIdx) / netCount - Math.PI / 2
        const nx = cx + mainRadius * Math.cos(angle)
        const ny = cy + mainRadius * Math.sin(angle)

        this.createNode(
          net.id,
          net.wlmc || net.name,
          nx - 20,
          ny - 20,
          net.icon,
          this.theme.network,
          {...net}
        )

        if (!net.children) return

        const subCount = net.children.length
        const spreadAngle = Math.min(
          Math.PI / 2,
          (2 * Math.PI) / (netCount * 1.2)
        )

        net.children.forEach((sub, subIdx) => {
          const subAngle =
            angle +
            (subIdx - (subCount - 1) / 2) *
              (spreadAngle / Math.max(subCount, 1))
          const sr = mainRadius + layerGap
          const sx = cx + sr * Math.cos(subAngle)
          const sy = cy + sr * Math.sin(subAngle)

          this.createNode(
            sub.id,
            sub.name,
            sx - 20,
            sy - 20,
            net.icon,
            this.theme.subnet,
            {...sub}
          )
          this.createEdge(net.id, sub.id)

          if (!sub.groups) return

          sub.groups.forEach((group, gIdx) => {
            const gr = sr + layerGap * 0.9
            const gAngle =
              subAngle + (gIdx - (sub.groups.length - 1) / 2) * 0.25
            const gx = cx + gr * Math.cos(gAngle)
            const gy = cy + gr * Math.sin(gAngle)

            const nodeCount = group.nodes?.length || 0
            const gHeight = 40 + nodeCount * 34

            const groupNode = this.graph.addNode({
              id: group.id,
              x: gx - 60,
              y: gy - gHeight / 2,
              width: 120,
              height: gHeight,
              label: group.name,
              zIndex: 1,
              data: {isGroup: true, nodeCount},
              attrs: {
                body: {
                  fill: this.theme.group,
                  stroke: this.theme.groupBorder,
                  strokeWidth: 1,
                  rx: 6,
                  ry: 6,
                  strokeDasharray: '5,5'
                },
                label: {
                  refX: 0.5,
                  refY: 10,
                  fill: this.theme.groupBorder,
                  fontSize: 9,
                  fontWeight: 'bold'
                }
              }
            })
            this.createEdge(sub.id, group.id)

            if (group.nodes) {
              group.nodes.forEach((node, nIdx) => {
                const dev = this.graph.addNode({
                  id: node.id,
                  x: gx - 60 + Math.round((120 - 24) / 2),
                  y: gy - gHeight / 2 + 26 + nIdx * 34,
                  width: 24,
                  height: 24,
                  shape: 'image',
                  imageUrl: node.icon || node.txurl,
                  label: node.name,
                  zIndex: 10,
                  data: {...node},
                  attrs: {
                    label: {
                      fill: this.theme.text,
                      fontSize: 8,
                      refY: '100%',
                      refY2: 1
                    }
                  }
                })
                groupNode.addChild(dev)
              })
            }
          })
        })
      })

      this.graph.zoomToFit({padding: 60, maxScale: 1})
      this.graph.centerContent()
    },

    createNode(id, label, x, y, icon, color, data) {
      return this.graph.addNode({
        id,
        x,
        y,
        width: 40,
        height: 40,
        shape: 'image',
        imageUrl: icon,
        label,
        data,
        attrs: {
          label: {
            fill: color,
            fontSize: 12,
            fontWeight: 'bold',
            refY: '100%',
            refY2: 8
          }
        }
      })
    },

    createEdge(source, target) {
      return this.graph.addEdge({
        source,
        target,
        zIndex: 0,
        markup: [
          ...Shape.Edge.getMarkup(),
          {tagName: 'circle', selector: 'dot-marker'}
        ],
        attrs: {
          line: {
            stroke: {
              type: 'linearGradient',
              stops: [
                {offset: '0%', color: this.theme.edgeGradient},
                {offset: '100%', color: this.theme.edge}
              ]
            },
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              args: {size: 8, fill: this.theme.edge}
            }
          },
          'dot-marker': {
            r: this.theme.flowDot.r,
            fill: this.theme.flowDot.color,
            atConnectionRatio: 0
          }
        },
        animation: [
          [
            {'attrs/dot-marker/atConnectionRatio': 1},
            {
              duration: this.theme.flowDot.duration,
              iterations: Infinity,
              easing: 'linear'
            }
          ]
        ]
      })
    },

    resetLayout() {
      if (this.graph) {
        this.graph.zoomToFit({padding: 60, maxScale: 1})
        this.graph.centerContent()
      }
    },

    handleResize() {
      if (this.graph) {
        const {clientWidth, clientHeight} = this.$refs.container
        this.graph.resize(clientWidth, clientHeight)
      }
    },

    handleLayoutChange(dir) {
      this.$emit('update:layoutType', dir)
    }
  }
}
</script>

<style scoped>
.canvas-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

#container {
  width: 100%;
  height: 100%;
}

.floating-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 10px;
}

.layout-switch-group ::v-deep .el-radio-group.dir-radio-group {
  display: inline-flex;
  background: rgba(8, 14, 24, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 4px;
  overflow: hidden;
}
.layout-switch-group ::v-deep .el-radio-button__inner {
  background: transparent !important;
  border: none !important;
  color: #64748b !important;
  font-size: 11px !important;
  padding: 5px 10px !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-weight: bold;
  letter-spacing: 0.5px;
}
.layout-switch-group
  ::v-deep
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  background: rgba(56, 189, 248, 0.15) !important;
  color: #38bdf8 !important;
  box-shadow: none !important;
}
.layout-switch-group
  ::v-deep
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner:hover {
  color: #38bdf8 !important;
}

.detail-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 340px;
  background: linear-gradient(
    145deg,
    rgba(30, 35, 45, 0.95),
    rgba(20, 25, 30, 0.98)
  );
  border: 1px solid rgba(0, 229, 255, 0.15);
  box-shadow:
    0 11px 30px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 229, 255, 0.05);
  color: #fff;
  z-index: 1000;
  border-radius: 12px;
  backdrop-filter: blur(15px);
  overflow: hidden;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  color: #177ddc;
  font-weight: bold;
}

.panel-content {
  padding: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 3px solid #00e5ff;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-family: 'Orbitron', 'Consolas', monospace;
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}

.progress-container {
  margin-top: 8px;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0055ff, #00e5ff);
  transition: width 0.6s ease;
}

.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px currentColor;
}

.close-btn {
  cursor: pointer;
  font-size: 18px;
  color: #999;
}
.close-btn:hover {
  color: #fff;
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
}
.panel-slide-enter,
.panel-slide-leave-to {
  transform: translateX(350px);
  opacity: 0;
}

.empty-state {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(0, 229, 255, 0.7);
  z-index: 10;
  pointer-events: none;
  user-select: none;
}

.empty-state p {
  margin: 16px 0 8px;
  font-size: 16px;
  color: rgba(0, 229, 255, 0.5);
}

.empty-state span {
  font-size: 12px;
  color: rgba(0, 229, 255, 0.25);
  animation: pulse-text 2s ease-in-out infinite;
}

.empty-state .local-icon {
  opacity: 1;
  filter: drop-shadow(0 0 6px rgba(0, 229, 255, 0.5));
}

@keyframes pulse-text {
  0%,
  100% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.6;
  }
}

::v-deep g.x6-cell.x6-edge:hover path.x6-edge-line {
  stroke: #00f2fe;
  stroke-width: 3;
  filter: drop-shadow(0 0 5px #00f2fe);
  transition: all 0.3s ease;
}
</style>
