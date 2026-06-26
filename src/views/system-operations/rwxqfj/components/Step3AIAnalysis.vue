<template>
  <div
    class="step-content"
    style="
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    "
  >
    <div class="step-content-header">步骤三：AI 智能分析主流程</div>
    <div class="ai-flow-box">
      <div class="ai-flow-item">输入：作战编成/路线/区域</div>
      <div class="ai-flow-item">AI算法：聚类+GNN+关联挖掘</div>
      <div class="ai-flow-item">输出：层级任务网络</div>
      <div class="ai-flow-item">输出：数据链保障需求</div>
    </div>
    <div class="ai-algo-wrap">
      <div class="algo-card">
        <div class="algo-name">① K-Means 空间聚类</div>
        <div class="algo-desc">
          结合平台编成、位置、航线划分任务群组，梳理指挥协同关系
        </div>
      </div>
      <div class="algo-card">
        <div class="algo-name">② GNN 图神经网络</div>
        <div class="algo-desc">
          基于任务与单元关联关系，构建树形骨干任务网络拓扑
        </div>
      </div>
      <div class="algo-card">
        <div class="algo-name">③ 通信关联规则挖掘</div>
        <div class="algo-desc">
          依据任务网络结构与业务属性，自动推导时延、带宽、终端配置需求
        </div>
      </div>
    </div>
    <div class="chart-row" style="flex: 1; min-height: 0">
      <div class="chart-col" :class="{'chart-col--expanded': gnnExpanded}">
        <div class="chart-box">
          <div class="chart-title">
            <span>GNN图神经网络 — 任务节点信息交互拓扑</span>
            <span class="expand-btn" @click="toggleGnnExpand">{{
              gnnExpanded ? '收起' : '⛶ 展开'
            }}</span>
          </div>
          <div ref="gnnChart" class="chart-svg"></div>
        </div>
      </div>
      <div class="chart-col" v-show="!gnnExpanded">
        <div class="chart-box">
          <div class="chart-title">K-Means聚类 — 任务节点数量分布</div>
          <div ref="kmeansChart" class="chart-svg"></div>
          <div class="cluster-legend" ref="kmeansLegend"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {getTopology, getTaskNodeDistribution} from '@/api/datalinkAssurance'

export default {
  name: 'Step3AIAnalysis',
  props: {
    zzrwid: {type: Number, default: 22}
  },
  data() {
    return {
      gnnExpanded: false,
      gnnChart: null,
      kmeansChart: null
    }
  },
  watch: {
    zzrwid() {
      this.loadCharts()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      this.loadCharts()
    })
  },
  methods: {
    initCharts() {
      this.initGnnChart()
      this.initKmeansChart()
    },
    loadCharts() {
      this.fetchTopology()
      this.fetchDistribution()
    },
    initGnnChart() {
      const el = this.$refs.gnnChart
      if (!el) return
      this.gnnChart = echarts.init(el, null, {renderer: 'canvas'})
      this.gnnChart.setOption({
        tooltip: {
          trigger: 'item',
          backgroundColor: 'rgba(8,14,24,0.92)',
          borderColor: 'rgba(56,189,248,0.25)',
          borderWidth: 1,
          textStyle: {color: '#e2e8f0', fontSize: 11},
          extraCssText:
            'max-width:260px;white-space:normal;word-break:break-all;'
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            force: {repulsion: 400, edgeLength: [100, 200]},
            symbolSize: 36,
            label: {show: true, fontSize: 10, color: '#fff'},
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: [0, 8],
            lineStyle: {color: 'source', curveness: 0.2, width: 1.5},
            data: [],
            links: []
          }
        ]
      })
    },
    async fetchTopology() {
      try {
        const res = await getTopology(this.zzrwid)
        if (!this.gnnChart) return
        const raw = res.data || res
        const taskNodes = Array.isArray(raw.taskNodes)
          ? raw.taskNodes
          : raw.taskNodes?.taskNodes || []
        const depRels = Array.isArray(raw.dependencyRelations)
          ? raw.dependencyRelations
          : raw.dependencyRelations?.dependencyRelations || []
        const paraRels = Array.isArray(raw.parallelRelations)
          ? raw.parallelRelations
          : raw.parallelRelations?.parallelRelations || []
        const maxCount = Math.max(
          ...taskNodes.map(n => (n.ZZRWPTIDS ? n.ZZRWPTIDS.length : 0) || 1),
          1
        )
        const colors = [
          '#409EFF',
          '#67C23A',
          '#E6A23C',
          '#F56C6C',
          '#9C88FF',
          '#36CFB7',
          '#FF9800',
          '#00BCD4'
        ]
        const nodes = taskNodes.map((n, i) => {
          const ptCount = n.ZZRWPTIDS ? n.ZZRWPTIDS.length : 0
          const ptNames = Array.isArray(n.PTMCS) ? n.PTMCS : []
          return {
            id: n.taskId || String(i),
            name: n.taskName || n.taskId || '',
            value: ptCount,
            symbolSize: 22 + (ptCount / maxCount) * 36,
            itemStyle: {color: colors[i % colors.length]},
            extra: {
              taskId: n.taskId,
              platformCount: ptCount,
              platformNames: ptNames
            }
          }
        })
        const linkMap = new Map()
        depRels.forEach(d => {
          const k = `${d.sourceTaskId}-${d.targetTaskId}`
          if (!linkMap.has(k))
            linkMap.set(k, {
              source: d.sourceTaskId,
              target: d.targetTaskId,
              lineStyle: {color: '#409EFF', width: 1.5, curveness: 0.2}
            })
        })
        const links = Array.from(linkMap.values())
        paraRels.forEach(p => {
          const ids = Array.isArray(p.taskIds) ? p.taskIds : []
          if (ids.length > 1) {
            for (let i = 1; i < ids.length; i++)
              links.push({
                source: ids[i - 1],
                target: ids[i],
                lineStyle: {type: 'dashed', color: '#f59e0b', width: 1.5}
              })
          }
        })
        if (nodes.length) {
          this.gnnChart.setOption({
            series: [
              {
                data: nodes,
                links,
                roam: true,
                label: {
                  show: true,
                  fontSize: 10,
                  color: '#fff',
                  formatter: p => `${p.name}\n(${p.value}个平台)`
                },
                tooltip: {
                  extraCssText: 'max-width:400px;white-space:normal;',
                  formatter: p => {
                    const ext = p.data?.extra || {}
                    return `<b>${p.name}</b><br/><span style="font-size:10px">任务编号：${ext.taskId || '-'}</span><br/><span style="font-size:10px">平台数量：${ext.platformCount || 0}</span>`
                  }
                }
              }
            ]
          })
        }
      } catch (e) {
        console.error('获取拓扑失败', e)
      }
    },
    initKmeansChart() {
      const el = this.$refs.kmeansChart
      if (!el) return
      this.kmeansChart = echarts.init(el, null, {renderer: 'canvas'})
      this.kmeansChart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8,14,24,0.92)',
          borderColor: 'rgba(56,189,248,0.25)',
          textStyle: {color: '#e2e8f0', fontSize: 11}
        },
        grid: {left: '8%', right: '5%', top: '8%', bottom: '18%'},
        xAxis: {
          type: 'category',
          axisLabel: {color: '#94a3b8', fontSize: 8, rotate: 20},
          axisLine: {show: false}
        },
        yAxis: {
          type: 'value',
          axisLabel: {color: '#94a3b8', fontSize: 9},
          splitLine: {lineStyle: {color: 'rgba(255,255,255,0.06)'}}
        },
        series: [
          {type: 'bar', data: [], itemStyle: {borderRadius: [2, 2, 0, 0]}}
        ]
      })
    },
    async fetchDistribution() {
      try {
        const res = await getTaskNodeDistribution(this.zzrwid)
        if (!this.kmeansChart) return
        const raw = res.data || res
        const countMap =
          raw.taskNodeNamePTCountMap || raw.TaskNodeNamePTCountMap || {}
        const data = Object.entries(countMap)
          .map(([name, value]) => ({name, value: Number(value) || 0}))
          .sort((a, b) => b.value - a.value)
        const palette = [
          '#409EFF',
          '#67C23A',
          '#E6A23C',
          '#F56C6C',
          '#9C88FF',
          '#36CFB7',
          '#FF9800',
          '#00BCD4',
          '#FF6B9D',
          '#7C4DFF'
        ]
        this.kmeansChart.setOption({
          xAxis: {data: data.map(d => d.name)},
          series: [
            {
              type: 'bar',
              data: data.map((d, i) => ({
                value: d.value,
                itemStyle: {
                  color: palette[i % palette.length],
                  borderRadius: [3, 3, 0, 0]
                }
              }))
            }
          ]
        })
      } catch (e) {
        console.error('获取分布数据失败', e)
      }
    },

    toggleGnnExpand() {
      this.gnnExpanded = !this.gnnExpanded
      this.$nextTick(() => {
        if (this.gnnChart) this.gnnChart.resize()
        if (this.kmeansChart) this.kmeansChart.resize()
        if (this.kmeansChart) this.kmeansChart.resize()
      })
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
}
.ai-flow-box {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.ai-flow-item {
  flex: 1;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  padding: 6px 4px;
  text-align: center;
  font-size: 10px;
  font-weight: bold;
  color: var(--color-primary);
}
.ai-algo-wrap {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.algo-card {
  flex: 1;
  background: rgba(56, 189, 248, 0.06);
  border: 1px solid rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  padding: 6px;
}
.algo-name {
  font-weight: bold;
  color: var(--color-primary);
  font-size: 10px;
  margin-bottom: 3px;
}
.algo-desc {
  font-size: 9px;
  line-height: 1.4;
  color: #94a3b8;
}
.chart-row {
  display: flex;
  gap: 8px;
  flex: 1;
  min-height: 0;
}
.chart-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.chart-col--expanded {
  flex: 1;
}
.chart-box {
  border: 1px solid rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  padding: 6px;
  background: rgba(8, 14, 24, 0.6);
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}
.chart-title {
  font-size: 10px;
  color: var(--color-primary);
  font-weight: bold;
  margin-bottom: 4px;
  text-align: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.expand-btn {
  display: inline-block;
  font-size: 9px;
  color: rgba(56, 189, 248, 0.7);
  cursor: pointer;
  padding: 1px 8px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: 3px;
  transition: all 0.2s;
  font-weight: normal;
  letter-spacing: 0.5px;
}
.expand-btn:hover {
  color: #38bdf8;
  border-color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
}
.chart-svg {
  flex: 1;
  width: 100%;
  min-height: 120px;
  height: 120px;
}
.cluster-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 3px;
  flex-shrink: 0;
}
</style>
