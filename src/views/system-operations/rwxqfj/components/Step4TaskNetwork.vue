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
    <div class="step-content-header">步骤四：AI 基于任务网络推演</div>

    <!-- 顶部：数据链保障需求表格 -->
    <div class="datalink-result-box">
      <div class="result-title">📡 数据链保障需求（AI 基于任务网络推演）</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>任务网络名称</th>
            <th>网络类型</th>
            <th>时延(ms)</th>
            <th>带宽(Mbps)</th>
            <th>承载业务</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in datalinkRequirements"
            :key="i"
            :class="i % 2 === 1 ? 'row-striped' : ''"
          >
            <td>{{ row.name }}</td>
            <td>{{ row.type }}</td>
            <td class="text-center">{{ row.delay }}</td>
            <td class="text-center">{{ row.bandwidth }}</td>
            <td>{{ row.services }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 底部：左侧图表 + 右侧卡片 -->
    <div class="step4-bottom">
      <div class="step4-bottom-left">
        <div class="chart-box" style="height: 100%">
          <div class="chart-title">
            关联规则挖掘 — 各任务网络时延/带宽指标对比
          </div>
          <div ref="latencyChart" class="chart-svg"></div>
        </div>
      </div>
      <div class="step4-bottom-right">
        <div class="result-item">
          <h4>任务网络结构</h4>
          <ul>
            <li>● 顶层：编队骨干指挥网络</li>
            <li>● 下层：各专项任务子网</li>
            <li>● 架构：标准树形层级网络</li>
            <li>● 关系：指挥、协同、保障</li>
          </ul>
        </div>
        <div class="result-item">
          <h4>数据源说明</h4>
          <ul>
            <li>● 作战编成：确定单元与装备</li>
            <li>● 行动路线：划分时序与区域</li>
            <li>● 作战区域：区分任务属性</li>
            <li>● 多源数据融合完成分析</li>
          </ul>
        </div>
        <div class="result-item">
          <h4>数据链核心约束</h4>
          <ul>
            <li>● 指挥网：低时延、高可靠</li>
            <li>● 预警网：大带宽、高实时</li>
            <li>● 作战网：抗干扰、低截获</li>
            <li>● 保障网：长续航、广覆盖</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'Step4TaskNetwork',
  props: {
    zzrwid: {type: Number, default: 22},
    datalinkRequirements: {type: Array, default: () => []}
  },
  data() {
    return {
      latencyChart: null
    }
  },
  watch: {
    zzrwid() {
      this.updateLatencyChart()
    },
    datalinkRequirements() {
      this.$nextTick(() => this.updateLatencyChart())
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initLatencyChart()
      this.updateLatencyChart()
    })
  },
  methods: {
    initLatencyChart() {
      const el = this.$refs.latencyChart
      if (!el) return
      this.latencyChart = echarts.init(el, null, {renderer: 'canvas'})
      this.latencyChart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8,14,24,0.92)',
          borderColor: 'rgba(56,189,248,0.25)',
          borderWidth: 1,
          textStyle: {color: '#e2e8f0', fontSize: 11},
          formatter(params) {
            if (!Array.isArray(params)) return ''
            return `<b>${params[0]?.name || ''}</b><br/>${params.map(p => `${p.marker} ${p.seriesName}：${p.value}${p.seriesName === '时延指标' ? 'ms' : 'Mbps'}`).join('<br/>')}`
          }
        },
        legend: {
          data: ['时延指标', '带宽指标'],
          textStyle: {color: '#e2e8f0', fontSize: 10},
          right: 10,
          top: 5
        },
        grid: {left: '10%', right: '10%', top: '22%', bottom: '12%'},
        xAxis: {
          type: 'category',
          axisLabel: {color: '#94a3b8', fontSize: 8, rotate: 15},
          axisLine: {show: false}
        },
        yAxis: [
          {
            type: 'value',
            name: '时延 (ms)',
            nameTextStyle: {color: '#409EFF', fontSize: 9},
            axisLabel: {color: '#94a3b8', fontSize: 9, formatter: '{value} ms'},
            splitLine: {lineStyle: {color: 'rgba(255,255,255,0.06)'}}
          },
          {
            type: 'value',
            name: '带宽 (Mbps)',
            nameTextStyle: {color: '#67C23A', fontSize: 9},
            axisLabel: {color: '#94a3b8', fontSize: 9, formatter: '{value} M'},
            splitLine: {show: false}
          }
        ],
        series: [
          {
            name: '时延指标',
            type: 'line',
            yAxisIndex: 0,
            smooth: true,
            data: [],
            lineStyle: {color: '#409EFF', width: 2},
            symbol: 'circle',
            symbolSize: 5,
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {offset: 0, color: 'rgba(64,158,255,0.25)'},
                  {offset: 1, color: 'rgba(64,158,255,0.02)'}
                ]
              }
            }
          },
          {
            name: '带宽指标',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: [],
            lineStyle: {color: '#67C23A', width: 2},
            symbol: 'circle',
            symbolSize: 5
          }
        ]
      })
    },
    updateLatencyChart() {
      if (!this.latencyChart || !this.datalinkRequirements.length) return
      this.latencyChart.setOption({
        xAxis: {data: this.datalinkRequirements.map(d => d.name)},
        series: [
          {data: this.datalinkRequirements.map(d => Number(d.delay) || 0)},
          {data: this.datalinkRequirements.map(d => Number(d.bandwidth) || 0)}
        ]
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
/* 底部布局：左侧图表 + 右侧卡片 */
.step4-bottom {
  flex: 1;
  display: flex;
  gap: 8px;
  min-height: 0;
  margin-top: 8px;
}
.step4-bottom-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.step4-bottom-left .chart-box {
  flex: 1;
  border: 1px solid rgba(30, 41, 59, 0.6);
  border-radius: 4px;
  padding: 6px;
  background: rgba(8, 14, 24, 0.6);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.step4-bottom-left .chart-svg {
  flex: 1;
  width: 100%;
  min-height: 80px;
}
.step4-bottom-right {
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex-shrink: 0;
  overflow-y: auto;
}
.chart-title {
  font-size: 10px;
  color: var(--color-primary);
  font-weight: bold;
  margin-bottom: 4px;
  text-align: center;
  flex-shrink: 0;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10px;
}
.data-table th {
  background: rgba(5, 11, 20, 0.8);
  color: var(--color-primary);
  height: 28px;
  border: 1px solid rgba(30, 41, 59, 0.5);
  font-weight: 600;
  letter-spacing: 0.3px;
  padding: 3px 5px;
}
.data-table td {
  height: 24px;
  text-align: center;
  border: 1px solid rgba(30, 41, 59, 0.4);
  color: var(--color-text-main);
  padding: 2px 5px;
}
.data-table tbody tr:hover td {
  background: rgba(56, 189, 248, 0.06);
  color: #fff;
}
.row-striped td {
  background: rgba(30, 41, 59, 0.3);
}
.text-center {
  text-align: center;
}
.datalink-result-box {
  border: 1.5px solid var(--color-primary);
  border-radius: 6px;
  padding: 12px 10px;
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.08),
    rgba(56, 189, 248, 0.03)
  );
  flex-shrink: 0;
  box-shadow:
    0 0 20px rgba(56, 189, 248, 0.08),
    inset 0 0 30px rgba(56, 189, 248, 0.03);
}
.result-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 10px;
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
}
.step4-bottom-right .result-item {
  flex: 1;
  padding: 10px 8px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 4px;
  border: 1px solid rgba(30, 41, 59, 0.5);
}
.result-item h4 {
  font-size: 12px;
  margin-bottom: 6px;
  color: var(--color-primary);
}
.result-item ul {
  list-style: none;
  font-size: 11px;
  line-height: 1.7;
  color: #94a3b8;
  padding: 0;
  margin: 0;
}
</style>
