<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <div class="search-item">
          <label>
            <Icon
              icon="lucide:search"
              :size="13"
              style="vertical-align: middle; margin-right: 4px"
            />
            网络检索
          </label>
          <el-input
            v-model="searchQuery.WLMC"
            @input="handleSearch"
            placeholder="输入网络名称检索..."
            size="small"
          />
        </div>
        <div class="search-btn-group">
          <el-button type="success" size="mini" @click="openCreateDialog">
            <Icon
              icon="lucide:plus"
              :size="13"
              style="vertical-align: middle; margin-right: 4px"
            />
            生成新网络需求
          </el-button>
        </div>
      </div>

      <div class="header-right-zone">
        <div class="context-tip" v-if="selectedTask">
          当前绑定任务:
          <span class="text-green font-num">{{
            selectedTask.RWMC || selectedTask.rwmc
          }}</span>
        </div>
        <div class="monitor-legend">
          <div class="legend-node">
            <span class="dot bg-running"></span>已开通
          </div>
          <div class="legend-node">
            <span class="dot bg-offline"></span>准备中
          </div>
        </div>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-platform-sidebar">
        <div class="sidebar-header-summary">
          <span class="title">
            <Icon
              icon="lucide:shield-alert"
              :size="14"
              style="
                vertical-align: middle;
                margin-right: 4px;
                color: #f59e0b;
                filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
              "
            />
            网络需求
          </span>
          <el-radio-group
            v-model="layoutMode"
            size="mini"
            class="mode-switcher"
          >
            <el-radio-button label="card">卡片</el-radio-button>
            <el-radio-button label="tree">层级树</el-radio-button>
          </el-radio-group>
        </div>

        <div
          v-if="layoutMode === 'card'"
          class="platform-scroll-list"
          v-loading="loading"
        >
          <div
            v-for="net in tableData"
            :key="net.ZZRWWLID"
            class="platform-brief-card"
            :class="[
              net.networkingState === 1 ? 'status-running' : 'status-offline',
              {'is-active': activeNetId === net.ZZRWWLID}
            ]"
            @click="selectNetwork(net)"
          >
            <div class="card-top">
              <span class="pt-name" :title="net.WLMC">
                <Icon
                  icon="lucide:git-commit"
                  :size="12"
                  style="color: #06b6d4; margin-right: 4px"
                />
                {{ net.WLMC }}
              </span>
            </div>
            <div class="card-sub-info">
              <span class="bsh-txt">编号: {{ net.ZZRWWLID }}</span>
              <span class="pt-type-tag">代号: {{ net.WLH }}</span>
            </div>
            <div class="brief-dynamics">
              <span>
                <Icon
                  icon="lucide:activity"
                  :size="11"
                  style="
                    vertical-align: middle;
                    margin-right: 2px;
                    color: #10b981;
                  "
                />
                {{ net.bandwidthRequirement || 0 }} Mbps
              </span>
              <span>
                <Icon
                  icon="lucide:timer"
                  :size="11"
                  style="
                    vertical-align: middle;
                    margin-right: 2px;
                    color: #f97316;
                  "
                />
                {{ net.latencyRequirement || 0 }} ms
              </span>
            </div>
            <div
              class="card-status-dot"
              :class="net.networkingState === 1 ? 'dot-running' : 'dot-offline'"
            ></div>
          </div>
          <div class="sub-empty" v-if="tableData.length === 0">
            暂无匹配的数据链需求
          </div>
        </div>

        <div v-else class="platform-tree-box" v-loading="loading">
          <el-tree
            :data="networkTree"
            node-key="ZZRWWLID"
            :props="{label: 'WLMC', children: 'children'}"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            class="dark-custom-tree"
            @node-click="selectNetwork"
          >
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span
                :class="[
                  'tree-dot',
                  data.networkingState === 1 ? 'bg-running' : 'bg-offline'
                ]"
              ></span>
              <span
                class="tree-icon-wrapper"
                style="
                  margin-right: 6px;
                  display: inline-flex;
                  align-items: center;
                "
              >
                <Icon
                  :icon="
                    data.children && data.children.length > 0
                      ? 'lucide:network'
                      : 'lucide:git-fork'
                  "
                  :size="13"
                  :style="{
                    color:
                      data.children && data.children.length > 0
                        ? '#38bdf8'
                        : '#a855f7',
                    filter:
                      data.children && data.children.length > 0
                        ? 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.5))'
                        : 'drop-shadow(0 0 3px rgba(168, 85, 247, 0.5))'
                  }"
                />
              </span>
              <span
                class="tree-label-txt"
                :class="{'text-active': activeNetId === data.ZZRWWLID}"
                >{{ node.label }}</span
              >
            </span>
          </el-tree>
          <div class="sub-empty" v-if="networkTree.length === 0">
            未形成拓扑级联树
          </div>
        </div>

        <div class="pagination-row-mini" v-if="layoutMode === 'card'">
          <el-pagination
            layout="prev, next"
            :current-page.sync="pagination.pageNum"
            :page-size="pagination.pageSize"
            :total="totalCount"
            @current-change="fetchList"
            small
          />
        </div>
      </div>

      <div class="right-cascade-panel">
        <div v-if="!activeNetId" class="empty-fallback">
          <div class="radar-scan-loader"></div>
          <p>请在左侧选择要调阅的数据链保障网络...</p>
        </div>

        <div
          v-show="activeNetId"
          class="cascade-content-wrapper"
          v-if="selectedNetwork"
        >
          <div class="detail-param-dashboard">
            <div class="panel-inner-title-flex">
              <span>
                <Icon
                  icon="lucide:satellite-dish"
                  :size="14"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-primary);
                  "
                />
                保障核心视角：{{ selectedNetwork.WLMC }}
              </span>
              <div class="action-control-bus">
                <el-button
                  type="text"
                  class="mini-text-btn btn-modify"
                  @click="handleEdit(selectedNetwork)"
                >
                  <Icon
                    icon="lucide:edit-3"
                    :size="12"
                    style="vertical-align: middle; margin-right: 2px"
                  />
                  修改
                </el-button>
                <el-button
                  type="text"
                  class="mini-text-btn btn-release"
                  @click="handleDelete(selectedNetwork)"
                >
                  <Icon
                    icon="lucide:trash-2"
                    :size="12"
                    style="vertical-align: middle; margin-right: 2px"
                  />
                  释放
                </el-button>
              </div>
            </div>

            <div class="params-matrix">
              <div class="matrix-item">
                <label>网络号</label>
                <span class="val text-blue font-num">{{
                  selectedNetwork.WLH
                }}</span>
              </div>
              <div class="matrix-item" style="grid-column: span 2">
                <label>物理网络类型</label>
                <span class="val text-orange">{{
                  wllxText(selectedNetwork.WLLX)
                }}</span>
              </div>
              <div class="matrix-item">
                <label>规划节点规模</label>
                <span class="val text-green font-num"
                  >{{ selectedNetwork.WLCYSL }} 节点</span
                >
              </div>
              <div class="matrix-item">
                <label>关联场景策略</label>
                <span class="val text-cyan">{{
                  getStrategyNameById(selectedNetwork.scenarioStrategyId) ||
                  '未关联'
                }}</span>
              </div>
              <div class="matrix-item">
                <label>指定网内簇首</label>
                <span class="val text-cyan">{{
                  getPlatformNameById(selectedNetwork.CSZZRWPTID) || '未指派'
                }}</span>
              </div>
              <div class="matrix-item">
                <label>开通状态评估</label>
                <span
                  :class="
                    selectedNetwork.networkingState === 1
                      ? 'text-green'
                      : 'text-gray'
                  "
                >
                  {{
                    selectedNetwork.networkingState === 1
                      ? '● 已部署就绪'
                      : '○ 规划准备中'
                  }}
                </span>
              </div>
            </div>
          </div>

          <div class="sub-fluid-layout">
            <div class="matrix-column-left">
              <div class="column-title">
                <Icon
                  icon="lucide:bar-chart-3"
                  :size="14"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-cyan);
                  "
                />
                物理链路保障要求
              </div>
              <div class="performance-flex-box">
                <div class="monitor-node node-performance">
                  <div class="node-name-bar">时延保障上限</div>
                  <div class="detail-grid-single">
                    <div class="metric-huge text-orange">
                      {{ selectedNetwork.latencyRequirement }}
                      <span class="unit">ms</span>
                    </div>
                  </div>
                </div>
                <div class="monitor-node node-performance">
                  <div class="node-name-bar">额定吞吐带宽</div>
                  <div class="detail-grid-single">
                    <div class="metric-huge text-blue">
                      {{ selectedNetwork.bandwidthRequirement }}
                      <span class="unit">Mbps</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="column-title" style="margin-top: 12px">
                <Icon
                  icon="lucide:shield-check"
                  :size="14"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-success);
                  "
                />
                业务通联与安全策略
              </div>
              <div class="monitor-node node-combined-block">
                <div class="combined-item">
                  <span class="label-tag">业务类型:</span>
                  <div class="tags-row">
                    <span
                      v-for="t in splitData(selectedNetwork.serviceTypes)"
                      :key="t"
                      class="mini-text-badge font-cyan"
                      >{{ t }}</span
                    >
                    <span v-if="!selectedNetwork.serviceTypes" class="text-gray"
                      >暂未点选业务</span
                    >
                  </div>
                </div>
                <div
                  class="combined-item"
                  style="
                    margin-top: 8px;
                    border-top: 1px solid #111b2b;
                    padding-top: 8px;
                  "
                >
                  <span class="label-tag">保密级别:</span>
                  <span class="text-orange font-bold">{{
                    selectedNetwork.safeRequirement || '未设定'
                  }}</span>
                </div>
              </div>
            </div>

            <div class="matrix-column-right">
              <div class="column-title">
                <Icon
                  icon="lucide:radar"
                  :size="14"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-warning);
                  "
                />
                战术平台组网状态监测 (根据当前网络选择计算)
              </div>
              <div class="matrix-scroll-box platform-status-grid">
                <div
                  v-for="pt in flattenPlatforms"
                  :key="pt.ZZRWPTID"
                  class="pt-status-card"
                  :class="
                    isPlatformInNetwork(pt.ZZRWPTID)
                      ? 'pt-in-net'
                      : 'pt-out-net'
                  "
                >
                  <div class="pt-card-header">
                    <span class="pt-mc-text">
                      <Icon
                        icon="lucide:cpu"
                        :size="12"
                        style="
                          vertical-align: middle;
                          margin-right: 4px;
                          color: var(--color-cyan);
                        "
                      />
                      {{ pt.PTMC || '未知平台' }}
                    </span>
                    <span class="status-indicator-tag">
                      {{
                        isPlatformInNetwork(pt.ZZRWPTID)
                          ? '⚡已组网'
                          : '📁未加入'
                      }}
                    </span>
                  </div>
                  <div class="pt-card-meta">
                    <span>标识: {{ pt.ZZRWPTID }}</span>
                    <span v-if="pt.PARENTPTMC">上级: {{ pt.PARENTPTMC }}</span>
                  </div>
                </div>
                <div v-if="flattenPlatforms.length === 0" class="sub-empty">
                  外部未同步演训任务平台数据
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :visible.sync="dialogVisible"
      width="680px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <span slot="title" class="dialog-title-slot">
        <Icon
          :icon="isEdit ? 'lucide:sliders' : 'lucide:rocket'"
          :size="16"
          style="
            vertical-align: middle;
            margin-right: 6px;
            color: var(--color-primary);
          "
        />
        {{ isEdit ? '调整战术网络保障参数' : '录入全新战术组网需求' }}
      </span>

      <el-form
        :model="form"
        ref="netForm"
        :rules="rules"
        label-width="130px"
        size="mini"
        class="dark-form"
      >
        <div class="form-grid-2col">
          <el-form-item label="网络名称" prop="WLMC">
            <el-input v-model="form.WLMC" placeholder="请键入保障网络描述" />
          </el-form-item>
          <!-- <el-form-item label="网络代号" prop="WLH">
            <el-input-number v-model="form.WLH" :min="1" style="width: 100%" />
          </el-form-item> -->
          <el-form-item label="网络分类" prop="WLLX">
            <el-select
              v-model="form.WLLX"
              placeholder="映射物理层规格"
              style="width: 100%"
            >
              <el-option
                v-for="(val, key) in wllxDict"
                :key="key"
                :label="val"
                :value="Number(key)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="规划成员规模">
            <el-input-number
              v-model="form.WLCYSL"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="网内级联父节点">
            <el-select
              v-model="form.parentWLID"
              clearable
              placeholder="若为子网请指定上级网络"
              style="width: 100%"
            >
              <el-option
                v-for="item in tableData"
                :key="item.ZZRWWLID"
                :label="item.WLMC"
                :value="item.ZZRWWLID"
                v-show="item.ZZRWWLID !== form.ZZRWWLID"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="指定网内簇首">
            <el-select
              v-model="form.CSZZRWPTID"
              clearable
              placeholder="指派主导或中继核心平台"
              style="width: 100%"
            >
              <el-option
                v-for="pt in flattenPlatforms"
                :key="pt.ZZRWPTID"
                :label="pt.PTMC"
                :value="pt.ZZRWPTID"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="场景策略">
            <el-select
              v-model="form.scenarioStrategyId"
              clearable
              placeholder="关联场景策略（来自策略配置）"
              style="width: 100%"
            >
              <el-option
                v-for="item in scenarioStrategyOptions"
                :key="item.scenarioStrategyId"
                :label="item.strategyName"
                :value="item.scenarioStrategyId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="时延要求 (ms)">
            <el-input-number
              v-model="form.latencyRequirement"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="频宽要求 (Mbps)">
            <el-input-number
              v-model="form.bandwidthRequirement"
              :min="0"
              style="width: 100%"
            />
          </el-form-item>
        </div>

        <el-form-item label="通联业务选择">
          <el-checkbox-group v-model="form.serviceTypesArray">
            <el-checkbox
              v-for="item in tlywOptions"
              :key="item"
              :label="item"
              >{{ item }}</el-checkbox
            >
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="安全保密级别">
          <el-radio-group v-model="form.safeRequirement">
            <el-radio v-for="item in aqbmOptions" :key="item" :label="item"
              >{{ item }}级保密</el-radio
            >
          </el-radio-group>
        </el-form-item>

        <el-form-item label="开通阶段状态">
          <el-radio-group v-model="form.networkingState">
            <el-radio :label="0">准备中</el-radio>
            <el-radio :label="1">就绪开通</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="网内参与平台">
          <el-select
            v-model="form.selectedPlatformIds"
            multiple
            collapse-tags
            placeholder="多选勾选参战或演训保障平台"
            style="width: 100%"
          >
            <el-option
              v-for="pt in flattenPlatforms"
              :key="pt.ZZRWPTID"
              :label="pt.PTMC"
              :value="pt.ZZRWPTID"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitForm"
          >确认部署</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
// 1. 引入统一封装的通用动态接口
import {apiPage, apiAdd, apiUpdate, apiDelete, apiGetAll} from '@/api/common.js'
// 引入树形结构转换工具
import {buildTree} from '@/utils' // 或是相对应的工程路径
// 3. 引入通联业务和安全保密要求字典函数
import {tlywList, aqbmList} from '@/api/map'

export default {
  name: 'ZzrwWlManager',
  props: {
    selectedTask: {type: Object, default: () => null},
    // 外部父组件传入的作战任务平台集合数组
    platformTreeNodes: {type: Array, default: () => []}
  },
  data() {
    return {
      loading: false,
      layoutMode: 'card', // 'card' 为列表卡片，'tree' 为层级树
      tableData: [],
      networkTree: [], // 转换后的树数据
      totalCount: 0,
      wllxDict: {},
      searchQuery: {WLMC: ''},
      pagination: {pageNum: 1, pageSize: 50}, // 树形或大量呈现时适当扩大容量
      dialogVisible: false,
      isEdit: false,
      activeNetId: null,
      selectedNetwork: null,
      tlywOptions: [], // 存储从外部函数获取的通联字典
      aqbmOptions: [], // 存储从外部函数获取的安全字典
      scenarioStrategyOptions: [], // 场景策略列表（来自 rest/scenarioStrategy/scenarioStrategies）
      form: this.getInitForm(),
      rules: {
        WLMC: [{required: true, message: '请指定网络描述', trigger: 'blur'}],
        WLLX: [{required: true, message: '请选择物理类型', trigger: 'change'}]
      }
    }
  },
  computed: {
    // 平铺外部传入的深层作战任务平台树，方便匹配、状态看板以及下拉框渲染
    flattenPlatforms() {
      const result = []
      const format = nodes => {
        nodes.forEach(node => {
          result.push({
            ZZRWPTID: node.ZZRWPTID || node.zzrwptid || node.PTID || node.ptid,
            PTMC: node.PTMC || node.ptmc || node.name,
            PARENTPTMC: node.PARENTPTMC || node.parentPtmc
          })
          if (node.children && node.children.length > 0) {
            format(node.children)
          }
        })
      }
      if (this.platformTreeNodes && this.platformTreeNodes.length > 0) {
        format(this.platformTreeNodes)
      }
      return result
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
  mounted() {
    this.loadWllxDictionary()
    // 加载精细化配置映射
    this.tlywOptions =
      typeof tlywList === 'function'
        ? tlywList()
        : ['态势', '语音', '视频', '文电', '目指', '话音', '指令', '图像']
    this.aqbmOptions =
      typeof aqbmList === 'function' ? aqbmList() : ['高', '中', '低']
    // 加载场景策略列表
    this.loadScenarioStrategies()
  },
  methods: {
    getInitForm() {
      return {
        ZZRWWLID: null,
        ZZRWXXID: null,
        parentWLID: null,
        WLMC: '',
        WLH: 1,
        WLLX: null,
        WLCYSL: 0,
        latencyRequirement: 20,
        bandwidthRequirement: 100,
        serviceTypes: '',
        serviceTypesArray: [], // 表单辅助多选绑定
        safeRequirement: '中',
        ZZRWPTIDS: '',
        selectedPlatformIds: [], // 表单辅助多选绑定
        CSZZRWPTID: null, // 簇首平台 ID
        networkingState: 0,
        scenarioStrategyId: null // 关联的场景策略标识
      }
    },
    // 从 rest/scenarioStrategy/scenarioStrategies 加载场景策略列表
    loadScenarioStrategies() {
      apiGetAll('scenarioStrategy', null, 'scenarioStrategies')
        .then(res => {
          const list = res.data || res || []
          // 兼容多种返回格式
          this.scenarioStrategyOptions = Array.isArray(list)
            ? list
            : list.list || []
        })
        .catch(() => {
          this.scenarioStrategyOptions = []
        })
    },
    // 根据 scenarioStrategyId 获取策略名称
    getStrategyNameById(id) {
      if (!id) return ''
      const target = this.scenarioStrategyOptions.find(
        s => String(s.scenarioStrategyId) === String(id)
      )
      return target ? target.strategyName : `策略#${id}`
    },
    loadWllxDictionary() {
      apiGetAll('zzrwwl', null, 'wllxMap')
        .then(res => {
          this.wllxDict = res.data || res || {}
        })
        .catch(() => {
          this.wllxDict = {
            1: '大容量混合网',
            2: '视距集成数据链',
            3: '高速率微波链路',
            4: '低时延全向网'
          }
        })
    },
    wllxText(typeKey) {
      return this.wllxDict[typeKey] || `模式(${typeKey})`
    },
    // 统一划分字符串工具
    splitData(str) {
      if (!str) return []
      return str.split(',').filter(Boolean)
    },
    // 判断某个平台是否包含在当前网络分配需求中
    isPlatformInNetwork(ptId) {
      if (!this.selectedNetwork || !this.selectedNetwork.ZZRWPTIDS || !ptId)
        return false
      const ids = this.selectedNetwork.ZZRWPTIDS.split(',')
      return ids.includes(String(ptId))
    },
    // 依据 ID 在平铺平台列表查询其名称
    getPlatformNameById(ptId) {
      if (!ptId) return ''
      const target = this.flattenPlatforms.find(
        p => String(p.ZZRWPTID) === String(ptId)
      )
      return target ? target.PTMC : `平台#${ptId}`
    },
    fetchList() {
      this.loading = true
      const payload = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        params: {
          WLMC: this.searchQuery.WLMC || undefined,
          ZZRWID: this.selectedTask
            ? this.selectedTask.ZZRWID || this.selectedTask.zzrwid
            : undefined
        }
      }

      apiPage('zzrwwl', payload)
        .then(res => {
          this.tableData = res.data?.list || res.data || []
          this.totalCount = res.data?.total || this.tableData.length

          // 运行引入的树合并工具函数，动态计算并转化为级联层次树
          this.networkTree = buildTree(
            this.tableData,
            'ZZRWWLID',
            'parentWLID',
            null
          )

          if (this.tableData.length > 0 && !this.activeNetId) {
            this.selectNetwork(this.tableData[0])
          }
        })
        .catch(() => {
          this.tableData = []
          this.networkTree = []
          this.resetActiveState()
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleSearch() {
      this.fetchList()
    },
    selectNetwork(net) {
      if (!net) return
      // console.log('选中网络:', net)
      this.selectedNetwork = {...net, parentWLID: Number(net.parentWLID)}
      this.activeNetId = net.ZZRWWLID
    },
    resetActiveState() {
      this.activeNetId = null
      this.selectedNetwork = null
    },
    openCreateDialog() {
      this.isEdit = false
      this.form = this.getInitForm()
      if (this.selectedTask) {
        this.form.ZZRWXXID =
          this.selectedTask.ZZRWXXID || this.selectedTask.zzrwxxid
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.netForm) this.$refs.netForm.clearValidate()
      })
    },
    handleEdit(row) {
      this.isEdit = true
      // 深度回填并解译逗号分隔的绑定集
      const formCopy = {...row}
      formCopy.serviceTypesArray = this.splitData(row.serviceTypes)
      formCopy.selectedPlatformIds = this.splitData(row.ZZRWPTIDS).map(id =>
        isNaN(id) ? id : Number(id)
      )
      // 确保 scenarioStrategyId 回填时转为数字（后端 Long 兼容）
      if (
        formCopy.scenarioStrategyId !== undefined &&
        formCopy.scenarioStrategyId !== null
      ) {
        formCopy.scenarioStrategyId = Number(formCopy.scenarioStrategyId)
      }
      this.form = formCopy
      this.dialogVisible = true
    },
    handleDelete(row) {
      const id = row.ZZRWWLID
      if (!id) return
      this.$confirm('确认释放该项战术数据链网络要求吗？', '重要提示', {
        type: 'warning',
        confirmButtonText: '确定释放',
        cancelButtonText: '取消'
      }).then(() => {
        apiDelete('zzrwwl', id).then(() => {
          this.$message.success('释放成功')
          this.activeNetId = null
          this.fetchList()
        })
      })
    },
    submitForm() {
      this.$refs.netForm.validate(valid => {
        if (!valid) return

        // 转换回装数组为后端标准逗号串
        this.form.serviceTypes = this.form.serviceTypesArray.join(',')
        this.form.ZZRWPTIDS = this.form.selectedPlatformIds.join(',')

        const action = this.isEdit
          ? apiUpdate('zzrwwl', this.form)
          : apiAdd('zzrwwl', this.form)
        action.then(() => {
          this.$message.success('同步成功')
          this.dialogVisible = false
          this.fetchList()
        })
      })
    }
  }
}
</script>

<style scoped>
/* ==========================================
   全深色战术大屏骨架样式
   ========================================== */
.screen-container {
  width: 100%;
  height: 100%;
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
  margin-bottom: 11px;
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
  color: #94a3b8;
  font-weight: bold;
}
.search-item input {
  background: #0d1522;
  border: 1px solid #1a293d;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  width: 160px;
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
.monitor-legend {
  display: flex;
  gap: 12px;
}
.legend-node {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #7c8ba1;
}
.legend-node .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.bg-running {
  background: #10b981;
}
.bg-offline {
  background: #94a3b8;
}

/* 主体分栏 */
.main-body-layout {
  display: flex;
  flex: 1;
  gap: 12px;
  height: calc(100% - 56px);
  min-height: 0;
}

/* LEFT: 侧边栏（卡片和树形公用） */
.left-platform-sidebar {
  width: 24%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 11px;
  box-sizing: border-box;
}
.sidebar-header-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 11px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 6px;
}
.sidebar-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #38bdf8;
}
::v-deep .mode-switcher .el-radio-button__inner {
  background: #0d1522;
  border-color: #1a293d;
  color: #94a3b8;
  padding: 4px 11px;
  font-size: 11px;
}
::v-deep
  .mode-switcher
  .el-radio-button__orig-radio:checked
  + .el-radio-button__inner {
  background: #1e293b;
  color: #38bdf8;
  box-shadow: none;
}

.platform-scroll-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.platform-tree-box {
  flex: 1;
  overflow-y: auto;
  background: #070c14;
  border-radius: 4px;
  padding: 6px;
}

/* 战术需求卡片 */
.platform-brief-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #172438;
  border-radius: 3px;
  padding: 8px 11px;
  cursor: pointer;
  position: relative;
}
.platform-brief-card:hover {
  background: #131f33;
}
.platform-brief-card.is-active {
  border-color: #38bdf8 !important;
  background: #13233c;
}
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pt-name {
  font-size: 11px;
  font-weight: bold;
  color: #ffffff;
}
.card-sub-info {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 11px;
}
.bsh-txt {
  color: #415169;
  font-family: monospace;
}
.pt-type-tag {
  color: #94a3b8;
}
.brief-dynamics {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 11px;
  color: #8a99ad;
  font-family: monospace;
}
.card-status-dot {
  position: absolute;
  top: 11px;
  right: 11px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.dot-running {
  background-color: #10b981;
  box-shadow: 0 0 6px #10b981;
}
.dot-offline {
  background-color: #94a3b8;
}

.pagination-row-mini {
  margin-top: 6px;
  text-align: right;
  background: #070c14;
}

/* RIGHT: 看板面板 */
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
}

/* 姿态核心参数视窗 */
.detail-param-dashboard {
  background: #0c1424;
  border-radius: 4px;
  padding: 11px;
  margin-bottom: 12px;
  border-left: 3px solid #38bdf8;
}
.panel-inner-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

/* 2. 移除英文标识，精细化微缩操作字体 */
.mini-text-btn {
  font-size: 11px;
  padding: 2px 4px;
}
.btn-modify {
  color: #38bdf8;
}
.btn-modify:hover {
  color: #7dd3fc;
}
.btn-release {
  color: #f43f5e;
}
.btn-release:hover {
  color: #fda4af;
}

.params-matrix {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  margin-top: 8px;
}
.matrix-item {
  background: #070c14;
  padding: 6px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
}
.matrix-item label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: bold;
}
.matrix-item .val {
  font-weight: bold;
}

/* 下方数据流布局 */
.sub-fluid-layout {
  display: grid;
  grid-template-columns: 35% 65%;
  gap: 12px;
  flex: 1;
  min-height: 0;
}
.matrix-column-left {
  display: flex;
  flex-direction: column;
}
.matrix-column-right {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.column-title {
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid #111b2b;
}

.performance-flex-box {
  display: flex;
  gap: 8px;
}
.performance-flex-box .monitor-node {
  flex: 1;
}

/* 4. 优化合并后的通联和保密紧凑小卡片 */
.node-combined-block {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 11px;
  margin-top: 4px;
}
.combined-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
}
.combined-item .label-tag {
  color: #94a3b8;
  font-weight: bold;
  flex-shrink: 0;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.mini-text-badge {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.2);
  color: #06b6d4;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 11px;
}

/* 平台联网状态网格卡片流 */
.matrix-scroll-box {
  flex: 1;
  overflow-y: auto;
}
.platform-status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  align-content: flex-start;
}
.pt-status-card {
  background: #0a101a;
  border: 1px solid #162235;
  border-radius: 4px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pt-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pt-mc-text {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.status-indicator-tag {
  font-size: 11px;
  font-family: monospace;
}
.pt-card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #94a3b8;
}

/* 根据组网计算的动态样式切换 */
.pt-in-net {
  border-top: 2px solid #10b981;
  background: rgba(16, 185, 129, 0.02);
}
.pt-in-net .status-indicator-tag {
  color: #10b981;
}
.pt-out-net {
  border-top: 2px solid #334155;
  opacity: 0.5;
}
.pt-out-net .status-indicator-tag {
  color: #94a3b8;
}

/* 基础原子节点 */
.monitor-node {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px;
}
.node-performance {
  border-left: 2px solid #06b6d4;
}
.node-name-bar {
  font-size: 11px;
  color: #94a3b8;
  padding-bottom: 2px;
  margin-bottom: 4px;
}
.metric-huge {
  font-size: 18px;
  font-family: monospace;
  font-weight: bold;
}
.metric-huge .unit {
  font-size: 11px;
  color: #94a3b8;
}

/* 空状态和加载 */
.empty-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #080e18;
  color: #415169;
  font-size: 11px;
}
.radar-scan-loader {
  width: 24px;
  height: 24px;
  border: 2px dashed #172438;
  border-radius: 50%;
  animation: spin 4s linear infinite;
  margin-bottom: 6px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #223147;
  padding: 12px;
  width: 100%;
  box-sizing: border-box;
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
.text-gray {
  color: #94a3b8;
}
.font-bold {
  font-weight: bold;
}
.font-num {
  font-family: monospace;
}

.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 8px;
}
</style>
