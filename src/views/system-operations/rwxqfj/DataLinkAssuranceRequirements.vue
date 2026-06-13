<template>
  <div class="analysis-page">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="header-title">
        数据链保障需求推演系统
        <span class="ai-badge">AI推演引擎</span>
      </div>
    </div>

    <div class="content-wrap">
      <!-- 左侧：基础作战任务信息 -->
      <div class="left-panel">
        <div class="card-title-2">1. 基础作战任务信息</div>

        <el-tabs v-model="activeTab" class="left-tabs">
          <!-- Tab 1: 作战编成 -->
          <el-tab-pane label="作战编成" name="formation">
            <div class="tab-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 22%">平台</th>
                    <th style="width: 16%">类型</th>
                    <th>通信装备</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in pagedFormation" :key="i">
                    <td>{{ row.platform }}</td>
                    <td>{{ row.type }}</td>
                    <td>{{ row.equipment }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="tab-pagination">
              <el-pagination
                small
                layout="total, prev, pager, next"
                :total="formationTotal"
                :page-size="formationPageSize"
                :current-page.sync="formationPage"
                @current-change="handleFormationPageChange"
              />
            </div>
          </el-tab-pane>

          <!-- Tab 2: 作战行动路线 -->
          <el-tab-pane label="作战行动路线" name="route">
            <div class="tab-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>点位名称</th>
                    <th>经度</th>
                    <th>纬度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(pt, i) in pagedRoute" :key="i">
                    <td>{{ pt.id }}</td>
                    <td>{{ pt.name }}</td>
                    <td>{{ pt.lng }}</td>
                    <td>{{ pt.lat }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="tab-pagination">
              <el-pagination
                small
                layout="total, prev, pager, next"
                :total="routeTotal"
                :page-size="routePageSize"
                :current-page.sync="routePage"
                @current-change="handleRoutePageChange"
              />
            </div>
          </el-tab-pane>

          <!-- Tab 3: 作战区域 -->
          <el-tab-pane label="作战区域" name="area">
            <div class="tab-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>转向点</th>
                    <th>经度</th>
                    <th>纬度</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(area, i) in pagedAreas" :key="i">
                    <td>{{ area.id }}</td>
                    <td>{{ area.name }}</td>
                    <td>{{ area.lng }}</td>
                    <td>{{ area.lat }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="tab-pagination">
              <el-pagination
                small
                layout="total, prev, pager, next"
                :total="areaTotal"
                :page-size="areaPageSize"
                :current-page.sync="areaPage"
                @current-change="handleAreaPageChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 右侧：AI 智能分析 -->
      <div class="right-panel">
        <el-tabs v-model="rightTab" class="right-tabs">
          <!-- Tab 1: AI 智能分析主流程 -->
          <el-tab-pane label="AI 智能分析主流程" name="flow">
            <!-- AI流程 -->
            <div class="ai-flow-box">
              <div class="ai-flow-item">输入：作战编成/路线/区域</div>
              <div class="ai-flow-item">AI算法：聚类+GNN+关联挖掘</div>
              <div class="ai-flow-item">输出：层级任务网络</div>
              <div class="ai-flow-item">输出：数据链保障需求</div>
            </div>

            <!-- 算法说明 -->
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

            <!-- 第一组图表 -->
            <div class="chart-row">
              <div
                class="chart-col"
                :class="{'chart-col--expanded': gnnExpanded}"
              >
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

            <!-- 时延带宽图表 -->
            <div class="chart-box" v-show="!gnnExpanded">
              <div class="chart-title">
                关联规则挖掘 — 各任务网络时延/带宽指标对比
              </div>
              <div ref="latencyChart" class="chart-svg"></div>
            </div>
          </el-tab-pane>

          <!-- Tab 2: AI 基于任务网络推演 -->
          <el-tab-pane label="AI 基于任务网络推演" name="deduce">
            <div class="deduce-scroll">
              <!-- 数据链保障需求表格 -->
              <div class="datalink-result-box">
                <div class="result-title">
                  📡 数据链保障需求（AI 基于任务网络推演）
                </div>
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

              <!-- 补充说明 -->
              <div class="result-grid">
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
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  getFormationPage,
  getRoutePointPage,
  getAreaPointPage,
  getTopology,
  getTaskNodeDistribution
} from '@/api/datalinkAssurance'

export default {
  name: 'DataLinkAssuranceRequirements',
  data() {
    return {
      // Tab 切换
      activeTab: 'formation',
      rightTab: 'flow',
      formationPage: 1,
      routePage: 1,
      areaPage: 1,
      formationPageSize: 10,
      routePageSize: 10,
      areaPageSize: 10,

      // 作战任务ID（默认22）
      zzrwid: 22,
      zzrwwlid: 7,

      // 作战编成数据
      formationData: [],
      formationTotal: 0,

      // 作战行动路线
      routePoints: [],
      routeTotal: 0,

      // 作战区域
      combatAreas: [],
      areaTotal: 0,

      // 任务网络列表（数据链保障需求）
      datalinkRequirements: [],

      // 加载状态
      loading: {
        formation: false,
        route: false,
        area: false,
        network: false
      },

      // 图表实例
      gnnChart: null,
      kmeansChart: null,
      latencyChart: null,

      // GNN 全屏展开
      gnnExpanded: false
    }
  },
  computed: {
    pagedFormation() {
      return this.formationData
    },
    pagedRoute() {
      return this.routePoints
    },
    pagedAreas() {
      return this.combatAreas
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts()
      setTimeout(() => this.handleResize(), 200)
      this.fetchFormationData()
      this.fetchRouteData()
      this.fetchAreaData()
      this.fetchNetworkData()
      this.fetchTopology()
      this.fetchDistribution()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    if (this.gnnChart) this.gnnChart.dispose()
    if (this.kmeansChart) this.kmeansChart.dispose()
    if (this.latencyChart) this.latencyChart.dispose()
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    /** 获取作战编成 */
    async fetchFormationData() {
      this.loading.formation = true
      try {
        const res = await getFormationPage({
          pageNum: this.formationPage,
          pageSize: this.formationPageSize,
          params: {ZZRWID: this.zzrwid}
        })
        const list = res.data?.list || res.data || []
        this.formationData = list.map(d => ({
          platform: d.PTMC || '',
          type: this.getPlatformType(d.PTLX),
          equipment: d.SBMCS || ''
        }))
        this.formationTotal = res.data?.total || list.length
      } catch (e) {
        console.error('获取作战编成失败', e)
        this.formationData = []
      } finally {
        this.loading.formation = false
      }
    },
    /** 获取作战行动路线 */
    async fetchRouteData() {
      this.loading.route = true
      try {
        const res = await getRoutePointPage({
          pageNum: this.routePage,
          pageSize: this.routePageSize,
          params: {ZZRWID: this.zzrwid}
        })
        const list = res.data?.list || res.data || []
        this.routePoints = list.map(d => ({
          id: d.pointIndex,
          name: d.pointName || '',
          lng: d.JD?.toFixed(1),
          lat: d.WD?.toFixed(1)
        }))
        this.routeTotal = res.data?.total || list.length
      } catch (e) {
        console.error('获取作战线路失败', e)
        this.routePoints = []
      } finally {
        this.loading.route = false
      }
    },
    /** 获取作战区域 */
    async fetchAreaData() {
      this.loading.area = true
      try {
        const res = await getAreaPointPage({
          pageNum: this.areaPage,
          pageSize: this.areaPageSize,
          params: {ZZRWID: this.zzrwid}
        })
        const list = res.data?.list || res.data || []
        this.combatAreas = list.map(d => ({
          id: d.WZDXH,
          name: d.WZDMC || '',
          lng: d.JD?.toFixed(1),
          lat: d.WD?.toFixed(1)
        }))
        this.areaTotal = res.data?.total || list.length
      } catch (e) {
        console.error('获取作战区域失败', e)
        this.combatAreas = []
      } finally {
        this.loading.area = false
      }
    },
    /** 获取任务网络列表（数据链保障需求） */
    async fetchNetworkData() {
      this.loading.network = true
      try {
        // 从 /rest/zzrwxx/{zzrwid} 接口的 zzrwwls 中提取任务网络数据
        const res = await getTaskNodeDistribution(this.zzrwid)
        const raw = res.data || res
        const wls = Array.isArray(raw.zzrwwls)
          ? raw.zzrwwls
          : raw.zzrwwls?.zzrwwls || []
        // 网络类型映射
        const typeMap = {
          1: '指挥网络',
          2: '巡逻作战网络',
          3: '突击打击网络',
          4: '防空网络'
        }
        this.datalinkRequirements = wls.map(d => {
          const wllx = d.wllx ?? d.WLLX ?? ''
          return {
            name: d.WLMC || d.wlmc || '',
            type: typeMap[wllx] || wllx || '',
            delay: d.latencyRequirement ?? '',
            bandwidth: d.bandwidthRequirement ?? '',
            services: d.serviceTypes || ''
          }
        })
        this.updateLatencyChart()
      } catch (e) {
        console.error('获取任务网络列表失败', e)
        this.datalinkRequirements = []
      } finally {
        this.loading.network = false
      }
    },
    /** 平台类型映射 */
    getPlatformType(lx) {
      const map = {
        1: '指控平台',
        2: '舰艇平台',
        3: '航空平台',
        4: '特种飞机',
        5: '弹载平台',
        6: '星载平台'
      }
      return map[lx] || lx || ''
    },
    /** 分页切换 */
    handleFormationPageChange(page) {
      this.formationPage = page
      this.fetchFormationData()
    },
    handleRoutePageChange(page) {
      this.routePage = page
      this.fetchRouteData()
    },
    handleAreaPageChange(page) {
      this.areaPage = page
      this.fetchAreaData()
    },

    /* ================ 图表 ================ */

    initCharts() {
      this.initGnnChart()
      this.initKmeansChart()
      this.initLatencyChart()
    },

    /** GNN 拓扑图 */
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
            'max-width: 260px; white-space: normal; word-break: break-all;'
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
        // 实际返回结构（XML/JSON）：
        // {
        //   modelName: "GNN作战单元信息交互拓扑关系模型",
        //   taskNodes: [{ taskId, taskName, ZZRWPTIDS: [...], PTMCS: [...] }, ...],
        //   dependencyRelations: [{ sourceTaskId, targetTaskId }, ...],
        //   parallelRelations: [{ taskIds: [...] }, ...]
        // }
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

        // 按平台数量决定节点大小
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

        // 依赖关系连线（实线箭头）
        const linkMap = new Map()
        depRels.forEach(d => {
          const key = `${d.sourceTaskId}-${d.targetTaskId}`
          if (!linkMap.has(key)) {
            linkMap.set(key, {
              source: d.sourceTaskId,
              target: d.targetTaskId,
              lineStyle: {color: '#409EFF', width: 1.5, curveness: 0.2}
            })
          }
        })
        const links = Array.from(linkMap.values())

        // 并行关系用橙色虚线
        paraRels.forEach(p => {
          const ids = Array.isArray(p.taskIds) ? p.taskIds : []
          if (ids.length > 1) {
            for (let i = 1; i < ids.length; i++) {
              links.push({
                source: ids[i - 1],
                target: ids[i],
                lineStyle: {type: 'dashed', color: '#f59e0b', width: 1.5}
              })
            }
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
                  extraCssText: 'max-width: 400px; white-space: normal;',
                  formatter: p => {
                    const ext = p.data?.extra || {}
                    const ptList = (ext.platformNames || [])
                      .map(n => `<div>· ${n}</div>`)
                      .join('')
                    const cols = Math.ceil((ext.platformNames || []).length / 3)
                    const col1 = (ext.platformNames || [])
                      .slice(0, cols)
                      .map(n => `· ${n}`)
                      .join('<br/>')
                    const col2 = (ext.platformNames || [])
                      .slice(cols, cols * 2)
                      .map(n => `· ${n}`)
                      .join('<br/>')
                    const col3 = (ext.platformNames || [])
                      .slice(cols * 2)
                      .map(n => `· ${n}`)
                      .join('<br/>')
                    return `
                      <b>${p.name}</b><br/>
                      <span style="font-size:10px">任务编号：${ext.taskId || '-'}</span><br/>
                      <span style="font-size:10px">平台数量：${ext.platformCount || 0}</span>
                      ${
                        ptList
                          ? `<div style="font-size:9px;margin-top:4px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:0 10px;">
                        <div>${col1}</div>
                        <div>${col2}</div>
                        <div>${col3}</div>
                      </div>`
                          : ''
                      }
                    `
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

    /** K-Means 聚类柱状图 */
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
        // 从 /rest/zzrwxx/{ZZRWID} 返回的 taskNodeNamePTCountMap 中提取数据
        const raw = res.data || res
        const countMap =
          raw.taskNodeNamePTCountMap || raw.TaskNodeNamePTCountMap || {}
        const entries = Object.entries(countMap)
        const data = entries.map(([name, value]) => ({
          name,
          value: Number(value) || 0
        }))
        // 按数量降序排列
        data.sort((a, b) => b.value - a.value)
        const colorPalette = [
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
                  color: colorPalette[i % colorPalette.length],
                  borderRadius: [3, 3, 0, 0]
                }
              })),
              itemStyle: {
                borderRadius: [3, 3, 0, 0]
              }
            }
          ]
        })
      } catch (e) {
        console.error('获取分布数据失败', e)
      }
    },

    /** 时延/带宽指标对比 */
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
            const title = params[0]?.name || ''
            const lines = params.map(p => {
              const unit = p.seriesName === '时延指标' ? 'ms' : 'Mbps'
              return `${p.marker} ${p.seriesName}：${p.value}${unit}`
            })
            return `<b>${title}</b><br/>${lines.join('<br/>')}`
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
            axisLabel: {
              color: '#94a3b8',
              fontSize: 9,
              formatter: '{value} ms'
            },
            splitLine: {lineStyle: {color: 'rgba(255,255,255,0.06)'}}
          },
          {
            type: 'value',
            name: '带宽 (Mbps)',
            nameTextStyle: {color: '#67C23A', fontSize: 9},
            axisLabel: {
              color: '#94a3b8',
              fontSize: 9,
              formatter: '{value} M'
            },
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
      // 数据来自 fetchNetworkData
    },

    /** 更新时延带宽图 */
    updateLatencyChart() {
      if (!this.latencyChart || !this.datalinkRequirements.length) return
      this.latencyChart.setOption({
        xAxis: {data: this.datalinkRequirements.map(d => d.name)},
        series: [
          {data: this.datalinkRequirements.map(d => Number(d.delay) || 0)},
          {data: this.datalinkRequirements.map(d => Number(d.bandwidth) || 0)}
        ]
      })
    },

    handleResize() {
      if (this.gnnChart) this.gnnChart.resize()
      if (this.kmeansChart) this.kmeansChart.resize()
      if (this.latencyChart) this.latencyChart.resize()
    },

    /** GNN 展开/收起切换 */
    toggleGnnExpand() {
      this.gnnExpanded = !this.gnnExpanded
      this.$nextTick(() => {
        if (this.gnnChart) this.gnnChart.resize()
        if (this.kmeansChart) this.kmeansChart.resize()
        if (this.latencyChart) this.latencyChart.resize()
      })
    }
  }
}
</script>

<style scoped>
.analysis-page {
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);
  color: var(--color-text-main);
  padding: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* 左侧面板科技边框 */
.left-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  width: 14px;
  height: 14px;
  border-top: 2px solid rgba(56, 189, 248, 0.25);
  border-left: 2px solid rgba(56, 189, 248, 0.25);
  pointer-events: none;
  z-index: 2;
}
.left-panel::after {
  content: '';
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 14px;
  height: 14px;
  border-bottom: 2px solid rgba(56, 189, 248, 0.25);
  border-right: 2px solid rgba(56, 189, 248, 0.25);
  pointer-events: none;
  z-index: 2;
}
/* 右侧面板科技边框 */
.right-panel {
  position: relative;
}
.right-panel::before {
  content: '';
  position: absolute;
  top: -1px;
  right: -1px;
  width: 14px;
  height: 14px;
  border-top: 2px solid rgba(56, 189, 248, 0.25);
  border-right: 2px solid rgba(56, 189, 248, 0.25);
  pointer-events: none;
  z-index: 2;
}
.right-panel::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: -1px;
  width: 14px;
  height: 14px;
  border-bottom: 2px solid rgba(56, 189, 248, 0.25);
  border-left: 2px solid rgba(56, 189, 248, 0.25);
  pointer-events: none;
  z-index: 2;
}
.header {
  width: 100%;
  height: 46px;
  background: linear-gradient(
    135deg,
    rgba(12, 20, 36, 0.9),
    rgba(8, 14, 24, 0.95)
  );
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 20px;
  margin-bottom: 12px;
  border: 1px solid rgba(56, 189, 248, 0.15);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.5),
    transparent
  );
  animation: headerScan 3s ease-in-out infinite;
}
@keyframes headerScan {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
.header-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: 1px;
  text-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
}
.ai-badge {
  display: inline-block;
  background: linear-gradient(90deg, #10b981, #38bdf8);
  color: #fff;
  font-size: 10px;
  padding: 2px 14px;
  border-radius: 30px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
  animation: badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse {
  0%,
  100% {
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.2);
  }
  50% {
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
  }
}
.content-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  overflow: hidden;
}

/* 左侧面板 */
.left-panel {
  width: 30%;
  background: linear-gradient(
    160deg,
    rgba(12, 20, 36, 0.85),
    rgba(8, 14, 24, 0.9)
  );
  border-radius: 6px;
  border: 1px solid rgba(30, 41, 59, 0.6);
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}
.left-panel::-webkit-scrollbar {
  width: 3px;
}
.left-panel::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.left-panel .left-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.left-panel .left-tabs >>> .el-tabs__header {
  margin-bottom: 6px;
  border-bottom: none;
}
.left-panel .left-tabs >>> .el-tabs__item {
  color: #94a3b8;
  font-size: 11px;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
}
.left-panel .left-tabs >>> .el-tabs__item.is-active {
  color: var(--color-primary);
}
.left-panel .left-tabs >>> .el-tabs__active-bar {
  background-color: var(--color-primary);
  height: 2px;
}
.left-panel .left-tabs >>> .el-tabs__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.left-panel .left-tabs >>> .el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.tab-table-wrap {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
.tab-table-wrap::-webkit-scrollbar {
  width: 3px;
}
.tab-table-wrap::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.tab-pagination {
  flex-shrink: 0;
  padding-top: 6px;
  display: flex;
  justify-content: center;
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  background: linear-gradient(
    160deg,
    rgba(12, 20, 36, 0.85),
    rgba(8, 14, 24, 0.9)
  );
  border-radius: 6px;
  border: 1px solid rgba(30, 41, 59, 0.6);
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
}
.right-panel::-webkit-scrollbar {
  width: 3px;
}
.right-panel::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.right-panel .right-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.right-panel .right-tabs >>> .el-tabs__header {
  margin-bottom: 6px;
  border-bottom: none;
}
.right-panel .right-tabs >>> .el-tabs__item {
  color: #94a3b8;
  font-size: 11px;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
}
.right-panel .right-tabs >>> .el-tabs__item.is-active {
  color: var(--color-primary);
}
.right-panel .right-tabs >>> .el-tabs__active-bar {
  background-color: var(--color-primary);
  height: 2px;
}
.right-panel .right-tabs >>> .el-tabs__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.right-panel .right-tabs >>> .el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 8px;
}
.right-panel .right-tabs >>> .el-tab-pane[name='flow'] {
  overflow-y: auto;
  gap: 10px;
}
.right-panel .right-tabs >>> .el-tab-pane[name='flow'] > div {
  flex-shrink: 0;
}
.right-panel .right-tabs >>> .el-tab-pane[name='flow'] > .chart-row,
.right-panel .right-tabs >>> .el-tab-pane[name='flow'] > .chart-box {
  flex-shrink: 1;
  flex: 1;
}
.right-panel .right-tabs >>> .el-tab-pane::-webkit-scrollbar {
  width: 3px;
}
.right-panel .right-tabs >>> .el-tab-pane::-webkit-scrollbar-thumb {
  background: rgba(56, 189, 248, 0.2);
  border-radius: 3px;
}
.deduce-scroll {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  min-height: 0;
}

.card-title-2 {
  font-size: 13px;
  font-weight: bold;
  color: var(--color-cyan);
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.12);
  flex-shrink: 0;
  letter-spacing: 0.5px;
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
.td-platform {
  text-align: left;
  white-space: nowrap;
}
.td-equip {
  text-align: left;
  font-size: 9px;
  line-height: 1.4;
  word-break: break-all;
  max-width: 200px;
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
/* AI流程条 */
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

/* 算法卡片 */
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

/* 图表容器 */
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
.legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 8px;
  color: #94a3b8;
}
.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

/* 数据链需求结果 */
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

/* 补充说明 */
.result-grid {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.result-item {
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
