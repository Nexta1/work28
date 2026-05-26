<template>
  <div class="monitor-dashboard">
    <!-- 主内容区 - 无顶部标题，直接展示 -->
    <div class="main-container">
      <!-- 左侧：任务保障 + 网络运行 -->
      <div class="column side-col">
        <!-- 任务保障统计 -->
        <div class="panel compact">
          <div class="panel-header">
            <span class="panel-icon">◈</span>
            <span class="panel-title">任务保障统计</span>
          </div>
          <div class="panel-body">
            <div class="stat-grid">
              <div
                class="stat-item"
                v-for="(item, index) in missionStats"
                :key="index"
              >
                <div class="stat-value" :class="item.status">
                  {{ item.value }}
                </div>
                <div class="stat-label">{{ item.label }}</div>
              </div>
            </div>
            <div ref="missionChart" class="chart-container small"></div>
          </div>
        </div>

        <!-- 数据链网络运行统计 -->
        <div class="panel compact">
          <div class="panel-header">
            <span class="panel-icon">☰</span>
            <span class="panel-title">网络运行统计</span>
          </div>
          <div class="panel-body">
            <div class="network-rings">
              <div
                class="ring-box"
                v-for="(metric, index) in networkMetrics"
                :key="index"
              >
                <div ref="networkRingCharts" class="ring-chart"></div>
                <div class="ring-text">
                  <div class="ring-value">
                    {{ metric.value }}{{ metric.unit }}
                  </div>
                  <div class="ring-label">{{ metric.label }}</div>
                </div>
              </div>
            </div>
            <div ref="networkTrendChart" class="chart-container small"></div>
          </div>
        </div>

        <!-- 平台在网统计 -->
        <div class="panel compact">
          <div class="panel-header">
            <span class="panel-icon">◎</span>
            <span class="panel-title">平台在网统计</span>
          </div>
          <div class="panel-body">
            <div class="platform-brief">
              <span class="brief-item"
                >总数: <b>{{ platformStats.total }}</b></span
              >
              <span class="brief-item online"
                >在线: <b>{{ platformStats.online }}</b></span
              >
              <span class="brief-item warning"
                >告警: <b>{{ platformStats.warning }}</b></span
              >
            </div>
            <div ref="platformChart" class="chart-container"></div>
            <div class="platform-table">
              <table>
                <thead>
                  <tr>
                    <th>编号</th>
                    <th>类型</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in platformList.slice(0, 4)" :key="i">
                    <td class="mono">{{ p.id }}</td>
                    <td>{{ p.type }}</td>
                    <td :class="p.status">
                      <span class="dot"></span>{{ p.statusText }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：杀伤链（主要位置） -->
      <div class="column center-col">
        <div class="panel main-panel">
          <div class="panel-header main-header">
            <span class="panel-icon">⚔</span>
            <span class="panel-title">杀伤链保障态势</span>
            <div class="task-tabs">
              <span
                v-for="task in taskTypes"
                :key="task.key"
                :class="['tab', {active: currentTask === task.key}]"
                @click="switchTask(task.key)"
              >
                {{ task.name }}
              </span>
            </div>
          </div>
          <div class="panel-body main-body">
            <!-- 杀伤链主图表 -->
            <div class="killchain-main">
              <div ref="killChainMainChart" class="main-chart"></div>
              <div class="killchain-legend">
                <div
                  class="legend-item"
                  v-for="(item, idx) in currentKillChainData"
                  :key="idx"
                >
                  <span
                    class="legend-color"
                    :style="{background: item.color}"
                  ></span>
                  <span class="legend-name">{{ item.name }}</span>
                  <span class="legend-value" :style="{color: item.color}"
                    >{{ item.value }}%</span
                  >
                </div>
              </div>
            </div>

            <!-- 杀伤链详情 -->
            <div class="killchain-detail">
              <div class="chain-cards">
                <div
                  class="chain-card"
                  v-for="(chain, idx) in currentKillChainData"
                  :key="idx"
                  :style="{borderColor: chain.color}"
                >
                  <div class="card-header" :style="{color: chain.color}">
                    <span class="card-name">{{ chain.name }}</span>
                    <span class="card-phase">PHASE {{ idx + 1 }}</span>
                  </div>
                  <div class="card-body">
                    <div class="big-number" :style="{color: chain.color}">
                      {{ chain.value }}
                    </div>
                    <div class="card-metrics">
                      <div class="metric">
                        <span class="metric-label">响应时间</span>
                        <span class="metric-val">{{ chain.response }}ms</span>
                      </div>
                      <div class="metric">
                        <span class="metric-label">成功率</span>
                        <span class="metric-val">{{ chain.success }}%</span>
                      </div>
                    </div>
                  </div>
                  <div class="card-progress">
                    <div
                      class="progress-fill"
                      :style="{
                        width: chain.value + '%',
                        background: chain.color
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：告警 + 故障 -->
      <div class="column side-col">
        <!-- 数据链装备告警统计 -->
        <div class="panel compact">
          <div class="panel-header">
            <span class="panel-icon">⚠</span>
            <span class="panel-title">装备告警统计</span>
          </div>
          <div class="panel-body">
            <div ref="alarmChart" class="chart-container"></div>
            <div class="alarm-list">
              <div
                class="alarm-item"
                v-for="(alarm, idx) in recentAlarms"
                :key="idx"
                :class="alarm.level"
              >
                <span class="alarm-badge">{{ alarm.levelText }}</span>
                <span class="alarm-msg">{{ alarm.content }}</span>
                <span class="alarm-time">{{ alarm.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据链装备故障统计 -->
        <div class="panel compact">
          <div class="panel-header">
            <span class="panel-icon">⚡</span>
            <span class="panel-title">装备故障统计</span>
          </div>
          <div class="panel-body">
            <div class="fault-numbers">
              <div class="fnum total">
                <div class="fnum-val">{{ faultStats.total }}</div>
                <div class="fnum-label">本月故障</div>
              </div>
              <div class="fnum resolved">
                <div class="fnum-val">{{ faultStats.resolved }}</div>
                <div class="fnum-label">已修复</div>
              </div>
              <div class="fnum pending">
                <div class="fnum-val">{{ faultStats.pending }}</div>
                <div class="fnum-label">待处理</div>
              </div>
            </div>
            <div ref="faultChart" class="chart-container"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'MonitorDashboard',

  data() {
    return {
      charts: {},
      currentTask: 'strike',

      // 任务类型
      taskTypes: [
        {key: 'strike', name: '打击任务'},
        {key: 'defense', name: '防御任务'},
        {key: 'recon', name: '侦察任务'},
        {key: 'support', name: '支援任务'}
      ],

      // 不同任务的杀伤链数据
      killChainData: {
        strike: [
          {
            name: '发现(F)',
            value: 96,
            color: '#00f0ff',
            response: 120,
            success: 98.5
          },
          {
            name: '定位(F)',
            value: 92,
            color: '#00ff88',
            response: 85,
            success: 97.2
          },
          {
            name: '跟踪(T)',
            value: 89,
            color: '#ffdd00',
            response: 200,
            success: 95.8
          },
          {
            name: '瞄准(T)',
            value: 94,
            color: '#ff8800',
            response: 150,
            success: 96.5
          },
          {
            name: '交战(E)',
            value: 91,
            color: '#ff0044',
            response: 300,
            success: 94.2
          },
          {
            name: '评估(A)',
            value: 88,
            color: '#aa00ff',
            response: 500,
            success: 93.1
          }
        ],
        defense: [
          {
            name: '发现(F)',
            value: 98,
            color: '#00f0ff',
            response: 80,
            success: 99.1
          },
          {
            name: '定位(F)',
            value: 95,
            color: '#00ff88',
            response: 60,
            success: 98.5
          },
          {
            name: '跟踪(T)',
            value: 96,
            color: '#ffdd00',
            response: 100,
            success: 97.8
          },
          {
            name: '瞄准(T)',
            value: 93,
            color: '#ff8800',
            response: 120,
            success: 96.9
          },
          {
            name: '交战(E)',
            value: 97,
            color: '#ff0044',
            response: 200,
            success: 98.2
          },
          {
            name: '评估(A)',
            value: 94,
            color: '#aa00ff',
            response: 400,
            success: 95.5
          }
        ],
        recon: [
          {
            name: '发现(F)',
            value: 99,
            color: '#00f0ff',
            response: 50,
            success: 99.8
          },
          {
            name: '定位(F)',
            value: 97,
            color: '#00ff88',
            response: 100,
            success: 98.9
          },
          {
            name: '跟踪(T)',
            value: 95,
            color: '#ffdd00',
            response: 150,
            success: 97.5
          },
          {
            name: '瞄准(T)',
            value: 85,
            color: '#ff8800',
            response: 200,
            success: 92.1
          },
          {
            name: '交战(E)',
            value: 60,
            color: '#ff0044',
            response: 0,
            success: 0
          },
          {
            name: '评估(A)',
            value: 98,
            color: '#aa00ff',
            response: 300,
            success: 99.2
          }
        ],
        support: [
          {
            name: '发现(F)',
            value: 90,
            color: '#00f0ff',
            response: 200,
            success: 95.2
          },
          {
            name: '定位(F)',
            value: 88,
            color: '#00ff88',
            response: 180,
            success: 94.5
          },
          {
            name: '跟踪(T)',
            value: 85,
            color: '#ffdd00',
            response: 250,
            success: 93.1
          },
          {
            name: '瞄准(T)',
            value: 82,
            color: '#ff8800',
            response: 300,
            success: 91.8
          },
          {
            name: '交战(E)',
            value: 80,
            color: '#ff0044',
            response: 400,
            success: 90.5
          },
          {
            name: '评估(A)',
            value: 92,
            color: '#aa00ff',
            response: 600,
            success: 96.2
          }
        ]
      },

      // 任务保障
      missionStats: [
        {label: '保障任务', value: 128, status: 'normal'},
        {label: '成功率', value: '98.5%', status: 'good'}
      ],

      // 网络指标
      networkMetrics: [
        {label: '带宽', value: 68, unit: '%'},
        {label: '负载', value: 45, unit: '%'},
        {label: '质量', value: 92, unit: '%'}
      ],

      // 平台数据
      platformStats: {total: 156, online: 142, offline: 8, warning: 6},
      platformList: [
        {id: 'PLT-001', type: '指挥车', status: 'online', statusText: '在线'},
        {id: 'PLT-002', type: '雷达站', status: 'online', statusText: '在线'},
        {id: 'PLT-003', type: '通信车', status: 'warning', statusText: '告警'},
        {id: 'PLT-004', type: '无人机', status: 'online', statusText: '在线'},
        {id: 'PLT-005', type: '指挥车', status: 'offline', statusText: '离线'}
      ],

      // 告警
      recentAlarms: [
        {
          time: '15:02',
          level: 'high',
          levelText: '紧急',
          content: '节点PLT-003通信中断'
        },
        {
          time: '14:58',
          level: 'medium',
          levelText: '重要',
          content: '链路延迟超过阈值'
        },
        {
          time: '14:45',
          level: 'low',
          levelText: '一般',
          content: '备用电源切换'
        }
      ],

      // 故障
      faultStats: {total: 23, resolved: 18, pending: 5}
    }
  },

  computed: {
    currentKillChainData() {
      return this.killChainData[this.currentTask]
    }
  },

  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      window.addEventListener('resize', this.handleResize)
    })
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    Object.values(this.charts).forEach(chart => chart && chart.dispose())
  },

  methods: {
    switchTask(taskKey) {
      this.currentTask = taskKey
      this.$nextTick(() => {
        this.updateKillChainChart()
      })
    },

    initCharts() {
      this.initMissionChart()
      this.initNetworkCharts()
      this.initPlatformChart()
      this.initKillChainChart()
      this.initAlarmChart()
      this.initFaultChart()
    },

    initMissionChart() {
      const dom = this.$refs.missionChart
      if (!dom) return
      const chart = echarts.init(dom)
      this.charts.mission = chart

      chart.setOption({
        grid: {top: 5, right: 5, bottom: 5, left: 5, containLabel: true},
        xAxis: {
          type: 'category',
          data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
          axisLine: {lineStyle: {color: '#1e3a5f'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {lineStyle: {color: '#1e3a5f', type: 'dashed'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        series: [
          {
            data: [120, 132, 101, 134, 90, 130],
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: {color: '#00f0ff', width: 2},
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {offset: 0, color: 'rgba(0, 240, 255, 0.3)'},
                {offset: 1, color: 'rgba(0, 240, 255, 0.05)'}
              ])
            }
          }
        ]
      })
    },

    initNetworkCharts() {
      // 环形图
      this.$refs.networkRingCharts?.forEach((el, index) => {
        if (!el) return
        const chart = echarts.init(el)
        this.charts[`network${index}`] = chart

        const metric = this.networkMetrics[index]
        const color =
          index === 0 ? '#00f0ff' : index === 1 ? '#00ff88' : '#ffdd00'

        chart.setOption({
          series: [
            {
              type: 'pie',
              radius: ['70%', '90%'],
              center: ['50%', '50%'],
              startAngle: 90,
              label: {show: false},
              data: [
                {value: metric.value, itemStyle: {color: color}},
                {
                  value: 100 - metric.value,
                  itemStyle: {color: 'rgba(30, 58, 95, 0.3)'}
                }
              ]
            }
          ]
        })
      })

      // 趋势图
      const trendDom = this.$refs.networkTrendChart
      if (!trendDom) return
      const trendChart = echarts.init(trendDom)
      this.charts.networkTrend = trendChart

      trendChart.setOption({
        grid: {top: 5, right: 5, bottom: 5, left: 5, containLabel: true},
        xAxis: {
          type: 'category',
          data: ['1分', '2分', '3分', '4分', '5分'],
          axisLine: {lineStyle: {color: '#1e3a5f'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {lineStyle: {color: '#1e3a5f', type: 'dashed'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        series: [
          {
            type: 'bar',
            data: [320, 302, 301, 334, 390],
            itemStyle: {color: 'rgba(0, 240, 255, 0.6)'}
          }
        ]
      })
    },

    initPlatformChart() {
      const dom = this.$refs.platformChart
      if (!dom) return
      const chart = echarts.init(dom)
      this.charts.platform = chart

      chart.setOption({
        grid: {top: 5, right: 5, bottom: 5, left: 5, containLabel: true},
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            roseType: 'radius',
            itemStyle: {borderRadius: 3},
            label: {show: false},
            data: [
              {value: 40, name: '指挥控制', itemStyle: {color: '#00f0ff'}},
              {value: 38, name: '情报侦察', itemStyle: {color: '#00ff88'}},
              {value: 32, name: '通信中继', itemStyle: {color: '#ffdd00'}},
              {value: 30, name: '电子对抗', itemStyle: {color: '#ff8800'}},
              {value: 28, name: '武器平台', itemStyle: {color: '#ff0044'}}
            ]
          }
        ]
      })
    },

    initKillChainChart() {
      const dom = this.$refs.killChainMainChart
      if (!dom) return
      const chart = echarts.init(dom)
      this.charts.killChain = chart

      this.updateKillChainChart()
    },

    updateKillChainChart() {
      const chart = this.charts.killChain
      if (!chart) return

      const data = this.currentKillChainData

      chart.setOption(
        {
          backgroundColor: 'transparent',
          grid: {top: 20, right: 30, bottom: 20, left: 30, containLabel: true},
          radar: {
            indicator: data.map(d => ({name: d.name, max: 100})),
            center: ['50%', '55%'],
            radius: '65%',
            axisName: {
              color: '#8ba3c7',
              fontSize: 11,
              formatter: value => value.split('(')[0]
            },
            splitArea: {
              areaStyle: {
                color: [
                  'rgba(0, 240, 255, 0.02)',
                  'rgba(0, 240, 255, 0.05)',
                  'rgba(0, 240, 255, 0.08)',
                  'rgba(0, 240, 255, 0.11)'
                ]
              }
            },
            axisLine: {lineStyle: {color: '#1e3a5f'}},
            splitLine: {lineStyle: {color: '#1e3a5f'}}
          },
          series: [
            {
              type: 'radar',
              data: [
                {
                  value: data.map(d => d.value),
                  name: '杀伤链效能',
                  areaStyle: {
                    color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                      {offset: 0, color: 'rgba(0, 240, 255, 0.1)'},
                      {offset: 1, color: 'rgba(0, 240, 255, 0.3)'}
                    ])
                  },
                  lineStyle: {color: '#00f0ff', width: 2},
                  itemStyle: {
                    color: '#00f0ff',
                    borderWidth: 2,
                    borderColor: '#fff'
                  }
                }
              ]
            }
          ]
        },
        true
      )
    },

    initAlarmChart() {
      const dom = this.$refs.alarmChart
      if (!dom) return
      const chart = echarts.init(dom)
      this.charts.alarm = chart

      chart.setOption({
        grid: {top: 5, right: 5, bottom: 5, left: 5, containLabel: true},
        xAxis: {
          type: 'category',
          data: ['通信', '导航', '雷达', '电子', '武器'],
          axisLine: {lineStyle: {color: '#1e3a5f'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {lineStyle: {color: '#1e3a5f', type: 'dashed'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        series: [
          {
            type: 'bar',
            data: [
              {value: 12, itemStyle: {color: '#ff0044'}},
              {value: 8, itemStyle: {color: '#ff8800'}},
              {value: 15, itemStyle: {color: '#ffdd00'}},
              {value: 6, itemStyle: {color: '#00f0ff'}},
              {value: 4, itemStyle: {color: '#00ff88'}}
            ],
            barWidth: '50%'
          }
        ]
      })
    },

    initFaultChart() {
      const dom = this.$refs.faultChart
      if (!dom) return
      const chart = echarts.init(dom)
      this.charts.fault = chart

      chart.setOption({
        grid: {top: 5, right: 5, bottom: 5, left: 5, containLabel: true},
        xAxis: {
          type: 'category',
          data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          axisLine: {lineStyle: {color: '#1e3a5f'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        yAxis: {
          type: 'value',
          splitLine: {lineStyle: {color: '#1e3a5f', type: 'dashed'}},
          axisLabel: {color: '#8ba3c7', fontSize: 9}
        },
        series: [
          {
            name: '新增',
            type: 'bar',
            stack: 'total',
            data: [3, 4, 2, 5, 3, 2, 4],
            itemStyle: {color: '#ff0044'}
          },
          {
            name: '修复',
            type: 'bar',
            stack: 'total',
            data: [2, 3, 3, 4, 2, 3, 1],
            itemStyle: {color: '#00ff88'}
          }
        ]
      })
    },

    handleResize() {
      Object.values(this.charts).forEach(chart => chart && chart.resize())
    }
  }
}
</script>

<style scoped>
.monitor-dashboard {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
  color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.main-container {
  display: flex;
  gap: 10px;
  padding: 10px;
  height: 100%;
  box-sizing: border-box;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
}

.side-col {
  width: 22%;
  min-width: 280px;
}

.center-col {
  width: 56%;
  flex: 1;
}

/* 面板基础样式 - 无动态特效 */
.panel {
  background: rgba(10, 20, 40, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.15);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel.compact {
  flex: 1;
}

.panel.main-panel {
  height: 100%;
  border-color: rgba(0, 240, 255, 0.25);
}

/* 面板头部 */
.panel-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: rgba(0, 40, 80, 0.4);
  border-bottom: 1px solid rgba(0, 240, 255, 0.1);
}

.panel-header.main-header {
  background: rgba(0, 60, 120, 0.5);
  justify-content: space-between;
}

.panel-icon {
  color: #00f0ff;
  margin-right: 6px;
  font-size: 14px;
}

.panel-title {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
}

/* 任务切换标签 */
.task-tabs {
  display: flex;
  gap: 8px;
}

.tab {
  padding: 4px 12px;
  background: rgba(0, 40, 80, 0.6);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 3px;
  font-size: 12px;
  color: #8ba3c7;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  border-color: rgba(0, 240, 255, 0.5);
  color: #fff;
}

.tab.active {
  background: rgba(0, 240, 255, 0.2);
  border-color: #00f0ff;
  color: #00f0ff;
}

/* 面板内容 */
.panel-body {
  flex: 1;
  padding: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-body.main-body {
  padding: 15px;
  gap: 15px;
}

/* 图表容器 - 修复展示不全 */
.chart-container {
  width: 100%;
  flex: 1;
  min-height: 0;
}

.chart-container.small {
  height: 100px;
  flex: none;
  margin-top: 8px;
}

/* 左侧统计 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-item {
  background: rgba(0, 40, 80, 0.3);
  border: 1px solid rgba(0, 240, 255, 0.1);
  border-radius: 3px;
  padding: 8px;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  margin-bottom: 2px;
}

.stat-value.normal {
  color: #00f0ff;
}
.stat-value.good {
  color: #00ff88;
}
.stat-value.warning {
  color: #ffdd00;
}

.stat-label {
  font-size: 11px;
  color: #8ba3c7;
}

/* 网络指标环形图 */
.network-rings {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
}

.ring-box {
  position: relative;
  width: 70px;
  height: 70px;
}

.ring-chart {
  width: 100%;
  height: 100%;
}

.ring-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.ring-value {
  font-size: 13px;
  font-weight: bold;
  color: #00f0ff;
}

.ring-label {
  font-size: 9px;
  color: #8ba3c7;
  margin-top: 2px;
}

/* 平台统计 */
.platform-brief {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
  font-size: 12px;
}

.platform-brief b {
  color: #00f0ff;
  font-size: 14px;
  margin-left: 4px;
}

.platform-brief .online b {
  color: #00ff88;
}
.platform-brief .warning b {
  color: #ffdd00;
}

.platform-table {
  margin-top: 8px;
  font-size: 11px;
}

.platform-table table {
  width: 100%;
  border-collapse: collapse;
}

.platform-table th {
  background: rgba(0, 40, 80, 0.5);
  color: #8ba3c7;
  padding: 6px;
  text-align: left;
  font-weight: normal;
}

.platform-table td {
  padding: 5px 6px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.05);
  color: #ccc;
}

.platform-table .mono {
  font-family: 'Courier New', monospace;
  color: #00f0ff;
}

.platform-table .online {
  color: #00ff88;
}
.platform-table .warning {
  color: #ffdd00;
}
.platform-table .offline {
  color: #ff0044;
}

.platform-table .dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 4px;
  background: currentColor;
}

/* 中间杀伤链主区域 */
.killchain-main {
  display: flex;
  gap: 15px;
  height: 45%;
  min-height: 0;
}

.main-chart {
  flex: 1;
  height: 100%;
  min-width: 0;
}

.killchain-legend {
  width: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-name {
  color: #8ba3c7;
  flex: 1;
}

.legend-value {
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

/* 杀伤链详情卡片 */
.killchain-detail {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.chain-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  height: 100%;
}

.chain-card {
  background: rgba(0, 20, 40, 0.6);
  border: 1px solid;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: bold;
}

.card-phase {
  font-size: 10px;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 3px;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.big-number {
  font-size: 32px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  margin-bottom: 10px;
}

.card-metrics {
  display: flex;
  gap: 15px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 10px;
  color: #8ba3c7;
}

.metric-val {
  font-size: 12px;
  color: #fff;
  font-family: 'Courier New', monospace;
}

.card-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-fill {
  height: 100%;
  transition: width 0.5s ease;
}

/* 右侧告警 */
.alarm-list {
  margin-top: 8px;
  max-height: 100px;
  overflow-y: auto;
}

.alarm-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 4px;
  border-radius: 3px;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.2);
}

.alarm-item.high {
  border-left: 3px solid #ff0044;
}
.alarm-item.medium {
  border-left: 3px solid #ff8800;
}
.alarm-item.low {
  border-left: 3px solid #ffdd00;
}

.alarm-badge {
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
}

.alarm-item.high .alarm-badge {
  background: #ff0044;
}
.alarm-item.medium .alarm-badge {
  background: #ff8800;
}
.alarm-item.low .alarm-badge {
  background: #ffdd00;
  color: #000;
}

.alarm-msg {
  flex: 1;
  color: #ccc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.alarm-time {
  color: #8ba3c7;
  font-family: monospace;
  font-size: 10px;
}

/* 故障统计 */
.fault-numbers {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
}

.fnum {
  text-align: center;
  padding: 8px;
}

.fnum-val {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
  color: #ff0044;
}

.fnum.resolved .fnum-val {
  color: #00ff88;
}
.fnum.pending .fnum-val {
  color: #ffdd00;
}

.fnum-label {
  font-size: 11px;
  color: #8ba3c7;
  margin-top: 4px;
}

/* 滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 40, 80, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 2px;
}

/* Element UI 覆盖 */
:deep(.el-progress-bar__outer) {
  background-color: rgba(30, 58, 95, 0.5);
}
</style>
