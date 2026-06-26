<template>
  <div class="screen-container">
    <!-- 顶部标题栏 -->
    <div class="top-search-header">
      <span class="hub-title">装备维护测试</span>
    </div>

    <div class="main-body-layout">
      <div class="right-combined-panel">
        <el-tabs v-model="activeTab" class="dark-tabs fill-tabs">
          <!-- 测试方案维护 -->
          <el-tab-pane name="testPlan" class="full-pane">
            <span slot="label">
              <Icon icon="lucide:clipboard-list" :size="14" style="margin-right: 4px" />
              测试方案维护
            </span>
            <div class="pane-content-box">
              <!-- 操作栏 -->
              <div class="toolbar-row">
                <div class="toolbar-left">
                  <el-input
                    v-model="planSearch.planName"
                    placeholder="输入方案名称搜索..."
                    size="small"
                    style="width: 220px"
                    clearable
                    @input="searchTestPlans"
                  />
                </div>
                <div class="toolbar-right">
                  <el-button type="primary" size="mini" icon="el-icon-plus" @click="openPlanAddDialog">
                    新增方案
                  </el-button>
                </div>
              </div>

              <!-- 表格 -->
              <el-table
                :data="planTableData"
                border
                stripe
                size="mini"
                style="width: 100%; flex: 1"
                v-loading="planLoading"
                height="100%"
              >
                <el-table-column type="index" label="序号" width="50" />
                <el-table-column prop="testPlanId" label="方案ID" width="70">
                  <template slot-scope="scope">
                    <span class="text-blue font-num">{{ scope.row.testPlanId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="planName" label="方案名称" min-width="180">
                  <template slot-scope="scope">
                    <span class="text-cyan">{{ scope.row.planName }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="160">
                  <template slot-scope="scope">{{ scope.row.createTime || '--' }}</template>
                </el-table-column>
                <el-table-column prop="updateTime" label="更新时间" width="160">
                  <template slot-scope="scope">{{ scope.row.updateTime || '--' }}</template>
                </el-table-column>
                <el-table-column prop="runMs" label="运行时长(ms)" width="110">
                  <template slot-scope="scope">{{ scope.row.runMs || '--' }}</template>
                </el-table-column>
                <el-table-column prop="runStatus" label="运行状态" width="90">
                  <template slot-scope="scope">
                    <el-tag size="mini" :type="getRunStatusType(scope.row.runStatus)">
                      {{ getRunStatusText(scope.row.runStatus) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="opTime" label="操作时间" width="160">
                  <template slot-scope="scope">{{ scope.row.opTime || '--' }}</template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" class="btn-modify" @click="openPlanEditDialog(scope.row)">
                      修改
                    </el-button>
                    <el-button type="text" size="mini" style="color: #f43f5e" @click="handleDeletePlan(scope.row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <el-pagination
                class="table-pagination"
                background
                small
                layout="total, prev, pager, next"
                :total="planPagination.total"
                :current-page="planPagination.pageNum"
                :page-size="planPagination.pageSize"
                @current-change="handlePlanPageChange"
              />
            </div>
          </el-tab-pane>

          <!-- 测试设备维护 -->
          <el-tab-pane name="testDevice" class="full-pane">
            <span slot="label">
              <Icon icon="lucide:cpu" :size="14" style="margin-right: 4px" />
              测试设备维护
            </span>
            <div class="pane-content-box">
              <!-- 操作栏 -->
              <div class="toolbar-row">
                <div class="toolbar-left">
                  <el-select
                    v-model="deviceSearch.planName"
                    placeholder="按方案名称筛选"
                    size="small"
                    clearable
                    style="width: 220px"
                    @change="searchTestDevices"
                  >
                    <el-option
                      v-for="plan in planNameOptions"
                      :key="plan.testPlanId"
                      :label="plan.planName"
                      :value="plan.planName"
                    />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <el-button type="primary" size="mini" icon="el-icon-plus" @click="openDeviceAddDialog">
                    新增关联
                  </el-button>
                </div>
              </div>

              <!-- 表格 -->
              <el-table
                :data="deviceTableData"
                border
                stripe
                size="mini"
                style="width: 100%; flex: 1"
                v-loading="deviceLoading"
                height="100%"
              >
                <el-table-column type="index" label="序号" width="50" />
                <el-table-column prop="testComponentId" label="关联ID" width="70">
                  <template slot-scope="scope">
                    <span class="text-blue font-num">{{ scope.row.testComponentId }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="planName" label="所属方案" min-width="160">
                  <template slot-scope="scope">
                    <span class="text-cyan">{{ scope.row.planName || '--' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="SBMC" label="设备名称" min-width="140">
                  <template slot-scope="scope">{{ scope.row.SBMC || '--' }}</template>
                </el-table-column>
                <el-table-column prop="SBID" label="设备ID" width="80">
                  <template slot-scope="scope">
                    <span class="text-green font-num">{{ scope.row.SBID }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="opUserName" label="操作人" width="100">
                  <template slot-scope="scope">{{ scope.row.opUserName || '--' }}</template>
                </el-table-column>
                <el-table-column prop="opTime" label="操作时间" width="160">
                  <template slot-scope="scope">{{ scope.row.opTime || '--' }}</template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" size="mini" class="btn-modify" @click="openDeviceEditDialog(scope.row)">
                      修改
                    </el-button>
                    <el-button type="text" size="mini" style="color: #f43f5e" @click="handleDeleteDevice(scope.row)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
              <el-pagination
                class="table-pagination"
                background
                small
                layout="total, prev, pager, next"
                :total="devicePagination.total"
                :current-page="devicePagination.pageNum"
                :page-size="devicePagination.pageSize"
                @current-change="handleDevicePageChange"
              />
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 测试方案 新增/修改 对话框 -->
    <el-dialog
      :title="planDialogMode === 'add' ? '新增测试方案' : '修改测试方案'"
      :visible.sync="planDialogVisible"
      width="480px"
      custom-class="dark-dialog-clean"
      append-to-body
      @close="resetPlanForm"
    >
      <el-form ref="planForm" :model="planForm" :rules="planFormRules" label-width="90px" size="small">
        <el-form-item label="方案名称" prop="planName">
          <el-input v-model="planForm.planName" placeholder="请输入方案名称" />
        </el-form-item>
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="planForm.createTime"
            type="datetime"
            placeholder="选择创建时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="planDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" :loading="planSubmitLoading" @click="submitPlanForm">
          确定
        </el-button>
      </span>
    </el-dialog>

    <!-- 测试设备 新增/修改 对话框 -->
    <el-dialog
      :title="deviceDialogMode === 'add' ? '新增设备关联' : '修改设备关联'"
      :visible.sync="deviceDialogVisible"
      width="480px"
      custom-class="dark-dialog-clean"
      append-to-body
      @close="resetDeviceForm"
    >
      <el-form ref="deviceForm" :model="deviceForm" :rules="deviceFormRules" label-width="100px" size="small">
        <el-form-item label="测试方案" prop="testPlanId">
          <el-select v-model="deviceForm.testPlanId" placeholder="请选择测试方案" style="width: 100%">
            <el-option
              v-for="plan in planNameOptions"
              :key="plan.testPlanId"
              :label="plan.planName"
              :value="plan.testPlanId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="设备ID" prop="SBID">
          <el-input-number v-model="deviceForm.SBID" :min="1" placeholder="请输入设备ID" style="width: 100%" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="deviceDialogVisible = false">取消</el-button>
        <el-button type="primary" size="small" :loading="deviceSubmitLoading" @click="submitDeviceForm">
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getTestPlanPage,
  addTestPlan,
  updateTestPlan,
  deleteTestPlan,
  getAllTestPlans,
  getTestComponentPage,
  addTestComponent,
  updateTestComponent,
  deleteTestComponent
} from '@/api/datalinkAssurance'

export default {
  name: 'EquipmentMaintenance',
  data() {
    return {
      activeTab: 'testPlan',

      // ---- 测试方案 ----
      planLoading: false,
      planTableData: [],
      planPagination: { pageNum: 1, pageSize: 10, total: 0 },
      planSearch: { planName: '' },
      planDialogVisible: false,
      planDialogMode: 'add',
      planSubmitLoading: false,
      planForm: { testPlanId: null, planName: '', createTime: '' },
      planFormRules: {
        planName: [{ required: true, message: '请输入方案名称', trigger: 'blur' }],
        createTime: [{ required: true, message: '请选择创建时间', trigger: 'change' }]
      },
      planNameOptions: [],

      // ---- 测试设备 ----
      deviceLoading: false,
      deviceTableData: [],
      devicePagination: { pageNum: 1, pageSize: 10, total: 0 },
      deviceSearch: { planName: '' },
      deviceDialogVisible: false,
      deviceDialogMode: 'add',
      deviceSubmitLoading: false,
      deviceForm: { testComponentId: null, testPlanId: null, SBID: null },
      deviceFormRules: {
        testPlanId: [{ required: true, message: '请选择测试方案', trigger: 'change' }],
        SBID: [{ required: true, message: '请输入设备ID', trigger: 'blur' }]
      }
    }
  },
  watch: {
    activeTab(val) {
      if (val === 'testPlan') {
        this.fetchPlanPage()
        this.fetchAllPlans()
      } else if (val === 'testDevice') {
        this.fetchAllPlans()
        this.fetchDevicePage()
      }
    }
  },
  mounted() {
    this.fetchPlanPage()
    this.fetchAllPlans()
  },
  methods: {
    // ==================== 测试方案 ====================
    async fetchPlanPage() {
      this.planLoading = true
      try {
        const params = {}
        if (this.planSearch.planName) params.planName = this.planSearch.planName
        const res = await getTestPlanPage({
          pageNum: this.planPagination.pageNum,
          pageSize: this.planPagination.pageSize,
          params
        })
        if (res.code === 0) {
          this.planTableData = res.data.list || []
          this.planPagination.total = res.data.total || 0
        }
      } catch (e) {
        this.$message.error('查询测试方案失败')
      } finally {
        this.planLoading = false
      }
    },
    searchTestPlans() {
      this.planPagination.pageNum = 1
      this.fetchPlanPage()
    },
    handlePlanPageChange(page) {
      this.planPagination.pageNum = page
      this.fetchPlanPage()
    },
    openPlanAddDialog() {
      this.planDialogMode = 'add'
      this.planForm = { testPlanId: null, planName: '', createTime: '' }
      this.planDialogVisible = true
    },
    openPlanEditDialog(row) {
      this.planDialogMode = 'edit'
      this.planForm = {
        testPlanId: row.testPlanId,
        planName: row.planName,
        createTime: row.createTime
      }
      this.planDialogVisible = true
    },
    submitPlanForm() {
      this.$refs.planForm.validate(async (valid) => {
        if (!valid) return
        this.planSubmitLoading = true
        try {
          const payload = {
            planName: this.planForm.planName,
            createTime: this.planForm.createTime
          }
          let res
          if (this.planDialogMode === 'add') {
            res = await addTestPlan(payload)
          } else {
            payload.testPlanId = this.planForm.testPlanId
            res = await updateTestPlan(payload)
          }
          if (res.code === 200) {
            this.$message.success(this.planDialogMode === 'add' ? '新增成功' : '修改成功')
            this.planDialogVisible = false
            this.fetchPlanPage()
            this.fetchAllPlans()
          } else {
            this.$message.error(res.data || '操作失败')
          }
        } catch (e) {
          this.$message.error('操作失败')
        } finally {
          this.planSubmitLoading = false
        }
      })
    },
    handleDeletePlan(row) {
      this.$confirm(`确定删除方案「${row.planName}」？`, '确认删除', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async () => {
          try {
            const res = await deleteTestPlan(row.testPlanId)
            if (res.code === 200) {
              this.$message.success('删除成功')
              this.fetchPlanPage()
              this.fetchAllPlans()
            } else {
              this.$message.error(res.data || '删除失败')
            }
          } catch (e) {
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },
    resetPlanForm() {
      if (this.$refs.planForm) this.$refs.planForm.resetFields()
    },
    getRunStatusType(status) {
      return status === 1 ? 'warning' : status === 2 ? 'success' : 'info'
    },
    getRunStatusText(status) {
      return status === 1 ? '执行中' : status === 2 ? '已完成' : '--'
    },

    // ==================== 测试方案下拉 ====================
    async fetchAllPlans() {
      try {
        const res = await getAllTestPlans()
        if (res.code === 200 || res.code === 0) {
          this.planNameOptions = res.data || []
        }
      } catch (e) {
        // 静默处理
      }
    },

    // ==================== 测试设备 ====================
    async fetchDevicePage() {
      this.deviceLoading = true
      try {
        const params = {}
        if (this.deviceSearch.planName) params.planName = this.deviceSearch.planName
        const res = await getTestComponentPage({
          pageNum: this.devicePagination.pageNum,
          pageSize: this.devicePagination.pageSize,
          params
        })
        if (res.code === 0) {
          this.deviceTableData = res.data.list || []
          this.devicePagination.total = res.data.total || 0
        }
      } catch (e) {
        this.$message.error('查询测试设备失败')
      } finally {
        this.deviceLoading = false
      }
    },
    searchTestDevices() {
      this.devicePagination.pageNum = 1
      this.fetchDevicePage()
    },
    handleDevicePageChange(page) {
      this.devicePagination.pageNum = page
      this.fetchDevicePage()
    },
    openDeviceAddDialog() {
      this.deviceDialogMode = 'add'
      this.deviceForm = { testComponentId: null, testPlanId: null, SBID: null }
      this.deviceDialogVisible = true
    },
    openDeviceEditDialog(row) {
      this.deviceDialogMode = 'edit'
      this.deviceForm = {
        testComponentId: row.testComponentId,
        testPlanId: row.testPlanId,
        SBID: row.SBID
      }
      this.deviceDialogVisible = true
    },
    submitDeviceForm() {
      this.$refs.deviceForm.validate(async (valid) => {
        if (!valid) return
        this.deviceSubmitLoading = true
        try {
          const payload = {
            testPlanId: this.deviceForm.testPlanId,
            SBID: this.deviceForm.SBID
          }
          let res
          if (this.deviceDialogMode === 'add') {
            res = await addTestComponent(payload)
          } else {
            payload.testComponentId = this.deviceForm.testComponentId
            res = await updateTestComponent(payload)
          }
          if (res.code === 200) {
            this.$message.success(this.deviceDialogMode === 'add' ? '新增成功' : '修改成功')
            this.deviceDialogVisible = false
            this.fetchDevicePage()
          } else {
            this.$message.error(res.data || '操作失败')
          }
        } catch (e) {
          this.$message.error('操作失败')
        } finally {
          this.deviceSubmitLoading = false
        }
      })
    },
    handleDeleteDevice(row) {
      this.$confirm(`确定删除设备「${row.SBMC || row.SBID}」的关联？`, '确认删除', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async () => {
          try {
            const res = await deleteTestComponent(row.testComponentId)
            if (res.code === 200) {
              this.$message.success('删除成功')
              this.fetchDevicePage()
            } else {
              this.$message.error(res.data || '删除失败')
            }
          } catch (e) {
            this.$message.error('删除失败')
          }
        })
        .catch(() => {})
    },
    resetDeviceForm() {
      if (this.$refs.deviceForm) this.$refs.deviceForm.resetFields()
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
  padding: 0 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}

.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}

.right-combined-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.fill-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  min-height: 0;
}

::v-deep .fill-tabs .el-tabs__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: transparent !important;
}

::v-deep .dark-tabs .el-tabs__header {
  margin-bottom: 4px;
  border-bottom: 1px solid #17263d !important;
  background: transparent;
}

::v-deep .dark-tabs .el-tabs__nav-wrap::after {
  display: none !important;
}

::v-deep .dark-tabs .el-tabs__item {
  color: #94a3b8;
  font-size: 12px;
  font-weight: bold;
  height: 34px;
  line-height: 34px;
}

::v-deep .dark-tabs .el-tabs__item.is-active {
  color: #38bdf8 !important;
}

::v-deep .dark-tabs .el-tabs__active-bar {
  background-color: #38bdf8;
}

.full-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.pane-content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  gap: 8px;
}

/* 工具栏 */
.toolbar-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

/* 分页 */
.table-pagination {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

/* 文字颜色 */
.text-blue  { color: #38bdf8 !important; }
.text-cyan  { color: #06b6d4 !important; }
.text-green { color: #10b981 !important; }
.font-num   { font-family: monospace; }

.btn-modify { color: #38bdf8 !important; }
</style>
