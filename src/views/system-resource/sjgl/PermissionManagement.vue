<template>
  <div class="permission-page">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">
          <Icon
            icon="mdi:lock-outline"
            :size="18"
            style="vertical-align: middle; color: #f59e0b"
          />
          用户角色与数据权限管控总线
        </span>
        <span class="header-subtitle"
          >用户管理、角色管理分区隔离，详情独立配置</span
        >
      </div>
      <el-button
        type="info"
        size="mini"
        icon="el-icon-refresh"
        class="action-btn"
        @click="initPage"
      >
        同步权限数据
      </el-button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span>用户总数</span>
        <strong class="font-num text-blue">{{ userTotal }}</strong>
        <small>当前查询命中</small>
      </div>
      <div class="stat-card">
        <span>已绑定用户</span>
        <strong class="font-num text-green">{{ boundUserCount }}</strong>
        <small>存在 roleIds</small>
      </div>
      <div class="stat-card">
        <span>角色总数</span>
        <strong class="font-num text-cyan">{{ roleList.length }}</strong>
        <small>全部角色池</small>
      </div>
      <div class="stat-card">
        <span>管理员角色</span>
        <strong class="font-num text-orange">{{ adminRoleCount }}</strong>
        <small>roleType = 0</small>
      </div>
      <div class="stat-card">
        <span>模块节点</span>
        <strong class="font-num text-blue">{{ moduleNodeCount }}</strong>
        <small>前端模块树</small>
      </div>
      <div class="stat-card">
        <span>数据目录</span>
        <strong class="font-num text-green">{{ dataModelNodeCount }}</strong>
        <small>数据权限树</small>
      </div>
    </div>

    <div class="main-tab-container">
      <el-tabs v-model="activeMainTab" class="dark-tabs fill-tabs">
        <el-tab-pane name="userSection">
          <span slot="label"
            ><Icon
              icon="mdi:account-outline"
              :size="16"
              style="vertical-align: middle; color: #38bdf8"
            />
            用户权限管理</span
          >
          <div class="tab-layout-split user-layout-weight">
            <div class="domain-panel" v-loading="loadingUsers">
              <div class="panel-header-summary">
                <span class="title">用户检索</span>
                <span class="badge font-num text-cyan">{{ userTotal }} 项</span>
              </div>
              <div class="panel-filter-bar">
                <div class="search-item">
                  <label>用户名称</label>
                  <el-input
                    v-model="userQuery.userName"
                    placeholder="搜索用户..."
                    @input="fetchUsers"
                    size="small"
                  />
                </div>
                <div class="search-item">
                  <label>登录账号</label>
                  <el-input
                    v-model="userQuery.userCode"
                    placeholder="账号..."
                    @input="fetchUsers"
                    size="small"
                  />
                </div>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  class="action-btn"
                  @click="openUserDialog(false)"
                >
                  新增用户
                </el-button>
              </div>

              <div class="card-scroll-box column-3-grid">
                <div
                  v-for="user in userList"
                  :key="user.userId"
                  class="user-card"
                  :class="{
                    'is-active': activeUser && activeUser.userId === user.userId
                  }"
                  @click="selectUser(user)"
                >
                  <div class="card-main-line">
                    <span
                      class="card-title ellipsis-text"
                      :title="user.userName"
                    >
                      <Icon
                        icon="mdi:circle-small"
                        :size="14"
                        style="vertical-align: middle; color: #38bdf8"
                      />
                      {{ user.userName || user.userCode }}
                    </span>
                    <span
                      class="status-tag"
                      :class="
                        user.userState === '0' || user.userState === '正常'
                          ? 'tag-active'
                          : 'tag-pending'
                      "
                    >
                      {{ user.userState || '正常' }}
                    </span>
                  </div>
                  <div class="meta-grid">
                    <div>
                      账号:
                      <span class="text-blue font-num">{{
                        user.userCode
                      }}</span>
                    </div>
                    <div>
                      手机:
                      <span class="text-cyan font-num">{{
                        user.userMobile || '-'
                      }}</span>
                    </div>
                    <div class="wide">
                      角色:
                      <span
                        class="text-green ellipsis-text"
                        :title="user.roleNames"
                        >{{ user.roleNames || '未绑定' }}</span
                      >
                    </div>
                  </div>
                  <div class="card-actions">
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-edit"
                      @click.stop="openUserDialog(true, user)"
                      >编辑</el-button
                    >
                    <el-button
                      type="text"
                      size="mini"
                      class="danger-link"
                      icon="el-icon-delete"
                      @click.stop="deleteUser(user)"
                      >删除</el-button
                    >
                  </div>
                </div>
                <el-empty
                  v-if="!userList.length && !loadingUsers"
                  description="暂无用户"
                  style="grid-column: span 3; margin: auto"
                />
              </div>

              <el-pagination
                class="dark-pager"
                small
                layout="prev, pager, next"
                :current-page.sync="userPage.pageNum"
                :page-size="userPage.pageSize"
                :total="userTotal"
                @current-change="fetchUsers"
              />
            </div>

            <div class="detail-panel">
              <div v-if="activeUser" class="pane-content-box">
                <div class="section-toolbar">
                  <div>
                    <span class="section-title">
                      <Icon
                        icon="mdi:star-outline"
                        :size="16"
                        style="vertical-align: middle; color: #f59e0b"
                      />
                      当前用户：{{
                        activeUser.userName || activeUser.userCode
                      }}</span
                    >
                    <p>
                      勾选下方角色卡片，保存后将同步该用户的多角色映射关系。
                    </p>
                  </div>
                  <el-button type="primary" size="mini" @click="saveUserRoles"
                    >保存角色绑定</el-button
                  >
                </div>
                <el-checkbox-group
                  v-model="selectedUserRoleIds"
                  class="check-grid"
                >
                  <el-checkbox
                    v-for="role in roleList"
                    :key="role.roleId"
                    :label="role.roleId"
                  >
                    {{ role.roleName }}
                    <span class="muted"
                      >({{ roleTypeText(role.roleType) }})</span
                    >
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div v-else class="center-empty-tip">
                请在左侧选择一个用户以查看并配置其角色绑定关系
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="roleSection">
          <span slot="label"
            ><Icon
              icon="mdi:puzzle-outline"
              :size="16"
              style="vertical-align: middle; color: #a78bfa"
            />
            角色权限管理</span
          >
          <div class="tab-layout-split default-role-weight">
            <div class="domain-panel" v-loading="loadingRoles">
              <div class="panel-header-summary">
                <span class="title">角色池</span>
                <span class="badge font-num text-cyan"
                  >{{ roleList.length }} 项</span
                >
              </div>
              <div class="panel-filter-bar">
                <div class="search-item flex-search">
                  <label>角色名称</label>
                  <el-input
                    v-model="roleQuery.roleName"
                    placeholder="过滤角色..."
                    @input="fetchRoles"
                    size="small"
                  />
                </div>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  class="action-btn"
                  @click="openRoleDialog(false)"
                >
                  新增角色
                </el-button>
              </div>

              <div class="role-scroll-box">
                <div
                  v-for="role in roleList"
                  :key="role.roleId"
                  class="role-card"
                  :class="{
                    'is-active': activeRole && activeRole.roleId === role.roleId
                  }"
                  @click="selectRole(role)"
                >
                  <div class="role-icon">
                    {{ role.roleType === 0 ? '管' : '角' }}
                  </div>
                  <div class="role-info">
                    <strong>{{ role.roleName }}</strong>
                    <span>{{
                      role.roleMemo || roleTypeText(role.roleType)
                    }}</span>
                  </div>
                  <div class="role-actions">
                    <i
                      class="el-icon-edit text-green"
                      @click.stop="openRoleDialog(true, role)"
                    ></i>
                    <i
                      class="el-icon-delete text-red"
                      @click.stop="deleteRole(role)"
                    ></i>
                  </div>
                </div>
                <el-empty
                  v-if="!roleList.length && !loadingRoles"
                  description="暂无角色"
                />
              </div>
            </div>

            <div class="detail-panel">
              <div v-if="activeRole" class="role-detail-layout">
                <div class="tree-sub-card">
                  <div class="section-toolbar">
                    <div>
                      <span class="section-title">
                        <Icon
                          icon="mdi:satellite-uplink"
                          :size="16"
                          style="vertical-align: middle; color: #38bdf8"
                        />
                        前端功能权限 [{{ activeRole.roleName }}]</span
                      >
                      <small class="muted font-num"
                        >已赋权数: {{ activeModuleCount }}</small
                      >
                    </div>
                    <el-button
                      type="primary"
                      size="mini"
                      @click="saveRoleModules"
                      >保存功能授权</el-button
                    >
                  </div>
                  <div class="tree-wrapper">
                    <el-tree
                      ref="moduleTree"
                      class="dark-tree"
                      :data="moduleTree"
                      :props="moduleProps"
                      node-key="moduleId"
                      show-checkbox
                      default-expand-all
                      :check-strictly="false"
                    />
                  </div>
                </div>

                <div class="tree-sub-card">
                  <div class="section-toolbar">
                    <div>
                      <span class="section-title">
                        <Icon
                          icon="mdi:folder-open-outline"
                          :size="16"
                          style="vertical-align: middle; color: #f59e0b"
                        />
                        数据目录权限 [{{ activeRole.roleName }}]</span
                      >
                      <small class="muted font-num"
                        >已赋权数: {{ activeDataModelCount }}</small
                      >
                    </div>
                    <el-button
                      type="primary"
                      size="mini"
                      @click="saveRoleDataModels"
                      >保存数据授权</el-button
                    >
                  </div>
                  <div class="tree-wrapper">
                    <el-tree
                      ref="dataModelTree"
                      class="dark-tree"
                      :data="dataModelTree"
                      :props="dataModelProps"
                      node-key="dataModelId"
                      show-checkbox
                      default-expand-all
                      :check-strictly="false"
                    />
                  </div>
                </div>
              </div>
              <div v-else class="center-empty-tip">
                请在左侧选择一个角色以查看并配置其功能和数据权限范围
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      :title="isEditUser ? '编辑用户' : '新增用户'"
      :visible.sync="userDialogVisible"
      width="620px"
      append-to-body
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        label-width="95px"
        size="mini"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="登录账号" prop="userCode"
              ><el-input v-model="userForm.userCode"
            /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户姓名" prop="userName"
              ><el-input v-model="userForm.userName"
            /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="手机号"
              ><el-input v-model="userForm.userMobile"
            /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="初始密码"
              :prop="isEditUser ? '' : 'userPassword'"
            >
              <el-input
                v-model="userForm.userPassword"
                show-password
                :placeholder="isEditUser ? '留空则不修改' : '请输入初始密码'"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="绑定角色">
          <el-select
            v-model="userRoleIdsInDialog"
            multiple
            filterable
            class="full-width"
          >
            <el-option
              v-for="role in roleList"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="userDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitUser"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditRole ? '编辑角色' : '新增角色'"
      :visible.sync="roleDialogVisible"
      width="520px"
      append-to-body
    >
      <el-form
        ref="roleForm"
        :model="roleForm"
        :rules="roleRules"
        label-width="90px"
        size="mini"
      >
        <el-form-item label="角色名称" prop="roleName"
          ><el-input v-model="roleForm.roleName"
        /></el-form-item>
        <el-form-item label="角色类型">
          <el-radio-group v-model="roleForm.roleType">
            <el-radio-button :label="0">管理员</el-radio-button>
            <el-radio-button :label="1">普通角色</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注"
          ><el-input v-model="roleForm.roleMemo" type="textarea" :rows="3"
        /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="roleDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitRole"
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
  name: 'PermissionManagement',
  data() {
    return {
      activeMainTab: 'userSection',
      loadingUsers: false,
      loadingRoles: false,
      userList: [],
      roleList: [],
      moduleTree: [],
      dataModelTree: [],
      activeUser: null,
      activeRole: null,
      selectedUserRoleIds: [],
      userRoleIdsInDialog: [],
      userTotal: 0,
      userPage: {pageNum: 1, pageSize: 15}, // 三列布局下单页能承载更多卡片，适度调大每页数量
      userQuery: {userName: '', userCode: '', userMobile: ''},
      roleQuery: {roleName: ''},
      moduleProps: {children: 'children', label: 'moduleTitle'},
      dataModelProps: {children: 'children', label: 'modelName'},
      userDialogVisible: false,
      roleDialogVisible: false,
      isEditUser: false,
      isEditRole: false,
      userForm: this.getEmptyUserForm(),
      roleForm: this.getEmptyRoleForm(),
      userRules: {
        userCode: [
          {required: true, message: '请输入登录账号', trigger: 'blur'}
        ],
        userName: [
          {required: true, message: '请输入用户姓名', trigger: 'blur'}
        ],
        userPassword: [
          {required: true, message: '请输入初始密码', trigger: 'blur'}
        ]
      },
      roleRules: {
        roleName: [{required: true, message: '请输入角色名称', trigger: 'blur'}]
      }
    }
  },
  computed: {
    boundUserCount() {
      return this.userList.filter(
        user => this.toIdArray(user.roleIds).length > 0
      ).length
    },
    adminRoleCount() {
      return this.roleList.filter(role => Number(role.roleType) === 0).length
    },
    moduleNodeCount() {
      return this.countTreeNodes(this.moduleTree)
    },
    dataModelNodeCount() {
      return this.countTreeNodes(this.dataModelTree)
    },
    activeModuleCount() {
      return this.toIdArray(this.activeRole && this.activeRole.moduleIds).length
    },
    activeDataModelCount() {
      return this.toIdArray(this.activeRole && this.activeRole.dataModelIds)
        .length
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.fetchRoles()
      this.fetchUsers()
      this.fetchModuleTree()
      this.fetchDataModelTree()
    },
    getEmptyUserForm() {
      return {
        userId: null,
        userCode: '',
        userName: '',
        userPassword: '',
        userMobile: '',
        roleIds: ''
      }
    },
    getEmptyRoleForm() {
      return {
        roleId: null,
        roleName: '',
        roleType: 1,
        roleMemo: '',
        moduleIds: '',
        dataModelIds: ''
      }
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    toIdArray(value) {
      if (!value) return []
      if (Array.isArray(value)) return value.map(v => Number(v)).filter(Boolean)
      return String(value)
        .split(',')
        .map(v => Number(v))
        .filter(Boolean)
    },
    toIdString(ids) {
      return (ids || []).filter(Boolean).join(',')
    },
    countTreeNodes(nodes) {
      return (nodes || []).reduce(
        (sum, item) => sum + 1 + this.countTreeNodes(item.children),
        0
      )
    },
    buildTree(list, idKey, parentKey) {
      const map = {}
      const roots = []
      ;(list || []).forEach(item => {
        map[item[idKey]] = {...item, children: []}
      })
      Object.keys(map).forEach(key => {
        const item = map[key]
        const parentId = item[parentKey]
        if (parentId && map[parentId]) {
          map[parentId].children.push(item)
        } else {
          roots.push(item)
        }
      })
      return roots
    },
    fetchUsers() {
      this.loadingUsers = true
      apiPage('userInfo', {
        pageNum: this.userPage.pageNum,
        pageSize: this.userPage.pageSize,
        params: {...this.userQuery}
      })
        .then(res => {
          this.userList = this.normalizeList(res)
          this.userTotal = (res.data && res.data.total) || this.userList.length
          if (!this.activeUser && this.userList.length)
            this.selectUser(this.userList[0])
        })
        .finally(() => {
          this.loadingUsers = false
        })
    },
    fetchRoles() {
      this.loadingRoles = true
      const req = this.roleQuery.roleName
        ? apiPage('roleInfo', {
            pageNum: 1,
            pageSize: 200,
            params: {...this.roleQuery}
          })
        : request({url: '/rest/roleInfo/roleInfos', method: 'get'})
      req
        .then(res => {
          this.roleList = this.normalizeList(res)
          if (!this.activeRole && this.roleList.length)
            this.selectRole(this.roleList[0])
        })
        .finally(() => {
          this.loadingRoles = false
        })
    },
    fetchModuleTree() {
      request({url: '/rest/moduleInfo/moduleInfos', method: 'get'}).then(
        res => {
          const list = this.normalizeList(res)
          this.moduleTree = this.buildTree(list, 'moduleId', 'parentModuleId')
          this.$nextTick(this.syncRoleCheckedTrees)
        }
      )
    },
    fetchDataModelTree() {
      request({url: '/rest/dataModel/findTree', method: 'get'}).then(res => {
        this.dataModelTree = this.normalizeList(res)
        this.$nextTick(this.syncRoleCheckedTrees)
      })
    },
    selectUser(user) {
      this.activeUser = user
      this.selectedUserRoleIds = this.toIdArray(user.roleIds)
    },
    selectRole(role) {
      this.activeRole = {...role}
      request({url: `/rest/roleInfo/${role.roleId}`, method: 'get'}).then(
        res => {
          this.activeRole = res.data || role
          this.syncRoleCheckedTrees()
        }
      )
    },
    syncRoleCheckedTrees() {
      if (!this.activeRole) return
      const moduleIds = this.toIdArray(this.activeRole.moduleIds)
      const dataModelIds = this.toIdArray(this.activeRole.dataModelIds)
      this.$nextTick(() => {
        if (this.$refs.moduleTree)
          this.$refs.moduleTree.setCheckedKeys(moduleIds)
        if (this.$refs.dataModelTree)
          this.$refs.dataModelTree.setCheckedKeys(dataModelIds)
      })
    },
    openUserDialog(isEdit, row) {
      this.isEditUser = isEdit
      this.userForm =
        isEdit && row ? {...row, userPassword: ''} : this.getEmptyUserForm()
      this.userRoleIdsInDialog = this.toIdArray(
        isEdit && row ? row.roleIds : ''
      )
      this.userDialogVisible = true
      this.$nextTick(
        () => this.$refs.userForm && this.$refs.userForm.clearValidate()
      )
    },
    submitUser() {
      this.$refs.userForm.validate(valid => {
        if (!valid) return
        const payload = {
          ...this.userForm,
          roleIds: this.toIdString(this.userRoleIdsInDialog)
        }
        if (this.isEditUser && !payload.userPassword)
          delete payload.userPassword
        const action = this.isEditUser
          ? apiUpdate('userInfo', payload)
          : apiAdd('userInfo', payload)
        action.then(() => {
          this.$message.success('用户已保存')
          this.userDialogVisible = false
          this.fetchUsers()
        })
      })
    },
    deleteUser(row) {
      this.$confirm(
        `确定删除用户 [${row.userName || row.userCode}] 吗？`,
        '提示',
        {type: 'warning'}
      ).then(() => {
        apiDelete('userInfo', row.userId).then(() => {
          this.$message.success('删除成功')
          if (this.activeUser && this.activeUser.userId === row.userId)
            this.activeUser = null
          this.fetchUsers()
        })
      })
    },
    saveUserRoles() {
      if (!this.activeUser) return
      const payload = {
        ...this.activeUser,
        roleIds: this.toIdString(this.selectedUserRoleIds)
      }
      apiUpdate('userInfo', payload).then(() => {
        this.$message.success('用户角色绑定已保存')
        this.fetchUsers()
      })
    },
    openRoleDialog(isEdit, row) {
      this.isEditRole = isEdit
      this.roleForm = isEdit && row ? {...row} : this.getEmptyRoleForm()
      this.roleDialogVisible = true
      this.$nextTick(
        () => this.$refs.roleForm && this.$refs.roleForm.clearValidate()
      )
    },
    submitRole() {
      this.$refs.roleForm.validate(valid => {
        if (!valid) return
        const action = this.isEditRole
          ? apiUpdate('roleInfo', this.roleForm)
          : apiAdd('roleInfo', this.roleForm)
        action.then(() => {
          this.$message.success('角色已保存')
          this.roleDialogVisible = false
          this.fetchRoles()
        })
      })
    },
    deleteRole(row) {
      this.$confirm(`确定删除角色 [${row.roleName}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('roleInfo', row.roleId).then(() => {
          this.$message.success('删除成功')
          if (this.activeRole && this.activeRole.roleId === row.roleId)
            this.activeRole = null
          this.fetchRoles()
        })
      })
    },
    getTreeCheckedIds(refName) {
      const tree = this.$refs[refName]
      if (!tree) return []
      return tree
        .getCheckedKeys()
        .concat(tree.getHalfCheckedKeys())
        .filter(Boolean)
    },
    saveRoleModules() {
      if (!this.activeRole) return
      const ids = this.toIdString(this.getTreeCheckedIds('moduleTree')) || '0'
      request({
        url: `/rest/roleInfo/rolePrivs/${this.activeRole.roleId}/${ids}`,
        method: 'post'
      }).then(() => {
        this.$message.success('角色模块权限已保存')
        this.selectRole(this.activeRole)
      })
    },
    saveRoleDataModels() {
      if (!this.activeRole) return
      const ids =
        this.toIdString(this.getTreeCheckedIds('dataModelTree')) || '0'
      request({
        url: `/rest/roleInfo/roleDatas/${this.activeRole.roleId}/${ids}`,
        method: 'post'
      }).then(() => {
        this.$message.success('角色数据权限已保存')
        this.selectRole(this.activeRole)
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
.search-item,
.panel-header-summary,
.panel-filter-bar,
.section-toolbar,
.stats-grid {
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
.search-item label,
.stat-card span,
.stat-card small {
  color: #52637a;
  font-size: 11px;
}

.stats-grid {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 12px;
}

.stat-card,
.domain-panel,
.detail-panel,
.tree-sub-card {
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

/* 核心区域 Tab 外部承载框架 */
.main-tab-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* Tab 下默认布局分流框架 */
.tab-layout-split {
  display: grid;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

/* 需求点：用户区域整体占据 2/3 比例权重分配 */
.user-layout-weight {
  grid-template-columns: 2fr 1fr; /* 左侧区域占 2/3，右侧详情占 1/3 */
}

/* 角色区域默认分流权重分配 */
.default-role-weight {
  grid-template-columns: minmax(360px, 1fr) minmax(400px, 2.2fr);
}

.domain-panel {
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.detail-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #050b14;
}

/* 需求点：用户区域内，卡片排列升级为 3 列 Grid 弹性排布 */
.column-3-grid {
  display: grid !important;
  grid-template-columns: repeat(3, minmax(200px, 1fr)); /* 三列平分空间 */
  gap: 10px;
  align-content: flex-start;
  padding-right: 4px;
}

/* 角色双树在详情面板中横向平铺布局 */
.role-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.tree-sub-card {
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #080e18;
}

.tree-wrapper {
  flex: 1;
  overflow-y: auto;
  margin-top: 6px;
}

.panel-header-summary {
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

.panel-header-summary .badge {
  font-size: 10px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}

.panel-filter-bar {
  margin-bottom: 8px;
  flex-shrink: 0;
}

.search-item {
  gap: 6px;
}

.flex-search {
  flex: 1;
}

.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
  color: #fff;
}

.card-scroll-box,
.role-scroll-box {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.role-scroll-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
}

.role-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-card.is-active,
.role-card.is-active {
  border-color: #38bdf8;
  background: #13253e;
}

.card-main-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

.status-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
}

.tag-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.tag-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

/* 3 列模式下由于卡片变窄，元数据一律改为单列纵向铺开，防止文字挤压层叠 */
.meta-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 4px;
  margin-top: 8px;
  font-size: 11px;
  color: #94a3b8;
}

.meta-grid .wide {
  grid-column: 1;
}

.card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  border-top: 1px solid #172438;
  padding-top: 4px;
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
  flex-shrink: 0;
}

.role-info {
  min-width: 0;
  flex: 1;
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

::v-deep .fill-tabs .el-tab-pane {
  height: 100%;
  display: flex;
  flex-direction: column;
}

::v-deep .dark-tabs .el-tabs__header {
  margin-bottom: 12px;
  border-bottom: 1px solid #17263d !important;
  background: transparent;
}

::v-deep .dark-tabs .el-tabs__nav-wrap::after {
  display: none !important;
}

::v-deep .dark-tabs .el-tabs__item {
  color: #64748b;
  font-size: 13px;
  font-weight: bold;
  height: 38px;
  line-height: 38px;
}

::v-deep .dark-tabs .el-tabs__item.is-active {
  color: #38bdf8 !important;
}

::v-deep .dark-tabs .el-tabs__active-bar {
  background-color: #38bdf8;
}

.pane-content-box {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.section-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0c1424;
  border: 1px solid #16243a;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.section-title {
  display: block;
  color: #fff;
  font-size: 13px;
  font-weight: bold;
}

.section-toolbar p {
  margin: 4px 0 0;
  color: #52637a;
  font-size: 11px;
}

.check-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.dark-tree {
  background: transparent;
  color: #cbd5e1;
}

.dark-pager {
  margin-top: 8px;
  text-align: center;
  flex-shrink: 0;
}

.center-empty-tip {
  margin: auto;
  color: #52637a;
  font-size: 12px;
  text-align: center;
}

.muted {
  color: #64748b;
  font-size: 11px;
}

/* font-num */

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

.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.full-width {
  width: 100%;
}
</style>
