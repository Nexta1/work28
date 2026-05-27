<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">🛡️ 分级运控策略谱系与执行矩阵舱</span>

        <div class="search-item">
          <label>策略大类</label>
          <select
            v-model="listQuery.strategyType"
            @change="handleTypeSearch"
            class="global-input"
            style="width: 140px"
          >
            <option value="">全部策略大类</option>
            <option v-for="type in strategyTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <div class="search-item">
          <label>属性检索</label>
          <input
            type="text"
            v-model="listQuery.attrName"
            @input="filterStrategyTree"
            placeholder="输入属性名称搜索..."
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
          @click="handleCreateAttr"
        >
          新增策略属性
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="initGlobalStrategyData"
        >
          同步全局遥测
        </el-button>
      </div>
    </div>

    <div class="main-body-layout" v-loading="pageLoading">
      <div class="left-tree-panel">
        <div class="panel-header-summary">
          <span class="title">🌲 运控策略属性谱系树</span>
          <span class="badge font-num text-cyan"
            >{{ allAttributes.length }} 项属性</span
          >
        </div>
        <div class="tree-scroll-box">
          <el-tree
            :data="strategyTreeData"
            :props="defaultTreeProps"
            node-key="id"
            default-expand-all
            :filter-node-method="filterTreeMethod"
            ref="strategyTree"
            class="dark-custom-tree"
            @node-click="handleTreeNodeClick"
          >
            <span class="custom-tree-node" slot-scope="{data}">
              <span class="node-txt ellipsis-text" :title="data.name">
                <span v-if="data.isCategory" class="text-orange">📁</span>
                <span v-else class="text-cyan">⚙️</span>
                {{ data.name }}
              </span>
              <span class="tree-node-actions" v-if="!data.isCategory">
                <i
                  class="el-icon-edit text-green"
                  title="修改属性"
                  @click.stop="handleUpdateAttr(data.raw)"
                ></i>
                <i
                  class="el-icon-delete text-red"
                  title="注销属性"
                  @click.stop="handleDeleteAttr(data.raw)"
                ></i>
              </span>
            </span>
          </el-tree>
        </div>
      </div>

      <div class="right-combined-panel">
        <div class="right-top-detail-zone">
          <div class="panel-header-summary">
            <span class="title">🔍 当前选中运控属性要素指标</span>
            <span class="badge font-num text-orange" v-if="selectedAttr"
              >ID: {{ selectedAttr.ocStrategyAttrId }}</span
            >
          </div>

          <div v-if="selectedAttr" class="node-detail-matrix">
            <div class="detail-cell">
              <span class="lbl">属性名称</span
              ><span class="val text-blue font-num">{{
                selectedAttr.attrName
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">对应标准映射键值</span
              ><span class="val font-num text-cyan">{{
                getAttrMapKey(selectedAttr.attrName)
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">策略归属类型</span
              ><span class="val text-orange">{{
                selectedAttr.strategyType
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">参数数据类型 (attrType)</span
              ><span class="val text-green font-num">{{
                selectedAttr.attrType
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">缺省系统配置值 (defaultValue)</span
              ><span class="val font-num text-gray">{{
                selectedAttr.defaultValue || '未设置默认值'
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">最后安全签发人</span
              ><span class="val text-gray">{{
                selectedAttr.opUserName || '系统管理员'
              }}</span>
            </div>
            <div class="detail-cell span-2">
              <span class="lbl">最后遥测流水同步时间</span
              ><span class="val font-num text-gray">{{
                selectedAttr.opTime || '-'
              }}</span>
            </div>
          </div>
          <div v-else class="sub-empty-info">
            💡 请在左侧运控树中点击选择任意具体“属性节点”，以激活全要素状态监测
          </div>
        </div>

        <div class="right-bottom-strategy-zone">
          <div class="panel-header-summary">
            <span class="title"
              >⚡ 关联的战术响应操控算子 (Candidate Operators)</span
            >
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              class="inner-add-btn"
              @click="handleCreateOperator"
            >
              新增运控算子
            </el-button>
          </div>

          <div class="strategy-scroll-box">
            <div v-if="currentOperators.length === 0" class="sub-empty">
              该属性项下暂未联动任何运控操作动作
            </div>

            <div
              v-for="op in currentOperators"
              :key="op.ocStrategyOperatorId"
              class="link-status-card compact-card"
            >
              <div
                class="alarm-strip"
                :class="
                  isOpLinked(op.ocStrategyOperatorId)
                    ? 'strip-level-safe'
                    : 'strip-level-crit'
                "
              ></div>

              <div class="card-line">
                <span
                  class="wl-name ellipsis-text"
                  style="max-width: 220px"
                  :title="op.operatorName"
                >
                  <small class="text-cyan"
                    >#{{ op.ocStrategyOperatorId }}</small
                  >
                  {{ op.operatorName }}
                </span>
                <span class="card-actions">
                  <i
                    class="el-icon-edit text-green"
                    @click="handleUpdateOperator(op)"
                  ></i>
                  <i
                    class="el-icon-delete text-red"
                    @click="handleDeleteOperator(op)"
                  ></i>
                </span>
              </div>

              <div class="card-line metric-line">
                <span
                  class="metric-item ellipsis-text"
                  style="max-width: 240px"
                  :title="op.operatorMemo"
                >
                  📝 动作机理:
                  <span class="text-gray">{{
                    op.operatorMemo || '暂无说明'
                  }}</span>
                </span>
                <span
                  class="metric-item text-green"
                  v-if="isOpLinked(op.ocStrategyOperatorId)"
                >
                  [已联动激活]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="attrDialogTitle"
      :visible.sync="attrDialogVisible"
      width="540px"
      custom-class="dark-custom-dialog"
      append-to-body
      @close="resetAttrForm"
    >
      <el-form :model="attrForm" label-width="110px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">策略属性名称</span>
            <input
              type="text"
              v-model="attrForm.attrName"
              class="inner-input"
              placeholder="请输入属性名称（可参考标准映射集）..."
            />
          </div>

          <div class="detail-row">
            <span class="lbl">策略归属大类</span>
            <select v-model="attrForm.strategyType" class="inner-select">
              <option v-for="t in strategyTypes" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </div>

          <div class="detail-row">
            <span class="lbl">参数数据格式类型</span>
            <select v-model="attrForm.attrType" class="inner-select">
              <option v-for="t in attrTypes" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </div>

          <div class="detail-row span-2">
            <span class="lbl">属性配置默认缺省值</span>
            <input
              type="text"
              v-model="attrForm.defaultValue"
              class="inner-input"
              placeholder="输入默认值..."
            />
          </div>

          <div class="detail-row span-2" style="background: #05090f">
            <span class="lbl" style="margin-bottom: 6px"
              >联动授权候选操作算子 (可多选)</span
            >
            <el-checkbox-group
              v-model="selectedOpIdsArray"
              class="dark-checkbox-group"
            >
              <el-checkbox
                v-for="op in allOperators"
                :key="op.ocStrategyOperatorId"
                :label="op.ocStrategyOperatorId"
              >
                {{ op.operatorName }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          @click="attrDialogVisible = false"
          size="mini"
          class="dark-btn"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="submitAttrForm"
          size="mini"
          :loading="submitLoading"
          >编译并部署属性</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      :title="opDialogTitle"
      :visible.sync="opDialogVisible"
      width="500px"
      custom-class="dark-custom-dialog"
      append-to-body
      @close="resetOpForm"
    >
      <el-form :model="opForm" label-width="100px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">运控操控算子名称</span>
            <input
              type="text"
              v-model="opForm.operatorName"
              class="inner-input"
              placeholder="如：强行倒换主节点、自动重置链路等..."
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">操控动作执行机理说明 (operatorMemo)</span>
            <textarea
              v-model="opForm.operatorMemo"
              rows="3"
              class="inner-input"
              style="height: 65px; resize: none"
              placeholder="描述此动作下发的软硬件指令行为..."
            ></textarea>
          </div>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="opDialogVisible = false" size="mini" class="dark-btn"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="submitOpForm"
          size="mini"
          :loading="submitLoading"
          >注入发布算子</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {apiPage, apiAdd, apiUpdate, apiDelete, apiGetAll} from '@/api/common'
// 🌟 严格引入您指定的 map 配置字典
import {getStrategyTypes, getAttributeMap, getAttrTypes} from '@/api/map'

export default {
  name: 'OcStrategyComprehensiveDashboard',
  data() {
    return {
      attrModuleUrl: 'ocStrategyAttr', // 策略属性模块路由
      operatorModuleUrl: 'ocStrategyOperator', // 操作算子模块路由

      pageLoading: false,
      submitLoading: false,

      strategyTreeData: [], // 动态组装后的策略分类树
      allAttributes: [], // 后端加载的原始全量属性池
      allOperators: [], // 后端加载的原始全量操作算子池
      currentOperators: [], // 当前选中属性项可见/关联的操作列表
      selectedAttr: null, // 当前被激活的树节点原始对象

      // 导入的外部基础数据映射字典
      strategyTypes: getStrategyTypes(),
      attributeMap: getAttributeMap(),
      attrTypes: getAttrTypes(),

      defaultTreeProps: {children: 'children', label: 'name'},
      listQuery: {strategyType: '', attrName: ''},

      // 属性表单
      attrDialogVisible: false,
      attrDialogTitle: '',
      selectedOpIdsArray: [], // 表单多选框中转数组
      attrForm: {
        ocStrategyAttrId: null,
        strategyType: '',
        attrName: '',
        attrType: '',
        defaultValue: '',
        optionOperatorIds: ''
      },

      // 操作算子表单
      opDialogVisible: false,
      opDialogTitle: '',
      opForm: {ocStrategyOperatorId: null, operatorName: '', operatorMemo: ''}
    }
  },
  mounted() {
    this.initGlobalStrategyData()
  },
  methods: {
    /**
     * 核心初始化：全量并行获取数据，并在前端组装树结构
     */
    async initGlobalStrategyData() {
      this.pageLoading = true
      try {
        // 1. 获取全量属性项
        const attrRes = await apiPage(this.attrModuleUrl, {
          pageNum: 1,
          pageSize: 200
        })
        this.allAttributes = attrRes.data.list || attrRes.data || []

        // 2. 获取全量执行操作算子
        const opRes = await apiPage(this.operatorModuleUrl, {
          pageNum: 1,
          pageSize: 200
        })
        this.allOperators = opRes.data.list || opRes.data || []

        // 3. 将扁平数据根据大类组装成两层谱系树
        this.renderStrategyTree()

        // 保持激活树联动
        if (this.selectedAttr) {
          const fresh = this.allAttributes.find(
            a => a.ocStrategyAttrId === this.selectedAttr.ocStrategyAttrId
          )
          if (fresh) this.handleTreeNodeClick({isCategory: false, raw: fresh})
        } else {
          // 默认加载全量算子在底部平铺展现
          this.currentOperators = this.allOperators
        }
      } catch (e) {
        console.error('分级运控初始化级联故障:', e)
      } finally {
        this.pageLoading = false
      }
    },

    /**
     * 🛠️ 前端自组策略树算法：将大类与细分的属性融合成树形拓扑结构
     */
    renderStrategyTree() {
      // 获取四大标准大类
      const categories = this.strategyTypes
      const tree = categories.map((catName, index) => {
        // 过滤属于该大类的属性项
        const childrenAttrs = this.allAttributes
          .filter(attr => attr.strategyType === catName)
          .map(attr => ({
            id: `attr_${attr.ocStrategyAttrId}`,
            name: attr.attrName,
            isCategory: false,
            raw: attr
          }))

        return {
          id: `cat_${index}`,
          name: catName,
          isCategory: true,
          children: childrenAttrs
        }
      })
      this.strategyTreeData = tree
    },

    /**
     * 树节点激活点击事件
     */
    handleTreeNodeClick(nodeData) {
      if (nodeData.isCategory) {
        // 点击大类分类项：右侧过滤展示属于该类的算子或全集
        this.selectedAttr = null
        this.currentOperators = this.allOperators
        return
      }
      // 点击具体属性叶子节点
      const rawAttr = nodeData.raw
      this.selectedAttr = rawAttr

      // 分层过滤算子：优先展示当前属性绑定的候选操作项，若没绑定则平铺全部供查看
      if (rawAttr.optionOperatorIds) {
        const idArr = String(rawAttr.optionOperatorIds)
          .split(',')
          .map(id => Number(id.trim()))
        // 排序把绑定的放在前面，或者只显示绑定的
        this.currentOperators = this.allOperators.filter(op =>
          idArr.includes(op.ocStrategyOperatorId)
        )
      } else {
        this.currentOperators = []
      }
    },

    /**
     * 判断当前算子是否已被选中绑定
     */
    isOpLinked(opId) {
      if (!this.selectedAttr || !this.selectedAttr.optionOperatorIds)
        return false
      return String(this.selectedAttr.optionOperatorIds)
        .split(',')
        .map(id => Number(id.trim()))
        .includes(opId)
    },

    /**
     * 反查 attributeMap 的英文标准对照 Key
     */
    getAttrMapKey(name) {
      return this.attributeMap[name] || 'customDefine'
    },

    handleTypeSearch() {
      // 级联控制左侧树的大类节点展开或过滤
      this.filterStrategyTree()
    },

    filterStrategyTree() {
      if (this.$refs.strategyTree) {
        this.$refs.strategyTree.filter({
          type: this.listQuery.strategyType,
          name: this.listQuery.attrName
        })
      }
    },

    filterTreeMethod(value, data) {
      if (!value) return true
      const matchType =
        !value.type ||
        data.name === value.type ||
        (!data.isCategory && data.raw.strategyType === value.type)
      const matchName =
        !value.name ||
        data.name.toLowerCase().includes(value.name.toLowerCase())
      return matchType && matchName
    },

    /* =================== ⚙️ 运控策略属性 (ocStrategyAttr) 维护 =================== */
    handleCreateAttr() {
      this.resetAttrForm()
      this.attrDialogTitle = '⚡ 下发部署全新运控策略控制属性'
      this.attrDialogVisible = true
    },
    handleUpdateAttr(row) {
      this.resetAttrForm()
      this.attrForm = Object.assign({}, row)
      // 解析后端逗号分隔的字符 ID 序列到前端多选数组中
      if (this.attrForm.optionOperatorIds) {
        this.selectedOpIdsArray = String(this.attrForm.optionOperatorIds)
          .split(',')
          .map(id => Number(id.trim()))
      }
      this.attrDialogTitle = '⚙️ 修正已有分级运控属性遥测规则'
      this.attrDialogVisible = true
    },
    submitAttrForm() {
      if (!this.attrForm.attrName || !this.attrForm.strategyType) {
        this.$message.warning('属性名称与归属大类为核心必填强约束项')
        return
      }
      // 反向将多选数组拼装成逗号分隔字串回传后端
      this.attrForm.optionOperatorIds = this.selectedOpIdsArray.join(',')
      this.submitLoading = true

      const reqAction = this.attrForm.ocStrategyAttrId ? apiUpdate : apiAdd
      reqAction(this.attrModuleUrl, this.attrForm)
        .then(() => {
          this.$message.success('分级运控属性更新成功并广播上线')
          this.attrDialogVisible = false
          this.initGlobalStrategyData()
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handleDeleteAttr(row) {
      this.$confirm(
        `确定注销并剥离分级运控属性 [#${row.attrName}]?`,
        '策略解绑风控警报',
        {
          confirmButtonText: '强制熔断',
          cancelButtonText: '保留观测'
        }
      ).then(() => {
        apiDelete(this.attrModuleUrl, row.ocStrategyAttrId).then(() => {
          this.$message.success('当前运控配置参数已剔除离线')
          if (this.selectedAttr?.ocStrategyAttrId === row.ocStrategyAttrId) {
            this.selectedAttr = null
          }
          this.initGlobalStrategyData()
        })
      })
    },
    resetAttrForm() {
      this.selectedOpIdsArray = []
      this.attrForm = {
        ocStrategyAttrId: null,
        strategyType: this.strategyTypes[0],
        attrName: '',
        attrType: this.attrTypes[3],
        defaultValue: '',
        optionOperatorIds: ''
      }
    },

    /* =================== ⚡ 操控动作算子 (ocStrategyOperator) 维护 =================== */
    handleCreateOperator() {
      this.resetOpForm()
      this.opDialogTitle = '⚡ 注入发布全新底层执行操控算子'
      this.opDialogVisible = true
    },
    handleUpdateOperator(row) {
      this.resetOpForm()
      this.opForm = Object.assign({}, row)
      this.opDialogTitle = '⚙️ 升级细化现有操控单元特征'
      this.opDialogVisible = true
    },
    submitOpForm() {
      if (!this.opForm.operatorName) {
        this.$message.warning('操控算子执行动作名称不能为空')
        return
      }
      this.submitLoading = true
      const reqAction = this.opForm.ocStrategyOperatorId ? apiUpdate : apiAdd
      reqAction(this.operatorModuleUrl, this.opForm)
        .then(() => {
          this.$message.success('应急控制动作算子注入成功')
          this.opDialogVisible = false
          this.initGlobalStrategyData()
          this.submitLoading = false
        })
        .catch(() => {
          this.submitLoading = false
        })
    },
    handleDeleteOperator(row) {
      this.$confirm(
        `是否从底层彻底废弃移除该项控制算子行为 [#${row.operatorName}]?`,
        '行为熔断警告',
        {
          confirmButtonText: '确定熔断',
          cancelButtonText: '取消'
        }
      ).then(() => {
        apiDelete(this.operatorModuleUrl, row.ocStrategyOperatorId).then(() => {
          this.$message.success('该控制指令已被系统永久注销')
          this.initGlobalStrategyData()
        })
      })
    },
    resetOpForm() {
      this.opForm = {
        ocStrategyOperatorId: null,
        operatorName: '',
        operatorMemo: ''
      }
    }
  }
}
</script>

<style scoped>
/* 🌟 全局 100% 弹性流大屏，不写死绝对定位和破坏性高度 */
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

/* 顶层检索控制横条 */
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
  width: 150px;
}
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
}

/* 主体分舱 */
.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}

/* 左侧策略分类树舱 */
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

/* 深度定制化 Element 树结构 */
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

/* 右侧核心综合调度（上下二分） */
.right-combined-panel {
  flex: 7;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

/* 右上：全要素详情 */
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
  font-family: monospace;
}

/* 右下：响应操作池（放底部） */
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

/* 🌟 标准两行严格限高微操控卡片 */
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
} /* 当前属性已选关联此算子 */
.strip-level-crit {
  background: #1e293b;
} /* 备用不联动算子 */
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

/* 公用表头小标题及徽章 */
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

/* 科技深色维护表单弹窗 */
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

/* 穿透微调多选框（暗黑主题） */
::v-deep .dark-checkbox-group .el-checkbox {
  margin-right: 15px;
  margin-bottom: 4px;
}
::v-deep .dark-checkbox-group .el-checkbox__label {
  color: #94a3b8 !important;
  font-size: 11px;
}
::v-deep
  .dark-checkbox-group
  .el-checkbox__input.is-checked
  + .el-checkbox__label {
  color: #38bdf8 !important;
}

/* 配色通用类工具 */
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
