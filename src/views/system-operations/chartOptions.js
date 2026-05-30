const FONT_FAMILY = "monospace, 'Microsoft YaHei'"

// 1. 作战任务保障统计（双柱状图）
export const getTaskOnditionOption = data => ({
  backgroundColor: 'transparent',
  tooltip: {trigger: 'axis', axisPointer: {type: 'shadow'}},
  legend: {textStyle: {color: '#94a3b8', fontFamily: FONT_FAMILY}, top: '0%'},
  grid: {left: '3%', right: '3%', bottom: '5%', top: '18%', containLabel: true},
  xAxis: {
    type: 'category',
    data: data.labels,
    axisLine: {lineStyle: {color: '#16243b'}},
    axisLabel: {color: '#94a3b8', fontFamily: FONT_FAMILY, fontSize: 10}
  },
  yAxis: {
    type: 'value',
    splitLine: {lineStyle: {color: '#111b2b'}},
    axisLabel: {color: '#94a3b8', fontFamily: FONT_FAMILY}
  },
  series: [
    {
      name: '计划保障',
      type: 'bar',
      data: data.plan,
      itemStyle: {color: '#16243b', borderColor: '#38bdf8', borderWidth: 1},
      barWidth: 12
    },
    {
      name: '实际执行',
      type: 'bar',
      data: data.actual,
      itemStyle: {
        color: 'rgba(6, 182, 212, 0.2)',
        borderColor: '#06b6d4',
        borderWidth: 1
      },
      barWidth: 12
    }
  ]
})

// 2. 杀伤链任务雷达图
export const getKillChainOption = data => ({
  backgroundColor: 'transparent',
  tooltip: {},
  radar: {
    indicator: data.indicator,
    shape: 'circle',
    splitNumber: 4,
    axisName: {color: '#94a3b8', fontFamily: FONT_FAMILY, fontSize: 11},
    splitLine: {lineStyle: {color: '#111b2b'}},
    splitArea: {
      areaStyle: {color: ['rgba(8,14,24,0.4)', 'rgba(12,20,36,0.2)']}
    },
    axisLine: {lineStyle: {color: '#16243b'}}
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: data.values,
          name: '效率指标',
          itemStyle: {color: '#38bdf8'},
          lineStyle: {width: 2, color: '#38bdf8'},
          areaStyle: {color: 'rgba(56, 189, 248, 0.15)'}
        }
      ]
    }
  ]
})

// 3. 数据链网络运行统计（平滑折线图）
export const getNetworkOption = data => ({
  backgroundColor: 'transparent',
  tooltip: {trigger: 'axis'},
  grid: {left: '3%', right: '4%', bottom: '5%', top: '12%', containLabel: true},
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: data.times,
    axisLine: {lineStyle: {color: '#16243b'}},
    axisLabel: {color: '#94a3b8', fontFamily: FONT_FAMILY}
  },
  yAxis: {
    type: 'value',
    splitLine: {lineStyle: {color: '#111b2b'}},
    axisLabel: {color: '#94a3b8', fontFamily: FONT_FAMILY}
  },
  series: [
    {
      name: '吞吐量 (Mbps)',
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: data.flow,
      itemStyle: {color: '#06b6d4'},
      lineStyle: {width: 2, color: '#06b6d4'},
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {offset: 0, color: 'rgba(6, 182, 212, 0.2)'},
            {offset: 1, color: 'rgba(6, 182, 212, 0)'}
          ]
        }
      }
    }
  ]
})

// 4. 告警类型分布饼图（彩色）
export const getAlertPieOption = data => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}次 ({d}%)',
    backgroundColor: '#070c14',
    borderColor: '#172438',
    textStyle: { color: '#cbd5e1', fontSize: 11 }
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: '#64748b', fontSize: 10 }
  },
  series: [
    {
      name: '告警类型',
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['32%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#03060c',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      labelLine: { show: false },
      data: data
    }
  ]
})

// 5. 故障统计彩色柱状图
export const getFaultBarOption = data => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: '#070c14',
    borderColor: '#172438',
    textStyle: { color: '#cbd5e1', fontSize: 11 }
  },
  grid: { top: '10%', bottom: '20%', left: '12%', right: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: data.labels,
    axisLine: { lineStyle: { color: '#172438' } },
    axisLabel: { color: '#64748b', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: '#111b2b' } },
    axisLabel: { color: '#64748b', fontSize: 10 }
  },
  series: [
    {
      name: '故障次数',
      type: 'bar',
      barWidth: '50%',
      data: data.values.map((v, i) => ({
        value: v,
        itemStyle: {
          color: data.colors ? data.colors[i] : ['#f43f5e', '#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#06b6d4'][i % 6],
          borderRadius: [4, 4, 0, 0]
        }
      })),
      label: {
        show: true,
        position: 'top',
        color: '#cbd5e1',
        fontSize: 12,
        fontWeight: 'bold'
      }
    }
  ]
})

// 6. 目标类型分布饼图（彩色）
export const getTargetPieOption = data => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c}个 ({d}%)',
    backgroundColor: '#070c14',
    borderColor: '#172438',
    textStyle: { color: '#cbd5e1', fontSize: 11 }
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    textStyle: { color: '#64748b', fontSize: 10 }
  },
  series: [
    {
      type: 'pie',
      radius: ['30%', '55%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 4,
        borderColor: '#03060c',
        borderWidth: 2
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 'bold',
          color: '#fff'
        }
      },
      labelLine: { show: false },
      data: data
    }
  ]
})
