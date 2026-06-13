<template>
  <div
    class="killchain-page"
    v-loading="isPolling && xxList.length === 0"
    element-loading-background="rgba(15, 23, 42, 0.9)"
  >
    <div class="status-workspace-header">
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

      <div class="state-legend-inline">
        <span class="legend-title">状态标识:</span>
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
        <el-button
          size="mini"
          icon="el-icon-rank"
          class="fit-screen-btn"
          @click="handleFitScreen"
          title="适配屏幕大小"
        >
          适配屏幕
        </el-button>
        <el-button
          size="mini"
          icon="el-icon-question"
          class="help-btn"
          @click="showGuide = true"
          title="界面使用说明"
        >
          使用说明
        </el-button>
      </div>
    </div>

    <div class="main-content-canvas-area">
      <kill-chain-canvas
        ref="killChainCanvasRef"
        :members="graphMembers"
        :active-kill-chain="activeKillChainObject"
        @click-pt="setCurrentSelectedPt"
        @click-more="handleCanvasMoreBtn"
      />
    </div>

    <div class="left-status-drawer" :class="{'is-hidden': !leftControlVisible}">
      <div
        class="drawer-toggle-trigger"
        @click="leftControlVisible = !leftControlVisible"
        :title="leftControlVisible ? '收起控制舱' : '展开控制舱'"
      >
        <i
          :class="
            leftControlVisible ? 'el-icon-arrow-left' : 'el-icon-arrow-right'
          "
        ></i>
        <span class="trigger-txt">{{
          leftControlVisible ? '收起面板' : '展开面板'
        }}</span>
      </div>

      <div class="drawer-inner-body" v-if="leftControlVisible">
        <div class="panel-section-title">
          <div class="pulse-indicator"></div>
          <span>多目标杀伤链流水</span>
        </div>

        <div class="status-cards-scroll-container">
          <div v-if="xxList.length === 0" class="empty-data-hint">
            暂无当前任务流转快照
          </div>
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
                <span class="mbid">标识:{{ item.MBID }}</span>
              </div>
              <div class="property">
                属性: {{ item.KILLCHAIN_TARGET_PROPERTY || '常规战术要素' }}
              </div>
            </div>
            <div class="card-status">
              <span class="phase">
                {{ phraseMap[item.KILLCHAIN_EXECUTEPHASE] || '初始' }}
              </span>
              <span class="warn" v-if="item.Killchain_Warn > 0">
                <i class="el-icon-warning-outline"></i> 告警({{
                  item.Killchain_Warn
                }})
              </span>
            </div>
            <div class="alarm-light" v-if="item.KILLCHAIN_STATE === 2"></div>
          </div>
        </div>

        <div
          class="group-info-footer-box"
          :class="{'group-flash': groupNameChanged}"
        >
          <div class="lbl">当前战术协同群组标识</div>
          <div class="val font-mono">
            {{ currentGroupName || '等待数据链同步...' }}
          </div>
        </div>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="detailDrawerVisible" class="custom-detail-panel">
        <div class="panel-header">
          <div class="header-title">
            <i class="el-icon-info"></i>
            <span>平台设备遥测详情</span>
          </div>
          <i
            class="el-icon-close close-btn"
            @click="detailDrawerVisible = false"
          ></i>
        </div>

        <div class="panel-content" v-if="currentSelectedPt">
          <h2 class="pt-main-title">
            {{ currentSelectedPt.PTMC || '未命名平台' }}
          </h2>
          <div class="custom-tab-header">
            <div
              class="tab-item"
              :class="{active: activeTab === 'device'}"
              @click="activeTab = 'device'"
            >
              设备要素
            </div>
            <div
              class="tab-item"
              :class="{active: activeTab === 'warn'}"
              @click="handleWarnTabClick"
            >
              实时告警
              <span v-if="warnList.length" class="warn-dot"></span>
            </div>
          </div>

          <div class="tab-container">
            <div v-show="activeTab === 'device'" class="tab-pane-content">
              <!-- 数据链网络信息 -->
              <div class="device-section">
                <div class="section-tag tag-wl">
                  <i class="el-icon-connection"></i>
                  数据链网络 ({{ (currentSelectedPt.sbzts || []).length }})
                </div>
                <div class="device-item-card card-wl">
                  <div class="item-header">
                    <i class="el-icon-s-data"></i>
                    <span class="item-name"
                      >数据链 ID:
                      {{ currentSelectedPt.SJLID || '未接入' }}</span
                    >
                  </div>
                  <div
                    v-for="item in currentSelectedPt.sbzts"
                    :key="item.SBXXID"
                    class="wl-sub-item"
                  >
                    <div class="wl-sub-header">
                      <i class="el-icon-monitor"></i>
                      <span class="wl-dev-name">{{ item.SBMC }}</span>
                      <span
                        class="wl-health-tag"
                        :class="
                          'health-' +
                          (item.JKZT !== null && item.JKZT !== undefined
                            ? item.JKZT
                            : 0)
                        "
                      >
                        {{
                          {0: '运行中', 1: '未运行', 2: '故障'}[item.JKZT] ||
                          '未知'
                        }}
                      </span>
                    </div>
                    <div class="wl-sub-detail">
                      <span>型号: {{ item.SBXHMC || '-' }}</span>
                      <span>类型: {{ item.SBLX || '-' }}</span>
                    </div>
                    <div
                      class="wl-sub-metrics"
                      v-if="
                        (item.CPU !== null && item.CPU !== undefined) ||
                        (item.RAM !== null && item.RAM !== undefined)
                      "
                    >
                      <span v-if="item.CPU !== null && item.CPU !== undefined"
                        >CPU: {{ item.CPU }}%</span
                      >
                      <span v-if="item.RAM !== null && item.RAM !== undefined"
                        >内存: {{ item.RAM }}%</span
                      >
                      <span v-if="item.TEMP !== null && item.TEMP !== undefined"
                        >温度: {{ item.TEMP }}°C</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="!(currentSelectedPt.sbzts || []).length"
                    class="wl-empty-hint"
                  >
                    暂无数据链通信设备
                  </div>
                </div>
              </div>

              <div class="device-section">
                <div class="section-tag tag-cgq">
                  传感器元件 ({{ (currentSelectedPt.cgqxxs || []).length }})
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
                    <span>体制: {{ item.CGQLX || '未知' }}</span>
                    <span>覆盖范围: {{ item.TCFW }} 公里</span>
                  </div>
                </div>
              </div>

              <div class="device-section">
                <div class="section-tag tag-wq">
                  武器拦截荷载 ({{ (currentSelectedPt.wqxxs || []).length }})
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
                    <span>打击波段范围: {{ item.DJFW }} 公里</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-show="activeTab === 'warn'"
              class="tab-pane-content"
              v-loading="loadingWarn"
            >
              <div v-if="warnList.length === 0" class="empty-warn">
                <i class="el-icon-circle-check"></i> 本轮周期暂无越限告警
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
                    <span class="warn-time font-mono">{{
                      formatWarnTime(warn.warnTimestamp)
                    }}</span>
                  </div>
                  <div class="warn-msg">
                    {{
                      warn.warnContent
                        ? warn.warnContent.replace(/<[^>]+>/g, '')
                        : '-'
                    }}
                  </div>
                  <div class="warn-footer">
                    <span>业务态: {{ warn.warnState }}</span>
                    <span>网元来源: {{ warn.srcPlatformName }}</span>
                  </div>
                </div>
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

    <!-- ============================================================
         界面使用引导弹窗
         ============================================================ -->
    <transition name="slide-fade">
      <div
        v-if="showGuide"
        class="guide-overlay"
        @click.self="showGuide = false"
      >
        <div class="guide-dialog">
          <div class="guide-header">
            <i class="el-icon-info"></i>
            <span>杀伤链态势控制台 - 界面使用说明</span>
            <i class="el-icon-close close-btn" @click="showGuide = false"></i>
          </div>
          <div class="guide-body">
            <div class="guide-section">
              <div class="guide-step">①</div>
              <div class="guide-content">
                <div class="guide-title">顶部工具栏</div>
                <div class="guide-desc">
                  左侧<strong>「当前任务」</strong>下拉框选择作战任务，切换后画布自动刷新。<br />
                  右侧<strong>「状态标识」</strong>彩色圆点说明当前杀伤链执行状态（正常/异常/完成/中止）。<br />
                  <strong>「适配屏幕」</strong
                  >按钮可自动缩放画布至最佳显示比例。
                </div>
              </div>
            </div>
            <div class="guide-section">
              <div class="guide-step">②</div>
              <div class="guide-content">
                <div class="guide-title">左侧控制舱（多目标杀伤链流水）</div>
                <div class="guide-desc">
                  点击<strong>「展开面板」</strong>按钮可查看当前任务下的所有杀伤链卡片。<br />
                  每张卡片显示<strong>目标名称</strong>、<strong>执行阶段</strong>和<strong>告警数量</strong>。<br />
                  <strong>点击卡片</strong
                  >可切换当前查看的杀伤链，画布内容同步更新。<br />
                  底部的<strong>「当前战术协同群组标识」</strong>显示最近一次刷新的群组编号。
                </div>
              </div>
            </div>
            <div class="guide-section">
              <div class="guide-step">③</div>
              <div class="guide-content">
                <div class="guide-title">主画布区（杀伤链执行泳道图）</div>
                <div class="guide-desc">
                  画布按杀伤链执行阶段分为 <strong>6 个泳道</strong>：发现 →
                  定位 → 跟踪 → 瞄准 → 打击 → 评估。<br />
                  当前执行阶段所在泳道会<strong>高亮显示</strong>并带有呼吸光效。<br />
                  每个泳道中包含参与该阶段的<strong>平台节点卡片</strong>，显示平台名称、传感器和武器信息。<br />
                  <strong>点击平台节点</strong
                  >可打开右侧详情面板查看完整设备要素。<br />
                  若平台数量超过 4
                  个，泳道底部会出现<strong>「查看更多」</strong>按钮。
                </div>
              </div>
            </div>
            <div class="guide-section">
              <div class="guide-step">④</div>
              <div class="guide-content">
                <div class="guide-title">右侧详情面板（平台设备遥测详情）</div>
                <div class="guide-desc">
                  「设备要素」标签页展示该平台的<strong>传感器</strong>和<strong>武器</strong>详细信息。<br />
                  「实时告警」标签页展示该平台最近的<strong>越限告警</strong>记录，每
                  20 秒自动刷新。<br />
                  告警级别以颜色区分：<span class="tag-warn-l1">一般</span>、
                  <span class="tag-warn-l2">紧急</span>、
                  <span class="tag-warn-l3">极严重</span>。
                </div>
              </div>
            </div>
          </div>
          <div class="guide-footer">
            <span>提示：数据每 15 秒自动刷新同步</span>
            <el-button size="mini" type="primary" @click="showGuide = false">
              我知道了
            </el-button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import KillChainCanvas from '../../components/KillChainCanvas.vue'
import SideDetails from '../../components/SideDetails.vue'
import {taskGetPage} from '@/api/task'
import {
  getSslxxPage,
  getSslqzPage,
  getSslqzcyPage,
  getptxPage,
  getptWarnInfos
} from '@/api/killchain'

export default {
  name: 'KillChainProSituation',
  components: {
    KillChainCanvas,
    SideDetails
  },
  data() {
    return {
      showGuide: false, // 控制使用说明弹窗
      leftControlVisible: false, // 控制左侧控制舱的折叠
      isPolling: false,
      timer: null,
      warnTimer: null,
      activeTab: 'device',
      loadingWarn: false,
      warnList: [],
      warnLevelMap: {
        1: {label: '一般', color: '#E6A23C'},
        2: {label: '紧急', color: '#F56C6C'},
        3: {label: '极严重', color: '#9d0000'}
      },
      detailDrawerVisible: false,
      currentSelectedPt: {cgqxxs: [], wqxxs: []},
      listDialogVisible: false,
      currentPhaseMembers: [],
      currentThemeColor: '',
      stateConfigs: {
        1: {color: '#10b981', label: '正常执行'},
        2: {color: '#ef4444', label: '态势异常'},
        3: {color: '#94a3b8', label: '流程完成'},
        4: {color: '#f59e0b', label: '指挥中止'}
      },
      taskList: [],
      xxList: [],
      currentTaskName: '',
      currentKillChainId: null,
      currentGroupName: '',
      groupNameChanged: false,
      lastFingerprint: null,
      lastGroupId: null,
      graphMembers: [], // 传递给画布组件的精简成员属性
      activeKillChainObject: null, // 传递给画布的当前高亮杀伤链快照
      networkLinks: [], // 当前群组的杀伤链网络规划列表 (sslWLGHs)
      phraseMap: {
        0: '发现',
        1: '定位',
        2: '跟踪',
        3: '瞄准',
        4: '打击',
        5: '评估'
      }
    }
  },
  watch: {
    currentSelectedPt: {
      immediate: true,
      handler(val) {
        if (val && val.PTID) {
          this.warnList = []
          this.fetchWarnInfos()
          this.resetWarnTimer()
        }
      }
    }
  },
  async mounted() {
    await this.loadTasks()
    this.startPolling()
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    this.clearWarnTimer()
  },
  methods: {
    async loadTasks() {
      const res = await taskGetPage({pageNum: 1, pageSize: 100})
      this.taskList = res.data.list || []
      if (this.taskList.length > 0) this.currentTaskName = this.taskList[0].RWMC
    },
    async startPolling() {
      this.isPolling = true
      await this.runSyncWorkflow()
      this.isPolling = false

      this.timer = setInterval(async () => {
        if (this.isPolling) return
        this.isPolling = true
        await this.runSyncWorkflow()
        this.isPolling = false
      }, 15000)
    },
    async runSyncWorkflow() {
      try {
        const resXX = await getSslxxPage({RWMC: this.currentTaskName})
        this.xxList = resXX.data?.list || resXX.data?.records || []
        if (this.xxList.length === 0) {
          this.graphMembers = []
          this.activeKillChainObject = null
          return
        }

        const activeItem =
          this.xxList.find(i => i.KILLCHAIN_ID === this.currentKillChainId) ||
          this.xxList[0]
        this.activeKillChainObject = activeItem

        if (this.currentKillChainId !== activeItem.KILLCHAIN_ID) {
          this.currentKillChainId = activeItem.KILLCHAIN_ID
          this.lastFingerprint = null
        }

        const resQZ = await getSslqzPage({
          KILLCHAIN_ID: this.currentKillChainId
        })
        const groups = resQZ.data?.list || resQZ.data?.records || []

        if (groups.length > 0) {
          const firstGroup = groups[groups.length - 1]
          const currentGroupId = firstGroup.SSLQZID
          const currentFingerprint = `${currentGroupId}_${activeItem.KILLCHAIN_EXECUTEPHASE}_${activeItem.KILLCHAIN_STATE}`

          if (this.lastFingerprint === currentFingerprint) {
            return
          }

          if (this.lastGroupId && this.lastGroupId !== currentGroupId) {
            this.groupNameChanged = true
            setTimeout(() => {
              this.groupNameChanged = false
            }, 2000)
          }

          this.lastFingerprint = currentFingerprint
          this.lastGroupId = currentGroupId
          this.currentGroupName = currentGroupId

          // 保存当前群组的杀伤链网络规划列表
          this.networkLinks = firstGroup.sslWLGHs || []

          // 核心拉取动作
          await this.loadMembersData(currentGroupId)
        }
      } catch (e) {
        console.error('控制台同步核心错误:', e)
      }
    },
    async loadMembersData(groupName) {
      const resCY = await getSslqzcyPage(this.currentKillChainId, groupName)
      const rawMembers = resCY.data?.list || resCY.data?.records || []

      // 从 networkLinks(sslWLGHs) 中构建平台ID→网络连接映射
      const linkMap = {}
      this.networkLinks.forEach(link => {
        const srcId = link.YPTID
        const dstId = link.MDPTID
        const connInfo = {
          targetId: dstId,
          targetName: link.MDPTMC || '未知平台',
          srcName: link.YPTMC || '未知平台',
          sendMode: link.FSFS,
          bandwidth: link.DK,
          latency: link.SY,
          xxlx: link.XXLX
        }
        if (srcId != null) {
          if (!linkMap[srcId]) linkMap[srcId] = []
          linkMap[srcId].push({...connInfo, direction: 'out'})
        }
        if (dstId != null) {
          if (!linkMap[dstId]) linkMap[dstId] = []
          linkMap[dstId].push({...connInfo, direction: 'in'})
        }
      })

      this.graphMembers = await Promise.all(
        rawMembers.map(async m => {
          try {
            const resPT = await getptxPage(m.Killchain_Group_Member_PltID)
            const ptId = m.Killchain_Group_Member_PltID
            // 附加网络连接信息
            const connections = linkMap[ptId] || []
            return {
              ...m,
              ptDetail: resPT.data || resPT || {},
              netConnections: connections
            }
          } catch (e) {
            return m
          }
        })
      )
    },
    handleTaskChange() {
      this.currentKillChainId = null
      this.currentGroupName = ''
      this.lastGroupId = null
      this.lastFingerprint = null
      this.graphMembers = []
      this.activeKillChainObject = null
      this.runSyncWorkflow()
    },
    selectKillChain(item) {
      this.currentKillChainId = item.KILLCHAIN_ID
      this.lastGroupId = null
      this.lastFingerprint = null
      this.runSyncWorkflow()
    },
    setCurrentSelectedPt(ptDetail) {
      this.currentSelectedPt = ptDetail
      this.detailDrawerVisible = true
    },
    handleCanvasMoreBtn(btnData) {
      this.currentPhaseMembers = btnData.members
      this.currentThemeColor = btnData.themeColor
      this.listDialogVisible = true
    },
    handleFitScreen() {
      if (this.$refs.killChainCanvasRef) {
        this.$refs.killChainCanvasRef.handleGraphResize()
      }
    },
    async fetchWarnInfos() {
      if (!this.currentSelectedPt || !this.currentSelectedPt.PTID) return
      try {
        const res = await getptWarnInfos(this.currentSelectedPt.PTID)
        this.warnList = res.data || res || []
      } catch (e) {
        console.error('遥测告警加载失败:', e)
      }
    },
    resetWarnTimer() {
      this.clearWarnTimer()
      this.warnTimer = setInterval(() => {
        this.fetchWarnInfos()
      }, 20000)
    },
    clearWarnTimer() {
      if (this.warnTimer) {
        clearInterval(this.warnTimer)
        this.warnTimer = null
      }
    },
    async handleWarnTabClick() {
      this.activeTab = 'warn'
      this.loadingWarn = true
      await this.fetchWarnInfos()
      this.loadingWarn = false
    },
    formatWarnTime(ts) {
      if (!ts) return '--:--:--'
      const date = new Date(Number(ts))
      return date.toLocaleTimeString('zh-CN', {hour12: false})
    },
    getStatusClass(state) {
      return (
        {1: 'is-normal', 2: 'is-error', 3: 'is-done', 4: 'is-stop'}[state] ||
        'is-normal'
      )
    }
  }
}
</script>

<style scoped>
/* ==========================================================================
   一、基础大底座 (100% 高度流，绝无 vw/vh)
   ========================================================================== */
.killchain-page {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  color: #f8fafc;
  overflow: hidden;
}

/* ==========================================================================
   二、顶部控制信息检索栏
   ========================================================================== */
.status-workspace-header {
  height: 54px;
  background: #111827;
  border-bottom: 1px solid #1f2937;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 1001;
}
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #14b8a6;
  font-weight: bold;
  font-size: 14px;
}
.task-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.task-info .label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
}
.dark-select ::v-deep .el-input__inner {
  background-color: #1f2937 !important;
  border: 1px solid #374151 !important;
  color: #fff !important;
  width: 240px;
}
.state-legend-inline {
  display: flex;
  align-items: center;
  gap: 11px;
}
.state-legend-inline .legend-title {
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
}
.legend-items {
  display: flex;
  gap: 14px;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  box-shadow: 0 0 4px currentColor;
}
.legend-label {
  font-size: 11px;
  color: #cbd5e1;
}

/* 适配屏幕按钮样式 */
.fit-screen-btn {
  margin-left: 8px;
}
.fit-screen-btn ::v-deep {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
  color: #14b8a6 !important;
}
.fit-screen-btn:hover ::v-deep {
  background-color: #374151 !important;
  border-color: #14b8a6 !important;
  color: #fff !important;
}

/* ==========================================================================
   三、主画布展示层：全自适应底座，永不被左侧或右侧组件挤变形
   ========================================================================== */
.main-content-canvas-area {
  position: absolute;
  top: 54px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1; /* 处于面板下一层 */
  overflow: hidden;
}

/* ==========================================================================
   四、左侧独立浮动控制舱 (绝对定位不占物理图层)
   ========================================================================== */
.left-status-drawer {
  position: absolute;
  top: 66px;
  left: 12px;
  bottom: 12px;
  width: 290px;
  background: rgba(17, 24, 39, 0.9);
  backdrop-filter: blur(6px);
  border: 1px solid #1f2937;
  border-radius: 4px;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  display: flex;
}
.left-status-drawer.is-hidden {
  transform: translateX(-302px); /* 隐藏移出视图 */
}

/* 侧边微挂件拉柄 */
.drawer-toggle-trigger {
  position: absolute;
  right: -22px;
  top: 40%;
  width: 22px;
  padding: 12px 0;
  background: #111827;
  border: 1px solid #1f2937;
  border-left: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #14b8a6;
}
.drawer-toggle-trigger:hover {
  background: #1f2937;
  color: #fff;
}
.drawer-toggle-trigger .trigger-txt {
  font-size: 9px;
  writing-mode: vertical-lr;
  font-weight: bold;
}

.drawer-inner-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  overflow: hidden;
}
.panel-section-title {
  height: 28px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #1f2937;
  margin-bottom: 11px;
  font-size: 12px;
  font-weight: bold;
  color: #14b8a6;
}
.pulse-indicator {
  width: 6px;
  height: 6px;
  background: #14b8a6;
  border-radius: 50%;
  animation: simple-pulse 2s infinite;
}
@keyframes simple-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.6);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(20, 184, 166, 0);
  }
}

/* 纵向滚动列表容器 */
.status-cards-scroll-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding-right: 2px;
}
.status-cards-scroll-container::-webkit-scrollbar {
  width: 3px;
}
.status-cards-scroll-container::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 2px;
}

/* 卡片原子元素 */
.status-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 4px;
  padding: 11px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}
.status-card.is-active {
  border-color: #14b8a6;
  background: #111827;
  box-shadow: inset 0 0 6px rgba(20, 184, 166, 0.2);
}
.card-tag {
  font-size: 11px;
  color: #4b5563;
}
.target-info {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 2px 0;
}
.mbmc {
  font-weight: bold;
  font-size: 13px;
  color: #fff;
}
.mbid {
  font-size: 11px;
  color: #94a3b8;
}
.property {
  font-size: 11px;
  color: #94a3b8;
}
.card-status {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  border-top: 1px solid #2d3748;
  padding-top: 5px;
  align-items: center;
}
.phase {
  font-size: 11px;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.1);
  padding: 1px 5px;
  border-radius: 2px;
}
.warn {
  color: #ef4444;
  font-size: 11px;
  font-weight: bold;
}

.is-normal {
  border-left: 3px solid #10b981;
}
.is-error {
  border-left: 3px solid #ef4444;
}
.is-done {
  border-left: 3px solid #94a3b8;
  opacity: 0.6;
}
.is-stop {
  border-left: 3px solid #f59e0b;
}

.alarm-light {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  animation: alarm-blink 1s infinite;
}
@keyframes alarm-blink {
  0%,
  100% {
    opacity: 1;
    box-shadow: 0 0 6px #ef4444;
  }
  50% {
    opacity: 0.3;
  }
}

/* 群组底部锚定区 */
.group-info-footer-box {
  margin-top: 11px;
  background: #1f2937;
  padding: 11px;
  border-radius: 4px;
  border: 1px solid #374151;
}
.group-info-footer-box .lbl {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 2px;
}
.group-info-footer-box .val {
  font-weight: bold;
  color: #14b8a6;
  font-size: 12px;
}
.group-flash {
  animation: group-bg-flash 1s 2;
}
@keyframes group-bg-flash {
  50% {
    background: #14b8a6;
    color: #fff;
  }
}

/* ==========================================================================
   五、右侧详情面板
   ========================================================================== */
.custom-detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 360px;
  height: 100%;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(11px);
  border-left: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: -11px 0 30px rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  flex-direction: column;
}
.panel-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.header-title {
  color: #3b82f6;
  font-weight: bold;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.close-btn {
  cursor: pointer;
  color: #94a3b8;
  font-size: 18px;
}
.close-btn:hover {
  color: #ef4444;
}
.panel-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}
.pt-main-title {
  font-size: 18px;
  color: #f8fafc;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid #3b82f6;
}

.custom-tab-header {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 16px;
  gap: 20px;
}
.tab-item {
  padding: 8px 2px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 13px;
  position: relative;
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
}
.warn-dot {
  display: inline-block;
  width: 5px;
  height: 5px;
  background: #f87171;
  border-radius: 50%;
  margin-left: 3px;
  vertical-align: top;
}

.tab-pane-content {
  max-height: calc(100% - 11px);
  overflow-y: auto;
}
.device-section {
  margin-bottom: 16px;
}
.section-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
  margin-bottom: 8px;
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
.tag-wl {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}

.device-item-card {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  padding: 11px;
  margin-bottom: 8px;
}
.card-wl {
  border-color: rgba(16, 185, 129, 0.15);
}
.item-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  color: #f1f5f9;
  font-size: 12px;
}
.item-name {
  font-weight: bold;
}
.item-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: #94a3b8;
  padding-left: 18px;
}

/* 数据链网络子项 */
.wl-sub-item {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  padding: 8px;
  margin-bottom: 6px;
}
.wl-sub-item:last-child {
  margin-bottom: 0;
}
.wl-sub-header {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 3px;
  font-size: 11px;
}
.wl-dev-name {
  color: #e2e8f0;
  font-weight: bold;
  flex: 1;
}
.wl-health-tag {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 2px;
  font-weight: bold;
}
.health-0 {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}
.health-1 {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.15);
}
.health-2 {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}
.wl-sub-detail {
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #94a3b8;
  padding-left: 18px;
}
.wl-sub-metrics {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: #94a3b8;
  padding-left: 18px;
  margin-top: 2px;
}
.wl-empty-hint {
  text-align: center;
  color: #4b5563;
  font-size: 11px;
  padding: 10px 0;
}

/* 告警面板行 */
.warn-item-box {
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 11px;
  display: flex;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.02);
}
.warn-side-line {
  width: 3px;
  flex-shrink: 0;
}
.warn-main {
  padding: 11px;
  flex: 1;
}
.warn-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 11px;
}
.warn-level-tag {
  font-weight: bold;
}
.warn-time {
  color: #94a3b8;
}
.warn-msg {
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.5;
  margin-bottom: 6px;
}
.warn-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
}
.empty-warn {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
  font-size: 12px;
}

/* 进场行动画 */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.font-mono {
}
.empty-data-hint {
  text-align: center;
  color: #4b5563;
  font-size: 11px;
  padding: 40px 0;
}

/* ==========================================================================
   七、帮助按钮样式
   ========================================================================== */
.help-btn {
  margin-left: 6px;
}
.help-btn ::v-deep {
  background-color: #1f2937 !important;
  border-color: #374151 !important;
  color: #60a5fa !important;
}
.help-btn:hover ::v-deep {
  background-color: #374151 !important;
  border-color: #60a5fa !important;
  color: #fff !important;
}

/* ==========================================================================
   八、使用引导弹窗样式
   ========================================================================== */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
}
.guide-dialog {
  width: 640px;
  max-height: 80vh;
  background: #111827;
  border: 1px solid #1f2937;
  border-radius: 6px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.guide-header {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #1f2937;
  color: #14b8a6;
  font-weight: bold;
  font-size: 14px;
}
.guide-header .close-btn {
  margin-left: auto;
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
}
.guide-header .close-btn:hover {
  color: #ef4444;
}
.guide-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.guide-body::-webkit-scrollbar {
  width: 4px;
}
.guide-body::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 2px;
}
.guide-section {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 4px;
}
.guide-step {
  width: 28px;
  height: 28px;
  background: #14b8a6;
  color: #0f172a;
  font-weight: bold;
  font-size: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.guide-content {
  flex: 1;
}
.guide-title {
  color: #f1f5f9;
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
}
.guide-desc {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.8;
}
.guide-desc strong {
  color: #e2e8f0;
}
.tag-warn-l1 {
  color: #e6a23c;
  background: rgba(230, 162, 60, 0.15);
  padding: 0 4px;
  border-radius: 2px;
}
.tag-warn-l2 {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.15);
  padding: 0 4px;
  border-radius: 2px;
}
.tag-warn-l3 {
  color: #9d0000;
  background: rgba(157, 0, 0, 0.15);
  padding: 0 4px;
  border-radius: 2px;
}
.guide-footer {
  padding: 12px 20px;
  border-top: 1px solid #1f2937;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 11px;
}
</style>
