<template>
  <!-- 事件查询底部抽屉（手写，仅占内容区域下半部分） -->
  <transition name="drawer-slide">
    <div
      v-if="visible"
      class="event-drawer-overlay"
      @click.self="$emit('close')"
    >
      <div class="event-drawer-panel" @click.stop>
        <!-- 抽屉头部 -->
        <div class="drawer-header">
          <div class="drawer-header-left">
            <span class="drawer-title-icon"></span>
            <span class="drawer-title">事件记录查询 - {{ pageTitle }}</span>
          </div>
          <div class="drawer-header-right">
            <button class="drawer-close-btn" @click="$emit('close')">
              <i class="el-icon-close"></i>
            </button>
          </div>
        </div>

        <!-- 查询条件 -->
        <div class="drawer-query-bar">
          <el-form
            :model="queryForm"
            inline
            size="mini"
            class="query-form-inline"
          >
            <el-form-item label="分组值">
              <el-input
                v-model="queryForm.groupValue"
                placeholder="模糊搜索"
                clearable
                style="width: 130px"
              />
            </el-form-item>
            <el-form-item label="指标名称">
              <el-input
                v-model="queryForm.metricName"
                placeholder="搜索"
                clearable
                style="width: 120px"
              />
            </el-form-item>
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="queryForm.eventTimestampBegin"
                type="datetime"
                placeholder="选择开始时间"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm:ss"
                clearable
                style="width: 160px"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="queryForm.eventTimestampEnd"
                type="datetime"
                placeholder="选择结束时间"
                format="yyyy-MM-dd HH:mm"
                value-format="yyyy-MM-dd HH:mm:ss"
                clearable
                style="width: 160px"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-search"
                @click="handleSearch"
                >查询</el-button
              >
              <el-button size="mini" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 事件列表 -->
        <div class="drawer-table-area">
          <el-table
            :data="eventList"
            v-loading="loading"
            stripe
            border
            size="small"
            style="width: 100%"
          >
            <el-table-column
              prop="eventTimestamp"
              label="事件时间"
              width="155"
            />
            <el-table-column prop="metricName" label="指标名称" width="110" />
            <el-table-column prop="metricUnit" label="单位" width="55" />
            <el-table-column prop="standardName" label="标准名称" width="110" />
            <el-table-column prop="groupValue" label="分组值" width="90" />
            <el-table-column prop="operationValue" label="业务值" width="75" />
            <el-table-column prop="isWarn" label="告警" width="60">
              <template slot-scope="{row}">
                <el-tag
                  :type="row.isWarn === '是' ? 'danger' : 'info'"
                  size="mini"
                >
                  {{ row.isWarn || '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="eventMemo"
              label="事件说明"
              min-width="160"
              show-overflow-tooltip
            />
          </el-table>

          <!-- 分页 -->
          <div class="drawer-pagination-bar">
            <el-pagination
              v-if="total > 0"
              layout="total, sizes, prev, pager, next"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              :total="total"
              :current-page.sync="pageNum"
              background
              small
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
            <span v-else class="no-data-text">暂无事件记录</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import {getOperationStandardEventPage} from '@/api/maintenanceMap'

export default {
  name: 'EventQueryDrawer',
  props: {
    visible: {type: Boolean, default: false},
    pageTitle: {type: String, default: ''}
  },
  data() {
    return {
      loading: false,
      eventList: [],
      total: 0,
      pageNum: 1,
      pageSize: 20,
      queryForm: {
        groupValue: '',
        metricName: '',
        eventTimestampBegin: '',
        eventTimestampEnd: ''
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.pageNum = 1
        this.fetchData()
      }
    }
  },
  methods: {
    async fetchData() {
      this.loading = true
      try {
        const params = {
          draw: 1,
          start: (this.pageNum - 1) * this.pageSize,
          length: this.pageSize,
          groupValue: this.queryForm.groupValue || undefined,
          metricName: this.queryForm.metricName || undefined,
          eventTimestampBegin: this.queryForm.eventTimestampBegin || undefined,
          eventTimestampEnd: this.queryForm.eventTimestampEnd || undefined
        }
        const res = await getOperationStandardEventPage(params)
        this.total = res.recordsTotal || 0
        this.eventList = res.data || []
      } catch (e) {
        console.error('事件查询失败:', e)
        this.eventList = []
      }
      this.loading = false
    },
    handleSearch() {
      this.pageNum = 1
      this.fetchData()
    },
    handleReset() {
      this.queryForm = {
        groupValue: '',
        metricName: '',
        eventTimestampBegin: '',
        eventTimestampEnd: ''
      }
      this.pageNum = 1
      this.fetchData()
    },
    handleSizeChange(size) {
      this.pageSize = size
      this.fetchData()
    },
    handlePageChange(page) {
      this.pageNum = page
      this.fetchData()
    }
  }
}
</script>

<style scoped>
/* =============== 遮罩层 =============== */
.event-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2000;
  /* background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(1px); */
}

/* =============== 抽屉面板 =============== */
.event-drawer-panel {
  position: fixed;
  left: 280px; /* 避开左侧菜单宽度 */
  right: 10px;
  bottom: 0;
  height: calc(100% - 120px);
  min-height: 340px;
  background: #20385a;
  border-top: 1px solid #2f4a6e;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
  z-index: 2001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* =============== 头部 =============== */
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 16px;
  background: #1a2d48;
  border-bottom: 1px solid #2a405e;
  flex-shrink: 0;
}
.drawer-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.drawer-title-icon {
  width: 3px;
  height: 14px;
  background: #38bdf8;
  border-radius: 1px;
}
.drawer-title {
  color: #38bdf8;
  font-size: 12px;
  font-weight: bold;
  letter-spacing: 0.5px;
}
.drawer-close-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}
.drawer-close-btn:hover {
  color: #f43f5e;
}

/* =============== 查询条件栏 =============== */
.drawer-query-bar {
  padding: 10px 16px 4px;
  border-bottom: 1px solid #111b2b;
  flex-shrink: 0;
}
.query-form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.query-form-inline ::v-deep .el-form-item {
  margin-bottom: 6px;
  margin-right: 8px;
}
.query-form-inline ::v-deep .el-form-item__label {
  color: #94a3b8 !important;
  font-size: 11px !important;
  padding-right: 4px !important;
}

/* =============== 表格区 =============== */
.drawer-table-area {
  flex: 1;
  padding: 8px 16px 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* =============== 分页栏 =============== */
.drawer-pagination-bar {
  flex-shrink: 0;
  padding-top: 6px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.no-data-text {
  color: #475569;
  font-size: 11px;
}

/* =============== 进出动画 =============== */
.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}
.drawer-slide-enter .event-drawer-panel,
.drawer-slide-leave-to .event-drawer-panel {
  transform: translateY(100%);
}
.drawer-slide-enter .event-drawer-overlay,
.drawer-slide-leave-to .event-drawer-overlay {
  opacity: 0;
}
</style>
