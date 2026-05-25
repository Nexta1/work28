<template>
  <div class="killchain-page">
    <!-- 1. 杀伤链态势控制台 -->
    <div class="status-workspace">
      <div class="workspace-header">
        <div class="brand">
          <i class="el-icon-aim"></i>
          <span>杀伤链执行态势控制台</span>
        </div>
        <div class="task-info">
          <span class="label">当前任务:</span>
          <el-select
            v-model="currentTaskName"
            size="mini"
            @change="handleTaskChange"
            class="dark-select"
          >
            <el-option
              v-for="t in taskList"
              :key="t.ZZRWID"
              :label="t.RWMC"
              :value="t.RWMC"
            />
          </el-select>
        </div>
        <div class="state-legend">
          <div class="legend-title">状态标识</div>
          <div class="legend-items">
            <div
              v-for="(cfg, key) in stateConfigs"
              :key="key"
              class="legend-item"
            >
              <span
                class="legend-dot"
                :style="{backgroundColor: cfg.color}"
              ></span>
              <span class="legend-label">{{ cfg.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="status-cards-container">
        <div
          v-for="item in xxList"
          :key="item.KILLCHAIN_ID"
          :class="[
            'status-card',
            {'is-active': currentKillChainId === item.KILLCHAIN_ID},
            getStatusClass(item.KILLCHAIN_STATE)
          ]"
          @click="selectKillChain(item)"
        >
          <div class="card-tag">#{{ item.KILLCHAIN_ID }}</div>
          <div class="card-main">
            <div class="target-info">
              <span class="mbmc">{{ item.MBMC || '未知目标' }}</span>
              <span class="mbid">ID:{{ item.MBID }}</span>
            </div>
            <div class="property">
              {{ item.KILLCHAIN_TARGET_PROPERTY || '默认属性' }}
            </div>
          </div>
          <div class="card-status">
            <span
              class="phase"
              :style="{color: phaseColors[item.KILLCHAIN_EXECUTEPHASE].border}"
            >
              {{ phraseMap[item.KILLCHAIN_EXECUTEPHASE] }}
            </span>
            <span class="warn" v-if="item.Killchain_Warn > 0">
              <i class="el-icon-warning-outline"></i>{{ item.Killchain_Warn }}
            </span>
          </div>
          <div class="alarm-light" v-if="item.KILLCHAIN_STATE === 2"></div>
        </div>
      </div>
    </div>

    <!-- 2. 主体展示区 -->
    <div class="main-content">
      <div id="container" ref="container"></div>
      <!-- <div class="sidebar-panel">
        <div class="panel-title">
          <i class="el-icon-pie-chart"></i> 阶段资源分布
        </div>
        <div ref="resChart" class="chart-container"></div>
        <div class="group-info-box" :class="{'group-flash': groupNameChanged}">
          <div class="label">当前协同群组</div>
          <div class="value">{{ currentGroupName || '等待同步...' }}</div>
        </div>
      </div> -->
    </div>
    <!-- 详情悬浮窗 -->
    <!-- 自定义右侧详情面板 -->
    <transition name="slide-fade">
      <div v-if="detailDrawerVisible" class="custom-detail-panel">
        <!-- 头部：带有关闭按钮和渐变边框 -->
        <div class="panel-header">
          <div class="header-title">
            <i class="el-icon-info"></i>
            <span>平台设备详情</span>
          </div>
          <i
            class="el-icon-close close-btn"
            @click="detailDrawerVisible = false"
          ></i>
        </div>

        <div class="panel-content" v-if="currentSelectedPt">
          <h2 class="pt-main-title">
            {{ currentSelectedPt.PTMC || '未知平台' }}
          </h2>
          <div class="custom-tab-header">
            <div
              class="tab-item"
              :class="{active: activeTab === 'device'}"
              @click="activeTab = 'device'"
            >
              设备详情
            </div>
            <div
              class="tab-item"
              :class="{active: activeTab === 'warn'}"
              @click="handleWarnTabClick"
            >
              告警信息
              <span v-if="warnList.length" class="warn-dot"></span>
            </div>
          </div>
          <div class="tab-container" v-if="currentSelectedPt">
            <!-- 1. 设备详情内容 (你原有的代码放这里) -->
            <div v-show="activeTab === 'device'" class="tab-pane-content">
              <!-- 传感器部分 -->
              <div class="device-section">
                <div class="section-tag tag-cgq">
                  传感器 ({{ (currentSelectedPt.cgqxxs || []).length }})
                </div>
                <div
                  v-for="item in currentSelectedPt.cgqxxs"
                  :key="item.CGQXXID"
                  class="device-item-card"
                >
                  <div class="item-header">
                    <i class="el-icon-radar"></i>
                    <span class="item-name">{{ item.CGQMC }}</span>
                  </div>
                  <div class="item-detail">
                    <span>类型: {{ item.CGQLX || '未知' }}</span>
                    <span>探测范围: {{ item.TCFW }}km</span>
                  </div>
                </div>
              </div>

              <!-- 武器部分 -->
              <div class="device-section">
                <div class="section-tag tag-wq">
                  武器装备 ({{ (currentSelectedPt.wqxxs || []).length }})
                </div>
                <div
                  v-for="item in currentSelectedPt.wqxxs"
                  :key="item.WQXXID"
                  class="device-item-card card-wq"
                >
                  <div class="item-header">
                    <i class="el-icon-aim"></i>
                    <span class="item-name">{{ item.WQMC }}</span>
                  </div>
                  <div class="item-detail">
                    <span>型号: {{ item.WQXHMC }}</span>
                    <span>打击范围: {{ item.DJFW }}km</span>
                  </div>
                </div>
              </div>

              <!-- 其他设备 -->
              <div
                class="device-section"
                v-if="currentSelectedPt.sbzts && currentSelectedPt.sbzts.length"
              >
                <div class="section-tag tag-sb">
                  通用设备 ({{ currentSelectedPt.sbzts.length }})
                </div>
                <div
                  v-for="item in currentSelectedPt.sbzts"
                  :key="item.SBXXID"
                  class="device-item-card card-sb"
                >
                  <div class="item-header">
                    <i class="el-icon-set-up"></i>
                    <span class="item-name">{{ item.SBMC }}</span>
                  </div>
                  <div class="item-detail">
                    <span>型号: {{ item.SBXHMC }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. 告警信息内容 -->
            <div
              v-show="activeTab === 'warn'"
              class="tab-pane-content"
              v-loading="loadingWarn"
            >
              <div v-if="warnList.length === 0" class="empty-warn">
                <i class="el-icon-circle-check"></i> 暂无告警记录
              </div>

              <div
                v-for="(warn, index) in warnList.slice(0, 5)"
                :key="index"
                class="warn-item-box"
              >
                <div
                  class="warn-side-line"
                  :style="{
                    backgroundColor: (warnLevelMap[warn.warnLevel] || {}).color
                  }"
                ></div>
                <div class="warn-main">
                  <div class="warn-top">
                    <span
                      class="warn-level-tag"
                      :style="{
                        color: (warnLevelMap[warn.warnLevel] || {}).color
                      }"
                    >
                      {{ (warnLevelMap[warn.warnLevel] || {}).label }}
                    </span>
                    <span class="warn-time">{{
                      formatWarnTime(warn.warnTimestamp)
                    }}</span>
                  </div>
                  <!-- 这里的 warnContent 按需使用正则清洗标签 -->
                  <div class="warn-msg">
                    {{
                      warn.warnContent
                        ? warn.warnContent.replace(/<[^>]+>/g, '')
                        : '-'
                    }}
                  </div>
                  <div class="warn-footer">
                    <span>状态: {{ warn.warnState }}</span>
                    <span>来源: {{ warn.srcPlatformName }}</span>
                  </div>
                </div>
              </div>
              <div v-if="warnList.length > 0" class="warn-more-tip">
                更多告警信息请前往
                <span class="highlight">系统运维 / 告警信息</span> 查看
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <SideDetails
      :visible="listDialogVisible"
      :listData="currentPhaseMembers"
      :themeColor="currentThemeColor"
      @close="listDialogVisible = false"
      @select="setCurrentSelectedPt"
    />
  </div>
</template>

<script>
import {Graph} from '@antv/x6'
import {register} from '@antv/x6-vue-shape'

import PtNode from './components/PtNode.vue'
import {taskGetPage} from '@/api/task'
import SideDetails from './components/SideDetails.vue'
import {
  getSslxxPage,
  getSslqzPage,
  getSslqzcyPage,
  getptxPage,
  getptWarnInfos
} from '@/api/killchain'

register({shape: 'pt-node', width: 185, height: 115, component: PtNode})

export default {
  name: 'KillChainPro',
  components: {SideDetails},
  data() {
    return {
      warnTimer: null, // 定时器句柄
      activeTab: 'device', // 默认选中设备详情
      loadingWarn: false,
      warnList: [],
      // 映射关系
      warnLevelMap: {
        1: {label: '一般', color: '#E6A23C'},
        2: {label: '紧急', color: '#F56C6C'},
        3: {label: '很严重', color: '#9d0000'}
      },
      detailDrawerVisible: false,
      currentSelectedPt: {cgqxxs: [], wqxxs: []},
      listDialogVisible: false,
      currentPhaseMembers: [],
      currentThemeColor: '',
      stateConfigs: {
        1: {color: '#10b981', label: '正常', animation: 'pulse-normal'}, // 绿
        2: {color: '#ef4444', label: '异常', animation: 'pulse-error'}, // 红
        3: {color: '#64748b', label: '完成', animation: 'none'}, // 灰
        4: {color: '#f59e0b', label: '中止', animation: 'pulse-warn'} // 橙
      },
      lastGroupId: null, // 新增：用于缓存判断
      graph: null,
      chart: null,
      timer: null,
      isPolling: false,
      taskList: [],
      xxList: [],
      currentTaskName: '',
      currentKillChainId: null,
      currentGroupName: '',
      groupNameChanged: false,
      lastPhaseState: {}, // 格式: { Killchain_Group_Member_PltID: phase }
      phraseMap: {
        0: '发现',
        1: '定位',
        2: '跟踪',
        3: '瞄准',
        4: '打击',
        5: '评估'
      },
      // 核心 6 阶段配色
      phaseColors: {
        0: {bg: '#161d2b', border: '#3b82f6'}, // 蓝
        1: {bg: '#1a1b2e', border: '#8b5cf6'}, // 紫
        2: {bg: '#142421', border: '#10b981'}, // 绿
        3: {bg: '#2a221a', border: '#f59e0b'}, // 橙
        4: {bg: '#281a1a', border: '#ef4444'}, // 红
        5: {bg: '#1a221e', border: '#14b8a6'} // 青
      }
    }
  },
  watch: {
    currentSelectedPt: {
      immediate: true,
      handler(val) {
        if (val && val.PTID) {
          this.warnList = [] // 清空旧数据
          this.fetchWarnInfos() // 立即刷新
          this.resetWarnTimer() // 重置 20s 定时器
        }
      }
    },
    // 离开组件或关闭面板时销毁定时器
    visible(val) {
      if (!val) this.clearWarnTimer()
    }
  },
  async mounted() {
    this.initGraph()
    // this.initChart()
    await this.loadTasks()
    this.startPolling()
    window.addEventListener('resize', this.handleResize)
  }, // 组件销毁生命周期钩子
  beforeDestroy() {
    this.clearWarnTimer()
  },
  methods: {
    // 核心刷新逻辑
    async fetchWarnInfos() {
      if (!this.currentSelectedPt || !this.currentSelectedPt.PTID) return
      try {
        const res = await getptWarnInfos(this.currentSelectedPt.PTID)
        this.warnList = res.data.data
      } catch (e) {
        console.error('轮询告警失败', e)
      }
    }, // 重置定时器
    resetWarnTimer() {
      this.clearWarnTimer()
      this.warnTimer = setInterval(() => {
        this.fetchWarnInfos()
      }, 20000) // 20秒刷新一次
    },

    // 清除定时器
    clearWarnTimer() {
      if (this.warnTimer) {
        clearInterval(this.warnTimer)
        this.warnTimer = null
      }
    },
    async runSyncWorkflow() {
      try {
        // 1. 获取杀伤链列表
        const resXX = await getSslxxPage({RWMC: this.currentTaskName})
        this.xxList = resXX.data.data.list || []
        if (this.xxList.length === 0) return

        // 确定当前活跃的杀伤链对象
        const activeItem =
          this.xxList.find(i => i.KILLCHAIN_ID === this.currentKillChainId) ||
          this.xxList[0]

        // 如果切换了杀伤链 ID，必须清空缓存强制重绘
        if (this.currentKillChainId !== activeItem.KILLCHAIN_ID) {
          this.currentKillChainId = activeItem.KILLCHAIN_ID
          this.lastFingerprint = null // 切换 ID 时重置指纹
        }

        // 2. 获取群组信息
        const resQZ = await getSslqzPage({
          KILLCHAIN_ID: this.currentKillChainId
        })
        const groups = resQZ.data.data.list || []

        if (groups.length > 0) {
          // 获取最新的群组信息
          const firstGroup = groups[groups.length - 1]
          const currentGroupId = firstGroup.SSLQZID

          /**
           * 【核心修复点】：构建变更指纹
           * 只有这三个关键维度都不变时，才跳过渲染。
           * 包含：群组ID + 执行阶段 + 杀伤链状态
           */
          const currentFingerprint = `${currentGroupId}_${activeItem.KILLCHAIN_EXECUTEPHASE}_${activeItem.KILLCHAIN_STATE}`

          if (this.lastFingerprint === currentFingerprint) {
            console.log('数据状态未变化（群组/阶段/状态），跳过重绘')
            return
          }

          // --- 触发变更动画逻辑 ---
          if (this.lastGroupId && this.lastGroupId !== currentGroupId) {
            this.groupNameChanged = true
            setTimeout(() => {
              this.groupNameChanged = false
            }, 2000)
          }

          // 更新缓存标识
          this.lastFingerprint = currentFingerprint
          this.lastGroupId = currentGroupId
          this.currentGroupName = currentGroupId

          // 3. 调用成员加载并重绘（此时 activeItem 包含最新的 PHASE 和 STATE）
          await this.loadMembersAndRender(currentGroupId, activeItem)
        }
      } catch (e) {
        console.error('Sync Error:', e)
      }
    },

    async loadMembersAndRender(groupName, activeItem) {
      const resCY = await getSslqzcyPage(this.currentKillChainId, groupName)
      const rawMembers = resCY.data.data.list || []
      const members = await Promise.all(
        rawMembers.map(async m => {
          try {
            const resPT = await getptxPage(m.Killchain_Group_Member_PltID) // 假设接口入参是 ptid
            const data = resPT.data.data || {}

            return {
              ...m,
              ptDetail: data
            }
          } catch (e) {
            return m
          }
        })
      )

      // 检测哪些阶段发生了人员变动
      const changedStages = new Set()
      members.forEach(m => {
        const prevPhase = this.lastPhaseState[m.Killchain_Group_Member_PltID]

        if (prevPhase !== undefined && prevPhase !== m.killchain_EXECUTEPHASE) {
          changedStages.add(m.killchain_EXECUTEPHASE) // 目标阶段闪烁
        }
        this.lastPhaseState[m.Killchain_Group_Member_PltID] =
          m.killchain_EXECUTEPHASE
      })

      // 传入 activeItem 用于识别最新阶段
      this.renderGraph(members, activeItem)
      // this.updateChart(members)
    },

    renderGraph(members, activeKillChain) {
      // console.log(members)
      if (!this.graph) return
      this.graph.clearCells()

      // 1. 基础配置定义
      const stages = [0, 1, 2, 3, 4, 5]
      // 状态配置：1正常(绿), 2异常(红), 3完成(灰), 4中止(橙)
      const stateConfigs = {
        1: {color: '#10b981', className: 'state-normal'},
        2: {color: '#ef4444', className: 'state-error'},
        3: {color: '#94a3b8', className: 'state-done'},
        4: {color: '#f59e0b', className: 'state-stop'}
      }

      // 获取当前链条的实时状态与阶段
      const currentPhase = activeKillChain
        ? activeKillChain.KILLCHAIN_EXECUTEPHASE
        : -1
      const currentState = activeKillChain ? activeKillChain.KILLCHAIN_STATE : 1
      const activeStateCfg = stateConfigs[currentState] || stateConfigs[1]

      stages.forEach((sKey, idx) => {
        const stageX = idx * 235 + 30
        const phaseCfg = this.phaseColors[sKey] // 引用你 data 中的 6 阶段配色
        const isLatest = sKey == currentPhase

        // 2. 绘制主体泳道 (Swimlane)
        const lane = this.graph.addNode({
          x: stageX,
          y: 15,
          width: 210,
          height: 690,
          zIndex: 1,
          label: `STAGE 0${idx + 1} · ${this.phraseMap[sKey]}`,
          attrs: {
            body: {
              // 只有最新阶段挂载状态闪烁类名
              class: isLatest
                ? `swimlane-body swimlane-active-${currentState}`
                : 'swimlane-body',
              fill: phaseCfg.bg,
              stroke: isLatest ? activeStateCfg.color : phaseCfg.border,
              strokeWidth: isLatest ? 3 : 1,
              rx: 4,
              ry: 4
            },
            label: {
              refY: 25,
              fill: isLatest ? '#ffffff' : '#94A3B8',
              fontSize: 12,
              fontWeight: isLatest ? 'bold' : 'normal',
              textShadow: isLatest ? `0 0 10px ${activeStateCfg.color}` : 'none'
            }
          }
        })

        // 3. 绘制右上角状态标识小圆点 (Status Dot)
        if (isLatest) {
          this.graph.addNode({
            x: stageX + 188,
            y: 22,
            width: 10,
            height: 10,
            zIndex: 10,
            attrs: {
              body: {
                fill: activeStateCfg.color,
                stroke: '#ffffff',
                strokeWidth: 1.5,
                rx: 5,
                ry: 5,
                class: currentState === 2 ? 'dot-alarm-blink' : '' // 仅异常时圆点剧烈闪烁
              }
            }
          })
        }
        const allStageMembers = members.filter(
          m => m.killchain_EXECUTEPHASE == sKey
        )
        const displayMembers = allStageMembers
          .slice(0, 4)
          .filter(m => m.killchain_EXECUTEPHASE == sKey) // 只取前4个
        const hasMore = allStageMembers.length > 4
        // 4. 渲染平台成员 (PT Nodes)
        // const stageMembers = members.filter(
        //   m => m.killchain_EXECUTEPHASE == sKey
        // )

        // 3. 如果超过4个，添加“查看更多”按钮节点
        if (hasMore) {
          this.graph.addNode({
            x: stageX + 12,
            y: 70 + 4 * 145, // 排在第5个位置
            width: 185,
            height: 36,
            zIndex: 12,
            markup: [
              {tagName: 'rect', selector: 'body'},
              {tagName: 'text', selector: 'label'}
            ],
            attrs: {
              body: {
                fill: 'rgba(59, 130, 246, 0.1)',
                stroke: 'rgba(59, 130, 246, 0.5)',
                strokeDasharray: '4 2',
                rx: 4,
                ry: 4,
                cursor: 'pointer'
              },
              label: {
                text: `查看更多 (${allStageMembers.length}) ...`,
                fill: '#60a5fa',
                fontSize: 12,
                cursor: 'pointer'
              }
            },
            data: {
              type: 'MORE_BTN',
              phase: sKey,
              members: allStageMembers // 将全量数据挂载到按钮上
            }
          })
        }
        displayMembers.forEach((m, mIdx) => {
          this.graph.addNode({
            shape: 'pt-node',
            x: stageX + 12,
            y: 80 + mIdx * 155,
            width: 185, // 显式固定宽度
            height: 140, // 显式固定高度
            zIndex: 10,
            data: {
              ...m,
              themeColor: isLatest ? activeStateCfg.color : phaseCfg.border,
              isHighlight: isLatest
            }
          })
        })
      })
    },
    async handleWarnTabClick() {
      this.activeTab = 'warn'
      this.loadingWarn = true
      await this.fetchWarnInfos()
      this.loadingWarn = false
    },
    formatWarnTime(ts) {
      if (!ts) return ''
      const date = new Date(Number(ts))
      return `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
    },
    async loadTasks() {
      const res = await taskGetPage({pageNum: 1, pageSize: 100})
      this.taskList = res.data.list || []
      if (this.taskList.length > 0) this.currentTaskName = this.taskList[0].RWMC
    },
    selectKillChain(item) {
      this.currentKillChainId = item.KILLCHAIN_ID
      this.lastGroupId = null // 重置缓存
      this.lastPhaseState = {}
      this.runSyncWorkflow()
    },
    // 切换任务时重置状态
    /**
     * 处理任务切换（下拉框或列表切换）
     */
    handleTaskChange() {
      // 1. 清空当前业务状态
      this.currentKillChainId = null
      this.currentGroupName = ''

      // 2. 核心：重置所有检测缓存
      // 必须同时重置 lastGroupId 和 lastFingerprint，确保下次轮询强制重绘
      this.lastGroupId = null
      this.lastFingerprint = null

      // 3. (可选) 清理画布，给用户一个“正在加载”的视觉预期
      if (this.graph) {
        this.graph.clearCells()
      }

      // 4. 立即执行一次同步流程
      this.runSyncWorkflow()
    },
    getStatusClass(state) {
      return {1: 'is-normal', 2: 'is-error', 3: 'is-done', 4: 'is-stop'}[state]
    },
    // ... 其他辅助函数如 initGraph, initChart, loadTasks 保持原逻辑 ...
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        background: {color: '#0f172a'},
        panning: true,
        interacting: {
          nodeMovable: false, // 禁止所有节点拖动
          edgeMovable: false // 禁止边移动
        },
        mousewheel: true
      })
      this.graph.on('node:click', ({node}) => {
        const data = node.getData()

        if (data && data.type === 'MORE_BTN') {
          this.currentPhaseMembers = data.members
          this.currentThemeColor = data.themeColor
          this.listDialogVisible = true
          return
        }
        if (node.shape === 'pt-node' && data.ptDetail) {
          this.setCurrentSelectedPt(data.ptDetail)
        }
      })
    },
    setCurrentSelectedPt(ptDetail) {
      this.currentSelectedPt = ptDetail // 将接口获取的完整详情传给弹窗
      this.detailDrawerVisible = true
    },
    // 修改后的启动函数
    async startPolling() {
      // 1. 立即执行第一次同步
      this.isPolling = true
      await this.runSyncWorkflow()
      this.isPolling = false

      // 2. 开启定时器
      this.timer = setInterval(async () => {
        if (this.isPolling) return
        this.isPolling = true
        await this.runSyncWorkflow()
        this.isPolling = false
      }, 15000)
    }
  }
}
</script>
<style scoped>
.group-flash {
  animation: group-bg-flash 1s 2;
}
@keyframes group-bg-flash {
  50% {
    background: #14b8a6;
    color: #fff;
  }
}
.killchain-page {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  color: #f8fafc;
  overflow: hidden;
}

/* 顶部态势空间 */
.status-workspace {
  background: #111827;
  padding: 12px 20px;
  border-bottom: 1px solid #1f2937;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #14b8a6;
  font-weight: bold;
}

.status-cards-container {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

/* 卡片样式 */
.status-card {
  min-width: 200px;
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 6px;
  padding: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}
.status-card.is-active {
  border-color: #14b8a6;
  background: #111827;
  box-shadow: 0 0 10px rgba(20, 184, 166, 0.2);
}

.card-tag {
  font-size: 10px;
  color: #64748b;
  font-family: monospace;
}
.target-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 4px 0;
}
.mbmc {
  font-weight: bold;
  font-size: 14px;
}
.mbid {
  font-size: 11px;
  color: #475569;
}
.property {
  font-size: 12px;
  color: #94a3b8;
}
.card-status {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  border-top: 1px solid #374151;
  padding-top: 6px;
}
.phase {
  font-size: 11px;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}
.warn {
  color: #ef4444;
  font-size: 11px;
  font-weight: bold;
}

/* 状态色条 */
.is-normal {
  border-left: 3px solid #10b981;
}
.is-error {
  border-left: 3px solid #ef4444;
}
.is-done {
  border-left: 3px solid #64748b;
  opacity: 0.7;
}
.is-stop {
  border-left: 3px solid #f59e0b;
}

/* 报警呼吸灯 */
.alarm-light {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  animation: alarm-blink 1s infinite;
}

@keyframes alarm-blink {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 8px #ef4444;
  }
  50% {
    opacity: 0.3;
    box-shadow: 0 0 0px #ef4444;
  }
}

/* 主视图 */
.main-content {
  flex: 1;
  display: flex;
}
#container {
  flex: 1;
}

.sidebar-panel {
  width: 280px;
  background: #111827;
  border-left: 1px solid #1f2937;
  padding: 15px;
  display: flex;
  flex-direction: column;
}

.group-info-box {
  margin-top: auto;
  background: #1f2937;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #374151;
}
.group-info-box .label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
}
.group-info-box .value {
  font-weight: bold;
  color: #14b8a6;
  font-size: 14px;
}

/* 群组名称变动闪烁 */
.group-flash {
  animation: group-bg-flash 1s 2;
}

@keyframes group-bg-flash {
  0%,
  100% {
    background: #1f2937;
  }
  50% {
    background: #14b8a6;
    color: #fff;
  }
}

/* 覆盖暗色 Select */
.dark-select ::v-deep .el-input__inner {
  background-color: #1f2937 !important;
  border: 1px solid #374151 !important;
  color: #fff !important;
}

/* 基础样式 */
::v-deep .swimlane-body {
  transition: stroke 0.3s, stroke-width 0.3s;
}

/* 激活态闪烁动画 */
::v-deep .swimlane-active-flash {
  animation: swimlane-glow 1.5s ease-in-out infinite;
}

@keyframes swimlane-glow {
  0% {
    stroke-width: 1;
    filter: drop-shadow(0 0 0px #fff);
  }
  50% {
    stroke-width: 3;
    stroke: #ffffff; /* 闪烁时变白 */
    filter: drop-shadow(0 0 8px #ffffff);
  }
  100% {
    stroke-width: 1;
    filter: drop-shadow(0 0 0px #fff);
  }
} /* 移除之前的白色闪烁，改为基于主题色的柔和呼吸 */
::v-deep .swimlane-latest-flash {
  animation: latest-stage-pulse 2s ease-in-out infinite;
}

@keyframes latest-stage-pulse {
  0% {
    stroke-width: 2;
    fill-opacity: 0.7;
    filter: brightness(1);
  }
  50% {
    stroke-width: 4;
    fill-opacity: 1;
    /* 利用 brightness 提升当前主题色的亮度，产生发光感而非白光 */
    filter: brightness(1.4) drop-shadow(0 0 12px currentColor);
  }
  100% {
    stroke-width: 2;
    fill-opacity: 0.7;
    filter: brightness(1);
  }
}
/* 基础泳道样式 */
::v-deep .swimlane-body {
  transition: all 0.5s ease;
}

/* 状态 1: 正常执行 (绿光呼吸) */
::v-deep .swimlane-active-1 {
  animation: pulse-normal 2.5s infinite;
}

/* 状态 2: 异常 (红光急促呼吸) */
::v-deep .swimlane-active-2 {
  animation: pulse-error 1.2s infinite;
}

/* 状态 3: 完成 (灰色静止，无动画) */
::v-deep .swimlane-active-3 {
  filter: grayscale(0.5);
}

/* 状态 4: 中止 (橙光呼吸) */
::v-deep .swimlane-active-4 {
  animation: pulse-stop 2.5s infinite;
}

/* 动画定义：使用亮度增强和投影，避免白光 */
@keyframes pulse-normal {
  50% {
    filter: brightness(1.3) drop-shadow(0 0 12px #10b981);
    stroke-width: 4;
  }
}

@keyframes pulse-error {
  50% {
    filter: brightness(1.5) drop-shadow(0 0 18px #ef4444);
    stroke-width: 5;
  }
}

@keyframes pulse-stop {
  50% {
    filter: brightness(1.3) drop-shadow(0 0 12px #f59e0b);
    stroke-width: 4;
  }
}

/* 异常状态的小圆点报警动画 */
::v-deep .dot-alarm-blink {
  animation: alarm-dot 0.6s infinite;
}

@keyframes alarm-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.3);
  }
}
.state-legend {
  background: rgba(31, 41, 55, 0.5);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #374151;
}

.legend-title {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 10px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  /* 增加一个淡淡的外边框和发光，使其更立体 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 4px currentColor;
}

.legend-label {
  font-size: 11px;
  color: #d1d5db;
}

/* 针对侧边栏标题的微调 */
.panel-title {
  margin-top: 10px;
  font-size: 14px;
  color: #f8fafc;
  display: flex;
  align-items: center;
  gap: 8px;
}
/* 面板主体 */
.custom-detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 380px;
  height: 100%;
  background: rgba(15, 23, 42, 0.95); /* 深蓝色背景 */
  backdrop-filter: blur(10px);
  border-left: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.panel-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  color: #3b82f6;
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  cursor: pointer;
  color: #94a3b8;
  font-size: 20px;
  transition: color 0.3s;
}
.close-btn:hover {
  color: #ef4444;
}

/* 内容区域 */
.panel-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.pt-main-title {
  font-size: 20px;
  color: #f8fafc;
  margin-bottom: 24px;
  padding-left: 10px;
  border-left: 4px solid #3b82f6;
}

/* 栏目标签 */
.section-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
  display: inline-block;
}
.tag-cgq {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}
.tag-wq {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}
.tag-sb {
  background: rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
}

/* 设备卡片 */
.device-item-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 12px;
  transition: transform 0.2s;
}
.device-item-card:hover {
  transform: translateX(-5px);
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(59, 130, 246, 0.4);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #f1f5f9;
}

.item-name {
  font-weight: bold;
  font-size: 14px;
}

.item-detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
  padding-left: 22px;
}

/* 进场动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
} /* Tab 头部样式 */
.custom-tab-header {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
  gap: 24px;
}

.tab-item {
  padding: 10px 4px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  transition: all 0.3s;
}

.tab-item:hover {
  color: #fff;
}

.tab-item.active {
  color: #3b82f6;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #3b82f6;
  box-shadow: 0 -2px 10px rgba(59, 130, 246, 0.5);
}

.warn-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  background: #f87171;
  border-radius: 50%;
  margin-left: 4px;
  vertical-align: top;
}

/* 告警条目样式 */
.warn-item-box {
  background: rgba(255, 255, 255, 0.03);
  margin-bottom: 12px;
  display: flex;
  border-radius: 4px;
  overflow: hidden;
}

.warn-side-line {
  width: 4px;
  flex-shrink: 0;
}

.warn-main {
  padding: 12px;
  flex: 1;
}

.warn-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.warn-level-tag {
  font-size: 12px;
  font-weight: bold;
}

.warn-time {
  font-size: 12px;
  color: #475569;
}

.warn-msg {
  font-size: 13px;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 8px;
}

.warn-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #64748b;
}

.empty-warn {
  text-align: center;
  padding: 40px 0;
  color: #475569;
  font-size: 13px;
}
.warn-more-tip {
  text-align: center;
  padding: 15px 0 30px;
  color: #64748b;
  font-size: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.05);
  margin-top: 20px;
}

.warn-more-tip .highlight {
  color: #3b82f6;
  margin: 0 4px;
  font-weight: 500;
}

/* 优化滚动条，确保底部提示可见 */
.tab-pane-content {
  max-height: calc(100vh - 180px);
  overflow-y: auto;
}
</style>
