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

        <el-table-column
          prop="timeWindow"
          label="时间窗口(秒)"
          width="120"
          align="center"
        />

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
      width="600px"
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
              value: 'faultTypeId',
              label: 'faultName',
              children: 'children',
              checkStrictly: true,
              multiple: true
            }"
            placeholder="请选择源故障类型"
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

        <el-form-item label="时间窗口" prop="timeWindow">
          <el-input-number
            v-model="formData.timeWindow"
            :min="1"
            :max="3600"
            placeholder="请输入时间窗口（秒）"
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
import {mainPage, mainDelete, apiAdd, apiUpdate} from '@/api/common'

export default {
  name: 'WarnMerge',
  props: {
    // 故障类型选项列表（由父组件传递）
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
    // 加载分页数据
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

    // 搜索
    handleSearch() {
      this.page.pageNum = 1
      this.loadData()
    },

    // 重置查询
    resetQuery() {
      this.queryForm = {
        ruleName: ''
      }
      this.handleSearch()
    },

    // 分页大小变化
    handleSizeChange(val) {
      this.page.pageSize = val
      this.loadData()
    },

    // 页码变化
    handleCurrentChange(val) {
      this.page.pageNum = val
      this.loadData()
    },

    // 打开对话框
    openDialog(type, row = null) {
      this.dialogTitle = type === 'add' ? '新增规则' : '编辑规则'
      if (type === 'edit' && row) {
        // 编辑模式：填充表单数据
        
        // 处理源故障类型ID，将逗号分隔字符串转换为级联选择器需要的路径数组格式
        let srcFaultTypeIds = []
        if (row.srcFaultTypeIds) {
          const ids = Array.isArray(row.srcFaultTypeIds)
            ? row.srcFaultTypeIds
            : row.srcFaultTypeIds.split(',').map(Number)
          
          srcFaultTypeIds = ids.map(id => [id])
        }

        // 处理目标故障类型ID，转换为级联选择器路径数组
        let dstFaultTypeId = null
        if (row.dstFaultTypeId) {
          dstFaultTypeId = [row.dstFaultTypeId]
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
        // 新增模式：重置表单
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

    // 提交表单
    handleSubmit() {
      this.$refs.form.validate(async valid => {
        if (!valid) return

        try {
          // 准备提交数据，将数组转换回逗号分隔的字符串
          const submitData = {
            ...this.formData,
            // 源故障类型 ID：级联选择器返回的是路径数组 [[id1], [id2]]，需要提取最后一个元素并转字符串
            srcFaultTypeIds: Array.isArray(this.formData.srcFaultTypeIds)
              ? this.formData.srcFaultTypeIds
                  .map(path =>
                    Array.isArray(path) ? path[path.length - 1] : path
                  )
                  .join(',')
              : this.formData.srcFaultTypeIds,
            // 目标故障类型 ID：从路径数组中提取最后一个元素
            dstFaultTypeId: Array.isArray(this.formData.dstFaultTypeId)
              ? this.formData.dstFaultTypeId[this.formData.dstFaultTypeId.length - 1]
              : this.formData.dstFaultTypeId
          }

          if (this.formData.warnMergeId) {
            // 编辑
            await apiUpdate('warnMerge', submitData)
            this.$message.success('修改成功')
          } else {
            // 新增
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

    // 删除
    handleDelete(row) {
      this.$confirm(`确定要删除规则 [${row.ruleName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await mainDelete('warnMerge', row.warnMergeId)
            this.$message.success('删除成功')
            this.loadData()
          } catch (e) {
            console.error('删除失败:', e)
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },

    // 格式化日期时间
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
/* ===================================================================
   🛰️ 战术控制中心 - 告警归并规则管理样式
   =================================================================== */
.warn-merge-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
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

/* --- 按钮样式微调 --- */
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
