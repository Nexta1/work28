<template>
  <div class="performance-metric-container">
    <div class="filter-control-bar">
      <el-form :inline="true" :model="queryForm" size="mini">
        <el-form-item label="指标名称">
          <el-input
            v-model="queryForm.metricName"
            placeholder="请输入指标名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="数据类型">
          <el-select
            v-model="queryForm.dataType"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in dataTypeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="handleSearch"
            >检索</el-button
          >
          <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
          <el-button
            type="success"
            icon="el-icon-plus"
            @click="openDialog('add')"
            >新增指标</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <div class="table-content-wrapper" v-loading="loading">
      <el-table :data="tableData" style="width: 100%" height="100%">
        <el-table-column
          prop="performanceMetricId"
          label="指标ID"
          width="100"
          fixed
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="metricName"
          label="指标名称"
          width="180"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="dataType"
          label="数据类型"
          width="120"
          align="center"
        />
        <el-table-column
          prop="metricUnit"
          label="指标单位"
          width="100"
          align="center"
        />
        <el-table-column
          prop="srcTableName"
          label="源数据表"
          width="150"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="srcColumnName"
          label="源数据列"
          width="150"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="窗口配置" width="150" align="center">
          <template slot-scope="scope">{{
            formatWindowConfig(scope.row.windowType, scope.row.windowLength)
          }}</template>
        </el-table-column>
        <el-table-column
          prop="accumulateMethod"
          label="聚合方法"
          width="120"
          align="center"
        />
        <el-table-column
          prop="groupColumnName"
          label="分组列名"
          width="120"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="metricMemo"
          label="指标描述"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column label="操作时间" width="165" align="center">
          <template slot-scope="scope">{{
            formatDateTime(scope.row.opTime)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              class="custom-edit-btn"
              @click="openDialog('edit', scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              class="custom-delete-btn"
              @click="handleDelete(scope.row)"
              >删除</el-button
            >
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

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="form"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        size="small"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指标名称" prop="metricName"
              ><el-input
                v-model="formData.metricName"
                placeholder="请输入指标名称"
            /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据类型" prop="dataType">
              <el-select
                v-model="formData.dataType"
                placeholder="请选择数据类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dataTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="指标单位" prop="metricUnit"
              ><el-input v-model="formData.metricUnit" placeholder="如：ms、%"
            /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="源数据表" prop="srcTableName"
              ><el-input
                v-model="formData.srcTableName"
                placeholder="请输入表名"
            /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="源数据列" prop="srcColumnName"
              ><el-input
                v-model="formData.srcColumnName"
                placeholder="请输入列名"
            /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="窗口类型" prop="windowType">
              <el-select
                v-model="formData.windowType"
                placeholder="请选择窗口类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in windowTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="窗口长度" prop="windowLength"
              ><el-input-number
                v-model="formData.windowLength"
                :min="1"
                :max="1000"
                placeholder="请输入窗口长度"
                style="width: 100%"
            /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="聚合方法" prop="accumulateMethod">
              <el-select
                v-model="formData.accumulateMethod"
                placeholder="请选择聚合方法"
                style="width: 100%"
              >
                <el-option
                  v-for="item in accumulateMethodOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="分组列名" prop="groupColumnName"
          ><el-input v-model="formData.groupColumnName" placeholder="可选"
        /></el-form-item>
        <el-form-item label="指标描述" prop="metricMemo"
          ><el-input
            v-model="formData.metricMemo"
            type="textarea"
            :rows="3"
            placeholder="请输入指标描述"
        /></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {mainPage, apiDelete, apiAdd, apiUpdate} from '@/api/common'
import {dataTypes, windowTypes, accumulateMethods} from '@/api/maintenanceMap'

export default {
  name: 'PerformanceMetric',
  data() {
    return {
      loading: false,
      queryForm: {metricName: '', dataType: ''},
      tableData: [],
      page: {pageNum: 1, pageSize: 20, total: 0},
      dialogVisible: false,
      dialogTitle: '新增指标',
      formData: {
        performanceMetricId: null,
        dataType: '',
        metricName: '',
        metricUnit: '',
        srcTableName: '',
        srcColumnName: '',
        windowType: '',
        windowLength: 1,
        accumulateMethod: '',
        groupColumnName: '',
        metricMemo: ''
      },
      formRules: {
        metricName: [
          {required: true, message: '请输入指标名称', trigger: 'blur'}
        ],
        dataType: [
          {required: true, message: '请选择数据类型', trigger: 'change'}
        ],
        srcTableName: [
          {required: true, message: '请输入源数据表名', trigger: 'blur'}
        ],
        srcColumnName: [
          {required: true, message: '请输入源数据列名', trigger: 'blur'}
        ],
        windowType: [
          {required: true, message: '请选择窗口类型', trigger: 'change'}
        ],
        windowLength: [
          {required: true, message: '请输入窗口长度', trigger: 'blur'}
        ],
        accumulateMethod: [
          {required: true, message: '请选择聚合方法', trigger: 'change'}
        ]
      },
      dataTypeOptions: [],
      windowTypeOptions: [],
      accumulateMethodOptions: []
    }
  },
  mounted() {
    this.loadOptions()
    this.loadData()
  },
  methods: {
    async loadOptions() {
      try {
        const [dataTypeRes, windowRes, accumulateRes] = await Promise.all([
          dataTypes(),
          windowTypes(),
          accumulateMethods()
        ])
        this.dataTypeOptions = dataTypeRes || []
        this.windowTypeOptions = windowRes || []
        this.accumulateMethodOptions = accumulateRes || []
      } catch (e) {
        console.error('加载选项失败:', e)
      }
    },
    async loadData() {
      this.loading = true
      try {
        const payload = {
          pageNum: this.page.pageNum,
          pageSize: this.page.pageSize,
          ...this.queryForm
        }
        const res = await mainPage('performanceMetric', payload)
        this.tableData = res.data || res.list || []
        this.page.total = res.recordsTotal || res.total || 0
      } catch (e) {
        console.error('加载性能指标失败:', e)
        this.$message.error('数据加载失败')
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.page.pageNum = 1
      this.loadData()
    },
    resetQuery() {
      this.queryForm = {metricName: '', dataType: ''}
      this.handleSearch()
    },
    handleSizeChange(val) {
      this.page.pageSize = val
      this.loadData()
    },
    handleCurrentChange(val) {
      this.page.pageNum = val
      this.loadData()
    },
    openDialog(type, row = null) {
      this.dialogTitle = type === 'add' ? '新增指标' : '编辑指标'
      if (type === 'edit' && row) {
        this.formData = {
          performanceMetricId: row.performanceMetricId,
          dataType: row.dataType,
          metricName: row.metricName,
          metricUnit: row.metricUnit || '',
          srcTableName: row.srcTableName,
          srcColumnName: row.srcColumnName,
          windowType: row.windowType,
          windowLength: row.windowLength || 1,
          accumulateMethod: row.accumulateMethod,
          groupColumnName: row.groupColumnName || '',
          metricMemo: row.metricMemo || ''
        }
      } else {
        this.formData = {
          performanceMetricId: null,
          dataType: '',
          metricName: '',
          metricUnit: '',
          srcTableName: '',
          srcColumnName: '',
          windowType: '',
          windowLength: 1,
          accumulateMethod: '',
          groupColumnName: '',
          metricMemo: ''
        }
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate()
      })
    },
    handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return
        try {
          const submitData = {...this.formData}
          if (this.formData.performanceMetricId) {
            await apiUpdate('performanceMetric', submitData)
            this.$message.success('修改成功')
          } else {
            await apiAdd('performanceMetric', submitData)
            this.$message.success('新增成功')
          }
          this.dialogVisible = false
          this.loadData()
        } catch (e) {
          console.error('提交失败:', e)
          this.$message.error('操作失败')
        }
      })
    },
    handleDelete(row) {
      this.$confirm(`确定要删除指标 [${row.metricName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await apiDelete('performanceMetric', row.performanceMetricId)
            this.$message.success('删除成功')
            this.loadData()
          } catch (e) {
            console.error('删除失败:', e)
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },
    formatWindowConfig(windowType, windowLength) {
      if (!windowType || !windowLength) return '--'
      return `${windowType}(${windowLength})`
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      const date = new Date(dateTime)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString('zh-CN', {hour12: false})}`
    }
  }
}
</script>

<style scoped>
.performance-metric-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 11px;
  box-sizing: border-box;
  background-color: transparent;
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
.custom-edit-btn {
  padding: 5px 12px;
  font-size: 11px;
  border-radius: 3px;
}
.custom-delete-btn {
  padding: 5px 12px;
  font-size: 11px;
  border-radius: 3px;
}
</style>
