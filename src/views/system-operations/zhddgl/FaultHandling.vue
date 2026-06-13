<template>
  <div class="screen-container">
    <!-- 顶部操作栏 -->
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">数据链故障处理</span>

        <div class="search-item">
          <label>故障类型</label>
          <el-select
            v-model="queryParam.FAULT_TYPE"
            placeholder="选择故障类型"
            clearable
            size="mini"
            style="width: 140px"
            @change="loadFaultList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="硬件故障" value="hardware"></el-option>
            <el-option label="软件故障" value="software"></el-option>
            <el-option label="通信故障" value="communication"></el-option>
            <el-option label="链路故障" value="link"></el-option>
          </el-select>
        </div>

        <div class="search-item">
          <label>故障等级</label>
          <el-select
            v-model="queryParam.LEVEL"
            placeholder="选择等级"
            clearable
            size="mini"
            style="width: 120px"
            @change="loadFaultList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="一级" value="1"></el-option>
            <el-option label="二级" value="2"></el-option>
            <el-option label="三级" value="3"></el-option>
          </el-select>
        </div>

        <div class="search-item">
          <label>处理状态</label>
          <el-select
            v-model="queryParam.STATUS"
            placeholder="选择状态"
            clearable
            size="mini"
            style="width: 120px"
            @change="loadFaultList"
          >
            <el-option label="全部" value=""></el-option>
            <el-option label="待诊断" value="pending"></el-option>
            <el-option label="诊断中" value="diagnosing"></el-option>
            <el-option label="处理中" value="processing"></el-option>
            <el-option label="已恢复" value="resolved"></el-option>
          </el-select>
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-magic-stick"
          class="action-btn"
          @click="handleDiagnose"
          :disabled="!hasSelectedFaults"
        >
          故障诊断
        </el-button>
        <el-button
          type="success"
          size="mini"
          icon="el-icon-s-promotion"
          class="action-btn"
          @click="handleGenerateSolution"
          :disabled="!hasDiagnosedFaults"
        >
          生成处置策略
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="loadFaultList"
        >
          刷新数据
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <!-- 左侧故障统计 -->
      <div class="left-stats-panel">
        <div class="panel-header-summary">
          <span class="title">
            <Icon
              icon="lucide:alert-triangle"
              :size="16"
              style="vertical-align: middle; margin-right: 4px"
            />
            故障态势概览
          </span>
        </div>

        <div class="fault-stats-grid">
          <div class="stat-card stat-critical">
            <div class="stat-icon">
              <Icon icon="lucide:octagon-alert" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">一级故障</div>
              <div class="stat-value">{{ faultStats.level1 }}</div>
            </div>
          </div>

          <div class="stat-card stat-warning">
            <div class="stat-icon">
              <Icon icon="lucide:triangle-alert" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">二级故障</div>
              <div class="stat-value">{{ faultStats.level2 }}</div>
            </div>
          </div>

          <div class="stat-card stat-info">
            <div class="stat-icon">
              <Icon icon="lucide:info" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">三级故障</div>
              <div class="stat-value">{{ faultStats.level3 }}</div>
            </div>
          </div>

          <div class="stat-card stat-total">
            <div class="stat-icon">
              <Icon icon="lucide:layers" :size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-label">故障总数</div>
              <div class="stat-value">{{ faultStats.total }}</div>
            </div>
          </div>
        </div>

        <div class="status-distribution">
          <div class="distribution-header">
            <span class="distribution-title">处理状态分布</span>
          </div>
          <div class="status-list">
            <div class="status-item">
              <div class="status-bar">
                <div
                  class="status-fill status-pending"
                  :style="{width: getStatusPercent('pending') + '%'}"
                ></div>
              </div>
              <div class="status-info">
                <span class="status-name">待诊断</span>
                <span class="status-count">{{ statusDist.pending }}</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div
                  class="status-fill status-diagnosing"
                  :style="{width: getStatusPercent('diagnosing') + '%'}"
                ></div>
              </div>
              <div class="status-info">
                <span class="status-name">诊断中</span>
                <span class="status-count">{{ statusDist.diagnosing }}</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div
                  class="status-fill status-processing"
                  :style="{width: getStatusPercent('processing') + '%'}"
                ></div>
              </div>
              <div class="status-info">
                <span class="status-name">处理中</span>
                <span class="status-count">{{ statusDist.processing }}</span>
              </div>
            </div>
            <div class="status-item">
              <div class="status-bar">
                <div
                  class="status-fill status-resolved"
                  :style="{width: getStatusPercent('resolved') + '%'}"
                ></div>
              </div>
              <div class="status-info">
                <span class="status-name">已恢复</span>
                <span class="status-count">{{ statusDist.resolved }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="fault-type-dist">
          <div class="dist-header">
            <span class="dist-title">故障类型分布</span>
          </div>
          <div class="type-list">
            <div class="type-item">
              <span class="type-name">硬件故障</span>
              <span class="type-count text-red">{{ typeDist.hardware }}</span>
            </div>
            <div class="type-item">
              <span class="type-name">软件故障</span>
              <span class="type-count text-orange">{{
                typeDist.software
              }}</span>
            </div>
            <div class="type-item">
              <span class="type-name">通信故障</span>
              <span class="type-count text-cyan">{{
                typeDist.communication
              }}</span>
            </div>
            <div class="type-item">
              <span class="type-name">链路故障</span>
              <span class="type-count text-blue">{{ typeDist.link }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧故障列表 -->
      <div class="right-table-panel">
        <el-table
          :data="faultList"
          border
          stripe
          style="width: 100%"
          height="100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50"></el-table-column>
          <el-table-column
            type="index"
            label="序号"
            width="60"
          ></el-table-column>
          <el-table-column prop="FAULT_ID" label="故障ID" width="120">
            <template slot-scope="scope">
              <span class="font-num text-cyan">{{ scope.row.FAULT_ID }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="FAULT_TYPE" label="故障类型" width="100">
            <template slot-scope="scope">
              {{ getFaultTypeText(scope.row.FAULT_TYPE) }}
            </template>
          </el-table-column>
          <el-table-column prop="LEVEL" label="故障等级" width="90">
            <template slot-scope="scope">
              <el-tag size="mini" :type="getLevelType(scope.row.LEVEL)">
                {{ getLevelText(scope.row.LEVEL) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="DEVICE_NAME" label="故障设备" min-width="150">
            <template slot-scope="scope">
              <span class="ellipsis-text" :title="scope.row.DEVICE_NAME">
                {{ scope.row.DEVICE_NAME }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="DESCRIPTION" label="故障描述" min-width="200">
            <template slot-scope="scope">
              <span class="ellipsis-text" :title="scope.row.DESCRIPTION">
                {{ scope.row.DESCRIPTION }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="STATUS" label="处理状态" width="100">
            <template slot-scope="scope">
              <el-tag size="mini" :type="getStatusType(scope.row.STATUS)">
                {{ getStatusText(scope.row.STATUS) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="DETECT_TIME" label="发现时间" width="160">
            <template slot-scope="scope">
              {{ formatTime(scope.row.DETECT_TIME) }}
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
                icon="el-icon-stethoscope"
                class="btn-modify"
                @click="handleDiagnoseSingle(scope.row)"
                :disabled="scope.row.STATUS !== 'pending'"
              >
                诊断
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-check"
                class="btn-modify"
                @click="handleResolveFault(scope.row)"
                :disabled="
                  !scope.row.SOLUTION || scope.row.STATUS === 'resolved'
                "
              >
                下发策略
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

    <!-- 故障详情对话框 -->
    <el-dialog
      title="故障详细信息"
      :visible.sync="detailDialogVisible"
      width="800px"
      custom-class="dark-dialog-clean"
      append-to-body
    >
      <div v-if="currentFault" class="detail-content">
        <div class="detail-section">
          <h4 class="section-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">故障ID:</span>
              <span class="detail-value text-cyan">{{
                currentFault.FAULT_ID
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">故障类型:</span>
              <span class="detail-value">{{
                getFaultTypeText(currentFault.FAULT_TYPE)
              }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">故障等级:</span>
              <el-tag size="small" :type="getLevelType(currentFault.LEVEL)">
                {{ getLevelText(currentFault.LEVEL) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">处理状态:</span>
              <el-tag size="small" :type="getStatusType(currentFault.STATUS)">
                {{ getStatusText(currentFault.STATUS) }}
              </el-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">故障设备:</span>
              <span class="detail-value">{{ currentFault.DEVICE_NAME }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">发现时间:</span>
              <span class="detail-value">{{
                formatTime(currentFault.DETECT_TIME)
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-title">故障描述</h4>
          <div class="detail-text">{{ currentFault.DESCRIPTION }}</div>
        </div>

        <div class="detail-section" v-if="currentFault.DIAGNOSIS">
          <h4 class="section-title">诊断结果</h4>
          <div class="diagnosis-content">
            <div class="diagnosis-item">
              <span class="diagnosis-label">故障原因:</span>
              <span class="diagnosis-value">{{
                currentFault.DIAGNOSIS.cause
              }}</span>
            </div>
            <div class="diagnosis-item">
              <span class="diagnosis-label">影响范围:</span>
              <span class="diagnosis-value">{{
                currentFault.DIAGNOSIS.impact
              }}</span>
            </div>
            <div class="diagnosis-item">
              <span class="diagnosis-label">紧急程度:</span>
              <el-tag size="small" :type="getLevelType(currentFault.LEVEL)">
                {{ getLevelText(currentFault.LEVEL) }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentFault.SOLUTION">
          <h4 class="section-title">处置策略</h4>
          <div class="solution-content">
            <div class="solution-item">
              <span class="solution-label">策略类型:</span>
              <span class="solution-value">{{
                currentFault.SOLUTION.type
              }}</span>
            </div>
            <div class="solution-item">
              <span class="solution-label">处理步骤:</span>
              <div class="solution-steps">
                <div
                  v-for="(step, index) in currentFault.SOLUTION.steps"
                  :key="index"
                  class="step-item"
                >
                  <span class="step-index">{{ index + 1 }}</span>
                  <span class="step-text">{{ step }}</span>
                </div>
              </div>
            </div>
            <div class="solution-item">
              <span class="solution-label">预期效果:</span>
              <span class="solution-value">{{
                currentFault.SOLUTION.effect
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer">
        <el-button size="mini" @click="detailDialogVisible = false"
          >关闭</el-button
        >
        <el-button
          type="primary"
          size="mini"
          @click="handleResolveFromDialog"
          v-if="
            currentFault &&
            currentFault.SOLUTION &&
            currentFault.STATUS !== 'resolved'
          "
        >
          下发处置策略
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FaultHandling',
  data() {
    return {
      loading: false,
      faultList: [],
      selectedFaults: [],
      queryParam: {
        FAULT_TYPE: '',
        LEVEL: '',
        STATUS: ''
      },
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      faultStats: {
        level1: 2,
        level2: 5,
        level3: 8,
        total: 15
      },
      statusDist: {
        pending: 4,
        diagnosing: 2,
        processing: 3,
        resolved: 6
      },
      typeDist: {
        hardware: 4,
        software: 3,
        communication: 5,
        link: 3
      },
      detailDialogVisible: false,
      currentFault: null
    }
  },
  computed: {
    hasSelectedFaults() {
      return this.selectedFaults.length > 0
    },
    hasDiagnosedFaults() {
      return this.selectedFaults.some(
        f => f.STATUS === 'diagnosing' || f.DIAGNOSIS
      )
    }
  },
  mounted() {
    this.loadFaultList()
  },
  methods: {
    loadFaultList() {
      this.loading = true
      // 模拟API调用
      setTimeout(() => {
        this.faultList = [
          {
            FAULT_ID: 'FT001',
            FAULT_TYPE: 'hardware',
            LEVEL: '1',
            DEVICE_NAME: '数据链中继站#3',
            DESCRIPTION: '中继站主处理器温度异常升高，超过安全阈值',
            STATUS: 'pending',
            DETECT_TIME: Date.now() - 600000,
            DIAGNOSIS: null,
            SOLUTION: null
          },
          {
            FAULT_ID: 'FT002',
            FAULT_TYPE: 'communication',
            LEVEL: '2',
            DEVICE_NAME: '战术数据链终端#7',
            DESCRIPTION: '与指挥中心的通信链路出现间歇性中断',
            STATUS: 'diagnosing',
            DETECT_TIME: Date.now() - 1800000,
            DIAGNOSIS: {
              cause: '电磁干扰导致信号衰减',
              impact: '影响实时数据传输，延迟增加30%'
            },
            SOLUTION: {
              type: '频率切换',
              steps: ['切换到备用频段B', '重新建立通信链路', '验证通信质量'],
              effect: '恢复正常通信，消除干扰影响'
            }
          },
          {
            FAULT_ID: 'FT003',
            FAULT_TYPE: 'software',
            LEVEL: '2',
            DEVICE_NAME: '网络管理服务器',
            DESCRIPTION: '路由协议进程异常退出，导致部分节点无法通信',
            STATUS: 'processing',
            DETECT_TIME: Date.now() - 3600000,
            DIAGNOSIS: {
              cause: '内存泄漏导致进程崩溃',
              impact: '影响15个节点的连通性'
            },
            SOLUTION: {
              type: '服务重启',
              steps: [
                '备份当前配置',
                '重启路由协议服务',
                '验证节点连通性',
                '监控系统稳定性'
              ],
              effect: '恢复所有节点通信，修复内存泄漏问题'
            }
          },
          {
            FAULT_ID: 'FT004',
            FAULT_TYPE: 'link',
            LEVEL: '3',
            DEVICE_NAME: '卫星通信链路',
            DESCRIPTION: '卫星链路信号强度下降，误码率升高',
            STATUS: 'resolved',
            DETECT_TIME: Date.now() - 7200000,
            DIAGNOSIS: {
              cause: '天气因素导致信号衰减',
              impact: '数据传输速率降低20%'
            },
            SOLUTION: {
              type: '功率调整',
              steps: ['提升发射功率5dB', '启用纠错编码', '优化天线指向'],
              effect: '信号强度恢复正常，误码率降至可接受范围'
            }
          },
          {
            FAULT_ID: 'FT005',
            FAULT_TYPE: 'hardware',
            LEVEL: '1',
            DEVICE_NAME: '加密模块#2',
            DESCRIPTION: '加密芯片故障，无法进行数据加解密',
            STATUS: 'pending',
            DETECT_TIME: Date.now() - 300000,
            DIAGNOSIS: null,
            SOLUTION: null
          }
        ]
        this.pagination.total = this.faultList.length
        this.loading = false
      }, 500)
    },
    handleSelectionChange(selection) {
      this.selectedFaults = selection
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
    getFaultTypeText(type) {
      const textMap = {
        hardware: '硬件故障',
        software: '软件故障',
        communication: '通信故障',
        link: '链路故障'
      }
      return textMap[type] || type
    },
    getLevelType(level) {
      const typeMap = {
        1: 'danger',
        2: 'warning',
        3: 'info'
      }
      return typeMap[level] || 'info'
    },
    getLevelText(level) {
      const textMap = {
        1: '一级',
        2: '二级',
        3: '三级'
      }
      return textMap[level] || level
    },
    getStatusType(status) {
      const typeMap = {
        pending: 'warning',
        diagnosing: 'primary',
        processing: 'success',
        resolved: 'info'
      }
      return typeMap[status] || 'info'
    },
    getStatusText(status) {
      const textMap = {
        pending: '待诊断',
        diagnosing: '诊断中',
        processing: '处理中',
        resolved: '已恢复'
      }
      return textMap[status] || status
    },
    getStatusPercent(status) {
      const count = this.statusDist[status] || 0
      const total = this.faultStats.total || 1
      return Math.round((count / total) * 100)
    },
    handleDiagnose() {
      this.$confirm(
        `确定对选中的 ${this.selectedFaults.length} 个故障进行诊断？`,
        '确认诊断',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$message.info('正在进行故障诊断...')
          setTimeout(() => {
            this.$message.success('故障诊断完成')
            this.selectedFaults.forEach(fault => {
              fault.STATUS = 'diagnosing'
              fault.DIAGNOSIS = {
                cause: '系统自动诊断结果',
                impact: '需要进一步分析'
              }
            })
            this.loadFaultList()
          }, 2000)
        })
        .catch(() => {})
    },
    handleDiagnoseSingle(row) {
      this.$message.info(`正在诊断故障 ${row.FAULT_ID}...`)
      setTimeout(() => {
        row.STATUS = 'diagnosing'
        row.DIAGNOSIS = {
          cause: '系统自动诊断结果',
          impact: '需要进一步分析'
        }
        this.$message.success('故障诊断完成')
      }, 1500)
    },
    handleGenerateSolution() {
      const diagnosedFaults = this.selectedFaults.filter(
        f => f.STATUS === 'diagnosing' && !f.SOLUTION
      )

      if (diagnosedFaults.length === 0) {
        this.$message.warning('没有可生成策略的故障')
        return
      }

      this.$confirm(
        `确定为 ${diagnosedFaults.length} 个已诊断故障生成处置策略？`,
        '确认生成',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$message.info('正在生成处置策略...')
          setTimeout(() => {
            diagnosedFaults.forEach(fault => {
              fault.SOLUTION = {
                type: '自动生成的策略',
                steps: ['执行标准处理流程', '验证处理效果'],
                effect: '恢复系统正常运行'
              }
              fault.STATUS = 'processing'
            })
            this.$message.success('处置策略生成成功')
            this.loadFaultList()
          }, 1500)
        })
        .catch(() => {})
    },
    handleViewDetail(row) {
      this.currentFault = row
      this.detailDialogVisible = true
    },
    handleResolveFault(row) {
      if (!row.SOLUTION) {
        this.$message.warning('该故障尚未生成处置策略')
        return
      }

      this.$confirm(`确定要下发处置策略吗？`, '确认下发', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('处置策略已下发，故障处理中...')
          setTimeout(() => {
            row.STATUS = 'resolved'
            this.$message.success('故障已恢复')
          }, 2000)
        })
        .catch(() => {})
    },
    handleResolveFromDialog() {
      if (this.currentFault) {
        this.handleResolveFault(this.currentFault)
        this.detailDialogVisible = false
      }
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.pagination.pageNum = 1
      this.loadFaultList()
    },
    handlePageChange(val) {
      this.pagination.pageNum = val
      this.loadFaultList()
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

.left-stats-panel {
  width: 320px;
  flex-shrink: 0;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-header-summary {
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #111b2b;
}

.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.fault-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 11px;
  display: flex;
  align-items: center;
  gap: 11px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.stat-critical .stat-icon {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

.stat-warning .stat-icon {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.stat-info .stat-icon {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

.stat-total .stat-icon {
  background: rgba(100, 116, 139, 0.15);
  color: #64748b;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 2px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
}

.status-distribution {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.distribution-header {
  padding: 8px 11px;
  border-bottom: 1px solid #17263d;
}

.distribution-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.status-list {
  padding: 11px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-bar {
  height: 6px;
  background: #172438;
  border-radius: 3px;
  overflow: hidden;
}

.status-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.status-pending {
  background: #f59e0b;
}

.status-diagnosing {
  background: #38bdf8;
}

.status-processing {
  background: #10b981;
}

.status-resolved {
  background: #64748b;
}

.status-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.status-name {
  color: #94a3b8;
}

.status-count {
  color: #fff;
  font-weight: bold;
}

.fault-type-dist {
  flex: 1;
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  overflow: hidden;
}

.dist-header {
  padding: 8px 11px;
  border-bottom: 1px solid #17263d;
}

.dist-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}

.type-list {
  padding: 11px;
}

.type-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #172438;
  font-size: 11px;
}

.type-item:last-child {
  border-bottom: none;
}

.type-name {
  color: #94a3b8;
}

.type-count {
  font-weight: bold;
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
  margin: 0 0 11px 0;
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

.detail-text {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.6;
}

.diagnosis-content,
.solution-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diagnosis-item,
.solution-item {
  display: flex;
  align-items: flex-start;
  font-size: 11px;
}

.diagnosis-label,
.solution-label {
  color: #64748b;
  width: 80px;
  flex-shrink: 0;
  margin-top: 2px;
}

.diagnosis-value,
.solution-value {
  color: #cbd5e1;
  flex: 1;
}

.solution-steps {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.step-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
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
