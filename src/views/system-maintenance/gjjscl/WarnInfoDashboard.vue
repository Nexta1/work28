<template>
  <div class="warn-dashboard-container">
    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="dark-tabs fill-tabs">
      <!-- 告警信息 Tab -->
      <el-tab-pane label="告警信息" name="warnInfo">
        <div class="tab-content-wrapper">
          <div class="filter-control-bar">
            <el-form :inline="true" :model="queryForm" size="mini">
              <el-form-item label="故障类型">
                <el-cascader
                  v-model="selectedFaultKeys"
                  :options="faultTreeOptions"
                  :props="cascadeProps"
                  placeholder="请选择故障层级"
                  clearable
                  filterable
                  @change="handleFaultChange"
                />
              </el-form-item>

              <el-form-item label="告警来源">
                <el-select
                  v-model="queryForm.sourceType"
                  placeholder="来源过滤"
                  clearable
                >
                  <el-option label="外部系统" :value="0" />
                  <el-option label="性能告警" :value="1" />
                  <el-option label="业务告警" :value="2" />
                </el-select>
              </el-form-item>

              <el-form-item label="严重级别">
                <el-select
                  v-model="queryForm.warnLevel"
                  placeholder="等级过滤"
                  clearable
                >
                  <el-option label="无" :value="0" />
                  <el-option label="一般" :value="1" />
                  <el-option label="中度" :value="2" />
                  <el-option label="严重" :value="3" />
                </el-select>
              </el-form-item>

              <el-form-item label="处理状态">
                <el-select
                  v-model="queryForm.warnState"
                  placeholder="状态过滤"
                  clearable
                >
                  <el-option label="被合并" value="被合并" />
                  <el-option label="被屏蔽" value="被屏蔽" />
                  <el-option label="待手工清除" value="待手工清除" />
                  <el-option label="自动清除" value="自动清除" />
                  <el-option label="手工清除" value="手工清除" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="handleSearch"
                  >检索</el-button
                >
                <el-button icon="el-icon-refresh" @click="resetQuery"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>

          <div class="table-content-wrapper" v-loading="loading">
            <el-table :data="tableData" style="width: 100%" height="100%">
              <!-- 核心标识区 -->
              <el-table-column
                prop="warnId"
                label="告警ID"
                width="100"
                fixed
                align="center"
                show-overflow-tooltip
              />

              <el-table-column label="等级" width="90" align="center">
                <template slot-scope="scope">
                  <span
                    :class="[
                      'custom-level-badge',
                      'level-type-' + scope.row.warnLevel
                    ]"
                  >
                    {{ getLevelLabel(scope.row.warnLevel) }}
                  </span>
                </template>
              </el-table-column>

              <el-table-column label="状态" width="110" align="center">
                <template slot-scope="scope">
                  <span
                    :class="[
                      'custom-state-tag',
                      'state-tag-' + scope.row.warnState
                    ]"
                  >
                    {{ getStateLabel(scope.row.warnState) }}
                  </span>
                </template>
              </el-table-column>

              <!-- 时间信息区 -->
              <el-table-column label="报警时标" width="165" align="center">
                <template slot-scope="scope">
                  {{ formatTimestamp(scope.row.warnTimestamp) }}
                </template>
              </el-table-column>

              <!-- 事件内容区 -->
              <el-table-column
                prop="faultName"
                label="故障事件"
                width="140"
                align="center"
                show-overflow-tooltip
              />

              <el-table-column
                prop="warnContent"
                label="实时告警情报内容"
                min-width="280"
                align="left"
                show-overflow-tooltip
              />

              <!-- 来源与设备区 -->
              <el-table-column label="事件来源" width="110" align="center">
                <template slot-scope="scope">
                  {{ getSourceLabel(scope.row.sourceType) }}
                </template>
              </el-table-column>

              <el-table-column
                prop="deviceName"
                label="受累设备"
                width="130"
                align="center"
                show-overflow-tooltip
              />

              <el-table-column
                prop="WLMC"
                label="波道/网络名称"
                width="140"
                align="center"
                show-overflow-tooltip
              />

              <!-- 平台关联区 -->
              <el-table-column
                prop="srcPlatformName"
                label="源演兵平台"
                width="130"
                align="center"
                show-overflow-tooltip
              />

              <el-table-column
                prop="dstPlatformName"
                label="目标演兵平台"
                width="130"
                align="center"
                show-overflow-tooltip
              />

              <!-- 归并关联区 -->
              <el-table-column
                prop="correlateWarnNames"
                label="关联告警事件簇"
                width="160"
                align="center"
                show-overflow-tooltip
              />

              <el-table-column
                prop="mergeWarnName"
                label="归并至主告警"
                width="140"
                align="center"
                show-overflow-tooltip
              />

              <!-- 操作区 -->
              <el-table-column
                label="操作"
                width="280"
                fixed="right"
                align="center"
              >
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    icon="el-icon-monitor"
                    class="custom-ai-btn"
                    @click="handleAIAnalysis(scope.row)"
                    >AI分析</el-button
                  >
                  <el-button
                    size="mini"
                    type="warning"
                    icon="el-icon-aim"
                    class="custom-diagnosis-btn"
                    @click="handleFaultDiagnosis(scope.row)"
                    >故障诊断</el-button
                  >
                  <el-button
                    v-if="scope.row.warnState === '待手工清除'"
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    class="custom-clear-btn"
                    @click="handleClearWarn(scope.row)"
                    >清除</el-button
                  >
                  <span v-else class="action-disabled-text">-</span>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="pagination-container">
            <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="page.pageNum"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="page.pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="page.total"
            />
          </div>

          <!-- 故障诊断对话框 -->
          <el-dialog
            title="故障诊断策略"
            :visible.sync="diagnosisDialogVisible"
            width="1100px"
            :close-on-click-modal="false"
            custom-class="diagnosis-dialog"
            append-to-body
            @opened="onDiagnosisDialogOpened"
            @closed="onDiagnosisDialogClosed"
          >
            <div class="diagnosis-split-layout">
              <!-- 左侧：方案列表 -->
              <div class="diagnosis-left" v-loading="strategyLoading">
                <div class="diagnosis-left-header">
                  <Icon
                    icon="lucide:file-text"
                    :size="13"
                    color="#f59e0b"
                    style="vertical-align: middle; margin-right: 4px"
                  />可选诊断方案
                  <span class="strategy-count"
                    >({{ strategyList.length }})</span
                  >
                </div>
                <div class="diagnosis-strategy-list">
                  <div
                    v-for="item in strategyList"
                    :key="item.faultStrategyId"
                    class="strategy-card"
                    :class="{
                      active: selectedStrategyId === item.faultStrategyId
                    }"
                    @click="selectStrategy(item)"
                  >
                    <div class="strategy-radio-indicator">
                      <span
                        class="radio-dot"
                        :class="{
                          checked: selectedStrategyId === item.faultStrategyId
                        }"
                      ></span>
                    </div>
                    <div class="strategy-info">
                      <div class="strategy-name">
                        <span class="text-cyan"
                          >#{{ item.faultStrategyId }}</span
                        >
                        {{ item.strategyName }}
                      </div>
                      <div class="strategy-detail">
                        <span
                          v-if="item.faultDiagnosis"
                          class="detail-tag diagnosis-tag"
                        >
                          <i class="el-icon-document"></i>
                          {{ item.faultDiagnosis }}
                        </span>
                        <span
                          v-if="item.dealMethod"
                          class="detail-tag deal-tag"
                        >
                          <i class="el-icon-s-tools"></i>
                          {{ item.dealMethod }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  v-if="strategyList.length === 0 && !strategyLoading"
                  class="custom-empty-wrap"
                >
                  <Icon
                    icon="lucide:file-x"
                    :size="28"
                    color="#334155"
                    style="margin-bottom: 8px"
                  />
                  <p class="empty-text">该故障暂无关联的诊断策略</p>
                </div>
              </div>

              <!-- 右侧：拓扑图 + 详情 -->
              <div class="diagnosis-right">
                <div class="topology-toolbar" v-if="selectedStrategyId">
                  <el-button
                    size="mini"
                    type="primary"
                    plain
                    @click="layoutDiagnosisGraph"
                    ><i class="el-icon-s-operation"></i> 一键布局</el-button
                  >
                </div>
                <div
                  class="diagnosis-topology-container"
                  v-loading="diagnosisTopologyLoading"
                >
                  <div
                    id="diagnosis-x6-canvas"
                    v-show="
                      selectedStrategyId && diagnosisTopologyNodes.length > 0
                    "
                    class="diagnosis-x6-instance"
                  ></div>
                  <div v-if="!selectedStrategyId" class="topology-empty-tip">
                    <i
                      class="el-icon-search"
                      style="font-size: 22px; color: #516580"
                    ></i>
                    <p>请先在左侧选择诊断方案</p>
                    <p class="sub-tip">选中后将展示关联流程拓扑图</p>
                  </div>
                  <div
                    v-else-if="
                      !diagnosisTopologyLoading &&
                      diagnosisTopologyNodes.length === 0
                    "
                    class="topology-empty-tip"
                  >
                    <i
                      class="el-icon-document"
                      style="font-size: 22px; color: #516580"
                    ></i>
                    <p>该流程暂无关联的节点</p>
                    <p class="sub-tip">
                      {{ selectedStrategy.businessName || '未关联流程' }}
                    </p>
                  </div>
                </div>
                <div v-if="selectedStrategy" class="diagnosis-detail-panel">
                  <div class="detail-panel-header">
                    <Icon
                      icon="lucide:info"
                      :size="12"
                      color="#38bdf8"
                      style="vertical-align: middle; margin-right: 4px"
                    />策略详情
                  </div>
                  <div class="detail-panel-body">
                    <div class="detail-row">
                      <span class="detail-label">策略名称</span>
                      <span class="detail-value strategy-val">{{
                        selectedStrategy.strategyName
                      }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">诊断方法</span>
                      <span class="detail-value">{{
                        selectedStrategy.faultDiagnosis || '--'
                      }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">处理方法</span>
                      <span class="detail-value">{{
                        selectedStrategy.dealMethod || '--'
                      }}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">关联流程</span>
                      <span class="detail-value flow-val">{{
                        selectedStrategy.businessName || '未关联'
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span slot="footer" class="diagnosis-footer">
              <el-button size="mini" @click="diagnosisDialogVisible = false"
                >取消</el-button
              >
              <el-button
                size="mini"
                type="warning"
                :disabled="!selectedStrategyId"
                @click="submitDiagnosis"
                >下发策略</el-button
              >
            </span>
          </el-dialog>
        </div>
      </el-tab-pane>

      <!-- 告警信息处理 Tab 组 -->
      <el-tab-pane label="告警信息处理" name="warnProcess">
        <el-tabs
          v-model="processActiveTab"
          class="sidebar-tabs"
          tab-position="left"
        >
          <el-tab-pane label="告警清除规则" name="warnClear">
            <div class="tab-content-wrapper">
              <warn-clear
                :fault-type-options="faultTreeOptions"
                :device-options="deviceOptions"
              />
            </div>
          </el-tab-pane>
          <el-tab-pane label="告警屏蔽规则" name="warnBlock">
            <div class="tab-content-wrapper">
              <warn-block :fault-type-options="faultTreeOptions" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="告警归并规则" name="warnMerge">
            <div class="tab-content-wrapper">
              <warn-merge :fault-type-options="faultTreeOptions" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 业务质量标准 Tab 组 -->
      <el-tab-pane label="业务质量标准化" name="operationQuality">
        <el-tabs
          v-model="qualityActiveTab"
          class="sidebar-tabs"
          tab-position="left"
        >
          <el-tab-pane label="业务质量指标" name="operationMetric">
            <div class="tab-content-wrapper">
              <operation-metric />
            </div>
          </el-tab-pane>
          <el-tab-pane label="业务质量标准" name="operationStandard">
            <div class="tab-content-wrapper">
              <operation-standard
                :fault-type-options="faultTreeOptions"
                :metric-options="metricOptions"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>

      <!-- 性能监控 Tab 组 -->
      <el-tab-pane label="性能质量标准化" name="performanceMonitor">
        <el-tabs
          v-model="performanceActiveTab"
          class="sidebar-tabs"
          tab-position="left"
        >
          <el-tab-pane label="性能指标" name="performanceMetric">
            <div class="tab-content-wrapper">
              <performance-metric />
            </div>
          </el-tab-pane>
          <el-tab-pane label="性能标准" name="performanceStandard">
            <div class="tab-content-wrapper">
              <performance-standard
                :fault-type-options="faultTreeOptions"
                :metric-options="performanceMetricOptions"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  mainPage,
  mainDelete,
  apiGetAll,
  apiPage,
  apiGetDetail
} from '@/api/common'
import request from '@/utils/request'
import {Graph} from '@antv/x6'
import {DagreLayout} from '@antv/layout'
import WarnClear from './WarnClear.vue'
import WarnBlock from './WarnBlock.vue'
import WarnMerge from './WarnMerge.vue'
import OperationMetric from './OperationMetric.vue'
import OperationStandard from './OperationStandard.vue'
import PerformanceMetric from './PerformanceMetric.vue'
import PerformanceStandard from './PerformanceStandard.vue'

export default {
  name: 'WarnInfoDashboard',
  components: {
    WarnClear,
    WarnBlock,
    WarnMerge,
    OperationMetric,
    OperationStandard,
    PerformanceMetric,
    PerformanceStandard
  },
  data() {
    return {
      activeTab: 'warnInfo',
      processActiveTab: 'warnClear',
      qualityActiveTab: 'operationMetric',
      performanceActiveTab: 'performanceMetric',
      loading: false,
      queryForm: {
        faultTypeId: null,
        sourceType: null,
        warnLevel: null,
        warnState: ''
      },
      selectedFaultKeys: [], // 级联选择器数组
      faultTreeOptions: [], // 故障类型树
      deviceOptions: [], // 设备选项列表
      metricOptions: [],
      performanceMetricOptions: [],

      // 故障诊断对话框
      diagnosisDialogVisible: false,
      diagnosisRow: null,
      strategyList: [],
      strategyLoading: false,
      selectedStrategyId: null,
      selectedStrategy: null,
      diagnosisGraph: null,
      diagnosisTopologyLoading: false,
      diagnosisTopologyNodes: [],
      diagnosisTopologyLinks: [],
      cascadeProps: {
        value: 'faultTypeId',
        label: 'faultName',
        children: 'children',
        checkStrictly: true
      },
      tableData: [],
      page: {
        pageNum: 1,
        pageSize: 20,
        total: 0
      }
    }
  },
  mounted() {
    this.loadFaultTree()
    this.loadDevices()
    this.loadMetrics()
    this.loadPerformanceMetrics()
    this.loadWarnInfos()
  },
  methods: {
    buildTree(list, parentId = 0) {
      const map = {}
      const tree = []

      list.forEach(item => {
        item.children = []
        map[item.faultTypeId] = item
      })

      list.forEach(item => {
        const parent = map[item.parentTypeId]
        if (item.parentTypeId && parent) {
          item.parentFaultName = parent.faultName
          parent.children.push(item)
        } else {
          item.parentFaultName = '顶级根源'
          tree.push(item)
        }
      })
      return tree
    },

    // 1. 获取全量故障树：按要求将 apiFindAllTrees 更换为标准的 apiGetAll
    async loadFaultTree() {
      try {
        const res = await apiGetAll('faultType', {}, 'faultTypes')
        this.faultTreeOptions = this.buildTree(res.data) || []
      } catch (e) {
        console.error('故障树数据拉取失败:', e)
      }
    },

    // 2. 获取设备列表
    async loadDevices() {
      try {
        const res = await apiGetAll('sbxhInfo', {}, 'sbxhInfos')
        this.deviceOptions = res.data || []
      } catch (e) {
        console.error('设备数据拉取失败:', e)
      }
    },

    // 3. 获取业务质量指标列表
    async loadMetrics() {
      try {
        const res = await apiGetAll('operationMetric', {}, 'operationMetrics')
        this.metricOptions = res || []
      } catch (e) {
        console.error('业务质量指标数据拉取失败:', e)
      }
    },

    // 4. 获取性能指标列表
    async loadPerformanceMetrics() {
      try {
        const res = await apiGetAll(
          'performanceMetric',
          {},
          'performanceMetrics'
        )
        this.performanceMetricOptions = res || []
      } catch (e) {
        console.error('性能指标数据拉取失败:', e)
      }
    },

    handleFaultChange(value) {
      if (value && value.length > 0) {
        this.queryForm.faultTypeId = value[value.length - 1]
      } else {
        this.queryForm.faultTypeId = null
      }
    },

    // 2. 条件检索分页数据
    async loadWarnInfos() {
      this.loading = true
      try {
        const payload = {
          pageNum: this.page.pageNum,
          pageSize: this.page.pageSize,
          ...this.queryForm
        }
        const res = await mainPage('warnInfo', payload)
        this.tableData = res.data || res.list || []
        this.page.total = res.recordsTotal || res.total || 0
      } catch (e) {
        console.error('告警分页加载失败:', e)
      } finally {
        this.loading = false
      }
    },

    // 3. 手动清除：按要求将 apiDelete 更换为 mainDelete 驱动
    handleClearWarn(row) {
      this.$confirm(
        `确定要手动清除告警标识为 [ ${row.warnId} ] 的记录吗？`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(async () => {
          try {
            await mainDelete('warnInfo/manualClear', row.warnId)
            this.$message.success('清除成功')
            this.loadWarnInfos()
          } catch (e) {
            console.error('清除告警失败:', e)
          }
        })
        .catch(() => {})
    },

    // ===================================================================
    // 转换工具及字典方法
    // ===================================================================
    handleSearch() {
      this.page.pageNum = 1
      this.loadWarnInfos()
    },
    resetQuery() {
      this.queryForm = {
        faultTypeId: null,
        sourceType: null,
        warnLevel: null,
        warnState: ''
      }
      this.selectedFaultKeys = []
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.page.pageSize = val
      this.loadWarnInfos()
    },
    handleCurrentChange(val) {
      this.page.pageNum = val
      this.loadWarnInfos()
    },
    formatTimestamp(ts) {
      if (!ts) return '--'
      const date = new Date(Number(ts))
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString('zh-CN', {
        hour12: false
      })}`
    },
    getSourceLabel(srcType) {
      const maps = {0: '外系统', 1: '性能告警', 2: '业务告警'}
      return maps[srcType] || '未知'
    },
    getLevelLabel(lvl) {
      const maps = {0: '无', 1: '一般', 2: '中度', 3: '严重'}
      return maps[lvl] !== undefined ? maps[lvl] : '未知'
    },
    getStateLabel(state) {
      const maps = {
        被合并: '被合并',
        被屏蔽: '被屏蔽',
        待手工清除: '待手工清除',
        自动清除: '自动清除',
        手工清除: '手工清除'
      }
      return maps[state] || state || '--'
    },

    // ========== 故障诊断 ==========

    // ========== 故障诊断 ==========

    handleFaultDiagnosis(row) {
      this.diagnosisRow = row
      this.selectedStrategyId = null
      this.selectedStrategy = null
      this.strategyList = []
      this.diagnosisTopologyNodes = []
      this.diagnosisTopologyLinks = []
      this.diagnosisDialogVisible = true
      this.loadFaultStrategies(row)
    },

    onDiagnosisDialogOpened() {
      this.$nextTick(() => {
        if (this.diagnosisGraph) {
          const container = document.getElementById('diagnosis-x6-canvas')
          if (container) {
            const parent = container.parentElement
            if (parent) {
              this.diagnosisGraph.resize(
                parent.clientWidth,
                parent.clientHeight
              )
            }
            this.diagnosisGraph.centerContent()
          }
        }
      })
    },

    onDiagnosisDialogClosed() {
      this.disposeDiagnosisGraph()
    },

    selectStrategy(item) {
      this.selectedStrategyId = item.faultStrategyId
      this.selectedStrategy = item
      // 加载关联流程拓扑图
      if (item.businessId) {
        this.$nextTick(() => {
          this.loadDiagnosisTopology(item.businessId)
        })
      } else {
        this.diagnosisTopologyNodes = []
        this.diagnosisTopologyLinks = []
        this.clearDiagnosisGraph()
      }
    },

    initDiagnosisGraph() {
      if (this.diagnosisGraph) return
      const container = document.getElementById('diagnosis-x6-canvas')
      if (!container) return

      // 确保容器有尺寸
      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        container.style.width = '100%'
        container.style.height = '100%'
      }

      this.diagnosisGraph = new Graph({
        container,
        autoResize: true,
        background: {color: '#070c14'},
        grid: {
          size: 10,
          visible: true,
          type: 'mesh',
          args: {color: '#111c2e', thickness: 1}
        },
        connecting: {
          router: 'manhattan',
          connector: {name: 'rounded', args: {radius: 8}}
        },
        panning: true,
        mousewheel: {enabled: true, modifiers: 'ctrl'}
      })

      // 立即调整到父容器尺寸
      this.$nextTick(() => {
        if (this.diagnosisGraph) {
          const parent = container.parentElement
          if (parent) {
            this.diagnosisGraph.resize(parent.clientWidth, parent.clientHeight)
          }
        }
      })
    },

    disposeDiagnosisGraph() {
      if (this.diagnosisGraph) {
        this.diagnosisGraph.dispose()
        this.diagnosisGraph = null
      }
    },

    clearDiagnosisGraph() {
      if (this.diagnosisGraph) {
        this.diagnosisGraph.clearCells()
      }
    },

    async loadDiagnosisTopology(businessId) {
      this.diagnosisTopologyLoading = true
      this.initDiagnosisGraph()
      if (this.diagnosisGraph) {
        this.diagnosisGraph.clearCells()
      }

      try {
        const payload = {
          pageNum: 1,
          pageSize: 1000,
          params: {businessId}
        }
        const [resNodes, resLinks] = await Promise.all([
          apiPage('businessNode', payload),
          apiPage('businessLink', payload)
        ])

        const backendNodes = resNodes.data?.list || resNodes.data || []
        const backendLinks = resLinks.data?.list || resLinks.data || []

        if (!this.diagnosisGraph) {
          this.initDiagnosisGraph()
        }
        if (!this.diagnosisGraph) return

        const x6NodesMap = {}
        backendNodes.forEach(item => {
          const vNode = this.diagnosisGraph.addNode({
            id: 'node-' + item.businessNodeId,
            x: Number(item.coordinateX) || 100,
            y: Number(item.coordinateY) || 100,
            width: 140,
            height: 40,
            label: item.nodeName,
            attrs: {
              body: {
                fill: '#0f172a',
                stroke: '#06b6d4',
                strokeWidth: 1.5,
                rx: 3
              },
              label: {fill: '#cbd5e1', fontSize: 12}
            },
            ports: {
              groups: {absolute: {position: 'absolute'}},
              items: [
                {
                  id: 'port-top',
                  group: 'absolute',
                  args: {x: '50%', y: 0},
                  attrs: {circle: {r: 4, magnet: true, fill: '#06b6d4'}}
                },
                {
                  id: 'port-bottom',
                  group: 'absolute',
                  args: {x: '50%', y: '100%'},
                  attrs: {circle: {r: 4, magnet: true, fill: '#06b6d4'}}
                }
              ]
            },
            data: {...item}
          })
          x6NodesMap[item.businessNodeId] = vNode
        })

        backendLinks.forEach(link => {
          const sNode = x6NodesMap[link.srcNodeId]
          const dNode = x6NodesMap[link.dstNodeId]
          if (sNode && dNode) {
            this.diagnosisGraph.addEdge({
              id: 'link-' + link.businessLinkId,
              source: {cell: sNode.id, port: 'port-bottom'},
              target: {cell: dNode.id, port: 'port-top'},
              attrs: {
                line: {
                  stroke: '#f59e0b',
                  strokeWidth: 2,
                  targetMarker: {name: 'block', width: 8, height: 6}
                }
              },
              labels: link.elExp
                ? [
                    {
                      attrs: {
                        text: {
                          text: link.elExp,
                          fill: '#f59e0b',
                          fontSize: 10
                        }
                      }
                    }
                  ]
                : [],
              data: {...link}
            })
          }
        })

        this.diagnosisTopologyNodes = backendNodes
        this.diagnosisTopologyLinks = backendLinks

        // 确保容器尺寸后居中
        this.$nextTick(() => {
          if (!this.diagnosisGraph) return
          const container = document.getElementById('diagnosis-x6-canvas')
          if (container && container.parentElement) {
            this.diagnosisGraph.resize(
              container.parentElement.clientWidth,
              container.parentElement.clientHeight
            )
          }
          if (backendNodes.length > 0) {
            if (!backendNodes[0].coordinateX) {
              this.layoutDiagnosisGraph()
            } else {
              this.diagnosisGraph.zoomToFit({padding: 20, maxScale: 1})
            }
          }
        })
      } catch (e) {
        console.error('加载流程拓扑失败:', e)
        this.diagnosisTopologyNodes = []
        this.diagnosisTopologyLinks = []
      } finally {
        this.diagnosisTopologyLoading = false
      }
    },

    layoutDiagnosisGraph() {
      if (!this.diagnosisGraph) return
      const nodes = this.diagnosisGraph
        .getNodes()
        .map(n => ({id: n.id, width: 140, height: 40}))
      const edges = this.diagnosisGraph.getEdges().map(e => ({
        source: e.getSourceCellId(),
        target: e.getTargetCellId()
      }))

      const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: 'TB',
        ranksep: 40,
        nodesep: 40
      })
      const model = dagreLayout.layout({nodes, edges})

      this.diagnosisGraph.batchUpdate(() => {
        model.nodes.forEach(n => {
          const cell = this.diagnosisGraph.getCellById(n.id)
          if (cell) cell.position(n.x, n.y)
        })
      })
      this.diagnosisGraph.zoomToFit({padding: 20, maxScale: 1})
    },

    async loadFaultStrategies(row) {
      this.strategyLoading = true
      try {
        const faultTypeId = row.faultTypeId
        if (faultTypeId != null) {
          const res = await apiPage('faultStrategy', {
            pageNum: 1,
            pageSize: 200
          })
          const pool = res.data.list || res.data || []
          this.strategyList = pool.filter(
            s => Number(s.faultTypeId) === Number(faultTypeId)
          )
        } else {
          this.strategyList = []
          this.$message.info('该告警未关联故障类型')
        }
      } catch (e) {
        console.error('获取诊断策略失败:', e)
        this.strategyList = []
      } finally {
        this.strategyLoading = false
      }
    },

    flattenTree(tree) {
      const result = []
      const walk = nodes => {
        nodes.forEach(n => {
          result.push(n)
          if (n.children && n.children.length) walk(n.children)
        })
      }
      walk(tree)
      return result
    },

    async submitDiagnosis() {
      if (!this.selectedStrategyId) {
        this.$message.warning('请选择一个诊断策略')
        return
      }
      try {
        await request({
          url: `/rest/warnInfo/dealWarn/${this.diagnosisRow.warnId}`,
          method: 'post',
          data: {faultStrategyId: this.selectedStrategyId}
        })
        this.$message.success(
          `已下发诊断策略至告警 #${this.diagnosisRow.warnId}`
        )
        this.diagnosisDialogVisible = false
      } catch (e) {
        console.error('下发诊断策略失败:', e)
        this.$message.error('下发诊断策略失败')
      }
    },

    handleAIAnalysis(row) {
      const deviceId = row.deviceId || row.sbid
      const wlh = row.wlh
      if (deviceId != null) {
        this.$router.push({
          name: 'DeviceStatusAnalysis',
          query: {deviceId: String(deviceId)}
        })
      } else if (wlh != null) {
        this.$router.push({
          name: 'NetworkStatusAnalysis',
          query: {wlh: String(wlh), llh: String(row.llh || 1)}
        })
      } else {
        this.$message.warning('该告警无关联设备或网络，无法跳转分析')
      }
    }
  }
}
</script>

<style scoped>
/* ===================================================================
   🛰️ 战术控制中心 - 告警仪表盘深色科技风样式
   =================================================================== */
.warn-dashboard-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 11px;
  box-sizing: border-box;
  background-color: transparent; /* 继承全局背景 */
}

/* Tab 内容包装器 */
.tab-content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 嵌套 Tab 样式 */
::v-deep .nested-tabs {
  height: 100%;
}

::v-deep .nested-tabs .el-tabs__content {
  height: calc(100% - 40px);
  overflow: hidden;
}

::v-deep .nested-tabs .el-tab-pane {
  height: 100%;
}

.filter-control-bar {
  margin-bottom: 12px;
}

.table-content-wrapper {
  flex: 1;
  min-height: 0;
}

.pagination-container {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* --- 自定义告警级别样式标签 (适配深色科技主题) --- */
.custom-level-badge {
  display: inline-block;
  padding: 2px 11px;
  border-radius: 2px; /* 扁平化圆角 */
  font-size: 11px;
  font-weight: 500;

  border: 1px solid transparent;
}

.level-type-0 {
  background-color: rgba(71, 85, 105, 0.15);
  color: #94a3b8;
  border-color: rgba(71, 85, 105, 0.3);
} /* 无 */

.level-type-1 {
  background-color: rgba(245, 158, 11, 0.12);
  color: var(--color-warning);
  border-color: rgba(245, 158, 11, 0.6);
} /* 一般 - 琥珀橙 */

.level-type-2 {
  background-color: rgba(239, 68, 68, 0.15);
  color: #fca5a5;
  border-color: rgba(239, 68, 68, 0.6);
} /* 中度 - 警示红 */

.level-type-3 {
  background-color: rgba(244, 63, 94, 0.22);
  color: var(--color-danger);
  border-color: var(--color-danger);
  font-weight: bold;
  text-shadow: 0 0 4px rgba(244, 63, 94, 0.3);
} /* 严重 - 危机红 */

/* --- 自定义状态5种样式标签 (适配深色科技主题) --- */
.custom-state-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 2px;
  font-size: 11px;

  border: 1px solid transparent;
}

.state-tag-被合并 {
  background-color: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
  border-color: rgba(245, 158, 11, 0.4);
} /* 被合并 */

.state-tag-被屏蔽 {
  background-color: rgba(51, 65, 85, 0.2);
  color: #94a3b8;
  border-color: rgba(51, 65, 85, 0.4);
} /* 被屏蔽 */

.state-tag-待手工清除 {
  background-color: rgba(244, 63, 94, 0.15);
  color: var(--color-danger);
  border-color: rgba(244, 63, 94, 0.5);
  font-weight: bold;
} /* 待手工清除 */

.state-tag-自动清除 {
  background-color: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  border-color: rgba(16, 185, 129, 0.6);
} /* 自动清除 */

.state-tag-手工清除 {
  background-color: rgba(56, 189, 248, 0.12);
  color: var(--color-primary);
  border-color: rgba(56, 189, 248, 0.6);
} /* 手工清除 */

/* --- 动作舱元素控制 --- */
.custom-clear-btn {
  padding: 5px 12px;
  font-size: 11px;
  border-radius: 3px;
}

.custom-ai-btn {
  padding: 5px 10px;
  font-size: 11px;
  border-radius: 3px;
  margin-right: 4px;
}

.custom-diagnosis-btn {
  padding: 5px 8px;
  font-size: 11px;
  border-radius: 3px;
  margin: 0 4px;
}

.action-disabled-text {
  color: #334155;
  font-size: 12px;
}

/* ========== 故障诊断对话框 ========== */
::v-deep .diagnosis-dialog {
  background: #1a1f2e !important;
  border: 1px solid #2d3548 !important;
  border-radius: 8px !important;
}

::v-deep .diagnosis-dialog .el-dialog__title {
  color: #e2e8f0;
  font-size: 16px;
  font-weight: 600;
}

::v-deep .diagnosis-dialog .el-dialog__header {
  border-bottom: 1px solid #2d3548;
  padding: 16px 20px;
}

::v-deep .diagnosis-dialog .el-dialog__body {
  padding: 16px 20px;
  height: 520px;
  overflow: hidden;
}

::v-deep .diagnosis-dialog .el-dialog__footer {
  border-top: 1px solid #2d3548;
  padding: 12px 20px;
}

/* ====== 左右分栏布局 ====== */
.diagnosis-split-layout {
  display: flex;
  gap: 16px;
  height: 100%;
}

.diagnosis-left {
  width: 340px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #2d3548;
  padding-right: 16px;
}

.diagnosis-left-header {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  padding-bottom: 10px;
  border-bottom: 1px solid #2d3548;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.strategy-count {
  color: #64748b;
  font-weight: normal;
  font-size: 11px;
  margin-left: 6px;
}

.diagnosis-strategy-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.diagnosis-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.diagnosis-topology-container {
  flex: 1;
  position: relative;
  background: #070c14;
  border: 1px solid #1e293b;
  border-radius: 4px;
  overflow: hidden;
  min-height: 280px;
}

.diagnosis-x6-instance {
  width: 100%;
  height: 100%;
}

.topology-empty-tip {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #516580;
  font-size: 13px;
  gap: 6px;
  z-index: 1;
  pointer-events: none;
}

.topology-empty-tip .sub-tip {
  font-size: 11px;
  color: #334155;
  margin: 0;
}

.topology-empty-tip p {
  margin: 0;
}

/* ====== 拓扑工具栏 ====== */
.topology-toolbar {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.topology-toolbar .el-button {
  font-size: 11px !important;
  padding: 5px 10px !important;
}

/* ====== 策略卡片重设计 ====== */
.strategy-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #2d3548;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(30, 41, 59, 0.5);
  margin-bottom: 8px;
}

.strategy-card:hover {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.05);
}

.strategy-card.active {
  border-color: var(--color-warning, #f59e0b);
  background: rgba(251, 191, 36, 0.08);
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.15);
}

.strategy-radio-indicator {
  flex-shrink: 0;
  padding-top: 2px;
}

.radio-dot {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #475569;
  transition: all 0.2s ease;
  position: relative;
}

.radio-dot.checked {
  border-color: var(--color-warning, #f59e0b);
  background: var(--color-warning, #f59e0b);
  box-shadow: 0 0 4px rgba(251, 191, 36, 0.4);
}

.radio-dot.checked::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1a1f2e;
}

.strategy-info {
  flex: 1;
  min-width: 0;
}

.strategy-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  margin-bottom: 6px;
  line-height: 1.4;
}

.strategy-name .text-cyan {
  color: #38bdf8;
  margin-right: 6px;
}

.strategy-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detail-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  border: 1px solid transparent;
  white-space: nowrap;
}

.detail-tag i {
  font-size: 12px;
}

.diagnosis-tag {
  background: rgba(56, 189, 248, 0.1);
  color: #7dd3fc;
  border-color: rgba(56, 189, 248, 0.3);
}

.deal-tag {
  background: rgba(52, 211, 153, 0.1);
  color: #6ee7b7;
  border-color: rgba(52, 211, 153, 0.3);
}

/* ====== 详情面板 ====== */
.diagnosis-detail-panel {
  margin-top: 10px;
  background: rgba(12, 20, 36, 0.8);
  border: 1px solid #1e293b;
  border-radius: 4px;
  flex-shrink: 0;
}

.detail-panel-header {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  padding: 8px 14px;
  border-bottom: 1px solid #1e293b;
}

.detail-panel-body {
  padding: 10px 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 12px;
  color: #cbd5e1;
}

.detail-value.strategy-val {
  color: #f59e0b;
  font-weight: 500;
}

.detail-value.flow-val {
  color: #38bdf8;
}

/* ====== 诊断对话框底部按钮间距 ====== */
::v-deep .diagnosis-footer .el-button + .el-button {
  margin-left: 12px;
}

::v-deep .diagnosis-footer .el-button {
  padding: 7px 18px;
  font-size: 12px;
}

/* ====== 自定义空状态 ====== */
.custom-empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  padding: 0;
}

.custom-empty-wrap .empty-text {
  margin: 0;
  color: #516580;
  font-size: 12px;
  line-height: 1.5;
}
</style>
