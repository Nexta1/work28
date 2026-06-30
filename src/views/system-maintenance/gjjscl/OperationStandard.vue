<template>
  <div class="operation-standard-container">
    <div class="filter-control-bar">
      <el-form :inline="true" :model="queryForm" size="mini">
        <el-form-item label="标准名称">
          <el-input
            v-model="queryForm.standardName"
            placeholder="请输入标准名称"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="指标名称">
          <el-input
            v-model="queryForm.metricName"
            placeholder="请输入指标名称"
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
            >新增标准</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <div class="table-content-wrapper" v-loading="loading">
      <el-table :data="tableData" style="width: 100%" height="100%">
        <el-table-column
          prop="operationStandardId"
          label="标准ID"
          width="100"
          fixed
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="standardName"
          label="标准名称"
          width="180"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="metricName"
          label="指标名称"
          width="150"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="metricUnit"
          label="单位"
          width="80"
          align="center"
        />
        <el-table-column label="阈值范围" width="180" align="center">
          <template slot-scope="scope">
            {{
              formatThreshold(
                scope.row.lowerLimit,
                scope.row.upperLimit,
                scope.row.intervalType
              )
            }}
          </template>
        </el-table-column>

        <el-table-column label="质量状态" width="100" align="center">
          <template slot-scope="scope">
            <span
              :class="[
                'custom-state-badge',
                scope.row.qualityState === '绿色'
                  ? 'state-normal'
                  : 'state-abnormal'
              ]"
            >
              {{ scope.row.qualityState === '绿色' ? '正常' : '异常' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="是否告警" width="100" align="center">
          <template slot-scope="scope">
            <span
              :class="[
                'custom-warn-badge',
                scope.row.isWarn === '是' ? 'warn-yes' : 'warn-no'
              ]"
            >
              {{ scope.row.isWarn === '是' ? '是' : '否' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="faultName"
          label="故障类型"
          width="150"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          prop="standardMemo"
          label="标准描述"
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
      append-to-body
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
            <el-form-item label="标准名称" prop="standardName">
              <el-input
                v-model="formData.standardName"
                placeholder="请输入标准名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="关联指标" prop="operationMetricId">
              <el-select
                v-model="formData.operationMetricId"
                placeholder="请选择指标"
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="item in metricOptions"
                  :key="item.operationMetricId"
                  :label="item.metricName"
                  :value="item.operationMetricId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="下限值" prop="lowerLimit">
              <el-input-number
                v-model="formData.lowerLimit"
                :precision="2"
                placeholder="可选"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上限值" prop="upperLimit">
              <el-input-number
                v-model="formData.upperLimit"
                :precision="2"
                placeholder="可选"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="区间类型" prop="intervalType">
              <el-select
                v-model="formData.intervalType"
                placeholder="请选择区间类型"
                style="width: 100%"
              >
                <el-option
                  v-for="item in intervalTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="质量状态" prop="qualityState">
              <el-radio-group v-model="formData.qualityState">
                <el-radio
                  :label="i"
                  v-for="i in qualityStateOptions"
                  :key="i"
                  >{{ i }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否告警" prop="isWarn">
              <el-radio-group v-model="formData.isWarn">
                <el-radio label="是">是</el-radio>
                <el-radio label="否">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="告警级别" prop="warnLevel">
              <el-select
                v-model="formData.warnLevel"
                placeholder="请选择告警级别"
                :disabled="formData.isWarn !== '是'"
                style="width: 100%"
              >
                <el-option label="一般" :value="1" />
                <el-option label="中度" :value="2" />
                <el-option label="严重" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="故障类型" prop="faultTypeId">
          <el-cascader
            v-model="formData.faultTypeId"
            :options="faultTypeOptions"
            :props="{
              emitPath: false,
              value: 'faultTypeId',
              label: 'faultName',
              children: 'children',
              checkStrictly: true
            }"
            placeholder="请选择故障类型"
            clearable
            filterable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="标准描述" prop="standardMemo">
          <el-input
            v-model="formData.standardMemo"
            type="textarea"
            :rows="3"
            placeholder="请输入标准描述"
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
import {intervalTypes, qualityStates} from '@/api/maintenanceMap'

export default {
  name: 'OperationStandard',
  props: {
    faultTypeOptions: {type: Array, default: () => []},
    metricOptions: {type: Array, default: () => []}
  },
  data() {
    return {
      loading: false,
      queryForm: {standardName: '', metricName: ''},
      tableData: [],
      page: {pageNum: 1, pageSize: 20, total: 0},
      dialogVisible: false,
      dialogTitle: '新增标准',
      formData: {
        operationStandardId: null,
        operationMetricId: null,
        standardName: '',
        upperLimit: null,
        lowerLimit: null,
        intervalType: '',
        qualityState: '1',
        isWarn: '0',
        warnLevel: null,
        faultTypeId: null,
        standardMemo: ''
      },
      formRules: {
        standardName: [
          {required: true, message: '请输入标准名称', trigger: 'blur'}
        ],
        operationMetricId: [
          {required: true, message: '请选择关联指标', trigger: 'change'}
        ],
        intervalType: [
          {required: true, message: '请选择区间类型', trigger: 'change'}
        ]
      },
      intervalTypeOptions: [],
      qualityStateOptions: []
    }
  },
  mounted() {
    this.loadOptions()
    this.loadData()
  },
  methods: {
    async loadOptions() {
      try {
        const [intervalRes, qualityRes] = await Promise.all([
          intervalTypes(),
          qualityStates()
        ])
        this.intervalTypeOptions = intervalRes || []
        this.qualityStateOptions = qualityRes || []
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
        const res = await mainPage('operationStandard', payload)
        this.tableData = res.data || res.list || []
        this.page.total = res.recordsTotal || res.total || 0
      } catch (e) {
        console.error('加载业务质量标准失败:', e)
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
      this.queryForm = {standardName: '', metricName: ''}
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
      this.dialogTitle = type === 'add' ? '新增标准' : '编辑标准'
      if (type === 'edit' && row) {
        let faultTypeId = null
        if (row.faultTypeId) faultTypeId = [row.faultTypeId]
        this.formData = {
          operationStandardId: row.operationStandardId,
          operationMetricId: row.operationMetricId,
          standardName: row.standardName,
          upperLimit: row.upperLimit,
          lowerLimit: row.lowerLimit,
          intervalType: row.intervalType,
          qualityState: row.qualityState || '1',
          isWarn: row.isWarn || '0',
          warnLevel: row.warnLevel,
          faultTypeId: faultTypeId,
          standardMemo: row.standardMemo || ''
        }
      } else {
        this.formData = {
          operationStandardId: null,
          operationMetricId: null,
          standardName: '',
          upperLimit: null,
          lowerLimit: null,
          intervalType: '',
          qualityState: '1',
          isWarn: '0',
          warnLevel: null,
          faultTypeId: null,
          standardMemo: ''
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
            faultTypeId: Array.isArray(this.formData.faultTypeId)
              ? this.formData.faultTypeId[this.formData.faultTypeId.length - 1]
              : this.formData.faultTypeId
          }
          if (this.formData.operationStandardId) {
            await apiUpdate('operationStandard', submitData)
            this.$message.success('修改成功')
          } else {
            await apiAdd('operationStandard', submitData)
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
      this.$confirm(`确定要删除标准 [${row.standardName}] 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          try {
            await apiDelete('operationStandard', row.operationStandardId)
            this.$message.success('删除成功')
            this.loadData()
          } catch (e) {
            console.error('删除失败:', e)
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },

    formatThreshold(lowerLimit, upperLimit, intervalType) {
      if (lowerLimit === null && upperLimit === null) return '--'
      const lower = lowerLimit !== null ? lowerLimit.toFixed(2) : '-∞'
      const upper = upperLimit !== null ? upperLimit.toFixed(2) : '+∞'
      const symbolMap = {
        左闭右闭区间: ['[', ']'],
        左开右开区间: ['(', ')'],
        左闭右开区间: ['[', ')'],
        左开右闭区间: ['(', ']']
      }
      const [left, right] = symbolMap[intervalType] || ['[', ']']
      return `${left}${lower}, ${upper}${right}`
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
.operation-standard-container {
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

.custom-state-badge {
  display: inline-block;
  padding: 2px 11px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 500;
  font-family: monospace, 'Microsoft YaHei';
  border: 1px solid transparent;
}
.state-normal {
  background-color: rgba(16, 185, 129, 0.12);
  color: var(--color-success);
  border-color: rgba(16, 185, 129, 0.6);
}
.state-abnormal {
  background-color: rgba(244, 63, 94, 0.15);
  color: var(--color-danger);
  border-color: rgba(244, 63, 94, 0.5);
}

.custom-warn-badge {
  display: inline-block;
  padding: 2px 11px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 500;
  font-family: monospace, 'Microsoft YaHei';
  border: 1px solid transparent;
}
.warn-yes {
  background-color: rgba(245, 158, 11, 0.12);
  color: var(--color-warning);
  border-color: rgba(245, 158, 11, 0.6);
}
.warn-no {
  background-color: rgba(51, 65, 85, 0.2);
  color: #94a3b8;
  border-color: rgba(51, 65, 85, 0.4);
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
