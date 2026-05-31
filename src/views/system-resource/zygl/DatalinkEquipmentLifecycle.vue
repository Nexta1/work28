<template>
  <div class="screen-container">
    <el-tabs v-model="activeTab" class="fill-tabs dark-tabs tab-workbench">
      <el-tab-pane label="装备信息" name="sbxx">
        <div class="tab-pane-body" v-loading="loading.sbxx">
          <div class="panel-header-summary">
            <span class="title text-cyan">装备信息</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openSbxxDialog(false)"
            >
              新增装备
            </el-button>
          </div>
          <div class="filter-action-row">
            <el-select
              v-model="sbxxQuery.PTID"
              size="mini"
              clearable
              placeholder="平台ID"
              class="filter-item"
            >
              <el-option
                v-for="item in ptxxOptions"
                :key="item.PTXXID || item.ptxxid"
                :label="item.PTMC || item.ptmc"
                :value="pickRowId(item, ['PTXXID', 'ptxxid'])"
              />
            </el-select>
            <el-input
              v-model="sbxxQuery.SBMC"
              size="mini"
              clearable
              placeholder="装备名称"
              class="filter-item"
            />
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="searchSbxx"
            >
              查询
            </el-button>
          </div>
          <div class="table-container-flex">
            <el-table
              :data="sbxxList"
              size="mini"
              height="100%"
              class="dark-dashboard-table"
              stripe
              border
            >
              <el-table-column prop="SBXXID" label="装备标识" width="90" />
              <el-table-column prop="SBMC" label="装备名称" min-width="140" />
              <el-table-column prop="PTMC" label="所属平台" width="120" />
              <el-table-column
                prop="SBID"
                label="装备ID"
                width="110"
                class-name="font-num"
              />
              <el-table-column prop="SBXHMC" label="装备型号" width="130" />
              <el-table-column prop="SBLX" label="装备类型" width="100" />
              <el-table-column prop="opTime" label="操作时间" min-width="150" />
              <el-table-column
                label="操作"
                width="150"
                fixed="right"
                align="center"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-edit"
                    @click="openSbxxDialog(true, scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-delete"
                    class="text-red"
                    @click="deleteSbxx(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pagination-row">
            <el-pagination
              small
              layout="total, prev, pager, next"
              :current-page.sync="sbxxPage.pageNum"
              :page-size="sbxxPage.pageSize"
              :total="sbxxTotal"
              @current-change="fetchSbxx"
            />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="装备型号" name="sbxh">
        <div class="tab-pane-body" v-loading="loading.sbxh">
          <div class="panel-header-summary">
            <span class="title text-cyan">装备型号</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openSbxhDialog(false)"
            >
              新增型号
            </el-button>
          </div>
          <div class="filter-action-row">
            <el-input
              v-model="sbxhQuery.SBXHMC"
              size="mini"
              clearable
              placeholder="型号名称"
              class="filter-item"
            />
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="searchSbxh"
            >
              查询
            </el-button>
          </div>
          <div class="table-container-flex">
            <el-table
              :data="sbxhList"
              size="mini"
              height="100%"
              class="dark-dashboard-table"
              stripe
              border
            >
              <el-table-column prop="SBXHID" label="型号标识" width="90" />
              <el-table-column prop="SBXHMC" label="型号名称" min-width="160" />
              <el-table-column prop="SBLX" label="装备类型" width="120" />
              <el-table-column
                prop="ZYXH"
                label="资源型号"
                width="100"
                class-name="font-num"
              />
              <el-table-column prop="opTime" label="操作时间" min-width="150" />
              <el-table-column
                label="操作"
                width="150"
                fixed="right"
                align="center"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-edit"
                    @click="openSbxhDialog(true, scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-delete"
                    class="text-red"
                    @click="deleteSbxh(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pagination-row">
            <el-pagination
              small
              layout="total, prev, pager, next"
              :current-page.sync="sbxhPage.pageNum"
              :page-size="sbxhPage.pageSize"
              :total="sbxhTotal"
              @current-change="fetchSbxh"
            />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="装备入退网" name="network">
        <div class="tab-pane-body" v-loading="loading.network">
          <div class="panel-header-summary">
            <span class="title text-cyan">装备入退网监测</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openNetworkDialog(false)"
            >
              新增记录
            </el-button>
          </div>
          <div class="filter-action-row">
            <el-select
              v-model="networkQuery.SBWLZT"
              size="mini"
              clearable
              placeholder="入退网状态"
              class="filter-item"
            >
              <el-option label="入网" :value="1" />
              <el-option label="退网" :value="2" />
            </el-select>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="searchNetwork"
            >
              查询
            </el-button>
          </div>
          <div class="table-container-flex">
            <el-table
              :data="networkList"
              size="mini"
              height="100%"
              class="dark-dashboard-table"
              stripe
              border
            >
              <el-table-column prop="SBMC" label="设备名称" min-width="130" />
              <el-table-column
                prop="SBID"
                label="设备ID"
                width="90"
                class-name="font-num"
              />
              <el-table-column prop="WLMC" label="网络名称" width="120" />
              <el-table-column
                prop="WLH"
                label="网络号"
                width="90"
                class-name="font-num"
              />
              <el-table-column prop="RWSJ" label="入网时间" min-width="150" />
              <el-table-column prop="TWSJ" label="退网时间" min-width="150" />
              <el-table-column
                prop="SBWLZT"
                label="状态"
                width="70"
                :formatter="
                  (_, __, v) => (v === 1 ? '入网' : v === 2 ? '退网' : '-')
                "
              />
              <el-table-column
                label="操作"
                width="150"
                fixed="right"
                align="center"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-edit"
                    @click="openNetworkDialog(true, scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-delete"
                    class="text-red"
                    @click="deleteNetwork(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="pagination-row">
            <el-pagination
              small
              layout="total, prev, pager, next"
              :current-page.sync="networkPage.pageNum"
              :page-size="networkPage.pageSize"
              :total="networkTotal"
              @current-change="fetchNetwork"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      :title="sbxxEdit ? '修改装备信息' : '新增装备信息'"
      :visible.sync="sbxxDialogVisible"
      width="520px"
      append-to-body
    >
      <el-form
        ref="sbxxFormRef"
        :model="sbxxForm"
        :rules="sbxxRules"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="所属平台" prop="PTID">
          <el-select
            v-model="sbxxForm.PTID"
            filterable
            class="full-width"
            placeholder="选择平台"
          >
            <el-option
              v-for="item in ptxxOptions"
              :key="item.PTXXID || item.ptxxid"
              :label="item.PTMC || item.ptmc"
              :value="pickRowId(item, ['PTXXID', 'ptxxid'])"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="装备ID" prop="SBID">
          <el-input-number
            v-model="sbxxForm.SBID"
            :min="0"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="装备名称" prop="SBMC">
          <el-input v-model="sbxxForm.SBMC" />
        </el-form-item>
        <el-form-item label="装备型号" prop="ZYXH">
          <el-select
            v-model="sbxxForm.ZYXH"
            filterable
            class="full-width"
            placeholder="选择资源型号"
          >
            <el-option
              v-for="item in sbxhListAll"
              :key="item.ZYXH"
              :label="item.SBXHMC || item.sbxhmc"
              :value="item.ZYXH"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="sbxxDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitSbxx"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="sbxhEdit ? '修改装备型号' : '新增装备型号'"
      :visible.sync="sbxhDialogVisible"
      width="480px"
      append-to-body
    >
      <el-form
        ref="sbxhFormRef"
        :model="sbxhForm"
        :rules="sbxhRules"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="型号名称" prop="SBXHMC">
          <el-input v-model="sbxhForm.SBXHMC" />
        </el-form-item>
        <el-form-item label="装备类型" prop="SBLX">
          <el-input v-model="sbxhForm.SBLX" />
        </el-form-item>
        <el-form-item label="资源型号" prop="ZYXH">
          <el-input-number
            v-model="sbxhForm.ZYXH"
            :min="0"
            class="full-width"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="sbxhDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitSbxh"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="networkEdit ? '修改入退网记录' : '新增入退网记录'"
      :visible.sync="networkDialogVisible"
      width="480px"
      append-to-body
    >
      <el-form
        ref="networkFormRef"
        :model="networkForm"
        :rules="networkRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="设备ID" prop="SBID">
          <el-input-number
            v-model="networkForm.SBID"
            :min="0"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="网络号" prop="WLH">
          <el-input-number
            v-model="networkForm.WLH"
            :min="0"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="入网时间" prop="RWSJ">
          <el-date-picker
            v-model="networkForm.RWSJ"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="退网时间" prop="TWSJ">
          <el-date-picker
            v-model="networkForm.TWSJ"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="状态" prop="SBWLZT">
          <el-select v-model="networkForm.SBWLZT" class="full-width">
            <el-option label="入网" :value="1" />
            <el-option label="退网" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="networkDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitNetwork"
          >保存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'
import resourcePageMixin from '../mixins/resourcePageMixin'

export default {
  name: 'DatalinkEquipmentLifecycle',
  mixins: [resourcePageMixin],
  data() {
    return {
      activeTab: 'sbxx',
      loading: {sbxx: false, sbxh: false, network: false},
      ptxxOptions: [],
      sbxxList: [],
      sbxxTotal: 0,
      sbxxPage: {pageNum: 1, pageSize: 15},
      sbxxQuery: {PTID: null, SBMC: ''},
      sbxxDialogVisible: false,
      sbxxEdit: false,
      sbxxForm: {SBXXID: null, PTID: null, SBID: null, SBMC: '', ZYXH: null},
      sbxxRules: {
        PTID: [{required: true, message: '请输入平台ID', trigger: 'blur'}],
        SBID: [{required: true, message: '请输入装备ID', trigger: 'blur'}],
        SBMC: [{required: true, message: '请输入装备名称', trigger: 'blur'}]
      },
      sbxhList: [],
      sbxhListAll: [],
      sbxhTotal: 0,
      sbxhPage: {pageNum: 1, pageSize: 15},
      sbxhQuery: {SBXHMC: ''},
      sbxhDialogVisible: false,
      sbxhEdit: false,
      sbxhForm: {SBXHID: null, SBXHMC: '', SBLX: '', ZYXH: 1},
      sbxhRules: {
        SBXHMC: [{required: true, message: '请输入型号名称', trigger: 'blur'}]
      },
      networkList: [],
      networkTotal: 0,
      networkPage: {pageNum: 1, pageSize: 15},
      networkQuery: {SBWLZT: null},
      networkDialogVisible: false,
      networkEdit: false,
      networkForm: {
        SBWLID: null,
        SBID: null,
        WLH: null,
        RWSJ: null,
        TWSJ: null,
        SBWLZT: 1
      },
      networkRules: {
        SBID: [{required: true, message: '请输入设备ID', trigger: 'blur'}],
        WLH: [{required: true, message: '请输入网络号', trigger: 'blur'}],
        SBWLZT: [{required: true, message: '请选择状态', trigger: 'change'}]
      }
    }
  },
  mounted() {
    this.loadPtxx()
    this.fetchSbxx()
    this.fetchSbxh()
    this.loadSbxhAll()
  },
  watch: {
    activeTab(val) {
      if (val === 'network' && !this.networkList.length) this.fetchNetwork()
    }
  },
  methods: {
    loadPtxx() {
      request({url: '/rest/ptxx/ptxxs', method: 'get'})
        .then(res => {
          this.ptxxOptions = this.normalizeList(res)
        })
        .catch(() => {})
    },
    loadSbxhAll() {
      request({url: '/rest/sbxhInfo/sbxhInfos', method: 'get'}).then(res => {
        this.sbxhListAll = this.normalizeList(res)
      })
    },
    fetchSbxx() {
      this.loading.sbxx = true
      const params = {}
      if (this.sbxxQuery.PTID != null) params.PTID = this.sbxxQuery.PTID
      if (this.sbxxQuery.SBMC) params.SBMC = this.sbxxQuery.SBMC
      apiPage('sbxx', {
        pageNum: this.sbxxPage.pageNum,
        pageSize: this.sbxxPage.pageSize,
        params
      })
        .then(res => {
          this.sbxxList = this.normalizeList(res)
          this.sbxxTotal = (res.data && res.data.total) || this.sbxxList.length
        })
        .catch(() => {})
        .finally(() => {
          this.loading.sbxx = false
        })
    },
    searchSbxx() {
      this.sbxxPage.pageNum = 1
      this.fetchSbxx()
    },
    openSbxxDialog(isEdit, row = null) {
      this.sbxxEdit = isEdit
      this.sbxxForm =
        isEdit && row
          ? {
              SBXXID: this.pickRowId(row, ['SBXXID', 'sbxxid']),
              PTID: row.PTID,
              SBID: row.SBID,
              SBMC: row.SBMC,
              ZYXH: row.ZYXH
            }
          : {SBXXID: null, PTID: null, SBID: null, SBMC: '', ZYXH: null}
      this.sbxxDialogVisible = true
      this.$nextTick(
        () => this.$refs.sbxxFormRef && this.$refs.sbxxFormRef.clearValidate()
      )
    },
    submitSbxx() {
      this.$refs.sbxxFormRef.validate(valid => {
        if (!valid) return
        const action = this.sbxxEdit
          ? apiUpdate('sbxx', this.sbxxForm)
          : apiAdd('sbxx', this.sbxxForm)
        action
          .then(() => {
            this.$message.success('装备信息已保存')
            this.sbxxDialogVisible = false
            this.fetchSbxx()
          })
          .catch(() => {})
      })
    },
    deleteSbxx(row) {
      const id = this.pickRowId(row, ['SBXXID', 'sbxxid'])
      this.$confirm('确定删除该装备信息吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('sbxx', id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchSbxx()
            })
            .catch(() => {})
        }
      )
    },
    fetchSbxh() {
      this.loading.sbxh = true
      apiPage('sbxhInfo', {
        pageNum: this.sbxhPage.pageNum,
        pageSize: this.sbxhPage.pageSize,
        params: {SBXHMC: this.sbxhQuery.SBXHMC || undefined}
      })
        .then(res => {
          this.sbxhList = this.normalizeList(res)
          this.sbxhTotal = (res.data && res.data.total) || this.sbxhList.length
        })
        .catch(() => {})
        .finally(() => {
          this.loading.sbxh = false
        })
    },
    searchSbxh() {
      this.sbxhPage.pageNum = 1
      this.fetchSbxh()
    },
    openSbxhDialog(isEdit, row = null) {
      this.sbxhEdit = isEdit
      this.sbxhForm =
        isEdit && row
          ? {
              SBXHID: this.pickRowId(row, ['SBXHID', 'sbxhid']),
              SBXHMC: row.SBXHMC,
              SBLX: row.SBLX,
              ZYXH: row.ZYXH
            }
          : {SBXHID: null, SBXHMC: '', SBLX: '', ZYXH: 1}
      this.sbxhDialogVisible = true
      this.$nextTick(
        () => this.$refs.sbxhFormRef && this.$refs.sbxhFormRef.clearValidate()
      )
    },
    submitSbxh() {
      this.$refs.sbxhFormRef.validate(valid => {
        if (!valid) return
        const action = this.sbxhEdit
          ? apiUpdate('sbxhInfo', this.sbxhForm)
          : apiAdd('sbxhInfo', this.sbxhForm)
        action
          .then(() => {
            this.$message.success('装备型号已保存')
            this.sbxhDialogVisible = false
            this.fetchSbxh()
            this.loadSbxhAll()
          })
          .catch(() => {})
      })
    },
    deleteSbxh(row) {
      const id = this.pickRowId(row, ['SBXHID', 'sbxhInfoId', 'sbxhid'])
      this.$confirm('确定删除该装备型号吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('sbxhInfo', id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchSbxh()
              this.loadSbxhAll()
            })
            .catch(() => {})
        }
      )
    },
    fetchNetwork() {
      this.loading.network = true
      const params = {}
      if (this.networkQuery.SBWLZT != null)
        params.SBWLZT = this.networkQuery.SBWLZT
      apiPage('sbwl', {
        pageNum: this.networkPage.pageNum,
        pageSize: this.networkPage.pageSize,
        params
      })
        .then(res => {
          this.networkList = this.normalizeList(res)
          this.networkTotal =
            (res.data && res.data.total) || this.networkList.length
        })
        .catch(() => {})
        .finally(() => {
          this.loading.network = false
        })
    },
    searchNetwork() {
      this.networkPage.pageNum = 1
      this.fetchNetwork()
    },
    openNetworkDialog(isEdit, row = null) {
      this.networkEdit = isEdit
      this.networkForm =
        isEdit && row
          ? {
              SBWLID: this.pickRowId(row, ['SBWLID', 'sbwlid']),
              SBID: row.SBID,
              WLH: row.WLH,
              RWSJ: row.RWSJ,
              TWSJ: row.TWSJ,
              SBWLZT: row.SBWLZT
            }
          : {
              SBWLID: null,
              SBID: null,
              WLH: null,
              RWSJ: null,
              TWSJ: null,
              SBWLZT: 1
            }
      this.networkDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.networkFormRef && this.$refs.networkFormRef.clearValidate()
      )
    },
    submitNetwork() {
      this.$refs.networkFormRef.validate(valid => {
        if (!valid) return
        const action = this.networkEdit
          ? apiUpdate('sbwl', this.networkForm)
          : apiAdd('sbwl', this.networkForm)
        action
          .then(() => {
            this.$message.success('入退网记录已保存')
            this.networkDialogVisible = false
            this.fetchNetwork()
          })
          .catch(() => {})
      })
    },
    deleteNetwork(row) {
      const id = this.pickRowId(row, ['SBWLID', 'sbwlid'])
      this.$confirm('确定删除该入退网记录吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('sbwl', id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchNetwork()
            })
            .catch(() => {})
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
@use '../styles/resource-screen.scss' as *;

.filter-item {
  width: 160px;
}
.filter-item-num {
  width: 140px;
}
.full-width {
  width: 100%;
}
.text-red {
  color: #f56c6c !important;
}

::v-deep .tab-workbench.el-tabs {
  display: flex;
  flex-direction: column;
}

::v-deep .tab-workbench > .el-tabs__header {
  flex-shrink: 0;
  margin-bottom: 10px;
}

::v-deep .tab-workbench > .el-tabs__content {
  flex: 1;
  min-height: 0;
}

::v-deep .tab-workbench .el-tab-pane {
  height: 100%;
}

::v-deep .dark-tabs .el-tabs__item.is-active {
  color: #38bdf8 !important;
}

::v-deep .dark-tabs .el-tabs__nav-wrap::after {
  background-color: #17263d;
}
</style>
