<template>
  <div class="screen-container">
    <div class="main-panel" v-loading="loading">
      <div class="panel-header-summary">
        <span class="title text-cyan">数据链频谱资源管理</span>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="openDialog(false)"
        >
          新增频谱
        </el-button>
      </div>

      <div class="filter-action-row">
        <el-select
          v-model="query.WLNM"
          size="mini"
          clearable
          placeholder="网络内码"
          class="filter-item"
        >
          <el-option
            v-for="item in wlnmOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-select
          v-model="query.WLLX"
          size="mini"
          clearable
          placeholder="网络类型"
          class="filter-item"
        >
          <el-option
            v-for="item in wllxOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="handleSearch"
        >
          查询
        </el-button>
        <el-button size="mini" icon="el-icon-refresh" @click="resetQuery">
          重置
        </el-button>
      </div>

      <div class="table-container-flex">
        <el-table
          :data="tableData"
          size="mini"
          height="100%"
          class="dark-dashboard-table"
          stripe
          border
        >
          <el-table-column prop="frequencyId" label="标识" width="70" />
          <el-table-column prop="WLMC" label="网络名称" min-width="140" />
          <el-table-column
            prop="WLH"
            label="网络号"
            width="100"
            class-name="font-num"
          />
          <el-table-column prop="WLNMMC" label="网络内码" width="120" />
          <el-table-column prop="WLLXMC" label="网络类型" width="140" />
          <el-table-column prop="startFrequency" label="起始频率" width="100" />
          <el-table-column prop="endFrequency" label="终止频率" width="100" />
          <el-table-column prop="opUserName" label="操作人" width="90" />
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
                @click="openDialog(true, scope.row)"
              >
                修改
              </el-button>
              <el-button
                type="text"
                size="mini"
                icon="el-icon-delete"
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
      </div>
    </div>

    <el-dialog
      :title="isEdit ? '修改频谱信息' : '新增频谱信息'"
      :visible.sync="dialogVisible"
      width="520px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="111px"
        size="mini"
      >
        <el-form-item label="网络号" prop="WLH">
          <el-input-number v-model="form.WLH" :min="0" class="full-width" />
        </el-form-item>
        <el-form-item label="网络内码" prop="WLNM">
          <el-select v-model="form.WLNM" filterable class="full-width">
            <el-option
              v-for="item in wlnmOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="网络类型" prop="WLLX">
          <el-select v-model="form.WLLX" filterable class="full-width">
            <el-option
              v-for="item in wllxOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="起始频率" prop="startFrequency">
          <el-input-number
            v-model="form.startFrequency"
            :min="0"
            :precision="0"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="终止频率" prop="endFrequency">
          <el-input-number
            v-model="form.endFrequency"
            :min="0"
            :precision="0"
            class="full-width"
          />
        </el-form-item>
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
  getFrequencyWLNMMap,
  getFrequencyWLLXMap,
  normalizeMapOptions
} from '@/api/resourceManagement.js'
import resourcePageMixin from '../mixins/resourcePageMixin'

export default {
  name: 'DatalinkSpectrumResource',
  mixins: [resourcePageMixin],
  data() {
    return {
      baseUrl: 'frequencyInfo',
      loading: false,
      tableData: [],
      total: 0,
      page: {pageNum: 1, pageSize: 15},
      query: {WLNM: null, WLLX: null},
      wlnmOptions: [],
      wllxOptions: [],
      dialogVisible: false,
      isEdit: false,
      form: this.getEmptyForm(),
      rules: {
        WLH: [{required: true, message: '请输入网络号', trigger: 'blur'}],
        WLNM: [{required: true, message: '请选择网络内码', trigger: 'change'}],
        WLLX: [{required: true, message: '请选择网络类型', trigger: 'change'}]
      }
    }
  },
  mounted() {
    this.loadMaps()
    this.fetchList()
  },
  methods: {
    getEmptyForm() {
      return {
        frequencyId: null,
        WLH: null,
        WLNM: null,
        WLLX: null,
        startFrequency: 1,
        endFrequency: 2
      }
    },
    loadMaps() {
      this.promiseAllHandled(
        [getFrequencyWLNMMap(), getFrequencyWLLXMap()],
        '频谱字典加载失败'
      )
        .then(([wlnmRes, wllxRes]) => {
          this.wlnmOptions = normalizeMapOptions(wlnmRes)
          this.wllxOptions = normalizeMapOptions(wllxRes)
        })
        .catch(() => {
          this.wlnmOptions = []
          this.wllxOptions = []
        })
    },
    buildParams() {
      const params = {}
      if (this.query.WLNM != null && this.query.WLNM !== '')
        params.WLNM = this.query.WLNM
      if (this.query.WLLX != null && this.query.WLLX !== '')
        params.WLLX = this.query.WLLX
      return params
    },
    fetchList() {
      this.loading = true
      apiPage(this.baseUrl, {
        pageNum: this.page.pageNum,
        pageSize: this.page.pageSize,
        params: this.buildParams()
      })
        .then(res => {
          this.tableData = this.normalizeList(res)
          this.total = (res.data && res.data.total) || this.tableData.length
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch() {
      this.page.pageNum = 1
      this.fetchList()
    },
    resetQuery() {
      this.query = {WLNM: null, WLLX: null}
      this.handleSearch()
    },
    openDialog(isEdit, row = null) {
      this.isEdit = isEdit
      this.form =
        isEdit && row
          ? {
              frequencyId: this.pickRowId(row, ['frequencyId', 'FREQUENCYID']),
              WLH: row.WLH,
              WLNM: row.WLNM,
              WLLX: row.WLLX,
              startFrequency: row.startFrequency,
              endFrequency: row.endFrequency
            }
          : this.getEmptyForm()
      this.dialogVisible = true
      this.$nextTick(
        () => this.$refs.formRef && this.$refs.formRef.clearValidate()
      )
    },
    submitForm() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const action = this.isEdit
          ? apiUpdate(this.baseUrl, this.form)
          : apiAdd(this.baseUrl, this.form)
        action
          .then(() => {
            this.$message.success('频谱信息已保存')
            this.dialogVisible = false
            this.fetchList()
          })
          .catch(() => {})
      })
    },
    handleDelete(row) {
      const id = this.pickRowId(row, ['frequencyId', 'frequencyInfoId'])
      if (!id) return
      this.$confirm('确定删除该频谱记录吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete(this.baseUrl, id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchList()
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
.full-width {
  width: 100%;
}
.text-red {
  color: var(--color-danger) !important;
}
</style>
