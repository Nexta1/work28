<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">
          <Icon
            icon="lucide:shield-alert"
            :size="16"
            style="
              vertical-align: middle;
              margin-right: 6px;
              color: var(--color-primary, #38bdf8);
            "
          />数据链故障与处置策略
        </span>

        <div class="search-item">
          <label>全局故障搜索</label>
          <el-input
            v-model="filterText"
            @input="handleSearch"
            placeholder="输入故障名称过滤树..."
            size="small"
          />
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          class="action-btn"
          @click="handleCreateType(0)"
        >
          新增顶级故障根源
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="initGlobalCoreData"
        >
          重置搜索
        </el-button>
      </div>
    </div>

    <div class="main-body-layout" v-loading="listLoading">
      <div class="left-tree-panel">
        <div class="panel-header-summary">
          <span class="title">
            <Icon
              icon="lucide:network"
              :size="14"
              style="
                vertical-align: middle;
                margin-right: 6px;
                color: var(--color-cyan, #06b6d4);
              "
            />故障拓扑谱系树
          </span>
          <span class="badge font-num text-cyan"
            >{{ flatFaultTypes.length }} 类</span
          >
        </div>
        <div class="tree-scroll-box">
          <el-tree
            :data="faultTreeData"
            :props="defaultTreeProps"
            node-key="faultTypeId"
            default-expand-all
            :filter-node-method="filterTreeMethod"
            ref="faultTypeTree"
            class="dark-custom-tree"
            @node-click="handleTreeNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{data}">
              <span class="node-txt ellipsis-text" :title="data.faultName">
                <Icon
                  v-if="data.children && data.children.length > 0"
                  icon="lucide:folder-git-2"
                  :size="13"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-warning, #f59e0b);
                  "
                />
                <Icon
                  v-else
                  icon="lucide:alert-octagon"
                  :size="13"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-danger, #ef4444);
                  "
                />
                {{ data.faultName }}
              </span>
              <span class="tree-node-actions">
                <i
                  class="el-icon-plus text-blue"
                  title="添加子类"
                  @click.stop="handleCreateType(data.faultTypeId)"
                ></i>
                <i
                  class="el-icon-edit text-green"
                  title="编辑"
                  @click.stop="handleUpdateType(data)"
                ></i>
                <i
                  class="el-icon-delete text-red"
                  title="删除"
                  @click.stop="handleDeleteType(data)"
                ></i>
              </span>
            </span>
          </el-tree>
        </div>
      </div>

      <div class="right-combined-panel">
        <div class="right-top-detail-zone">
          <div class="panel-header-summary">
            <span class="title">
              <Icon
                icon="lucide:binary"
                :size="14"
                style="
                  vertical-align: middle;
                  margin-right: 6px;
                  color: var(--color-primary, #38bdf8);
                "
              />当前选中故障诊断详情
            </span>
            <span class="badge font-num text-orange" v-if="currentSelectedNode"
              >#{{ currentSelectedNode.faultTypeId }}</span
            >
          </div>

          <div v-if="currentSelectedNode" class="node-detail-matrix">
            <div class="detail-cell">
              <span class="lbl">故障名称</span
              ><span class="val text-blue font-num">{{
                currentSelectedNode.faultName
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">识别号</span
              ><span class="val font-num text-cyan">{{
                currentSelectedNode.faultTypeId
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">上级隶属故障</span
              ><span class="val text-gray">{{
                currentSelectedNode.parentFaultName || '无（顶级节点）'
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">安全操作员</span
              ><span class="val text-gray">{{
                currentSelectedNode.opUserName || '管理员'
              }}</span>
            </div>
            <div class="detail-cell span-2">
              <span class="lbl">最后时间同步序列</span
              ><span class="val font-num text-gray">{{
                currentSelectedNode.opTime || '-'
              }}</span>
            </div>
            <div class="detail-cell span-2">
              <span class="lbl">故障机理特征描述文本</span>
              <span class="val font-platform-list">{{
                currentSelectedNode.faultMemo ||
                '临界系统暂无该故障的谱系特征描述信息。'
              }}</span>
            </div>
          </div>
          <div v-else class="sub-empty-info">
            请在左侧拓扑谱系树中选择任意故障节点，以同步下发右侧全要素数据
          </div>
        </div>

        <div class="right-bottom-strategy-zone">
          <div class="panel-header-summary">
            <span class="title">
              <Icon
                icon="lucide:scroll-text"
                :size="14"
                style="
                  vertical-align: middle;
                  margin-right: 6px;
                  color: var(--color-green, #10b981);
                "
              />绑定的故障处置策略
            </span>
            <el-button
              v-if="currentSelectedNode"
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="handleCreateStrategy"
            >
              绑定新故障处置策略
            </el-button>
          </div>

          <div class="strategy-scroll-box">
            <div v-if="currentStrategies.length === 0" class="sub-empty">
              当前故障未绑定任何故障处置策略
            </div>

            <div
              v-for="item in currentStrategies"
              :key="item.faultStrategyId"
              class="link-status-card compact-card"
            >
              <div
                class="alarm-strip"
                :class="
                  item.businessId ? 'strip-level-safe' : 'strip-level-crit'
                "
              ></div>

              <div class="card-line">
                <span
                  class="wl-name ellipsis-text"
                  style="max-width: 220px"
                  :title="item.strategyName"
                >
                  <small class="text-cyan">#{{ item.faultStrategyId }}</small>
                  {{ item.strategyName }}
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
                  style="max-width: 180px"
                >
                  <Icon
                    icon="lucide:git-fork"
                    :size="12"
                    style="
                      vertical-align: middle;
                      margin-right: 3px;
                      color: var(--color-blue, #38bdf8);
                    "
                  />流程:
                  <span class="text-blue">{{
                    findBusinessName(item.businessId) ||
                    item.businessName ||
                    '独立预案'
                  }}</span>
                </span>
                <span
                  class="metric-item ellipsis-text"
                  style="max-width: 200px"
                  :title="item.faultDiagnosis"
                >
                  <Icon
                    icon="lucide:activity"
                    :size="12"
                    style="
                      vertical-align: middle;
                      margin-right: 3px;
                      color: var(--color-green, #10b981);
                    "
                  />诊断:
                  <span class="text-green">{{
                    item.faultDiagnosis || '未指定描述'
                  }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="typeDialogTitle"
      :visible.sync="typeDialogVisible"
      width="500px"
      append-to-body
      @close="resetTypeForm"
    >
      <el-form :model="typeForm" label-width="100px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">故障名称</span>
            <el-input
              v-model="typeForm.faultName"
              placeholder="输入故障节点名称..."
              size="small"
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">父级故障特征标识</span>
            <el-input
              v-model.number="typeForm.parentTypeId"
              disabled
              size="small"
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">故障描述与诊断特征指引</span>
            <el-input
              v-model="typeForm.faultMemo"
              type="textarea"
              :rows="3"
              style="height: 60px; resize: none"
              size="small"
            />
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="typeDialogVisible = false"
          size="mini"
          class="dark-btn"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="submitTypeForm"
          size="mini"
          :loading="submitLoading"
          >保存谱系节点</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      :title="strategyDialogTitle"
      :visible.sync="strategyDialogVisible"
      width="540px"
      append-to-body
      @close="resetStrategyForm"
    >
      <el-form :model="strategyForm" label-width="111px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">处置策略控制名称</span>
            <el-input
              v-model="strategyForm.strategyName"
              placeholder="输入处理策略命名..."
              size="small"
            />
          </div>
          <div class="detail-row">
            <span class="lbl">当前绑定故障 ID</span>
            <el-input
              v-model.number="strategyForm.faultTypeId"
              disabled
              size="small"
            />
          </div>

          <div class="detail-row dark-cascader-container">
            <span class="lbl">联动业务自动化流程</span>
            <el-cascader
              v-model="strategyForm.businessId"
              :options="businessOptions"
              :props="cascaderProps"
              clearable
              placeholder="独立策略 (不联动外部流程)"
              class="inner-cascader"
              size="mini"
            ></el-cascader>
          </div>

          <div class="detail-row span-2">
            <span class="lbl">故障深度诊断机理</span>
            <el-input
              v-model="strategyForm.faultDiagnosis"
              type="textarea"
              :rows="2"
              style="height: 45px; resize: none"
              size="small"
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">自动化应急处置预案手段</span>
            <el-input
              v-model="strategyForm.dealMethod"
              type="textarea"
              :rows="2"
              style="height: 45px; resize: none"
              size="small"
            />
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
          >部署执行策略</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {apiPage, apiAdd, apiUpdate, apiDelete, apiGetAll} from '@/api/common'

export default {
  name: 'FaultStrategyAdvancedDashboard',
  data() {
    return {
      strategyModuleUrl: 'faultStrategy',
      typeModuleUrl: 'faultType',

      listLoading: false,
      submitLoading: false,
      filterText: '',

      faultTreeData: [],
      flatFaultTypes: [],
      allStrategyPool: [],
      currentStrategies: [],
      businessOptions: [],
      flatBusinessMap: {},

      currentSelectedNode: null,

      defaultTreeProps: {children: 'children', label: 'faultName'},

      cascaderProps: {
        checkStrictly: true,
        emitPath: false,
        value: 'businessId',
        label: 'businessName',
        children: 'children'
      },

      typeDialogVisible: false,
      typeDialogTitle: '',
      typeForm: {
        faultTypeId: null,
        faultName: '',
        parentTypeId: 0,
        faultMemo: ''
      },

      strategyDialogVisible: false,
      strategyDialogTitle: '',
      strategyForm: {
        faultStrategyId: null,
        faultTypeId: null,
        strategyName: '',
        faultDiagnosis: '',
        dealMethod: '',
        businessId: null
      }
    }
  },
  mounted() {
    this.initGlobalCoreData()
  },
  methods: {
    async initGlobalCoreData() {
      this.listLoading = true
      try {
        const typeRes = await apiGetAll(this.typeModuleUrl, {}, 'faultTypes')
        this.flatFaultTypes = typeRes.data || typeRes || []
        this.faultTreeData = this.buildTree(
          JSON.parse(JSON.stringify(this.flatFaultTypes)),
          0
        )

        const bizRes = await apiGetAll('businessInfo', {}, 'tops')
        this.businessOptions = bizRes.data || bizRes || []

        this.flatBusinessMap = {}
        this.flattenBusinessTree(this.businessOptions)

        await this.loadStrategyPool()

        if (this.currentSelectedNode) {
          const stillExist = this.flatFaultTypes.find(
            t => t.faultTypeId === this.currentSelectedNode.faultTypeId
          )
          if (stillExist) this.handleTreeNodeClick(stillExist)
        }
      } catch (e) {
        console.error('全视数据链维护舱异常:', e)
      } finally {
        this.listLoading = false
      }
    },

    buildTree(list, parentId = 0) {
      const map = {}
      const tree = []

      list.forEach(item => {
        item.children = []
        map[item.faultTypeId] = item
      })

      list.forEach(item => {
        const parent = map[item.parentTypeId]
        if (item.parentTypeId && parent) {
          item.parentFaultName = parent.faultName
          parent.children.push(item)
        } else {
          item.parentFaultName = '顶级根源'
          tree.push(item)
        }
      })
      return tree
    },

    flattenBusinessTree(nodes) {
      nodes.forEach(node => {
        const bId = node.businessId || node.id
        const bName = node.businessName || node.name
        if (bId) {
          this.flatBusinessMap[bId] = bName
        }
        if (node.children && node.children.length) {
          this.flattenBusinessTree(node.children)
        }
      })
    },

    findBusinessName(id) {
      return this.flatBusinessMap[id] || ''
    },

    loadStrategyPool() {
      return apiPage(this.strategyModuleUrl, {pageNum: 1, pageSize: 200}).then(
        res => {
          this.allStrategyPool = res.data.list || res.data || []
        }
      )
    },

    handleTreeNodeClick(data) {
      this.currentSelectedNode = data
      this.currentStrategies = this.allStrategyPool.filter(
        s => Number(s.faultTypeId) === Number(data.faultTypeId)
      )
    },

    handleSearch() {
      if (this.$refs.faultTypeTree) {
        this.$refs.faultTypeTree.filter(this.filterText)
      }
    },
    filterTreeMethod(value, data) {
      if (!value) return true
      return (
        data.faultName &&
        data.faultName.toLowerCase().includes(value.toLowerCase())
      )
    },

    /* =================== 故障类型维护 =================== */
    handleCreateType(pId) {
      this.resetTypeForm()
      this.typeForm.parentTypeId = pId
      this.typeDialogTitle =
        pId === 0
          ? '下发全新顶级故障根源谱系'
          : `派生子级故障类型 (隶属于 #${pId})`
      this.typeDialogVisible = true
    },
    handleUpdateType(row) {
      this.resetTypeForm()
      this.typeForm = Object.assign({}, row)
      this.typeDialogTitle = '修改当前故障谱系节点属性'
      this.typeDialogVisible = true
    },
    submitTypeForm() {
      if (!this.typeForm.faultName) {
        this.$message.warning('故障名称不能为空')
        return
      }
      this.submitLoading = true
      const reqAction = this.typeForm.faultTypeId ? apiUpdate : apiAdd
      reqAction(this.typeModuleUrl, this.typeForm)
        .then(() => {
          this.$message.success('故障类型拓扑更迭成功')
          this.typeDialogVisible = false
          this.initGlobalCoreData()
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handleDeleteType(row) {
      if (row.children && row.children.length > 0) {
        this.$message.error('该故障类型下包含子集派生谱系，无法直接删除！')
        return
      }
      this.$confirm(
        `确定彻底抹除故障类型谱系 [#${row.faultName}]? 关联的下属策略将一并失去锚定。`,
        '谱系熔断警告',
        {confirmButtonText: '确定熔断', cancelButtonText: '取消'}
      ).then(() => {
        apiDelete(this.typeModuleUrl, row.faultTypeId).then(() => {
          this.$message.success('该故障节点已从系统拓扑剔除')
          if (this.currentSelectedNode?.faultTypeId === row.faultTypeId) {
            this.currentSelectedNode = null
            this.currentStrategies = []
          }
          this.initGlobalCoreData()
        })
      })
    },
    resetTypeForm() {
      this.typeForm = {
        faultTypeId: null,
        faultName: '',
        parentTypeId: 0,
        faultMemo: ''
      }
    },

    /* =================== 处置策略维护 =================== */
    handleCreateStrategy() {
      if (!this.currentSelectedNode) return
      this.resetStrategyForm()
      this.strategyForm.faultTypeId = this.currentSelectedNode.faultTypeId
      this.strategyDialogTitle = `为故障 [${this.currentSelectedNode.faultName}] 绑定自动化策略`
      this.strategyDialogVisible = true
    },
    handleUpdateStrategy(row) {
      this.resetStrategyForm()
      this.strategyForm = Object.assign({}, row)
      this.strategyDialogTitle = '修改当前战术应急处置手段'
      this.strategyDialogVisible = true
    },
    submitStrategyForm() {
      if (!this.strategyForm.strategyName) {
        this.$message.warning('策略控制名称属于必填属性')
        return
      }
      this.submitLoading = true
      const reqAction = this.strategyForm.faultStrategyId ? apiUpdate : apiAdd
      reqAction(this.strategyModuleUrl, this.strategyForm)
        .then(() => {
          this.$message.success('处置预案部署下发成功')
          this.strategyDialogVisible = false
          this.initGlobalCoreData().then(() => {
            if (this.currentSelectedNode) {
              this.handleTreeNodeClick(this.currentSelectedNode)
            }
          })
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handleDeleteStrategy(row) {
      this.$confirm(
        `是否注销该项应急处置策略 [#${row.strategyName}]?`,
        '策略离线警告',
        {confirmButtonText: '强制注销', cancelButtonText: '保留观测'}
      ).then(() => {
        apiDelete(this.strategyModuleUrl, row.faultStrategyId).then(() => {
          this.$message.success('当前预案策略已完成注销销毁')
          this.initGlobalCoreData().then(() => {
            if (this.currentSelectedNode) {
              this.handleTreeNodeClick(this.currentSelectedNode)
            }
          })
        })
      })
    },
    resetStrategyForm() {
      this.strategyForm = {
        faultStrategyId: null,
        faultTypeId: null,
        strategyName: '',
        faultDiagnosis: '',
        dealMethod: '',
        businessId: null
      }
    }
  }
}
</script>

<style scoped>
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
}

.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}

.left-tree-panel {
  flex: 3;
  background: var(--bg-base);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 11px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tree-scroll-box {
  flex: 1;
  overflow-y: auto;
}

.dark-custom-tree {
  background: transparent;
  color: var(--color-text-main);
}

.custom-tree-node {
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 6px;
}
.tree-node-actions {
  display: none;
  gap: 8px;
  font-size: 12px;
}
.custom-tree-node:hover .tree-node-actions {
  display: flex;
}

.right-combined-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.right-top-detail-zone {
  background: var(--bg-base);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 5;
  min-height: 0;
}
.node-detail-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  overflow-y: auto;
  flex: 1;
}
.detail-cell {
  background: var(--bg-input);
  padding: 8px 12px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.span-2 {
  grid-column: span 2;
}
.detail-cell .lbl {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}
.detail-cell .val {
  font-size: 12px;
  color: var(--color-text-main);
}
.font-platform-list {
  line-height: 16px;
  color: var(--color-text-muted);
  text-align: justify;
  font-size: 11px;
}

.right-bottom-strategy-zone {
  background: var(--bg-base);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 5;
  min-height: 0;
}
.inner-add-btn {
  height: 22px;
  padding: 0 8px;
  font-size: 11px;
  background: var(--color-primary);
  border: none;
}
.strategy-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 52px;
  gap: 8px;
}

.link-status-card.compact-card {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 3px;
  padding: 6px 11px;
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
  background: var(--color-success);
}
.strip-level-crit {
  background: var(--color-warning);
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
  font-size: 12px;
}
.metric-line {
  justify-content: flex-start;
  gap: 16px;
  color: var(--color-disabled);
  font-size: 11px;
}

.panel-header-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-dark);
  padding-bottom: 6px;
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
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: var(--color-disabled);
  padding-top: 30px;
  grid-column: span 2;
}
.sub-empty-info {
  text-align: center;
  font-size: 11px;
  color: var(--color-disabled);
  padding-top: 45px;
  flex: 1;
}

.dialog-detail-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.detail-row {
  background: var(--bg-input);
  padding: 6px 11px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.detail-row .lbl {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}

.inner-cascader {
  width: 100%;
}
.dark-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  color: var(--color-text-main);
}

.text-blue {
  color: var(--color-primary);
}
.text-green {
  color: var(--color-success);
}
.text-orange {
  color: var(--color-warning);
}
.text-cyan {
  color: var(--color-cyan);
}
.text-red {
  color: var(--color-danger);
}
.text-gray {
  color: var(--color-text-muted);
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
