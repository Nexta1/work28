<template>
  <div class="governance-page">
    <div class="class-panel" v-loading="loadingClass">
      <div class="panel-title-row">
        <div>
          <span class="panel-kicker">LABEL CLASS</span>
          <h3>标签分类树</h3>
        </div>
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="openClassDialog(false)">
          新建分类
        </el-button>
      </div>

      <el-input
        v-model="filterText"
        size="mini"
        clearable
        prefix-icon="el-icon-search"
        placeholder="过滤分类名称"
      />

      <div class="tree-box">
        <el-tree
          ref="classTree"
          :data="classTree"
          :props="treeProps"
          node-key="labelClassId"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          :filter-node-method="filterClassNode"
          @node-click="handleClassClick"
        >
          <span class="tree-node" slot-scope="{data}">
            <span><i class="el-icon-collection-tag"></i> {{ data.className }}</span>
            <span class="tree-actions">
              <i class="el-icon-edit text-green" @click.stop="openClassDialog(true, data)"></i>
              <i class="el-icon-delete text-red" @click.stop="deleteClass(data)"></i>
            </span>
          </span>
        </el-tree>
      </div>
    </div>

    <div class="content-panel">
      <div class="hero-strip">
        <div>
          <span class="panel-kicker">GOVERNANCE MODEL</span>
          <h2>数据治理模型维护</h2>
          <p>维护标签分类与标签模型，支持后续数据标注、治理规则绑定和主题输出。</p>
        </div>
        <div class="metric-group">
          <div class="metric-card">
            <strong>{{ classCount }}</strong>
            <span>分类</span>
          </div>
          <div class="metric-card">
            <strong>{{ modelTotal }}</strong>
            <span>模型</span>
          </div>
        </div>
      </div>

      <div class="toolbar">
        <el-form :inline="true" :model="modelQuery" size="mini">
          <el-form-item label="分类">
            <el-input v-model="modelQuery.className" clearable placeholder="分类名称" />
          </el-form-item>
          <el-form-item label="标签">
            <el-input v-model="modelQuery.labelName" clearable placeholder="标签名称" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="fetchModels">查询</el-button>
            <el-button icon="el-icon-refresh" @click="resetModelQuery">重置</el-button>
          </el-form-item>
        </el-form>
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="openModelDialog(false)">
          新建标签模型
        </el-button>
      </div>

      <div v-if="activeClass" class="active-card">
        <div>
          <span class="panel-kicker">CURRENT CLASS</span>
          <h3>{{ activeClass.className }}</h3>
        </div>
        <el-tag size="mini" type="success">分类ID: {{ activeClass.labelClassId }}</el-tag>
      </div>

      <el-table :data="modelList" size="mini" stripe border v-loading="loadingModel">
        <el-table-column prop="labelName" label="标签模型名称" min-width="160" />
        <el-table-column prop="className" label="所属分类" min-width="130" />
        <el-table-column prop="labelClassId" label="分类ID" width="90" />
        <el-table-column prop="labelMemo" label="模型说明" min-width="220" show-overflow-tooltip />
        <el-table-column prop="opUserId" label="操作人" width="90" />
        <el-table-column prop="opTime" label="操作时间" min-width="150" />
        <el-table-column label="操作" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" icon="el-icon-edit" @click="openModelDialog(true, scope.row)">编辑</el-button>
            <el-button size="mini" type="text" class="danger-link" icon="el-icon-delete" @click="deleteModel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pager" small layout="total, prev, pager, next" :current-page.sync="modelPage.pageNum" :page-size="modelPage.pageSize" :total="modelTotal" @current-change="fetchModels" />
    </div>

    <el-dialog :title="isEditClass ? '编辑标签分类' : '新增标签分类'" :visible.sync="classDialogVisible" width="560px" append-to-body>
      <el-form ref="classForm" :model="classForm" :rules="classRules" label-width="110px" size="mini">
        <el-form-item label="上级分类">
          <el-cascader v-model="classForm.parentClassId" :options="classTree" :props="cascaderProps" clearable filterable class="full-width" />
        </el-form-item>
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="classForm.className" />
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="模型类型">
            <el-select v-model="classForm.classModelType" class="full-width" filterable allow-create>
              <el-option
                v-for="item in modelTypeOptions"
                :key="optionValue(item)"
                :label="optionLabel(item)"
                :value="optionValue(item)"
              />
            </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="标签类型">
              <el-input-number v-model="classForm.classType" :min="0" controls-position="right" class="full-width" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="来源">
          <el-input v-model="classForm.classSource" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="classDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitClass">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="isEditModel ? '编辑标签模型' : '新增标签模型'" :visible.sync="modelDialogVisible" width="560px" append-to-body>
      <el-form ref="modelForm" :model="modelForm" :rules="modelRules" label-width="110px" size="mini">
        <el-form-item label="所属分类" prop="labelClassId">
          <el-cascader v-model="modelForm.labelClassId" :options="classTree" :props="cascaderProps" clearable filterable class="full-width" />
        </el-form-item>
        <el-form-item label="标签名称" prop="labelName">
          <el-input v-model="modelForm.labelName" />
        </el-form-item>
        <el-form-item label="模型说明">
          <el-input v-model="modelForm.labelMemo" type="textarea" :rows="3" />
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
  name: 'DataGovernanceModel',
  data() {
    return {
      loadingClass: false,
      loadingModel: false,
      filterText: '',
      classTree: [],
      modelTypeOptions: [],
      activeClass: null,
      treeProps: {children: 'children', label: 'className'},
      cascaderProps: {
        value: 'labelClassId',
        label: 'className',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },
      modelQuery: {labelClassId: '', className: '', labelName: ''},
      modelList: [],
      modelTotal: 0,
      modelPage: {pageNum: 1, pageSize: 12},
      classDialogVisible: false,
      modelDialogVisible: false,
      isEditClass: false,
      isEditModel: false,
      classForm: this.getEmptyClassForm(),
      modelForm: this.getEmptyModelForm(),
      classRules: {className: [{required: true, message: '请输入分类名称', trigger: 'blur'}]},
      modelRules: {
        labelClassId: [{required: true, message: '请选择所属分类', trigger: 'change'}],
        labelName: [{required: true, message: '请输入标签名称', trigger: 'blur'}]
      }
    }
  },
  computed: {
    classCount() {
      const walk = nodes => (nodes || []).reduce((sum, item) => sum + 1 + walk(item.children), 0)
      return walk(this.classTree)
    }
  },
  watch: {
    filterText(val) {
      if (this.$refs.classTree) this.$refs.classTree.filter(val)
    }
  },
  mounted() {
    this.fetchClassTree()
    this.fetchModels()
    this.fetchModelTypes()
  },
  methods: {
    getEmptyClassForm() {
      return {
        labelClassId: null,
        parentClassId: null,
        classModelType: 1,
        className: '',
        classSource: '',
        classType: 1
      }
    },
    getEmptyModelForm() {
      return {labelModelId: null, labelClassId: null, labelName: '', labelMemo: ''}
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
    filterClassNode(value, data) {
      if (!value) return true
      return String(data.className || '').indexOf(value) !== -1
    },
    fetchClassTree() {
      this.loadingClass = true
      request({url: '/rest/labelClass/findTree', method: 'get'})
        .then(res => {
          this.classTree = this.normalizeList(res)
        })
        .finally(() => {
          this.loadingClass = false
        })
    },
    fetchModelTypes() {
      request({url: '/rest/labelClass/modelTypes', method: 'get'}).then(res => {
        this.modelTypeOptions = this.normalizeList(res)
      })
    },
    fetchModels() {
      this.loadingModel = true
      const params = {...this.modelQuery}
      if (!params.labelClassId) delete params.labelClassId
      apiPage('labelModel', {
        pageNum: this.modelPage.pageNum,
        pageSize: this.modelPage.pageSize,
        params
      })
        .then(res => {
          this.modelList = this.normalizeList(res)
          this.modelTotal = (res.data && res.data.total) || this.modelList.length
        })
        .finally(() => {
          this.loadingModel = false
        })
    },
    handleClassClick(data) {
      this.activeClass = data
      this.modelQuery.labelClassId = data.labelClassId
      this.modelQuery.className = data.className
      this.modelPage.pageNum = 1
      this.fetchModels()
    },
    resetModelQuery() {
      this.modelQuery = {labelClassId: '', className: '', labelName: ''}
      this.modelPage.pageNum = 1
      this.fetchModels()
    },
    openClassDialog(isEdit, row) {
      this.isEditClass = isEdit
      this.classForm = isEdit && row ? {...row} : {...this.getEmptyClassForm(), parentClassId: this.activeClass && this.activeClass.labelClassId}
      this.classDialogVisible = true
      this.$nextTick(() => this.$refs.classForm && this.$refs.classForm.clearValidate())
    },
    submitClass() {
      this.$refs.classForm.validate(valid => {
        if (!valid) return
        const action = this.isEditClass ? apiUpdate('labelClass', this.classForm) : apiAdd('labelClass', this.classForm)
        action.then(() => {
          this.$message.success('标签分类已保存')
          this.classDialogVisible = false
          this.fetchClassTree()
        })
      })
    },
    deleteClass(row) {
      this.$confirm(`确定删除标签分类 [${row.className}] 吗？`, '提示', {type: 'warning'}).then(() => {
        apiDelete('labelClass', row.labelClassId).then(() => {
          this.$message.success('删除成功')
          if (this.activeClass && this.activeClass.labelClassId === row.labelClassId) this.activeClass = null
          this.fetchClassTree()
        })
      })
    },
    openModelDialog(isEdit, row) {
      this.isEditModel = isEdit
      this.modelForm = isEdit && row
        ? {...row}
        : {...this.getEmptyModelForm(), labelClassId: this.activeClass && this.activeClass.labelClassId}
      this.modelDialogVisible = true
      this.$nextTick(() => this.$refs.modelForm && this.$refs.modelForm.clearValidate())
    },
    submitModel() {
      this.$refs.modelForm.validate(valid => {
        if (!valid) return
        const action = this.isEditModel ? apiUpdate('labelModel', this.modelForm) : apiAdd('labelModel', this.modelForm)
        action.then(() => {
          this.$message.success('标签模型已保存')
          this.modelDialogVisible = false
          this.fetchModels()
        })
      })
    },
    deleteModel(row) {
      this.$confirm(`确定删除标签模型 [${row.labelName}] 吗？`, '提示', {type: 'warning'}).then(() => {
        apiDelete('labelModel', row.labelModelId).then(() => {
          this.$message.success('删除成功')
          this.fetchModels()
        })
      })
    }
  }
}
</script>

<style scoped>
.governance-page {
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

.class-panel,
.content-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  min-height: 0;
}

.class-panel {
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.content-panel {
  padding: 14px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-title-row,
.hero-strip,
.toolbar,
.active-card {
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

.toolbar,
.active-card {
  margin-bottom: 10px;
}

.active-card {
  border: 1px solid #16243a;
  background: #0c1424;
  border-radius: 4px;
  padding: 12px;
}

.active-card h3 {
  color: #fff;
}

.pager {
  margin-top: 10px;
  text-align: right;
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
</style>
