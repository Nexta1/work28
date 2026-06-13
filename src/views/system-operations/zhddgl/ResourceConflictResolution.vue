<template>
  <div class="screen-container">
    <!-- 顶部操作栏 -->
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">数据链资源冲突消解</span>

        <div class="search-item">
          <label>网络类型</label>
          <el-select
            v-model="queryParam.NETWORK_TYPE"
            placeholder="选择网络类型"
            clearable
            size="mini"
            style="width: 140px"
            @change="loadConflictList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="广域数据链" value="wide"></el-option>
            <el-option label="区域数据链" value="regional"></el-option>
            <el-option label="局域数据链" value="local"></el-option>
          </el-select>
        </div>

        <div class="search-item">
          <label>冲突状态</label>
          <el-select
            v-model="queryParam.CONFLICT_STATUS"
            placeholder="选择状态"
            clearable
            size="mini"
            style="width: 120px"
            @change="loadConflictList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="待处理" value="pending"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已解决" value="resolved"></el-option>
          </el-select>
        </div>

        <div class="search-item">
          <label>冲突等级</label>
          <el-select
            v-model="queryParam.LEVEL"
            placeholder="选择等级"
            clearable
            size="mini"
            style="width: 120px"
            @change="loadConflictList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="严重" value="high"></el-option>
            <el-option label="中等" value="medium"></el-option>
            <el-option label="轻微" value="low"></el-option>
          </el-select>
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="warning"
          size="mini"
          icon="el-icon-magic-stick"
          class="action-btn"
          @click="handleAnalyzeConflicts"
        >
          冲突分析
        </el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-s-promotion"
          class="action-btn"
          @click="handleGenerateStrategy"
          :disabled="!hasSelectedConflicts"
        >
          生成处置策略
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="loadConflictList"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <!-- 左侧资源态势 -->
      <div class="left-stats-panel">
        <div class="panel-header-summary">
          <span class="title">
            <Icon
              icon="lucide:radio"
              :size="16"
              style="vertical-align: middle; margin-right: 4px"
            />
            资源分配态势
          </span>
        </div>

        <div class="resource-stats">
          <div class="stat-card">
            <div class="stat-label">频谱资源利用率</div>
            <div class="stat-value text-cyan">
              {{ resourceStats.spectrumUsage }}%
            </div>
            <el-progress
              :percentage="resourceStats.spectrumUsage"
              :stroke-width="6"
              :color="getProgressColor(resourceStats.spectrumUsage)"
            ></el-progress>
          </div>

          <div class="stat-card">
            <div class="stat-label">时隙资源利用率</div>
            <div class="stat-value text-orange">
              {{ resourceStats.timeslotUsage }}%
            </div>
            <el-progress
              :percentage="resourceStats.timeslotUsage"
              :stroke-width="6"
              :color="getProgressColor(resourceStats.timeslotUsage)"
            ></el-progress>
          </div>

          <div class="stat-card">
            <div class="stat-label">功率资源利用率</div>
            <div class="stat-value text-green">
              {{ resourceStats.powerUsage }}%
            </div>
            <el-progress
              :percentage="resourceStats.powerUsage"
              :stroke-width="6"
              :color="getProgressColor(resourceStats.powerUsage)"
            ></el-progress>
          </div>
        </div>

        <div class="conflict-summary">
          <div class="summary-header">
            <span class="summary-title">冲突统计</span>
          </div>
          <div class="summary-grid">
            <div class="summary-item summary-pending">
              <div class="summary-label">待处理</div>
              <div class="summary-value">{{ conflictStats.pending }}</div>
            </div>
            <div class="summary-item summary-processing">
              <div class="summary-label">处理中</div>
              <div class="summary-value">{{ conflictStats.processing }}</div>
            </div>
            <div class="summary-item summary-resolved">
              <div class="summary-label">已解决</div>
              <div class="summary-value">{{ conflictStats.resolved }}</div>
            </div>
            <div class="summary-item summary-total">
              <div class="summary-label">总计</div>
              <div class="summary-value">{{ conflictStats.total }}</div>
            </div>
          </div>
        </div>

        <div class="network-distribution">
          <div class="distribution-header">
            <span class="distribution-title">网络分布</span>
          </div>
          <div class="distribution-list">
            <div class="dist-item">
              <span class="dist-name">广域数据链</span>
              <span class="dist-count text-blue">{{ networkDist.wide }}</span>
            </div>
            <div class="dist-item">
              <span class="dist-name">区域数据链</span>
              <span class="dist-count text-cyan">{{
                networkDist.regional
              }}</span>
            </div>
            <div class="dist-item">
              <span class="dist-name">局域数据链</span>
              <span class="dist-count text-green">{{ networkDist.local }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧冲突列表 -->
      <div class="right-table-panel">
        <el-table
          :data="conflictList"
          border
          stripe
          style="width: 100%"
          height="100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column
            type="index"
            label="序号"
            width="60"
          ></el-table-column>
          <el-table-column prop="CONFLICT_ID" label="冲突ID" width="120">
            <template slot-scope="scope">
              <span class="font-num text-cyan">{{
                scope.row.CONFLICT_ID
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="NETWORK_TYPE" label="网络类型" width="120">
            <template slot-scope="scope">
              <el-tag
                size="mini"
                :type="getNetworkTypeTag(scope.row.NETWORK_TYPE)"
              >
                {{ getNetworkTypeText(scope.row.NETWORK_TYPE) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="RESOURCE_TYPE" label="资源类型" width="100">
            <template slot-scope="scope">
              {{ getResourceTypeText(scope.row.RESOURCE_TYPE) }}
            </template>
          </el-table-column>
          <el-table-column prop="LEVEL" label="冲突等级" width="90">
            <template slot-scope="scope">
              <el-tag size="mini" :type="getLevelType(scope.row.LEVEL)">
                {{ getLevelText(scope.row.LEVEL) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="DESCRIPTION" label="冲突描述" min-width="200">
            <template slot-scope="scope">
              <span class="ellipsis-text" :title="scope.row.DESCRIPTION">
                {{ scope.row.DESCRIPTION }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="STATUS" label="处理状态" width="100">
            <template slot-scope="scope">
              <el-tag size="mini" :type="getStatusType(scope.row.STATUS)">
                {{ getStatusText(scope.row.STATUS) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="DETECT_TIME" label="发现时间" width="160">
            <template slot-scope="scope">
              {{ formatTime(scope.row.DETECT_TIME) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-view"
                class="btn-modify"
                @click="handleViewDetail(scope.row)"
              >
                查看详情
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-check"
                class="btn-modify"
                @click="handleResolveConflict(scope.row)"
                :disabled="scope.row.STATUS === 'resolved'"
              >
                下发策略
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            :page-size="pagination.pageSize"
            :current-page="pagination.pageNum"
            :page-sizes="[10, 20, 50, 100]"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          ></el-pagination>
        </div>
      </div>
    </div>

    <!-- 冲突详情对话框 -->
    <el-dialog
      title="冲突详细信息"
      :visible.sync="detailDialogVisible"
      width="800px"
      custom-class="dark-dialog-clean"
      append-to-body
    >
      <div v-if="currentConflict" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">冲突ID:</span>
              <span class="detail-value text-cyan">{{
                currentConflict.CONFLICT_ID
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">网络类型:</span>
              <el-tag
                size="small"
                :type="getNetworkTypeTag(currentConflict.NETWORK_TYPE)"
              >
                {{ getNetworkTypeText(currentConflict.NETWORK_TYPE) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">资源类型:</span>
              <span class="detail-value">{{
                getResourceTypeText(currentConflict.RESOURCE_TYPE)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">冲突等级:</span>
              <el-tag size="small" :type="getLevelType(currentConflict.LEVEL)">
                {{ getLevelText(currentConflict.LEVEL) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">处理状态:</span>
              <el-tag
                size="small"
                :type="getStatusType(currentConflict.STATUS)"
              >
                {{ getStatusText(currentConflict.STATUS) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">发现时间:</span>
              <span class="detail-value">{{
                formatTime(currentConflict.DETECT_TIME)
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">冲突描述</h4>
          <div class="detail-text">{{ currentConflict.DESCRIPTION }}</div>
        </div>

        <div class="detail-section" v-if="currentConflict.STRATEGY">
          <h4 class="section-title">处置策略</h4>
          <div class="strategy-content">
            <div class="strategy-item">
              <span class="strategy-label">策略类型:</span>
              <span class="strategy-value">{{
                currentConflict.STRATEGY.type
              }}</span>
            </div>
            <div class="strategy-item">
              <span class="strategy-label">调整方案:</span>
              <span class="strategy-value">{{
                currentConflict.STRATEGY.plan
              }}</span>
            </div>
            <div class="strategy-item">
              <span class="strategy-label">预期效果:</span>
              <span class="strategy-value">{{
                currentConflict.STRATEGY.effect
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button size="mini" @click="detailDialogVisible = false"
          >关闭</el-button
        >
        <el-button
          type="primary"
          size="mini"
          @click="handleResolveFromDialog"
          v-if="currentConflict && currentConflict.STATUS !== 'resolved'"
        >
          下发处置策略
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ResourceConflictResolution',
  data() {
    return {
      loading: false,
      conflictList: [],
      selectedConflicts: [],
      queryParam: {
        NETWORK_TYPE: '',
        CONFLICT_STATUS: '',
        LEVEL: ''
      },
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      resourceStats: {
        spectrumUsage: 72.5,
        timeslotUsage: 85.3,
        powerUsage: 63.8
      },
      conflictStats: {
        pending: 5,
        processing: 3,
        resolved: 12,
        total: 20
      },
      networkDist: {
        wide: 8,
        regional: 7,
        local: 5
      },
      detailDialogVisible: false,
      currentConflict: null
    }
  },
  computed: {
    hasSelectedConflicts() {
      return this.selectedConflicts.length > 0
    }
  },
  mounted() {
    this.loadConflictList()
  },
  methods: {
    loadConflictList() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        this.conflictList = [
          {
            CONFLICT_ID: 'CF001',
            NETWORK_TYPE: 'wide',
            RESOURCE_TYPE: 'spectrum',
            LEVEL: 'high',
            DESCRIPTION: '广域网频段A与频段B存在重叠干扰，影响通信质量',
            STATUS: 'pending',
            DETECT_TIME: Date.now() - 1800000,
            STRATEGY: null
          },
          {
            CONFLICT_ID: 'CF002',
            NETWORK_TYPE: 'regional',
            RESOURCE_TYPE: 'timeslot',
            LEVEL: 'medium',
            DESCRIPTION: '区域网时隙分配冲突，节点3和节点5同时占用T3时隙',
            STATUS: 'processing',
            DETECT_TIME: Date.now() - 3600000,
            STRATEGY: {
              type: '时隙重分配',
              plan: '将节点5调整至T5时隙',
              effect: '消除时隙冲突，提升传输效率15%'
            }
          },
          {
            CONFLICT_ID: 'CF003',
            NETWORK_TYPE: 'local',
            RESOURCE_TYPE: 'power',
            LEVEL: 'low',
            DESCRIPTION: '局域网功率分配不均，边缘节点信号弱',
            STATUS: 'resolved',
            DETECT_TIME: Date.now() - 7200000,
            STRATEGY: {
              type: '功率优化',
              plan: '提升边缘节点发射功率3dB',
              effect: '改善覆盖范围，信号强度提升20%'
            }
          },
          {
            CONFLICT_ID: 'CF004',
            NETWORK_TYPE: 'wide',
            RESOURCE_TYPE: 'spectrum',
            LEVEL: 'high',
            DESCRIPTION: '多链路频谱资源竞争，导致部分链路信噪比下降',
            STATUS: 'pending',
            DETECT_TIME: Date.now() - 900000,
            STRATEGY: null
          },
          {
            CONFLICT_ID: 'CF005',
            NETWORK_TYPE: 'regional',
            RESOURCE_TYPE: 'timeslot',
            LEVEL: 'medium',
            DESCRIPTION: '周期性时隙预留不足，高峰时段出现拥塞',
            STATUS: 'pending',
            DETECT_TIME: Date.now() - 600000,
            STRATEGY: null
          }
        ]
        this.pagination.total = this.conflictList.length
        this.loading = false
      }, 500)
    },
    handleSelectionChange(selection) {
      this.selectedConflicts = selection
    },
    formatTime(timestamp) {
      if (!timestamp) return '--'
      const date = new Date(Number(timestamp))
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    getNetworkTypeTag(type) {
      const tagMap = {
        wide: 'primary',
        regional: 'success',
        local: 'warning'
      }
      return tagMap[type] || 'info'
    },
    getNetworkTypeText(type) {
      const textMap = {
        wide: '广域数据链',
        regional: '区域数据链',
        local: '局域数据链'
      }
      return textMap[type] || type
    },
    getResourceTypeText(type) {
      const textMap = {
        spectrum: '频谱资源',
        timeslot: '时隙资源',
        power: '功率资源'
      }
      return textMap[type] || type
    },
    getLevelType(level) {
      const typeMap = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return typeMap[level] || 'info'
    },
    getLevelText(level) {
      const textMap = {
        high: '严重',
        medium: '中等',
        low: '轻微'
      }
      return textMap[level] || level
    },
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        processing: 'primary',
        resolved: 'success'
      }
      return typeMap[status] || 'info'
    },
    getStatusText(status) {
      const textMap = {
        pending: '待处理',
        processing: '处理中',
        resolved: '已解决'
      }
      return textMap[status] || status
    },
    getProgressColor(value) {
      if (value < 60) return '#10b981'
      if (value < 80) return '#f59e0b'
      return '#f43f5e'
    },
    handleAnalyzeConflicts() {
      this.$message.info('正在进行资源冲突分析...')
      setTimeout(() => {
        this.$message.success('冲突分析完成，发现3个新冲突')
        this.loadConflictList()
      }, 1500)
    },
    handleGenerateStrategy() {
      this.$confirm(
        `确定为选中的 ${this.selectedConflicts.length} 个冲突生成处置策略？`,
        '确认生成',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$message.success('处置策略生成成功')
          this.loadConflictList()
        })
        .catch(() => {})
    },
    handleViewDetail(row) {
      this.currentConflict = row
      this.detailDialogVisible = true
    },
    handleResolveConflict(row) {
      if (!row.STRATEGY) {
        this.$message.warning('该冲突尚未生成处置策略，请先生成策略')
        return
      }

      this.$confirm(`确定要下发处置策略吗？`, '确认下发', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('处置策略已下发')
          row.STATUS = 'resolved'
        })
        .catch(() => {})
    },
    handleResolveFromDialog() {
      if (this.currentConflict) {
        this.handleResolveConflict(this.currentConflict)
        this.detailDialogVisible = false
      }
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.pageNum = 1
      this.loadConflictList()
    },
    handlePageChange(val) {
      this.pagination.pageNum = val
      this.loadConflictList()
    }
  }
}
</script>

<style scoped>
.screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.top-search-header {
  height: 46px;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}

.search-flex {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-item label {
  font-size: 11px;
  color: #52637a;
}

.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
  color: #fff;
}

.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}

.left-stats-panel {
  width: 320px;
  flex-shrink: 0;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header-summary {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #111b2b;
}

.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.resource-stats {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.stat-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 11px;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 6px;
}

.conflict-summary {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.summary-header {
  padding: 8px 11px;
  border-bottom: 1px solid #17263d;
}

.summary-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 11px;
}

.summary-item {
  text-align: center;
  padding: 8px;
  border-radius: 4px;
}

.summary-pending {
  background: rgba(245, 158, 11, 0.1);
}

.summary-processing {
  background: rgba(56, 189, 248, 0.1);
}

.summary-resolved {
  background: rgba(16, 185, 129, 0.1);
}

.summary-total {
  background: rgba(100, 116, 139, 0.1);
}

.summary-label {
  font-size: 9px;
  color: #64748b;
  margin-bottom: 2px;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.network-distribution {
  flex: 1;
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.distribution-header {
  padding: 8px 11px;
  border-bottom: 1px solid #17263d;
}

.distribution-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.distribution-list {
  padding: 11px;
}

.dist-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #172438;
  font-size: 11px;
}

.dist-item:last-child {
  border-bottom: none;
}

.dist-name {
  color: #94a3b8;
}

.dist-count {
  font-weight: bold;
}

.right-table-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
}

.pagination-wrapper {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-section {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 12px;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: #38bdf8;
  margin: 0 0 11px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid #17263d;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 11px;
}

.detail-label {
  color: #64748b;
  width: 90px;
  flex-shrink: 0;
}

.detail-value {
  color: #cbd5e1;
  flex: 1;
}

.detail-text {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.6;
}

.strategy-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strategy-item {
  display: flex;
  align-items: center;
  font-size: 11px;
}

.strategy-label {
  color: #64748b;
  width: 80px;
  flex-shrink: 0;
}

.strategy-value {
  color: #cbd5e1;
  flex: 1;
}

.text-blue {
  color: #38bdf8 !important;
}

.text-cyan {
  color: #06b6d4 !important;
}

.text-green {
  color: #10b981 !important;
}

.text-orange {
  color: #f59e0b !important;
}

.font-num {
  font-family: monospace;
}

.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-modify {
  color: #38bdf8 !important;
}
</style>
