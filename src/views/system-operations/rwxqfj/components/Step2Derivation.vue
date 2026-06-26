<template>
  <div
    class="step-content"
    style="height: 100%; display: flex; flex-direction: column"
  >
    <div
      class="step-content-header"
      :style="
        derivationProcess && derivationProcess.figure
          ? {fontSize: (derivationProcess.figure.suptitleFontSize || 13) + 'px'}
          : {}
      "
    >
      {{
        derivationProcess && derivationProcess.figure
          ? derivationProcess.figure.suptitle
          : '步骤二：任务规划推导过程'
      }}
    </div>

    <div
      class="derivation-wrap"
      v-loading="loadingDerivation"
      style="flex: 1; display: flex; min-height: 0; gap: 8px"
    >
      <div
        class="stage-nav"
        v-if="derivationProcess && derivationProcess.stages"
      >
        <div
          v-for="(stage, i) in derivationProcess.stages"
          :key="stage.index"
          class="stage-step"
          :class="{active: currentStageIndex === i}"
          @click="switchStage(i)"
        >
          <span class="stage-dot">{{ stage.index }}</span>
          <span class="stage-label">{{ formatTextWrap(stage.title) }}</span>
        </div>
      </div>

      <div class="stage-content">
        <div class="stage-title-bar">
          <transition name="title-fade" mode="out-in">
            <div
              class="stage-title"
              v-if="currentStage"
              :key="currentStageIndex"
              :style="{fontSize: (currentStage.titleFontSize || 12) + 'px'}"
            >
              <span class="title-arrow">▶</span>
              {{ formatTextWrap(currentStage.title) }}
            </div>
          </transition>
          <span class="auto-play-hint" v-if="autoPlaying">
            <span class="dot-pulse"></span>
            推演中
          </span>
        </div>

        <div
          class="topology-canvas"
          ref="derivationChart"
          v-if="currentStage"
        ></div>

        <div
          class="stage-footer"
          v-if="derivationProcess && derivationProcess.stages"
        >
          <span class="footer-progress">
            <span
              v-for="(s, si) in derivationProcess.stages"
              :key="si"
              class="progress-dot"
              :class="{
                active: si === currentStageIndex,
                done: si < currentStageIndex
              }"
            ></span>
          </span>
          阶段 {{ currentStageIndex + 1 }} /
          {{ derivationProcess.stages.length }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {getDerivationProcess} from '@/api/datalinkAssurance'

export default {
  name: 'Step2Derivation',
  props: {
    zzrwid: {type: Number, default: 22}
  },
  data() {
    return {
      derivationProcess: null,
      loadingDerivation: false,
      currentStageIndex: 0,
      derivationChart: null,
      autoPlaying: false
    }
  },
  computed: {
    currentStage() {
      if (!this.derivationProcess?.stages?.length) return null
      return this.derivationProcess.stages[this.currentStageIndex] || null
    }
  },
  watch: {
    zzrwid() {
      this.fetchData()
    }
  },
  mounted() {
    this.fetchData()
  },
  beforeDestroy() {
    // 销毁监听器，防止内存泄漏
    this.destroyResizeObserver()
    this.clearAutoPlay()
    if (this.derivationChart) {
      this.derivationChart.dispose()
      this.derivationChart = null
    }
  },
  methods: {
    async fetchData() {
      this.loadingDerivation = true
      try {
        const res = await getDerivationProcess(this.zzrwid)
        if (res.code === 0 && res.data) {
          this.derivationProcess =
            typeof res.data === 'string' ? JSON.parse(res.data) : res.data

          console.log(this.derivationProcess)
          this.currentStageIndex = 0

          // ✨ 核心修复 1：更换任务 ID 时，必须清空已渲染标记！
          // 否则如果上一次也是停留在阶段 0，新 ID 的数据会被无视、无法渲染
          this._renderedStage = null

          this.$nextTick(() => {
            this.updateChart()
            // 初次进入自动播放步骤动画（阶段 1 到阶段 4，每步 300ms）
            this.startAutoPlay()
          })
        } else {
          this.derivationProcess = null
        }
      } catch (e) {
        console.error('获取推导过程失败', e)
        this.derivationProcess = null
      } finally {
        this.loadingDerivation = false
      }
    },
    // 自动播放：从阶段 1 依次推进到最后一个阶段，每步 1800ms
    startAutoPlay() {
      this.clearAutoPlay()
      this.autoPlaying = true
      this._autoPlayTimers = []
      const total = this.derivationProcess?.stages?.length || 0
      for (let i = 1; i < total && i <= 4; i++) {
        const timer = setTimeout(() => {
          this._renderedStage = null
          this.currentStageIndex = i
          this.$nextTick(() => this.updateChart())
          if (i === Math.min(total - 1, 4)) {
            this.autoPlaying = false
          }
        }, i * 1800)
        this._autoPlayTimers.push(timer)
      }
    },
    clearAutoPlay() {
      this.autoPlaying = false
      if (this._autoPlayTimers) {
        this._autoPlayTimers.forEach(clearTimeout)
        this._autoPlayTimers = []
      }
    },
    switchStage(index) {
      this.clearAutoPlay()
      if (index >= 0 && index < (this.derivationProcess?.stages?.length || 0)) {
        this.currentStageIndex = index
        this.$nextTick(() => {
          this.updateChart()
        })
      }
    },
    formatTextWrap(text) {
      return text ? text.replace(/\\n/g, '\n') : ''
    },

    // ✨ 核心优化 2：精准的尺寸监听器
    initResizeObserver(el) {
      if (this._resizeObserver) return
      this._resizeObserver = new ResizeObserver(() => {
        if (el.clientWidth > 0 && el.clientHeight > 0) {
          // 当 Tab 切换显示、或窗口大小时，自动触发 ECharts 刷新
          if (this.derivationChart) {
            this.derivationChart.resize()
          }
          // 如果之前因为在暗处（宽高为0）导致没画出来，此时有了尺寸，立刻补画
          if (
            this.derivationProcess &&
            this._renderedStage !== this.currentStageIndex
          ) {
            this.updateChart()
          }
        }
      })
      this._resizeObserver.observe(el)
    },
    destroyResizeObserver() {
      if (this._resizeObserver) {
        this._resizeObserver.disconnect()
        this._resizeObserver = null
      }
    },

    updateChart() {
      if (!this.currentStage) return
      const el = this.$refs.derivationChart
      if (!el) return

      // 初始化监听（不管是初次加载还是从隐藏变显示，只要 DOM 在就能牢牢锁住尺寸变化）
      this.initResizeObserver(el)

      const canvasW = el.clientWidth
      const canvasH = el.clientHeight

      if (canvasW === 0 || canvasH === 0) {
        return
      }

      if (
        this.derivationChart &&
        this._renderedStage === this.currentStageIndex
      ) {
        this.derivationChart.resize()
        return
      }

      if (!this.derivationChart) {
        this.derivationChart = echarts.init(el, null, {renderer: 'canvas'})
      }
      this.derivationChart.resize()

      const figsize = this.derivationProcess?.figure?.figsize || [800, 600]
      const refW = figsize[0] || 800
      const scaleFactor = canvasW / refW
      const padding = 32 * Math.max(0.6, scaleFactor)
      const toX = v => padding + ((v + 1) / 2) * (canvasW - padding * 2)
      const toY = v => padding + ((1 - v) / 2) * (canvasH - padding * 2)

      const stage = this.currentStage
      const {nodes, edges, positions} = stage
      const isDirected = stage.graphType === 'directed'

      // ==================== ✨ 核心修复：绝对唯一的节点 ID 映射 ====================

      // 1. 为每个节点生成绝对唯一的 ECharts ID，并建立「原始 key → 唯一 ID」映射
      const uidMap = new Map() // 原始 key (n.id) → 唯一字符串 ID
      const echartsNodes = nodes.map((n, i) => {
        const rawKey = n.id != null ? n.id : `__idx_${i}`
        const uid = `node_${rawKey}_${i}` // 追加索引，保证绝对不重复
        uidMap.set(rawKey, uid)

        const pos = positions?.[n.id]
        const dynamicSize = 0.5 * scaleFactor
        const nodeLabel = this.formatTextWrap(n.label || n.id)
        return {
          id: uid,
          name: uid,
          x: pos ? toX(pos.x) : canvasW / 2,
          y: pos ? toY(pos.y) : canvasH / 2,
          symbolSize: dynamicSize,
          itemStyle: {
            color: n.color || '#b2bec3',
            borderColor: n.borderColor || '#636e72',
            borderWidth: 1.5,
            shadowBlur: 6,
            shadowColor: 'rgba(0,0,0,0.4)'
          },
          label: {
            show: true,
            fontSize: n.fontSize || 11,
            fontWeight: n.fontWeight || 'medium',
            color: '#e2e8f0',
            position: 'top',
            distance: 6,
            backgroundColor: 'rgba(8,14,24,0.75)',
            padding: [2, 5],
            borderRadius: 3,
            formatter: () => nodeLabel
          },
          extra: {clusterId: n.clusterId, taskType: n.taskType}
        }
      })

      // 2. 转换连线（通过 uidMap 将原始 source/target 映射到唯一 ID）
      const echartsLinks = []
      if (edges && edges.length) {
        edges.forEach((e, i) => {
          const srcUid = e.source != null ? uidMap.get(e.source) : undefined
          const tgtUid = e.target != null ? uidMap.get(e.target) : undefined

          if (!srcUid || !tgtUid) {
            console.warn(
              `[ECharts 脏数据预警] 发现孤立连线已自动过滤：source=${e.source}, target=${e.target}`
            )
            return
          }

          echartsLinks.push({
            source: srcUid,
            target: tgtUid,
            lineStyle: {
              color: e.color || '#409EFF',
              width: Math.max(1, (e.width || 2) * 0.5),
              curveness: 0.15,
              opacity: 0.4
            }
          })
        })
      }

      // ==================== ✨ 以上为核心修复与优化部分 ====================

      const arrowSize = Math.max(
        3,
        (edges.find(e => e.arrowSize)?.arrowSize || 7) * 0.4
      )

      this._renderedStage = this.currentStageIndex

      this.derivationChart.setOption(
        {
          tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(8,14,24,0.95)',
            borderColor: 'rgba(56,189,248,0.4)',
            borderWidth: 1,
            textStyle: {color: '#e2e8f0', fontSize: 11},
            formatter(p) {
              if (!p.data) return ''
              const ext = p.data.extra || {}
              let html = `<b>${p.name.replace(/\n/g, ' ')}</b>`
              if (ext.clusterId !== undefined)
                html += `<br/><span style="font-size:10px">聚类分组：C${ext.clusterId}</span>`
              if (ext.taskType)
                html += `<br/><span style="font-size:10px">任务类型：${ext.taskType === 'COMPOUND' ? '复合任务' : '原子任务'}</span>`
              return html
            }
          },
          animationDurationUpdate: 400,
          animationEasingUpdate: 'cubicOut',
          series: [
            {
              type: 'graph',
              layout: 'none',
              roam: true,
              draggable: true,
              data: echartsNodes,
              links: echartsLinks,
              edgeSymbol: isDirected ? ['none', 'arrow'] : ['none', 'none'],
              edgeSymbolSize: [0, arrowSize],
              focusNodeAdjacency: true,
              lineStyle: {color: 'source', curveness: 0.15},
              emphasis: {
                itemStyle: {
                  borderWidth: 3,
                  borderColor: '#38bdf8',
                  shadowBlur: 12,
                  shadowColor: '#38bdf8'
                },
                label: {color: '#fff', fontWeight: 'bold', fontSize: 12}
              }
            }
          ]
        },
        true
      )
    }
  }
}
</script>
<style scoped>
.step-content-header {
  font-size: 13px;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.derivation-wrap {
  flex: 1;
  display: flex;
  flex-direction: row;
  min-height: 0;
  position: relative;
}
.stage-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  justify-content: flex-start;
  padding: 8px 6px;
  background: rgba(8, 14, 24, 0.4);
  border: 1px solid rgba(30, 41, 59, 0.4);
  border-radius: 6px;
  overflow-y: auto;
}
.stage-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 8px;
}
.stage-step {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0.5;
  white-space: nowrap;
}
.stage-step:hover {
  opacity: 0.8;
  background: rgba(56, 189, 248, 0.08);
}
.stage-step.active {
  opacity: 1;
  background: rgba(56, 189, 248, 0.12);
}
.stage-dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  border: 1.5px solid rgba(56, 189, 248, 0.4);
  color: rgba(56, 189, 248, 0.6);
  transition: all 0.2s;
}
.stage-step.active .stage-dot {
  background: rgba(56, 189, 248, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.3);
}
.stage-label {
  font-size: 10px;
  color: #94a3b8;
  text-align: left;
  line-height: 1.3;
  white-space: nowrap;
}
.stage-step.active .stage-label {
  color: #38bdf8;
}
.stage-title-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 28px;
}
.stage-title {
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: pre-line;
}
.title-arrow {
  display: inline-block;
  font-size: 10px;
  color: #38bdf8;
  animation: arrowBlink 1s ease-in-out infinite;
}
@keyframes arrowBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}

/* Vue 过渡动画：标题淡入上移 */
.title-fade-enter-active {
  animation: titleFadeIn 0.5s ease-out;
}
.title-fade-leave-active {
  animation: titleFadeOut 0.3s ease-in;
}
@keyframes titleFadeIn {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes titleFadeOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-6px);
  }
}

/* 自动推演提示 */
.auto-play-hint {
  font-size: 10px;
  color: #f59e0b;
  display: flex;
  align-items: center;
  gap: 4px;
  animation: hintPulse 1.2s ease-in-out infinite;
}
@keyframes hintPulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
.dot-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
  animation: dotPulse 0.8s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.topology-canvas {
  flex: 1;
  min-height: 0;
  background: rgba(8, 14, 24, 0.6);
  border: 1px solid rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}
.stage-footer {
  text-align: center;
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.footer-progress {
  display: flex;
  align-items: center;
  gap: 4px;
}
.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.2);
  transition: all 0.3s;
}
.progress-dot.active {
  background: #38bdf8;
  border-color: #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.5);
  transform: scale(1.3);
}
.progress-dot.done {
  background: rgba(56, 189, 248, 0.4);
  border-color: rgba(56, 189, 248, 0.5);
}
</style>
