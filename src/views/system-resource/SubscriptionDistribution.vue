<template>
  <div class="resource-page">
    <div class="resource-aside" v-loading="loadingClass">
      <div class="panel-title-row">
        <div>
          <span class="panel-kicker">SUBJECT CLASS</span>
          <h3>主题分类</h3>
        </div>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="openClassDialog(false)"
        >
          新建分类
        </el-button>
      </div>

      <div class="tree-box">
        <el-tree
          :data="[classTree]"
          :props="classTreeProps"
          node-key="subjectClassId"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleClassClick"
        >
          <span class="tree-node" slot-scope="{data}">
            <span><i class="el-icon-folder"></i> {{ data.className }}</span>
            <span class="tree-actions">
              <i
                class="el-icon-edit text-green"
                @click.stop="openClassDialog(true, data)"
              ></i>
              <i
                class="el-icon-delete text-red"
                @click.stop="deleteClass(data)"
              ></i>
            </span>
          </span>
        </el-tree>
      </div>
    </div>

    <div class="resource-main">
      <div class="hero-strip">
        <div>
          <span class="panel-kicker">SUBSCRIPTION FLOW</span>
          <h2>订阅分发</h2>
          <p>管理主题发布、订阅申请和审核状态，形成可追踪的数据分发链路。</p>
        </div>
        <div class="metric-group">
          <div class="metric-card">
            <strong>{{ subjectTotal }}</strong>
            <span>主题</span>
          </div>
          <div class="metric-card warn">
            <strong>{{ subscribeTotal }}</strong>
            <span>订阅</span>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="主题信息" name="subject">
          <div class="toolbar">
            <el-form :inline="true" :model="subjectQuery" size="mini">
              <el-form-item label="主题">
                <el-input
                  v-model="subjectQuery.keyword"
                  clearable
                  placeholder="主题关键词"
                />
              </el-form-item>
              <el-form-item label="分类">
                <el-input
                  v-model="subjectQuery.className"
                  clearable
                  placeholder="分类名称"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="fetchSubjects"
                  >查询</el-button
                >
                <el-button icon="el-icon-refresh" @click="resetSubjectQuery"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openSubjectDialog(false)"
            >
              新建主题
            </el-button>
          </div>

          <el-table
            :data="subjectList"
            size="mini"
            stripe
            border
            v-loading="loadingSubject"
          >
            <el-table-column prop="keyword" label="主题" min-width="140" />
            <el-table-column prop="className" label="分类" min-width="110" />
            <el-table-column
              prop="labelModelIds"
              label="标签模型"
              min-width="130"
              show-overflow-tooltip
            />
            <el-table-column
              prop="selectAttrNames"
              label="输出属性"
              min-width="160"
              show-overflow-tooltip
            />
            <el-table-column prop="outputType" label="输出类型" width="90">
              <template slot-scope="scope">{{
                formatOutputType(scope.row.outputType)
              }}</template>
            </el-table-column>
            <el-table-column prop="updateRate" label="更新率" width="90" />
            <el-table-column label="操作" width="220" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="openSubjectDialog(true, scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-switch-button"
                  @click="toggleSubject(scope.row, true)"
                  >启用</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-remove-outline"
                  @click="toggleSubject(scope.row, false)"
                  >停用</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  class="danger-link"
                  icon="el-icon-delete"
                  @click="deleteSubject(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            class="pager"
            small
            layout="total, prev, pager, next"
            :current-page.sync="subjectPage.pageNum"
            :page-size="subjectPage.pageSize"
            :total="subjectTotal"
            @current-change="fetchSubjects"
          />
        </el-tab-pane>

        <el-tab-pane label="订阅审核" name="subscribe">
          <div class="toolbar">
            <el-form :inline="true" :model="subscribeQuery" size="mini">
              <el-form-item label="订阅人">
                <el-input
                  v-model="subscribeQuery.subscribeUserName"
                  clearable
                  placeholder="订阅用户姓名"
                />
              </el-form-item>
              <el-form-item label="主题">
                <el-input
                  v-model="subscribeQuery.keyword"
                  clearable
                  placeholder="主题关键词"
                />
              </el-form-item>
              <el-form-item label="状态">
                <el-select
                  v-model="subscribeQuery.subscribeState"
                  clearable
                  placeholder="全部"
                  style="width: 110px"
                >
                  <el-option label="待审核" :value="0" />
                  <el-option label="已拒绝" :value="1" />
                  <el-option label="已通过" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="fetchSubscribes"
                  >查询</el-button
                >
                <el-button icon="el-icon-refresh" @click="resetSubscribeQuery"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openSubscribeDialog(false)"
            >
              新增订阅
            </el-button>
          </div>

          <el-table
            :data="subscribeList"
            size="mini"
            stripe
            border
            v-loading="loadingSubscribe"
          >
            <el-table-column prop="keyword" label="主题" min-width="130" />
            <el-table-column
              prop="subscribeUserName"
              label="订阅人"
              min-width="110"
            />
            <el-table-column prop="opUserName" label="处理人" min-width="110" />
            <el-table-column
              prop="subscribeTime"
              label="申请时间"
              min-width="145"
            />
            <el-table-column
              prop="subscribeReason"
              label="订阅理由"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column prop="subscribeState" label="状态" width="90">
              <template slot-scope="scope">
                <el-tag
                  size="mini"
                  :type="stateTagType(scope.row.subscribeState)"
                >
                  {{ stateText(scope.row.subscribeState) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="210" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-edit"
                  @click="openSubscribeDialog(true, scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-check"
                  @click="auditSubscribe(scope.row, true)"
                  >通过</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  icon="el-icon-close"
                  @click="auditSubscribe(scope.row, false)"
                  >拒绝</el-button
                >
                <el-button
                  size="mini"
                  type="text"
                  class="danger-link"
                  icon="el-icon-delete"
                  @click="deleteSubscribe(scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            class="pager"
            small
            layout="total, prev, pager, next"
            :current-page.sync="subscribePage.pageNum"
            :page-size="subscribePage.pageSize"
            :total="subscribeTotal"
            @current-change="fetchSubscribes"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      :title="isEditClass ? '编辑主题分类' : '新增主题分类'"
      :visible.sync="classDialogVisible"
      width="520px"
      append-to-body
    >
      <el-form
        ref="classForm"
        :model="classForm"
        :rules="classRules"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="上级分类">
          <el-cascader
            v-model="classForm.parentClassId"
            :options="classTree"
            :props="classCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="classForm.className" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="classForm.classMemo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="classDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitClass"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditSubject ? '编辑主题' : '新增主题'"
      :visible.sync="subjectDialogVisible"
      width="660px"
      append-to-body
    >
      <el-form
        ref="subjectForm"
        :model="subjectForm"
        :rules="subjectRules"
        label-width="120px"
        size="mini"
      >
        <el-form-item label="主题分类" prop="subjectClassId">
          <el-cascader
            v-model="subjectForm.subjectClassId"
            :options="classTree"
            :props="classCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="主题" prop="keyword">
          <el-input v-model="subjectForm.keyword" />
        </el-form-item>
        <el-form-item label="标签模型ID">
          <el-input
            v-model="subjectForm.labelModelIds"
            placeholder="多个 ID 用英文逗号分隔"
          />
        </el-form-item>
        <el-form-item label="输出属性">
          <el-input
            v-model="subjectForm.selectAttrNames"
            placeholder="如 roleId,roleName"
          />
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="8">
            <el-form-item label="输出类型">
              <el-select v-model="subjectForm.outputType" class="full-width">
                <el-option label="JSON" :value="0" />
                <el-option label="XML" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="频率类型">
              <el-input-number
                v-model="subjectForm.updateRateType"
                :min="0"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="更新率">
              <el-input-number
                v-model="subjectForm.updateRate"
                :min="0"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="subjectDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitSubject"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditSubscribe ? '编辑订阅' : '新增订阅'"
      :visible.sync="subscribeDialogVisible"
      width="560px"
      append-to-body
    >
      <el-form
        ref="subscribeForm"
        :model="subscribeForm"
        :rules="subscribeRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="主题标识" prop="subjectId">
          <el-input-number
            v-model="subscribeForm.subjectId"
            :min="1"
            controls-position="right"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="订阅用户" prop="subscribeUserId">
          <el-input-number
            v-model="subscribeForm.subscribeUserId"
            :min="1"
            controls-position="right"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="订阅理由">
          <el-input
            v-model="subscribeForm.subscribeReason"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="subscribeDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitSubscribe"
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
  name: 'SubscriptionDistribution',
  data() {
    return {
      activeTab: 'subject',
      classTree: [],
      classTreeProps: {children: 'children', label: 'className'},
      classCascaderProps: {
        value: 'subjectClassId',
        label: 'className',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },
      activeClass: null,
      loadingClass: false,
      loadingSubject: false,
      loadingSubscribe: false,
      subjectQuery: {searchType: 0, className: '', keyword: ''},
      subscribeQuery: {subscribeUserName: '', keyword: '', subscribeState: ''},
      subjectList: [],
      subscribeList: [],
      subjectTotal: 0,
      subscribeTotal: 0,
      subjectPage: {pageNum: 1, pageSize: 12},
      subscribePage: {pageNum: 1, pageSize: 12},
      classDialogVisible: false,
      subjectDialogVisible: false,
      subscribeDialogVisible: false,
      isEditClass: false,
      isEditSubject: false,
      isEditSubscribe: false,
      classForm: this.getEmptyClassForm(),
      subjectForm: this.getEmptySubjectForm(),
      subscribeForm: this.getEmptySubscribeForm(),
      classRules: {
        className: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      subjectRules: {
        subjectClassId: [
          {required: true, message: '请选择主题分类', trigger: 'change'}
        ],
        keyword: [{required: true, message: '请输入主题', trigger: 'blur'}]
      },
      subscribeRules: {
        subjectId: [
          {required: true, message: '请输入主题标识', trigger: 'blur'}
        ],
        subscribeUserId: [
          {required: true, message: '请输入订阅用户标识', trigger: 'blur'}
        ]
      }
    }
  },
  mounted() {
    this.fetchClassTree()
    this.fetchSubjects()
    this.fetchSubscribes()
  },
  methods: {
    getEmptyClassForm() {
      return {
        subjectClassId: null,
        parentClassId: null,
        className: '',
        classMemo: ''
      }
    },
    getEmptySubjectForm() {
      return {
        subjectId: null,
        subjectClassId: null,
        keyword: '',
        labelModelIds: '',
        selectAttrNames: '',
        outputType: 0,
        updateRateType: 1,
        updateRate: 0
      }
    },
    getEmptySubscribeForm() {
      return {
        subscribeId: null,
        subjectId: null,
        subscribeUserId: null,
        subscribeReason: ''
      }
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    fetchClassTree() {
      this.loadingClass = true
      request({url: '/rest/subjectClass/findTree', method: 'get'})
        .then(res => {
          this.classTree = this.normalizeList(res)
        })
        .finally(() => {
          this.loadingClass = false
        })
    },
    fetchSubjects() {
      this.loadingSubject = true
      apiPage('subjectInfo', {
        pageNum: this.subjectPage.pageNum,
        pageSize: this.subjectPage.pageSize,
        params: {...this.subjectQuery}
      })
        .then(res => {
          this.subjectList = this.normalizeList(res)
          this.subjectTotal =
            (res.data && res.data.total) || this.subjectList.length
        })
        .finally(() => {
          this.loadingSubject = false
        })
    },
    fetchSubscribes() {
      this.loadingSubscribe = true
      const params = {...this.subscribeQuery}
      if (params.subscribeState === '') delete params.subscribeState
      apiPage('subscribeInfo', {
        pageNum: this.subscribePage.pageNum,
        pageSize: this.subscribePage.pageSize,
        params
      })
        .then(res => {
          this.subscribeList = this.normalizeList(res)
          this.subscribeTotal =
            (res.data && res.data.total) || this.subscribeList.length
        })
        .finally(() => {
          this.loadingSubscribe = false
        })
    },
    handleTabClick(tab) {
      if (tab.name === 'subject') this.fetchSubjects()
      if (tab.name === 'subscribe') this.fetchSubscribes()
    },
    handleClassClick(data) {
      this.activeClass = data
      this.subjectQuery.className = data.className
      this.subjectPage.pageNum = 1
      this.activeTab = 'subject'
      this.fetchSubjects()
    },
    resetSubjectQuery() {
      this.subjectQuery = {searchType: 0, className: '', keyword: ''}
      this.subjectPage.pageNum = 1
      this.fetchSubjects()
    },
    resetSubscribeQuery() {
      this.subscribeQuery = {
        subscribeUserName: '',
        keyword: '',
        subscribeState: ''
      }
      this.subscribePage.pageNum = 1
      this.fetchSubscribes()
    },
    openClassDialog(isEdit, row) {
      this.isEditClass = isEdit
      this.classForm =
        isEdit && row
          ? {...row}
          : {
              ...this.getEmptyClassForm(),
              parentClassId: this.activeClass && this.activeClass.subjectClassId
            }
      this.classDialogVisible = true
      this.$nextTick(
        () => this.$refs.classForm && this.$refs.classForm.clearValidate()
      )
    },
    submitClass() {
      this.$refs.classForm.validate(valid => {
        if (!valid) return
        const action = this.isEditClass
          ? apiUpdate('subjectClass', this.classForm)
          : apiAdd('subjectClass', this.classForm)
        action.then(() => {
          this.$message.success('主题分类已保存')
          this.classDialogVisible = false
          this.fetchClassTree()
        })
      })
    },
    deleteClass(row) {
      this.$confirm(`确定删除主题分类 [${row.className}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('subjectClass', row.subjectClassId).then(() => {
          this.$message.success('删除成功')
          this.fetchClassTree()
        })
      })
    },
    openSubjectDialog(isEdit, row) {
      this.isEditSubject = isEdit
      this.subjectForm =
        isEdit && row
          ? {...row}
          : {
              ...this.getEmptySubjectForm(),
              subjectClassId:
                this.activeClass && this.activeClass.subjectClassId
            }
      this.subjectDialogVisible = true
      this.$nextTick(
        () => this.$refs.subjectForm && this.$refs.subjectForm.clearValidate()
      )
    },
    submitSubject() {
      this.$refs.subjectForm.validate(valid => {
        if (!valid) return
        const action = this.isEditSubject
          ? apiUpdate('subjectInfo', this.subjectForm)
          : apiAdd('subjectInfo', this.subjectForm)
        action.then(() => {
          this.$message.success('主题已保存')
          this.subjectDialogVisible = false
          this.fetchSubjects()
        })
      })
    },
    deleteSubject(row) {
      this.$confirm(`确定删除主题 [${row.keyword}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('subjectInfo', row.subjectId).then(() => {
          this.$message.success('删除成功')
          this.fetchSubjects()
        })
      })
    },
    toggleSubject(row, enable) {
      request({
        url: `/rest/subjectInfo/${enable ? 'enable' : 'disable'}/${row.subjectId}`,
        method: 'post'
      }).then(() => {
        this.$message.success(enable ? '主题已启用' : '主题已停用')
        this.fetchSubjects()
      })
    },
    openSubscribeDialog(isEdit, row) {
      this.isEditSubscribe = isEdit
      this.subscribeForm =
        isEdit && row ? {...row} : this.getEmptySubscribeForm()
      this.subscribeDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.subscribeForm && this.$refs.subscribeForm.clearValidate()
      )
    },
    submitSubscribe() {
      this.$refs.subscribeForm.validate(valid => {
        if (!valid) return
        const action = this.isEditSubscribe
          ? apiUpdate('subscribeInfo', this.subscribeForm)
          : apiAdd('subscribeInfo', this.subscribeForm)
        action.then(() => {
          this.$message.success('订阅已保存')
          this.subscribeDialogVisible = false
          this.fetchSubscribes()
        })
      })
    },
    deleteSubscribe(row) {
      this.$confirm(
        `确定删除订阅 [${row.keyword || row.subscribeId}] 吗？`,
        '提示',
        {type: 'warning'}
      ).then(() => {
        apiDelete('subscribeInfo', row.subscribeId).then(() => {
          this.$message.success('删除成功')
          this.fetchSubscribes()
        })
      })
    },
    auditSubscribe(row, accept) {
      const url = accept
        ? `/rest/subscribeInfo/accept/${row.subscribeId}`
        : `/rest/subjectInfo/refuse/${row.subscribeId}`
      request({url, method: 'post'}).then(() => {
        this.$message.success(accept ? '已通过订阅' : '已拒绝订阅')
        this.fetchSubscribes()
      })
    },
    formatOutputType(val) {
      return Number(val) === 1 ? 'XML' : 'JSON'
    },
    stateText(val) {
      const map = {0: '待审核', 1: '已拒绝', 2: '已通过'}
      return map[val] || '未知'
    },
    stateTagType(val) {
      const map = {0: 'warning', 1: 'danger', 2: 'success'}
      return map[val] || 'info'
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
  grid-template-columns: 300px minmax(0, 1fr);
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

.metric-card.warn strong {
  color: #f59e0b;
}

.metric-card span {
  font-size: 12px;
  color: #94a3b8;
}

.toolbar {
  margin-bottom: 10px;
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
</style>
