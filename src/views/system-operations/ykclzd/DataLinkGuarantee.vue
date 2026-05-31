<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">数据链保障方案生成</span>

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

      <div class="right-combined-panel">
        <div class="right-bottom-strategy-zone">
          <el-tabs v-model="activeTab" class="dark-tabs fill-tabs">
            <el-tab-pane name="dataLinkTab" class="full-pane">
              <span slot="label">分级运控方案</span>
              <div class="pane-content-box" style="height: 100%">
                <OperationalControlScheme
                  :selected-task="selectedRw"
                  :platformTreeNodes="platformTreeNodes"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane name="rwqzTab" class="full-pane">
              <span slot="label">任务群组方案</span>
              <div class="pane-content-box" style="height: 100%">
                <TaskGroupScheme
                  :selected-task="selectedRw"
                  :platformTreeNodes="platformTreeNodes"
                  :platformList="platformList"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {taskGetPage, getOrganizationByTaskId} from '@/api/task'

import {getYXJMap} from '@/api/map'
import {buildTree} from '@/utils'
import OperationalControlScheme from '../components/OperationalControlScheme.vue'
import TaskGroupScheme from '../components/TaskGroupScheme.vue'

export default {
  name: 'ZzrwOrchestrationDashboard',
  components: {
    OperationalControlScheme,
    TaskGroupScheme
  },
  data() {
    return {
      activeTab: 'dataLinkTab', // 修正初始活跃 Tab 为唯一存在的 dataLinkTab
      rwxxList: [],
      platformList: [],
      platformTreeNodes: [],
      selectedRw: null,
      queryParam: {RWMC: ''},
      yxjMap: getYXJMap ? getYXJMap() : {1: '低', 2: '重要', 3: '高'}
    }
  },
  mounted() {
    this.initGlobalDashboard()
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
    /**
     * 格式化任务时长（秒转为合适的单位显示）
     * 优化策略：
     * - 小于1分钟：显示秒
     * - 1分钟~1小时：显示分钟
     * - 1小时~24小时：显示小时（+分钟）
     * - 1天~30天：显示天（+小时）
     * - 超过30天：显示天
     */
    formatTaskDuration(seconds) {
      if (!seconds && seconds !== 0) return '--'
      const totalSeconds = Number(seconds / 1000)

      // 小于1分钟，显示秒
      if (totalSeconds < 60) {
        return `${totalSeconds} 秒`
      }

      const minutes = Math.floor(totalSeconds / 60)

      // 小于1小时，显示分钟
      if (minutes < 60) {
        return `${minutes} 分钟`
      }

      const hours = Math.floor(totalSeconds / 3600)

      // 小于24小时，显示小时和剩余分钟
      if (hours < 24) {
        const remainingMinutes = minutes % 60
        return remainingMinutes > 0
          ? `${hours} 小时 ${remainingMinutes} 分钟`
          : `${hours} 小时`
      }

      const days = Math.floor(hours / 24)

      // 小于30天，显示天和剩余小时
      if (days < 30) {
        const remainingHours = hours % 24
        return remainingHours > 0
          ? `${days} 天 ${remainingHours} 小时`
          : `${days} 天`
      }

      // 超过30天，只显示天数
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
        console.log(this.platformTreeNodes)
      })
    },

    taskCardActiveClass(rw) {
      const curId = this.selectedRw
        ? this.selectedRw.ZZRWID || this.selectedRw.zzrwid
        : null
      return {'task-active': curId && curId === (rw.ZZRWID || rw.zzrwid)}
    }
  }
}
</script>

<style scoped>
/* 全局大屏总控 */
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
  gap: 16px;
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
.left-tree-panel {
  width: 380px;
  flex-shrink: 0;
  background: #080e18;
  border: 1px solid #111b2b;
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
.right-bottom-strategy-zone {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* 极致去白线处理 */
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

.task-item-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}
.task-active {
  border-color: #38bdf8 !important;
  background: #13253e !important;
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
  color: #10b981;
}
.tag-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.task-card-body {
  font-size: 11px;
  color: #94a3b8;
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
  font-size: 11px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}

/* font-num */
.text-blue {
  color: #38bdf8 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
