<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">🛡️ 数据链保障方案构建与多级运控联动大屏</span>

        <div class="search-item">
          <label>作战任务检索</label>
          <input
            type="text"
            v-model="queryParam.RWMC"
            @input="loadZzrwxxList"
            placeholder="输入任务名称搜索..."
            class="global-input"
          />
        </div>

        <div class="search-item">
          <label>任务状态</label>
          <select
            v-model="queryParam.STATE"
            @change="loadZzrwxxList"
            class="global-input"
            style="width: 100px"
          >
            <option :value="null">全部状态</option>
            <option :value="0">待命</option>
            <option :value="1">启用</option>
          </select>
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
          同步全要素遥测
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-tree-panel" style="flex: 3.5">
        <div class="panel-header-summary">
          <span class="title">⚔️ 作战任务保障源头流</span>
          <span class="badge font-num text-cyan"
            >{{ rwxxList.length }} 项任务</span
          >
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
              <span class="rw-title ellipsis-text" :title="rw.RWMC"
                >🔹 {{ rw.RWMC }}</span
              >
              <span
                class="status-tag"
                :class="rw.STATE === 1 ? 'tag-active' : 'tag-pending'"
              >
                {{ rw.STATE === 1 ? '已启用' : '待命' }}
              </span>
            </div>

            <div class="task-card-body">
              <div class="meta-row">
                <span
                  >任务ID:
                  <span class="text-blue font-num">{{
                    rw.ZZRWXXID || rw.ZZRWID
                  }}</span></span
                >
                <span
                  >领域:
                  <span class="text-green">{{ rw.SSLY || '默认' }}</span></span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-combined-panel" style="flex: 6.5">
        <div class="right-bottom-strategy-zone" style="flex: 1">
          <el-tabs v-model="activeTab" class="dark-tabs">
            <el-tab-pane name="networkTree">
              <span slot="label"
                >🌐 关联作战网络树
                <small v-if="selectedRw" class="text-green"
                  >({{ networkTreeData.length }} 主干)</small
                ></span
              >

              <div class="tab-scroll-box">
                <div
                  v-if="!selectedRw"
                  class="sub-empty"
                  style="padding-top: 60px"
                >
                  💡 请先在左侧选择一个作战任务，以加载其专属网络树结构
                </div>
                <div
                  v-else-if="networkTreeData.length === 0"
                  class="sub-empty"
                  style="padding-top: 60px"
                >
                  该任务下暂无挂载的作战网络树形数据
                </div>

                <el-tree
                  v-else
                  :data="networkTreeData"
                  :props="treeDefaultProps"
                  node-key="ZZRWWLID"
                  default-expand-all
                  :expand-on-click-node="false"
                  highlight-current
                  class="dark-el-tree"
                  @node-click="handleNetworkNodeClick"
                >
                  <span class="custom-tree-node" slot-scope="{node, data}">
                    <span class="node-icon">{{
                      data.parentWLID ? '📡' : '📁'
                    }}</span>
                    <span class="node-text">{{ data.WLMC }}</span>
                    <span class="node-id font-num">#{{ data.ZZRWWLID }}</span>
                  </span>
                </el-tree>
              </div>
            </el-tab-pane>

            <el-tab-pane name="strategyList">
              <span slot="label">
                📋 OCStrategy 策略矩阵
                <small v-if="selectedWlNode" class="text-blue"
                  >([{{ selectedWlNode.WLMC }}] #{{
                    filteredStrategies.length
                  }}项)</small
                >
              </span>

              <div class="tab-scroll-box">
                <div class="strategy-top-bar" v-if="selectedWlNode">
                  <div class="current-node-info">
                    当前选定网络节点:
                    <span class="text-green font-num"
                      >{{ selectedWlNode.WLMC }} (#{{
                        selectedWlNode.ZZRWWLID
                      }})</span
                    >
                  </div>
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-plus"
                    class="inner-add-btn"
                    @click="handleCreateStrategy"
                  >
                    配置新运控策略
                  </el-button>
                </div>

                <div class="strategy-scroll-box">
                  <div
                    v-if="!selectedWlNode"
                    class="sub-empty"
                    style="grid-column: span 2; padding-top: 60px"
                  >
                    💡
                    请先在“关联作战网络树”标签页中选择任意网络节点，以调取并管理其运控调度策略
                  </div>
                  <div
                    v-else-if="filteredStrategies.length === 0"
                    class="sub-empty"
                    style="grid-column: span 2; padding-top: 60px"
                  >
                    当前选定网络节点（#{{
                      selectedWlNode.ZZRWWLID
                    }}）下，后端暂未检索到任何激活的策略预案
                  </div>

                  <div
                    v-else
                    v-for="item in filteredStrategies"
                    :key="item.ocStrategyId"
                    class="link-status-card compact-card"
                  >
                    <div
                      class="alarm-strip"
                      :class="
                        item.strategyModel
                          ? 'strip-level-safe'
                          : 'strip-level-crit'
                      "
                    ></div>

                    <div class="card-line">
                      <span
                        class="wl-name ellipsis-text"
                        style="max-width: 260px"
                        :title="item.strategyType"
                      >
                        <small class="text-cyan"
                          >#{{ item.ocStrategyId }}</small
                        >
                        【{{ item.strategyType }}】
                      </span>
                      <span class="card-actions">
                        <i
                          class="el-icon-edit text-green"
                          @click="handleUpdateStrategy(item)"
                        ></i>
                        <i
                          class="el-icon-delete text-red"
                          @click="handleDeleteStrategy(item)"
                        ></i>
                      </span>
                    </div>

                    <div class="card-line metric-line">
                      <span
                        class="metric-item ellipsis-text"
                        style="max-width: 340px"
                        :title="item.strategyModel"
                      >
                        🛠️ 模型特征:
                        <span class="text-blue font-num">{{
                          item.strategyModel || '缺省未写入参数'
                        }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <el-dialog
      :title="strategyDialogTitle"
      :visible.sync="strategyDialogVisible"
      width="560px"
      custom-class="dark-custom-dialog"
      append-to-body
      @close="resetStrategyForm"
    >
      <el-form :model="strategyForm" label-width="120px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">绑定作战网络参数 (当前树节点约束)</span>
            <input
              type="text"
              class="inner-input"
              readonly
              :value="
                selectedWlNode
                  ? `${selectedWlNode.WLMC} (#${selectedWlNode.ZZRWWLID})`
                  : ''
              "
              style="opacity: 0.75"
            />
          </div>

          <div class="detail-row span-2">
            <span class="lbl">分级运控策略类型 (strategyType)</span>
            <select
              v-model="strategyForm.strategyType"
              @change="handleStrategyTypeChange"
              class="inner-select"
            >
              <option :value="''" disabled>
                -- 请选择策略类型以动态激发出表单核心参数 --
              </option>
              <option v-for="type in strategyTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div
            class="dynamic-form-divider span-2"
            v-if="dynamicAttributes.length > 0"
          >
            <span>⚙️ 动态拓展特征矩阵 (由后端配置项规则动态解析)</span>
          </div>

          <div
            v-for="attr in dynamicAttributes"
            :key="attr.attrName"
            class="detail-row"
            :class="{
              'span-2':
                attr.attrType === 'textarea' || attr.attrType === 'select'
            }"
          >
            <span class="lbl"
              >{{ attr.attrName }}
              <small class="text-gray">({{ attr.attrType }})</small></span
            >

            <template
              v-if="
                attr.attrType === 'select' || attr.componentType === 'select'
              "
            >
              <select
                v-model="dynamicFormValues[attr.attrName]"
                class="inner-select"
              >
                <option value="">-- 请选择 --</option>
                <option
                  v-for="opt in attr.options || getAttrTypes(attr.attrName)"
                  :key="opt"
                  :value="opt"
                >
                  {{ opt }}
                </option>
              </select>
            </template>

            <template v-else-if="attr.attrType === 'textarea'">
              <textarea
                v-model="dynamicFormValues[attr.attrName]"
                rows="2"
                class="inner-input"
                style="height: 50px; resize: none"
                :placeholder="'请输入' + attr.attrName + '详细控制规则...'"
              ></textarea>
            </template>

            <template v-else-if="attr.attrType === 'number'">
              <input
                type="number"
                v-model.number="dynamicFormValues[attr.attrName]"
                class="inner-input"
                placeholder="请输入数值"
              />
            </template>

            <template v-else>
              <input
                type="text"
                v-model="dynamicFormValues[attr.attrName]"
                class="inner-input"
                placeholder="请输入文本内容"
              />
            </template>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="strategyDialogVisible = false"
          size="mini"
          class="dark-btn"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="submitStrategyForm"
          size="mini"
          :loading="submitLoading"
          >提交转译并部署</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {apiPage, apiAdd, apiUpdate, apiDelete} from '@/api/common'
import {
  getStrategyTypes,
  zzrwwlFindTree,
  getYXJMap,
  getAttrTypes,
  getAttributeMap
} from '@/api/map'

export default {
  name: 'DataLinkGuaranteeSystem',
  data() {
    return {
      rwxxModuleUrl: 'zzrwxx',
      strategyModuleUrl: 'ocStrategy',
      attrModuleUrl: 'ocStrategyAttr',

      activeTab: 'networkTree', // 标签页控制控制变量
      submitLoading: false,

      rwxxList: [],
      networkTreeData: [], // 直接承载后端返回的树结构，包含 children 节点
      filteredStrategies: [],
      dynamicAttributes: [],

      selectedRw: null,
      selectedWlNode: null, // 当前点击选中的具体作战网络对象

      rwlbMap: {'01': '重要任务', '02': '指定任务', '03': '隐含任务'},
      yxjMap: getYXJMap ? getYXJMap() : {1: '低', 2: '重要', 3: '高'},
      strategyTypes: getStrategyTypes
        ? getStrategyTypes()
        : ['一级运控策略', '二级运控策略', '运控节点切换策略', '其他策略'],

      queryParam: {RWMC: '', STATE: null},

      treeDefaultProps: {
        children: 'children',
        label: 'WLMC'
      },

      strategyDialogVisible: false,
      strategyDialogTitle: '',
      strategyForm: {
        ocStrategyId: null,
        ZZRWXXID: null,
        ZZRWWLID: null,
        strategyType: '',
        strategyModel: ''
      },
      dynamicFormValues: {}
    }
  },
  mounted() {
    this.initGlobalDashboard()
  },
  methods: {
    initGlobalDashboard() {
      this.loadZzrwxxList()
    },

    /**
     * 加载作战任务列表
     */
    loadZzrwxxList() {
      const bodyParam = {
        pageNum: 1,
        pageSize: 100,
        params: {
          RWMC: this.queryParam.RWMC || undefined,
          STATE:
            this.queryParam.STATE !== null
              ? Number(this.queryParam.STATE)
              : undefined
        }
      }
      return apiPage(this.rwxxModuleUrl, bodyParam).then(res => {
        this.rwxxList = res.data.list || res.data || []
      })
    },

    /**
     * 点击左侧作战任务卡片：加载其名下的原生态作战网络树结构
     */
    async handleSelectRw(rw) {
      this.selectedRw = rw
      this.selectedWlNode = null
      this.networkTreeData = []
      this.filteredStrategies = []
      this.activeTab = 'networkTree' // 默认切回树切片视图

      try {
        const targetId = rw.ZZRWXXID || rw.ZZRWID

        // 1. 通过作战任务 id 查询自带完整 children 阶梯的作战网络树
        const wlRes = await zzrwwlFindTree(targetId)
        // 直接赋值树节点，本身就是树形数据结构，不做任何平铺逻辑拆解
        this.networkTreeData = wlRes.data || wlRes || []
      } catch (e) {
        console.error('获取作战网络树数据失败:', e)
      }
    },

    /**
     * 树形组件节点点击回调：通过 ZZRWWLID 查看具体的 OCStrategy 策略
     */
    handleNetworkNodeClick(data) {
      this.selectedWlNode = data
      this.filteredStrategies = []
      // 自动跳转去查看具体的策略矩阵列表标签页
      this.activeTab = 'strategyList'
      this.loadStrategiesByNetwork()
    },

    /**
     * 🌟通过传递 ZZRWWLID 隐藏查询核心参数包，精准查看 OCStrategy 策略
     */
    loadStrategiesByNetwork() {
      if (!this.selectedWlNode) return

      const bodyParam = {
        pageNum: 1,
        pageSize: 200,
        params: {
          ZZRWWLID: Number(this.selectedWlNode.ZZRWWLID) // 仅作为内部 params 查询键
        }
      }

      return apiPage(this.strategyModuleUrl, bodyParam)
        .then(res => {
          this.filteredStrategies = res.data.list || res.data || []
        })
        .catch(err => {
          console.error('静默刷新策略方案失败:', err)
        })
    },

    /**
     * 选择 StrategyType 后，动态加载属性模板页
     */
    async handleStrategyTypeChange(val) {
      if (!val) {
        this.dynamicAttributes = []
        this.dynamicFormValues = {}
        return
      }
      try {
        const bodyParam = {
          pageNum: 1,
          pageSize: 100,
          params: {strategyType: val}
        }
        const attrRes = await apiPage(this.attrModuleUrl, bodyParam)
        this.dynamicAttributes = attrRes.data?.list || attrRes.data || []

        const newValues = {}
        this.dynamicAttributes.forEach(attr => {
          newValues[attr.attrName] =
            this.dynamicFormValues[attr.attrName] !== undefined
              ? this.dynamicFormValues[attr.attrName]
              : ''
        })
        this.dynamicFormValues = newValues
      } catch (e) {
        console.error('动态生成拓展特征属性配置项异常:', e)
      }
    },

    getAttrTypes(attrName) {
      return getAttrTypes
        ? getAttrTypes(attrName)
        : ['自适应主控', '链路容灾切换', '保障序列回滚']
    },

    taskCardActiveClass(rw) {
      const curId = this.selectedRw
        ? this.selectedRw.ZZRWXXID || this.selectedRw.ZZRWID
        : null
      const rowId = rw.ZZRWXXID || rw.ZZRWID
      return {'task-active': curId && curId === rowId}
    },

    /* =================== 📋 OCStrategy 数据管理与翻译提报机制 =================== */
    handleCreateStrategy() {
      if (!this.selectedWlNode) return
      this.resetStrategyForm()

      this.strategyForm.ZZRWXXID = this.selectedWlNode.ZZRWXXID
      this.strategyForm.ZZRWWLID = this.selectedWlNode.ZZRWWLID

      this.strategyDialogTitle = `⚡ 为网络节点 [#${this.selectedWlNode.ZZRWWLID}] 配置新策略方案`
      this.strategyDialogVisible = true
    },

    async handleUpdateStrategy(row) {
      this.resetStrategyForm()
      this.strategyForm = Object.assign({}, row)
      this.strategyDialogTitle = `⚙️ 修改策略参数矩阵序列 (#${row.ocStrategyId})`
      this.strategyDialogVisible = true

      if (row.strategyType) {
        await this.handleStrategyTypeChange(row.strategyType)
        if (row.strategyModel) {
          try {
            const parsedJson = JSON.parse(row.strategyModel)
            const engToChMap = getAttributeMap ? getAttributeMap() : {}
            const chToEngMap = {}
            Object.keys(engToChMap).forEach(key => {
              chToEngMap[engToChMap[key]] = key
            })

            const recoveredValues = {}
            this.dynamicAttributes.forEach(attr => {
              const engFieldName = chToEngMap[attr.attrName] || attr.attrName
              recoveredValues[attr.attrName] =
                parsedJson[engFieldName] !== undefined
                  ? parsedJson[engFieldName]
                  : ''
            })
            this.dynamicFormValues = recoveredValues
          } catch (e) {
            console.error('反解模型串特征结构错误:', e)
          }
        }
      }
    },

    submitStrategyForm() {
      // 汇聚并将动态表单键（attrName）转译映射为英文来源
      const conversionMap = getAttributeMap ? getAttributeMap() : {}
      const payloadModelObj = {}

      this.dynamicAttributes.forEach(attr => {
        const chName = attr.attrName
        const engKey = conversionMap[chName] || chName
        payloadModelObj[engKey] = this.dynamicFormValues[chName]
      })

      this.strategyForm.strategyModel = JSON.stringify(payloadModelObj)
      this.submitLoading = true

      const reqAction = this.strategyForm.ocStrategyId ? apiUpdate : apiAdd
      reqAction(this.strategyModuleUrl, this.strategyForm)
        .then(() => {
          this.$message.success('分级策略属性矩阵持久化配置发布成功')
          this.strategyDialogVisible = false
          this.loadStrategiesByNetwork()
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },

    handleDeleteStrategy(row) {
      this.$confirm(`确定注销并终结当前选择的策略控制模型数据吗?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        apiDelete(this.strategyModuleUrl, row.ocStrategyId).then(() => {
          this.$message.success('控制模型卸载完毕')
          this.loadStrategiesByNetwork()
        })
      })
    },

    resetStrategyForm() {
      this.strategyForm = {
        ocStrategyId: null,
        ZZRWXXID: null,
        ZZRWWLID: null,
        strategyType: '',
        strategyModel: ''
      }
      this.dynamicAttributes = []
      this.dynamicFormValues = {}
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
.global-input {
  background: #0d1522;
  border: 1px solid #1e3557;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  outline: none;
  width: 140px;
}
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
}

.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}

.left-tree-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.task-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.task-item-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.25s;
}
.task-item-card:hover {
  border-color: #22d3ee;
  background: #111e30;
}
.task-active {
  border-color: #38bdf8 !important;
  background: #13253e !important;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.2);
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
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
  color: #94a3b8;
}
.meta-row {
  display: flex;
  justify-content: space-between;
}

/* 右舱 Tab 控制台容器样式 */
.right-combined-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.right-bottom-strategy-zone {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.tab-scroll-box {
  padding-top: 10px;
  flex: 1;
  overflow-y: auto;
}

/* 暗黑风格定制 el-tabs */
::v-deep .dark-tabs .el-tabs__header {
  margin-bottom: 4px;
  border-bottom: 1px solid #111b2b;
}
::v-deep .dark-tabs .el-tabs__item {
  color: #64748b;
  font-size: 12px;
  font-weight: bold;
  height: 32px;
  line-height: 32px;
}
::v-deep .dark-tabs .el-tabs__item.is-active {
  color: #38bdf8 !important;
}
::v-deep .dark-tabs .el-tabs__active-bar {
  background-color: #38bdf8;
}
::v-deep .dark-tabs .el-tabs__nav-wrap::after {
  background-color: transparent;
}

/* 暗黑风格定制的原生拓展 el-tree */
.dark-el-tree {
  background: transparent;
  color: #cbd5e1;
  font-size: 12px;
}
::v-deep .dark-el-tree .el-tree-node__content {
  height: 34px;
  border: 1px solid #0d1522;
  margin-bottom: 4px;
  border-radius: 3px;
  background-color: #0b111c;
  padding-right: 12px;
}
::v-deep .dark-el-tree .el-tree-node__content:hover {
  background-color: #121d30 !important;
  border-color: #06b6d4;
}
::v-deep .dark-el-tree .el-tree-node.is-current > .el-tree-node__content {
  background-color: #0f2624 !important;
  border-color: #10b981 !important;
  color: #fff;
}

.custom-tree-node {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}
.custom-tree-node .node-icon {
  font-size: 12px;
}
.custom-tree-node .node-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.custom-tree-node .node-id {
  font-size: 10px;
  color: #475569;
  margin-left: auto;
}

/* 策略矩阵布局 */
.strategy-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0c1524;
  padding: 6px 12px;
  border-radius: 3px;
  border: 1px solid #18263c;
  margin-bottom: 10px;
}
.current-node-info {
  font-size: 11px;
  color: #94a3b8;
}
.inner-add-btn {
  height: 24px;
  padding: 0 10px;
  font-size: 11px;
  background: #0284c7;
  border: none;
}
.strategy-scroll-box {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 60px;
  gap: 10px;
}

.link-status-card.compact-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 3px;
  padding: 8px 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-sizing: border-box;
  justify-content: center;
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
  background: #ea580c;
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
.card-actions i {
  margin-left: 8px;
  cursor: pointer;
  font-size: 13px;
}
.metric-line {
  justify-content: space-between;
  color: #64748b;
  font-size: 11px;
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
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #334155;
}

.dynamic-form-divider {
  border-left: 3px solid #38bdf8;
  padding-left: 6px;
  color: #38bdf8;
  font-size: 11px;
  font-weight: bold;
  margin: 8px 0 2px 0;
}

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
.detail-row .lbl {
  font-size: 10px;
  color: #52637a;
  margin-bottom: 2px;
}
.inner-input,
.inner-select {
  background: #0d1522;
  border: 1px solid #1a293d;
  color: #fff;
  padding: 5px;
  border-radius: 3px;
  font-size: 11px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}
.dark-btn {
  background: #172438;
  border: 1px solid #1e3557;
  color: #cbd5e1;
}
.span-2 {
  grid-column: span 2;
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
.text-cyan {
  color: #06b6d4 !important;
}
.text-red {
  color: #ef4444 !important;
}
.text-gray {
  color: #475569 !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
