<template>
  <div class="governance-page">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">📋 数据治理模型维护总线</span>
        <span class="header-subtitle">数据分类模型与数据标注模型分区维护</span>
      </div>
      <el-button type="info" size="mini" icon="el-icon-refresh" class="action-btn" @click="initPage">
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
        <small>nodeType = 1</small>
      </div>
      <div class="stat-card">
        <span>数据叶子</span>
        <strong class="font-num text-orange">{{ dataLeafCount }}</strong>
        <small>nodeType = 2</small>
      </div>
      <div class="stat-card">
        <span>标注分类</span>
        <strong class="font-num text-cyan">{{ labelClassCount }}</strong>
        <small>labelClass 树节点总量</small>
      </div>
      <div class="stat-card">
        <span>标签模型</span>
        <strong class="font-num text-green">{{ labelModelTotal }}</strong>
        <small>labelModel 当前查询总量</small>
      </div>
      <div class="stat-card">
        <span>数据源</span>
        <strong class="font-num text-blue">{{ dataSourceOptions.length }}</strong>
        <small>可绑定数据源数量</small>
      </div>
    </div>

    <div class="model-workbench">
      <el-tabs v-model="activeTab" class="dark-tabs fill-tabs" @tab-click="handleTabClick">
        <el-tab-pane name="dataModel" class="full-pane">
          <span slot="label">数据分类模型</span>
          <div class="tab-layout">
            <div class="side-panel" v-loading="loadingDataModel">
              <div class="panel-header-summary">
                <span class="title">🗂️ dataModel 数据分类树</span>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="openDataModelDialog(false)">
                  新建节点
                </el-button>
              </div>

              <el-input
                v-model="dataModelFilter"
                size="mini"
                clearable
                prefix-icon="el-icon-search"
                placeholder="过滤数据分类名称"
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
                    <span>
                      <i :class="data.nodeType === 2 ? 'el-icon-document' : 'el-icon-folder-opened'"></i>
                      {{ data.modelName }}
                    </span>
                    <span class="tree-actions">
                      <i class="el-icon-plus text-blue" @click.stop="openDataModelDialog(false, data)"></i>
                      <i class="el-icon-edit text-green" @click.stop="openDataModelDialog(true, data)"></i>
                      <i class="el-icon-delete text-red" @click.stop="deleteDataModel(data)"></i>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>

            <div class="content-panel">
              <div class="section-toolbar">
                <div>
                  <span class="section-title">数据分类模型详情</span>
                  <p>维护 DataModel 的目录、数据源、数据类型、表名和描述。</p>
                </div>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="openDataModelDialog(false)">
                  新建根节点
                </el-button>
              </div>

              <div v-if="activeDataModel" class="active-card">
                <div>
                  <span class="panel-kicker">CURRENT DATA MODEL</span>
                  <h3>{{ activeDataModel.modelName }}</h3>
                  <p>{{ activeDataModel.dataMemo || '暂无描述' }}</p>
                </div>
                <div class="tag-group">
                  <el-tag size="mini" :type="activeDataModel.nodeType === 2 ? 'success' : 'info'">
                    {{ nodeTypeText(activeDataModel.nodeType) }}
                  </el-tag>
                  <el-tag size="mini" type="warning">{{ dataTypeText(activeDataModel.dataType) }}</el-tag>
                </div>
              </div>

              <el-table :data="flatDataModels" size="mini" stripe border class="dark-table">
                <el-table-column prop="modelName" label="模型名称" min-width="150" show-overflow-tooltip />
                <el-table-column prop="parentModelName" label="上级目录" min-width="120" show-overflow-tooltip />
                <el-table-column prop="sourceName" label="数据源" min-width="130" show-overflow-tooltip />
                <el-table-column prop="dbName" label="数据库" min-width="110" show-overflow-tooltip />
                <el-table-column prop="tableNames" label="表名称" min-width="180" show-overflow-tooltip />
                <el-table-column prop="nodeType" label="节点类型" width="90">
                  <template slot-scope="scope">{{ nodeTypeText(scope.row.nodeType) }}</template>
                </el-table-column>
                <el-table-column prop="dataType" label="数据类型" width="100">
                  <template slot-scope="scope">{{ dataTypeText(scope.row.dataType) }}</template>
                </el-table-column>
                <el-table-column label="操作" width="165" fixed="right">
                  <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-plus" @click="openDataModelDialog(false, scope.row)">子级</el-button>
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="openDataModelDialog(true, scope.row)">编辑</el-button>
                    <el-button size="mini" type="text" class="danger-link" icon="el-icon-delete" @click="deleteDataModel(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="labelModel" class="full-pane">
          <span slot="label">数据标注模型</span>
          <div class="tab-layout">
            <div class="side-panel" v-loading="loadingLabelClass">
              <div class="panel-header-summary">
                <span class="title">🏷️ labelClass 标注分类树</span>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="openLabelClassDialog(false)">
                  新建分类
                </el-button>
              </div>

              <el-input
                v-model="labelClassFilter"
                size="mini"
                clearable
                prefix-icon="el-icon-search"
                placeholder="过滤标注分类名称"
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
                    <span><i class="el-icon-collection-tag"></i> {{ data.className }}</span>
                    <span class="tree-actions">
                      <i class="el-icon-plus text-blue" @click.stop="openLabelClassDialog(false, data)"></i>
                      <i class="el-icon-edit text-green" @click.stop="openLabelClassDialog(true, data)"></i>
                      <i class="el-icon-delete text-red" @click.stop="deleteLabelClass(data)"></i>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>

            <div class="content-panel">
              <div class="toolbar">
                <el-form :inline="true" :model="labelModelQuery" size="mini">
                  <el-form-item label="分类">
                    <el-input v-model="labelModelQuery.className" clearable placeholder="分类名称" />
                  </el-form-item>
                  <el-form-item label="标签">
                    <el-input v-model="labelModelQuery.labelName" clearable placeholder="标签名称" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" icon="el-icon-search" @click="fetchLabelModels">查询</el-button>
                    <el-button icon="el-icon-refresh" @click="resetLabelModelQuery">重置</el-button>
                  </el-form-item>
                </el-form>
                <el-button type="primary" size="mini" icon="el-icon-plus" @click="openLabelModelDialog(false)">
                  新建标签模型
                </el-button>
              </div>

              <div v-if="activeLabelClass" class="active-card">
                <div>
                  <span class="panel-kicker">CURRENT LABEL CLASS</span>
                  <h3>{{ activeLabelClass.className }}</h3>
                  <p>{{ activeLabelClass.classMemo || activeLabelClass.classSource || '暂无描述' }}</p>
                </div>
                <div class="tag-group">
                  <el-tag size="mini" type="success">{{ classModelTypeText(activeLabelClass.classModelType) }}</el-tag>
                  <el-tag size="mini" type="info">{{ classTypeText(activeLabelClass.classType) }}</el-tag>
                </div>
              </div>

              <el-table :data="labelModelList" size="mini" stripe border v-loading="loadingLabelModel" class="dark-table">
                <el-table-column prop="labelName" label="标签模型名称" min-width="160" />
                <el-table-column prop="className" label="所属分类" min-width="130" />
                <el-table-column prop="labelClassId" label="分类ID" width="90" />
                <el-table-column prop="labelMemo" label="模型说明" min-width="220" show-overflow-tooltip />
                <el-table-column prop="opUserName" label="操作人" width="100" show-overflow-tooltip />
                <el-table-column prop="opTime" label="操作时间" min-width="150" />
                <el-table-column label="操作" width="150" fixed="right">
                  <template slot-scope="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="openLabelModelDialog(true, scope.row)">编辑</el-button>
                    <el-button size="mini" type="text" class="danger-link" icon="el-icon-delete" @click="deleteLabelModel(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>

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
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog :title="isEditDataModel ? '编辑数据分类模型' : '新增数据分类模型'" :visible.sync="dataModelDialogVisible" width="640px" append-to-body>
      <el-form ref="dataModelForm" :model="dataModelForm" :rules="dataModelRules" label-width="110px" size="mini">
        <el-form-item label="上级目录">
          <el-cascader v-model="dataModelForm.parentModelId" :options="dataModelTree" :props="dataModelCascaderProps" clearable filterable class="full-width" />
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="dataModelForm.modelName" />
        </el-form-item>
        <el-form-item label="数据源">
          <el-select v-model="dataModelForm.dataSourceId" filterable clearable class="full-width">
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
        <el-form-item label="数据表名称">
          <el-input v-model="dataModelForm.tableNames" placeholder="多个表名用英文逗号分隔" />
        </el-form-item>
        <el-form-item label="数据描述">
          <el-input v-model="dataModelForm.dataMemo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="dataModelDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitDataModel">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="isEditLabelClass ? '编辑标注分类' : '新增标注分类'" :visible.sync="labelClassDialogVisible" width="580px" append-to-body>
      <el-form ref="labelClassForm" :model="labelClassForm" :rules="labelClassRules" label-width="110px" size="mini">
        <el-form-item label="上级分类">
          <el-cascader v-model="labelClassForm.parentClassId" :options="labelClassTree" :props="labelClassCascaderProps" clearable filterable class="full-width" />
        </el-form-item>
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="labelClassForm.className" />
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="模型类型">
              <el-select v-model="labelClassForm.classModelType" class="full-width" filterable allow-create>
                <el-option
                  v-for="item in modelTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类类型">
              <el-radio-group v-model="labelClassForm.classType">
                <el-radio-button :label="0">标签类型</el-radio-button>
                <el-radio-button :label="1">标签目录</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="分类来源">
          <el-input v-model="labelClassForm.classSource" />
        </el-form-item>
        <el-form-item label="分类描述">
          <el-input v-model="labelClassForm.classMemo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="labelClassDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitLabelClass">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="isEditLabelModel ? '编辑标签模型' : '新增标签模型'" :visible.sync="labelModelDialogVisible" width="560px" append-to-body>
      <el-form ref="labelModelForm" :model="labelModelForm" :rules="labelModelRules" label-width="110px" size="mini">
        <el-form-item label="所属分类" prop="labelClassId">
          <el-cascader v-model="labelModelForm.labelClassId" :options="labelClassTree" :props="labelClassCascaderProps" clearable filterable class="full-width" />
        </el-form-item>
        <el-form-item label="标签名称" prop="labelName">
          <el-input v-model="labelModelForm.labelName" />
        </el-form-item>
        <el-form-item label="模型说明">
          <el-input v-model="labelModelForm.labelMemo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="labelModelDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitLabelModel">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'

export default {
  name: 'DataGovernanceModel',
  data() {
    return {
      activeTab: 'dataModel',
      loadingDataModel: false,
      loadingLabelClass: false,
      loadingLabelModel: false,
      dataModelFilter: '',
      labelClassFilter: '',
      dataModelTree: [],
      labelClassTree: [],
      dataSourceOptions: [],
      modelTypeOptions: [],
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
      labelModelPage: {pageNum: 1, pageSize: 12},
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
        modelName: [{required: true, message: '请输入模型名称', trigger: 'blur'}]
      },
      labelClassRules: {
        className: [{required: true, message: '请输入分类名称', trigger: 'blur'}]
      },
      labelModelRules: {
        labelClassId: [{required: true, message: '请选择所属分类', trigger: 'change'}],
        labelName: [{required: true, message: '请输入标签名称', trigger: 'blur'}]
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
      return this.flatDataModels.filter(item => Number(item.nodeType) === 1).length
    },
    dataLeafCount() {
      return this.flatDataModels.filter(item => Number(item.nodeType) === 2).length
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
        classModelType: 2,
        className: '',
        classType: 1,
        classSource: '',
        classMemo: ''
      }
    },
    getEmptyLabelModelForm() {
      return {labelModelId: null, labelClassId: null, labelName: '', labelMemo: ''}
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    normalizeMapOptions(res) {
      const data = res && res.data ? res.data : {}
      if (Array.isArray(data)) return data
      return Object.keys(data).map(key => ({value: Number(key), label: data[key]}))
    },
    flattenTree(nodes, parentName = '') {
      return (nodes || []).reduce((list, node) => {
        const item = {...node, parentModelName: node.parentModelName || parentName}
        list.push(item)
        return list.concat(this.flattenTree(node.children, node.modelName || node.className || parentName))
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
      request({url: '/rest/dataSource/dataSources', method: 'get'}).then(res => {
        this.dataSourceOptions = this.normalizeList(res)
      })
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
          this.labelModelTotal = (res.data && res.data.total) || this.labelModelList.length
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
    openDataModelDialog(isEdit, row = null) {
      this.isEditDataModel = isEdit
      this.dataModelForm = isEdit && row
        ? {...row}
        : {...this.getEmptyDataModelForm(), parentModelId: row ? row.dataModelId : (this.activeDataModel && this.activeDataModel.dataModelId)}
      this.dataModelDialogVisible = true
      this.$nextTick(() => this.$refs.dataModelForm && this.$refs.dataModelForm.clearValidate())
    },
    submitDataModel() {
      this.$refs.dataModelForm.validate(valid => {
        if (!valid) return
        const action = this.isEditDataModel ? apiUpdate('dataModel', this.dataModelForm) : apiAdd('dataModel', this.dataModelForm)
        action.then(() => {
          this.$message.success('数据分类模型已保存')
          this.dataModelDialogVisible = false
          this.fetchDataModelTree()
        })
      })
    },
    deleteDataModel(row) {
      this.$confirm(`确定删除数据分类模型 [${row.modelName}] 吗？`, '提示', {type: 'warning'}).then(() => {
        apiDelete('dataModel', row.dataModelId).then(() => {
          this.$message.success('删除成功')
          if (this.activeDataModel && this.activeDataModel.dataModelId === row.dataModelId) this.activeDataModel = null
          this.fetchDataModelTree()
        })
      })
    },
    openLabelClassDialog(isEdit, row = null) {
      this.isEditLabelClass = isEdit
      this.labelClassForm = isEdit && row
        ? {...row}
        : {...this.getEmptyLabelClassForm(), parentClassId: row ? row.labelClassId : (this.activeLabelClass && this.activeLabelClass.labelClassId)}
      this.labelClassDialogVisible = true
      this.$nextTick(() => this.$refs.labelClassForm && this.$refs.labelClassForm.clearValidate())
    },
    submitLabelClass() {
      this.$refs.labelClassForm.validate(valid => {
        if (!valid) return
        const action = this.isEditLabelClass ? apiUpdate('labelClass', this.labelClassForm) : apiAdd('labelClass', this.labelClassForm)
        action.then(() => {
          this.$message.success('标注分类已保存')
          this.labelClassDialogVisible = false
          this.fetchLabelClassTree()
        })
      })
    },
    deleteLabelClass(row) {
      this.$confirm(`确定删除标注分类 [${row.className}] 吗？`, '提示', {type: 'warning'}).then(() => {
        apiDelete('labelClass', row.labelClassId).then(() => {
          this.$message.success('删除成功')
          if (this.activeLabelClass && this.activeLabelClass.labelClassId === row.labelClassId) this.activeLabelClass = null
          this.fetchLabelClassTree()
        })
      })
    },
    openLabelModelDialog(isEdit, row = null) {
      this.isEditLabelModel = isEdit
      this.labelModelForm = isEdit && row
        ? {...row}
        : {...this.getEmptyLabelModelForm(), labelClassId: this.activeLabelClass && this.activeLabelClass.labelClassId}
      this.labelModelDialogVisible = true
      this.$nextTick(() => this.$refs.labelModelForm && this.$refs.labelModelForm.clearValidate())
    },
    submitLabelModel() {
      this.$refs.labelModelForm.validate(valid => {
        if (!valid) return
        const action = this.isEditLabelModel ? apiUpdate('labelModel', this.labelModelForm) : apiAdd('labelModel', this.labelModelForm)
        action.then(() => {
          this.$message.success('标签模型已保存')
          this.labelModelDialogVisible = false
          this.fetchLabelModels()
        })
      })
    },
    deleteLabelModel(row) {
      this.$confirm(`确定删除标签模型 [${row.labelName}] 吗？`, '提示', {type: 'warning'}).then(() => {
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
    },
    classModelTypeText(type) {
      const match = this.modelTypeOptions.find(item => Number(item.value) === Number(type))
      return match ? match.label : `模型类型${type || '-'}`
    }
  }
}
</script>

<style scoped>
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
.toolbar,
.section-toolbar,
.hero-strip,
.active-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}

.header-subtitle,
.stat-card span,
.stat-card small,
.section-toolbar p,
.active-card p {
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
}

.stat-card,
.model-workbench,
.side-panel,
.content-panel,
.active-card,
.section-toolbar {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
}

.stat-card {
  min-height: 72px;
  padding: 10px 12px;
}

.stat-card strong {
  display: block;
  font-size: 22px;
  line-height: 28px;
}

.stat-card small {
  display: block;
}

.model-workbench {
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
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 12px;
}

.side-panel,
.content-panel {
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

.panel-header-summary .title,
.section-title {
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

.toolbar,
.section-toolbar,
.active-card {
  justify-content: space-between;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.section-toolbar,
.active-card {
  background: #0c1424;
  border-color: #16243a;
  padding: 10px 12px;
}

.section-title {
  display: block;
  color: #fff;
  font-size: 13px;
}

.section-toolbar p,
.active-card p,
h3 {
  margin: 0;
}

.active-card h3 {
  color: #fff;
  font-size: 16px;
  margin-bottom: 3px;
}

.panel-kicker {
  display: block;
  font-size: 11px;
  color: #52637a;
  margin-bottom: 3px;
}

.tag-group {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.pager {
  margin-top: 10px;
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

.text-red,
.danger-link {
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

::v-deep .el-table,
::v-deep .el-table th,
::v-deep .el-table tr {
  background: #080e18;
  color: #cbd5e1;
}

::v-deep .el-table td,
::v-deep .el-table th.is-leaf {
  border-bottom-color: #172438;
}

::v-deep .el-table--border,
::v-deep .el-table--group {
  border-color: #172438;
}

::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td {
  background: #13253e;
}
</style>
