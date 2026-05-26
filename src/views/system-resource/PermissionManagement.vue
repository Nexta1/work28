<template>
  <div class="permission-page">
    <div class="role-panel">
      <div class="panel-title-row">
        <div>
          <span class="panel-kicker">ROLE INFO</span>
          <h3>权限角色</h3>
        </div>
        <el-button type="primary" size="mini" icon="el-icon-plus" @click="openRoleDialog(false)">
          新建角色
        </el-button>
      </div>

      <el-form :model="roleQuery" size="mini" class="query-form">
        <el-form-item>
          <el-input v-model="roleQuery.roleName" clearable prefix-icon="el-icon-search" placeholder="搜索角色名称" @keyup.enter.native="fetchRoles" />
        </el-form-item>
      </el-form>

      <div class="role-list" v-loading="loadingRoles">
        <div
          v-for="role in roleList"
          :key="role.roleId"
          :class="['role-item', {active: activeRole && activeRole.roleId === role.roleId}]"
          @click="selectRole(role)"
        >
          <div class="role-icon">{{ role.roleType === 0 ? '管' : '角' }}</div>
          <div class="role-info">
            <strong>{{ role.roleName }}</strong>
            <span>{{ role.roleMemo || roleTypeText(role.roleType) }}</span>
          </div>
          <div class="role-actions">
            <i class="el-icon-edit text-green" @click.stop="openRoleDialog(true, role)"></i>
            <i class="el-icon-delete text-red" @click.stop="deleteRole(role)"></i>
          </div>
        </div>
        <el-empty v-if="!roleList.length && !loadingRoles" description="暂无角色" />
      </div>
    </div>

    <div class="content-panel">
      <div class="hero-strip">
        <div>
          <span class="panel-kicker">ACCESS CONTROL</span>
          <h2>权限管理</h2>
          <p>基于角色维护模块权限与数据权限，接口对齐 roleInfo 与 roleData。</p>
        </div>
        <div class="metric-group">
          <div class="metric-card">
            <strong>{{ totalRoles }}</strong>
            <span>角色</span>
          </div>
          <div class="metric-card">
            <strong>{{ roleDataTotal }}</strong>
            <span>数据授权</span>
          </div>
        </div>
      </div>

      <div v-if="activeRole" class="active-card">
        <div>
          <span class="panel-kicker">CURRENT ROLE</span>
          <h3>{{ activeRole.roleName }}</h3>
        </div>
        <el-tag size="mini" :type="activeRole.roleType === 0 ? 'danger' : 'success'">
          {{ roleTypeText(activeRole.roleType) }}
        </el-tag>
      </div>

      <el-tabs v-model="activeTab" class="work-tabs" @tab-click="handleTabClick">
        <el-tab-pane label="角色数据权限" name="roleData">
          <div class="toolbar">
            <el-form :inline="true" :model="roleDataQuery" size="mini">
              <el-form-item label="角色">
                <el-input v-model="roleDataQuery.roleName" clearable placeholder="角色名称" />
              </el-form-item>
              <el-form-item label="模型">
                <el-input v-model="roleDataQuery.modelName" clearable placeholder="数据模型名称" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="el-icon-search" @click="fetchRoleData">查询</el-button>
                <el-button icon="el-icon-refresh" @click="resetRoleDataQuery">重置</el-button>
              </el-form-item>
            </el-form>
            <el-button type="primary" size="mini" icon="el-icon-plus" :disabled="!activeRole" @click="openRoleDataDialog(false)">
              新增数据权限
            </el-button>
          </div>

          <el-table :data="roleDataList" size="mini" stripe border v-loading="loadingRoleData">
            <el-table-column prop="roleName" label="角色名称" min-width="130" />
            <el-table-column prop="modelName" label="数据模型" min-width="160" />
            <el-table-column prop="dataModelId" label="模型ID" width="90" />
            <el-table-column prop="opUserId" label="操作人" width="90" />
            <el-table-column prop="opTime" label="操作时间" min-width="150" />
            <el-table-column label="操作" width="140" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-edit" @click="openRoleDataDialog(true, scope.row)">编辑</el-button>
                <el-button size="mini" type="text" class="danger-link" icon="el-icon-delete" @click="deleteRoleData(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination class="pager" small layout="total, prev, pager, next" :current-page.sync="roleDataPage.pageNum" :page-size="roleDataPage.pageSize" :total="roleDataTotal" @current-change="fetchRoleData" />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog :title="isEditRole ? '编辑角色' : '新增角色'" :visible.sync="roleDialogVisible" width="520px" append-to-body>
      <el-form ref="roleForm" :model="roleForm" :rules="roleRules" label-width="90px" size="mini">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" />
        </el-form-item>
        <el-form-item label="角色类型">
          <el-radio-group v-model="roleForm.roleType">
            <el-radio-button :label="0">管理员</el-radio-button>
            <el-radio-button :label="1">普通角色</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="roleForm.roleMemo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="roleDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitRole">保存</el-button>
      </span>
    </el-dialog>

    <el-dialog :title="isEditRoleData ? '编辑数据权限' : '新增数据权限'" :visible.sync="roleDataDialogVisible" width="520px" append-to-body>
      <el-form ref="roleDataForm" :model="roleDataForm" :rules="roleDataRules" label-width="110px" size="mini">
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="roleDataForm.roleId" filterable class="full-width">
            <el-option v-for="role in roleList" :key="role.roleId" :label="role.roleName" :value="role.roleId" />
          </el-select>
        </el-form-item>
        <el-form-item label="数据模型ID" prop="dataModelId">
          <el-input-number v-model="roleDataForm.dataModelId" :min="1" controls-position="right" class="full-width" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="roleDataDialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitRoleData">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'

export default {
  name: 'PermissionManagement',
  data() {
    return {
      activeTab: 'roleData',
      loadingRoles: false,
      loadingRoleData: false,
      roleQuery: {roleName: ''},
      roleDataQuery: {roleName: '', modelName: ''},
      roleList: [],
      roleDataList: [],
      activeRole: null,
      totalRoles: 0,
      roleDataTotal: 0,
      rolePage: {pageNum: 1, pageSize: 100},
      roleDataPage: {pageNum: 1, pageSize: 12},
      roleDialogVisible: false,
      roleDataDialogVisible: false,
      isEditRole: false,
      isEditRoleData: false,
      roleForm: this.getEmptyRoleForm(),
      roleDataForm: this.getEmptyRoleDataForm(),
      roleRules: {roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}]},
      roleDataRules: {
        roleId: [{required: true, message: '请选择角色', trigger: 'change'}],
        dataModelId: [{required: true, message: '请输入数据模型ID', trigger: 'blur'}]
      }
    }
  },
  mounted() {
    this.fetchRoles()
    this.fetchRoleData()
  },
  methods: {
    getEmptyRoleForm() {
      return {roleId: null, roleName: '', roleType: 1, roleMemo: ''}
    },
    getEmptyRoleDataForm() {
      return {roleDataId: null, roleId: null, dataModelId: null}
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    fetchRoles() {
      this.loadingRoles = true
      const req = this.roleQuery.roleName
        ? apiPage('roleInfo', {
          pageNum: this.rolePage.pageNum,
          pageSize: this.rolePage.pageSize,
          params: {...this.roleQuery}
        })
        : request({url: '/rest/roleInfo/roleInfos', method: 'get'})
      req
        .then(res => {
          this.roleList = this.normalizeList(res)
          this.totalRoles = (res.data && res.data.total) || this.roleList.length
          if (!this.activeRole && this.roleList.length) this.selectRole(this.roleList[0])
        })
        .finally(() => {
          this.loadingRoles = false
        })
    },
    fetchRoleData() {
      this.loadingRoleData = true
      const params = {...this.roleDataQuery}
      if (this.activeRole && !params.roleName) params.roleName = this.activeRole.roleName
      apiPage('roleData', {
        pageNum: this.roleDataPage.pageNum,
        pageSize: this.roleDataPage.pageSize,
        params
      })
        .then(res => {
          this.roleDataList = this.normalizeList(res)
          this.roleDataTotal = (res.data && res.data.total) || this.roleDataList.length
        })
        .finally(() => {
          this.loadingRoleData = false
        })
    },
    selectRole(role) {
      this.activeRole = role
      this.roleDataQuery.roleName = role.roleName
      this.roleDataPage.pageNum = 1
      this.fetchRoleData()
    },
    handleTabClick(tab) {
      if (tab.name === 'roleData') this.fetchRoleData()
    },
    resetRoleDataQuery() {
      this.roleDataQuery = {roleName: this.activeRole ? this.activeRole.roleName : '', modelName: ''}
      this.roleDataPage.pageNum = 1
      this.fetchRoleData()
    },
    openRoleDialog(isEdit, row) {
      this.isEditRole = isEdit
      this.roleForm = isEdit && row ? {...row} : this.getEmptyRoleForm()
      this.roleDialogVisible = true
      this.$nextTick(() => this.$refs.roleForm && this.$refs.roleForm.clearValidate())
    },
    submitRole() {
      this.$refs.roleForm.validate(valid => {
        if (!valid) return
        const action = this.isEditRole ? apiUpdate('roleInfo', this.roleForm) : apiAdd('roleInfo', this.roleForm)
        action.then(() => {
          this.$message.success('角色已保存')
          this.roleDialogVisible = false
          this.fetchRoles()
        })
      })
    },
    deleteRole(row) {
      this.$confirm(`确定删除角色 [${row.roleName}] 吗？`, '提示', {type: 'warning'}).then(() => {
        apiDelete('roleInfo', row.roleId).then(() => {
          this.$message.success('删除成功')
          if (this.activeRole && this.activeRole.roleId === row.roleId) this.activeRole = null
          this.fetchRoles()
        })
      })
    },
    openRoleDataDialog(isEdit, row) {
      this.isEditRoleData = isEdit
      this.roleDataForm = isEdit && row
        ? {...row}
        : {...this.getEmptyRoleDataForm(), roleId: this.activeRole && this.activeRole.roleId}
      this.roleDataDialogVisible = true
      this.$nextTick(() => this.$refs.roleDataForm && this.$refs.roleDataForm.clearValidate())
    },
    submitRoleData() {
      this.$refs.roleDataForm.validate(valid => {
        if (!valid) return
        const action = this.isEditRoleData ? apiUpdate('roleData', this.roleDataForm) : apiAdd('roleData', this.roleDataForm)
        action.then(() => {
          this.$message.success('数据权限已保存')
          this.roleDataDialogVisible = false
          this.fetchRoleData()
        })
      })
    },
    deleteRoleData(row) {
      this.$confirm('确定删除该数据权限吗？', '提示', {type: 'warning'}).then(() => {
        apiDelete('roleData', row.roleDataId).then(() => {
          this.$message.success('删除成功')
          this.fetchRoleData()
        })
      })
    },
    roleTypeText(type) {
      return Number(type) === 0 ? '管理员' : '普通角色'
    }
  }
}
</script>

<style scoped>
.permission-page {
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

.role-panel,
.content-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  min-height: 0;
}

.role-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
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

.query-form {
  margin-top: 10px;
}

.role-list {
  flex: 1;
  overflow: auto;
}

.role-item {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid #172438;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  background: #0d1522;
}

.role-item.active {
  border-color: #38bdf8;
  background: #13253e;
}

.role-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.role-info strong,
.role-info span {
  display: block;
}

.role-info strong {
  color: #fff;
  font-size: 13px;
}

.role-info span {
  color: #94a3b8;
  font-size: 12px;
  margin-top: 2px;
}

.role-actions {
  display: flex;
  gap: 8px;
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

.active-card {
  border: 1px solid #16243a;
  background: #0c1424;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 10px;
}

.active-card h3 {
  color: #fff;
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
