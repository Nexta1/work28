<template>
  <div class="warn-clear-container">
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

        <el-form-item label="是否自动">
          <el-select
            v-model="queryForm.isAuto"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="请输入关键词"
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
          prop="warnClearId"
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
          label="告警类型列表"
          min-width="200"
          align="center"
          show-overflow-tooltip
        />

        <el-table-column label="时间范围" width="180" align="center">
          <template slot-scope="scope">
            {{ formatTimeRange(scope.row.timeBegin, scope.row.timeEnd) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="deviceTypes"
          label="设备类型列表"
          width="150"
          align="center"
          show-overflow-tooltip
        />

        <el-table-column
          prop="keyword"
          label="关键词"
          width="120"
          align="center"
          show-overflow-tooltip
        />

        <el-table-column label="是否自动" width="100" align="center">
          <template slot-scope="scope">
            <span
              :class="[
                'custom-auto-badge',
                scope.row.isAuto === '1' ? 'auto-yes' : 'auto-no'
              ]"
            >
              {{ scope.row.isAuto === '1' ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>

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

        <el-form-item label="故障类型" prop="srcFaultTypeIds">
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
            placeholder="请选择故障类型"
            clearable
            filterable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="时间范围" prop="timeRange">
          <el-time-picker
            v-model="formData.timeBegin"
            placeholder="开始时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 45%; margin-right: 10px"
          />
          <span style="margin: 0 5px">至</span>
          <el-time-picker
            v-model="formData.timeEnd"
            placeholder="结束时间"
            format="HH:mm:ss"
            value-format="HH:mm:ss"
            style="width: 45%"
          />
        </el-form-item>

        <el-form-item label="设备类型" prop="deviceTypes">
          <el-select
            v-model="formData.deviceTypes"
            multiple
            filterable
            placeholder="请选择设备"
            style="width: 100%"
          >
            <el-option
              v-for="item in deviceOptions"
              :key="item.sbxxId"
              :label="item.sbmc"
              :value="item.sbxxId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="关键词" prop="keyword">
          <el-input
            v-model="formData.keyword"
            placeholder="请输入关键词"
            clearable
          />
        </el-form-item>

        <el-form-item label="是否自动清除" prop="isAuto">
          <el-radio-group v-model="formData.isAuto">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
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
  name: 'WarnClear',
  props: {
    // 故障类型选项列表（由父组件传递）
    faultTypeOptions: {
      type: Array,
      default: () => []
    },
    // 设备信息列表（由父组件传递）
    deviceOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      queryForm: {
        ruleName: '',
        isAuto: '',
        keyword: ''
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
        warnClearId: null,
        ruleName: '',
        srcFaultTypeIds: [],
        timeBegin: '',
        timeEnd: '',
        deviceTypes: '',
        keyword: '',
        isAuto: '1'
      },
      formRules: {
        ruleName: [
          {required: true, message: '请输入规则名称', trigger: 'blur'}
        ],
        srcFaultTypeIds: [
          {required: true, message: '请选择告警类型', trigger: 'change'}
        ],
        timeBegin: [
          {required: true, message: '请选择开始时间', trigger: 'change'}
        ],
        timeEnd: [
          {required: true, message: '请选择结束时间', trigger: 'change'}
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
        const res = await mainPage('warnClear', payload)
        this.tableData = res.data || res.list || []
        this.page.total = res.recordsTotal || res.total || 0
      } catch (e) {
        console.error('加载告警清除规则失败:', e)
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
        ruleName: '',
        isAuto: '',
        keyword: ''
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

        // 处理故障类型ID，将逗号分隔字符串转换为级联选择器需要的路径数组格式
        let faultTypeIds = []
        if (row.srcFaultTypeIds) {
          // 假设后端存储的是 faultTypeId 的逗号分隔字符串
          const ids = Array.isArray(row.srcFaultTypeIds)
            ? row.srcFaultTypeIds
            : row.srcFaultTypeIds.split(',').map(Number)

          // 将扁平的 ID 数组转换为级联选择器需要的路径数组
          // 例如: [1, 2, 3] -> [[1], [2], [3]] 或根据实际层级结构转换
          faultTypeIds = ids.map(id => [id])
        }

        // 处理设备类型ID，确保为数组格式以适配 select multiple
        let deviceIds = []
        if (row.deviceTypes) {
          deviceIds = Array.isArray(row.deviceTypes)
            ? row.deviceTypes
            : row.deviceTypes.split(',').map(item => {
                const num = Number(item)
                return isNaN(num) ? item : num
              })
        }

        this.formData = {
          warnClearId: row.warnClearId,
          ruleName: row.ruleName,
          srcFaultTypeIds: faultTypeIds,
          timeBegin: row.timeBegin,
          timeEnd: row.timeEnd,
          deviceTypes: deviceIds,
          keyword: row.keyword || '',
          isAuto: row.isAuto || '1'
        }
      } else {
        // 新增模式：重置表单
        this.formData = {
          warnClearId: null,
          ruleName: '',
          srcFaultTypeIds: [],
          timeBegin: '',
          timeEnd: '',
          deviceTypes: [],
          keyword: '',
          isAuto: '1'
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
            // 故障类型 ID：级联选择器返回的是路径数组 [[id1], [id2]]，需要提取最后一个元素并转字符串
            srcFaultTypeIds: Array.isArray(this.formData.srcFaultTypeIds)
              ? this.formData.srcFaultTypeIds
                  .map(path =>
                    Array.isArray(path) ? path[path.length - 1] : path
                  )
                  .join(',')
              : this.formData.srcFaultTypeIds,
            // 设备类型 ID 数组转字符串
            deviceTypes: Array.isArray(this.formData.deviceTypes)
              ? this.formData.deviceTypes.join(',')
              : this.formData.deviceTypes
          }

          if (this.formData.warnClearId) {
            // 编辑
            await apiUpdate('warnClear', submitData)
            this.$message.success('修改成功')
          } else {
            // 新增
            await apiAdd('warnClear', submitData)
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
            await mainDelete('warnClear', row.warnClearId)
            this.$message.success('删除成功')
            this.loadData()
          } catch (e) {
            console.error('删除失败:', e)
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },

    // 格式化时间范围
    formatTimeRange(begin, end) {
      if (!begin || !end) return '--'
      return `${begin} - ${end}`
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
   🛰️ 战术控制中心 - 告警清除规则管理样式
   =================================================================== */
.warn-clear-container {
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

/* --- 自定义自动清除标识样式 --- */
.custom-auto-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 500;
  font-family: monospace, 'Microsoft YaHei';
  border: 1px solid transparent;
}

.auto-yes {
  background-color: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  border-color: rgba(16, 185, 129, 0.6);
} /* 是 - 战术绿 */

.auto-no {
  background-color: rgba(51, 65, 85, 0.2);
  color: #64748b;
  border-color: rgba(51, 65, 85, 0.4);
} /* 否 - 深灰蓝 */

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
