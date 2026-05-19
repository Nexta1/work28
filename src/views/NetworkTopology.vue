<template>
  <div class="topology-container">
    <div class="floating-toolbar">
      <el-button
        type="info"
        size="mini"
        circle
        icon="el-icon-rank"
        @click="resetLayout"
      />
    </div>

    <div id="container" ref="container"></div>

    <!-- 右侧详情面板 -->
    <transition name="el-zoom-in-right">
      <div v-if="detailVisible" class="detail-panel">
        <div class="panel-header">
          <span>节点详情</span>
          <i class="el-icon-close close-btn" @click="detailVisible = false"></i>
        </div>
        <div class="panel-body">
          <el-descriptions :column="1" border size="small" class="custom-desc">
            <el-descriptions-item label="名称">{{
              selectedNode.name
            }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{
              selectedNode.type || '未知'
            }}</el-descriptions-item>
            <el-descriptions-item label="ID">{{
              selectedNode.id
            }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import {Graph} from '@antv/x6'

export default {
  name: 'VerticalTopology',
  data() {
    return {
      graph: null,
      detailVisible: false,
      selectedNode: {},
      theme: {
        network: '#177ddc',
        subnet: '#52c41a',
        group: 'rgba(250, 173, 20, 0.05)',
        groupBorder: '#faad14',
        edge: '#177ddc',
        text: '#a6a6a6'
      }
    }
  },
  mounted() {
    this.initGraph()
    this.renderData()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        autoResize: true,
        background: {color: '#1a1a1a'},
        grid: {visible: true, color: '#262626'},
        panning: true,
        mousewheel: {enabled: true, modifiers: ['ctrl', 'meta']},
        connecting: {
          // 使用 metro 路由，路径更平滑
          router: {name: 'metro', args: {padding: 20}},
          connector: {name: 'rounded', args: {radius: 20}}, // 增大圆角
          anchor: 'center',
          connectionPoint: 'boundary'
        }
      })

      this.graph.on('node:click', ({node}) => {
        const data = node.getData()
        if (data?.isGroup) return
        this.selectedNode = {id: node.id, name: node.getLabel(), ...data}
        this.detailVisible = true
      })

      this.graph.on('blank:click', () => {
        this.detailVisible = false
      })
    },

    renderData() {
      const data = [
        // 1. 标准型：双子网平衡布局
        {
          id: 'net-1',
          wlmc: '核心指挥网',
          type: '核心层',
          children: [
            {
              id: 'sub-1-1',
              name: '子网-A区',
              groups: [
                {
                  id: 'g-1-1-1',
                  name: '侦察群组',
                  nodes: [
                    {
                      id: 'n-1',
                      name: '无人机01',
                      icon: 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png'
                    }
                  ]
                }
              ]
            },
            {
              id: 'sub-1-2',
              name: '子网-B区',
              groups: [
                {
                  id: 'g-1-2-1',
                  name: '火力群组',
                  nodes: [
                    {
                      id: 'n-2',
                      name: '发射单元',
                      icon: 'https://cdn-icons-png.flaticon.com/512/3067/3067451.png'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
      this.buildVerticalLayout(data)
    },

    buildVerticalLayout(data) {
      const containerWidth = this.$refs.container.clientWidth
      const centerX = containerWidth / 2
      let currentY = 60
      const layerGap = 180
      const subGap = 400
      const groupGap = 200

      data.forEach(net => {
        this.createNode(
          net.id,
          net.wlmc,
          centerX - 30,
          currentY,
          'https://cdn-icons-png.flaticon.com/512/2111/2111303.png',
          this.theme.network,
          {type: net.type}
        )

        const subY = currentY + layerGap
        const totalSubWidth = (net.children.length - 1) * subGap
        const subStartX = centerX - totalSubWidth / 2

        net.children.forEach((sub, subIdx) => {
          const subX = subStartX + subIdx * subGap
          this.createNode(
            sub.id,
            sub.name,
            subX - 30,
            subY,
            'https://cdn-icons-png.flaticon.com/512/906/906204.png',
            this.theme.subnet,
            {type: sub.type}
          )
          this.createEdge(net.id, sub.id)

          const groupY = subY + layerGap
          const totalGroupWidth = (sub.groups.length - 1) * groupGap
          const groupStartX = subX - totalGroupWidth / 2

          sub.groups.forEach((group, gIdx) => {
            const groupX = groupStartX + gIdx * groupGap - 90
            const gHeight = 70 + group.nodes.length * 60

            const groupNode = this.graph.addNode({
              id: group.id,
              x: groupX,
              y: groupY,
              width: 180,
              height: gHeight,
              label: group.name,
              zIndex: 1,
              data: {isGroup: true},
              attrs: {
                body: {
                  fill: this.theme.group,
                  stroke: this.theme.groupBorder,
                  strokeWidth: 1.5,
                  rx: 10,
                  ry: 10,
                  strokeDasharray: '5,5'
                },
                label: {
                  refX: 0.5,
                  refY: 15,
                  textAnchor: 'middle',
                  fill: this.theme.groupBorder,
                  fontSize: 12,
                  fontWeight: 'bold'
                }
              }
            })
            this.createEdge(sub.id, group.id)

            group.nodes.forEach((node, nIdx) => {
              const dev = this.graph.addNode({
                id: node.id,
                x: groupX + 65,
                y: groupY + 50 + nIdx * 60,
                width: 45,
                height: 45,
                shape: 'image',
                imageUrl: node.icon,
                label: node.name,
                zIndex: 10,
                data: {...node},
                attrs: {
                  label: {
                    fill: this.theme.text,
                    fontSize: 11,
                    refY: '100%',
                    refY2: 5
                  }
                }
              })
              groupNode.addChild(dev)
            })
          })
        })
      })
      this.graph.centerContent()
    },

    createNode(id, label, x, y, icon, color, data) {
      return this.graph.addNode({
        id,
        x,
        y,
        width: 60,
        height: 60,
        shape: 'image',
        imageUrl: icon,
        label,
        data,
        attrs: {
          label: {
            fill: color,
            fontSize: 14,
            fontWeight: 'bold',
            refY: '100%',
            refY2: 12
          }
        }
      })
    },

    createEdge(source, target) {
      return this.graph.addEdge({
        source,
        target,
        zIndex: 0,
        attrs: {
          line: {
            stroke: this.theme.edge,
            strokeWidth: 2,
            strokeDasharray: '6, 4', // 虚线效果
            sourceMarker: {name: 'circle', args: {r: 3, fill: '#fff'}}, // 起点圆点
            targetMarker: {name: 'classic', args: {size: 7}}, // 终点箭头
            class: 'smooth-edge-animation' // 绑定CSS动画
          }
        }
      })
    },

    resetLayout() {
      this.graph.centerContent()
      this.graph.zoomToFit({padding: 50})
    },

    handleResize() {
      if (this.graph) {
        const {clientWidth, clientHeight} = this.$refs.container
        this.graph.resize(clientWidth, clientHeight)
      }
    }
  }
}
</script>

<style scoped>
.topology-container {
  width: 100vw;
  height: 100vh;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
}

#container {
  width: 100%;
  height: 100%;
}

.floating-toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.detail-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  bottom: 20px;
  width: 300px;
  background: rgba(30, 30, 30, 0.9);
  border: 1px solid #434343;
  color: #fff;
  z-index: 100;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 15px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  color: #177ddc;
  font-weight: bold;
}

.close-btn {
  cursor: pointer;
  color: #666;
}
.panel-body {
  padding: 15px;
}

/* 深色描述列表适配 */
.custom-desc /deep/ .el-descriptions__body {
  background: transparent;
  color: #ccc;
}
.custom-desc /deep/ .el-descriptions-item__label {
  background: #262626 !important;
  color: #888;
}

/* --- 核心动画逻辑 --- */
@keyframes edgeFlow {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}

/* /deep/ 确保能穿透到 X6 生成的 SVG 元素 */
/deep/ .smooth-edge-animation {
  stroke-dasharray: 10;
  animation: edgeFlow 3s linear infinite;
  stroke-opacity: 0.7;
  transition: stroke-opacity 0.3s;
}

/deep/ .smooth-edge-animation:hover {
  stroke-opacity: 1;
  stroke-width: 3;
}
</style>
