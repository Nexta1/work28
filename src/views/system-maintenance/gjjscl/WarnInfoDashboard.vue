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
                width="100"
                fixed="right"
                align="center"
              >
                <template slot-scope="scope">
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
import {mainPage, mainDelete, apiGetAll} from '@/api/common'
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
  padding: 10px;
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
  padding: 2px 10px;
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
  color: #64748b;
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

.action-disabled-text {
  color: #334155;
  font-size: 12px;
}
</style>
