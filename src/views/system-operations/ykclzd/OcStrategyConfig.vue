<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">分级运控策略</span>

        <div class="search-item">
          <label>策略大类</label>
          <el-select
            v-model="listQuery.strategyType"
            @change="handleTypeSearch"
            style="width: 140px"
            size="small"
          >
            <el-option label="全部策略大类" :value="''"></el-option>
            <el-option
              v-for="type in strategyTypes"
              :key="type"
              :label="type"
              :value="type"
            />
          </el-select>
        </div>

        <div class="search-item">
          <label>属性检索</label>
          <el-input
            v-model="listQuery.attrName"
            @input="filterStrategyTree"
            placeholder="输入属性名称搜索..."
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
          <span class="title">运控策略属性谱系树</span>
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
                <Icon
                  v-if="data.isCategory"
                  icon="lucide:folder-git-2"
                  :size="13"
                  color="var(--color-warning, #f59e0b)"
                  style="vertical-align: middle; margin-right: 4px"
                />
                <Icon
                  v-else
                  icon="lucide:sliders"
                  :size="13"
                  color="var(--color-cyan, #06b6d4)"
                  style="vertical-align: middle; margin-right: 4px"
                />
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
            <span class="title"
              ><Icon
                icon="lucide:square-terminal"
                :size="14"
                color="var(--color-primary, #38bdf8)"
                style="vertical-align: middle; margin-right: 5px"
              />当前选中运控属性详情</span
            >
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
              <span class="lbl">参数数据类型</span
              ><span class="val text-green font-num">{{
                selectedAttr.attrType
              }}</span>
            </div>
            <div class="detail-cell">
              <span class="lbl">缺省系统配置值</span
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
              <span class="lbl">最后同步时间</span
              ><span class="val font-num text-gray">{{
                selectedAttr.opTime || '-'
              }}</span>
            </div>
          </div>
          <div v-else class="sub-empty-info">
            请在左侧运控树中点击选择任意具体“属性节点”
          </div>
        </div>

        <div class="right-bottom-strategy-zone">
          <el-button
            v-show="activeTab === 'all'"
            type="primary"
            size="mini"
            icon="el-icon-plus"
            class="tabs-inline-btn"
            @click="handleCreateOperator"
          >
            新增运控算子
          </el-button>

          <el-tabs v-model="activeTab" class="dark-custom-tabs">
            <el-tab-pane name="linked">
              <span slot="label">
                <Icon
                  icon="lucide:workflow"
                  :size="13"
                  style="vertical-align: middle; margin-right: 4px"
                />
                关联操作配置项
                <el-badge
                  v-if="selectedAttr"
                  :value="currentOperators.length"
                  class="tab-badge"
                  type="primary"
                />
              </span>

              <div class="strategy-scroll-box">
                <div v-if="!selectedAttr" class="sub-empty">
                  请先在左侧选择具体的“属性节点”查看其关联操作
                </div>
                <div
                  v-else-if="currentOperators.length === 0"
                  class="sub-empty"
                >
                  该属性项下暂未联动任何运控操作动作
                </div>

                <div
                  v-for="op in currentOperators"
                  :key="'linked_' + op.ocStrategyOperatorId"
                  class="link-status-card compact-card"
                >
                  <div class="alarm-strip strip-level-safe"></div>
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
                      动作机理:
                      <span class="text-gray">{{
                        op.operatorMemo || '暂无说明'
                      }}</span>
                    </span>
                    <span class="metric-item text-green">[已联动激活]</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane name="all">
              <span slot="label">
                <Icon
                  icon="lucide:binary"
                  :size="13"
                  style="vertical-align: middle; margin-right: 4px"
                />
                全部操作配置项
                <el-badge
                  :value="allOperators.length"
                  class="tab-badge"
                  type="info"
                />
              </span>

              <div class="strategy-scroll-box">
                <div v-if="allOperators.length === 0" class="sub-empty">
                  系统内暂无任何底层配置项
                </div>

                <div
                  v-for="op in allOperators"
                  :key="'all_' + op.ocStrategyOperatorId"
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
                      动作机理:
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
            </el-tab-pane>
          </el-tabs>
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
      <el-form :model="attrForm" label-width="111px" size="mini">
        <div class="dialog-detail-matrix">
          <div class="detail-row span-2">
            <span class="lbl">策略属性名称</span>
            <el-input
              v-model="attrForm.attrName"
              placeholder="请输入属性名称（可参考标准映射集）..."
              size="small"
            />
          </div>

          <div class="detail-row">
            <span class="lbl">策略归属大类</span>
            <el-select v-model="attrForm.strategyType" size="small">
              <el-option
                v-for="t in strategyTypes"
                :key="t"
                :label="t"
                :value="t"
              />
            </el-select>
          </div>

          <div class="detail-row">
            <span class="lbl">参数数据格式类型</span>
            <el-select v-model="attrForm.attrType" size="small">
              <el-option
                v-for="t in attrTypes"
                :key="t"
                :label="t"
                :value="t"
              />
            </el-select>
          </div>

          <div class="detail-row span-2">
            <span class="lbl">属性配置默认缺省值</span>
            <el-input
              v-model="attrForm.defaultValue"
              placeholder="输入默认值..."
              size="small"
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
            <span class="lbl">运控配置项名称</span>
            <el-input
              v-model="opForm.operatorName"
              placeholder="如：强行倒换主节点、自动重置链路等..."
              size="small"
            />
          </div>
          <div class="detail-row span-2">
            <span class="lbl">操控动作执行机理说明</span>
            <el-input
              v-model="opForm.operatorMemo"
              type="textarea"
              :rows="3"
              style="height: 65px; resize: none"
              placeholder="描述此动作下发的软硬件指令行为..."
              size="small"
            />
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
import {getStrategyTypes, getAttributeMap, getAttrTypes} from '@/api/map'

export default {
  name: 'OcStrategyComprehensiveDashboard',
  data() {
    return {
      attrModuleUrl: 'ocStrategyAttr',
      operatorModuleUrl: 'ocStrategyOperator',

      pageLoading: false,
      submitLoading: false,

      strategyTreeData: [],
      allAttributes: [],
      allOperators: [],
      currentOperators: [],
      selectedAttr: null,
      activeTab: 'linked', // 'linked' 为关联, 'all' 为全部

      strategyTypes: getStrategyTypes(),
      attributeMap: getAttributeMap(),
      attrTypes: getAttrTypes(),

      defaultTreeProps: {children: 'children', label: 'name'},
      listQuery: {strategyType: '', attrName: ''},

      attrDialogVisible: false,
      attrDialogTitle: '',
      selectedOpIdsArray: [],
      attrForm: {
        ocStrategyAttrId: null,
        strategyType: '',
        attrName: '',
        attrType: '',
        defaultValue: '',
        optionOperatorIds: ''
      },

      opDialogVisible: false,
      opDialogTitle: '',
      opForm: {ocStrategyOperatorId: null, operatorName: '', operatorMemo: ''}
    }
  },
  mounted() {
    this.initGlobalStrategyData()
  },
  methods: {
    async initGlobalStrategyData() {
      this.pageLoading = true
      try {
        const attrRes = await apiPage(this.attrModuleUrl, {
          pageNum: 1,
          pageSize: 200
        })
        this.allAttributes = attrRes.data.list || attrRes.data || []

        const opRes = await apiPage(this.operatorModuleUrl, {
          pageNum: 1,
          pageSize: 200
        })
        this.allOperators = opRes.data.list || opRes.data || []

        this.renderStrategyTree()

        if (this.selectedAttr) {
          const fresh = this.allAttributes.find(
            a => a.ocStrategyAttrId === this.selectedAttr.ocStrategyAttrId
          )
          if (fresh) this.handleTreeNodeClick({isCategory: false, raw: fresh})
        }
      } catch (e) {
        console.error('分级运控初始化级联故障:', e)
      } finally {
        this.pageLoading = false
      }
    },

    renderStrategyTree() {
      const categories = this.strategyTypes
      const tree = categories.map((catName, index) => {
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

    handleTreeNodeClick(nodeData) {
      if (nodeData.isCategory) {
        this.selectedAttr = null
        this.currentOperators = []
        this.activeTab = 'all'
        return
      }

      const rawAttr = nodeData.raw
      this.selectedAttr = rawAttr
      this.activeTab = 'linked'

      if (rawAttr.optionOperatorIds) {
        const idArr = String(rawAttr.optionOperatorIds)
          .split(',')
          .map(id => Number(id.trim()))
        this.currentOperators = this.allOperators.filter(op =>
          idArr.includes(op.ocStrategyOperatorId)
        )
      } else {
        this.currentOperators = []
      }
    },

    isOpLinked(opId) {
      if (!this.selectedAttr || !this.selectedAttr.optionOperatorIds)
        return false
      return String(this.selectedAttr.optionOperatorIds)
        .split(',')
        .map(id => Number(id.trim()))
        .includes(opId)
    },

    getAttrMapKey(name) {
      return this.attributeMap[name] || 'customDefine'
    },

    handleTypeSearch() {
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

    /* =================== ⚙️ 策略属性维护 =================== */
    handleCreateAttr() {
      this.resetAttrForm()
      this.attrDialogTitle = '⚡ 下发部署全新运控策略控制属性'
      this.attrDialogVisible = true
    },
    handleUpdateAttr(row) {
      this.resetAttrForm()
      this.attrForm = Object.assign({}, row)
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
        {confirmButtonText: '强制熔断', cancelButtonText: '保留观测'}
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

    /* =================== ⚡ 操控动作算子维护 =================== */
    handleCreateOperator() {
      this.resetOpForm()
      this.opDialogTitle = '发布配置项'
      this.opDialogVisible = true
    },
    handleUpdateOperator(row) {
      this.resetOpForm()
      this.opForm = Object.assign({}, row)
      this.opDialogTitle = '升级'
      this.opDialogVisible = true
    },
    submitOpForm() {
      if (!this.opForm.operatorName) {
        this.$message.warning('配置项执行动作名称不能为空')
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
        `是否彻底废弃移除该项配置项行为 [#${row.operatorName}]?`,
        '行为熔断警告',
        {confirmButtonText: '确定熔断', cancelButtonText: '取消'}
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
  color: #94a3b8;
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
  flex: 3;
  background: #080e18;
  border: 1px solid #111b2b;
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
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 4px;
}
.detail-cell .val {
  font-size: 12px;
  color: #f8fafc;
}

/* 右下配置区容器 */
.right-bottom-strategy-zone {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 0 12px 12px 12px;
  display: flex;
  flex-direction: column;
  flex: 5;
  min-height: 0;
  position: relative; /* 🌟 设为相对定位，允许子按钮绝对定位到右上角 */
}

/* 🌟 精准控位：将“新增按钮”完美定位到 Tabs 栏的右侧同行 */
.tabs-inline-btn {
  position: absolute;
  right: 12px;
  top: 6px;
  z-index: 10; /* 确保悬浮在 el-tabs 头部之上不被遮挡 */
}

/* Element UI Tabs 穿透定制 */
::v-loading-dark .el-loading-mask {
  background-color: rgba(3, 6, 12, 0.8);
}
.dark-custom-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.dark-custom-tabs /deep/ .el-tabs__header {
  margin: 0 0 11px 0;
  border-bottom: 1px solid #111b2b;
  padding-right: 111px; /* 🌟 预留右侧空间，防止 Tab 头标签过多时与新增按钮重叠 */
}
.dark-custom-tabs /deep/ .el-tabs__nav-wrap::after {
  background-color: transparent;
}
.dark-custom-tabs /deep/ .el-tabs__item {
  color: #94a3b8;
  font-size: 12px;
  font-weight: bold;
  height: 40px;
  line-height: 40px;
}
.dark-custom-tabs /deep/ .el-tabs__item.is-active {
  color: #38bdf8;
}
.dark-custom-tabs /deep/ .el-tabs__active-bar {
  background-color: #38bdf8;
}
.dark-custom-tabs /deep/ .el-tabs__content {
  flex: 1;
  min-height: 0;
  position: relative;
}
.dark-custom-tabs /deep/ .el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-badge {
  margin-left: 4px;
}
.tab-badge /deep/ .el-badge__content {
  border: none;
  height: 14px;
  line-height: 14px;
  padding: 0 4px;
  font-size: 9px;
  transform: scale(0.9);
}

/* 滚动盒样式净化 */
.strategy-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 52px;
  gap: 8px;
}

.link-status-card.compact-card {
  background: #0d1522;
  border: 1px solid #172438;
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
  background: #10b981;
}
.strip-level-crit {
  background: #1e293b;
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
  color: #94a3b8;
  font-size: 11px;
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
  font-size: 11px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  padding-top: 30px;
  grid-column: span 2;
}
.sub-empty-info {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  padding-top: 45px;
  flex: 1;
}

.dialog-detail-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}
.detail-row {
  background: #070c14;
  padding: 6px 11px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.detail-row .lbl {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 2px;
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
  color: #94a3b8 !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
