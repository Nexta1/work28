<template>
  <div class="screen-container">
    <!-- 顶部操作栏 -->
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">装备维护</span>

        <div class="search-item">
          <label>装备名称</label>
          <el-input
            v-model="queryParam.EQUIPMENT_NAME"
            @input="loadEquipmentList"
            placeholder="输入装备名称搜索..."
            style="width: 200px"
            size="small"
          />
        </div>

        <div class="search-item">
          <label>维护状态</label>
          <el-select
            v-model="queryParam.STATUS"
            placeholder="选择状态"
            clearable
            size="mini"
            style="width: 120px"
            @change="loadEquipmentList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="待维护" value="pending"></el-option>
            <el-option label="维护中" value="maintaining"></el-option>
            <el-option label="已完成" value="completed"></el-option>
          </el-select>
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-document"
          class="action-btn"
          @click="handleGeneratePlan"
          :disabled="!hasSelectedEquipment"
        >
          生成维护方案
        </el-button>
        <el-button
          type="success"
          size="mini"
          icon="el-icon-s-promotion"
          class="action-btn"
          @click="handleSendToParallel"
          :disabled="!hasGeneratedPlans"
        >
          下发至平行系统
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="loadEquipmentList"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <!-- 左侧装备列表 -->
      <div class="left-equipment-panel">
        <div class="panel-header-summary">
          <span class="title">
            <Icon
              icon="lucide:cpu"
              :size="16"
              style="vertical-align: middle; margin-right: 4px"
            />
            装备列表
          </span>
          <span class="badge font-num text-cyan"
            >{{ equipmentList.length }} 项</span
          >
        </div>

        <div class="equipment-scroll-box">
          <div
            v-for="equip in equipmentList"
            :key="equip.EQUIPMENT_ID"
            class="equipment-item-card"
            :class="{
              'equipment-active': selectedEquipments.includes(
                equip.EQUIPMENT_ID
              )
            }"
            @click="toggleSelectEquipment(equip.EQUIPMENT_ID)"
          >
            <div class="equipment-card-header">
              <span
                class="equip-name ellipsis-text"
                :title="equip.EQUIPMENT_NAME"
              >
                <Icon
                  icon="lucide:package"
                  :size="12"
                  style="color: var(--color-primary); margin-right: 4px"
                />
                {{ equip.EQUIPMENT_NAME }}
              </span>
              <el-checkbox
                :value="selectedEquipments.includes(equip.EQUIPMENT_ID)"
                @click.native.stop
              ></el-checkbox>
            </div>

            <div class="equipment-card-body">
              <div class="meta-grid">
                <div>
                  装备ID:
                  <span class="text-blue font-num">{{
                    equip.EQUIPMENT_ID
                  }}</span>
                </div>
                <div>
                  类型:
                  <span class="text-green">{{ equip.EQUIPMENT_TYPE }}</span>
                </div>
                <div>
                  状态:
                  <el-tag size="mini" :type="getStatusType(equip.STATUS)">
                    {{ getStatusText(equip.STATUS) }}
                  </el-tag>
                </div>
                <div>
                  上次维护:
                  <span>{{ formatTime(equip.LAST_MAINTENANCE) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧功能面板 -->
      <div class="right-combined-panel">
        <el-tabs v-model="activeTab" class="dark-tabs fill-tabs">
          <!-- 维护方案生成 -->
          <el-tab-pane name="planGeneration" class="full-pane">
            <span slot="label">
              <Icon
                icon="lucide:file-plus"
                :size="14"
                style="margin-right: 4px"
              />
              维护方案生成
            </span>
            <div class="pane-content-box" style="height: 100%">
              <div class="plan-generation-container">
                <div class="generated-plans-list">
                  <div class="list-header">
                    <span class="list-title">已生成的维护方案</span>
                    <span class="list-count"
                      >{{ generatedPlans.length }} 个方案</span
                    >
                  </div>

                  <div class="plans-scroll-box">
                    <div
                      v-for="(plan, index) in generatedPlans"
                      :key="index"
                      class="plan-item"
                    >
                      <div class="plan-header">
                        <span class="plan-name">{{ plan.planName }}</span>
                        <el-tag
                          size="mini"
                          :type="getPlanStatusType(plan.status)"
                        >
                          {{ getPlanStatusText(plan.status) }}
                        </el-tag>
                      </div>
                      <div class="plan-info">
                        <div class="info-row">
                          <span class="info-label">装备:</span>
                          <span class="info-value">{{
                            plan.equipmentName
                          }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">维护类型:</span>
                          <span class="info-value">{{
                            plan.maintenanceType
                          }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">预计耗时:</span>
                          <span class="info-value text-orange">{{
                            plan.estimatedTime
                          }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">生成时间:</span>
                          <span class="info-value">{{
                            formatTime(plan.generateTime)
                          }}</span>
                        </div>
                      </div>
                      <div class="plan-actions">
                        <el-button
                          type="text"
                          size="mini"
                          icon="el-icon-view"
                          @click="handleViewPlanDetail(plan)"
                        >
                          查看详情
                        </el-button>
                        <el-button
                          type="text"
                          size="mini"
                          icon="el-icon-download"
                          @click="handleExportPlan(plan)"
                        >
                          导出方案
                        </el-button>
                      </div>
                    </div>

                    <div v-if="generatedPlans.length === 0" class="empty-state">
                      <Icon
                        icon="lucide:file-x"
                        :size="48"
                        style="color: #475569"
                      />
                      <p>暂无生成的维护方案</p>
                      <p class="empty-hint">请先选择装备并点击"生成维护方案"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 方案下发监控 -->
          <el-tab-pane name="planDispatch" class="full-pane">
            <span slot="label">
              <Icon icon="lucide:send" :size="14" style="margin-right: 4px" />
              方案下发监控
            </span>
            <div class="pane-content-box" style="height: 100%">
              <div class="dispatch-monitor-container">
                <div class="dispatch-status-overview">
                  <div class="status-card">
                    <div class="status-label">待下发</div>
                    <div class="status-value text-warning">
                      {{ dispatchStats.pending }}
                    </div>
                  </div>
                  <div class="status-card">
                    <div class="status-label">下发中</div>
                    <div class="status-value text-cyan">
                      {{ dispatchStats.sending }}
                    </div>
                  </div>
                  <div class="status-card">
                    <div class="status-label">已完成</div>
                    <div class="status-value text-success">
                      {{ dispatchStats.completed }}
                    </div>
                  </div>
                  <div class="status-card">
                    <div class="status-label">失败</div>
                    <div class="status-value text-danger">
                      {{ dispatchStats.failed }}
                    </div>
                  </div>
                </div>

                <div class="dispatch-log-section">
                  <div class="log-header">
                    <span class="log-title">下发日志</span>
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      @click="clearDispatchLogs"
                    >
                      清空日志
                    </el-button>
                  </div>
                  <div class="log-content" ref="dispatchLogContainer">
                    <div
                      v-for="(log, index) in dispatchLogs"
                      :key="index"
                      class="log-item"
                      :class="log.level"
                    >
                      <span class="log-time">{{ log.time }}</span>
                      <span class="log-message">{{ log.message }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 测试结果显示 -->
          <el-tab-pane name="testResults" class="full-pane">
            <span slot="label">
              <Icon
                icon="lucide:chart-bar"
                :size="14"
                style="margin-right: 4px"
              />
              测试结果显示
            </span>
            <div class="pane-content-box" style="height: 100%">
              <div class="test-results-container">
                <div class="results-filter-bar">
                  <div class="filter-item">
                    <label>装备筛选</label>
                    <el-select
                      v-model="resultFilter.equipmentId"
                      placeholder="选择装备"
                      clearable
                      size="mini"
                      style="width: 180px"
                    >
                      <el-option
                        v-for="equip in equipmentList"
                        :key="equip.EQUIPMENT_ID"
                        :label="equip.EQUIPMENT_NAME"
                        :value="equip.EQUIPMENT_ID"
                      ></el-option>
                    </el-select>
                  </div>
                  <div class="filter-item">
                    <label>测试结果</label>
                    <el-select
                      v-model="resultFilter.testResult"
                      placeholder="选择结果"
                      clearable
                      size="mini"
                      style="width: 120px"
                    >
                      <el-option label="全部" value=""></el-option>
                      <el-option label="通过" value="pass"></el-option>
                      <el-option label="不通过" value="fail"></el-option>
                      <el-option label="待检测" value="pending"></el-option>
                    </el-select>
                  </div>
                </div>

                <el-table
                  :data="filteredTestResults"
                  border
                  stripe
                  style="width: 100%"
                  height="100%"
                >
                  <el-table-column
                    type="index"
                    label="序号"
                    width="60"
                  ></el-table-column>
                  <el-table-column
                    prop="EQUIPMENT_NAME"
                    label="装备名称"
                    width="150"
                  >
                    <template slot-scope="scope">
                      <span class="text-blue">{{
                        scope.row.EQUIPMENT_NAME
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="TEST_ITEM"
                    label="测试项目"
                    min-width="180"
                  >
                    <template slot-scope="scope">
                      <span class="ellipsis-text" :title="scope.row.TEST_ITEM">
                        {{ scope.row.TEST_ITEM }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="TEST_RESULT"
                    label="测试结果"
                    width="100"
                  >
                    <template slot-scope="scope">
                      <el-tag
                        size="mini"
                        :type="getTestResultType(scope.row.TEST_RESULT)"
                      >
                        {{ getTestResultText(scope.row.TEST_RESULT) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="TEST_VALUE" label="测试值" width="120">
                    <template slot-scope="scope">
                      <span class="font-num">{{ scope.row.TEST_VALUE }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="STANDARD_VALUE"
                    label="标准值"
                    width="120"
                  >
                    <template slot-scope="scope">
                      <span class="font-num">{{
                        scope.row.STANDARD_VALUE
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="DEVIATION" label="偏差率" width="100">
                    <template slot-scope="scope">
                      <span :class="getDeviationClass(scope.row.DEVIATION)">
                        {{ scope.row.DEVIATION }}%
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="TEST_TIME"
                    label="测试时间"
                    width="160"
                  >
                    <template slot-scope="scope">
                      {{ formatTime(scope.row.TEST_TIME) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" fixed="right">
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="mini"
                        icon="el-icon-view"
                        class="btn-modify"
                        @click="handleViewTestDetail(scope.row)"
                      >
                        查看详情
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 方案详情对话框 -->
    <el-dialog
      title="维护方案详情"
      :visible.sync="planDetailDialogVisible"
      width="800px"
      custom-class="dark-dialog-clean"
    >
      <div v-if="currentPlan" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">方案名称:</span>
              <span class="detail-value">{{ currentPlan.planName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">装备名称:</span>
              <span class="detail-value">{{ currentPlan.equipmentName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">维护类型:</span>
              <span class="detail-value">{{
                currentPlan.maintenanceType
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">预计耗时:</span>
              <span class="detail-value text-orange">{{
                currentPlan.estimatedTime
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">优先级:</span>
              <el-tag
                size="small"
                :type="getPriorityType(currentPlan.priority)"
              >
                {{ getPriorityText(currentPlan.priority) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">生成时间:</span>
              <span class="detail-value">{{
                formatTime(currentPlan.generateTime)
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">维护内容</h4>
          <div class="maintenance-steps">
            <div
              v-for="(step, index) in currentPlan.steps"
              :key="index"
              class="step-item"
            >
              <span class="step-index">{{ index + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">所需资源</h4>
          <div class="resources-list">
            <div
              v-for="(resource, index) in currentPlan.resources"
              :key="index"
              class="resource-item"
            >
              <span class="resource-name">{{ resource.name }}</span>
              <span class="resource-quantity">{{ resource.quantity }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'EquipmentMaintenance',
  data() {
    return {
      activeTab: 'planGeneration',
      equipmentList: [],
      selectedEquipments: [],
      queryParam: {
        EQUIPMENT_NAME: '',
        STATUS: ''
      },
      generatedPlans: [],
      dispatchStats: {
        pending: 0,
        sending: 0,
        completed: 0,
        failed: 0
      },
      dispatchLogs: [],
      testResults: [],
      resultFilter: {
        equipmentId: '',
        testResult: ''
      },
      planDetailDialogVisible: false,
      currentPlan: null
    }
  },
  computed: {
    hasSelectedEquipment() {
      return this.selectedEquipments.length > 0
    },
    hasGeneratedPlans() {
      return this.generatedPlans.some(p => p.status === 'pending')
    },
    filteredTestResults() {
      let results = this.testResults
      if (this.resultFilter.equipmentId) {
        results = results.filter(
          r => r.EQUIPMENT_ID === this.resultFilter.equipmentId
        )
      }
      if (this.resultFilter.testResult) {
        results = results.filter(
          r => r.TEST_RESULT === this.resultFilter.testResult
        )
      }
      return results
    }
  },
  mounted() {
    this.loadEquipmentList()
    this.loadTestResults()
  },
  methods: {
    loadEquipmentList() {
      // 模拟API调用
      setTimeout(() => {
        this.equipmentList = [
          {
            EQUIPMENT_ID: 'EQ001',
            EQUIPMENT_NAME: '数据链中继站#1',
            EQUIPMENT_TYPE: '通信设备',
            STATUS: 'pending',
            LAST_MAINTENANCE: Date.now() - 2592000000
          },
          {
            EQUIPMENT_ID: 'EQ002',
            EQUIPMENT_NAME: '战术终端#3',
            EQUIPMENT_TYPE: '终端设备',
            STATUS: 'maintaining',
            LAST_MAINTENANCE: Date.now() - 1296000000
          },
          {
            EQUIPMENT_ID: 'EQ003',
            EQUIPMENT_NAME: '加密模块#2',
            EQUIPMENT_TYPE: '安全设备',
            STATUS: 'completed',
            LAST_MAINTENANCE: Date.now() - 604800000
          },
          {
            EQUIPMENT_ID: 'EQ004',
            EQUIPMENT_NAME: '天线阵列#5',
            EQUIPMENT_TYPE: '天线设备',
            STATUS: 'pending',
            LAST_MAINTENANCE: Date.now() - 5184000000
          }
        ]
      }, 500)
    },
    loadTestResults() {
      // 模拟API调用
      setTimeout(() => {
        this.testResults = [
          {
            EQUIPMENT_ID: 'EQ001',
            EQUIPMENT_NAME: '数据链中继站#1',
            TEST_ITEM: '发射功率测试',
            TEST_RESULT: 'pass',
            TEST_VALUE: '45.2dBm',
            STANDARD_VALUE: '45±2dBm',
            DEVIATION: '+0.4',
            TEST_TIME: Date.now() - 3600000
          },
          {
            EQUIPMENT_ID: 'EQ001',
            EQUIPMENT_NAME: '数据链中继站#1',
            TEST_ITEM: '接收灵敏度测试',
            TEST_RESULT: 'pass',
            TEST_VALUE: '-95dBm',
            STANDARD_VALUE: '≤-90dBm',
            DEVIATION: '-5.6',
            TEST_TIME: Date.now() - 3500000
          },
          {
            EQUIPMENT_ID: 'EQ002',
            EQUIPMENT_NAME: '战术终端#3',
            TEST_ITEM: '数据处理能力测试',
            TEST_RESULT: 'fail',
            TEST_VALUE: '85%',
            STANDARD_VALUE: '≥90%',
            DEVIATION: '-5.0',
            TEST_TIME: Date.now() - 7200000
          },
          {
            EQUIPMENT_ID: 'EQ003',
            EQUIPMENT_NAME: '加密模块#2',
            TEST_ITEM: '加密速率测试',
            TEST_RESULT: 'pass',
            TEST_VALUE: '120Mbps',
            STANDARD_VALUE: '≥100Mbps',
            DEVIATION: '+20.0',
            TEST_TIME: Date.now() - 1800000
          }
        ]
      }, 500)
    },
    toggleSelectEquipment(equipmentId) {
      const index = this.selectedEquipments.indexOf(equipmentId)
      if (index > -1) {
        this.selectedEquipments.splice(index, 1)
      } else {
        this.selectedEquipments.push(equipmentId)
      }
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
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        maintaining: 'primary',
        completed: 'success'
      }
      return typeMap[status] || 'info'
    },
    getStatusText(status) {
      const textMap = {
        pending: '待维护',
        maintaining: '维护中',
        completed: '已完成'
      }
      return textMap[status] || status
    },
    getPlanStatusType(status) {
      const typeMap = {
        pending: 'warning',
        sent: 'success',
        failed: 'danger'
      }
      return typeMap[status] || 'info'
    },
    getPlanStatusText(status) {
      const textMap = {
        pending: '待下发',
        sent: '已下发',
        failed: '下发失败'
      }
      return textMap[status] || status
    },
    getTestResultType(result) {
      const typeMap = {
        pass: 'success',
        fail: 'danger',
        pending: 'warning'
      }
      return typeMap[result] || 'info'
    },
    getTestResultText(result) {
      const textMap = {
        pass: '通过',
        fail: '不通过',
        pending: '待检测'
      }
      return textMap[result] || result
    },
    getDeviationClass(deviation) {
      const val = parseFloat(deviation)
      if (Math.abs(val) <= 5) return 'text-green'
      if (Math.abs(val) <= 10) return 'text-orange'
      return 'text-red'
    },
    getPriorityType(priority) {
      const typeMap = {
        high: 'danger',
        medium: 'warning',
        low: 'info'
      }
      return typeMap[priority] || 'info'
    },
    getPriorityText(priority) {
      const textMap = {
        high: '高',
        medium: '中',
        low: '低'
      }
      return textMap[priority] || priority
    },
    handleGeneratePlan() {
      this.$confirm(
        `确定为选中的 ${this.selectedEquipments.length} 个装备生成维护方案？`,
        '确认生成',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$message.info('正在生成维护方案...')
          setTimeout(() => {
            this.selectedEquipments.forEach(equipId => {
              const equip = this.equipmentList.find(
                e => e.EQUIPMENT_ID === equipId
              )
              this.generatedPlans.push({
                planName: `${equip.EQUIPMENT_NAME}维护方案`,
                equipmentName: equip.EQUIPMENT_NAME,
                maintenanceType: '定期维护',
                estimatedTime: '2小时',
                generateTime: Date.now(),
                status: 'pending',
                priority: 'medium',
                steps: [
                  '外观检查与清洁',
                  '功能测试',
                  '性能参数校准',
                  '软件版本更新',
                  '综合测试验证'
                ],
                resources: [
                  {name: '万用表', quantity: '1台'},
                  {name: '示波器', quantity: '1台'},
                  {name: '测试线缆', quantity: '若干'}
                ]
              })
            })
            this.$message.success('维护方案生成成功')
            this.activeTab = 'planGeneration'
          }, 1500)
        })
        .catch(() => {})
    },
    handleSendToParallel() {
      const pendingPlans = this.generatedPlans.filter(
        p => p.status === 'pending'
      )

      this.$confirm(
        `确定将 ${pendingPlans.length} 个维护方案下发至平行系统？`,
        '确认下发',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.activeTab = 'planDispatch'
          this.addDispatchLog(
            'info',
            `开始下发 ${pendingPlans.length} 个维护方案...`
          )

          let completed = 0
          pendingPlans.forEach((plan, index) => {
            setTimeout(
              () => {
                plan.status = 'sent'
                completed++
                this.addDispatchLog(
                  'success',
                  `方案「${plan.planName}」下发成功`
                )

                if (completed === pendingPlans.length) {
                  this.updateDispatchStats()
                  this.$message.success('所有方案已成功下发至平行系统')
                }
              },
              (index + 1) * 1000
            )
          })
        })
        .catch(() => {})
    },
    handleViewPlanDetail(plan) {
      this.currentPlan = plan
      this.planDetailDialogVisible = true
    },
    handleExportPlan(plan) {
      this.$message.success(`方案「${plan.planName}」导出功能开发中...`)
    },
    handleViewTestDetail(row) {
      this.$message.info('测试详情功能开发中...')
    },
    addDispatchLog(level, message) {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

      this.dispatchLogs.push({
        time: timeStr,
        level: level,
        message: message
      })

      this.$nextTick(() => {
        if (this.$refs.dispatchLogContainer) {
          this.$refs.dispatchLogContainer.scrollTop =
            this.$refs.dispatchLogContainer.scrollHeight
        }
      })
    },
    clearDispatchLogs() {
      this.dispatchLogs = []
    },
    updateDispatchStats() {
      this.dispatchStats.pending = this.generatedPlans.filter(
        p => p.status === 'pending'
      ).length
      this.dispatchStats.sending = 0
      this.dispatchStats.completed = this.generatedPlans.filter(
        p => p.status === 'sent'
      ).length
      this.dispatchStats.failed = this.generatedPlans.filter(
        p => p.status === 'failed'
      ).length
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

.left-equipment-panel {
  width: 380px;
  flex-shrink: 0;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.equipment-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  color: #64748b;
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
  padding-top: 4px;
}

.panel-header-summary {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 8px;
  flex-shrink: 0;
}

.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.panel-header-summary .badge {
  font-size: 10px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}

.equipment-item-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.equipment-active {
  border-color: #38bdf8 !important;
  background: #13253e !important;
}

.equipment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.equip-name {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.equipment-card-body {
  font-size: 11px;
  color: #94a3b8;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px 8px;
}

/* 方案生成容器 */
.plan-generation-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.generated-plans-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #17263d;
}

.list-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.list-count {
  font-size: 10px;
  color: #64748b;
}

.plans-scroll-box {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.plan-item {
  background: #080e18;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 8px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.plan-name {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 11px;
}

.info-label {
  color: #64748b;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #cbd5e1;
  flex: 1;
}

.plan-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #475569;
  gap: 8px;
}

.empty-state p {
  font-size: 12px;
  margin: 0;
}

.empty-hint {
  font-size: 10px !important;
  color: #64748b !important;
}

/* 下发监控容器 */
.dispatch-monitor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dispatch-status-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.status-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 12px;
  text-align: center;
}

.status-label {
  font-size: 10px;
  color: #64748b;
  margin-bottom: 4px;
}

.status-value {
  font-size: 20px;
  font-weight: bold;
}

.dispatch-log-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #17263d;
}

.log-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
  font-family: monospace;
  font-size: 10px;
}

.log-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  line-height: 1.5;
}

.log-time {
  color: #475569;
  flex-shrink: 0;
}

.log-message {
  color: #94a3b8;
  flex: 1;
}

.log-item.info .log-message {
  color: #94a3b8;
}

.log-item.success .log-message {
  color: #10b981;
}

.log-item.warning .log-message {
  color: #f59e0b;
}

.log-item.error .log-message {
  color: #f43f5e;
}

/* 测试结果显示容器 */
.test-results-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.results-filter-bar {
  display: flex;
  gap: 12px;
  padding: 8px;
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-item label {
  font-size: 11px;
  color: #64748b;
}

/* 方案详情对话框 */
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
  margin: 0 0 10px 0;
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
  width: 90px;
  flex-shrink: 0;
}

.detail-value {
  color: #cbd5e1;
  flex: 1;
}

.maintenance-steps {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 11px;
}

.step-index {
  width: 18px;
  height: 18px;
  background: #38bdf8;
  color: #03060c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: bold;
  flex-shrink: 0;
}

.step-text {
  color: #cbd5e1;
  flex: 1;
  line-height: 1.5;
}

.resources-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resource-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #080e18;
  border: 1px solid #172438;
  border-radius: 4px;
  font-size: 11px;
}

.resource-name {
  color: #cbd5e1;
}

.resource-quantity {
  color: #06b6d4;
  font-weight: bold;
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

.text-warning {
  color: #f59e0b !important;
}

.text-success {
  color: #10b981 !important;
}

.text-danger {
  color: #f43f5e !important;
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
