<template>
  <div class="resource-page">
    <div class="resource-main">
      <div class="hero-strip">
        <div>
          <span class="panel-kicker">CLASSIFIED STORAGE</span>
          <h2>数据源管理</h2>
          <p>维护平台接入的底层数据源，配置连接主机、库标识及数据库类型。</p>
        </div>
        <div class="metric-group">
          <div class="metric-card">
            <strong>{{ sourceTotal }}</strong>
            <span>数据源总数</span>
          </div>
        </div>
      </div>

      <div class="work-content">
        <div class="toolbar">
          <el-form :inline="true" :model="sourceQuery" size="mini">
            <el-form-item label="源名称">
              <el-input
                v-model="sourceQuery.sourceName"
                clearable
                placeholder="数据源名称"
              />
            </el-form-item>
            <el-form-item label="数据库">
              <el-input
                v-model="sourceQuery.dbName"
                clearable
                placeholder="数据库名称"
              />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                icon="el-icon-search"
                @click="fetchSources"
                >查询</el-button
              >
              <el-button icon="el-icon-refresh" @click="resetSourceQuery"
                >重置</el-button
              >
            </el-form-item>
          </el-form>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-plus"
            @click="openSourceDialog(false)"
          >
            新增数据源
          </el-button>
        </div>

        <el-table
          :data="sourceList"
          size="mini"
          stripe
          border
          v-loading="loadingSource"
          class="source-table"
        >
          <el-table-column
            prop="sourceName"
            label="数据源名称"
            min-width="160"
          />
          <el-table-column prop="host" label="主机" min-width="130" />
          <el-table-column prop="port" label="端口" width="80" />
          <el-table-column prop="dbId" label="库标识" min-width="120" />
          <el-table-column prop="dbName" label="数据库" min-width="120" />
          <el-table-column prop="dbType" label="库类型" width="90" />
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="openSourceDialog(true, scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="text"
                class="danger-link"
                icon="el-icon-delete"
                @click="deleteSource(scope.row)"
              >
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
      </div>
    </div>

    <el-dialog
      :title="isEditSource ? '编辑数据源' : '新增数据源'"
      :visible.sync="sourceDialogVisible"
      width="680px"
      append-to-body
    >
      <el-form
        ref="sourceForm"
        :model="sourceForm"
        :rules="sourceRules"
        label-width="80px"
        size="mini"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="数据源名称" prop="sourceName">
              <el-input v-model="sourceForm.sourceName" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="主机地址" prop="host">
              <el-input
                v-model="sourceForm.host"
                placeholder="例如: 127.0.0.1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="端口" prop="port">
              <el-input-number
                v-model="sourceForm.port"
                :min="1"
                :max="65535"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="库标识" prop="dbId">
              <el-input v-model="sourceForm.dbId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据库名" prop="dbName">
              <el-input v-model="sourceForm.dbName" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="数据源类型" prop="sourceType">
              <el-select
                v-model="sourceForm.sourceType"
                class="full-width"
                placeholder="请选择数据源类型"
              >
                <el-option
                  v-for="(k, v) in sourceTypeOptions"
                  :key="k"
                  :label="k"
                  :value="v"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="数据库类型" prop="dbType">
              <el-select
                v-model="sourceForm.dbType"
                class="full-width"
                placeholder="请选择数据库类型"
              >
                <el-option
                  v-for="(k, v) in dbTypeOptions"
                  :key="k"
                  :label="k"
                  :value="v"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="sourceForm.userName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="userPassword">
              <el-input v-model="sourceForm.userPassword" show-password />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="sourceDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitSource"
          >保存</el-button
        >
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
      loadingSource: false,
      sourceQuery: {sourceName: '', dbName: ''},
      sourceList: [],
      sourceTypeOptions: [],
      dbTypeOptions: [],
      sourceTotal: 0,
      sourcePage: {pageNum: 1, pageSize: 12},
      sourceDialogVisible: false,
      isEditSource: false,
      sourceForm: this.getEmptySourceForm(),
      sourceRules: {
        sourceName: [
          {required: true, message: '请输入数据源名称', trigger: 'blur'}
        ],
        host: [{required: true, message: '请输入主机地址', trigger: 'blur'}],
        port: [{required: true, message: '请输入端口号', trigger: 'blur'}],
        dbId: [{required: true, message: '请输入库标识', trigger: 'blur'}],
        dbName: [{required: true, message: '请输入数据库名', trigger: 'blur'}]
      }
    }
  },
  mounted() {
    this.fetchSources()
    this.fetchSourceDictionaries()
  },
  methods: {
    getEmptySourceForm() {
      return {
        dataSourceId: null,
        sourceName: '',
        sourceType: '', // 默数字类型
        host: '',
        port: 5236,
        dbId: '',
        dbName: '',
        dbType: null,
        userName: '',
        userPassword: ''
      }
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    optionLabel(item) {
      return (
        item.label ||
        item.name ||
        item.typeName ||
        item.dictName ||
        String(item.value || item)
      )
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
          this.sourceTotal =
            (res.data && res.data.total) || this.sourceList.length
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
    openSourceDialog(isEdit, row) {
      this.isEditSource = isEdit
      if (isEdit && row) {
        // 关键修正：回显时确保 sourceType 和 dbType 是系统要求的纯数字类型
        this.sourceForm = {
          ...row,
          sourceType:
            row.sourceType !== undefined &&
            row.sourceType !== null &&
            row.sourceType !== ''
              ? String(row.sourceType)
              : null,
          dbType:
            row.dbType !== undefined && row.dbType !== null && row.dbType !== ''
              ? String(row.dbType)
              : null
        }
      } else {
        this.sourceForm = this.getEmptySourceForm()
      }
      this.sourceDialogVisible = true
      this.$nextTick(
        () => this.$refs.sourceForm && this.$refs.sourceForm.clearValidate()
      )
    },
    submitSource() {
      this.$refs.sourceForm.validate(valid => {
        if (!valid) return
        const action = this.isEditSource
          ? apiUpdate('dataSource', this.sourceForm)
          : apiAdd('dataSource', this.sourceForm)
        action.then(() => {
          this.$message.success('数据源已保存')
          this.sourceDialogVisible = false
          this.fetchSources()
        })
      })
    },
    deleteSource(row) {
      const id = row.dataSourceId
      this.$confirm(`确定删除数据源 [${row.sourceName}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('dataSource', id).then(() => {
          this.$message.success('删除成功')
          this.fetchSources()
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
  display: flex;
  flex-direction: column;
  background: #03060c;
  color: #cbd5e1;
}

.resource-main {
  flex: 1;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.work-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.source-table {
  flex: 1;
}

.toolbar,
.hero-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

h2,
p {
  margin: 0;
}

.panel-kicker {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 3px;
}

.hero-strip {
  background: #0c1424;
  border: 1px solid #16243a;
  border-radius: 4px;
  padding: 14px 16px;
  margin-bottom: 14px;
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
  min-width: 90px;
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

.toolbar {
  margin-bottom: 12px;
}

.pager {
  margin-top: 12px;
  text-align: right;
}

.full-width {
  width: 100%;
}

.danger-link {
  color: #f56c6c;
}

/* 清理由于双列多行布局导致的内部 padding 冲突 */
.el-dialog .el-form-item {
  margin-bottom: 18px;
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
