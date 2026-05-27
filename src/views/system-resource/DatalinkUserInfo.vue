<template>
  <div class="screen-container">
    <div class="tab-workbench-shell">
      <el-tabs
        v-model="domain"
        class="dark-tabs"
        @tab-click="handleDomainChange"
      >
        <el-tab-pane
          :label="i.label"
          :name="i.name"
          v-for="i in listTab"
          :key="i.label"
        >
          <div class="tab-pane-panel" v-loading="loading">
            <div class="panel-header-summary">
              <span class="title text-cyan">{{ panelTitle }}</span>
              <el-radio-group
                v-model="level"
                size="mini"
                @change="handleLevelChange"
              >
                <el-radio-button label="model">型号</el-radio-button>
                <el-radio-button label="instance">实例信息</el-radio-button>
              </el-radio-group>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="openDialog(false)"
              >
                {{ addButtonText }}
              </el-button>
            </div>

            <div class="filter-action-row">
              <div v-for="field in currentQueryFields" :key="field.key">
                <el-input
                  v-if="field.type === 'input'"
                  v-model="query[field.key]"
                  size="mini"
                  clearable
                  :placeholder="field.placeholder"
                  class="filter-item"
                />
              </div>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-search"
                @click="handleSearch"
              >
                查询
              </el-button>
              <el-button size="mini" icon="el-icon-refresh" @click="resetQuery"
                >重置</el-button
              >
            </div>

            <div class="table-container-flex">
              <el-table
                :data="tableData"
                size="mini"
                height="100%"
                class="dark-dashboard-table"
                stripe
                border
                :key="moduleKey"
              >
                <el-table-column
                  v-for="col in currentColumns"
                  :key="col.prop"
                  :prop="col.prop"
                  :label="col.label"
                  :min-width="col.minWidth || 100"
                  :width="col.width"
                  show-overflow-tooltip
                >
                  <template slot-scope="scope">
                    {{
                      col.mapOptions
                        ? mapLabel(col.mapOptions, scope.row[col.prop])
                        : scope.row[col.prop]
                    }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="120"
                  fixed="right"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      size="mini"
                      @click="openDialog(true, scope.row)"
                    >
                      修改
                    </el-button>
                    <el-button
                      type="text"
                      size="mini"
                      class="text-red"
                      @click="handleDelete(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="pagination-row">
              <el-pagination
                small
                layout="total, prev, pager, next"
                :current-page.sync="page.pageNum"
                :page-size="page.pageSize"
                :total="total"
                @current-change="fetchList"
              />
            </div></div
        ></el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="560px"
      append-to-body
      @closed="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="120px"
        size="mini"
      >
        <!-- 平台型号 -->
        <template v-if="moduleKey === 'platform_model'">
          <el-form-item label="型号标识" prop="PTXHID">
            <el-input-number
              v-model="form.PTXHID"
              :min="0"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="型号名称" prop="PTXHMC">
            <el-input v-model="form.PTXHMC" />
          </el-form-item>
          <el-form-item label="平台类型" prop="PTLX">
            <el-select v-model="form.PTLX" class="full-width">
              <el-option
                v-for="item in ptlxOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="平台分类">
            <el-input v-model="form.PTFLS" placeholder="多个分类逗号分隔" />
          </el-form-item>
        </template>

        <!-- 平台实例 -->
        <template v-else-if="moduleKey === 'platform_instance'">
          <el-form-item label="平台名称" prop="PTMC">
            <el-input v-model="form.PTMC" />
          </el-form-item>
          <el-form-item label="平台型号" prop="PTXHID">
            <el-select v-model="form.PTXHID" filterable class="full-width">
              <el-option
                v-for="item in ptxhOptions"
                :key="pickRowId(item, ['PTXHID', 'ptxhid'])"
                :label="item.PTXHMC || item.ptxhmc"
                :value="pickRowId(item, ['PTXHID', 'ptxhid'])"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="平台ID" prop="PTID">
            <el-input-number v-model="form.PTID" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="数据链ID">
            <el-input-number v-model="form.SJLID" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="平台编识号">
            <el-input-number v-model="form.PTBSH" :min="0" class="full-width" />
          </el-form-item>
        </template>

        <!-- 武器型号 -->
        <template v-else-if="moduleKey === 'weapon_model'">
          <el-form-item label="型号名称" prop="WQXHMC">
            <el-input v-model="form.WQXHMC" />
          </el-form-item>
          <el-form-item label="资源型号" prop="ZYXH">
            <el-input-number v-model="form.ZYXH" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="武器类型" prop="WQLX">
            <el-select v-model="form.WQLX" class="full-width">
              <el-option
                v-for="item in wqlxOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="打击范围(km)">
            <el-input-number
              v-model="form.DJFW"
              :min="0"
              :precision="2"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="打击精度(km)">
            <el-input-number
              v-model="form.DJJD"
              :min="0"
              :precision="2"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="打击成功率">
            <el-input-number
              v-model="form.DJCGL"
              :min="0"
              :max="1"
              :step="0.01"
              :precision="2"
              class="full-width"
            />
          </el-form-item>
        </template>

        <!-- 武器实例 -->
        <template v-else-if="moduleKey === 'weapon_instance'">
          <el-form-item label="平台ID" prop="PTID">
            <el-input-number v-model="form.PTID" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="武器ID" prop="WQID">
            <el-input-number v-model="form.WQID" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="武器名称">
            <el-input v-model="form.WQMC" />
          </el-form-item>
          <el-form-item label="武器型号" prop="ZYXH">
            <el-select v-model="form.ZYXH" filterable class="full-width">
              <el-option
                v-for="item in wqxhOptions"
                :key="pickRowId(item, ['WQXHID', 'wqxhid'])"
                :label="item.WQXHMC || item.wqxhmc"
                :value="pickRowId(item, ['WQXHID', 'wqxhid'])"
              />
            </el-select>
          </el-form-item>
        </template>

        <!-- 传感器型号 -->
        <template v-else-if="moduleKey === 'sensor_model'">
          <el-form-item label="型号名称" prop="CGQXHMC">
            <el-input v-model="form.CGQXHMC" />
          </el-form-item>
          <el-form-item label="资源型号" prop="ZYXH">
            <el-input-number v-model="form.ZYXH" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="传感器类型" prop="CGQLX">
            <el-select v-model="form.CGQLX" class="full-width">
              <el-option
                v-for="item in cgqlxOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="探测范围(km)">
            <el-input-number
              v-model="form.TCFW"
              :min="0"
              :precision="2"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="探测精度(㎡)">
            <el-input-number
              v-model="form.RCS"
              :min="0"
              :precision="2"
              class="full-width"
            />
          </el-form-item>
        </template>

        <!-- 传感器实例 -->
        <template v-else-if="moduleKey === 'sensor_instance'">
          <el-form-item label="平台ID" prop="PTID">
            <el-input-number v-model="form.PTID" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="传感器ID" prop="CGQID">
            <el-input-number v-model="form.CGQID" :min="0" class="full-width" />
          </el-form-item>
          <el-form-item label="传感器名称">
            <el-input v-model="form.CGQMC" />
          </el-form-item>
          <el-form-item label="传感器型号" prop="ZYXH">
            <el-select v-model="form.ZYXH" filterable class="full-width">
              <el-option
                v-for="item in cgqxhOptions"
                :key="pickRowId(item, ['CGQXHID', 'cgqxhid'])"
                :label="item.CGQXHMC || item.cgqxhmc"
                :value="pickRowId(item, ['CGQXHID', 'cgqxhid'])"
              />
            </el-select>
          </el-form-item>
        </template>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitForm"
          >保存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'
import {
  CGQLX_OPTIONS,
  WQLX_OPTIONS,
  getCgqxhInfos,
  getPtxhInfos,
  getPtxhPtlxMap,
  getWqxhInfos,
  normalizeMapOptions
} from '@/api/resourceManagement.js'
import resourcePageMixin from './mixins/resourcePageMixin'

const MODULE_CONFIG = {
  platform_model: {
    baseUrl: 'ptxhInfo',
    idKeys: ['PTXHINFOID', 'ptxhInfoId', 'PTXHID'],
    query: {PTXHMC: ''},
    queryFields: [{key: 'PTXHMC', type: 'input', placeholder: '平台型号名称'}],
    columns: [
      {prop: 'PTXHID', label: '型号ID', width: 80},
      {prop: 'PTXHMC', label: '型号名称', minWidth: 140},
      {prop: 'PTLX', label: '平台类型', width: 110, mapOptions: 'ptlx'},
      {prop: 'PTFLS', label: '平台分类', minWidth: 160},
      {prop: 'opTime', label: '操作时间', minWidth: 150}
    ],
    rules: {
      PTXHID: [{required: true, message: '请输入型号标识', trigger: 'blur'}],
      PTXHMC: [{required: true, message: '请输入型号名称', trigger: 'blur'}],
      PTLX: [{required: true, message: '请选择平台类型', trigger: 'change'}]
    },
    emptyForm: () => ({
      PTXHINFOID: null,
      PTXHID: null,
      PTXHMC: '',
      PTLX: null,
      PTFLS: ''
    })
  },
  platform_instance: {
    baseUrl: 'ptxx',
    idKeys: ['PTXXID', 'ptxxid'],
    query: {PTMC: ''},
    queryFields: [{key: 'PTMC', type: 'input', placeholder: '平台名称'}],
    columns: [
      {prop: 'PTXXID', label: '平台标识', width: 90},
      {prop: 'PTMC', label: '平台名称', minWidth: 130},
      {prop: 'ptxhmc', label: '平台型号', width: 130},
      {prop: 'PTID', label: '平台ID', width: 90},
      {prop: 'PTBSH', label: '编识号', width: 100},
      {prop: 'opTime', label: '操作时间', minWidth: 150}
    ],
    rules: {
      PTMC: [{required: true, message: '请输入平台名称', trigger: 'blur'}],
      PTXHID: [{required: true, message: '请选择平台型号', trigger: 'change'}],
      PTID: [{required: true, message: '请输入平台ID', trigger: 'blur'}]
    },
    emptyForm: () => ({
      PTXXID: null,
      PTMC: '',
      PTXHID: null,
      PTID: null,
      SJLID: null,
      PTBSH: null
    })
  },
  weapon_model: {
    baseUrl: 'wqxhInfo',
    idKeys: ['WQXHID', 'wqxhInfoId'],
    query: {WQXHMC: ''},
    queryFields: [{key: 'WQXHMC', type: 'input', placeholder: '武器型号名称'}],
    columns: [
      {prop: 'WQXHID', label: '型号标识', width: 90},
      {prop: 'WQXHMC', label: '型号名称', minWidth: 160},
      {prop: 'WQLX', label: '武器类型', width: 100, mapOptions: 'wqlx'},
      {prop: 'DJFW', label: '打击范围', width: 90},
      {prop: 'DJJD', label: '打击精度', width: 90},
      {prop: 'DJCGL', label: '成功率', width: 80},
      {prop: 'opTime', label: '操作时间', minWidth: 150}
    ],
    rules: {
      WQXHMC: [{required: true, message: '请输入型号名称', trigger: 'blur'}],
      WQLX: [{required: true, message: '请选择武器类型', trigger: 'change'}]
    },
    emptyForm: () => ({
      WQXHID: null,
      ZYXH: 1,
      WQXHMC: '',
      WQLX: null,
      DJFW: null,
      DJJD: null,
      DJCGL: null
    })
  },
  weapon_instance: {
    baseUrl: 'wqxx',
    idKeys: ['WQXXID', 'wqxxId'],
    query: {PTMC: '', WQXHMC: ''},
    queryFields: [
      {key: 'PTMC', type: 'input', placeholder: '平台名称'},
      {key: 'WQXHMC', type: 'input', placeholder: '武器型号'}
    ],
    columns: [
      {prop: 'WQXXID', label: '武器标识', width: 90},
      {prop: 'WQMC', label: '武器名称', minWidth: 140},
      {prop: 'PTMC', label: '所属平台', width: 120},
      {prop: 'wqxhmc', label: '武器型号', width: 130},
      {prop: 'WQID', label: '武器ID', width: 90},
      {prop: 'opTime', label: '操作时间', minWidth: 150}
    ],
    rules: {
      PTID: [{required: true, message: '请输入平台ID', trigger: 'blur'}],
      WQID: [{required: true, message: '请输入武器ID', trigger: 'blur'}],
      ZYXH: [{required: true, message: '请选择武器型号', trigger: 'change'}]
    },
    emptyForm: () => ({
      WQXXID: null,
      PTID: null,
      WQID: null,
      WQMC: '',
      ZYXH: null
    })
  },
  sensor_model: {
    baseUrl: 'cgqxhInfo',
    idKeys: ['CGQXHID', 'cgqxhInfoId'],
    query: {CGQXHMC: ''},
    queryFields: [
      {key: 'CGQXHMC', type: 'input', placeholder: '传感器型号名称'}
    ],
    columns: [
      {prop: 'CGQXHID', label: '型号标识', width: 90},
      {prop: 'CGQXHMC', label: '型号名称', minWidth: 160},
      {prop: 'CGQLX', label: '传感器类型', width: 110, mapOptions: 'cgqlx'},
      {prop: 'TCFW', label: '探测范围', width: 90},
      {prop: 'RCS', label: '探测精度', width: 90},
      {prop: 'opTime', label: '操作时间', minWidth: 150}
    ],
    rules: {
      CGQXHMC: [{required: true, message: '请输入型号名称', trigger: 'blur'}],
      CGQLX: [{required: true, message: '请选择传感器类型', trigger: 'change'}]
    },
    emptyForm: () => ({
      CGQXHID: null,
      ZYXH: 1,
      CGQXHMC: '',
      CGQLX: null,
      TCFW: null,
      RCS: null
    })
  },
  sensor_instance: {
    baseUrl: 'cgqxx',
    idKeys: ['CGQXXID', 'cgqxxId'],
    query: {PTMC: '', CGQMC: ''},
    queryFields: [
      {key: 'PTMC', type: 'input', placeholder: '平台名称'},
      {key: 'CGQMC', type: 'input', placeholder: '传感器名称'}
    ],
    columns: [
      {prop: 'CGQXXID', label: '传感器标识', width: 100},
      {prop: 'CGQMC', label: '传感器名称', minWidth: 160},
      {prop: 'PTMC', label: '所属平台', width: 120},
      {prop: 'cgqxhmc', label: '传感器型号', width: 140},
      {prop: 'CGQID', label: '传感器ID', width: 100},
      {prop: 'opTime', label: '操作时间', minWidth: 150}
    ],
    rules: {
      PTID: [{required: true, message: '请输入平台ID', trigger: 'blur'}],
      CGQID: [{required: true, message: '请输入传感器ID', trigger: 'blur'}],
      ZYXH: [{required: true, message: '请选择传感器型号', trigger: 'change'}]
    },
    emptyForm: () => ({
      CGQXXID: null,
      PTID: null,
      CGQID: null,
      CGQMC: '',
      ZYXH: null
    })
  }
}

export default {
  name: 'DatalinkUserInfo',
  mixins: [resourcePageMixin],
  data() {
    return {
      listTab: [
        {label: '作战平台', name: 'platform'},
        {label: '武器平台', name: 'weapon'},
        {label: '传感器平台', name: 'sensor'}
      ],
      domain: 'platform',
      level: 'model',
      loading: false,
      tableData: [],
      total: 0,
      page: {pageNum: 1, pageSize: 15},
      query: {},
      form: {},
      dialogVisible: false,
      isEdit: false,
      ptlxOptions: [],
      cgqlxOptions: CGQLX_OPTIONS,
      wqlxOptions: WQLX_OPTIONS,
      ptxhOptions: [],
      wqxhOptions: [],
      cgqxhOptions: []
    }
  },
  computed: {
    moduleKey() {
      return `${this.domain}_${this.level}`
    },
    currentConfig() {
      return MODULE_CONFIG[this.moduleKey] || MODULE_CONFIG.platform_model
    },
    currentColumns() {
      return (this.currentConfig.columns || []).map(col => {
        if (col.mapOptions === 'ptlx') {
          return {...col, mapOptions: this.ptlxOptions}
        }
        if (col.mapOptions === 'wqlx') {
          return {...col, mapOptions: this.wqlxOptions}
        }
        if (col.mapOptions === 'cgqlx') {
          return {...col, mapOptions: this.cgqlxOptions}
        }
        return col
      })
    },
    currentQueryFields() {
      return this.currentConfig.queryFields || []
    },
    formRules() {
      return this.currentConfig.rules || {}
    },
    panelTitle() {
      const domainMap = {platform: '平台', weapon: '武器', sensor: '传感器'}
      const levelMap = {model: '型号', instance: '实例信息'}
      return `数据链${domainMap[this.domain] || ''}${levelMap[this.level] || ''}管理`
    },
    addButtonText() {
      return this.level === 'model' ? '新增型号' : '新增实例'
    },
    dialogTitle() {
      return (
        (this.isEdit ? '修改' : '新增') + this.panelTitle.replace('管理', '')
      )
    }
  },
  mounted() {
    this.initQuery()
    this.loadDictionaries()
    this.fetchList()
  },
  methods: {
    initQuery() {
      const q = {}
      Object.keys(this.currentConfig.query || {}).forEach(key => {
        q[key] = ''
      })
      this.query = q
    },
    handleDomainChange() {
      this.level = 'model'
      this.handleLevelChange()
    },
    handleLevelChange() {
      this.page.pageNum = 1
      this.initQuery()
      this.fetchList()
    },
    loadDictionaries() {
      this.promiseAllHandled(
        [getPtxhPtlxMap(), getPtxhInfos(), getWqxhInfos(), getCgqxhInfos()],
        '型号字典加载失败'
      )
        .then(([ptlxRes, ptxhRes, wqxhRes, cgqxhRes]) => {
          this.ptlxOptions = normalizeMapOptions(ptlxRes)
          this.ptxhOptions = this.normalizeList(ptxhRes)
          this.wqxhOptions = this.normalizeList(wqxhRes)
          this.cgqxhOptions = this.normalizeList(cgqxhRes)
        })
        .catch(() => {
          this.ptlxOptions = []
          this.ptxhOptions = []
          this.wqxhOptions = []
          this.cgqxhOptions = []
        })
    },
    buildQueryParams() {
      const params = {}
      Object.keys(this.query).forEach(key => {
        const val = this.query[key]
        if (val !== '' && val != null) params[key] = val
      })
      return params
    },
    fetchList() {
      this.loading = true
      apiPage(this.currentConfig.baseUrl, {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
        params: this.buildQueryParams()
      })
        .then(res => {
          this.tableData = this.normalizeList(res)
          this.total = (res.data && res.data.total) || this.tableData.length
        })
        .catch(() => {
          this.tableData = []
          this.total = 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch() {
      this.page.pageNum = 1
      this.fetchList()
    },
    resetQuery() {
      this.initQuery()
      this.handleSearch()
    },
    openDialog(isEdit, row = null) {
      this.isEdit = isEdit
      const empty = this.currentConfig.emptyForm()
      if (isEdit && row) {
        this.form = {...empty, ...row}
        const id = this.pickRowId(row, this.currentConfig.idKeys)
        if (this.moduleKey === 'platform_model') {
          this.form.PTXHINFOID = id
        } else if (this.moduleKey === 'platform_instance') {
          this.form.PTXXID = id
        } else if (this.moduleKey === 'weapon_model') {
          this.form.WQXHID = id
        } else if (this.moduleKey === 'weapon_instance') {
          this.form.WQXXID = id
        } else if (this.moduleKey === 'sensor_model') {
          this.form.CGQXHID = id
        } else if (this.moduleKey === 'sensor_instance') {
          this.form.CGQXXID = id
        }
      } else {
        this.form = empty
      }
      this.dialogVisible = true
      this.$nextTick(
        () => this.$refs.formRef && this.$refs.formRef.clearValidate()
      )
    },
    resetForm() {
      this.form = this.currentConfig.emptyForm()
    },
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const action = this.isEdit
          ? apiUpdate(this.currentConfig.baseUrl, this.form)
          : apiAdd(this.currentConfig.baseUrl, this.form)
        action
          .then(() => {
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.fetchList()
            this.loadDictionaries()
          })
          .catch(() => {})
      })
    },
    handleDelete(row) {
      const id = this.pickRowId(row, this.currentConfig.idKeys)
      if (!id) return
      this.$confirm('确定删除该记录吗？', '提示', {type: 'warning'})
        .then(() =>
          apiDelete(this.currentConfig.baseUrl, id).then(() => {
            this.$message.success('删除成功')
            this.fetchList()
            this.loadDictionaries()
          })
        )
        .catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">
@use './styles/resource-screen.scss' as *;

.filter-item {
  width: 160px;
}

.full-width {
  width: 100%;
}
</style>
