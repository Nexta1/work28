<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">任务群组配置方案</span>
        <div class="search-item">
          <label>网络组网体制</label>
          <el-select
            v-model="listQuery.WLLX"
            @change="handleSearch"
            size="small"
          >
            <el-option label="全部体制方案" :value="''"></el-option>
            <el-option
              v-for="(label, value) in wllxMapData"
              :key="value"
              :label="label"
              :value="String(value)"
            />
          </el-select>
        </div>
      </div>
      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          class="action-btn"
          @click="handleCreate"
        >
          新增战略策略
        </el-button>
        <el-button
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="resetSearch"
        >
          重置查询
        </el-button>
      </div>
    </div>

    <div class="main-body-layout" v-loading="listLoading">
      <div class="task-matrix-grid">
        <div
          v-for="(taskName, taskTypeKey) in taskTypeMap"
          :key="taskTypeKey"
          class="monitor-column-panel"
          @click="activeTaskType = Number(taskTypeKey)"
        >
          <div class="panel-header-summary">
            <span class="title">
              <Icon
                icon="lucide:swords"
                :size="14"
                style="
                  vertical-align: middle;
                  margin-right: 4px;
                  color: var(--color-danger, #ef4444);
                "
              />
              {{ taskName }}
            </span>
            <span class="badge font-num text-cyan">
              {{ getTaskStrategyList(taskTypeKey).length }} 条
            </span>
          </div>

          <div class="scroll-container-box">
            <div
              v-if="getTaskStrategyList(taskTypeKey).length === 0"
              class="sub-empty"
            >
              暂无配置策略
            </div>

            <div
              v-for="item in getTaskStrategyList(taskTypeKey)"
              :key="item.scenarioStrategyId"
              class="link-status-card compact-card"
              :class="{
                'is-active': activeStrategyId === item.scenarioStrategyId
              }"
              @click.stop="viewStrategyDetail(item)"
            >
              <div
                class="alarm-strip"
                :class="
                  Number(item.latencyRequirement) <= 100
                    ? 'strip-level-safe'
                    : 'strip-level-crit'
                "
              ></div>

              <div class="card-line">
                <span
                  class="wl-name ellipsis-text"
                  style="max-width: 140px"
                  :title="item.strategyName"
                >
                  <small class="text-cyan"
                    >#{{ item.scenarioStrategyId }}</small
                  >
                  {{ item.strategyName || '未命名策略' }}
                </span>
                <span
                  class="freq-value font-num text-cyan ellipsis-text"
                  style="max-width: 180px"
                >
                  {{
                    wllxMapData[
                      item.WLLX !== undefined ? item.WLLX : item.wllx
                    ] || '混合宽频'
                  }}
                </span>
              </div>

              <div class="card-line metric-line">
                <span class="metric-item">
                  <Icon
                    icon="lucide:activity"
                    :size="12"
                    color="var(--color-primary, #38bdf8)"
                    style="vertical-align: middle; margin-right: 3px"
                  />
                  带宽
                  <span class="text-blue">{{
                    item.bandwidthRequirement || 0
                  }}</span
                  >M
                </span>

                <span class="metric-item">
                  <Icon
                    icon="lucide:timer"
                    :size="12"
                    color="var(--color-warning, #f59e0b)"
                    style="vertical-align: middle; margin-right: 3px"
                  />
                  时延
                  <span class="text-orange">{{
                    item.latencyRequirement || 0
                  }}</span
                  >ms
                </span>

                <span class="metric-item">
                  成员规模
                  <span class="text-green">{{
                    item.WLCYSL || item.wlcysl || 0
                  }}</span>
                  机
                </span>

                <span class="metric-item">
                  平台类型
                  <span class="text-cyan">{{
                    item.memberPTXHIDs
                      ? item.memberPTXHIDs.split(',').length
                      : 0
                  }}</span
                  >型
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      title="任务群组策略 · 详细信息"
      :visible.sync="detailVisible"
      width="520px"
      custom-class="dark-custom-dialog"
      append-to-body
    >
      <div v-if="selectedDetail" class="dialog-detail-matrix">
        <div class="detail-row">
          <span class="lbl">策略识别号</span>
          <span class="val font-num text-cyan"
            >#{{ selectedDetail.scenarioStrategyId }}</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">策略控制名称</span>
          <span class="val text-blue font-num">{{
            selectedDetail.strategyName || '未指定'
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">作战任务分类</span>
          <span class="val text-orange">{{
            taskTypeMap[selectedDetail.taskType] || '未知任务'
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">组网体制方案</span>
          <span class="val text-green">{{
            wllxMapData[
              selectedDetail.WLLX !== undefined
                ? selectedDetail.WLLX
                : selectedDetail.wllx
            ] || '常规多载波体制'
          }}</span>
        </div>
        <div class="detail-row">
          <span class="lbl">规划带宽需求</span>
          <span class="val font-num text-blue"
            >{{ selectedDetail.bandwidthRequirement }} Mbps</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">高敏延迟需求</span>
          <span class="val font-num text-orange"
            >{{ selectedDetail.latencyRequirement }} ms</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">网链成员数量</span>
          <span class="val font-num"
            >{{ selectedDetail.WLCYSL || selectedDetail.wlcysl }} 机/艇</span
          >
        </div>
        <div class="detail-row">
          <span class="lbl">操作安全员</span>
          <span class="val font-num text-gray">{{
            selectedDetail.opUserName || '管理员'
          }}</span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl">时间戳下发序列</span>
          <span class="val font-num text-gray">{{
            selectedDetail.opTime || '-'
          }}</span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl">通联业务谱系</span>
          <span class="val text-cyan">{{
            selectedDetail.serviceTypes || '暂无业务'
          }}</span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl"
            >成员类型 ({{
              selectedDetail.memberPTXHIDs
                ? selectedDetail.memberPTXHIDs.split(',').length
                : 0
            }}
            型)</span
          >
          <span class="val text-blue font-platform-list">
            <el-popover
              placement="top-start"
              width="320"
              trigger="hover"
              popper-class="dark-popover-tech"
              :disabled="!splitPlatforms(selectedDetail).length"
            >
              <div class="popover-tags-grid">
                <span
                  v-for="(name, index) in splitPlatforms(selectedDetail)"
                  :key="index"
                  class="matrix-tag-item"
                >
                  <Icon
                    icon="lucide:cpu"
                    :size="11"
                    color="var(--color-cyan)"
                    style="margin-right: 3px"
                  />
                  {{ name }}
                </span>
              </div>

              <div slot="reference" class="inline-tags-ellipsis">
                <span
                  v-for="(name, index) in splitPlatforms(selectedDetail).splice(
                    0,
                    4
                  )"
                  :key="index"
                  class="matrix-tag-item"
                >
                  <Icon
                    icon="lucide:cpu"
                    :size="11"
                    color="var(--color-cyan)"
                    style="margin-right: 3px"
                  />
                  {{ name }}
                </span>
                <span v-show="splitPlatforms(selectedDetail).length > 4"
                  >...</span
                >
                <span
                  v-if="!splitPlatforms(selectedDetail).length"
                  class="text-gray-muted"
                  >未指派平台</span
                >
              </div>
            </el-popover>
          </span>
        </div>
        <div class="detail-row span-2">
          <span class="lbl">安全认证保障</span>
          <span class="val" style="color: #94a3b8">{{
            selectedDetail.safeRequirement || '未设定特殊限制'
          }}</span>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          size="mini"
          class="action-btn"
          @click="handleUpdateFromDetail"
          >编辑此策略</el-button
        >
        <el-button type="danger" size="mini" @click="handleDeleteFromDetail"
          >删 除</el-button
        >
        <el-button
          @click="detailVisible = false"
          size="mini"
          style="background: #172438; border: 1px solid #1e3557; color: #cbd5e1"
          >关 闭</el-button
        >
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="580px"
      append-to-body
      @close="resetForm"
    >
      <el-form
        :model="form"
        :rules="rules"
        ref="dataForm"
        size="mini"
        label-width="120px"
      >
        <!-- 使用 el-row 并设置分栏间隔 :gutter="20" 保证左右间距美观 -->
        <el-row :gutter="20">
          <!-- 满宽项 (相当于之前的 span-2) -->
          <el-col :span="24">
            <el-form-item label="策略控制名称" prop="strategyName" required>
              <el-input
                v-model="form.strategyName"
                placeholder="例如：指挥协同策略01"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 半宽项 (两列平铺) -->
          <el-col :span="12">
            <el-form-item label="任务类型调度" prop="taskType" required>
              <el-select
                v-model="form.taskType"
                placeholder="请选择任务类型"
                style="width: 100%"
              >
                <el-option
                  v-for="(label, value) in taskTypeMap"
                  :key="value"
                  :label="label"
                  :value="Number(value)"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="网络组网体制类型" prop="WLLX" required>
              <el-select
                v-model="form.WLLX"
                placeholder="请选择体制类型"
                style="width: 100%"
              >
                <el-option
                  v-for="(label, value) in wllxMapData"
                  :key="value"
                  :label="label"
                  :value="String(value)"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="网链成员数量" prop="WLCYSL" required>
              <el-input
                type="number"
                v-model.number="form.WLCYSL"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="高敏延迟需求 (ms)"
              prop="latencyRequirement"
              required
            >
              <el-input v-model="form.latencyRequirement" style="width: 100%" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="带宽需求 (Mbps)"
              prop="bandwidthRequirement"
              required
            >
              <el-input
                v-model="form.bandwidthRequirement"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 满宽项 -->
          <el-col :span="24">
            <el-form-item label="通联业务选择" prop="serviceTypesArray">
              <el-checkbox-group v-model="form.serviceTypesArray">
                <el-checkbox
                  v-for="item in serviceTypeList"
                  :key="item"
                  :label="item"
                >
                  {{ item }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="成员型号" prop="platformIdsArray">
              <el-select
                v-model="form.platformIdsArray"
                placeholder="请选择成员型号"
                clearable
                multiple
                style="width: 100%"
              >
                <el-option
                  :label="i.PTXHMC"
                  :value="i.PTXHID"
                  v-for="i in platformTree"
                  :key="i.PTLX"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="安全保密级别" prop="safeRequirement">
              <el-radio-group v-model="form.safeRequirement">
                <el-radio v-for="item in aqbmOptions" :key="item" :label="item">
                  {{ item }}级保密
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button
          @click="dialogVisible = false"
          size="mini"
          style="background: #172438; border: 1px solid #1e3557; color: #cbd5e1"
          >取 消</el-button
        >
        <el-button
          type="primary"
          @click="submitForm"
          size="mini"
          :loading="submitLoading"
          >下发配置策略</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {apiPage, apiAdd, apiUpdate, apiDelete} from '@/api/common'
// 3. 完美引入通联业务和安全保密要求字典函数
import {wllxMap, rwlxMap, tlywList, aqbmList} from '@/api/map'
import {getPtxhInfos} from '@/api/resourceManagement.js'
export default {
  name: 'ScenarioStrategyCleanDashboard',
  data() {
    return {
      moduleBaseUrl: 'scenarioStrategy',
      wllxMapData: {},
      taskTypeMap: {},
      serviceTypeList: [],
      aqbmOptions: [], // 保密级别选项池
      platformTree: [],
      platformFlatMap: {},

      activeTaskType: 0,
      activeStrategyId: null,

      detailVisible: false,
      selectedDetail: null,

      listLoading: false,
      globalStrategies: [],
      listQuery: {WLLX: null},

      dialogVisible: false,
      dialogTitle: '',
      submitLoading: false,

      form: {
        scenarioStrategyId: null,
        strategyName: '',
        taskType: 0,
        wllx: '', // 统一为 String 初始值
        WLLX: '', // 统一为 String 初始值
        memberScale: 100,
        WLCYSL: 100,
        latencyRequirement: '100',
        bandwidthRequirement: '100',
        serviceTypes: '',
        serviceTypesArray: [],
        safeRequirement: '', // 绑定保密级别单选
        memberPTXHIDs: '',
        platformIdsArray: []
      },

      // 🛑 核心规则集：拦截各类不合规配置项
      rules: {
        strategyName: [
          {required: true, message: '战术策略控制名称不可为空', trigger: 'blur'}
        ],
        taskType: [
          {required: true, message: '请选择作战任务分类分类', trigger: 'change'}
        ],
        WLLX: [
          {required: true, message: '请指派网络组网体制类型', trigger: 'change'}
        ],
        WLCYSL: [
          {required: true, message: '成员数量不可为空', trigger: 'blur'},
          {type: 'number', message: '成员数量必须为数字类型', trigger: 'blur'}
        ],
        latencyRequirement: [
          {required: true, message: '高敏延迟参数不可为空', trigger: 'blur'}
        ],
        bandwidthRequirement: [
          {required: true, message: '规划带宽参数不可为空', trigger: 'blur'}
        ],
        safeRequirement: [
          {
            required: true,
            message: '请设定对应的安全保密评级',
            trigger: 'change'
          }
        ]
      }
    }
  },
  created() {
    this.taskTypeMap = rwlxMap()
    this.serviceTypeList = tlywList()
    // 获取安全保密级别字典数据
    this.aqbmOptions =
      typeof aqbmList === 'function'
        ? aqbmList()
        : ['核心', '重要', '一般', '内部']
  },
  async mounted() {
    await this.initRemoteDictionaries()
    this.getGlobalStrategyList()
  },
  methods: {
    async initRemoteDictionaries() {
      try {
        const wllxRes = await wllxMap()
        this.wllxMapData = wllxRes.data || wllxRes || {}
        const treeRes = await getPtxhInfos()
        this.platformTree = treeRes.data
      } catch (e) {
        console.error('动态网络字典绑定异常:', e)
      }
    },

    formatPlatformIds(idsString) {
      if (!idsString) return '未指派联合作战节点'
      return idsString
        .split(',')
        .map(id => this.platformFlatMap[id.trim()] || `ID:${id}`)
        .join(', ')
    },

    getTaskStrategyList(type) {
      return this.globalStrategies.filter(
        item => Number(item.taskType) === Number(type)
      )
    },

    getGlobalStrategyList() {
      this.listLoading = true
      apiPage(this.moduleBaseUrl, {
        pageNum: 1,
        pageSize: 100,
        params: {
          WLLX: this.listQuery.WLLX || undefined
        }
      })
        .then(res => {
          this.globalStrategies = res.data.list || res.data || []
          this.listLoading = false
          if (this.globalStrategies.length > 0) {
            this.activeStrategyId = this.globalStrategies[0].scenarioStrategyId
            this.activeTaskType = Number(this.globalStrategies[0].taskType)
          }
        })
        .catch(() => {
          this.listLoading = false
        })
    },

    handleSearch() {
      this.getGlobalStrategyList()
    },
    resetSearch() {
      this.listQuery.WLLX = null
      this.getGlobalStrategyList()
    },

    viewStrategyDetail(item) {
      this.selectedDetail = item
      this.activeStrategyId = item.scenarioStrategyId
      this.activeTaskType = Number(item.taskType)
      this.detailVisible = true
    },

    handleUpdateFromDetail() {
      this.detailVisible = false
      this.handleUpdate(this.selectedDetail)
    },
    handleDeleteFromDetail() {
      this.detailVisible = false
      this.handleDelete(this.selectedDetail)
    },

    handleCreate() {
      this.resetForm()
      this.dialogTitle = '下发任务群组策略'
      this.dialogVisible = true
    },
    splitPlatforms(detail) {
      if (!detail) return []
      // 优先拿纯文本名称，没有就拿 ID 格式化后的文本
      const rawStr =
        detail.memberPTXHNames || this.formatPlatformIds(detail.memberPTXHIDs)
      if (!rawStr) return []

      // 支持中英文逗号、空格、顿号切分
      return rawStr.split(/[\s,，、]+/).filter(Boolean)
    },
    handleUpdate(row) {
      this.resetForm()
      this.dialogTitle = '修正任务群组策略'

      const targetForm = Object.assign({}, row)

      // 组网体制 wllx 全部转为字符串处理
      if (targetForm.WLLX !== undefined && targetForm.WLLX !== null) {
        targetForm.WLLX = String(targetForm.WLLX)
      } else if (targetForm.wllx !== undefined && targetForm.wllx !== null) {
        targetForm.WLLX = String(targetForm.wllx)
      }

      if (targetForm.WLCYSL === undefined && targetForm.wlcysl !== undefined) {
        targetForm.WLCYSL = targetForm.wlcysl
      }
      if (targetForm.serviceTypes) {
        targetForm.serviceTypesArray = targetForm.serviceTypes.split(',')
      }
      if (targetForm.memberPTXHIDs) {
        targetForm.platformIdsArray = targetForm.memberPTXHIDs
          .split(',')
          .map(id => (isNaN(id) ? id : Number(id)))
      }

      // 将解析后的形态深拷贝至 Vue 响应式实例中
      this.form = targetForm
      console.log('待编辑的策略数据:', this.form)
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs['dataForm'].validate(valid => {
        if (!valid) {
          this.$message.error(
            '策略：存在未完成或不合规的战术指标参数，拒绝下发'
          )
          return false
        }

        this.form.serviceTypes = this.form.serviceTypesArray.join(',')
        this.form.memberPTXHIDs = this.form.platformIdsArray.join(',')

        // 配合后端 String/Number 兼容
        this.form.wllx = this.form.WLLX
        this.form.wlcysl = this.form.WLCYSL

        this.submitLoading = true
        if (this.form.scenarioStrategyId) {
          apiUpdate(this.moduleBaseUrl, this.form)
            .then(() => {
              this.$message.success('更新策略配置成功')
              this.dialogVisible = false
              this.getGlobalStrategyList()
              this.submitLoading = false
            })
            .catch(() => {
              this.submitLoading = false
            })
        } else {
          apiAdd(this.moduleBaseUrl, this.form)
            .then(() => {
              this.$message.success('新规划策略部署成功')
              this.dialogVisible = false
              this.getGlobalStrategyList()
              this.submitLoading = false
            })
            .catch(() => {
              this.submitLoading = false
            })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定注销并完全断开该策略?', '警告', {
        confirmButtonText: '销毁',
        cancelButtonText: '取消'
      })
        .then(() => {
          apiDelete(this.moduleBaseUrl, row.scenarioStrategyId).then(() => {
            this.$message.success('该链路策略已从控制剥离销毁')
            this.getGlobalStrategyList()
          })
        })
        .catch(() => {
          this.$message.info('已取消')
        })
    },
    resetForm() {
      this.form = {
        scenarioStrategyId: null,
        strategyName: '',
        taskType: 0,
        wllx: '',
        WLLX: '',
        memberScale: 100,
        WLCYSL: 100,
        latencyRequirement: '100',
        bandwidthRequirement: '100',
        serviceTypes: '',
        serviceTypesArray: [],
        safeRequirement: '',
        memberPTXHIDs: '',
        platformIdsArray: []
      }
      this.$nextTick(() => {
        if (this.$refs['dataForm']) {
          this.$refs['dataForm'].clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
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
.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}
.search-flex {
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.search-item label {
  font-size: 11px;
  color: #52637a;
}

.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
}
.task-matrix-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 12px;
  height: 100%;
  width: 100%;
}

.monitor-column-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  min-height: 0;
}
.is-active-panel {
  border-color: rgba(56, 189, 248, 0.4) !important;
  background: #091220;
}
.panel-header-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 6px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.panel-header-summary .badge {
  font-size: 11px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}

.scroll-container-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.scroll-container-box::-webkit-scrollbar {
  width: 4px;
}
.scroll-container-box::-webkit-scrollbar-thumb {
  background: #172438;
  border-radius: 2px;
}

.link-status-card.compact-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 3px;
  padding: 6px 8px;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 50px;
  box-sizing: border-box;
  justify-content: center;
}
.link-status-card:hover {
  background: #121e30;
  border-color: #38bdf8;
}
.link-status-card.is-active {
  background: #15253d;
  border-color: #06b6d4;
}

.alarm-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.strip-level-safe {
  background: #10b981;
}
.strip-level-crit {
  background: #eab308;
}

.card-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.wl-name {
  font-weight: bold;
  color: #fff;
}
.metric-line {
  /* justify-content: flex-start; */
  gap: 10px;
  color: #64748b;
  font-size: 11px;
  margin-top: 1px;
}

.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #334155;
  padding-top: 25px;
}

.dialog-detail-matrix {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px; /* 轻微增大网格间隙，保证整体视觉平滑平衡 */
}

/* 🎛️ 核心修复：完美融合同步 el-form-item 彻底降噪防撑开 */
.detail-row {
  background: #070c14;
  padding: 5px 10px;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.span-2 {
  grid-column: span 2;
}
.detail-row .lbl {
  font-size: 11px;
  color: #52637a;
  margin-bottom: 2px;
}
.required-lbl::after {
  content: ' *';
  color: #ef4444;
}
.detail-row .val {
  font-size: 11px;
  color: #f8fafc;
}
.font-platform-list {
  font-size: 11px !important;
  color: #93c5fd !important;
  line-height: 14px;
  text-align: justify;
  max-height: 60px;
  overflow: auto;
}
.checkbox-matrix {
  padding: 4px 0;
}

/* 针对大屏幕单选/多选组件深色化重置 */
::v-deep .el-checkbox__label,
::v-deep .el-radio__label {
  color: #cbd5e1 !important;
  font-size: 11px;
}
::v-deep .el-checkbox__inner,
::v-deep .el-radio__inner {
  background-color: #0d1522 !important;
  border-color: #1a293d !important;
}
::v-deep .el-checkbox__input.is-checked .el-checkbox__inner,
::v-deep .el-radio__input.is-checked .el-radio__inner {
  background-color: #38bdf8 !important;
  border-color: #38bdf8 !important;
}

/* 保密定制化样式 */
::v-deep .secret-form-item.el-form-item {
  display: flex;
  flex-direction: column;
}
::v-deep .secret-form-item .el-form-item__label {
  color: #52637a !important;
  font-size: 11px;
  line-height: 14px;
  text-align: left;
  padding: 0 0 2px 0;
}
/* 限制主界面单行显示，超出隐藏 */
.inline-tags-ellipsis {
  display: flex;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%; /* 或者给定一个固定宽度如 240px */
  cursor: pointer;
}

/* 战术胶囊标签基础样式 */
.matrix-tag-item {
  display: inline-flex;
  align-items: center;
  background: rgba(6, 182, 212, 0.08); /* 科技青透明底 */
  border: 1px solid rgba(6, 182, 212, 0.25);
  color: var(--color-cyan, #06b6d4);
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 11px;
  height: 18px;
  line-height: 16px;
  flex-shrink: 0; /* 防止在行内被压扁 */
}

/* 气泡弹窗深色扁平化重写 */
.el-popover.dark-popover-tech {
  background: #0c1424 !important;
  border: 1px solid #1e293b !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  padding: 12px;

  .popover-tags-grid {
    display: flex;
    flex-wrap: wrap; /* 气泡里允许换行平铺 */
    gap: 6px;
  }

  /* 气泡小三角颜色修正 */
  .popper__arrow::after {
    border-top-color: #0c1424 !important;
    border-bottom-color: #0c1424 !important;
  }
}
.text-blue {
  color: #38bdf8 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-gray {
  color: #64748b !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
