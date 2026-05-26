<template>
  <div class="canvas-wrapper">
    <div id="killchain-graph-container" ref="container"></div>
  </div>
</template>

<script>
import {Graph} from '@antv/x6'
import {register} from '@antv/x6-vue-shape'
import PtNode from './PtNode.vue'

register({shape: 'pt-node', width: 185, height: 115, component: PtNode})

export default {
  name: 'KillChainCanvas',
  props: {
    members: {
      type: Array,
      default: () => []
    },
    activeKillChain: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      graph: null,
      phraseMap: {
        0: '发现',
        1: '定位',
        2: '跟踪',
        3: '瞄准',
        4: '打击',
        5: '评估'
      },
      phaseColors: {
        0: {bg: '#161d2b', border: '#3b82f6'},
        1: {bg: '#1a1b2e', border: '#8b5cf6'},
        2: {bg: '#142421', border: '#10b981'},
        3: {bg: '#2a221a', border: '#f59e0b'},
        4: {bg: '#281a1a', border: '#ef4444'},
        5: {bg: '#1a221e', border: '#14b8a6'}
      }
    }
  },
  watch: {
    members: {
      deep: true,
      handler() {
        this.renderGraph()
      }
    },
    activeKillChain: {
      deep: true,
      handler() {
        this.renderGraph()
      }
    }
  },
  mounted() {
    this.initGraph()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.graph) {
      this.graph.dispose()
    }
  },
  methods: {
    initGraph() {
      const container = this.$refs.container
      if (!container) return

      this.graph = new Graph({
        container: container,
        background: {color: '#070c14'}, // 对齐主控台深色底色
        grid: {
          size: 10,
          visible: true,
          type: 'mesh',
          args: {color: '#111c2e', thickness: 1}
        },
        panning: true,
        // 新增配置：开启 X6 框架底层的动态响应，配合外部通知
        autoResize: true,
        width: container.clientWidth || 800,
        height: container.clientHeight || 600,
        interacting: {
          nodeMovable: false,
          edgeMovable: false
        },
        mousewheel: true
      })

      this.graph.on('node:click', ({node}) => {
        const nodeData = node.getData()
        if (!nodeData) return

        if (nodeData.type === 'MORE_BTN') {
          this.$emit('click-more', nodeData)
        } else if (node.shape === 'pt-node' && nodeData.ptDetail) {
          this.$emit('click-pt', nodeData.ptDetail)
        }
      })

      this.renderGraph()
    },

    // ===================================================================
    // 🛰️ 开放并修正给父组件直接跨级调用的 Resize 适配接口
    // ===================================================================
    handleGraphResize() {
      if (this.graph && this.$refs.container) {
        const container = this.$refs.container
        // 动态抓取当前外壳最真实的 Client 宽高（已被 min-width/min-height 赋予收缩权）
        const width = container.clientWidth
        const height = container.clientHeight

        // 抹平、重置并强制重新居中对齐内容
        this.graph.resize(width, height)
        this.graph.centerContent()
      }
    },
    handleResize() {
      // 浏览器级别的拉伸调用
      this.handleGraphResize()
    },
    // ===================================================================

    renderGraph() {
      if (!this.graph) return
      this.graph.clearCells()

      const stages = [0, 1, 2, 3, 4, 5]
      const stateConfigs = {
        1: {color: '#10b981'},
        2: {color: '#ef4444'},
        3: {color: '#94a3b8'},
        4: {color: '#f59e0b'}
      }

      const currentPhase = this.activeKillChain
        ? this.activeKillChain.KILLCHAIN_EXECUTEPHASE
        : -1
      const currentState = this.activeKillChain
        ? this.activeKillChain.KILLCHAIN_STATE
        : 1
      const activeStateCfg = stateConfigs[currentState] || stateConfigs[1]

      stages.forEach((sKey, idx) => {
        const stageX = idx * 235 + 30
        const phaseCfg = this.phaseColors[sKey]
        const isLatest = sKey == currentPhase

        // 1. 绘制主体泳道
        this.graph.addNode({
          x: stageX,
          y: 15,
          width: 210,
          height: 690,
          zIndex: 1,
          label: `阶段 0${idx + 1} · ${this.phraseMap[sKey]}`,
          attrs: {
            body: {
              class: isLatest
                ? `swimlane-body swimlane-active-${currentState}`
                : 'swimlane-body',
              fill: phaseCfg.bg,
              stroke: isLatest ? activeStateCfg.color : phaseCfg.border,
              strokeWidth: isLatest ? 3 : 1,
              rx: 4,
              ry: 4
            },
            label: {
              refY: 25,
              fill: isLatest ? '#ffffff' : '#94A3B8',
              fontSize: 12,
              fontWeight: isLatest ? 'bold' : 'normal',
              textShadow: isLatest ? `0 0 10px ${activeStateCfg.color}` : 'none'
            }
          }
        })

        // 2. 状态标识小圆点
        if (isLatest) {
          this.graph.addNode({
            x: stageX + 188,
            y: 22,
            width: 10,
            height: 10,
            zIndex: 10,
            attrs: {
              body: {
                fill: activeStateCfg.color,
                stroke: '#ffffff',
                strokeWidth: 1.5,
                rx: 5,
                ry: 5,
                class: currentState === 2 ? 'dot-alarm-blink' : ''
              }
            }
          })
        }

        // 3. 过滤及渲染平台节点
        const allStageMembers = this.members.filter(
          m => m.killchain_EXECUTEPHASE == sKey
        )
        const displayMembers = allStageMembers.slice(0, 4)
        const hasMore = allStageMembers.length > 4

        if (hasMore) {
          this.graph.addNode({
            x: stageX + 12,
            y: 70 + 4 * 145,
            width: 185,
            height: 36,
            zIndex: 12,
            markup: [
              {tagName: 'rect', selector: 'body'},
              {tagName: 'text', selector: 'label'}
            ],
            attrs: {
              body: {
                fill: 'rgba(59, 130, 246, 0.1)',
                stroke: 'rgba(59, 130, 246, 0.5)',
                strokeDasharray: '4 2',
                rx: 4,
                ry: 4,
                cursor: 'pointer'
              },
              label: {
                text: `查看更多 (${allStageMembers.length}) ...`,
                fill: '#60a5fa',
                fontSize: 12,
                cursor: 'pointer'
              }
            },
            data: {
              type: 'MORE_BTN',
              phase: sKey,
              themeColor: isLatest ? activeStateCfg.color : phaseCfg.border,
              members: allStageMembers
            }
          })
        }

        displayMembers.forEach((m, mIdx) => {
          this.graph.addNode({
            shape: 'pt-node',
            x: stageX + 12,
            y: 80 + mIdx * 155,
            width: 185,
            height: 140,
            zIndex: 10,
            data: {
              ...m,
              themeColor: isLatest ? activeStateCfg.color : phaseCfg.border,
              isHighlight: isLatest
            }
          })
        })
      })

      // 动态数据装载完毕后，顺便居中对齐所有阶段泳道
      //   this.graph.centerContent()
    }
  }
}
</script>

<style scoped>
/* ===================================================================
   🛰️ 核心修改：通过底层 Flex 与强行阻断破除高度塌陷死锁
   =================================================================== */
.canvas-wrapper {
  flex: 1; /* 完美吞噬父级分配的全部可用空间 */
  width: 100%;
  height: 100%;
  min-width: 0; /* 核心：赋予它跟随父级变小收缩的物理权利 */
  min-height: 0; /* 核心：防止被 X6 大面积 SVG 内部图元顶破撑死死锁 */
  display: flex; /* 转换为 flex 轴 */
  position: relative;
  overflow: hidden;
}

#killchain-graph-container {
  flex: 1;
  width: 100%;
  height: 100%;
  min-width: 0; /* 核心 */
  min-height: 0; /* 核心 */
  position: absolute; /* 使用绝对定位使其完全附着于 .canvas-wrapper 这个安全外壳上 */
  inset: 0; /* 四周拉满 0px */
  background-color: #070c14;
}

/* =================================================================== */
/* 以下复用原画布动态 CSS 特效类，确保抽离后发光动画不失效 */
::v-deep .swimlane-body {
  transition: all 0.5s ease;
}
::v-deep .swimlane-active-1 {
  animation: pulse-normal 2.5s infinite;
}
::v-deep .swimlane-active-2 {
  animation: pulse-error 1.2s infinite;
}
::v-deep .swimlane-active-3 {
  filter: grayscale(0.5);
}
::v-deep .swimlane-active-4 {
  animation: pulse-stop 2.5s infinite;
}

@keyframes pulse-normal {
  50% {
    filter: brightness(1.3) drop-shadow(0 0 12px #10b981);
    stroke-width: 4;
  }
}
@keyframes pulse-error {
  50% {
    filter: brightness(1.5) drop-shadow(0 0 18px #ef4444);
    stroke-width: 5;
  }
}
@keyframes pulse-stop {
  50% {
    filter: brightness(1.3) drop-shadow(0 0 12px #f59e0b);
    stroke-width: 4;
  }
}

::v-deep .dot-alarm-blink {
  animation: alarm-dot 0.6s infinite;
}
@keyframes alarm-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.3);
  }
}
</style>
