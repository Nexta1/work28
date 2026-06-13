<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <div class="search-item">
          <label>网络检索</label>
          <el-input
            v-model="searchQuery.WLMC"
            @input="handleSearch"
            placeholder="输入网络名称检索..."
            size="small"
          />
        </div>
      </div>

      <div class="header-right-zone">
        <div class="context-tip" v-if="selectedTask">
          当前绑定任务:
          <span class="text-green font-num">{{
            selectedTask.RWMC || selectedTask.rwmc
          }}</span>
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

      <div class="right-cascade-panel" v-loading="strategyLoading">
        <div v-if="!activeNetId" class="empty-fallback">
          <div class="radar-scan-loader"></div>
          <p>请在左侧选择要调阅保障网络以管理分级运控策略...</p>
        </div>

        <div
          v-show="activeNetId"
          class="cascade-content-wrapper"
          v-if="selectedNetwork"
        >
          <div class="detail-param-dashboard">
            <div class="panel-inner-title-flex">
              <span
                >🎯 运控主导视角：{{ selectedNetwork.WLMC }} --
                分级运控策略</span
              >
              <div class="action-control-bus">
                <el-button
                  type="success"
                  size="mini"
                  icon="el-icon-plus"
                  @click="openCreateDialog"
                >
                  新增运控策略
                </el-button>
              </div>
            </div>
          </div>

          <div class="strategy-card-scroll-container">
            <div
              v-for="item in strategyTableData"
              :key="item.ocStrategyId"
              class="strategy-item-card"
            >
              <div class="strategy-card-header">
                <div class="header-left">
                  <span class="strategy-badge">{{ item.strategyType }}</span>
                  <h4 class="strategy-title">{{ item.strategyName }}</h4>
                  <span class="strategy-id-tag"
                    >ID: {{ item.ocStrategyId }}</span
                  >
                </div>
                <div class="header-right-actions">
                  <el-button
                    type="text"
                    icon="el-icon-edit"
                    class="action-btn btn-edit"
                    @click="handleEdit(item)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    icon="el-icon-delete"
                    class="action-btn btn-delete"
                    @click="handleDelete(item)"
                    >删除</el-button
                  >
                </div>
              </div>

              <div class="strategy-card-body">
                <div class="model-json-title">
                  <Icon
                    icon="lucide:square-gantt-chart"
                    :size="13"
                    style="
                      vertical-align: middle;
                      margin-right: 4px;
                      color: #38bdf8;
                      filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
                    "
                  />
                  运控元数据配置模型
                </div>
                <div
                  class="model-kv-grid"
                  v-if="parseStrategyModel(item.strategyModel).length > 0"
                >
                  <div
                    v-for="attr in parseStrategyModel(item.strategyModel)"
                    :key="attr.key"
                    class="kv-item"
                  >
                    <span class="kv-label">{{ attr.labelName }}:</span>
                    <span class="kv-value font-num">{{ attr.valDisplay }}</span>
                  </div>
                </div>
                <div class="model-empty-text" v-else>
                  未配置动态控制规则项 (或格式为空)
                </div>
              </div>
            </div>

            <div class="sub-empty" v-if="strategyTableData.length === 0">
              该保障网络下暂无规划的分级运控策略
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="isEdit ? '🛠️ 调整战术分级运控策略' : '🚀 录入全新分级运控策略'"
      :visible.sync="dialogVisible"
      width="580px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <el-form
        :model="form"
        ref="strategyForm"
        :rules="rules"
        label-width="111px"
        size="mini"
        class="dark-form"
      >
        <el-form-item label="策略类型" prop="strategyType">
          <el-select
            v-model="form.strategyType"
            placeholder="请选择运控策略类型"
            style="width: 100%"
            @change="handleStrategyTypeChange"
          >
            <el-option
              v-for="item in strategyTypeOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <div class="dynamic-attr-divider" v-if="dynamicAttributes.length > 0">
          <span class="divider-text">模型动态属性填充</span>
        </div>

        <div class="dynamic-fields-wrapper" v-loading="attrLoading">
          <el-form-item
            v-for="attr in dynamicAttributes"
            :key="attr.apiKey"
            :label="attr.attrName"
            :required="true"
          >
            <el-input-number
              v-if="
                attr.attrType === '整数' ||
                attr.attrType === '长整数' ||
                attr.attrType === '浮点数'
              "
              v-model="dynamicFormValues[attr.apiKey]"
              :precision="attr.attrType === '浮点数' ? 2 : 0"
              style="width: 100%"
              controls-position="right"
            />

            <el-select
              v-else-if="attr.attrType === '选择项'"
              v-model="dynamicFormValues[attr.apiKey]"
              placeholder="请做出战术级筛选"
              style="width: 100%"
            >
              <el-option
                v-for="opt in attr.options"
                :key="opt.id"
                :label="opt.name"
                :value="opt.id"
              />
            </el-select>

            <el-date-picker
              v-else-if="attr.attrType === '日期时间'"
              v-model="dynamicFormValues[attr.apiKey]"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选取时间节点"
              style="width: 100%"
            />

            <el-input
              v-else
              v-model="dynamicFormValues[attr.apiKey]"
              :placeholder="'请输入' + attr.attrName"
            />
          </el-form-item>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取消</el-button>
        <el-button size="mini" type="primary" @click="submitForm"
          >保存部署</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {apiPage, apiAdd, apiUpdate, apiDelete, apiGetAll} from '@/api/common.js'
import {buildTree} from '@/utils'
// 导入外部指定映射字典函数
import {getStrategyTypes, getAttributeMap, getAttrTypes} from '@/api/map'

export default {
  name: 'OperationalControlScheme',
  props: {
    selectedTask: {type: Object, default: () => null}
  },
  data() {
    return {
      totalCount: 0,
      loading: false,
      strategyLoading: false,
      attrLoading: false,
      layoutMode: 'card',
      tableData: [],
      networkTree: [],
      searchQuery: {WLMC: ''},
      pagination: {pageNum: 1, pageSize: 50},
      operatorDict: {},
      fullAttributeDict: {},
      // 策略管理核心状态
      activeNetId: null,
      selectedNetwork: null,
      strategyTableData: [],
      strategyTypeOptions: [],

      dialogVisible: false,
      isEdit: false,
      form: this.getInitForm(),
      rules: {
        strategyType: [
          {required: true, message: '请指派策略响应分类', trigger: 'change'}
        ]
      },

      // 动态表单所需配置状态
      attributeKeyMap: {}, // 来自 getAttributeMap 的 KV 对象
      dynamicAttributes: [], // 当前类型拉取到的策略属性规则项
      dynamicFormValues: {} // 专门独立存放动态输入框模型字段的值
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
    // 载入原有的常量与属性 Key 映射规则
    this.strategyTypeOptions =
      typeof getStrategyTypes === 'function' ? getStrategyTypes() : []
    this.attributeKeyMap =
      typeof getAttributeMap === 'function' ? getAttributeMap() : {}

    // 1. 初始化加载选择项中文映射表
    this.initOperatorDictionary()
    // 2. 初始化全量加载属性定义表，用于识别 attrType
    this.initFullAttributeDictionary()
  },
  methods: {
    initOperatorDictionary() {
      // 适配您的接口规范，查询所有选择项字典
      const payload = {
        pageNum: 1,
        pageSize: 1000 // 传入足够大的数值以获取全量字典
      }
      // 这里的 'ocStrategyOperator' 对应您提及的路由标识，也可以根据后端实际调整为 'ocStrategyOperators'
      apiGetAll('ocStrategyOperator', payload, 'ocStrategyOperators')
        .then(res => {
          const rawList = res.data?.list || res.data || []
          const dict = {}
          rawList.forEach(item => {
            if (item.ocStrategyOperatorId !== undefined && item.operatorName) {
              // 建立 ID 到 名称 的映射转换表
              dict[String(item.ocStrategyOperatorId)] = item.operatorName
            }
          })
          this.operatorDict = dict
        })
        .catch(err => {
          console.error('加载运控选择项字典失败:', err)
        })
    },
    // 全量加载属性配置表 (用来做属性类型 attrType 判断)
    initFullAttributeDictionary() {
      apiPage('ocStrategyAttr', {pageNum: 1, pageSize: 1000}).then(res => {
        const rawList = res.data?.list || res.data || []
        const dict = {}
        rawList.forEach(item => {
          if (item.attrName) {
            // 根据组件的全局映射字典，找出该中文属性对应的英文 Key
            let apiKey = null
            for (const [cnKey, enKey] of Object.entries(this.attributeKeyMap)) {
              if (item.attrName == cnKey) {
                apiKey = enKey
                break
              }
            }
            if (!apiKey) apiKey = item.attrName

            // 将属性的元数据缓存起来
            dict[apiKey] = {
              attrType: item.attrType,
              attrName: item.attrName
            }
          }
        })

        this.fullAttributeDict = dict
      })
    },
    getInitForm() {
      return {
        ocStrategyId: null,
        ZZRWWLID: null,

        strategyType: '',
        strategyModel: ''
      }
    },
    // 左侧保障网络列表数据
    fetchList() {
      this.loading = true
      const payload = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        params: {
          WLMC: this.searchQuery.WLMC || undefined,
          ZZRWID: this.selectedTask
            ? this.selectedTask.ZZRWID || this.selectedTask.zzrwid
            : undefined,
          RWMC: this.selectedTask ? this.selectedTask.RWMC : undefined
        }
      }
      apiPage('zzrwwl', payload)
        .then(res => {
          this.tableData = res.data?.list || res.data || []
          this.totalCount = res.data?.total || this.tableData.length
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
      this.selectedNetwork = net
      this.activeNetId = net.ZZRWWLID
      this.fetchStrategyList()
    },
    resetActiveState() {
      this.activeNetId = null
      this.selectedNetwork = null
      this.strategyTableData = []
    },

    // 查询当前网络关联的运控策略 (传参遵循严格规范)
    fetchStrategyList() {
      if (!this.activeNetId) return
      this.strategyLoading = true
      const payload = {
        pageNum: 1,
        pageSize: 10,
        params: {
          ZZRWWLID: this.activeNetId
        }
      }
      apiPage('ocStrategy', payload)
        .then(res => {
          this.strategyTableData = res.data?.list || res.data || []
        })
        .catch(() => {
          this.strategyTableData = []
        })
        .finally(() => {
          this.strategyLoading = false
        })
    },

    // 2. 根据策略类型动态查询关联的属性结构配置规则
    loadDynamicAttributes(strategyType, callback) {
      this.attrLoading = true
      this.dynamicAttributes = []

      // 提取策略类型的简称，例如从 '一级运控策略' 中提取出符合接口规律的模糊词 '一级'
      const typeKeyword = strategyType

      // 组装格式 {"pageNum":1,"pageSize":10,"params":{"strategyType":"一级"}}
      const payload = {
        pageNum: 1,
        pageSize: 10,
        params: {
          strategyType: typeKeyword
        }
      }

      apiPage('ocStrategyAttr', payload)
        .then(res => {
          const rawAttrs = res.data?.list || res.data || []
          const fields = []
          const initVals = {}

          rawAttrs.forEach(item => {
            // 在原始映射对象中寻找中文全匹配或包含包含匹配的英文 Key 键值
            let apiKey = null
            for (const [cnKey, enKey] of Object.entries(this.attributeKeyMap)) {
              if (item.attrName && cnKey == item.attrName) {
                apiKey = enKey
                break
              }
            }
            // 若没有找到内置映射，默认转为小写字母降级处理
            if (!apiKey) apiKey = item.attrName

            // 针对“选择项”类型，切解并组装下拉 Option 数组
            let options = []
            if (
              item.attrType === '选择项' &&
              item.optionOperatorIds &&
              item.optionOperatorNames
            ) {
              const ids = item.optionOperatorIds.split(',')
              const names = item.optionOperatorNames.split(',')
              options = ids.map((id, index) => ({
                id: id.trim(),
                name: names[index] ? names[index].trim() : id
              }))
            }

            fields.push({
              ...item,
              apiKey, // 英文传输字段键名
              options
            })

            // 初始化默认响应式字段值
            initVals[apiKey] = item.attrType === '选择项' ? '' : undefined
          })

          this.dynamicAttributes = fields
          this.dynamicFormValues = initVals

          if (callback) callback()
        })
        .catch(() => {
          this.dynamicAttributes = []
          this.dynamicFormValues = {}
        })
        .finally(() => {
          this.attrLoading = false
        })
    },

    // 切换策略类型联动触发属性结构刷新
    handleStrategyTypeChange(val) {
      this.loadDynamicAttributes(val, null)
    },

    // 打开新建策略
    openCreateDialog() {
      this.isEdit = false
      this.form = this.getInitForm()
      this.form.ZZRWWLID = this.activeNetId
      this.dynamicAttributes = []
      this.dynamicFormValues = {}
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.strategyForm) this.$refs.strategyForm.clearValidate()
      })
    },

    // 打开编辑策略（支持动态 JSON 属性值反向绑定回填）
    handleEdit(row) {
      this.isEdit = true
      this.form = {...row}
      this.dialogVisible = true

      // 先根据当前策略类型加载结构元数据，完毕后将 strategyModel 内部的值解析映射
      this.loadDynamicAttributes(row.strategyType, () => {
        if (row.strategyModel) {
          try {
            const modelObj = JSON.parse(row.strategyModel)
            // 循环遍历后端反解的对象，还原赋值
            for (const key in this.dynamicFormValues) {
              if (Object.prototype.hasOwnProperty.call(modelObj, key)) {
                this.dynamicFormValues[key] = modelObj[key]
              }
            }
          } catch (e) {
            console.error('模型数据反序列化异常', e)
          }
        }
      })
    },

    // 动态策略表单提交：将输入字段打包回 strategyModel JSON 数据中
    submitForm() {
      this.$refs.strategyForm.validate(valid => {
        if (!valid) return

        // 3. 将动态表单动态值转化为指定规范字符串: "{\"mainChoice\":\"5\",\"backupChoice\":\"7\"}"
        const cleanModelObj = {}
        for (const key in this.dynamicFormValues) {
          const val = this.dynamicFormValues[key]
          if (val !== undefined && val !== null && val !== '') {
            // 全面规整转为 String 规范形式
            cleanModelObj[key] = String(val)
          }
        }
        this.form.strategyModel = JSON.stringify(cleanModelObj)

        const action = this.isEdit
          ? apiUpdate('ocStrategy', this.form)
          : apiAdd('ocStrategy', this.form)
        action.then(() => {
          this.$message.success('战术策略同步就绪')
          this.dialogVisible = false
          this.fetchStrategyList()
        })
      })
    },

    // 物理释放删除
    handleDelete(row) {
      if (!row.ocStrategyId) return
      this.$confirm('确认释放、清除本项分级运控策略算法吗？', '重要提示', {
        type: 'warning',
        confirmButtonText: '确定删除',
        cancelButtonText: '取消'
      }).then(() => {
        apiDelete('ocStrategy', row.ocStrategyId).then(() => {
          this.$message.success('策略释放成功')
          this.fetchStrategyList()
        })
      })
    },

    // 用于在右侧卡片列表中反解与展示 strategyModel 配置详情
    parseStrategyModel(modelStr) {
      if (!modelStr) return []
      try {
        const obj = JSON.parse(modelStr)
        const result = []

        for (const [enKey, val] of Object.entries(obj)) {
          // 1. 查找属性的中文展示名称
          let labelName = enKey
          for (const [cnKey, eKey] of Object.entries(this.attributeKeyMap)) {
            if (eKey === enKey) {
              labelName = cnKey
              break
            }
          }

          // 2. 初始化最终显示的值
          let valDisplay = val
          const stringVal = String(val)

          // 3. 【核心判定逻辑】通过全量属性字典，获取该 Key 对应的后端属性配置
          const attrConfig = this.fullAttributeDict[enKey]

          // 关键硬性条件：必须在数据库中配置了该属性，且其类型明确为 "选择项"
          if (attrConfig && attrConfig.attrType === '选择项') {
            // 满足条件：才允许去选择项字典中翻译数字ID为中文
            if (this.operatorDict && this.operatorDict[stringVal]) {
              valDisplay = this.operatorDict[stringVal]
            }
          }

          result.push({
            key: enKey,
            labelName: labelName,
            valDisplay: valDisplay
          })
        }
        return result
      } catch (e) {
        return []
      }
    }
  }
}
</script>

<style scoped>
/* 大屏战术极简黑风格骨架 */
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

::v-deep .dark-custom-tree {
  background: transparent;
  color: #cbd5e1;
}
::v-deep .dark-custom-tree .el-tree-node__content:hover {
  background-color: #111b2b;
}
::v-deep .dark-custom-tree .el-tree-node:focus > .el-tree-node__content {
  background-color: #13233c;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}
.tree-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.tree-label-txt {
  color: #94a3b8;
}
.text-active {
  color: #38bdf8 !important;
  font-weight: bold;
}

.platform-brief-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #172438;
  border-radius: 3px;
  padding: 11px;
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
  margin-top: 6px;
  font-size: 11px;
}
.bsh-txt {
  color: #94a3b8;
}
.pt-type-tag {
  color: #94a3b8;
}
.card-status-dot {
  position: absolute;
  top: 12px;
  right: 12px;
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
.bg-running {
  background: #10b981;
}
.bg-offline {
  background: #94a3b8;
}

/* RIGHT: 运控策略卡片流容器 (核心修改样式) */
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
.detail-param-dashboard {
  background: #0c1424;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 3px solid #10b981;
}
.panel-inner-title-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}

/* 策略去表格化之后的卡片流容器滑动域 */
.strategy-card-scroll-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #050a12;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
}

/* 独立策略卡片设计 */
.strategy-item-card {
  background: #0d1522;
  border: 1px solid #1c2b42;
  border-radius: 4px;
  padding: 12px;
  transition: all 0.2s ease;
}
.strategy-item-card:hover {
  border-color: #38bdf8;
  background: #111c2e;
}
.strategy-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #1c2b42;
  padding-bottom: 8px;
  margin-bottom: 11px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 11px;
}
.strategy-badge {
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid #38bdf8;
  color: #38bdf8;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
}
.strategy-title {
  margin: 0;
  font-size: 12px;
  color: #ffffff;
  font-weight: bold;
}
.strategy-id-tag {
  font-size: 11px;
  color: #94a3b8;
}
.header-right-actions {
  display: flex;
  gap: 11px;
}
.brief-dynamics {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 11px;
  color: #8a99ad;
  font-family: monospace;
}
.action-btn {
  font-size: 11px;
  padding: 0;
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

/* 策略卡片内部的动态 KV 格栅 */
.strategy-card-body {
  background: #060b14;
  border-radius: 4px;
  padding: 11px;
}
.model-json-title {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 8px;
  font-weight: bold;
}
.model-kv-grid {
  display: grid;
  grid-template-columns: repeat(3, 15fr);
  gap: 8px 16px;
}
.kv-item {
  display: flex;
  align-items: center;
  font-size: 11px;
}
.kv-label {
  color: #94a3b8;
  margin-right: 6px;
}
.kv-value {
  color: #10b981;
  font-weight: bold;
}
.model-empty-text {
  font-size: 11px;
  color: #334155;
  font-style: italic;
}

/* 基础通用空状态 */
.empty-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #080e18;
  color: #94a3b8;
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
.text-green {
  color: #10b981;
}
/* font-num */

/* 动态表单分界样式 */
.dynamic-attr-divider {
  border-top: 1px solid #1a2a42;
  margin: 18px 0 14px 0;
  position: relative;
  text-align: center;
}
.divider-text {
  background: #090f1c;
  padding: 0 11px;
  font-size: 11px;
  color: #38bdf8;
  position: relative;
  top: -9px;
  font-weight: bold;
}
.dynamic-fields-wrapper {
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}

/* 覆盖 Element UI 表单及弹窗深色化定制 */
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
::v-deep .dark-form .el-textarea__inner,
::v-deep .dark-form .el-input-number__increase,
::v-deep .dark-form .el-input-number__decrease {
  background-color: #050b14;
  border-color: #1e293b;
  color: #fff;
  font-size: 11px;
}
::v-deep .dark-form .el-input-number__increase,
::v-deep .dark-form .el-input-number__decrease {
  border-left: 1px solid #1e293b;
}
</style>
