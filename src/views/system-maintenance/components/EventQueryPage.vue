<template>
  <div class="event-page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <span class="page-title">
        <Icon
          :icon="pageIcon"
          :size="14"
          color="#38bdf8"
          style="vertical-align: middle; margin-right: 6px"
        />{{ pageTitle }}
      </span>
    </div>

    <!-- 查询条件 -->
    <div class="query-bar">
      <el-form :model="queryForm" inline size="mini">
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
    <div class="table-area">
      <el-table
        :data="eventList"
        v-loading="loading"
        stripe
        border
        size="small"
        style="width: 100%"
        height="100%"
      >
        <el-table-column prop="eventTimestamp" label="事件时间" width="155" />
        <el-table-column prop="metricName" label="指标名称" width="160" />
        <el-table-column prop="metricUnit" label="单位" width="55" />
        <el-table-column prop="standardName" label="标准名称" width="110" />
        <el-table-column prop="groupValue" label="分组值" width="90" />
        <el-table-column prop="operationValue" label="业务值" width="75" />
        <el-table-column prop="isWarn" label="告警" width="60">
          <template slot-scope="{row}">
            <el-tag :type="row.isWarn === '是' ? 'danger' : 'info'" size="mini">
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
    </div>

    <!-- 分页 -->
    <div class="pagination-bar">
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
</template>

<script>
import {
  getOperationStandardEventPage,
  getPerformanceStandardEventPage
} from '@/api/maintenanceMap'

export default {
  name: 'EventQueryPage',
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
  computed: {
    isPerformance() {
      return this.$route.name === 'PerformanceEvents'
    },
    pageTitle() {
      return this.$route.meta.title || '事件查询'
    },
    pageIcon() {
      return this.isPerformance ? 'lucide:zap' : 'lucide:clipboard-list'
    },
    apiFn() {
      return this.isPerformance
        ? getPerformanceStandardEventPage
        : getOperationStandardEventPage
    }
  },
  mounted() {
    this.fetchData()
  },
  watch: {
    '$route.name'() {
      this.queryForm = {
        groupValue: '',
        metricName: '',
        eventTimestampBegin: '',
        eventTimestampEnd: ''
      }
      this.pageNum = 1
      this.fetchData()
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
        const res = await this.apiFn(params)
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
.event-page-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  background: transparent;
}

.page-header {
  margin-bottom: 14px;
  flex-shrink: 0;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
}

.query-bar {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.table-area {
  flex: 1;
  min-height: 0;
}

.pagination-bar {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.no-data-text {
  color: #516580;
  font-size: 12px;
}
</style>
