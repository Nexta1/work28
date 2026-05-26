<template>
  <div class="resource-page">
    <div class="resource-aside" v-loading="loadingModel">
      <div class="panel-title-row">
        <div>
          <span class="panel-kicker">DATA MODEL</span>
          <h3>数据目录树</h3>
        </div>
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="openModelDialog(false)">
          新建目录
        </el-button>
      </div>

      <el-input
        v-model="filterText"
        size="mini"
        clearable
        prefix-icon="el-icon-search"
        placeholder="过滤目录名称"
      />

      <div class="tree-box">
        <el-tree
          ref="modelTree"
          :data="modelTree"
          :props="treeProps"
          node-key="dataModelId"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          :filter-node-method="filterModelNode"
          @node-click="handleModelClick"
        >
          <span class="tree-node" slot-scope="{data}">
            <span>
              <i :class="data.nodeType === 2 ? 'el-icon-document' : 'el-icon-folder-opened'"></i>
              {{ data.modelName || data.label || data.name }}
            </span>
            <span class="tree-actions">
              <i class="el-icon-edit text-green" @click.stop="openModelDialog(true, data)"></i>
              <i class="el-icon-delete text-red" @click.stop="deleteModel(data)"></i>
            </span>
          </span>
        </el-tree>
      </div>
    </div>

    <div class="resource-main">
      <div class="hero-strip">
        <div>
          <span class="panel-kicker">CLASSIFIED STORAGE</span>
          <h2>分类存储</h2>
          <p>维护数据源、数据目录和表映射关系，支撑资源数据按目录归档。</p>
        </div>
        <div class="metric-group">
          <div class="metric-card">
            <strong>{{ sourceTotal }}</strong>
            <span>数据源</span>
          </div>
          <div class="metric-card">
            <strong>{{ modelCount }}</strong>
            <span>目录节点</span>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="work-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="数据源配置" name="source">
          <div class="toolbar">
            <el-form :inline="true" :model="sourceQuery" size="mini">
              <el-form-item label="源名称">
                <el-input v-model="sourceQuery.sourceName" clearable placeholder="数据源名称" />
              </el-form-item>
              <el-form-item label="数据库">
                <el-input v-model="sourceQuery.dbName" clearable placeholder="数据库名称" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="fetchSources">查询</el-button>
                <el-button icon="el-icon-refresh" @click="resetSourceQuery">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" size="mini" icon="el-icon-plus" @click="openSourceDialog(false)">
              新增数据源
            </el-button>
          </div>

          <el-table :data="sourceList" size="mini" stripe border v-loading="loadingSource">
            <el-table-column prop="sourceName" label="数据源名称" min-width="160" />
            <el-table-column prop="host" label="主机" min-width="130" />
            <el-table-column prop="port" label="端口" width="80" />
            <el-table-column prop="dbId" label="库标识" min-width="120" />
            <el-table-column prop="dbName" label="数据库" min-width="120" />
            <el-table-column prop="dbType" label="库类型" width="90" />
            <el-table-column label="操作" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="openSourceDialog(true, scope.row)">
                  编辑
                </el-button>
                <el-button size="mini" type="text" class="danger-link" icon="el-icon-delete" @click="deleteSource(scope.row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            class="pager"
            small
            layout="total, prev, pager, next"
            :current-page.sync="sourcePage.pageNum"
            :page-size="sourcePage.pageSize"
            :total="sourceTotal"
            @current-change="fetchSources"
          />
        </el-tab-pane>

        <el-tab-pane label="目录详情" name="model">
          <div class="selected-card" v-if="activeModel">
            <div>
              <span class="panel-kicker">CURRENT NODE</span>
              <h3>{{ activeModel.modelName }}</h3>
            </div>
            <el-tag size="mini" :type="activeModel.nodeType === 2 ? 'success' : 'info'">
              {{ activeModel.nodeType === 2 ? '数据表' : '目录' }}
            </el-tag>
          </div>
          <el-empty v-else description="请从左侧选择一个数据目录节点" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog :title="isEditSource ? '编辑数据源' : '新增数据源'" :visible.sync="sourceDialogVisible" width="620px" append-to-body>
      <el-form ref="sourceForm" :model="sourceForm" :rules="sourceRules" label-width="100px" size="mini">
        <el-form-item label="数据源名称" prop="sourceName">
          <el-input v-model="sourceForm.sourceName" />
        </el-form-item>
        <el-form-item label="主机端口">
          <el-row :gutter="8">
            <el-col :span="16">
              <el-form-item prop="host" label-width="0">
                <el-input v-model="sourceForm.host" placeholder="host" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item prop="port" label-width="0">
                <el-input-number v-model="sourceForm.port" :min="1" :max="65535" controls-position="right" class="full-width" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="库标识" prop="dbId">
          <el-input v-model="sourceForm.dbId" />
        </el-form-item>
        <el-form-item label="数据库名" prop="dbName">
          <el-input v-model="sourceForm.dbName" />
        </el-form-item>
        <el-form-item label="数据源类型">
          <el-select v-model="sourceForm.sourceType" class="full-width" filterable allow-create>
            <el-option
              v-for="item in sourceTypeOptions"
              :key="optionValue(item)"
              :label="optionLabel(item)"
              :value="optionValue(item)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据库类型">
          <el-select v-model="sourceForm.dbType" class="full-width" filterable allow-create>
            <el-option
              v-for="item in dbTypeOptions"
              :key="optionValue(item)"
              :label="optionLabel(item)"
              :value="optionValue(item)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="sourceForm.userName" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="sourceForm.userPassword" show-password />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="sourceDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitSource">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="isEditModel ? '编辑数据目录' : '新增数据目录'" :visible.sync="modelDialogVisible" width="620px" append-to-body>
      <el-form ref="modelForm" :model="modelForm" :rules="modelRules" label-width="110px" size="mini">
        <el-form-item label="上级目录">
          <el-cascader
            v-model="modelForm.parentModelId"
            :options="modelTree"
            :props="cascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="数据源">
          <el-select v-model="modelForm.dataSourceId" clearable filterable class="full-width">
            <el-option
              v-for="item in sourceList"
              :key="item.dataSourceId"
              :label="item.sourceName"
              :value="item.dataSourceId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="目录名称" prop="modelName">
          <el-input v-model="modelForm.modelName" />
        </el-form-item>
        <el-form-item label="节点类型">
          <el-radio-group v-model="modelForm.nodeType">
            <el-radio-button :label="1">目录</el-radio-button>
            <el-radio-button :label="2">数据表</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据类型">
          <el-input-number v-model="modelForm.dataType" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="表名称">
          <el-input v-model="modelForm.tableNames" placeholder="多个表用英文逗号分隔" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="modelForm.dataMemo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="modelDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitModel">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'

export default {
  name: 'ClassificationStorage',
  data() {
    return {
      activeTab: 'source',
      loadingModel: false,
      loadingSource: false,
      filterText: '',
      modelTree: [],
      activeModel: null,
      treeProps: {children: 'children', label: 'modelName'},
      cascaderProps: {
        value: 'dataModelId',
        label: 'modelName',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },
      sourceQuery: {sourceName: '', dbName: ''},
      sourceList: [],
      sourceTypeOptions: [],
      dbTypeOptions: [],
      sourceTotal: 0,
      sourcePage: {pageNum: 1, pageSize: 12},
      sourceDialogVisible: false,
      modelDialogVisible: false,
      isEditSource: false,
      isEditModel: false,
      sourceForm: this.getEmptySourceForm(),
      modelForm: this.getEmptyModelForm(),
      sourceRules: {
        sourceName: [{required: true, message: '请输入数据源名称', trigger: 'blur'}],
        host: [{required: true, message: '请输入主机地址', trigger: 'blur'}],
        dbId: [{required: true, message: '请输入库标识', trigger: 'blur'}],
        dbName: [{required: true, message: '请输入数据库名', trigger: 'blur'}]
      },
      modelRules: {
        modelName: [{required: true, message: '请输入目录名称', trigger: 'blur'}]
      }
    }
  },
  computed: {
    modelCount() {
      const walk = nodes => (nodes || []).reduce((sum, item) => sum + 1 + walk(item.children), 0)
      return walk(this.modelTree)
    }
  },
  watch: {
    filterText(val) {
      if (this.$refs.modelTree) this.$refs.modelTree.filter(val)
    }
  },
  mounted() {
    this.fetchModelTree()
    this.fetchSources()
    this.fetchSourceDictionaries()
  },
  methods: {
    getEmptySourceForm() {
      return {
        dataSourceId: null,
        sourceName: '',
        sourceType: 1,
        host: '',
        port: 5236,
        dbId: '',
        dbName: '',
        dbType: '',
        userName: '',
        userPassword: ''
      }
    },
    getEmptyModelForm() {
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
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    optionLabel(item) {
      return item.label || item.name || item.typeName || item.dictName || item.value || item
    },
    optionValue(item) {
      return item.value || item.type || item.code || item.id || item
    },
    filterModelNode(value, data) {
      if (!value) return true
      return String(data.modelName || '').indexOf(value) !== -1
    },
    fetchModelTree() {
      this.loadingModel = true
      request({url: '/rest/dataModel/findTree', method: 'get'})
        .then(res => {
          this.modelTree = this.normalizeList(res)
        })
        .finally(() => {
          this.loadingModel = false
        })
    },
    fetchSourceDictionaries() {
      Promise.all([
        request({url: '/rest/dataSource/sourceTypes', method: 'get'}),
        request({url: '/rest/dataSource/dbTypes', method: 'get'})
      ]).then(([sourceTypes, dbTypes]) => {
        this.sourceTypeOptions = this.normalizeList(sourceTypes)
        this.dbTypeOptions = this.normalizeList(dbTypes)
      })
    },
    fetchSources() {
      this.loadingSource = true
      apiPage('dataSource', {
        pageNum: this.sourcePage.pageNum,
        pageSize: this.sourcePage.pageSize,
        params: {...this.sourceQuery}
      })
        .then(res => {
          this.sourceList = this.normalizeList(res)
          this.sourceTotal = (res.data && res.data.total) || this.sourceList.length
        })
        .finally(() => {
          this.loadingSource = false
        })
    },
    resetSourceQuery() {
      this.sourceQuery = {sourceName: '', dbName: ''}
      this.sourcePage.pageNum = 1
      this.fetchSources()
    },
    handleTabClick(tab) {
      if (tab.name === 'source') this.fetchSources()
    },
    handleModelClick(data) {
      this.activeModel = data
      this.activeTab = 'model'
    },
    openSourceDialog(isEdit, row) {
      this.isEditSource = isEdit
      this.sourceForm = isEdit && row ? {...row} : this.getEmptySourceForm()
      this.sourceDialogVisible = true
      this.$nextTick(() => this.$refs.sourceForm && this.$refs.sourceForm.clearValidate())
    },
    submitSource() {
      this.$refs.sourceForm.validate(valid => {
        if (!valid) return
        const action = this.isEditSource ? apiUpdate('dataSource', this.sourceForm) : apiAdd('dataSource', this.sourceForm)
        action.then(() => {
          this.$message.success('数据源已保存')
          this.sourceDialogVisible = false
          this.fetchSources()
        })
      })
    },
    deleteSource(row) {
      const id = row.dataSourceId
      this.$confirm(`确定删除数据源 [${row.sourceName}] 吗？`, '提示', {type: 'warning'}).then(() => {
        apiDelete('dataSource', id).then(() => {
          this.$message.success('删除成功')
          this.fetchSources()
        })
      })
    },
    openModelDialog(isEdit, row) {
      this.isEditModel = isEdit
      this.modelForm = isEdit && row
        ? {...row}
        : {...this.getEmptyModelForm(), parentModelId: this.activeModel && this.activeModel.dataModelId}
      this.modelDialogVisible = true
      this.$nextTick(() => this.$refs.modelForm && this.$refs.modelForm.clearValidate())
    },
    submitModel() {
      this.$refs.modelForm.validate(valid => {
        if (!valid) return
        const action = this.isEditModel ? apiUpdate('dataModel', this.modelForm) : apiAdd('dataModel', this.modelForm)
        action.then(() => {
          this.$message.success('数据目录已保存')
          this.modelDialogVisible = false
          this.fetchModelTree()
        })
      })
    },
    deleteModel(row) {
      const id = row.dataModelId
      this.$confirm(`确定删除数据目录 [${row.modelName}] 吗？`, '提示', {type: 'warning'}).then(() => {
        apiDelete('dataModel', id).then(() => {
          this.$message.success('删除成功')
          if (this.activeModel && this.activeModel.dataModelId === id) this.activeModel = null
          this.fetchModelTree()
        })
      })
    }
  }
}
</script>

<style scoped>
.resource-page {
  height: 100%;
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 12px;
  background: #03060c;
  color: #cbd5e1;
}

.resource-aside,
.resource-main {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  min-height: 0;
}

.resource-aside {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.resource-main {
  padding: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-title-row,
.toolbar,
.selected-card,
.hero-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-title-row {
  margin-bottom: 10px;
}

h2,
h3,
p {
  margin: 0;
}

.panel-kicker {
  display: block;
  font-size: 11px;
  color: #52637a;
  margin-bottom: 3px;
}

.panel-title-row h3 {
  color: #fff;
  font-size: 13px;
}

.tree-box {
  flex: 1;
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

.hero-strip {
  background: #0c1424;
  border: 1px solid #16243a;
  border-radius: 4px;
  padding: 14px 16px;
  margin-bottom: 10px;
}

.hero-strip h2 {
  font-size: 20px;
  color: #38bdf8;
}

.hero-strip p {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 4px;
}

.metric-group {
  display: flex;
  gap: 8px;
}

.metric-card {
  min-width: 82px;
  border: 1px solid #172438;
  background: #0d1522;
  border-radius: 4px;
  padding: 9px 12px;
  text-align: center;
}

.metric-card strong {
  display: block;
  font-size: 20px;
  color: #10b981;
}

.metric-card span {
  font-size: 12px;
  color: #94a3b8;
}

.work-tabs {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.toolbar {
  margin-bottom: 10px;
}

.pager {
  margin-top: 10px;
  text-align: right;
}

.selected-card {
  padding: 14px;
  border: 1px solid #16243a;
  border-radius: 4px;
  background: #0c1424;
}

.selected-card h3 {
  color: #fff;
}

.full-width {
  width: 100%;
}

.text-green {
  color: #67c23a;
}

.text-red,
.danger-link {
  color: #f56c6c;
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

::v-deep .el-tabs__item {
  color: #64748b;
}

::v-deep .el-tabs__item.is-active {
  color: #38bdf8;
}

::v-deep .el-tabs__active-bar {
  background-color: #38bdf8;
}

::v-deep .el-tabs__nav-wrap::after {
  background-color: #17263d;
}
</style>
