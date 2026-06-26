<template>
  <div class="network-manager-layout">
    <div class="filter-action-row">
      <div class="form-inputs">
        <el-input
          v-model="searchQuery.MBMC"
          placeholder="搜索目标名称"
          size="mini"
          class="dark-mini-input"
          clearable
          @clear="fetchList"
        />
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="fetchList"
          >查询</el-button
        >
        <el-button
          type="success"
          size="mini"
          icon="el-icon-plus"
          @click="openCreateDialog"
          :disabled="true"
          >探测登记新目标</el-button
        >
      </div>

      <div class="context-tip" v-if="selectedTask">
        当前绑定任务:
        <span class="text-green font-num">{{
          selectedTask.RWMC || selectedTask.rwmc || '未命名战术演训'
        }}</span>
      </div>
    </div>

    <div class="table-container-flex">
      <el-table
        :data="tableData"
        size="mini"
        class="dark-dashboard-table"
        height="100%"
        v-loading="loading"
      >
        <el-table-column
          prop="MBXXID"
          label="目标信息标识"
          width="110"
          class-name="font-num"
        >
          <template slot-scope="scope">
            {{ scope.row.MBXXID || scope.row.mbxxid }}
          </template>
        </el-table-column>

        <el-table-column
          prop="MBMC"
          label="目标名称"
          min-width="180"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span class="text-white font-bold">{{
              scope.row.MBMC || scope.row.mbmc
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="MBID"
          label="固有ID"
          width="85"
          class-name="font-num"
        >
          <template slot-scope="scope">
            {{ scope.row.MBID || scope.row.mbid || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="MBBSH"
          label="目标批次号"
          width="100"
          class-name="font-num"
        >
          <template slot-scope="scope">
            <span class="text-cyan">{{
              scope.row.MBBSH || scope.row.mbbsh
            }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="三维空间测值 (经度/纬度/高度)"
          min-width="240"
          class-name="font-num"
        >
          <template slot-scope="scope">
            <span class="text-blue"
              >JD: {{ scope.row.JD || scope.row.jd || '0.0' }}°</span
            >
            <span class="split-line">|</span>
            <span class="text-orange"
              >WD: {{ scope.row.WD || scope.row.wd || '0.0' }}°</span
            >
            <span class="split-line">|</span>
            <span class="text-green"
              >GD: {{ scope.row.GD || scope.row.gd || '0' }}m</span
            >
          </template>
        </el-table-column>

        <el-table-column prop="WXDJ" label="威胁等级" width="95" align="center">
          <template slot-scope="scope">
            <span
              :class="[
                'status-badge',
                scope.row.WXDJ === '高' || scope.row.wxdj === '高'
                  ? 'badge-high'
                  : 'badge-normal'
              ]"
            >
              {{ scope.row.WXDJ || scope.row.wxdj || '普通' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="MBXHMC"
          label="型号名称"
          width="130"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.MBXHMC || scope.row.mbxhmc || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="opTime"
          label="测控同步时间"
          width="150"
          class-name="font-num"
        />

        <el-table-column label="战术协同" width="130" align="center">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              class="btn-modify"
              icon="el-icon-edit"
              @click="handleEdit(scope.row)"
              :disabled="true"
              >修改</el-button
            >
            <el-button
              type="text"
              size="mini"
              class="btn-release"
              icon="el-icon-delete"
              @click="handleDelete(scope.row)"
              :disabled="true"
              >释放</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-footer-container">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :current-page.sync="pagination.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        :total="totalCount"
        @size-change="handleSizeChange"
        @current-change="fetchList"
      />
    </div>

    <el-dialog
      :title="
        isEdit
          ? '🛠️ 修正战场目标特征/空间参数'
          : '🚀 登记探测到全新敌我态势目标'
      "
      :visible.sync="dialogVisible"
      width="640px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <el-form
        :model="form"
        ref="targetForm"
        :rules="rules"
        label-width="111px"
        size="mini"
        class="dark-form"
      >
        <div class="form-grid-2col">
          <el-form-item label="目标名称" prop="MBMC">
            <el-input v-model="form.MBMC" placeholder="输入目标实体名称..." />
          </el-form-item>
          <el-form-item label="目标批次号" prop="MBBSH">
            <el-input-number
              v-model="form.MBBSH"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="目标固有ID" prop="MBID">
            <el-input-number v-model="form.MBID" :min="1" style="width: 100%" />
          </el-form-item>
          <el-form-item label="目标型号ID" prop="MBXHID">
            <el-input-number
              v-model="form.MBXHID"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="目标类型ID" prop="MBLXID">
            <el-input-number
              v-model="form.MBLXID"
              :min="1"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="威胁等级评分">
            <el-select
              v-model="form.WXDJ"
              placeholder="评定威胁等级"
              style="width: 100%"
            >
              <el-option label="高威胁" value="高" />
              <el-option label="中威胁" value="中" />
              <el-option label="低威胁" value="低" />
            </el-select>
          </el-form-item>
          <el-form-item label="定位经度 (°)">
            <el-input-number
              v-model="form.JD"
              :precision="4"
              :step="0.0001"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="定位纬度 (°)">
            <el-input-number
              v-model="form.WD"
              :precision="4"
              :step="0.0001"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <el-form-item label="测定高度 (米)">
          <el-input-number
            v-model="form.GD"
            :min="0"
            style="width: 48%"
            placeholder="海拔高度"
          />
        </el-form-item>
        <el-form-item label="型号扩展名称">
          <el-input
            v-model="form.MBXHMC"
            placeholder="关联外部扩展代号名称..."
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitForm"
          >确认下发同步</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 引入通用接口层驱动
import {apiPage, apiAdd, apiUpdate, apiDelete} from '@/api/common.js'

export default {
  name: 'MbxxManager',
  props: {
    // 接受上层组件下发的当前联动演训任务节点
    selectedTask: {type: Object, default: () => null}
  },
  data() {
    return {
      loading: false,
      tableData: [],
      totalCount: 0,
      searchQuery: {MBMC: ''},
      pagination: {pageNum: 1, pageSize: 20},
      dialogVisible: false,
      isEdit: false,
      form: this.getInitForm(),
      rules: {
        MBMC: [
          {required: true, message: '请录入目标实体探测名称', trigger: 'blur'}
        ],
        MBBSH: [
          {required: true, message: '战术批次标识不可缺失', trigger: 'blur'}
        ]
      }
    }
  },
  watch: {
    selectedTask: {
      deep: true,
      immediate: true,
      handler() {
        this.fetchList()
      }
    }
  },
  methods: {
    getInitForm() {
      return {
        MBXXID: null,
        mbxxid: null,
        ZZRWID: null, // 任务主键联动圈
        MBID: null,
        MBXHID: null,
        MBMC: '',
        MBLXID: null,
        MBBSH: null,
        MBXHMC: '',
        WXDJ: '中',
        JD: null,
        WD: null,
        GD: null
      }
    },
    fetchList() {
      this.loading = true
      // 构造通用后端的 page 分页请求载荷
      const payload = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        params: {
          MBMC: this.searchQuery.MBMC || undefined,
          // 关联任务条件筛选
          ZZRWID: this.selectedTask
            ? this.selectedTask.ZZZZRWID ||
              this.selectedTask.zzrwxxid ||
              this.selectedTask.ZZRWID
            : undefined
        }
      }

      apiPage('mbxx', payload)
        .then(res => {
          this.tableData = res.data?.list || res.data || []
          this.totalCount = res.data?.total || this.tableData.length
        })
        .catch(() => {
          this.tableData = []
          this.totalCount = 0
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.fetchList()
    },
    openCreateDialog() {
      this.isEdit = false
      this.form = this.getInitForm()
      if (this.selectedTask) {
        this.form.ZZRWID =
          this.selectedTask.ZZZZRWID ||
          this.selectedTask.zzrwxxid ||
          this.selectedTask.ZZRWID
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.targetForm) this.$refs.targetForm.clearValidate()
      })
    },
    handleEdit(row) {
      this.isEdit = true
      // 对齐双向映射大小写，安全填充表单
      const copy = {...row}
      copy.MBXXID = row.MBXXID || row.mbxxid
      copy.MBMC = row.MBMC || row.mbmc
      copy.MBID = row.MBID || row.mbid
      copy.MBBSH = row.MBBSH || row.mbbsh
      copy.MBXHID = row.MBXHID || row.mbxhid
      copy.MBLXID = row.MBLXID || row.mblxid
      copy.WXDJ = row.WXDJ || row.wxdj
      copy.JD = row.JD || row.jd
      copy.WD = row.WD || row.wd
      copy.GD = row.GD || row.gd
      copy.MBXHMC = row.MBXHMC || row.mbxhmc
      this.form = copy
      this.dialogVisible = true
    },
    handleDelete(row) {
      const id = row.MBXXID || row.mbxxid
      if (!id) return
      this.$confirm('确认从战术态势列表中释放该探测目标吗？', '重要提示', {
        type: 'warning',
        confirmButtonText: '释放目标',
        cancelButtonText: '取消'
      }).then(() => {
        apiDelete('mbxx', id).then(() => {
          this.$message.success('态势目标释放完毕')
          this.fetchList()
        })
      })
    },
    submitForm() {
      this.$refs.targetForm.validate(valid => {
        if (!valid) return
        const action = this.isEdit
          ? apiUpdate('mbxx', this.form)
          : apiAdd('mbxx', this.form)
        action.then(() => {
          this.$message.success('态势目标同步成功')
          this.dialogVisible = false
          this.fetchList()
        })
      })
    }
  }
}
</script>

<style scoped>
/* ===================================================================
   布局底座骨架（与 ZzrwWlManager.vue 完美同构，全扁平无阴影）
   =================================================================== */
.network-manager-layout {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

/* 顶部检索驱动行 */
.filter-action-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  flex-shrink: 0;
}
.form-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dark-mini-input {
  width: 180px;
}

/* 关联提示区 */
.context-tip {
  font-size: 11px;
  color: #94a3b8;
}

/* 表格柔性包裹体 */
.table-container-flex {
  flex: 1;
  min-height: 0;
  position: relative;
  margin-top: 4px;
}

/* 底部右对齐分页线 */
.pagination-footer-container {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
  flex-shrink: 0;
}

/* ===================================================================
   组件原子细节增强类（数字、标记、分栏）
   =================================================================== */
.font-num {
  font-family: monospace, 'Courier New';
}
.font-bold {
  font-weight: bold;
}
.text-white {
  color: #ffffff;
}
.text-blue {
  color: #38bdf8;
}
.text-orange {
  color: #f59e0b;
}
.text-green {
  color: #10b981;
}
.text-cyan {
  color: #06b6d4;
}

.split-line {
  margin: 0 6px;
  color: #16243a;
  user-select: none;
}

/* 威胁等阶扁平化状态标签 */
.status-badge {
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 2px;
  font-weight: bold;
}
.badge-high {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #ef4444;
}
.badge-normal {
  background-color: rgba(245, 158, 11, 0.15);
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

/* 微细缩控制文字按钮 */
.btn-modify {
  color: #38bdf8;
}
.btn-release {
  color: #f43f5e;
}

/* 弹出表单双列栅格 */
.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 11px;
}
</style>
