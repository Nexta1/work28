<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <div class="search-item">
          <label>群组名称</label>
          <input
            type="text"
            v-model="searchQuery.QZMC"
            @input="handleSearch"
            placeholder="群组名称, 如: 指挥"
          />
        </div>
      </div>

      <div class="header-right-zone">
        <div class="context-tip" v-if="selectedTask">
          当前大厅聚焦:
          <span class="text-blue font-num">{{
            selectedTask.RWMC || selectedTask.rwmc || '未指定主任务'
          }}</span>
        </div>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="openCreateGroup"
        >
          构建任务群组
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-platform-sidebar">
        <div class="sidebar-header-summary">
          <span class="title">👥 任务群组集群</span>
          <span class="count-badge">共 {{ groupList.length }} 个群组</span>
        </div>

        <div class="platform-scroll-list" v-loading="groupLoading">
          <div
            v-for="qz in groupList"
            :key="qz.ZZRWQZID"
            class="platform-brief-card"
            :class="[
              getQzStatusClass(qz.QZSTATE),
              {'is-active': activeGroupId === qz.ZZRWQZID}
            ]"
            @click="selectGroup(qz)"
          >
            <div class="absolute-action-corner">
              <el-button
                type="text"
                icon="el-icon-edit"
                class="corner-btn btn-edit"
                title="编辑"
                @click.stop="handleEditGroup(qz)"
              ></el-button>
              <el-button
                type="text"
                icon="el-icon-delete"
                class="corner-btn btn-delete"
                title="删除"
                @click.stop="handleDeleteGroup(qz)"
              ></el-button>
            </div>

            <div class="card-text-content">
              <div class="card-title-row">
                <span class="pt-name" :title="qz.QZMC">📂 {{ qz.QZMC }}</span>
              </div>

              <div class="card-sub-info">
                <span class="bsh-txt">ID: {{ qz.ZZRWQZID }}</span>
                <span class="state-txt-tag">{{
                  getStatusText(qz.QZSTATE)
                }}</span>
              </div>
              <div class="card-count-row">
                <span class="pt-type-tag"
                  >关联平台数: {{ parsePlatformCount(qz.ZZRWPTIDS) }}</span
                >
              </div>
            </div>
          </div>
          <div class="sub-empty" v-if="groupList.length === 0">
            未检索到关联任务群组
          </div>
        </div>
      </div>

      <div class="right-cascade-panel" v-loading="detailLoading">
        <div v-if="!activeGroupId" class="empty-fallback">
          <div class="radar-scan-loader"></div>
          <p>请在左侧点击任一任务群组，以调阅其核心态势及保障网元配置...</p>
        </div>

        <div v-else class="cascade-content-wrapper">
          <div class="detail-param-dashboard border-cyan">
            <h3 class="panel-section-title">📊 群组精细化元数据要素</h3>
            <div class="attribute-data-matrix">
              <div class="matrix-item">
                <span class="m-label">群组标识 (ID):</span
                ><span class="m-value text-blue font-num">{{
                  currentGroup.ZZRWQZID
                }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">群组名称:</span
                ><span class="m-value text-white">{{ currentGroup.QZMC }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">所属任务ID:</span
                ><span class="m-value font-num">{{
                  currentGroup.ZZRWXXID
                }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">起始平台编识号:</span
                ><span class="m-value font-num text-orange">{{
                  currentGroup.QSPTBSH || '--'
                }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">终止平台编识号:</span
                ><span class="m-value font-num text-orange">{{
                  currentGroup.ZZPTBSH || '--'
                }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">起始目标编识号:</span
                ><span class="m-value font-num">{{
                  currentGroup.QSMBBSH || '--'
                }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">终止目标标识号:</span
                ><span class="m-value font-num">{{
                  currentGroup.ZZMBBSH || '--'
                }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">任务开始时间:</span
                ><span class="m-value font-num text-green">{{
                  currentGroup.RWKSSJ || '--'
                }}</span>
              </div>
              <div class="matrix-item">
                <span class="m-label">任务终止时间:</span
                ><span class="m-value font-num text-green">{{
                  currentGroup.RWZZSJ || '--'
                }}</span>
              </div>
            </div>
            <div class="platform-ids-box">
              <span class="m-label">绑定的编队内平台标识列表:</span>
              <div class="tags-row">
                <span
                  v-for="id in splitPlatformIds(currentGroup.ZZRWPTIDS)"
                  :key="id"
                  class="mini-tag"
                >
                  {{ findPlatformNameById(id) }} (ID:{{ id }})
                </span>
                <span v-if="!currentGroup.ZZRWPTIDS" class="text-gray"
                  >暂无绑定具体平台</span
                >
              </div>
            </div>
          </div>

          <div class="detail-param-dashboard border-emerald">
            <div class="panel-inner-title-flex">
              <h3 class="panel-section-title" style="margin: 0">
                🔌 绑定的群组网络配置
              </h3>
              <el-button
                type="success"
                size="mini"
                icon="el-icon-link"
                @click="openCreateNetworkLink"
              >
                接入网络映射
              </el-button>
            </div>

            <div class="network-links-grid" v-if="networkLinks.length > 0">
              <div
                v-for="net in networkLinks"
                :key="net.ZZRWQZWLID"
                class="net-link-sub-card"
              >
                <div class="sub-card-header">
                  <span class="net-id-badge"
                    >🌐 网元关联 ID: {{ net.ZZRWQZWLID }}</span
                  >
                  <div class="sub-card-actions">
                    <el-button
                      type="text"
                      icon="el-icon-edit"
                      class="mini-text-btn btn-modify"
                      @click="handleEditLink(net)"
                      >修改</el-button
                    >
                    <el-button
                      type="text"
                      icon="el-icon-delete"
                      class="mini-text-btn btn-release"
                      @click="handleDeleteLink(net)"
                      >移除</el-button
                    >
                  </div>
                </div>

                <div class="sub-card-body-metrics">
                  <div class="metric-box">
                    <span class="met-label">任务网络标识</span>
                    <span class="met-value font-num text-blue">{{
                      net.ZZRWWLID
                    }}</span>
                  </div>
                  <div class="metric-box">
                    <span class="met-label">路由节点标识</span>
                    <span class="met-value font-num">{{
                      net.LYJDID || '自动路由'
                    }}</span>
                  </div>
                  <div class="metric-box">
                    <span class="met-label">时间基准节点</span>
                    <span class="met-value font-num text-orange">{{
                      net.SJJZJDID || '无'
                    }}</span>
                  </div>
                  <div class="metric-boxHighlight">
                    <span class="met-label">时延要求</span>
                    <span class="met-value font-num text-green"
                      >{{ net.SYYQ }} <small>ms</small></span
                    >
                  </div>
                  <div class="metric-boxHighlight">
                    <span class="met-label">带宽要求</span>
                    <span class="met-value font-num text-cyan"
                      >{{ net.DKYQ }} <small>Mbps</small></span
                    >
                  </div>
                </div>

                <div class="sub-card-footer-business">
                  <span class="biz-title">📡 通联业务要求:</span>
                  <div class="biz-tag-container">
                    <span
                      v-for="biz in parseServiceTypes(net.serviceTypes)"
                      :key="biz"
                      class="biz-mini-bubble"
                    >
                      {{ biz }}
                    </span>
                    <span v-if="!net.serviceTypes" class="text-gray"
                      >未定义具体业务保障指标</span
                    >
                  </div>
                </div>
              </div>
            </div>
            <div class="model-empty-text-large" v-else>
              ⚠️ 该任务群组下当前暂无编配绑定的群组网络指标参数。
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="
        isEditGroup ? '🛠️ 调整作战任务群组要素' : '🚀 创建新编作战任务群组'
      "
      :visible.sync="groupDialogVisible"
      width="600px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <el-form
        :model="groupForm"
        ref="groupForm"
        :rules="groupRules"
        label-width="125px"
        size="mini"
        class="dark-form"
      >
        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="群组名称" prop="QZMC">
              <el-input
                v-model="groupForm.QZMC"
                placeholder="例如: 近海低空指挥组"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="群组状态" prop="QZSTATE">
              <el-select
                v-model="groupForm.QZSTATE"
                placeholder="请指派初始状态"
                style="width: 100%"
              >
                <el-option :value="0" label="0 - 新建" />
                <el-option :value="1" label="1 - 启动" />
                <el-option :value="2" label="2 - 终止" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="编队内平台选择" prop="cascaderPlatformValues">
          <el-select
            v-model="groupForm.cascaderPlatformValues"
            multiple
            clearable
            collapse-tags
            style="width: 100%"
            placeholder="请可视化勾选归属战区的多维平台"
          >
            <el-option
              v-for="item in platformList"
              :key="item.PTID"
              :label="item.PTMC"
              :value="String(item.PTID)"
            />
          </el-select>
        </el-form-item>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="起始平台识标" prop="QSPTBSH">
              <el-input-number
                v-model="groupForm.QSPTBSH"
                style="width: 100%"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="终止平台识标" prop="ZZPTBSH">
              <el-input-number
                v-model="groupForm.ZZPTBSH"
                style="width: 100%"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="起始目标识标" prop="QSMBBSH">
              <el-input-number
                v-model="groupForm.QSMBBSH"
                style="width: 100%"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="终止目标识标" prop="ZZMBBSH">
              <el-input-number
                v-model="groupForm.ZZMBBSH"
                style="width: 100%"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="任务全周期跨度">
          <el-col :span="11">
            <el-date-picker
              type="datetime"
              placeholder="选择开始节点"
              v-model="groupForm.RWKSSJ"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-col>
          <el-col
            class="line"
            :span="2"
            style="text-align: center; color: #64748b"
            >至</el-col
          >
          <el-col :span="11">
            <el-date-picker
              type="datetime"
              placeholder="选择终止节点"
              v-model="groupForm.RWZZSJ"
              value-format="yyyy-MM-dd HH:mm:ss"
              style="width: 100%"
            />
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="groupDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitGroupForm"
          >确 认</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditLink ? '🛠️ 修正群组网络参数' : '🚀 挂载群组保障网络需求'"
      :visible.sync="linkDialogVisible"
      width="540px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <el-form
        :model="linkForm"
        ref="linkForm"
        :rules="linkRules"
        label-width="110px"
        size="mini"
        class="dark-form"
      >
        <el-form-item label="网络树体系" prop="ZZRWWLID">
          <el-cascader
            style="width: 100%"
            v-model="linkForm.ZZRWWLID"
            :options="networkTreeOptions"
            :props="{
              emitPath: false,
              value: 'ZZRWWLID',
              label: 'WLMC',
              children: 'children',
              checkStrictly: true
            }"
            placeholder="通过树结构深度调阅并选择对应任务网络"
            clearable
          />
        </el-form-item>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="路由节点ID" prop="LYJDID">
              <el-input-number
                v-model="linkForm.LYJDID"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="时间基准节点" prop="SJJZJDID">
              <el-input-number
                v-model="linkForm.SJJZJDID"
                style="width: 100%"
                controls-position="right"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col :span="12">
            <el-form-item label="时延要求(ms)" prop="SYYQ">
              <el-input-number
                v-model="linkForm.SYYQ"
                style="width: 100%"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="带宽要求(Mb)" prop="DKYQ">
              <el-input-number
                v-model="linkForm.DKYQ"
                style="width: 100%"
                controls-position="right"
                :min="0"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="通联业务要求" prop="selectServiceTypes">
          <el-select
            v-model="linkForm.selectServiceTypes"
            multiple
            placeholder="请勾选需要的可视化通联业务类型"
            style="width: 100%"
          >
            <el-option
              v-for="item in businessOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="linkDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitLinkForm"
          >保 存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {apiPage, apiAdd, apiUpdate, apiDelete} from '@/api/common.js'
import {tlywList} from '@/api/map.js'
import request from '@/utils/request'

export default {
  name: 'TaskGroupScheme',
  props: {
    platformTreeNodes: {
      type: Array,
      default: () => []
    },
    platformList: {
      type: Array,
      default: () => []
    },
    selectedTask: {type: Object, default: () => null}
  },
  data() {
    return {
      groupLoading: false,
      detailLoading: false,

      searchQuery: {
        QZMC: ''
      },

      groupList: [],
      activeGroupId: null,
      currentGroup: null,

      networkLinks: [],
      networkTreeOptions: [],

      businessOptions:
        typeof tlywList === 'function'
          ? tlywList()
          : ['态势', '语音', '视频', '文电', '目指', '话音', '指令', '图像'],

      groupDialogVisible: false,
      isEditGroup: false,
      groupForm: this.getInitGroupForm(),
      groupRules: {
        QZMC: [{required: true, message: '群组名称不可为空', trigger: 'blur'}],
        QZSTATE: [
          {required: true, message: '请赋予群组特定战术状态', trigger: 'change'}
        ]
      },

      linkDialogVisible: false,
      isEditLink: false,
      linkForm: this.getInitLinkForm(),
      linkRules: {
        ZZRWWLID: [
          {
            required: true,
            message: '必须选择关联的任务网络体系',
            trigger: 'change'
          }
        ],
        SYYQ: [
          {required: true, message: '请输入明确的时延容忍值', trigger: 'blur'}
        ],
        DKYQ: [{required: true, message: '请输入带宽底线指标', trigger: 'blur'}]
      }
    }
  },

  watch: {
    selectedTask: {
      deep: true,
      immediate: true,
      handler() {
        this.fetchGroupList()
        this.loadNetworkTreeStructure()
      }
    }
  },
  methods: {
    getInitGroupForm() {
      return {
        ZZRWQZID: null,
        ZZRWXXID: null,
        QZMC: '',
        ZZRWPTIDS: '',
        cascaderPlatformValues: [], // 用于绑定的组件状态
        QSPTBSH: 0,
        ZZPTBSH: 0,
        QSMBBSH: 0,
        ZZMBBSH: 0,
        RWKSSJ: '',
        RWZZSJ: '',
        QZSTATE: 0
      }
    },
    getInitLinkForm() {
      return {
        ZZRWQZWLID: null,
        ZZRWQZID: null,
        ZZRWWLID: undefined, // 直接充当 Cascader 绑定的终点
        LYJDID: undefined,
        SJJZJDID: undefined,
        SYYQ: 50,
        DKYQ: 10,
        serviceTypes: '',
        selectServiceTypes: [] // 用于绑定多选下拉列表的状态
      }
    },

    loadNetworkTreeStructure() {
      const taskId = this.selectedTask?.ZZRWID
      if (!taskId) return
      request({
        url: `/rest/zzrwwl/findTree/${taskId}`,
        method: 'get'
      })
        .then(res => {
          this.networkTreeOptions = res.data || res.list || []
        })
        .catch(() => {
          this.networkTreeOptions = []
        })
    },

    fetchGroupList() {
      this.groupLoading = true
      const payload = {
        pageNum: 1,
        pageSize: 9999,
        params: {
          RWMC: this.selectedTask.RWMC,
          QZMC: this.searchQuery.QZMC || undefined,
          ZZRWXXID: this.selectedTask
            ? this.selectedTask.ZZRWID || this.selectedTask.zzrwid
            : undefined
        }
      }

      apiPage('zzrwqz', payload)
        .then(res => {
          this.groupList = res.data?.list || res.data || []
          if (this.groupList.length > 0) {
            this.selectGroup(this.groupList[0])
          } else {
            this.clearActiveState()
          }
        })
        .catch(() => {
          this.groupList = []
          this.clearActiveState()
        })
        .finally(() => {
          this.groupLoading = false
        })
    },
    handleSearch() {
      this.fetchGroupList()
    },
    clearActiveState() {
      this.activeGroupId = null
      this.currentGroup = null
      this.networkLinks = []
    },

    selectGroup(qz) {
      if (!qz) return
      this.currentGroup = qz
      this.activeGroupId = qz.ZZRWQZID
      this.fetchGroupNetworkLinks()
    },

    fetchGroupNetworkLinks() {
      if (!this.activeGroupId) return
      this.detailLoading = true
      const payload = {
        pageNum: 1,
        pageSize: 10,
        params: {
          ZZRWQZID: this.activeGroupId,
          RWMC: this.searchQuery.RWMC || undefined,
          QZMC: this.currentGroup.QZMC || undefined
        }
      }

      apiPage('zzrwqzwl', payload)
        .then(res => {
          this.networkLinks = res.data?.list || res.data || []
        })
        .catch(() => {
          this.networkLinks = []
        })
        .finally(() => {
          this.detailLoading = false
        })
    },

    openCreateGroup() {
      this.isEditGroup = false
      this.groupForm = this.getInitGroupForm()
      if (this.selectedTask) {
        this.groupForm.ZZRWXXID =
          this.selectedTask.ZZRWID || this.selectedTask.zzrwid
      }
      this.groupDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.groupForm) this.$refs.groupForm.clearValidate()
      })
    },
    handleEditGroup(qz) {
      this.isEditGroup = true
      const form = {...qz}
      // 核心修复：反解回显级联组件数据
      if (qz.ZZRWPTIDS) {
        form.cascaderPlatformValues = qz.ZZRWPTIDS.split(',').map(item =>
          String(item)
        )
      } else {
        form.cascaderPlatformValues = []
      }
      this.groupForm = form
      this.groupDialogVisible = true
    },
    handleDeleteGroup(qz) {
      if (!qz.ZZRWQZID) return
      this.$confirm(`确认解散并注销 [${qz.QZMC}] 任务群组吗？`, '警示', {
        type: 'warning',
        confirmButtonText: '确定释放',
        cancelButtonText: '取消'
      }).then(() => {
        apiDelete('zzrwqz', qz.ZZRWQZID).then(() => {
          this.$message.success('任务群组解散就绪')
          this.fetchGroupList()
        })
      })
    },
    submitGroupForm() {
      this.$refs.groupForm.validate(valid => {
        if (!valid) return

        // 核心修复：提交前确保把 Cascader 里的数组组装转化为后端支持的 "1,2,3" 字符串
        if (
          this.groupForm.cascaderPlatformValues &&
          this.groupForm.cascaderPlatformValues.length > 0
        ) {
          this.groupForm.ZZRWPTIDS =
            this.groupForm.cascaderPlatformValues.join(',')
        } else {
          this.groupForm.ZZRWPTIDS = ''
        }

        const action = this.isEditGroup
          ? apiUpdate('zzrwqz', this.groupForm)
          : apiAdd('zzrwqz', this.groupForm)
        action.then(() => {
          this.$message.success('群组数据提交成功')
          this.groupDialogVisible = false
          this.fetchGroupList()
        })
      })
    },

    openCreateNetworkLink() {
      this.isEditLink = false
      this.linkForm = this.getInitLinkForm()
      this.linkForm.ZZRWQZID = this.activeGroupId
      this.linkDialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.linkForm) this.$refs.linkForm.clearValidate()
      })
    },
    handleEditLink(net) {
      this.isEditLink = true
      const form = {...net}
      // 核心修复：回显网络级联和多选业务
      form.ZZRWWLID = net.ZZRWWLID
      if (net.serviceTypes) {
        form.selectServiceTypes = String(net.serviceTypes)
          .split(',')
          .filter(Boolean)
      } else {
        form.selectServiceTypes = []
      }
      this.linkForm = form
      this.linkDialogVisible = true
    },
    handleDeleteLink(net) {
      if (!net.ZZRWQZWLID) return
      this.$confirm('确定从该群组下卸载该项网络通联指标吗？', '重要提示', {
        type: 'warning',
        confirmButtonText: '确定卸载',
        cancelButtonText: '取消'
      }).then(() => {
        apiDelete('zzrwqzwl', net.ZZRWQZWLID).then(() => {
          this.$message.success('网络映射关系卸载成功')
          this.fetchGroupNetworkLinks()
        })
      })
    },
    submitLinkForm() {
      this.$refs.linkForm.validate(valid => {
        if (!valid) return

        // 核心修复：提交前确保把下拉多选标签数组转化并合并为以逗号分隔的 serviceTypes 字符串
        if (
          this.linkForm.selectServiceTypes &&
          this.linkForm.selectServiceTypes.length > 0
        ) {
          this.linkForm.serviceTypes =
            this.linkForm.selectServiceTypes.join(',')
        } else {
          this.linkForm.serviceTypes = ''
        }

        const action = this.isEditLink
          ? apiUpdate('zzrwqzwl', this.linkForm)
          : apiAdd('zzrwqzwl', this.linkForm)
        action.then(() => {
          this.$message.success('网络指标部署成功')
          this.linkDialogVisible = false
          this.fetchGroupNetworkLinks()
        })
      })
    },

    findPlatformNameById(id) {
      const match = this.platformList.find(
        item => String(item.PTID) === String(id)
      )
      return match ? match.PTMC : '未知平台网元'
    },
    getStatusText(state) {
      const mapper = {0: '新建', 1: '启动', 2: '终止'}
      return mapper[state] !== undefined ? mapper[state] : '未知'
    },
    getQzStatusClass(state) {
      if (state === 1) return 'status-running'
      if (state === 2) return 'status-offline'
      return 'status-new'
    },
    parsePlatformCount(str) {
      if (!str) return 0
      return String(str).split(',').filter(Boolean).length
    },
    splitPlatformIds(str) {
      if (!str) return []
      return String(str).split(',').filter(Boolean)
    },
    parseServiceTypes(str) {
      if (!str) return []
      return String(str).split(',').filter(Boolean)
    }
  }
}
</script>

<style scoped>
/* 全深色战术大屏基调 */
.screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px;
}
.top-search-header {
  height: 46px;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.search-flex {
  display: flex;
  align-items: center;
  gap: 14px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-item label {
  font-size: 11px;
  color: #52637a;
  font-weight: bold;
}
.search-item input {
  background: #0d1522;
  border: 1px solid #1a293d;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  width: 150px;
}
.header-right-zone {
  display: flex;
  align-items: center;
  gap: 20px;
}
.context-tip {
  font-size: 11px;
  color: #7c8ba1;
}
.main-body-layout {
  display: flex;
  flex: 1;
  gap: 12px;
  height: calc(100% - 56px);
  min-height: 0;
}

/* LEFT 侧边栏 */
.left-platform-sidebar {
  width: 24%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
}
.sidebar-header-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 6px;
}
.sidebar-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #38bdf8;
}
.count-badge {
  font-size: 10px;
  color: #64748b;
  background: #0d1522;
  padding: 2px 6px;
  border-radius: 10px;
}
.platform-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 🌟【完美修复】重新设计的卡片结构：编辑删除放置于绝对右上角，与原有文字互不冲突 */
.platform-brief-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #64748b;
  border-radius: 3px;
  padding: 10px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}
.platform-brief-card:hover {
  background: #131f33;
}
.platform-brief-card.is-active {
  border-color: #38bdf8 !important;
  background: #13233c;
}

.platform-brief-card.status-running {
  border-left-color: #10b981;
}
.platform-brief-card.status-offline {
  border-left-color: #f43f5e;
}
.platform-brief-card.status-new {
  border-left-color: #38bdf8;
}

/* 右上角独立定位的操作按钮区 */
.absolute-action-corner {
  position: absolute;
  top: 6px;
  right: 8px;
  display: flex;
  gap: 6px;
  z-index: 10;
}
.corner-btn {
  padding: 0px;
  font-size: 13px;
  margin: 0 !important;
}
.btn-edit {
  color: #38bdf8;
}
.btn-edit:hover {
  color: #7dd3fc;
}
.btn-delete {
  color: #f43f5e;
}
.btn-delete:hover {
  color: #fda4af;
}

/* 文字图层：右边距留出 45px 的安全空隙，确保绝不发生重合 */
.card-text-content {
  padding-right: 45px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.card-title-row {
  width: 100%;
  display: flex;
}
.pt-name {
  font-size: 11px;
  font-weight: bold;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-sub-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
}
.bsh-txt {
  color: #475569;
  font-family: monospace;
}
.state-txt-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}
.status-running .state-txt-tag {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
.status-offline .state-txt-tag {
  color: #f43f5e;
  background: rgba(244, 63, 94, 0.1);
}

.card-count-row {
  font-size: 10px;
  color: #64748b;
}

/* RIGHT 看板区 */
.right-cascade-panel {
  width: 76%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  position: relative;
}
.cascade-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  gap: 12px;
  overflow-y: auto;
}
.detail-param-dashboard {
  background: #0c1424;
  border-radius: 4px;
  padding: 14px;
  border: 1px solid #16233b;
}
.border-cyan {
  border-left: 3px solid #38bdf8;
}
.border-emerald {
  border-left: 3px solid #10b981;
}
.panel-section-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  margin: 0 0 12px 0;
  letter-spacing: 0.5px;
}
.panel-inner-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.attribute-data-matrix {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 20px;
  background: #060b14;
  padding: 12px;
  border-radius: 4px;
}
.matrix-item {
  display: flex;
  font-size: 11px;
  align-items: center;
}
.m-label {
  color: #52637a;
  margin-right: 8px;
  font-size: 11px;
}
.m-value {
  color: #e2e8f0;
}

.platform-ids-box {
  margin-top: 10px;
  background: #060b14;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 11px;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.mini-tag {
  background: #111e30;
  border: 1px solid #1d3554;
  color: #38bdf8;
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 10px;
}

/* 网络联动网格 */
.network-links-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.net-link-sub-card {
  background: #070c14;
  border: 1px solid #1a293d;
  border-radius: 4px;
  padding: 12px;
}
.net-link-sub-card:hover {
  border-color: #10b981;
}
.sub-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #142030;
  padding-bottom: 6px;
  margin-bottom: 10px;
}
.net-id-badge {
  font-size: 10px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.08);
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
}
.mini-text-btn {
  font-size: 11px;
  padding: 0 4px;
}
.btn-modify {
  color: #38bdf8;
}
.btn-release {
  color: #f43f5e;
}

.sub-card-body-metrics {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  text-align: center;
  margin-bottom: 8px;
}
.metric-box,
.metric-boxHighlight {
  background: #0c1424;
  border-radius: 3px;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.metric-boxHighlight {
  background: #0f1c30;
  border: 1px dashed #1a365d;
}
.met-label {
  font-size: 10px;
  color: #475569;
}
.met-value {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.met-value small {
  font-size: 9px;
  font-weight: normal;
  color: #475569;
}

/* 通联业务标签 */
.sub-card-footer-business {
  background: #09101a;
  border-radius: 2px;
  padding: 6px 10px;
  font-size: 11px;
  display: flex;
  gap: 8px;
  align-items: center;
}
.biz-title {
  color: #52637a;
  font-weight: bold;
  flex-shrink: 0;
}
.biz-tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.biz-mini-bubble {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #10b981;
  padding: 0 5px;
  border-radius: 2px;
  font-size: 10px;
}

/* 空态基础样式 */
.empty-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #080e18;
  color: #52637a;
  font-size: 11px;
}
.radar-scan-loader {
  width: 24px;
  height: 24px;
  border: 2px dashed #1e293b;
  border-radius: 50%;
  animation: spin 4s linear infinite;
  margin-bottom: 8px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #334155;
  padding: 20px;
  width: 100%;
}
.model-empty-text-large {
  font-size: 11px;
  color: #475569;
  text-align: center;
  padding: 30px 0;
  font-style: italic;
}

.text-blue {
  color: #38bdf8;
}
.text-green {
  color: #10b981;
}
.text-orange {
  color: #f59e0b;
}
.text-cyan {
  color: #06b6d4;
}
.text-white {
  color: #fff;
}
.text-gray {
  color: #334155;
}
.font-num {
  font-family: monospace;
}

/* 深色表单弹窗及组件级联样式穿透 */
::v-deep .dark-dialog-clean {
  background-color: #090f1c !important;
  border: 1px solid #1e293b;
}
::v-deep .dark-dialog-clean .el-dialog__title {
  color: #fff;
  font-size: 12px;
}
::v-deep .dark-form .el-form-item__label {
  color: #94a3b8;
  font-size: 11px;
}
::v-deep .dark-form .el-input__inner,
::v-deep .dark-form .el-select .el-input__inner,
::v-deep .dark-form .el-cascader .el-input__inner,
::v-deep .dark-form .el-textarea__inner,
::v-deep .dark-form .el-input-number__increase,
::v-deep .dark-form .el-input-number__decrease {
  background-color: #050b14 !important;
  border-color: #1e293b !important;
  color: #fff !important;
  font-size: 11px;
}
::v-deep .el-cascader__dropdown,
::v-deep .el-select-dropdown {
  background-color: #09101d !important;
  border: 1px solid #223755 !important;
}
::v-deep .el-cascader-node:hover,
::v-deep .el-select-dropdown__item.hover {
  background-color: #14253d !important;
  color: #38bdf8 !important;
}
::v-deep .el-cascader-node.is-selectable.is-active,
::v-deep .el-select-dropdown__item.selected {
  color: #10b981 !important;
  font-weight: bold;
}
</style>
