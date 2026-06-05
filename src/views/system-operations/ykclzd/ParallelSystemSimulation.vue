<template>
  <div class="screen-container">
    <!-- 顶部搜索和操作栏 -->
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">平行系统推演</span>

        <div class="search-item">
          <label>作战任务名称</label>
          <el-input
            v-model="queryParam.RWMC"
            @input="loadZzrwxxList"
            placeholder="输入任务名称搜索..."
            style="width: 260px"
            size="small"
          />
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-video-play"
          class="action-btn"
          @click="handleStartSimulation"
          :disabled="!selectedRw || !hasSelectedPlan"
        >
          启动平行推演
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="initGlobalDashboard"
        >
          同步全要素数据源
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <!-- 左侧作战任务列表 -->
      <div class="left-tree-panel">
        <div class="panel-header-summary">
          <span class="title">
            <Icon
              icon="lucide:swords"
              :size="16"
              style="vertical-align: middle; margin-right: 4px"
            />
            作战任务源
          </span>
          <span class="badge font-num text-cyan">{{ rwxxList.length }} 项</span>
        </div>

        <div class="task-scroll-box">
          <div
            v-for="rw in rwxxList"
            :key="rw.ZZRWXXID || rw.ZZRWID"
            class="task-item-card"
            :class="taskCardActiveClass(rw)"
            @click="handleSelectRw(rw)"
          >
            <div class="task-card-header">
              <span class="rw-title ellipsis-text" :title="rw.RWMC || rw.rwmc">
                <Icon
                  icon="lucide:layers"
                  :size="12"
                  style="color: var(--color-primary); margin-right: 4px"
                />
                {{ rw.RWMC || rw.rwmc }}
              </span>
              <span
                class="status-tag"
                :class="rw.STATE === 1 ? 'tag-active' : 'tag-pending'"
              >
                {{ rw.STATE === 1 ? '已启用' : '待命' }}
              </span>
            </div>

            <div class="task-card-body">
              <div class="meta-grid">
                <div>
                  任务ID:
                  <span class="text-blue font-num">{{
                    rw.ZZRWID || rw.zzrwid
                  }}</span>
                </div>
                <div>
                  信息ID:
                  <span class="text-cyan font-num">{{
                    rw.ZZRWXXID || rw.zzrwxxid
                  }}</span>
                </div>
                <div>
                  领域:
                  <span class="text-green">{{ rw.SSLY || '未划分' }}</span>
                </div>
                <div>
                  优先级:
                  <span class="text-orange">{{
                    yxjMap[rw.RWYXJ] || rw.RWYXJ || '常态'
                  }}</span>
                </div>
                <div>
                  开始时间:
                  <span>{{ formatStartTime(rw.STARTTIME) }}</span>
                </div>
                <div>
                  任务时长:
                  <span class="text-cyan font-num">{{
                    formatTaskDuration(rw.RWSJ)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧推演面板 -->
      <div class="right-combined-panel">
        <el-tabs v-model="activeTab" class="dark-tabs fill-tabs">
          <!-- 方案选择与发送 -->
          <el-tab-pane name="planSelection" class="full-pane">
            <span slot="label">方案选择与发送</span>
            <div class="pane-content-box" style="height: 100%">
              <div class="plan-selection-container">
                <div class="plan-section">
                  <div class="section-header">
                    <span class="section-title">
                      <Icon
                        icon="lucide:shield-check"
                        :size="14"
                        style="vertical-align: middle; margin-right: 4px"
                      />
                      数据链保障方案
                    </span>
                    <el-checkbox
                      v-model="selectedPlans.dataLink"
                      :disabled="!selectedRw"
                    >
                      选中此方案
                    </el-checkbox>
                  </div>
                  <div class="plan-content">
                    <div v-if="selectedRw" class="plan-info-card">
                      <div class="info-row">
                        <span class="info-label">方案名称:</span>
                        <span class="info-value">{{
                          selectedRw.RWMC || '未命名方案'
                        }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">方案类型:</span>
                        <span class="info-value text-cyan">分级运控方案</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">适用任务:</span>
                        <span class="info-value">{{
                          selectedRw.RWMC || '--'
                        }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">生成时间:</span>
                        <span class="info-value">{{
                          formatStartTime(selectedRw.CREATE_TIME)
                        }}</span>
                      </div>
                    </div>
                    <div v-else class="empty-tip">
                      <p>请先选择左侧作战任务</p>
                    </div>
                  </div>
                </div>

                <div class="plan-section">
                  <div class="section-header">
                    <span class="section-title">
                      <Icon
                        icon="lucide:users-round"
                        :size="14"
                        style="vertical-align: middle; margin-right: 4px"
                      />
                      作战计划信息
                    </span>
                    <el-checkbox
                      v-model="selectedPlans.battlePlan"
                      :disabled="!selectedRw"
                    >
                      选中此方案
                    </el-checkbox>
                  </div>
                  <div class="plan-content">
                    <div v-if="selectedRw" class="plan-info-card">
                      <div class="info-row">
                        <span class="info-label">计划名称:</span>
                        <span class="info-value">{{
                          selectedRw.RWMC || '未命名计划'
                        }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">计划类型:</span>
                        <span class="info-value text-green">作战群组方案</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">关联任务:</span>
                        <span class="info-value">{{
                          selectedRw.RWMC || '--'
                        }}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">平台数量:</span>
                        <span class="info-value text-orange">{{
                          platformTreeNodes.length
                        }}</span>
                      </div>
                    </div>
                    <div v-else class="empty-tip">
                      <p>请先选择左侧作战任务</p>
                    </div>
                  </div>
                </div>

                <div class="send-actions">
                  <el-button
                    type="primary"
                    size="small"
                    icon="el-icon-s-promotion"
                    @click="handleSendToParallel"
                    :disabled="!hasSelectedPlan"
                  >
                    发送至平行系统
                  </el-button>
                  <el-button
                    type="warning"
                    size="small"
                    icon="el-icon-document-checked"
                    @click="handlePreviewPlan"
                    :disabled="!hasSelectedPlan"
                  >
                    预览方案详情
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 推演执行监控 -->
          <el-tab-pane name="simulationMonitor" class="full-pane">
            <span slot="label">推演执行监控</span>
            <div class="pane-content-box" style="height: 100%">
              <div class="simulation-monitor-container">
                <div class="monitor-status-bar">
                  <div class="status-item">
                    <span class="status-label">推演状态:</span>
                    <span class="status-value" :class="simulationStatus.class">
                      {{ simulationStatus.text }}
                    </span>
                  </div>
                  <div class="status-item">
                    <span class="status-label">进度:</span>
                    <span class="status-value text-cyan"
                      >{{ simulationProgress }}%</span
                    >
                  </div>
                  <div class="status-item">
                    <span class="status-label">耗时:</span>
                    <span class="status-value text-orange">{{
                      formatElapsedTime(simulationElapsed)
                    }}</span>
                  </div>
                </div>

                <div class="progress-section">
                  <el-progress
                    :percentage="simulationProgress"
                    :stroke-width="8"
                    :color="progressColor"
                  ></el-progress>
                </div>

                <div class="log-section">
                  <div class="log-header">
                    <span class="log-title">推演日志</span>
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      @click="clearLogs"
                    >
                      清空日志
                    </el-button>
                  </div>
                  <div class="log-content" ref="logContainer">
                    <div
                      v-for="(log, index) in simulationLogs"
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

          <!-- 推演结果展示 -->
          <el-tab-pane name="simulationResult" class="full-pane">
            <span slot="label">推演结果展示</span>
            <div class="pane-content-box" style="height: 100%">
              <div class="result-display-container">
                <div class="result-overview">
                  <div class="overview-card">
                    <div class="card-header">
                      <span class="card-title">推演概览</span>
                    </div>
                    <div class="card-body">
                      <div class="stat-grid">
                        <div class="stat-item">
                          <div class="stat-label">推演次数</div>
                          <div class="stat-value text-cyan">
                            {{ resultStats.simulationCount }}
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-label">成功率</div>
                          <div class="stat-value text-green">
                            {{ resultStats.successRate }}%
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-label">平均耗时</div>
                          <div class="stat-value text-orange">
                            {{ resultStats.avgTime }}s
                          </div>
                        </div>
                        <div class="stat-item">
                          <div class="stat-label">关键节点</div>
                          <div class="stat-value text-blue">
                            {{ resultStats.keyNodes }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="result-details">
                  <el-tabs v-model="resultSubTab" class="inner-tabs">
                    <el-tab-pane label="效能评估" name="efficiency">
                      <div class="result-table-wrapper">
                        <el-table
                          :data="efficiencyData"
                          border
                          stripe
                          style="width: 100%"
                          height="300"
                        >
                          <el-table-column
                            prop="metric"
                            label="评估指标"
                            width="180"
                          ></el-table-column>
                          <el-table-column
                            prop="value"
                            label="推演值"
                            width="120"
                          ></el-table-column>
                          <el-table-column
                            prop="standard"
                            label="标准值"
                            width="120"
                          ></el-table-column>
                          <el-table-column
                            prop="deviation"
                            label="偏差率"
                            width="100"
                          >
                            <template slot-scope="scope">
                              <span
                                :class="getDeviationClass(scope.row.deviation)"
                              >
                                {{ scope.row.deviation }}%
                              </span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="level" label="等级" width="80">
                            <template slot-scope="scope">
                              <el-tag
                                :type="getLevelType(scope.row.level)"
                                size="mini"
                              >
                                {{ scope.row.level }}
                              </el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column
                            prop="comment"
                            label="评价"
                          ></el-table-column>
                        </el-table>
                      </div>
                    </el-tab-pane>

                    <el-tab-pane label="关键事件" name="events">
                      <div class="result-table-wrapper">
                        <el-table
                          :data="keyEvents"
                          border
                          stripe
                          style="width: 100%"
                          height="300"
                        >
                          <el-table-column
                            type="index"
                            label="序号"
                            width="60"
                          ></el-table-column>
                          <el-table-column
                            prop="time"
                            label="发生时间"
                            width="160"
                          ></el-table-column>
                          <el-table-column
                            prop="type"
                            label="事件类型"
                            width="120"
                          >
                            <template slot-scope="scope">
                              <el-tag
                                :type="getEventTypeTag(scope.row.type)"
                                size="mini"
                              >
                                {{ scope.row.type }}
                              </el-tag>
                            </template>
                          </el-table-column>
                          <el-table-column
                            prop="description"
                            label="事件描述"
                          ></el-table-column>
                          <el-table-column
                            prop="impact"
                            label="影响程度"
                            width="100"
                          >
                            <template slot-scope="scope">
                              <span :class="getImpactClass(scope.row.impact)">
                                {{ scope.row.impact }}
                              </span>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                    </el-tab-pane>

                    <el-tab-pane label="优化建议" name="suggestions">
                      <div class="suggestions-list">
                        <div
                          v-for="(item, index) in optimizationSuggestions"
                          :key="index"
                          class="suggestion-item"
                        >
                          <div class="suggestion-header">
                            <span class="suggestion-index">{{
                              index + 1
                            }}</span>
                            <span class="suggestion-title">{{
                              item.title
                            }}</span>
                            <el-tag
                              :type="getSuggestionPriority(item.priority)"
                              size="mini"
                            >
                              {{ item.priority }}
                            </el-tag>
                          </div>
                          <div class="suggestion-content">
                            {{ item.content }}
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>

                <div class="result-actions">
                  <el-button
                    type="primary"
                    icon="el-icon-download"
                    @click="handleExportResult"
                  >
                    导出推演报告
                  </el-button>
                  <el-button
                    type="success"
                    icon="el-icon-check"
                    @click="handleApplyResult"
                  >
                    应用推演结果
                  </el-button>
                  <el-button
                    icon="el-icon-refresh-left"
                    @click="handleResetSimulation"
                  >
                    重新推演
                  </el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script>
import {taskGetPage, getOrganizationByTaskId} from '@/api/task'
import {getYXJMap} from '@/api/map'
import {buildTree} from '@/utils'

export default {
  name: 'ParallelSystemSimulation',
  data() {
    return {
      activeTab: 'planSelection',
      resultSubTab: 'efficiency',
      rwxxList: [],
      platformList: [],
      platformTreeNodes: [],
      selectedRw: null,
      queryParam: {RWMC: ''},
      yxjMap: getYXJMap ? getYXJMap() : {1: '低', 2: '重要', 3: '高'},

      // 方案选择
      selectedPlans: {
        dataLink: false,
        battlePlan: false
      },

      // 推演状态
      simulationStatus: {
        text: '未开始',
        class: 'status-idle'
      },
      simulationProgress: 0,
      simulationElapsed: 0,
      simulationTimer: null,
      simulationLogs: [],

      // 推演结果统计
      resultStats: {
        simulationCount: 0,
        successRate: 0,
        avgTime: 0,
        keyNodes: 0
      },

      // 效能评估数据
      efficiencyData: [],

      // 关键事件
      keyEvents: [],

      // 优化建议
      optimizationSuggestions: []
    }
  },
  computed: {
    hasSelectedPlan() {
      return this.selectedPlans.dataLink || this.selectedPlans.battlePlan
    },
    progressColor() {
      if (this.simulationProgress < 30) return '#f59e0b'
      if (this.simulationProgress < 70) return '#06b6d4'
      return '#10b981'
    }
  },
  mounted() {
    this.initGlobalDashboard()
  },
  beforeDestroy() {
    this.clearSimulationTimer()
  },
  methods: {
    initGlobalDashboard() {
      this.loadZzrwxxList()
    },
    loadZzrwxxList() {
      taskGetPage({
        pageNum: 1,
        pageSize: 10,
        params: {RWMC: this.queryParam.RWMC || undefined}
      }).then(res => {
        this.rwxxList = res.data?.list || res.data || []
        if (this.rwxxList.length > 0) this.handleSelectRw(this.rwxxList[0])
      })
    },
    handleSelectRw(rw) {
      this.selectedRw = rw
      this.platformTreeNodes = []
      this.loadPlatformTreeData()
    },
    formatStartTime(timestamp) {
      if (!timestamp) return '--'
      const date = new Date(Number(timestamp))
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    formatTaskDuration(seconds) {
      if (!seconds && seconds !== 0) return '--'
      const totalSeconds = Number(seconds / 1000)

      if (totalSeconds < 60) {
        return `${totalSeconds} 秒`
      }

      const minutes = Math.floor(totalSeconds / 60)

      if (minutes < 60) {
        return `${minutes} 分钟`
      }

      const hours = Math.floor(totalSeconds / 3600)

      if (hours < 24) {
        const remainingMinutes = minutes % 60
        return remainingMinutes > 0
          ? `${hours} 小时 ${remainingMinutes} 分钟`
          : `${hours} 小时`
      }

      const days = Math.floor(hours / 24)

      if (days < 30) {
        const remainingHours = hours % 24
        return remainingHours > 0
          ? `${days} 天 ${remainingHours} 小时`
          : `${days} 天`
      }

      return `${days} 天`
    },
    loadPlatformTreeData() {
      if (!this.selectedRw) return
      getOrganizationByTaskId(
        this.selectedRw.ZZRWID || this.selectedRw.zzrwid
      ).then(res => {
        const rawData = res.data?.list || res.data || []
        this.platformList = rawData
        const treeResult = buildTree(rawData)
        this.platformTreeNodes = Array.isArray(treeResult)
          ? treeResult
          : [treeResult].filter(Boolean)
      })
    },
    taskCardActiveClass(rw) {
      const curId = this.selectedRw
        ? this.selectedRw.ZZRWID || this.selectedRw.zzrwid
        : null
      return {'task-active': curId && curId === (rw.ZZRWID || rw.zzrwid)}
    },

    // 启动推演
    handleStartSimulation() {
      if (!this.hasSelectedPlan) {
        this.$message.warning('请至少选择一个方案')
        return
      }

      this.activeTab = 'simulationMonitor'
      this.startSimulationProcess()
    },

    // 发送至平行系统
    handleSendToParallel() {
      const plans = []
      if (this.selectedPlans.dataLink) {
        plans.push({
          type: 'dataLink',
          name: '数据链保障方案',
          taskId: this.selectedRw.ZZRWID || this.selectedRw.zzrwid
        })
      }
      if (this.selectedPlans.battlePlan) {
        plans.push({
          type: 'battlePlan',
          name: '作战计划信息',
          taskId: this.selectedRw.ZZRWID || this.selectedRw.zzrwid
        })
      }

      this.$confirm(
        `确定将选中的 ${plans.length} 个方案发送至平行系统进行推演？`,
        '确认发送',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.addLog('info', `正在发送 ${plans.length} 个方案至平行系统...`)

          // 模拟API调用
          setTimeout(() => {
            this.addLog('success', '方案发送成功！')
            this.$message.success('方案已成功发送至平行系统')
            this.activeTab = 'simulationMonitor'
            this.startSimulationProcess()
          }, 1000)
        })
        .catch(() => {
          this.addLog('warning', '用户取消了发送操作')
        })
    },

    // 预览方案详情
    handlePreviewPlan() {
      this.$message.info('方案详情预览功能开发中...')
    },

    // 开始推演过程
    startSimulationProcess() {
      this.simulationStatus = {text: '推演中', class: 'status-running'}
      this.simulationProgress = 0
      this.simulationElapsed = 0
      this.simulationLogs = []

      this.addLog('info', '平行系统推演已启动')
      this.addLog('info', '正在加载作战任务数据...')

      // 启动计时器
      this.simulationTimer = setInterval(() => {
        this.simulationElapsed++
      }, 1000)

      // 模拟推演进度
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += Math.random() * 8 + 2
        if (progress >= 100) {
          progress = 100
          clearInterval(progressInterval)
          this.completeSimulation()
        }
        this.simulationProgress = Math.min(Math.round(progress), 100)

        // 根据进度添加日志
        if (progress > 20 && progress < 25) {
          this.addLog('info', '数据链保障方案分析完成')
        }
        if (progress > 45 && progress < 50) {
          this.addLog('info', '作战计划路径规划完成')
        }
        if (progress > 70 && progress < 75) {
          this.addLog('info', '多场景并行推演进行中...')
        }
        if (progress > 90 && progress < 95) {
          this.addLog('info', '效能评估计算中...')
        }
      }, 300)
    },

    // 完成推演
    completeSimulation() {
      this.clearSimulationTimer()
      this.simulationStatus = {text: '已完成', class: 'status-completed'}
      this.addLog('success', '平行系统推演完成！')
      this.addLog('info', '正在生成推演报告...')

      // 生成模拟结果数据
      this.generateSimulationResults()

      setTimeout(() => {
        this.activeTab = 'simulationResult'
        this.$message.success('推演完成，请查看结果')
      }, 1500)
    },

    // 生成推演结果
    generateSimulationResults() {
      // 统计数据
      this.resultStats = {
        simulationCount: Math.floor(Math.random() * 50) + 100,
        successRate: (Math.random() * 15 + 80).toFixed(1),
        avgTime: (Math.random() * 20 + 30).toFixed(1),
        keyNodes: Math.floor(Math.random() * 10) + 15
      }

      // 效能评估数据
      this.efficiencyData = [
        {
          metric: '通信覆盖率',
          value: '95.2%',
          standard: '≥90%',
          deviation: '+5.2',
          level: '优秀',
          comment: '网络覆盖良好，满足作战需求'
        },
        {
          metric: '数据传输延迟',
          value: '45ms',
          standard: '≤50ms',
          deviation: '-10.0',
          level: '优秀',
          comment: '延迟控制优异，实时性强'
        },
        {
          metric: '链路可靠性',
          value: '98.7%',
          standard: '≥95%',
          deviation: '+3.7',
          level: '良好',
          comment: '链路稳定性达到预期标准'
        },
        {
          metric: '抗干扰能力',
          value: '87.3%',
          standard: '≥85%',
          deviation: '+2.3',
          level: '良好',
          comment: '干扰环境下表现稳定'
        },
        {
          metric: '资源利用率',
          value: '76.5%',
          standard: '≥70%',
          deviation: '+6.5',
          level: '中等',
          comment: '资源配置合理，有优化空间'
        }
      ]

      // 关键事件
      this.keyEvents = [
        {
          time: 'T+00:05:23',
          type: '链路建立',
          description: '主数据链路成功建立，通信质量优良',
          impact: '高'
        },
        {
          time: 'T+00:12:45',
          type: '干扰检测',
          description: '检测到敌方电子干扰，自动切换备用频段',
          impact: '中'
        },
        {
          time: 'T+00:28:10',
          type: '节点故障',
          description: '中继节点#3出现短暂离线，冗余链路接管',
          impact: '低'
        },
        {
          time: 'T+00:45:30',
          type: '性能优化',
          description: '动态调整传输功率，提升边缘节点信号强度',
          impact: '中'
        },
        {
          time: 'T+01:02:15',
          type: '任务完成',
          description: '所有预定作战任务按计划完成',
          impact: '高'
        }
      ]

      // 优化建议
      this.optimizationSuggestions = [
        {
          title: '增强边缘节点覆盖',
          content:
            '建议在战区边缘区域增加2-3个中继节点，可提升整体覆盖率至98%以上，特别改善西南方向的信号盲区问题。',
          priority: '高'
        },
        {
          title: '优化抗干扰策略',
          content:
            '当前抗干扰算法在复杂电磁环境下响应速度较慢，建议引入AI驱动的动态频率跳变机制，预计可提升抗干扰能力15%。',
          priority: '中'
        },
        {
          title: '完善冗余备份机制',
          content:
            '关键节点应配置双冗余备份，当前单点故障风险较高。建议为指挥中枢和核心中继站增加热备节点。',
          priority: '高'
        },
        {
          title: '提升资源调度效率',
          content:
            '通过优化频谱分配算法，可将资源利用率从76.5%提升至85%以上，同时降低能耗约12%。',
          priority: '中'
        },
        {
          title: '加强态势感知能力',
          content:
            '建议整合多源情报数据，构建更完善的战场态势图，提升对突发情况的预警和响应能力。',
          priority: '低'
        }
      ]
    },

    // 添加日志
    addLog(level, message) {
      const now = new Date()
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`

      this.simulationLogs.push({
        time: timeStr,
        level: level,
        message: message
      })

      // 自动滚动到底部
      this.$nextTick(() => {
        if (this.$refs.logContainer) {
          this.$refs.logContainer.scrollTop =
            this.$refs.logContainer.scrollHeight
        }
      })
    },

    // 清空日志
    clearLogs() {
      this.simulationLogs = []
    },

    // 清除计时器
    clearSimulationTimer() {
      if (this.simulationTimer) {
        clearInterval(this.simulationTimer)
        this.simulationTimer = null
      }
    },

    // 格式化耗时
    formatElapsedTime(seconds) {
      if (seconds < 60) return `${seconds}秒`
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}分${secs}秒`
    },

    // 获取偏差率样式类
    getDeviationClass(deviation) {
      const val = parseFloat(deviation)
      if (val > 0) return 'text-green'
      if (val < 0) return 'text-red'
      return 'text-gray'
    },

    // 获取等级类型
    getLevelType(level) {
      const typeMap = {
        优秀: 'success',
        良好: 'primary',
        中等: 'warning',
        较差: 'danger'
      }
      return typeMap[level] || 'info'
    },

    // 获取事件类型标签
    getEventTypeTag(type) {
      const typeMap = {
        链路建立: 'success',
        干扰检测: 'warning',
        节点故障: 'danger',
        性能优化: 'primary',
        任务完成: 'success'
      }
      return typeMap[type] || 'info'
    },

    // 获取影响程度样式
    getImpactClass(impact) {
      const classMap = {
        高: 'text-red',
        中: 'text-orange',
        低: 'text-green'
      }
      return classMap[impact] || 'text-gray'
    },

    // 获取建议优先级标签
    getSuggestionPriority(priority) {
      const typeMap = {
        高: 'danger',
        中: 'warning',
        低: 'info'
      }
      return typeMap[priority] || 'info'
    },

    // 导出推演报告
    handleExportResult() {
      this.$message.success('推演报告导出功能开发中...')
    },

    // 应用推演结果
    handleApplyResult() {
      this.$confirm('确定将推演结果应用到当前作战方案？', '确认应用', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message.success('推演结果已成功应用')
        })
        .catch(() => {})
    },

    // 重新推演
    handleResetSimulation() {
      this.activeTab = 'planSelection'
      this.simulationStatus = {text: '未开始', class: 'status-idle'}
      this.simulationProgress = 0
      this.simulationElapsed = 0
      this.simulationLogs = []
      this.resultStats = {
        simulationCount: 0,
        successRate: 0,
        avgTime: 0,
        keyNodes: 0
      }
      this.efficiencyData = []
      this.keyEvents = []
      this.optimizationSuggestions = []
      this.$message.info('已重置推演状态')
    }
  }
}
</script>

<style scoped>
/* 全局大屏总控 */
.screen-container {
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);
  color: var(--color-text-main);
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.top-search-header {
  height: 46px;
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
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
  color: var(--color-primary);
}

.search-flex {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-item label {
  font-size: 11px;
  color: var(--color-text-muted);
}

.action-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
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

.left-tree-panel {
  width: 380px;
  flex-shrink: 0;
  background: var(--bg-base);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 11px;
  display: flex;
  flex-direction: column;
}

.task-scroll-box {
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

/* Tabs 样式 */
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
  border-bottom: 1px solid var(--border-dark) !important;
  background: transparent;
}

::v-deep .dark-tabs .el-tabs__nav-wrap::after {
  display: none !important;
}

::v-deep .dark-tabs .el-tabs__item {
  color: var(--color-disabled);
  font-size: 12px;
  font-weight: bold;
  height: 34px;
  line-height: 34px;
}

::v-deep .dark-tabs .el-tabs__item.is-active {
  color: var(--color-primary) !important;
}

::v-deep .dark-tabs .el-tabs__active-bar {
  background-color: var(--color-primary);
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

/* 任务卡片样式 */
.task-item-card {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

.task-active {
  border-color: var(--color-primary) !important;
  background: var(--bg-panel) !important;
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rw-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.status-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
}

.tag-active {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}

.tag-pending {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}

.task-card-body {
  font-size: 11px;
  color: var(--color-text-muted);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px 8px;
}

.panel-header-summary {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-dark);
  padding-bottom: 8px;
  flex-shrink: 0;
}

.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.panel-header-summary .badge {
  font-size: 11px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}

/* font-num */

.text-blue {
  color: var(--color-primary) !important;
}

.text-green {
  color: var(--color-success) !important;
}

.text-cyan {
  color: var(--color-cyan) !important;
}

.text-orange {
  color: var(--color-warning) !important;
}

.text-red {
  color: var(--color-danger) !important;
}

.text-gray {
  color: var(--color-disabled) !important;
}

.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 方案选择容器 */
.plan-selection-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.plan-section {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-dark);
}

.section-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.plan-content {
  min-height: 120px;
}

.plan-info-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 11px;
}

.info-label {
  color: var(--color-disabled);
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #cbd5e1;
  flex: 1;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  color: var(--color-disabled);
  gap: 8px;
}

.empty-tip p {
  font-size: 11px;
  margin: 0;
}

.send-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 12px 0;
}

/* 推演监控容器 */
.simulation-monitor-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.monitor-status-bar {
  display: flex;
  gap: 24px;
  padding: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.status-label {
  color: var(--color-disabled);
}

.status-value {
  font-weight: bold;
}

.status-idle {
  color: var(--color-disabled);
}

.status-running {
  color: var(--color-cyan);
}

.status-completed {
  color: var(--color-success);
}

.progress-section {
  padding: 0 12px;
}

.log-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border-dark);
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
  font-size: 11px;
}

.log-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  line-height: 1.5;
}

.log-time {
  color: var(--color-disabled);
  flex-shrink: 0;
}

.log-message {
  color: var(--color-text-muted);
  flex: 1;
}

.log-item.info .log-message {
  color: var(--color-text-muted);
}

.log-item.success .log-message {
  color: var(--color-success);
}

.log-item.warning .log-message {
  color: var(--color-warning);
}

.log-item.error .log-message {
  color: var(--color-danger);
}

/* 结果展示容器 */
.result-display-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
}

.result-overview {
  flex-shrink: 0;
}

.overview-card {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
}

.card-header {
  padding: 11px 12px;
  border-bottom: 1px solid var(--border-dark);
}

.card-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.card-body {
  padding: 12px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 11px;
  color: var(--color-disabled);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
}

.result-details {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.inner-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

::v-deep .inner-tabs .el-tabs__content {
  flex: 1;
  overflow: hidden;
}

.result-table-wrapper {
  height: 100%;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  overflow-y: auto;
}

.suggestion-item {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestion-index {
  width: 20px;
  height: 20px;
  background: var(--color-primary);
  color: #03060c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
}

.suggestion-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  flex: 1;
}

.suggestion-content {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.6;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 12px 0;
  flex-shrink: 0;
}
</style>
