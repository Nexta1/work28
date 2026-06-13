<template>
  <div class="screen-container">
    <!-- 顶部操作栏 -->
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">作战任务监视</span>

        <div class="search-item">
          <label>任务名称</label>
          <el-input
            v-model="queryParam.RWMC"
            @input="loadTaskList"
            placeholder="输入任务名称搜索..."
            style="width: 200px"
            size="small"
          />
        </div>

        <div class="search-item">
          <label>任务状态</label>
          <el-select
            v-model="queryParam.STATE"
            placeholder="选择状态"
            clearable
            size="mini"
            style="width: 120px"
            @change="loadTaskList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="启动" value="1"></el-option>
            <el-option label="调整" value="2"></el-option>
            <el-option label="终止" value="3"></el-option>
          </el-select>
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="loadTaskList"
        >
          刷新数据
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-download"
          class="action-btn"
          @click="handleExport"
        >
          导出监视记录
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <!-- 左侧任务统计面板 -->
      <div class="left-stats-panel">
        <div class="panel-header-summary">
          <span class="title">
            <Icon
              icon="lucide:activity"
              :size="16"
              style="vertical-align: middle; margin-right: 4px"
            />
            任务态势概览
          </span>
        </div>

        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon">
              <Icon icon="lucide:layers" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">任务总数</div>
              <div class="stat-value">{{ stats.total }}</div>
            </div>
          </div>

          <div class="stat-card stat-active">
            <div class="stat-icon">
              <Icon icon="lucide:play-circle" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">已启动</div>
              <div class="stat-value">{{ stats.active }}</div>
            </div>
          </div>

          <div class="stat-card stat-adjusting">
            <div class="stat-icon">
              <Icon icon="lucide:refresh-cw" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">调整中</div>
              <div class="stat-value">{{ stats.adjusting }}</div>
            </div>
          </div>

          <div class="stat-card stat-terminated">
            <div class="stat-icon">
              <Icon icon="lucide:stop-circle" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">已终止</div>
              <div class="stat-value">{{ stats.terminated }}</div>
            </div>
          </div>
        </div>

        <div class="recent-events">
          <div class="events-header">
            <span class="events-title">最近任务事件</span>
          </div>
          <div class="events-list">
            <div
              v-for="(event, index) in recentEvents"
              :key="index"
              class="event-item"
            >
              <div class="event-time">{{ event.time }}</div>
              <div class="event-content">
                <span class="event-type" :class="event.typeClass">{{
                  event.type
                }}</span>
                <span class="event-desc">{{ event.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧任务列表 -->
      <div class="right-table-panel">
        <el-table
          :data="taskList"
          border
          stripe
          style="width: 100%"
          height="100%"
          v-loading="loading"
        >
          <el-table-column
            type="index"
            label="序号"
            width="60"
          ></el-table-column>
          <el-table-column prop="RWMC" label="任务名称" min-width="180">
            <template slot-scope="scope">
              <span class="text-blue ellipsis-text" :title="scope.row.RWMC">
                {{ scope.row.RWMC }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="ZZRWID" label="任务ID" width="140">
            <template slot-scope="scope">
              <span class="font-num text-cyan">{{ scope.row.ZZRWID }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="STATE" label="任务状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getTaskStateType(scope.row.STATE)" size="mini">
                {{ getTaskStateText(scope.row.STATE) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="STARTTIME" label="启动时间" width="160">
            <template slot-scope="scope">
              {{ formatTime(scope.row.STARTTIME) }}
            </template>
          </el-table-column>
          <el-table-column prop="ADJUSTTIME" label="调整时间" width="160">
            <template slot-scope="scope">
              {{ formatTime(scope.row.ADJUSTTIME) || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="ENDTIME" label="终止时间" width="160">
            <template slot-scope="scope">
              {{ formatTime(scope.row.ENDTIME) || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="RWYXJ" label="优先级" width="80">
            <template slot-scope="scope">
              <span :class="getPriorityClass(scope.row.RWYXJ)">
                {{ yxjMap[scope.row.RWYXJ] || scope.row.RWYXJ }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="SSBZ"
            label="所属部队"
            width="120"
          ></el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
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
                icon="el-icon-document"
                class="btn-modify"
                @click="handleViewLog(scope.row)"
              >
                查看日志
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

    <!-- 任务详情对话框 -->
    <el-dialog
      title="任务详细信息"
      :visible.sync="detailDialogVisible"
      width="700px"
      custom-class="dark-dialog-clean"
      append-to-body
    >
      <div v-if="currentTask" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">任务名称:</span>
              <span class="detail-value">{{ currentTask.RWMC }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务ID:</span>
              <span class="detail-value text-cyan">{{
                currentTask.ZZRWID
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">任务状态:</span>
              <el-tag :type="getTaskStateType(currentTask.STATE)" size="small">
                {{ getTaskStateText(currentTask.STATE) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">优先级:</span>
              <span :class="getPriorityClass(currentTask.RWYXJ)">
                {{ yxjMap[currentTask.RWYXJ] }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">所属部队:</span>
              <span class="detail-value">{{ currentTask.SSBZ }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">作战领域:</span>
              <span class="detail-value">{{ currentTask.SSLY }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">时间节点</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">计划启动时间:</span>
              <span class="detail-value">{{
                formatTime(currentTask.STARTTIME)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">实际启动时间:</span>
              <span class="detail-value">{{
                formatTime(currentTask.ACTUAL_START)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最后调整时间:</span>
              <span class="detail-value">{{
                formatTime(currentTask.ADJUSTTIME) || '无'
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">终止时间:</span>
              <span class="detail-value">{{
                formatTime(currentTask.ENDTIME) || '未终止'
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">任务描述</h4>
          <div class="detail-text">{{ currentTask.RWMS || '暂无描述' }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {taskGetPage} from '@/api/task'
import {getYXJMap} from '@/api/map'

export default {
  name: 'TaskMonitoring',
  data() {
    return {
      loading: false,
      taskList: [],
      queryParam: {
        RWMC: '',
        STATE: ''
      },
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      yxjMap: getYXJMap ? getYXJMap() : {1: '低', 2: '重要', 3: '高'},
      stats: {
        total: 0,
        active: 0,
        adjusting: 0,
        terminated: 0
      },
      recentEvents: [],
      detailDialogVisible: false,
      currentTask: null
    }
  },
  mounted() {
    this.loadTaskList()
  },
  methods: {
    loadTaskList() {
      this.loading = true
      taskGetPage({
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        params: {
          RWMC: this.queryParam.RWMC || undefined,
          STATE: this.queryParam.STATE || undefined
        }
      })
        .then(res => {
          const data = res.data?.list || res.data || []
          this.taskList = data
          this.pagination.total = res.data?.total || data.length

          // 更新统计数据
          this.updateStats(data)

          // 生成最近事件
          this.generateRecentEvents()
        })
        .finally(() => {
          this.loading = false
        })
    },
    updateStats(data) {
      this.stats.total = this.pagination.total
      this.stats.active = data.filter(item => item.STATE === '1').length
      this.stats.adjusting = data.filter(item => item.STATE === '2').length
      this.stats.terminated = data.filter(item => item.STATE === '3').length
    },
    generateRecentEvents() {
      const events = [
        {
          time: this.formatTime(Date.now() - 300000),
          type: '启动',
          typeClass: 'event-start',
          desc: '作战任务「红剑-2024」已正式启动'
        },
        {
          time: this.formatTime(Date.now() - 600000),
          type: '调整',
          typeClass: 'event-adjust',
          desc: '任务「蓝盾行动」作战区域调整'
        },
        {
          time: this.formatTime(Date.now() - 900000),
          type: '终止',
          typeClass: 'event-end',
          desc: '演习任务「雷霆出击」已完成并终止'
        },
        {
          time: this.formatTime(Date.now() - 1200000),
          type: '启动',
          typeClass: 'event-start',
          desc: '侦察任务「天眼计划」开始执行'
        }
      ]
      this.recentEvents = events
    },
    formatTime(timestamp) {
      if (!timestamp) return '--'
      const date = new Date(Number(timestamp))
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
    getTaskStateType(state) {
      const typeMap = {
        1: 'success',
        2: 'warning',
        3: 'danger'
      }
      return typeMap[state] || 'info'
    },
    getTaskStateText(state) {
      const textMap = {
        1: '启动',
        2: '调整',
        3: '终止'
      }
      return textMap[state] || '未知'
    },
    getPriorityClass(priority) {
      const classMap = {
        1: 'text-green',
        2: 'text-orange',
        3: 'text-red'
      }
      return classMap[priority] || 'text-gray'
    },
    handleViewDetail(row) {
      this.currentTask = row
      this.detailDialogVisible = true
    },
    handleViewLog(row) {
      this.$message.info('任务日志功能开发中...')
    },
    handleExport() {
      this.$message.success('导出功能开发中...')
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.pageNum = 1
      this.loadTaskList()
    },
    handlePageChange(val) {
      this.pagination.pageNum = val
      this.loadTaskList()
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 11px;
  display: flex;
  align-items: center;
  gap: 11px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.stat-total .stat-icon {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.stat-active .stat-icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.stat-adjusting .stat-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-terminated .stat-icon {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.recent-events {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.events-header {
  padding: 8px 11px;
  border-bottom: 1px solid #17263d;
}

.events-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.events-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.event-item {
  padding: 6px 0;
  border-bottom: 1px solid #172438;
}

.event-item:last-child {
  border-bottom: none;
}

.event-time {
  font-size: 9px;
  color: #475569;
  margin-bottom: 2px;
}

.event-content {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
}

.event-type {
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 9px;
  flex-shrink: 0;
}

.event-start {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.event-adjust {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.event-end {
  background: rgba(244, 63, 94, 0.2);
  color: #f43f5e;
}

.event-desc {
  color: #94a3b8;
  flex: 1;
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
  width: 100px;
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

.text-red {
  color: #f43f5e !important;
}

.text-gray {
  color: #475569 !important;
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
