<template>
  <div
    class="module-manager"
    style="display: flex; flex-direction: column; height: 100%; min-height: 0"
  >
    <div class="toolbar top-fixed-toolbar" style="flex-shrink: 0">
      <el-form :inline="true" :model="modQuery" size="mini">
        <el-form-item label="模块标题">
          <el-input
            v-model="modQuery.moduleTitle"
            clearable
            placeholder="模糊搜索"
          />
        </el-form-item>
        <el-form-item label="模块编号">
          <el-input
            v-model="modQuery.moduleCode"
            clearable
            placeholder="模糊搜索"
          />
        </el-form-item>
        <el-form-item label="系统模块">
          <el-select v-model="modQuery.moduleName" clearable placeholder="全部">
            <el-option label="体系运营管理" value="体系运营管理" />
            <el-option label="系统运维" value="系统运维管理" />
            <el-option label="资源和数据管理" value="资源和数据管理" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="fetchModules"
            >查询</el-button
          >
          <el-button icon="el-icon-refresh" @click="resetModQuery"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        size="mini"
        icon="el-icon-plus"
        @click="openModDialog(false)"
        >新增模块</el-button
      >
    </div>
    <div style="flex: 1; overflow: hidden">
      <el-table
        :data="modList"
        size="mini"
        stripe
        border
        height="100%"
        class="dark-table"
        v-loading="loadingModTable"
      >
        <el-table-column type="index" label="序号" width="50" align="center" />
        <el-table-column prop="moduleCode" label="模块编号" width="180" />

        <el-table-column
          prop="moduleTitle"
          label="模块标题"
          min-width="130"
          show-overflow-tooltip
        />
        <el-table-column prop="moduleName" label="系统模块" width="120" />
        <el-table-column
          prop="moduleUrl"
          label="前端 path"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column
          prop="frontUrl"
          label="前端组件"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column label="模块配置" width="180" align="center">
          <template slot-scope="{row}">
            <div
              style="
                display: flex;
                gap: 4px;
                flex-wrap: wrap;
                justify-content: center;
              "
            >
              <el-tag
                :type="row.parentModuleId == null ? 'success' : 'warning'"
                size="mini"
                effect="dark"
              >
                {{ row.parentModuleId == null ? '模块' : '子页' }}
              </el-tag>
              <el-tag
                :type="
                  (row.serviceNames || '').split(',')[0] === 'true'
                    ? 'success'
                    : 'danger'
                "
                size="mini"
                effect="dark"
              >
                {{
                  (row.serviceNames || '').split(',')[0] === 'true'
                    ? '授权'
                    : '公开'
                }}
              </el-tag>
              <el-tag
                :type="
                  (row.serviceNames || '').split(',')[1] === 'true'
                    ? 'success'
                    : 'danger'
                "
                size="mini"
                effect="dark"
              >
                {{
                  (row.serviceNames || '').split(',')[1] === 'true'
                    ? '显示'
                    : '隐藏'
                }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="155" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template slot-scope="{row}">
            <el-button type="text" size="mini" @click="openModDialog(true, row)"
              >编辑</el-button
            >
            <el-button
              type="text"
              size="mini"
              style="color: #f56c6c"
              @click="deleteModule(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-pagination
      class="pager"
      small
      layout="total, sizes, prev, pager, next, jumper"
      :total="modTotal"
      :page-size="modPage.pageSize"
      :current-page="modPage.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      @size-change="
        modPage.pageSize = $event
        fetchModules()
      "
      @current-change="
        modPage.pageNum = $event
        fetchModules()
      "
    />

    <el-dialog
      :title="modIsEdit ? '编辑前端模块' : '新增前端模块'"
      :visible.sync="modDialogVisible"
      width="640px"
      append-to-body
    >
      <el-form
        ref="modForm"
        :model="modForm"
        :rules="modRules"
        label-width="120px"
        size="mini"
      >
        <el-form-item label="上级模块">
          <el-cascader
            v-model="modForm.parentModuleId"
            :options="modTreeOptions"
            :props="modCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="系统名称" prop="moduleName">
          <el-select
            v-model="modForm.moduleName"
            clearable
            class="full-width"
            placeholder="请选择所属系统"
          >
            <el-option label="体系运营管理" value="体系运营管理" />
            <el-option label="系统运维" value="系统运维" />
            <el-option label="资源和数据管理" value="资源和数据管理" />
          </el-select>
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="模块编号" prop="moduleCode">
              <el-input
                v-model="modForm.moduleCode"
                placeholder="请输入模块编号"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模块标题" prop="moduleTitle">
              <el-input
                v-model="modForm.moduleTitle"
                placeholder="请输入模块标题"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="前端 path">
          <el-input
            v-model="modForm.moduleUrl"
            placeholder="请输入路由 path，如 /task-decomposition"
          />
        </el-form-item>
        <el-form-item label="前端组件">
          <el-input
            v-model="modForm.frontUrl"
            placeholder="请输入组件路径，如 @/views/xxx/xxx.vue"
          />
        </el-form-item>
        <el-form-item label="模块图标">
          <el-input v-model="modForm.moduleIcon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="8">
            <el-form-item label="需要授权">
              <el-radio-group v-model="modForm.requiresAuth">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="是否显示">
              <el-radio-group v-model="modForm.isVisible">
                <el-radio-button label="true">是</el-radio-button>
                <el-radio-button label="false">否</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="重定向">
          <el-input
            v-model="modForm.redirect"
            placeholder="输入重定向路径，如 /task-decomposition"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="modDialogVisible = false"
          >取消</el-button
        >
        <el-button
          size="mini"
          type="primary"
          :loading="modSaving"
          @click="submitModForm"
          >确认保存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {buildTree} from '@/utils'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'

export default {
  name: 'ModuleManager',
  data() {
    return {
      modQuery: {moduleTitle: '', moduleCode: '', moduleName: ''},
      modList: [],
      modTotal: 0,
      modPage: {pageNum: 1, pageSize: 10},
      loadingModTable: false,
      modDialogVisible: false,
      modIsEdit: false,
      modSaving: false,
      modForm: {
        moduleId: null,
        parentModuleId: null,
        serviceNames: '',
        moduleName: '',
        moduleCode: '',
        moduleTitle: '',

        moduleUrl: '',
        frontUrl: '',
        moduleIcon: '',
        requiresAuth: 'true',
        isVisible: 'true',
        redirect: ''
      },
      modRules: {
        moduleTitle: [
          {required: true, message: '请输入模块标题', trigger: 'blur'}
        ],
        moduleCode: [
          {required: true, message: '请输入模块编号', trigger: 'blur'}
        ]
      },
      modTreeOptions: [],
      modCascaderProps: {
        value: 'moduleId',
        label: 'moduleTitle',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      }
    }
  },
  mounted() {
    this.fetchModules()
    this.loadModTree()
  },
  methods: {
    fetchModules() {
      this.loadingModTable = true
      const params = {...this.modQuery}
      Object.keys(params).forEach(k => {
        if (params[k] === '' || params[k] === null) delete params[k]
      })
      apiPage('moduleInfo', {
        pageNum: this.modPage.pageNum,
        pageSize: this.modPage.pageSize,
        params
      })
        .then(res => {
          this.modList = (res.data && res.data.list) || []
          this.modTotal = (res.data && res.data.total) || 0
        })
        .finally(() => {
          this.loadingModTable = false
        })
    },
    loadModTree() {
      return request({url: '/rest/moduleInfo/moduleInfos', method: 'get'}).then(
        res => {
          const list = (res.data && (res.data.list || res.data)) || []
          this.modTreeOptions = buildTree(list, 'moduleId', 'parentModuleId')
        }
      )
    },
    resetModQuery() {
      this.modQuery = {moduleTitle: '', moduleCode: '', moduleName: ''}
      this.modPage.pageNum = 1
      this.fetchModules()
    },
    async openModDialog(isEdit, row) {
      this.modIsEdit = isEdit
      this.modDialogVisible = true
      if (!this.modTreeOptions.length) {
        await this.loadModTree()
      }
      if (isEdit && row) {
        const configParts = (row.serviceNames || 'true,true,true').split(',')
        this.modForm = {
          ...row,
          parentModuleId:
            row.parentModuleId != null ? String(row.parentModuleId) : null,
          requiresAuth: configParts[1] || 'true',
          isVisible: configParts[2] || 'true',
          redirect: configParts[3] || ''
        }
      } else {
        this.modForm = {
          moduleId: null,
          parentModuleId: null,
          serviceNames: '',
          moduleName: '',
          moduleCode: '',
          moduleTitle: '',

          moduleUrl: '',
          frontUrl: '',
          moduleIcon: '',
          requiresAuth: 'true',
          isVisible: 'true',
          redirect: ''
        }
      }
      this.$nextTick(() => {
        if (this.$refs.modForm) this.$refs.modForm.clearValidate()
      })
    },
    submitModForm() {
      this.$refs.modForm.validate(valid => {
        if (!valid) return
        this.modSaving = true
        const submitData = {
          ...this.modForm,
          serviceNames: `${this.modForm.requiresAuth},${this.modForm.isVisible},${this.modForm.redirect}`
        }
        delete submitData.requiresAuth
        delete submitData.isVisible
        delete submitData.redirect
        const api = this.modIsEdit ? apiUpdate : apiAdd
        api('moduleInfo', submitData)
          .then(() => {
            this.$message.success(this.modIsEdit ? '修改成功' : '新增成功')
            this.modDialogVisible = false
            this.fetchModules()
            this.loadModTree()
          })
          .catch(() => this.$message.error('操作失败'))
          .finally(() => {
            this.modSaving = false
          })
      })
    },
    deleteModule(row) {
      this.$confirm(`确认删除模块"${row.moduleTitle}"?`, '提示', {
        type: 'warning'
      })
        .then(() => apiDelete('moduleInfo', row.moduleId))
        .then(() => {
          this.$message.success('删除成功')
          this.fetchModules()
          this.loadModTree()
        })
        .catch(() => {})
    }
  }
}
</script>

<style scoped>
.module-manager {
  width: 100%;
  height: 100%;
  color: #cbd5e1;
}
.top-fixed-toolbar {
  background: #09101d;
  border: 1px solid #15233c;
  padding: 11px 12px 2px 12px;
  border-radius: 4px;
  margin-bottom: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.pager {
  margin-top: 12px;
  text-align: right;
}
.full-width {
  width: 100%;
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
::v-deep .el-form-item__label {
  color: #94a3b8 !important;
  font-size: 11px;
}
::v-deep .el-radio-button__inner {
  background: #0d1522;
  border-color: #1e3557;
  color: #94a3b8;
  font-size: 10px;
  padding: 4px 8px;
}
::v-deep .el-radio-button__orig-radio:checked + .el-radio-button__inner {
  background: #1a3a5e;
  color: #38bdf8;
  border-color: #38bdf8;
  box-shadow: none;
}
</style>
