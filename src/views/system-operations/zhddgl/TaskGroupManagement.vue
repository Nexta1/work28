<template>
  <div class="screen-container">
    <!-- 顶部操作栏 -->
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">任务群组管理</span>

        <div class="search-item">
          <label>群组名称</label>
          <el-input
            v-model="queryParam.QZMC"
            @input="loadGroupList"
            placeholder="输入群组名称搜索..."
            style="width: 200px"
            size="small"
          />
        </div>

        <div class="search-item">
          <label>关联任务</label>
          <el-select
            v-model="queryParam.ZZRWID"
            placeholder="选择任务"
            clearable
            size="mini"
            style="width: 180px"
            @change="loadGroupList"
          >
            <el-option label="全部任务" value=""></el-option>
            <el-option
              v-for="task in taskOptions"
              :key="task.ZZRWID"
              :label="task.RWMC"
              :value="task.ZZRWID"
            ></el-option>
          </el-select>
        </div>

        <div class="search-item">
          <label>群组状态</label>
          <el-select
            v-model="queryParam.STATUS"
            placeholder="选择状态"
            clearable
            size="mini"
            style="width: 120px"
            @change="loadGroupList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="已建立" value="1"></el-option>
            <el-option label="运行中" value="2"></el-option>
            <el-option label="已撤销" value="3"></el-option>
          </el-select>
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          class="action-btn"
          @click="handleCreateGroup"
        >
          新建群组
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="loadGroupList"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <!-- 左侧任务与平台信息 -->
      <div class="left-info-panel">
        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">
              <Icon
                icon="lucide:swords"
                :size="14"
                style="vertical-align: middle; margin-right: 4px"
              />
              作战任务
            </span>
          </div>
          <div class="task-list">
            <div
              v-for="task in taskList"
              :key="task.ZZRWID"
              class="task-item"
              :class="{
                active: selectedTask && selectedTask.ZZRWID === task.ZZRWID
              }"
              @click="selectTask(task)"
            >
              <div class="task-name ellipsis-text" :title="task.RWMC">
                {{ task.RWMC }}
              </div>
              <div class="task-meta">
                <span class="task-id">{{ task.ZZRWID }}</span>
                <el-tag size="mini" :type="getTaskStateType(task.STATE)">
                  {{ getTaskStateText(task.STATE) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-header">
            <span class="section-title">
              <Icon
                icon="lucide:cpu"
                :size="14"
                style="vertical-align: middle; margin-right: 4px"
              />
              可用作战平台
            </span>
            <span class="badge">{{ platformList.length }} 个</span>
          </div>
          <div class="platform-scroll">
            <div
              v-for="platform in platformList"
              :key="platform.PTID"
              class="platform-item"
            >
              <div class="platform-header">
                <span class="platform-name">{{ platform.PTMC }}</span>
                <span
                  class="platform-status"
                  :class="
                    platform.ZT === '1' ? 'status-online' : 'status-offline'
                  "
                >
                  {{ platform.ZT === '1' ? '在线' : '离线' }}
                </span>
              </div>
              <div class="platform-info">
                <span>ID: {{ platform.PTID }}</span>
                <span>类型: {{ platform.PTLX }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧群组列表 -->
      <div class="right-table-panel">
        <el-table
          :data="groupList"
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
          <el-table-column prop="QZMC" label="群组名称" min-width="160">
            <template slot-scope="scope">
              <span class="text-blue ellipsis-text" :title="scope.row.QZMC">
                {{ scope.row.QZMC }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="QZID" label="群组ID" width="120">
            <template slot-scope="scope">
              <span class="font-num text-cyan">{{ scope.row.QZID }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="RWMC" label="关联任务" min-width="150">
            <template slot-scope="scope">
              <span class="ellipsis-text" :title="scope.row.RWMC">
                {{ scope.row.RWMC }}
              </span>
            </template>
          </el-table-column>
          <el-table-column
            prop="PTSL"
            label="平台数量"
            width="90"
            align="center"
          >
            <template slot-scope="scope">
              <span class="text-orange font-num">{{ scope.row.PTSL }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="STATUS" label="群组状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getGroupStatusType(scope.row.STATUS)" size="mini">
                {{ getGroupStatusText(scope.row.STATUS) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="CREATE_TIME" label="创建时间" width="160">
            <template slot-scope="scope">
              {{ formatTime(scope.row.CREATE_TIME) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
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
                icon="el-icon-edit"
                class="btn-modify"
                @click="handleEditGroup(scope.row)"
                :disabled="scope.row.STATUS === '3'"
              >
                修改
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
                class="btn-release"
                @click="handleDeleteGroup(scope.row)"
                :disabled="scope.row.STATUS === '3'"
              >
                撤销
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

    <!-- 新建/编辑群组对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="800px"
      custom-class="dark-dialog-clean"
      append-to-body
    >
      <el-form
        ref="groupForm"
        :model="groupForm"
        :rules="groupRules"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="群组名称" prop="QZMC">
          <el-input
            v-model="groupForm.QZMC"
            placeholder="请输入群组名称"
          ></el-input>
        </el-form-item>

        <el-form-item label="关联任务" prop="ZZRWID">
          <el-select
            v-model="groupForm.ZZRWID"
            placeholder="请选择作战任务"
            style="width: 100%"
          >
            <el-option
              v-for="task in taskOptions"
              :key="task.ZZRWID"
              :label="task.RWMC"
              :value="task.ZZRWID"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="选择平台" prop="platformIds">
          <el-transfer
            v-model="groupForm.platformIds"
            :data="transferData"
            :titles="['可用平台', '已选平台']"
            :button-texts="['移除', '添加']"
            filterable
            filter-placeholder="搜索平台"
          ></el-transfer>
        </el-form-item>

        <el-form-item label="群组描述">
          <el-input
            v-model="groupForm.QZMS"
            type="textarea"
            :rows="3"
            placeholder="请输入群组描述"
          ></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" size="mini" @click="handleSubmitGroup">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {taskGetPage} from '@/api/task'
import {apiGetAll} from '@/api/common'

export default {
  name: 'TaskGroupManagement',
  data() {
    return {
      loading: false,
      groupList: [],
      taskList: [],
      platformList: [],
      taskOptions: [],
      queryParam: {
        QZMC: '',
        ZZRWID: '',
        STATUS: ''
      },
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      selectedTask: null,
      dialogVisible: false,
      dialogTitle: '新建任务群组',
      groupForm: {
        QZID: '',
        QZMC: '',
        ZZRWID: '',
        QZMS: '',
        platformIds: []
      },
      groupRules: {
        QZMC: [{required: true, message: '请输入群组名称', trigger: 'blur'}],
        ZZRWID: [
          {required: true, message: '请选择关联任务', trigger: 'change'}
        ],
        platformIds: [
          {
            required: true,
            message: '请至少选择一个平台',
            trigger: 'change',
            type: 'array'
          }
        ]
      },
      transferData: []
    }
  },
  mounted() {
    this.loadGroupList()
    this.loadTaskList()
    this.loadPlatformList()
  },
  methods: {
    loadGroupList() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        this.groupList = [
          {
            QZID: 'QZ001',
            QZMC: '红剑突击群',
            ZZRWID: 'RW001',
            RWMC: '红剑-2024演习',
            PTSL: 8,
            STATUS: '2',
            CREATE_TIME: Date.now() - 3600000
          },
          {
            QZID: 'QZ002',
            QZMC: '蓝盾防御群',
            ZZRWID: 'RW002',
            RWMC: '蓝盾行动',
            PTSL: 5,
            STATUS: '1',
            CREATE_TIME: Date.now() - 7200000
          },
          {
            QZID: 'QZ003',
            QZMC: '雷霆侦察群',
            ZZRWID: 'RW001',
            RWMC: '红剑-2024演习',
            PTSL: 3,
            STATUS: '3',
            CREATE_TIME: Date.now() - 86400000
          }
        ]
        this.pagination.total = this.groupList.length
        this.loading = false
      }, 500)
    },
    loadTaskList() {
      taskGetPage({pageNum: 1, pageSize: 50}).then(res => {
        this.taskList = res.data?.list || res.data || []
        this.taskOptions = this.taskList.map(task => ({
          ZZRWID: task.ZZRWID,
          RWMC: task.RWMC
        }))
      })
    },
    loadPlatformList() {
      apiGetAll('ptxx', {}, 'ptxxs').then(res => {
        this.platformList = res.data || []
        this.transferData = this.platformList.map(platform => ({
          key: platform.PTID,
          label: `${platform.PTMC} (${platform.PTID})`,
          disabled: platform.ZT !== '1'
        }))
      })
    },
    selectTask(task) {
      this.selectedTask = task
      this.queryParam.ZZRWID = task.ZZRWID
      this.loadGroupList()
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
    getGroupStatusType(status) {
      const typeMap = {
        1: 'success',
        2: 'primary',
        3: 'info'
      }
      return typeMap[status] || 'info'
    },
    getGroupStatusText(status) {
      const textMap = {
        1: '已建立',
        2: '运行中',
        3: '已撤销'
      }
      return textMap[status] || '未知'
    },
    handleCreateGroup() {
      this.dialogTitle = '新建任务群组'
      this.groupForm = {
        QZID: '',
        QZMC: '',
        ZZRWID: '',
        QZMS: '',
        platformIds: []
      }
      this.dialogVisible = true
    },
    handleEditGroup(row) {
      this.dialogTitle = '修改任务群组'
      this.groupForm = {
        QZID: row.QZID,
        QZMC: row.QZMC,
        ZZRWID: row.ZZRWID,
        QZMS: row.QZMS || '',
        platformIds: [] // 实际应从后端获取已选平台ID列表
      }
      this.dialogVisible = true
    },
    handleDeleteGroup(row) {
      this.$confirm(`确定要撤销群组「${row.QZMC}」吗？`, '确认撤销', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('群组撤销成功')
          this.loadGroupList()
        })
        .catch(() => {})
    },
    handleViewDetail(row) {
      this.$message.info('群组详情功能开发中...')
    },
    handleSubmitGroup() {
      this.$refs.groupForm.validate(valid => {
        if (valid) {
          this.$message.success(this.groupForm.QZID ? '修改成功' : '创建成功')
          this.dialogVisible = false
          this.loadGroupList()
        }
      })
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.pageNum = 1
      this.loadGroupList()
    },
    handlePageChange(val) {
      this.pagination.pageNum = val
      this.loadGroupList()
    }
  }
}
</script>

<style scoped lang="scss">
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

.left-info-panel {
  width: 320px;
  flex-shrink: 0;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.panel-section {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 12px;
  border-bottom: 1px solid #17263d;
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.badge {
  font-size: 11px;
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  padding: 1px 6px;
  border-radius: 4px;
}

.task-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
}

.task-item {
  padding: 8px;
  margin-bottom: 6px;
  background: #080e18;
  border: 1px solid #172438;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.task-item:hover {
  border-color: #38bdf8;
}

.task-item.active {
  border-color: #38bdf8;
  background: #13253e;
}

.task-name {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 9px;
}

.task-id {
  color: #64748b;
  font-family: monospace;
}

.platform-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.platform-item {
  padding: 8px;
  margin-bottom: 6px;
  background: #080e18;
  border: 1px solid #172438;
  border-radius: 4px;
}

.platform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.platform-name {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.platform-status {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
}

.status-online {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-offline {
  background: rgba(100, 116, 139, 0.2);
  color: #64748b;
}

.platform-info {
  display: flex;
  gap: 12px;
  font-size: 9px;
  color: #64748b;
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

.text-blue {
  color: #38bdf8 !important;
}

.text-cyan {
  color: #06b6d4 !important;
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

.btn-release {
  color: #f43f5e !important;
}

::v-deep .el-transfer {
  .el-transfer-panel {
    background: #0d1522;
    border: 1px solid #172438;
  }

  .el-transfer-panel__header {
    background: #080e18;
    border-bottom: 1px solid #17263d;
    color: #fff;
  }

  .el-transfer-panel__body {
    background: #0d1522;
  }

  .el-transfer-panel__item {
    color: #cbd5e1;
  }

  .el-transfer-panel__item:hover {
    background: #162235;
  }

  .el-checkbox__label {
    color: #cbd5e1;
  }
}
</style>
