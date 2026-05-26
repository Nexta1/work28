<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">📡 战术场景网链策略综合控制大屏</span>
        <div class="search-item">
          <label>网络组网体制</label>
          <select
            v-model="listQuery.WLLX"
            @change="handleSearch"
            class="global-select"
          >
            <option value="">全部体制方案</option>
            <option
              v-for="(label, value) in wllxMapData"
              :key="value"
              :value="Number(value)"
            >
              {{ label }}
            </option>
          </select>
        </div>
      </div>
      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          class="action-btn"
          @click="handleCreate"
        >
          新增战略策略
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="resetSearch"
        >
          重置全局遥测
        </el-button>
      </div>
    </div>

    <div class="main-body-layout" v-loading="listLoading">
      <div class="task-matrix-grid">
        <div
          v-for="(taskName, taskTypeKey) in taskTypeMap"
          :key="taskTypeKey"
          class="monitor-column-panel"
          :class="{'is-active-panel': activeTaskType === Number(taskTypeKey)}"
          @click="activeTaskType = Number(taskTypeKey)"
        >
          <div class="panel-header-summary">
            <span class="title">⚔️ {{ taskName }}</span>
            <span class="badge font-num text-cyan">
              {{ getTaskStrategyList(taskTypeKey).length }} 条
            </span>
          </div>

          <div class="scroll-container-box">
            <div
              v-if="getTaskStrategyList(taskTypeKey).length === 0"
              class="sub-empty"
            >
              暂无配置策略
            </div>

            <div
              v-for="item in getTaskStrategyList(taskTypeKey)"
              :key="item.scenarioStrategyId"
              class="link-status-card compact-card"
              :class="{
                'is-active': activeStrategyId === item.scenarioStrategyId
              }"
              @click.stop="viewStrategyDetail(item)"
            >
              <div
                class="alarm-strip"
                :class="
                  Number(item.latencyRequirement) <= 100
                    ? 'strip-level-safe'
                    : 'strip-level-crit'
                "
              ></div>

              <div class="card-line">
                <span
                  class="wl-name ellipsis-text"
                  style="max-width: 140px"
                  :title="item.strategyName"
                >
                  <small class="text-cyan"
                    >#{{ item.scenarioStrategyId }}</small
                  >
                  {{ item.strategyName || '未命名策略' }}
                </span>
                <span
                  class="freq-value font-num text-cyan ellipsis-text"
                  style="max-width: 100px"
                >
                  {{
                    wllxMapData[
                      item.WLLX !== undefined ? item.WLLX : item.wllx
                    ] || '混合宽频'
                  }}
                </span>
              </div>

              <div class="card-line metric-line">
                <span class="metric-item"
                  >📶
                  <span class="text-blue">{{
                    item.bandwidthRequirement || 0
                  }}</span
                  >M</span
                >
                <span class="metric-item"
                  >⏱️
                  <span class="text-orange">{{
                    item.latencyRequirement || 0
                  }}</span
                  >ms</span
                >
                <span class="metric-item"
                  >👥
                  <span class="text-green">{{
                    item.WLCYSL || item.wlcysl || 0
                  }}</span
                  >机</span
                >
                <span class="metric-item"
                  >📍
                  <span class="text-cyan">{{
                    item.memberPTXHIDs
                      ? item.memberPTXHIDs.split(',').length
                      : 0
                  }}</span
                  >型</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      title="📋 战术网链策略 · 详细信息总线"
      :visible.sync="detailVisible"
      width="520px"
      custom-class="dark-custom-dialog"
      append-to-body
    >
      <div v-if="selectedDetail" class="dialog-detail-matrix">
        <div class="detail-row">
          <span class="lbl">策略识别号</span
          ><span class="val font-num text-cyan"
            >#{{ selectedDetail.scenarioStrategyId }}</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">策略控制名称</span
          ><span class="val text-blue font-num">{{
            selectedDetail.strategyName || '未指定'
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">作战任务分类</span
          ><span class="val text-orange">{{
            taskTypeMap[selectedDetail.taskType] || '未知任务'
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">组网体制方案</span
          ><span class="val text-green">{{
            wllxMapData[
              selectedDetail.WLLX !== undefined
                ? selectedDetail.WLLX
                : selectedDetail.wllx
            ] || '常规多载波体制'
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">规划带宽需求</span
          ><span class="val font-num text-blue"
            >{{ selectedDetail.bandwidthRequirement }} Mbps</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">高敏延迟需求</span
          ><span class="val font-num text-orange"
            >{{ selectedDetail.latencyRequirement }} ms</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">网链成员数量</span
          ><span class="val font-num"
            >{{ selectedDetail.WLCYSL || selectedDetail.wlcysl }} 机/艇</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">操作安全员</span
          ><span class="val font-num text-gray">{{
            selectedDetail.opUserName || '管理员'
          }}</span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl">时间戳下发序列</span
          ><span class="val font-num text-gray">{{
            selectedDetail.opTime || '-'
          }}</span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl">激活外设业务谱系</span
          ><span class="val text-cyan">{{
            selectedDetail.serviceTypes || '暂无业务'
          }}</span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl"
            >协同联合作战平台列表 ({{
              selectedDetail.memberPTXHIDs
                ? selectedDetail.memberPTXHIDs.split(',').length
                : 0
            }}
            型)</span
          >
          <span class="val text-blue font-platform-list">
            {{
              selectedDetail.memberPTXHNames ||
              formatPlatformIds(selectedDetail.memberPTXHIDs)
            }}
          </span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl">安全认证保障保障指引</span
          ><span class="val" style="color: #94a3b8">{{
            selectedDetail.safeRequirement || '未设定特殊限制'
          }}</span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="warning"
          size="mini"
          class="action-btn"
          @click="handleUpdateFromDetail"
          >编辑此策略</el-button
        >
        <el-button
          type="danger"
          size="mini"
          class="action-btn"
          style="background: #ef4444; border: none"
          @click="handleDeleteFromDetail"
          >熔断删除</el-button
        >
        <el-button
          @click="detailVisible = false"
          size="mini"
          style="background: #172438; border: 1px solid #1e3557; color: #cbd5e1"
          >关 闭</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="580px"
      custom-class="dark-custom-dialog"
      append-to-body
      @close="resetForm"
    >
      <el-form :model="form" ref="dataForm" label-width="110px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">策略控制名称</span>
            <input
              type="text"
              v-model="form.strategyName"
              class="inner-input"
              placeholder="例如：指挥协同策略01"
            />
          </div>
          <div class="detail-row">
            <span class="lbl">任务类型调度</span>
            <select v-model="form.taskType" class="inner-select">
              <option
                v-for="(label, value) in taskTypeMap"
                :key="value"
                :value="Number(value)"
              >
                {{ label }}
              </option>
            </select>
          </div>
          <div class="detail-row">
            <span class="lbl">网络组网体制类型</span>
            <select v-model="form.WLLX" class="inner-select">
              <option
                v-for="(label, value) in wllxMapData"
                :key="value"
                :value="Number(value)"
              >
                {{ label }}
              </option>
            </select>
          </div>
          <div class="detail-row">
            <span class="lbl">网链成员数量</span>
            <input
              type="number"
              v-model.number="form.WLCYSL"
              class="inner-input"
            />
          </div>
          <div class="detail-row">
            <span class="lbl">高敏延迟需求 (ms)</span>
            <input
              type="text"
              v-model="form.latencyRequirement"
              class="inner-input"
            />
          </div>
          <div class="detail-row">
            <span class="lbl">规划带宽需求 (Mbps)</span>
            <input
              type="text"
              v-model="form.bandwidthRequirement"
              class="inner-input"
            />
          </div>
          <div class="detail-row">
            <span class="lbl">成员配额比例 (%)</span>
            <input
              type="number"
              v-model.number="form.memberScale"
              class="inner-input"
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">激活业务谱系 (多选)</span>
            <div class="checkbox-matrix">
              <el-checkbox-group v-model="form.serviceTypesArray">
                <el-checkbox
                  v-for="item in serviceTypeList"
                  :key="item"
                  :label="item"
                  >{{ item }}</el-checkbox
                >
              </el-checkbox-group>
            </div>
          </div>
          <div class="detail-row span-2">
            <span class="lbl">作战任务平铺协同平台结构选择</span>
            <el-cascader
              v-model="form.platformIdsArray"
              :options="platformTree"
              :props="cascaderProps"
              clearable
              size="mini"
              placeholder="点击指派树形作战节点"
              style="width: 100%"
              popper-class="dark-cascader-popper"
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">安全验证保障需求简述</span>
            <textarea
              v-model="form.safeRequirement"
              rows="2"
              class="inner-input"
              style="height: 45px; resize: none"
            ></textarea>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="dialogVisible = false"
          size="mini"
          style="background: #172438; border: 1px solid #1e3557; color: #cbd5e1"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="submitForm"
          size="mini"
          :loading="submitLoading"
          >下发配置策略</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {apiPage, apiAdd, apiUpdate, apiDelete} from '@/api/common'
import {wllxMap, rwlxMap, tlywList, zzrwwlTrees} from '@/api/map'

export default {
  name: 'ScenarioStrategyCleanDashboard',
  data() {
    return {
      moduleBaseUrl: 'scenarioStrategy',
      wllxMapData: {},
      taskTypeMap: {},
      serviceTypeList: [],
      platformTree: [],
      platformFlatMap: {},

      activeTaskType: 0,
      activeStrategyId: null,

      detailVisible: false,
      selectedDetail: null,

      cascaderProps: {
        multiple: true,
        value: 'id',
        label: 'ptmc',
        children: 'children',
        emitPath: false
      },

      listLoading: false,
      globalStrategies: [],
      listQuery: {WLLX: null},

      dialogVisible: false,
      dialogTitle: '',
      submitLoading: false,

      form: {
        scenarioStrategyId: null,
        strategyName: '',
        taskType: 0,
        wllx: 0,
        WLLX: null,
        memberScale: 100,
        WLCYSL: 100,
        latencyRequirement: '100',
        bandwidthRequirement: '100',
        serviceTypes: '',
        serviceTypesArray: [],
        safeRequirement: '',
        memberPTXHIDs: '',
        platformIdsArray: []
      }
    }
  },
  created() {
    this.taskTypeMap = rwlxMap()
    this.serviceTypeList = tlywList()
  },
  async mounted() {
    await this.initRemoteDictionaries()
    this.getGlobalStrategyList()
  },
  methods: {
    async initRemoteDictionaries() {
      try {
        const wllxRes = await wllxMap()
        this.wllxMapData = wllxRes.data || wllxRes || {}
        const treeRes = await zzrwwlTrees()
        this.platformTree = this.formatTreeData(treeRes.data || treeRes || [])
        this.buildFlatMap(this.platformTree)
      } catch (e) {
        console.error('动态网络总线字典绑定异常:', e)
      }
    },
    formatTreeData(data) {
      return data.map(node => ({
        id: node.zzrwptid || node.ZZRWPTID || node.ptid || node.PTID,
        ptmc: node.ptmc || node.PTMC || node.rwmc || node.RWMC || '未知单元',
        children:
          node.children && node.children.length
            ? this.formatTreeData(node.children)
            : null
      }))
    },
    buildFlatMap(nodes) {
      nodes.forEach(node => {
        this.platformFlatMap[node.id] = node.ptmc
        if (node.children) this.buildFlatMap(node.children)
      })
    },
    formatPlatformIds(idsString) {
      if (!idsString) return '未指派联合作战节点'
      return idsString
        .split(',')
        .map(id => this.platformFlatMap[id.trim()] || `ID:${id}`)
        .join(', ')
    },

    getTaskStrategyList(type) {
      return this.globalStrategies.filter(
        item => Number(item.taskType) === Number(type)
      )
    },

    getGlobalStrategyList() {
      this.listLoading = true
      apiPage(this.moduleBaseUrl, {
        pageNum: 1,
        pageSize: 100,
        WLLX: this.listQuery.WLLX || undefined
      })
        .then(res => {
          this.globalStrategies = res.data.list || res.data || []
          this.listLoading = false
          if (this.globalStrategies.length > 0) {
            this.activeStrategyId = this.globalStrategies[0].scenarioStrategyId
            this.activeTaskType = Number(this.globalStrategies[0].taskType)
          }
        })
        .catch(() => {
          this.listLoading = false
        })
    },

    handleSearch() {
      this.getGlobalStrategyList()
    },
    resetSearch() {
      this.listQuery.WLLX = null
      this.getGlobalStrategyList()
    },

    viewStrategyDetail(item) {
      this.selectedDetail = item
      this.activeStrategyId = item.scenarioStrategyId
      this.activeTaskType = Number(item.taskType)
      this.detailVisible = true
    },

    handleUpdateFromDetail() {
      this.detailVisible = false
      this.handleUpdate(this.selectedDetail)
    },
    handleDeleteFromDetail() {
      this.detailVisible = false
      this.handleDelete(this.selectedDetail)
    },

    handleCreate() {
      this.resetForm()
      this.dialogTitle = '⚡ 下发全新网链规划策略'
      this.dialogVisible = true
    },
    handleUpdate(row) {
      this.resetForm()
      this.dialogTitle = '⚙️ 修正已有战术配置策略'
      this.form = Object.assign({}, row)
      if (this.form.WLLX === undefined && this.form.wllx !== undefined) {
        this.form.WLLX = this.form.wllx
      }
      if (this.form.WLCYSL === undefined && this.form.wlcysl !== undefined) {
        this.form.WLCYSL = this.form.wlcysl
      }
      if (this.form.serviceTypes)
        this.form.serviceTypesArray = this.form.serviceTypes.split(',')
      if (this.form.memberPTXHIDs) {
        this.form.platformIdsArray = this.form.memberPTXHIDs
          .split(',')
          .map(id => (isNaN(id) ? id : Number(id)))
      }
      this.dialogVisible = true
    },
    submitForm() {
      this.form.serviceTypes = this.form.serviceTypesArray.join(',')
      this.form.memberPTXHIDs = this.form.platformIdsArray.join(',')
      this.form.wllx = this.form.WLLX
      this.form.wlcysl = this.form.WLCYSL

      this.submitLoading = true
      if (this.form.scenarioStrategyId) {
        apiUpdate(this.moduleBaseUrl, this.form)
          .then(() => {
            this.$message.success('更新策略配置成功')
            this.dialogVisible = false
            this.getGlobalStrategyList()
            this.submitLoading = false
          })
          .catch(() => {
            this.submitLoading = false
          })
      } else {
        apiAdd(this.moduleBaseUrl, this.form)
          .then(() => {
            this.$message.success('新规划策略部署成功')
            this.dialogVisible = false
            this.getGlobalStrategyList()
            this.submitLoading = false
          })
          .catch(() => {
            this.submitLoading = false
          })
      }
    },
    handleDelete(row) {
      this.$confirm('确定注销并完全断开该战术网链控制策略?', '战略熔断警告', {
        confirmButtonText: '熔断销毁',
        cancelButtonText: '维持链路'
      }).then(() => {
        apiDelete(this.moduleBaseUrl, row.scenarioStrategyId).then(() => {
          this.$message.success('该链路策略已从控制总线剥离销毁')
          this.getGlobalStrategyList()
        })
      })
    },
    resetForm() {
      this.form = {
        scenarioStrategyId: null,
        strategyName: '',
        taskType: 0,
        wllx: 0,
        WLLX: null,
        memberScale: 100,
        WLCYSL: 100,
        latencyRequirement: '100',
        bandwidthRequirement: '100',
        serviceTypes: '',
        serviceTypesArray: [],
        safeRequirement: '',
        memberPTXHIDs: '',
        platformIdsArray: []
      }
    }
  }
}
</script>

<style scoped>
/* 使用百分百无间隙的标准盒子流，无须任何绝对定位 */
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

/* 顶层固高检索栏 */
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
.global-select {
  background: #0d1522;
  border: 1px solid #1e3557;
  color: #38bdf8;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 11px;
  outline: none;
}
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
}

/* 主体 6类分区舱：占满剩余 100% 容器空间 */
.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.task-matrix-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
  height: 100%;
  width: 100%;
}

.monitor-column-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  min-height: 0;
}
.is-active-panel {
  border-color: rgba(56, 189, 248, 0.4) !important;
  background: #091220;
}
.panel-header-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 6px;
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
}

.scroll-container-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scroll-container-box::-webkit-scrollbar {
  width: 4px;
}
.scroll-container-box::-webkit-scrollbar-thumb {
  background: #172438;
  border-radius: 2px;
}

/* 🌟 精准限高两行极简微卡片 */
.link-status-card.compact-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 3px;
  padding: 6px 8px;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 50px;
  box-sizing: border-box;
  justify-content: center;
}
.link-status-card:hover {
  background: #121e30;
  border-color: #38bdf8;
}
.link-status-card.is-active {
  background: #15253d;
  border-color: #06b6d4;
}

.alarm-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.strip-level-safe {
  background: #10b981;
}
.strip-level-crit {
  background: #eab308;
}

.card-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.wl-name {
  font-weight: bold;
  color: #fff;
}
.metric-line {
  justify-content: flex-start;
  gap: 10px;
  color: #64748b;
  font-size: 10px;
  margin-top: 1px;
}
.metric-item {
  font-family: monospace;
}

.sub-empty {
  text-align: center;
  font-size: 10px;
  color: #334155;
  padding-top: 25px;
}

/* 深色详情与配置维护弹窗组 */
::v-deep .dark-custom-dialog {
  background: #0c1424 !important;
  border: 1px solid #1a293d !important;
}
::v-deep .dark-custom-dialog .el-dialog__title {
  color: #38bdf8 !important;
  font-size: 12px;
  font-weight: bold;
}
::v-deep .dark-custom-dialog .el-dialog__body {
  padding: 12px 20px;
}

.dialog-detail-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.detail-row {
  background: #070c14;
  padding: 6px 10px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.span-2 {
  grid-column: span 2;
}
.detail-row .lbl {
  font-size: 10px;
  color: #52637a;
  margin-bottom: 2px;
}
.detail-row .val {
  font-size: 11px;
  color: #f8fafc;
}
.font-platform-list {
  font-size: 10px !important;
  color: #93c5fd !important;
  line-height: 14px;
  text-align: justify;
}

.inner-input,
.inner-select {
  background: #0d1522;
  border: 1px solid #1a293d;
  color: #fff;
  padding: 4px;
  border-radius: 3px;
  font-size: 10px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.checkbox-matrix {
  padding: 2px 0;
}
::v-deep .el-checkbox__label {
  color: #cbd5e1 !important;
  font-size: 10px;
}

.font-num {
  font-family: monospace;
}
.text-blue {
  color: #38bdf8 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-gray {
  color: #64748b !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
