<template>
  <div class="governance-page">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">📋 数据治理模型维护总线</span>
        <span class="header-subtitle">数据分类模型与数据标注模型分区维护</span>
      </div>
      <el-button
        type="info"
        size="mini"
        icon="el-icon-refresh"
        class="action-btn"
        @click="initPage"
      >
        同步模型数据
      </el-button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span>数据分类节点</span>
        <strong class="font-num text-blue">{{ dataModelCount }}</strong>
        <small>dataModel 树节点总量</small>
      </div>
      <div class="stat-card">
        <span>分类目录</span>
        <strong class="font-num text-green">{{ dataFolderCount }}</strong>
        <small>nodeType = 1 (文件夹)</small>
      </div>
      <div class="stat-card">
        <span>数据叶子</span>
        <strong class="font-num text-orange">{{ dataLeafCount }}</strong>
        <small>nodeType = 2 (实体表)</small>
      </div>
      <div class="stat-card">
        <span>标注分类</span>
        <strong class="font-num text-cyan">{{ labelClassCount }}</strong>
        <small>labelClass 树节点总量</small>
      </div>
      <div class="stat-card">
        <span>标签模型</span>
        <strong class="font-num text-green">{{ labelModelTotal }}</strong>
        <small>labelModel 实例总量</small>
      </div>
      <div class="stat-card">
        <span>数据源</span>
        <strong class="font-num text-blue">{{
          dataSourceOptions.length
        }}</strong>
        <small>可绑定数据源数量</small>
      </div>
    </div>

    <div class="model-workbench">
      <el-tabs
        v-model="activeTab"
        class="dark-tabs fill-tabs"
        @tab-click="handleTabClick"
      >
        <el-tab-pane name="dataModel" class="full-pane">
          <span slot="label">数据分类模型</span>
          <div class="tab-layout">
            <div class="side-panel" v-loading="loadingDataModel">
              <div class="panel-header-summary">
                <span class="title">🗂️ 数据分类导航树</span>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  @click="openDataModelDialog(false)"
                >
                  新建根节点
                </el-button>
              </div>

              <el-input
                v-model="dataModelFilter"
                size="mini"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索过滤数据分类..."
              />

              <div class="tree-box">
                <el-tree
                  ref="dataModelTree"
                  :data="dataModelTree"
                  :props="dataModelProps"
                  node-key="dataModelId"
                  default-expand-all
                  highlight-current
                  :expand-on-click-node="false"
                  :filter-node-method="filterDataModelNode"
                  @node-click="handleDataModelClick"
                >
                  <span class="tree-node" slot-scope="{data}">
                    <span class="node-content-flex">
                      <i
                        :class="[
                          data.nodeType === 2
                            ? 'el-icon-s-grid'
                            : 'el-icon-folder-opened',
                          data.nodeType === 2
                            ? 'icon-color-table'
                            : 'icon-color-folder'
                        ]"
                      ></i>
                      <span class="node-text-span">{{ data.modelName }}</span>
                    </span>
                    <span class="tree-actions">
                      <i
                        class="el-icon-plus text-blue"
                        title="添加子节点"
                        @click.stop="openDataModelDialog(false, data)"
                      ></i>
                      <i
                        class="el-icon-edit text-green"
                        title="编辑节点"
                        @click.stop="openDataModelDialog(true, data)"
                      ></i>
                      <i
                        class="el-icon-delete text-red"
                        title="删除节点"
                        @click.stop="deleteDataModel(data)"
                      ></i>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>

            <div class="content-panel">
              <div v-if="activeDataModel" class="fixed-visual-container">
                <div class="visual-hero-card static-top-card">
                  <div class="hero-top-flex">
                    <h3 class="hero-title">{{ activeDataModel.modelName }}</h3>
                    <div class="tag-group">
                      <el-tag
                        size="mini"
                        :type="
                          activeDataModel.nodeType === 2 ? 'success' : 'info'
                        "
                      >
                        {{ nodeTypeText(activeDataModel.nodeType) }}
                      </el-tag>
                      <el-tag size="mini" type="warning">{{
                        dataTypeText(activeDataModel.dataType)
                      }}</el-tag>
                    </div>
                  </div>
                  <p class="hero-memo">
                    {{
                      activeDataModel.dataMemo ||
                      '未录入该分类模型的业务资产描述信息。'
                    }}
                  </p>
                </div>

                <div class="visual-data-grid">
                  <div class="v-grid-item">
                    <span class="v-label">物理数据源</span>
                    <strong class="v-val text-blue">{{
                      activeDataModel.sourceName || '未绑定源'
                    }}</strong>
                  </div>
                  <div class="v-grid-item">
                    <span class="v-label">关联底层物理库名 (DB)</span>
                    <strong class="v-val text-cyan">{{
                      activeDataModel.dbName || '--'
                    }}</strong>
                  </div>
                  <div class="v-grid-item">
                    <span class="v-label">层级所属父代节点</span>
                    <strong class="v-val text-green">{{
                      activeDataModel.parentModelName || '系统主干根节点'
                    }}</strong>
                  </div>
                </div>

                <div class="visual-tables-block fixed-height-block">
                  <span class="block-subtitle"
                    >🔗 映射绑定物理实体表名称 (点击表名可下钻预览数据)</span
                  >
                  <div
                    v-if="activeDataModel.tableNames"
                    class="tokens-flex-layout scrollable-tokens"
                  >
                    <div
                      v-for="table in activeDataModel.tableNames.split(',')"
                      :key="table"
                      class="visual-table-token interactive-token"
                      @click="previewPhysicalTableData(table)"
                    >
                      <i class="el-icon-table-lamp"></i>
                      <span class="token-text">{{ table }}</span>
                    </div>
                  </div>
                  <div v-else class="empty-tables-holder">
                    <i class="el-icon-warning-outline"></i>
                    该模型分类节点当前尚未绑定/映射底层数据物理表
                  </div>
                </div>
              </div>

              <div v-else class="empty-visual-placeholder">
                <i class="el-icon-monitor"></i>
                <p>请点击左侧分类树节点激活数据模型详情可视化视图</p>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="labelModel" class="full-pane">
          <span slot="label">数据标注模型</span>
          <div class="tab-layout">
            <div class="side-panel" v-loading="loadingLabelClass">
              <div class="panel-header-summary">
                <span class="title">🏷️ 标注分类导航树</span>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  @click="openLabelClassDialog(false)"
                >
                  新建分类
                </el-button>
              </div>

              <el-input
                v-model="labelClassFilter"
                size="mini"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索过滤标注分类..."
              />

              <div class="tree-box">
                <el-tree
                  ref="labelClassTree"
                  :data="labelClassTree"
                  :props="labelClassProps"
                  node-key="labelClassId"
                  default-expand-all
                  highlight-current
                  :expand-on-click-node="false"
                  :filter-node-method="filterLabelClassNode"
                  @node-click="handleLabelClassClick"
                >
                  <span class="tree-node" slot-scope="{data}">
                    <span class="node-content-flex">
                      <i
                        :class="[
                          Number(data.classType) === 1
                            ? 'el-icon-folder-opened'
                            : 'el-icon-price-tag',
                          Number(data.classType) === 1
                            ? 'icon-color-folder'
                            : 'icon-color-label'
                        ]"
                      ></i>
                      <span class="node-text-span">{{ data.className }}</span>
                    </span>
                    <span class="tree-actions">
                      <i
                        v-if="Number(data.classType) === 1"
                        class="el-icon-plus text-blue"
                        title="新建子标签模型"
                        @click.stop="openLabelModelDialog(false, data)"
                      ></i>

                      <i
                        class="el-icon-edit text-green"
                        title="编辑分类"
                        @click.stop="openLabelClassDialog(true, data)"
                      ></i>
                      <i
                        class="el-icon-delete text-red"
                        title="删除分类"
                        @click.stop="deleteLabelClass(data)"
                      ></i>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>

            <div class="content-panel">
              <div class="toolbar top-fixed-toolbar">
                <el-form :inline="true" :model="labelModelQuery" size="mini">
                  <el-form-item label="分类名称">
                    <el-input
                      v-model="labelModelQuery.className"
                      clearable
                      placeholder="输入分类检索"
                    />
                  </el-form-item>
                  <el-form-item label="标签名称">
                    <el-input
                      v-model="labelModelQuery.labelName"
                      clearable
                      placeholder="输入标签检索"
                    />
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      icon="el-icon-search"
                      @click="fetchLabelModels"
                      >查询</el-button
                    >
                    <el-button
                      icon="el-icon-refresh"
                      @click="resetLabelModelQuery"
                      >重置</el-button
                    >
                  </el-form-item>
                </el-form>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  @click="openLabelModelDialog(false)"
                >
                  新建标签模型
                </el-button>
              </div>

              <div v-if="activeLabelClass" class="fixed-visual-container">
                <div class="visual-hero-card label-class-theme static-top-card">
                  <div class="hero-top-flex">
                    <h3 class="hero-title">
                      🏷️ {{ activeLabelClass.className }}
                    </h3>
                    <div class="tag-group">
                      <el-tag size="mini" type="info">{{
                        classTypeText(activeLabelClass.classType)
                      }}</el-tag>
                    </div>
                  </div>
                  <p class="hero-memo">
                    <strong>所属来源: </strong
                    >{{ activeLabelClass.classSource || '内部定义' }} |
                    <strong>功能简述: </strong
                    >{{ activeLabelClass.classMemo || '暂无分类深度描述。' }}
                  </p>
                </div>

                <span class="block-subtitle"
                  >📌 包含的具体标签模型看板
                  (点击卡片穿透检索透视底层数据)</span
                >

                <div
                  class="label-cards-layout-grid flex-scroll-grid"
                  v-loading="loadingLabelModel"
                >
                  <div
                    v-for="model in labelModelList"
                    :key="model.labelModelId"
                    class="label-instance-card interactive-label-card"
                    @click="previewLabelModelData(model)"
                  >
                    <div class="card-header-meta">
                      <span class="card-badge">LABEL MODEL</span>
                      <div class="card-action-icons" @click.stop>
                        <i
                          class="el-icon-edit text-green"
                          title="编辑模型"
                          @click="openLabelModelDialog(true, model)"
                        ></i>
                        <i
                          class="el-icon-delete text-red"
                          title="删除模型"
                          @click="deleteLabelModel(model)"
                        ></i>
                      </div>
                    </div>
                    <h4 class="card-model-name">{{ model.labelName }}</h4>
                    <p class="card-model-memo" :title="model.labelMemo">
                      {{ model.labelMemo || '未补充额外注释说明。' }}
                    </p>
                    <div class="card-footer-flex">
                      <span>👤 {{ model.opUserName || '系统' }}</span>
                      <span
                        >⏱️
                        {{
                          model.opTime ? model.opTime.split(' ')[0] : '--'
                        }}</span
                      >
                    </div>
                  </div>

                  <div
                    v-if="labelModelList.length === 0"
                    class="empty-cards-alert"
                  >
                    该标注分类目录项下暂无绑定具体的标签模型实例。
                  </div>
                </div>

                <el-pagination
                  class="pager"
                  small
                  layout="total, prev, pager, next"
                  :current-page.sync="labelModelPage.pageNum"
                  :page-size="labelModelPage.pageSize"
                  :total="labelModelTotal"
                  @current-change="fetchLabelModels"
                />
              </div>

              <div v-else class="empty-visual-placeholder">
                <i class="el-icon-collection"></i>
                <p>请点击左侧标注树分类节点激活标注模型可视化管理视图</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      :title="drillDownTitle"
      :visible.sync="drillDownVisible"
      width="82%"
      append-to-body
      custom-class="dark-drilldown-dialog"
    >
      <div v-loading="loadingDrillDownData" class="drilldown-body">
        <div class="drilldown-filter-bar">
          <el-form :inline="true" size="mini" class="dark-form-inline">
            <el-form-item label="过滤字段 (Key)">
              <el-select
                v-model="drillQueryForm.itemKey"
                clearable
                placeholder="请选择表头字段"
              >
                <el-option
                  v-for="col in drillDownColumns"
                  :key="col"
                  :label="col"
                  :value="col"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="过滤值 (Value)">
              <el-input
                v-model="drillQueryForm.itemValue"
                clearable
                placeholder="请输入检索内容"
                :disabled="!drillQueryForm.itemKey"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="handleDrillFilterSearch"
                >筛选</el-button
              >
              <el-button icon="el-icon-refresh" @click="resetDrillFilter"
                >重置</el-button
              >
            </el-form-item>
          </el-form>
        </div>

        <el-table
          :data="drillDownTableData"
          size="mini"
          stripe
          border
          class="dark-table drilldown-table"
        >
          <el-table-column
            v-for="col in drillDownColumns"
            :key="col"
            :prop="col"
            :label="col"
            show-overflow-tooltip
            min-width="130"
          />
          <template slot="empty">
            <span style="color: #52637a"
              >暂无检索到相匹配的数据项或 rowData 字段为空</span
            >
          </template>
        </el-table>

        <el-pagination
          class="pager"
          small
          background
          layout="total, prev, pager, next, sizes"
          :current-page.sync="drillPage.pageNum"
          :page-size.sync="drillPage.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="drillTotal"
          @current-change="executeDrillQuery"
          @size-change="handleDrillSizeChange"
        />
      </div>
    </el-dialog>

    <el-dialog
      :title="isEditDataModel ? '编辑数据分类模型' : '新增数据分类模型'"
      :visible.sync="dataModelDialogVisible"
      width="640px"
      append-to-body
    >
      <el-form
        ref="dataModelForm"
        :model="dataModelForm"
        :rules="dataModelRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="上级目录">
          <el-cascader
            v-model="dataModelForm.parentModelId"
            :options="dataModelTree"
            :props="dataModelCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="dataModelForm.modelName" />
        </el-form-item>
        <el-form-item label="关联数据源">
          <el-select
            v-model="dataModelForm.dataSourceId"
            filterable
            clearable
            class="full-width"
            @change="handleDataSourceChange"
          >
            <el-option
              v-for="item in dataSourceOptions"
              :key="item.dataSourceId"
              :label="item.sourceName || item.dbName || item.dataSourceId"
              :value="item.dataSourceId"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="数据类型">
              <el-radio-group v-model="dataModelForm.dataType">
                <el-radio-button :label="0">非结构化</el-radio-button>
                <el-radio-button :label="1">结构化</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="节点类型">
              <el-radio-group v-model="dataModelForm.nodeType">
                <el-radio-button :label="1">文件夹</el-radio-button>
                <el-radio-button :label="2">数据表</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="绑定数据表">
          <el-select
            v-model="selectedTableList"
            multiple
            filterable
            clearable
            :loading="loadingRemoteTables"
            placeholder="请先关联数据源，系统将自动检索候选集"
            class="full-width"
          >
            <el-option
              v-for="table in remoteDataSourceTables"
              :key="table"
              :label="table"
              :value="table"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="数据描述">
          <el-input
            v-model="dataModelForm.dataMemo"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="dataModelDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitDataModel"
          >确认保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditLabelClass ? '编辑标注分类' : '新增标注分类'"
      :visible.sync="labelClassDialogVisible"
      width="580px"
      append-to-body
    >
      <el-form
        ref="labelClassForm"
        :model="labelClassForm"
        :rules="labelClassRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="上级分类">
          <el-cascader
            v-model="labelClassForm.parentClassId"
            :options="labelClassTree"
            :props="labelClassCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="labelClassForm.className" />
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="分类类型">
              <el-radio-group v-model="labelClassForm.classType">
                <el-radio-button :label="1">标签目录</el-radio-button>
                <el-radio-button :label="0">标签类型</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="分类来源">
          <el-input v-model="labelClassForm.classSource" />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input
            v-model="labelClassForm.classMemo"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="labelClassDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitLabelClass"
          >保存配置</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditLabelModel ? '编辑标签模型' : '新增标签模型'"
      :visible.sync="labelModelDialogVisible"
      width="560px"
      append-to-body
    >
      <el-form
        ref="labelModelForm"
        :model="labelModelForm"
        :rules="labelModelRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="所属分类" prop="labelClassId">
          <el-cascader
            v-model="labelModelForm.labelClassId"
            :options="labelClassTree"
            :props="labelClassCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="标签名称" prop="labelName">
          <el-input v-model="labelModelForm.labelName" />
        </el-form-item>
        <el-form-item label="模型说明">
          <el-input
            v-model="labelModelForm.labelMemo"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="labelModelDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitLabelModel"
          >确认保存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'
// 动态引入您的物理元数据穿透服务
import {tableDataPaged, page} from '@/api/dataInfo.js'

export default {
  name: 'DataGovernanceModel',
  data() {
    return {
      activeTab: 'dataModel',
      loadingDataModel: false,
      loadingLabelClass: false,
      loadingLabelModel: false,
      loadingRemoteTables: false,
      loadingDrillDownData: false, // 穿透下钻数据加载器
      dataModelFilter: '',
      labelClassFilter: '',
      dataModelTree: [],
      labelClassTree: [],
      dataSourceOptions: [],
      modelTypeOptions: [],
      remoteDataSourceTables: [],
      selectedTableList: [],
      activeDataModel: null,
      activeLabelClass: null,

      dataModelProps: {children: 'children', label: 'modelName'},
      labelClassProps: {children: 'children', label: 'className'},
      dataModelCascaderProps: {
        value: 'dataModelId',
        label: 'modelName',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },
      labelClassCascaderProps: {
        value: 'labelClassId',
        label: 'className',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },

      labelModelQuery: {labelClassId: '', className: '', labelName: ''},
      labelModelList: [],
      labelModelTotal: 0,
      labelModelPage: {pageNum: 1, pageSize: 8},

      // 穿透控制相关状态变量
      drillDownVisible: false,
      drillDrillType: 'table', // table 或者 label
      drillDownTitle: '物理明细穿透工作视窗',
      drillDownTableData: [],
      drillDownColumns: [],
      drillTotal: 0,
      drillPage: {pageNum: 1, pageSize: 10},
      currentTargetTable: '',
      currentLabelModelId: null,
      // 🌟 新增：弹窗内部动态过滤表单绑定的数据
      drillQueryForm: {
        itemKey: '',
        itemValue: ''
      },
      dataModelDialogVisible: false,
      labelClassDialogVisible: false,
      labelModelDialogVisible: false,
      isEditDataModel: false,
      isEditLabelClass: false,
      isEditLabelModel: false,

      dataModelForm: this.getEmptyDataModelForm(),
      labelClassForm: this.getEmptyLabelClassForm(),
      labelModelForm: this.getEmptyLabelModelForm(),

      dataModelRules: {
        modelName: [
          {required: true, message: '请输入模型名称', trigger: 'blur'}
        ]
      },
      labelClassRules: {
        className: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      labelModelRules: {
        labelClassId: [
          {required: true, message: '请选择所属分类', trigger: 'change'}
        ],
        labelName: [
          {required: true, message: '请输入标签名称', trigger: 'blur'}
        ]
      }
    }
  },
  computed: {
    flatDataModels() {
      return this.flattenTree(this.dataModelTree)
    },
    dataModelCount() {
      return this.flatDataModels.length
    },
    dataFolderCount() {
      return this.flatDataModels.filter(item => Number(item.nodeType) === 1)
        .length
    },
    dataLeafCount() {
      return this.flatDataModels.filter(item => Number(item.nodeType) === 2)
        .length
    },
    labelClassCount() {
      return this.flattenTree(this.labelClassTree).length
    }
  },
  watch: {
    dataModelFilter(val) {
      if (this.$refs.dataModelTree) this.$refs.dataModelTree.filter(val)
    },
    labelClassFilter(val) {
      if (this.$refs.labelClassTree) this.$refs.labelClassTree.filter(val)
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.fetchDataSources()
      this.fetchDataModelTree()
      this.fetchLabelClassTree()
      this.fetchLabelModels()
      this.fetchModelTypes()
    },
    getEmptyDataModelForm() {
      return {
        dataModelId: null,
        parentModelId: null,
        dataSourceId: null,
        modelName: '',
        dataType: 1,
        nodeType: 1,
        tableNames: '',
        dataMemo: ''
      }
    },
    getEmptyLabelClassForm() {
      return {
        labelClassId: null,
        parentClassId: null,

        className: '',
        classType: 1,
        classSource: '',
        classMemo: ''
      }
    },
    getEmptyLabelModelForm() {
      return {
        labelModelId: null,
        labelClassId: null,
        labelName: '',
        labelMemo: ''
      }
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    normalizeMapOptions(res) {
      const data = res && res.data ? res.data : {}
      if (Array.isArray(data)) return data
      return Object.keys(data).map(key => ({
        value: Number(key),
        label: data[key]
      }))
    },
    flattenTree(nodes, parentName = '') {
      return (nodes || []).reduce((list, node) => {
        const item = {
          ...node,
          parentModelName: node.parentModelName || parentName
        }
        list.push(item)
        return list.concat(
          this.flattenTree(
            node.children,
            node.modelName || node.className || parentName
          )
        )
      }, [])
    },
    handleTabClick(tab) {
      if (tab.name === 'dataModel') this.fetchDataModelTree()
      if (tab.name === 'labelModel') {
        this.fetchLabelClassTree()
        this.fetchLabelModels()
      }
    },
    filterDataModelNode(value, data) {
      if (!value) return true
      return String(data.modelName || '').indexOf(value) !== -1
    },
    filterLabelClassNode(value, data) {
      if (!value) return true
      return String(data.className || '').indexOf(value) !== -1
    },
    fetchDataSources() {
      request({url: '/rest/dataSource/dataSources', method: 'get'}).then(
        res => {
          this.dataSourceOptions = this.normalizeList(res)
        }
      )
    },
    async handleDataSourceChange(dataSourceId) {
      this.remoteDataSourceTables = []
      if (!dataSourceId) {
        this.selectedTableList = []
        return
      }
      this.loadingRemoteTables = true
      try {
        const response = await request({
          url: `/rest/dataSource/tableNames/${dataSourceId}`,
          method: 'get'
        })
        if (response && response.code === 200) {
          this.remoteDataSourceTables = response.data || []
        } else {
          this.$message.error(
            response.msg || '获取该数据源底层的物理数据表候选集失败'
          )
        }
      } catch (error) {
        console.error('Fetch table names error:', error)
        this.$message({
          type: 'error',
          message: `连接接口服务错失，无法拉取数据源[${dataSourceId}]下的表信息。请检查后台连通性。`,
          duration: 5000
        })
      } finally {
        this.loadingRemoteTables = false
      }
    },
    fetchDataModelTree() {
      this.loadingDataModel = true
      request({url: '/rest/dataModel/findTree', method: 'get'})
        .then(res => {
          this.dataModelTree = this.normalizeList(res)
          if (!this.activeDataModel && this.dataModelTree.length) {
            this.activeDataModel = this.dataModelTree[0]
          }
        })
        .finally(() => {
          this.loadingDataModel = false
        })
    },
    fetchLabelClassTree() {
      this.loadingLabelClass = true
      request({url: '/rest/labelClass/findTree', method: 'get'})
        .then(res => {
          this.labelClassTree = this.normalizeList(res)
          if (!this.activeLabelClass && this.labelClassTree.length) {
            this.activeLabelClass = this.labelClassTree[0]
          }
        })
        .finally(() => {
          this.loadingLabelClass = false
        })
    },
    fetchModelTypes() {
      request({url: '/rest/labelClass/modelTypes', method: 'get'}).then(res => {
        this.modelTypeOptions = this.normalizeMapOptions(res)
      })
    },
    fetchLabelModels() {
      this.loadingLabelModel = true
      const params = {...this.labelModelQuery}
      if (!params.labelClassId) delete params.labelClassId
      apiPage('labelModel', {
        pageNum: this.labelModelPage.pageNum,
        pageSize: this.labelModelPage.pageSize,
        params
      })
        .then(res => {
          this.labelModelList = this.normalizeList(res)
          this.labelModelTotal =
            (res.data && res.data.total) || this.labelModelList.length
        })
        .finally(() => {
          this.loadingLabelModel = false
        })
    },
    handleDataModelClick(data) {
      this.activeDataModel = data
    },
    handleLabelClassClick(data) {
      this.activeLabelClass = data
      this.labelModelQuery.labelClassId = data.labelClassId
      this.labelModelQuery.className = data.className
      this.labelModelPage.pageNum = 1
      this.fetchLabelModels()
    },
    resetLabelModelQuery() {
      this.labelModelQuery = {labelClassId: '', className: '', labelName: ''}
      this.labelModelPage.pageNum = 1
      this.fetchLabelModels()
    },

    /* ==================== 🛠️ 数据下钻微穿透核心逻辑组件部分 ==================== */
    /**
     * @description 1. 点击物理表名进行穿透数据拉取
     */
    previewPhysicalTableData(tableName) {
      this.drillDrillType = 'table'
      this.currentTargetTable = tableName
      this.drillPage.pageNum = 1
      // 打开弹窗前，重置内部过滤条件
      this.drillQueryForm.itemKey = ''
      this.drillQueryForm.itemValue = ''

      this.drillDownTitle = `🔍 物理数据穿透元模型视窗 -> [物理实体表: ${tableName}]`
      this.drillDownVisible = true
      this.executeDrillQuery(true) // 传入 true 代表首次查询，需要刷新表头候选集
    },

    previewLabelModelData(model) {
      this.drillDrillType = 'label'
      this.currentLabelModelId = model.labelModelId
      this.drillPage.pageNum = 1
      // 打开弹窗前，重置内部过滤条件
      this.drillQueryForm.itemKey = ''
      this.drillQueryForm.itemValue = ''

      this.drillDownTitle = `🔍 标注模型数据穿透元模型视窗 -> [标签名称: ${model.labelName}]`
      this.drillDownVisible = true
      this.executeDrillQuery(true) // 传入 true 代表首次查询，需要刷新表头候选集
    },

    /**
     * @description 3. 最终路由分发执行底层业务请求
     */
    /**
     * @description 3. 最终路由分发执行底层业务请求（增量精准重构版）
     */
    /**
     * @description 3. 最终路由分发执行底层业务请求（加入动态过滤参数）
     * @param {Boolean} isFirstLoad 是否是首次打开弹窗加载
     */
    executeDrillQuery(isFirstLoad = false) {
      this.loadingDrillDownData = true
      this.drillDownTableData = []

      // 动态组装当前用户选择/输入的过滤参数
      // 如果用户没有选 key，则兜底传空字符串
      const currentItemKey = this.drillQueryForm.itemKey || ''
      const currentItemValue = this.drillQueryForm.itemKey
        ? this.drillQueryForm.itemValue || ''
        : ''

      if (this.drillDrillType === 'table') {
        // ==================== 1. 点击表名：调用 tableDataPaged ====================
        const payload = {
          pageNum: this.drillPage.pageNum,
          pageSize: this.drillPage.pageSize,
          params: {
            tableName: this.currentTargetTable,
            itemKey: currentItemKey,
            itemValue: currentItemValue,
            dataModelId: this.activeDataModel.dataModelId
          }
        }

        tableDataPaged(payload)
          .then(res => {
            this.handleDrillResponse(res, isFirstLoad, 'ROWDATA')
          })
          .catch(err => {
            this.$message.error(
              '无法建立与数仓实体的连接管道，底层下钻表数据失败'
            )
            console.error(err)
          })
          .finally(() => {
            this.loadingDrillDownData = false
          })
      } else if (this.drillDrillType === 'label') {
        // ==================== 2. 点击标签：调用 page ====================
        const payload = {
          pageNum: this.drillPage.pageNum,
          pageSize: this.drillPage.pageSize,
          params: {
            labelModelId: this.currentLabelModelId,
            itemKey: currentItemKey,
            itemValue: currentItemValue
          }
        }

        page(payload)
          .then(res => {
            this.handleDrillResponse(res, isFirstLoad, 'rowData')
          })
          .catch(err => {
            this.$message.error(
              '无法建立与数仓实体的连接管道，底层下钻标签数据失败'
            )
            console.error(err)
          })
          .finally(() => {
            this.loadingDrillDownData = false
          })
      }
    },

    /**
     * @description 4. 统一处理响应数据：自动解析 rowData
     * @param {Object} res 接口返回数据
     * @param {Boolean} updateColumns 是否允许更新表头候选集
     */
    handleDrillResponse(res, updateColumns = false, row) {
      const rawList = this.normalizeList(res)
      this.drillTotal = (res.data && res.data.total) || rawList.length

      const columnSet = new Set()

      this.drillDownTableData = rawList.map(item => {
        let parsedData = {}
        if (item[row] && typeof item[row] === 'string') {
          try {
            parsedData = JSON.parse(item[row])
          } catch (e) {
            console.error('rowData JSON 解析失败:', e, item[row])
            parsedData = {_rawString: item[row]}
          }
        } else if (item[row] && typeof item[row] === 'object') {
          parsedData = item[row]
        } else {
          parsedData = {...item}
        }

        // 持续收集当前页数据中包含的 Key
        Object.keys(parsedData).forEach(key => columnSet.add(key))
        return parsedData
      })

      // 🌟 重点控制：如果是首次加载（没有过滤前），获取完整的表头清单作为下拉框选项
      // 避免二次筛选后因为结果集变小，导致下拉框里的可选表头字段跟着变少
      if (updateColumns || this.drillDownColumns.length === 0) {
        this.drillDownColumns = Array.from(columnSet)
      }
    },

    // 🌟 新增：弹窗内点击“筛选”按钮
    handleDrillFilterSearch() {
      this.drillPage.pageNum = 1 // 筛选时重置到第一页
      this.executeDrillQuery(false) // false 表示不需要重新计算下拉框表头项
    },

    // 🌟 新增：弹窗内点击“重置”按钮
    resetDrillFilter() {
      this.drillQueryForm.itemKey = ''
      this.drillQueryForm.itemValue = ''
      this.drillPage.pageNum = 1
      this.executeDrillQuery(false)
    },
    handleDrillSizeChange(val) {
      this.drillPage.pageSize = val
      this.executeDrillQuery()
    },

    /* ==================== CUD 基础表单交互控制 ==================== */
    openDataModelDialog(isEdit, row = null) {
      this.isEditDataModel = isEdit
      this.remoteDataSourceTables = []
      if (isEdit && row) {
        this.dataModelForm = {...row}
        if (row.dataSourceId) {
          this.handleDataSourceChange(row.dataSourceId)
          this.selectedTableList = row.tableNames
            ? row.tableNames.split(',')
            : []
        } else {
          this.selectedTableList = []
        }
      } else {
        this.dataModelForm = {
          ...this.getEmptyDataModelForm(),
          parentModelId: row
            ? row.dataModelId
            : this.activeDataModel && this.activeDataModel.dataModelId
        }
        this.selectedTableList = []
      }
      this.dataModelDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.dataModelForm && this.$refs.dataModelForm.clearValidate()
      )
    },
    submitDataModel() {
      this.$refs.dataModelForm.validate(valid => {
        if (!valid) return
        this.dataModelForm.tableNames = this.selectedTableList.join(',')
        const action = this.isEditDataModel
          ? apiUpdate('dataModel', this.dataModelForm)
          : apiAdd('dataModel', this.dataModelForm)
        action.then(() => {
          this.$message.success('数据分类模型已保存并同步')
          this.dataModelDialogVisible = false
          this.fetchDataModelTree()
        })
      })
    },
    deleteDataModel(row) {
      this.$confirm(
        `确定彻底级联删除数据分类模型 [${row.modelName}] 吗？`,
        '警告',
        {type: 'warning'}
      ).then(() => {
        apiDelete('dataModel', row.dataModelId).then(() => {
          this.$message.success('删除成功')
          if (
            this.activeDataModel &&
            this.activeDataModel.dataModelId === row.dataModelId
          )
            this.activeDataModel = null
          this.fetchDataModelTree()
        })
      })
    },
    openLabelClassDialog(isEdit, row = null) {
      this.isEditLabelClass = isEdit
      this.labelClassForm =
        isEdit && row
          ? {...row}
          : {
              ...this.getEmptyLabelClassForm(),
              parentClassId: row
                ? row.labelClassId
                : this.activeLabelClass && this.activeLabelClass.labelClassId
            }
      this.labelClassDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.labelClassForm && this.$refs.labelClassForm.clearValidate()
      )
    },
    submitLabelClass() {
      this.$refs.labelClassForm.validate(valid => {
        if (!valid) return
        const action = this.isEditLabelClass
          ? apiUpdate('labelClass', this.labelClassForm)
          : apiAdd('labelClass', this.labelClassForm)
        action.then(() => {
          this.$message.success('标注分类元数据已保存')
          this.labelClassDialogVisible = false
          this.fetchLabelClassTree()
        })
      })
    },
    deleteLabelClass(row) {
      this.$confirm(`确定删除标注分类 [${row.className}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('labelClass', row.labelClassId).then(() => {
          this.$message.success('删除成功')
          if (
            this.activeLabelClass &&
            this.activeLabelClass.labelClassId === row.labelClassId
          )
            this.activeLabelClass = null
          this.fetchLabelClassTree()
        })
      })
    },
    openLabelModelDialog(isEdit, row = null) {
      this.isEditLabelModel = isEdit
      if (!isEdit && row && row.labelClassId) {
        this.labelModelForm = {
          ...this.getEmptyLabelModelForm(),
          labelClassId: row.labelClassId
        }
      } else if (isEdit && row) {
        this.labelModelForm = {...row}
      } else {
        this.labelModelForm = {
          ...this.getEmptyLabelModelForm(),
          labelClassId:
            this.activeLabelClass && this.activeLabelClass.labelClassId
        }
      }
      this.labelModelDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.labelModelForm && this.$refs.labelModelForm.clearValidate()
      )
    },
    submitLabelModel() {
      this.$refs.labelModelForm.validate(valid => {
        if (!valid) return
        const action = this.isEditLabelModel
          ? apiUpdate('labelModel', this.labelModelForm)
          : apiAdd('labelModel', this.labelModelForm)
        action.then(() => {
          this.$message.success('标签模型已保存')
          this.labelModelDialogVisible = false
          this.fetchLabelModels()
        })
      })
    },
    deleteLabelModel(row) {
      this.$confirm(`确定将标签模型 [${row.labelName}] 移出吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('labelModel', row.labelModelId).then(() => {
          this.$message.success('删除成功')
          this.fetchLabelModels()
        })
      })
    },
    dataTypeText(type) {
      return Number(type) === 0 ? '非结构化' : '结构化'
    },
    nodeTypeText(type) {
      return Number(type) === 2 ? '数据表' : '文件夹'
    },
    classTypeText(type) {
      return Number(type) === 0 ? '标签类型' : '标签目录'
    }
  }
}
</script>

<style scoped>
/* ========================================================================
   核心暗黑科技版面样式系统
   ======================================================================== */
.governance-page {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
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

.search-flex,
.stats-grid,
.panel-header-summary,
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}
.header-subtitle {
  color: #52637a;
  font-size: 11px;
}

.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 12px;
  flex-shrink: 0;
  gap: 12px;
}
.stat-card {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  min-height: 72px;
  padding: 10px 12px;
}
.stat-card span {
  color: #52637a;
  font-size: 11px;
}
.stat-card strong {
  display: block;
  font-size: 22px;
  line-height: 28px;
}
.stat-card small {
  display: block;
  color: #52637a;
  font-size: 11px;
}

.model-workbench {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
}
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
  margin-bottom: 8px;
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

.full-pane,
.tab-layout {
  height: 100%;
  flex: 1;
  min-height: 0;
}
.tab-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 12px;
}

.side-panel,
.content-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header-summary {
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 8px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #06b6d4;
}

.tree-box {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin-top: 10px;
}
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding-right: 6px;
}
.tree-actions {
  display: none;
  gap: 8px;
}
.tree-node:hover .tree-actions {
  display: inline-flex;
}

/* 彩色图标系统 */
.node-content-flex {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.node-text-span {
  font-size: 12px;
  color: #e2e8f0;
}
.icon-color-folder {
  color: #fbbf24 !important;
  text-shadow: 0 0 6px rgba(251, 191, 36, 0.4);
}
.icon-color-table {
  color: #38bdf8 !important;
  text-shadow: 0 0 6px rgba(56, 189, 248, 0.4);
}
.icon-color-label {
  color: #10b981 !important;
  text-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
}

/* ==================== 🛠️ 改造核心：右侧看板高度固定及滚动分布 ==================== */
.fixed-visual-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 12px;
}

.static-top-card {
  flex-shrink: 0; /* 禁止无限制拉伸，固定顶部 */
}

.visual-hero-card {
  background: linear-gradient(135deg, #0e1a30 0%, #070f1e 100%);
  border: 1px solid #1e3557;
  border-radius: 6px;
  padding: 14px;
}

.label-class-theme {
  background: linear-gradient(135deg, #112521 0%, #071012 100%);
  border-color: #115e59;
}
.hero-top-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.hero-title {
  margin: 0;
  font-size: 15px;
  color: #fff;
  font-weight: bold;
}
.tag-group {
  display: flex;
  gap: 6px;
}
.hero-memo {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.visual-data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  flex-shrink: 0;
}
.v-grid-item {
  background: #0d1625;
  border: 1px solid #16253d;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.v-label {
  font-size: 11px;
  color: #52637a;
}
.v-val {
  font-size: 13px;
}

/* 高度固定，内部支持流式长表的滚动块 */
.fixed-height-block {
  background: #070e17;
  border: 1px solid #132238;
  border-radius: 4px;
  padding: 14px;
  flex: 1; /* 分配并填满剩余区域 */
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.block-subtitle {
  font-size: 12px;
  font-weight: bold;
  color: #e2e8f0;
  display: block;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.scrollable-tokens {
  flex: 1;
  overflow-y: auto;
  align-content: flex-start;
  padding-right: 4px;
}
.tokens-flex-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.visual-table-token {
  background: #111c30;
  border: 1px solid #1d3354;
  border-radius: 3px;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.visual-table-token i {
  color: #f59e0b;
  font-size: 12px;
}
.token-text {
  font-size: 12px;
  color: #38bdf8;
  font-family: monospace;
}

/* 交互型高亮触感效果 */
.interactive-token {
  cursor: pointer;
  transition: all 0.2s ease;
}
.interactive-token:hover {
  background: #172a47;
  border-color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.3);
}

/* 查询过滤工具栏：固定移至上方 */
.top-fixed-toolbar {
  background: #09101d;
  border: 1px solid #15233c;
  padding: 10px 12px 2px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  justify-content: space-between;
  flex-shrink: 0;
}

/* 标签卡片网格流式布局 */
.flex-scroll-grid {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.label-cards-layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  align-content: flex-start;
}
.label-instance-card {
  background: #0c1424;
  border: 1px solid #1a2a44;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.25s;
}
.interactive-label-card {
  cursor: pointer;
}
.interactive-label-card:hover {
  border-color: #10b981;
  background: #0f221f;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}

.card-header-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-badge {
  font-size: 9px;
  background: #1e293b;
  color: #94a3b8;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: bold;
}
.card-action-icons {
  display: flex;
  gap: 8px;
}
.card-action-icons i {
  cursor: pointer;
  font-size: 12px;
}
.card-model-name {
  margin: 0;
  font-size: 13px;
  color: #f8fafc;
}
.card-model-memo {
  margin: 0;
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
  height: 32px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer-flex {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #475569;
  border-top: 1px solid #132035;
  padding-top: 6px;
  margin-top: 2px;
}

/* 穿透 Dialog 表格 */
.drilldown-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 420px;
}
::v-deep .dark-drilldown-dialog .el-dialog__body {
  background-color: #040810;
  padding: 15px 20px;
}
::v-deep .dark-drilldown-dialog .el-dialog__header {
  background-color: #09101d;
  border-bottom: 1px solid #192a47;
  padding: 12px 20px;
}
::v-deep .dark-drilldown-dialog .el-dialog__title {
  color: #38bdf8;
  font-size: 13px;
  font-weight: bold;
}

.empty-tables-holder,
.empty-cards-alert {
  padding: 24px;
  text-align: center;
  font-size: 12px;
  color: #475569;
}
.empty-visual-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #475569;
}
.empty-visual-placeholder i {
  font-size: 44px;
}
.empty-visual-placeholder p {
  font-size: 12px;
  margin: 0;
}

.pager {
  margin-top: 12px;
  text-align: right;
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
.text-orange {
  color: #f59e0b !important;
}
.text-red {
  color: #f56c6c !important;
}
.full-width {
  width: 100%;
}

::v-deep .el-tree {
  background: transparent;
  color: #cbd5e1;
}
::v-deep .el-tree-node__content:hover,
::v-deep .el-tree-node.is-current > .el-tree-node__content {
  background: #13253e;
}
::v-deep .el-input__inner,
::v-deep .el-textarea__inner {
  background: #0d1522;
  border-color: #1e3557;
  color: #fff;
}

::v-deep .dark-table.el-table {
  background: #080e18;
  color: #cbd5e1;
  border-color: #172438;
}
::v-deep .dark-table.el-table th {
  background: #0d1726 !important;
  color: #38bdf8;
  border-bottom: 1px solid #172438;
}
::v-deep .dark-table.el-table td {
  border-bottom: 1px solid #121e30;
  background: #080e18;
}
::v-deep .dark-table.el-table--enable-row-hover .el-table__body tr:hover > td {
  background: #112035 !important;
}
/* 弹窗内部动态过滤栏样式 */
.drilldown-filter-bar {
  background: #09111e;
  border: 1px solid #16263f;
  padding: 10px 12px 2px 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

/* 确保暗黑表单内的文字和间距体验舒适 */
::v-deep .dark-form-inline .el-form-item__label {
  color: #94a3b8 !important;
  font-size: 11px;
}

::v-deep .dark-form-inline .el-input__inner {
  background: #050a12 !important;
  border-color: #1a2f4c !important;
  color: #fff !important;
}

::v-deep .dark-form-inline .el-input.is-disabled .el-input__inner {
  background: #0c121c !important;
  border-color: #122035 !important;
  color: #475569 !important;
}
</style>
