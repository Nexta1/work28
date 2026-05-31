<template>
  <div class="warn-merge-container">
    <!-- 筛选控制栏 -->
    <div class="filter-control-bar">
      <el-form :inline="true" :model="queryForm" size="mini">
        <el-form-item label="规则名称">
          <el-input
            v-model="queryForm.ruleName"
            placeholder="请输入规则名称"
            clearable
            style="width: 180px"
          />
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
            >新增规则</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格内容区 -->
    <div class="table-content-wrapper" v-loading="loading">
      <el-table :data="tableData" style="width: 100%" height="100%">
        <el-table-column
          prop="warnMergeId"
          label="规则ID"
          width="100"
          fixed
          align="center"
          show-overflow-tooltip
        />

        <el-table-column
          prop="ruleName"
          label="规则名称"
          width="180"
          align="center"
          show-overflow-tooltip
        />

        <el-table-column
          prop="srcFaultNames"
          label="源告警类型列表"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />

        <el-table-column
          prop="dstFaultName"
          label="目标告警类型"
          width="150"
          align="center"
          show-overflow-tooltip
        />

        <el-table-column label="时间窗口(秒)" width="120" align="center">
          <template slot-scope="scope">
            {{ scope.row.timeWindow }}
          </template>
        </el-table-column>

        <el-table-column
          prop="ruleMemo"
          label="规则说明"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />

        <el-table-column label="操作时间" width="165" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.opTime) }}
          </template>
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

    <!-- 分页容器 -->
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

    <!-- 新增/编辑对话框 -->
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
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="源告警类型" prop="srcFaultTypeIds">
          <el-cascader
            v-model="formData.srcFaultTypeIds"
            :options="faultTypeOptions"
            :props="{
              emitPath: false,
              value: 'faultTypeId',
              label: 'faultName',
              children: 'children',
              checkStrictly: true,
              multiple: true
            }"
            placeholder="请选择故障类型"
            clearable
            filterable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="目标告警类型" prop="dstFaultTypeId">
          <el-cascader
            v-model="formData.dstFaultTypeId"
            :options="faultTypeOptions"
            :props="{
              emitPath: false,
              value: 'faultTypeId',
              label: 'faultName',
              children: 'children',
              checkStrictly: true
            }"
            placeholder="请选择目标故障类型"
            clearable
            filterable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="时间窗口(秒)" prop="timeWindow">
          <el-input-number
            v-model="formData.timeWindow"
            :min="1"
            :max="3600"
            placeholder="请输入时间窗口"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="规则说明" prop="ruleMemo">
          <el-input
            v-model="formData.ruleMemo"
            type="textarea"
            :rows="4"
            placeholder="请输入规则说明"
          />
        </el-form-item>
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

export default {
  name: 'WarnMerge',
  props: {
    faultTypeOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      queryForm: {
        ruleName: ''
      },
      tableData: [],
      page: {
        pageNum: 1,
        pageSize: 20,
        total: 0
      },
      dialogVisible: false,
      dialogTitle: '新增规则',
      formData: {
        warnMergeId: null,
        ruleName: '',
        srcFaultTypeIds: [],
        dstFaultTypeId: null,
        timeWindow: 60,
        ruleMemo: ''
      },
      formRules: {
        ruleName: [
          {required: true, message: '请输入规则名称', trigger: 'blur'}
        ],
        srcFaultTypeIds: [
          {required: true, message: '请选择源告警类型', trigger: 'change'}
        ],
        dstFaultTypeId: [
          {required: true, message: '请选择目标告警类型', trigger: 'change'}
        ],
        timeWindow: [
          {required: true, message: '请输入时间窗口', trigger: 'blur'}
        ]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const payload = {
          pageNum: this.page.pageNum,
          pageSize: this.page.pageSize,
          ...this.queryForm
        }
        const res = await mainPage('warnMerge', payload)
        this.tableData = res.data || res.list || []
        this.page.total = res.recordsTotal || res.total || 0
      } catch (e) {
        console.error('加载告警归并规则失败:', e)
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
      this.queryForm = {
        ruleName: ''
      }
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
      this.dialogTitle = type === 'add' ? '新增规则' : '编辑规则'
      if (type === 'edit' && row) {
        let srcFaultTypeIds = []
        if (row.srcFaultTypeIds) {
          const ids = row.srcFaultTypeIds.split(',').map(Number)
          srcFaultTypeIds = ids.map(id => [id])
        }

        let dstFaultTypeId = null
        if (row.dstFaultTypeId) {
          dstFaultTypeId = row.dstFaultTypeId
        }

        this.formData = {
          warnMergeId: row.warnMergeId,
          ruleName: row.ruleName,
          srcFaultTypeIds: srcFaultTypeIds,
          dstFaultTypeId: dstFaultTypeId,
          timeWindow: row.timeWindow || 60,
          ruleMemo: row.ruleMemo || ''
        }
      } else {
        this.formData = {
          warnMergeId: null,
          ruleName: '',
          srcFaultTypeIds: [],
          dstFaultTypeId: null,
          timeWindow: 60,
          ruleMemo: ''
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
          const submitData = {
            ...this.formData,
            srcFaultTypeIds: this.formData.srcFaultTypeIds
              .map(path => (Array.isArray(path) ? path[path.length - 1] : path))
              .join(','),
            dstFaultTypeId: Array.isArray(this.formData.dstFaultTypeId)
              ? this.formData.dstFaultTypeId[
                  this.formData.dstFaultTypeId.length - 1
                ]
              : this.formData.dstFaultTypeId
          }

          if (this.formData.warnMergeId) {
            await apiUpdate('warnMerge', submitData)
            this.$message.success('修改成功')
          } else {
            await apiAdd('warnMerge', submitData)
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
      this.$confirm(`确定要删除规则 [${row.ruleName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await apiDelete('warnMerge', row.warnMergeId)
            this.$message.success('删除成功')
            this.loadData()
          } catch (e) {
            console.error('删除失败:', e)
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '--'
      const date = new Date(dateTime)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString('zh-CN', {
        hour12: false
      })}`
    }
  }
}
</script>

<style scoped>
.warn-merge-container {
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
