<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">🛡️ 数据链故障谱系拓扑与处置策略联动大屏</span>

        <div class="search-item">
          <label>全局故障搜索</label>
          <input
            type="text"
            v-model="filterText"
            @input="handleSearch"
            placeholder="输入故障名称过滤树..."
            class="global-input"
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
          重置整屏遥测
        </el-button>
      </div>
    </div>

    <div class="main-body-layout" v-loading="listLoading">
      <div class="left-tree-panel">
        <div class="panel-header-summary">
          <span class="title">🌲 故障拓扑谱系树</span>
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
                <span
                  v-if="data.children && data.children.length > 0"
                  class="text-orange"
                  >📂</span
                >
                <span v-else class="text-red">🚨</span>
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
            <span class="title">🔍 当前选中故障诊断详情</span>
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
              <span class="lbl">识别号 (TypeId)</span
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
              <span class="lbl">故障机理特征描述文本 (faultMemo)</span>
              <span class="val font-platform-list">{{
                currentSelectedNode.faultMemo ||
                '临界系统暂无该故障的谱系特征描述信息。'
              }}</span>
            </div>
          </div>
          <div v-else class="sub-empty-info">
            💡 请在左侧拓扑谱系树中选择任意故障节点，以同步下发右侧全要素数据
          </div>
        </div>

        <div class="right-bottom-strategy-zone">
          <div class="panel-header-summary">
            <span class="title">📋 绑定的战术应急处置策略 (Strategies)</span>
            <el-button
              v-if="currentSelectedNode"
              type="primary"
              size="mini"
              icon="el-icon-plus"
              class="inner-add-btn"
              @click="handleCreateStrategy"
            >
              绑定新策略
            </el-button>
          </div>

          <div class="strategy-scroll-box">
            <div v-if="currentStrategies.length === 0" class="sub-empty">
              当前故障未绑定任何战术预案策略
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
                  ⚙️ 流程:
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
                  🔬 诊断:
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
      custom-class="dark-custom-dialog"
      append-to-body
      @close="resetTypeForm"
    >
      <el-form :model="typeForm" label-width="100px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">故障名称</span>
            <input
              type="text"
              v-model="typeForm.faultName"
              class="inner-input"
              placeholder="输入故障节点名称..."
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">父级故障特征标识 (parentTypeId)</span>
            <input
              type="number"
              v-model.number="typeForm.parentTypeId"
              class="inner-input"
              disabled
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">故障描述与诊断特征指引</span>
            <textarea
              v-model="typeForm.faultMemo"
              rows="3"
              class="inner-input"
              style="height: 60px; resize: none"
            ></textarea>
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
      custom-class="dark-custom-dialog"
      append-to-body
      @close="resetStrategyForm"
    >
      <el-form :model="strategyForm" label-width="110px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">处置策略控制名称</span>
            <input
              type="text"
              v-model="strategyForm.strategyName"
              class="inner-input"
              placeholder="输入应急处理策略命名..."
            />
          </div>
          <div class="detail-row">
            <span class="lbl">当前绑定故障 ID</span>
            <input
              type="number"
              v-model.number="strategyForm.faultTypeId"
              class="inner-input"
              disabled
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
            <span class="lbl">故障深度诊断机理 (faultDiagnosis)</span>
            <textarea
              v-model="strategyForm.faultDiagnosis"
              rows="2"
              class="inner-input"
              style="height: 45px; resize: none"
            ></textarea>
          </div>
          <div class="detail-row span-2">
            <span class="lbl">自动化应急处置预案手段 (dealMethod)</span>
            <textarea
              v-model="strategyForm.dealMethod"
              rows="2"
              class="inner-input"
              style="height: 45px; resize: none"
            ></textarea>
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

      faultTreeData: [], // 转换后的故障树结构
      flatFaultTypes: [], // 原始扁平故障数组
      allStrategyPool: [], // 策略全量数据缓存池
      currentStrategies: [], // 当前激活故障类型绑定的策略列表
      businessOptions: [], // 业务流程树状集合
      flatBusinessMap: {}, // 用于反查业务流程名称的平面字典

      currentSelectedNode: null, // 当前选中的树节点对象

      defaultTreeProps: {children: 'children', label: 'faultName'},

      // 🌟 Cascader 组件核心配置：严格对齐后端字段
      cascaderProps: {
        checkStrictly: true, // 允许选择树的任意一级节点
        emitPath: false, // 绑定值只获取最后选中的单个 ID，不返回数组路径
        value: 'businessId', // 匹配您树上的标识属性
        label: 'businessName', // 匹配树上的文本属性
        children: 'children'
      },

      // 故障类型表单
      typeDialogVisible: false,
      typeDialogTitle: '',
      typeForm: {
        faultTypeId: null,
        faultName: '',
        parentTypeId: 0,
        faultMemo: ''
      },

      // 处置策略表单
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
    /**
     * 初始化核心
     */
    async initGlobalCoreData() {
      this.listLoading = true
      try {
        // 1. 获取 faultTypes 扁平数据并转树
        const typeRes = await apiGetAll(this.typeModuleUrl, {}, 'faultTypes')
        this.flatFaultTypes = typeRes.data || typeRes || []
        this.faultTreeData = this.buildTree(
          JSON.parse(JSON.stringify(this.flatFaultTypes)),
          0
        )

        // 2. 加载流程【树状】字典映射 (rest/businessInfo/tops)
        const bizRes = await apiGetAll('businessInfo', {}, 'tops')
        this.businessOptions = bizRes.data || bizRes || []

        // 扁平化业务流程树，方便大屏直接高拟合渲染名称
        this.flatBusinessMap = {}
        this.flattenBusinessTree(this.businessOptions)

        // 3. 加载处置策略
        await this.loadStrategyPool()

        // 保持历史选中节点高亮联动
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

    /**
     * 前端非树状结构转树形拓扑算法
     */
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

    /**
     * 递归平铺业务树用于卡片反查
     */
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

    /**
     * 树节点点击联动
     */
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

    /* =================== 📂 故障类型(Tree) 增删改查 =================== */
    handleCreateType(pId) {
      this.resetTypeForm()
      this.typeForm.parentTypeId = pId
      this.typeDialogTitle =
        pId === 0
          ? '⚡ 下发全新顶级故障根源谱系'
          : `⚡ 派生子级故障类型 (隶属于 #${pId})`
      this.typeDialogVisible = true
    },
    handleUpdateType(row) {
      this.resetTypeForm()
      this.typeForm = Object.assign({}, row)
      this.typeDialogTitle = '⚙️ 修改当前故障谱系节点属性'
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
        {
          confirmButtonText: '确定熔断',
          cancelButtonText: '取消'
        }
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

    /* =================== 📋 处置策略(Strategy) 增删改查 =================== */
    handleCreateStrategy() {
      if (!this.currentSelectedNode) return
      this.resetStrategyForm()
      this.strategyForm.faultTypeId = this.currentSelectedNode.faultTypeId
      this.strategyDialogTitle = `⚡ 为故障 [${this.currentSelectedNode.faultName}] 绑定自动化策略`
      this.strategyDialogVisible = true
    },
    handleUpdateStrategy(row) {
      this.resetStrategyForm()
      this.strategyForm = Object.assign({}, row)
      this.strategyDialogTitle = '⚙️ 修改当前战术应急处置手段'
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
        {
          confirmButtonText: '强制注销',
          cancelButtonText: '保留观测'
        }
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
/* 🌟 全局弹性标准流，无绝对定位 */
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

/* 顶层检索控制 */
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
  width: 160px;
}
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
}

/* 主体布局 */
.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}

/* 左侧拓扑树舱 */
.left-tree-panel {
  flex: 3;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tree-scroll-box {
  flex: 1;
  overflow-y: auto;
}

/* 深色微调 Tree */
::v-deep .dark-custom-tree {
  background: transparent !important;
  color: #cbd5e1 !important;
}
::v-deep .dark-custom-tree .el-tree-node__content {
  height: 28px;
}
::v-deep .dark-custom-tree .el-tree-node__content:hover {
  background: #121e30 !important;
}
::v-deep .dark-custom-tree .el-tree-node:focus > .el-tree-node__content {
  background: #15253d !important;
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

/* 右侧多维舱 */
.right-combined-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* 右上：深度详情 */
.right-top-detail-zone {
  background: #080e18;
  border: 1px solid #111b2b;
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
  background: #070c14;
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
  font-size: 10px;
  color: #52637a;
  margin-bottom: 4px;
}
.detail-cell .val {
  font-size: 12px;
  color: #f8fafc;
}
.font-platform-list {
  line-height: 16px;
  color: #94a3b8 !important;
  text-align: justify;
  font-size: 11px !important;
}

/* 右下：策略区域（放底部） */
.right-bottom-strategy-zone {
  background: #080e18;
  border: 1px solid #111b2b;
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
  font-size: 10px;
  background: #0284c7;
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

/* 两行极简策略卡片 */
.link-status-card.compact-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 3px;
  padding: 6px 10px;
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
  background: #f59e0b;
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
  color: #64748b;
  font-size: 10px;
}

/* 辅色面板 */
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
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #334155;
  padding-top: 30px;
  grid-column: span 2;
}
.sub-empty-info {
  text-align: center;
  font-size: 11px;
  color: #475569;
  padding-top: 45px;
  flex: 1;
}

/* 深色科技感弹窗与级联选择器自定义样式 */
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

/* 🌟 穿透微调 Element 级联选择器完美适配大屏暗黑风 */
.dark-cascader-container {
  justify-content: flex-start;
}
::v-deep .inner-cascader {
  width: 100% !important;
}
::v-deep .inner-cascader .el-input__inner {
  background: #0d1522 !important;
  border: 1px solid #1a293d !important;
  color: #fff !important;
  font-size: 11px !important;
  height: 26px !important;
  line-height: 26px !important;
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

/* 文本工具色 */
.font-num {
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
.text-red {
  color: #ef4444 !important;
}
.text-gray {
  color: #52637a !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
