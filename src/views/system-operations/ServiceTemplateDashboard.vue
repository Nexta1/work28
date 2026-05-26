<template>
  <div class="screen-container">
    <div class="main-body-layout">
      <div class="panel-wing-left" v-loading="loadingLeft">
        <div v-if="!activeTemplateId" class="empty-fallback">
          <div class="radar-scan-loader"></div>
          <p>
            请在右侧控制轴点击选择受控模板，以调阅和维护绑定的具体服务实体...
          </p>
        </div>

        <div v-show="activeTemplateId" class="cascade-content-wrapper">
          <div class="panel-header-summary">
            <span class="title text-cyan"
              >🛰️ 服务信息总线（所属模板：{{ activeTemplateName }}）</span
            >
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openInfoDialog(false)"
              >部署服务实例</el-button
            >
          </div>

          <div class="card-scroll-container">
            <div v-if="infoCardList.length === 0" class="sub-empty">
              该模板下尚未部署任何具体服务实体
            </div>

            <div
              v-for="card in infoCardList"
              :key="card.serviceId"
              class="tactical-card"
            >
              <div class="card-row-top">
                <span class="card-title text-white font-bold">{{
                  card.serviceName
                }}</span>
                <el-tag size="mini" type="info" effect="dark">{{
                  translateMethod(card.requestMethod)
                }}</el-tag>
              </div>

              <div class="card-meta-grid">
                <div class="meta-item">
                  <span class="label">服务序列号:</span
                  ><span class="val font-num">{{ card.serviceId }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">受控平台(PTMC):</span
                  ><span class="val text-cyan font-bold">{{
                    card.PTMC || '未指派平台'
                  }}</span>
                </div>
                <div class="meta-item">
                  <span class="label">网络端点(地址/端口):</span
                  ><span class="val text-orange font-num"
                    >{{ card.serviceIp }}:{{ card.servicePort }}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="label">传输层协议:</span
                  ><span class="val font-bold">{{ card.requestProtocol }}</span>
                </div>
                <div class="meta-item col-span-2">
                  <span class="label">服务资源定位符(URL):</span
                  ><span
                    class="val font-num show-overflow-tooltip"
                    :title="card.serviceURL"
                    >{{ card.serviceURL }}</span
                  >
                </div>
                <div class="meta-item col-span-2">
                  <span class="label">战术时间戳:</span
                  ><span class="val font-num">{{
                    formatDate(card.opTime)
                  }}</span>
                </div>
              </div>

              <div class="card-action-overlay">
                <el-button
                  type="text"
                  size="mini"
                  class="text-blue"
                  @click.stop="openInfoDialog(true, card)"
                  >修正参数</el-button
                >
                <el-button
                  type="text"
                  size="mini"
                  class="text-red"
                  @click.stop="handleDeleteInfo(card)"
                  >安全下线</el-button
                >
              </div>
            </div>
          </div>

          <div class="pagination-row">
            <el-pagination
              layout="total, prev, next"
              :current-page.sync="pageInfo.pageNum"
              :page-size="pageInfo.pageSize"
              :total="totalInfo"
              @current-change="fetchInfoList"
              small
            />
          </div>
        </div>
      </div>

      <div class="panel-wing-right">
        <div class="panel-header-summary">
          <span class="title">📋 核心服务模板保障轴</span>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-plus"
            @click="openTemplateDialog(false)"
            >新建服务模板</el-button
          >
        </div>

        <div class="filter-action-row">
          <el-input
            v-model="queryTemplate.templateName"
            placeholder="搜索模板名称..."
            size="mini"
            class="dark-mini-input"
            clearable
            @clear="fetchTemplateList"
          />
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="fetchTemplateList"
            >查询</el-button
          >
        </div>

        <div class="table-container-flex">
          <el-table
            :data="templateTable"
            size="mini"
            class="dark-dashboard-table hand-pointer-table highlight-row-selected"
            height="100%"
            v-loading="loadingRight"
            highlight-current-row
            @current-change="handleTemplateSelect"
          >
            <th slot="empty" class="sub-empty">暂无受控服务模板</th>

            <el-table-column
              prop="serviceTemplateId"
              label="模板序号"
              width="80"
              class-name="font-num"
            />
            <el-table-column
              prop="templateName"
              label="模板名称"
              min-width="140"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span class="text-white font-bold">{{
                  scope.row.templateName
                }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="serviceType"
              label="服务机制"
              width="90"
              show-overflow-tooltip
            />
            <el-table-column
              prop="affiliatedSystem"
              label="所属机制体制"
              width="110"
            >
              <template slot-scope="scope">
                <span class="text-cyan">{{ scope.row.affiliatedSystem }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="secretLevel"
              label="安全密级"
              width="85"
              align="center"
            >
              <template slot-scope="scope">
                <span
                  :class="[
                    'status-badge',
                    scope.row.secretLevel >= 2 ? 'badge-high' : 'badge-normal'
                  ]"
                >
                  {{ secretLevelText(scope.row.secretLevel) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="serviceVersion"
              label="核心版本"
              width="85"
              class-name="font-num"
            />
            <el-table-column
              label="战术操纵"
              width="110"
              align="center"
              fixed="right"
            >
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="mini"
                  class="text-blue"
                  @click.stop="openTemplateDialog(true, scope.row)"
                  >修改</el-button
                >
                <el-button
                  type="text"
                  size="mini"
                  class="text-red"
                  @click.stop="handleDeleteTemplate(scope.row)"
                  >释放</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-row">
          <el-pagination
            layout="total, prev, pager, next"
            :current-page.sync="pageTemplate.pageNum"
            :page-size="pageTemplate.pageSize"
            :total="totalTemplate"
            @current-change="fetchTemplateList"
            small
          />
        </div>
      </div>
    </div>

    <el-dialog
      :title="
        isEditTemplate
          ? '🛠️ 调整业务服务保障模板特征'
          : '🚀 录入全新数字化服务模板'
      "
      :visible.sync="dialogTemplateVisible"
      width="620px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <el-form
        :model="formTemplate"
        ref="templateForm"
        :rules="rulesTemplate"
        label-width="110px"
        size="mini"
        class="dark-form"
      >
        <div class="form-grid-2col">
          <el-form-item label="模板名称" prop="templateName">
            <el-input
              v-model="formTemplate.templateName"
              placeholder="请录入模板名称..."
            />
          </el-form-item>
          <el-form-item label="服务机制类型" prop="serviceType">
            <el-input
              v-model="formTemplate.serviceType"
              placeholder="如：外部调阅、实时流交互"
            />
          </el-form-item>
          <el-form-item label="所属机制体制">
            <el-select
              v-model="formTemplate.affiliatedSystem"
              placeholder="请选定归属体制"
              style="width: 100%"
            >
              <el-option
                v-for="item in dictAffiliated"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="安全密级等次">
            <el-select
              v-model="formTemplate.secretLevel"
              placeholder="请指派服务密级"
              style="width: 100%"
            >
              <el-option
                v-for="(val, key) in dictSecretLevel"
                :key="key"
                :label="val"
                :value="Number(key)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="核心版本代号" class="col-span-2">
            <el-input
              v-model="formTemplate.serviceVersion"
              placeholder="当前服务版本号特征"
            />
          </el-form-item>
        </div>
        <el-form-item label="输入参数契约">
          <el-input
            type="textarea"
            v-model="formTemplate.inputParams"
            :rows="3"
            placeholder="定义服务输入参数契约规范..."
          />
        </el-form-item>
        <el-form-item label="输出参数契约">
          <el-input
            type="textarea"
            v-model="formTemplate.outputParams"
            :rows="3"
            placeholder="定义解译输出结果回传规范..."
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogTemplateVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitTemplateForm"
          >确认下发同步</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="
        isEditInfo ? '🛠️ 修正现役服务端点实例属性' : '🛰️ 注册部署新服务端点实体'
      "
      :visible.sync="dialogInfoVisible"
      width="640px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <el-form
        :model="formInfo"
        ref="infoForm"
        :rules="rulesInfo"
        label-width="130px"
        size="mini"
        class="dark-form"
      >
        <el-form-item label="关联受控服务模板" prop="serviceTemplateId">
          <el-select
            v-model="formInfo.serviceTemplateId"
            placeholder="必须选择绑定的服务模板（必选）"
            style="width: 100%"
            :disabled="isEditInfo"
          >
            <el-option
              v-for="item in allTemplatesPool"
              :key="item.serviceTemplateId"
              :label="item.templateName"
              :value="item.serviceTemplateId"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="指派受控平台" prop="PTID">
          <el-cascader
            v-model="formInfo.PTID"
            :options="platformTreeOptions"
            :props="{
              value: 'PTID',
              label: 'PTMC',
              emitPath: false,
              checkStrictly: true
            }"
            placeholder="点击选择调阅架构受控平台节点..."
            style="width: 100%"
            clearable
            @change="handlePlatformTreeChange"
          />
        </el-form-item>

        <div class="form-grid-2col">
          <el-form-item label="服务实体名称" prop="serviceName">
            <el-input
              v-model="formInfo.serviceName"
              placeholder="运行时具体服务单元名称"
            />
          </el-form-item>
          <el-form-item label="网络定位地址(IP)" prop="serviceIp">
            <el-input
              v-model="formInfo.serviceIp"
              placeholder="网段编组定位IP"
            />
          </el-form-item>
          <el-form-item label="通信侦听端口" prop="servicePort">
            <el-input-number
              v-model="formInfo.servicePort"
              :min="1"
              :max="65535"
              style="width: 100%"
              :controls="false"
            />
          </el-form-item>
          <el-form-item label="应用层传输协议">
            <el-select v-model="formInfo.requestProtocol" style="width: 100%">
              <el-option label="网关超文本传输协议(HTTP)" value="HTTP" />
              <el-option label="安全超文本加密协议(HTTPS)" value="HTTPS" />
              <el-option label="基础传输控制协议(TCP)" value="TCP" />
            </el-select>
          </el-form-item>
          <el-form-item label="数据交互请求方法">
            <el-select v-model="formInfo.requestMethod" style="width: 100%">
              <el-option label="提交处理型(POST)" value="POST" />
              <el-option label="调阅获取型(GET)" value="GET" />
              <el-option label="覆盖更新型(PUT)" value="PUT" />
            </el-select>
          </el-form-item>
          <el-form-item label="数字通信安全密钥">
            <el-input
              v-model="formInfo.servicePassword"
              show-password
              placeholder="非必填，安全访问令牌验证"
            />
          </el-form-item>
        </div>

        <el-form-item label="服务资源定位符(URL)" prop="serviceURL">
          <el-input
            v-model="formInfo.serviceURL"
            placeholder="输入完整的全路径网络服务调用终结点地址..."
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogInfoVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitInfoForm"
          >确认下发部署</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
// 导入公共 CRUD 控制引擎，以及新增树形平台驱动接口 apiFindAllTrees
import {
  apiPage,
  apiAdd,
  apiUpdate,
  apiDelete,
  apiFindAllTrees
} from '@/api/common.js'

export default {
  name: 'ServiceTemplateDashboard',
  data() {
    return {
      baseTemplateUrl: 'serviceTemplate',
      baseInfoUrl: 'serviceInfo',

      loadingLeft: false,
      loadingRight: false,

      // 右侧主控制轴：模板表格
      templateTable: [],
      allTemplatesPool: [],
      totalTemplate: 0,
      queryTemplate: {templateName: ''}, // 参数名已校准为 templateName
      pageTemplate: {pageNum: 1, pageSize: 15},
      activeTemplateId: null,
      activeTemplateName: '',

      // 左侧联动副轴：服务信息卡片流
      infoCardList: [],
      totalInfo: 0,
      queryInfo: {serviceName: ''},
      pageInfo: {pageNum: 1, pageSize: 20},

      // 受控平台树结构存储器
      platformTreeOptions: [],

      // 纯中文体系安全密级字典校准
      dictAffiliated: [
        '体系运控',
        '平行系统',
        '支撑系统',
        '信息处理',
        '战术应用',
        '传输组网',
        '安全保密'
      ],
      dictSecretLevel: {0: '公开', 1: '秘密', 2: '机密', 3: '绝密'},

      // 表单状态机
      dialogTemplateVisible: false,
      isEditTemplate: false,
      formTemplate: {},

      dialogInfoVisible: false,
      isEditInfo: false,
      formInfo: {},

      rulesTemplate: {
        templateName: [
          {
            required: true,
            message: '请录入服务保障模板名称描述',
            trigger: 'blur'
          }
        ]
      },
      rulesInfo: {
        serviceTemplateId: [
          {
            required: true,
            message: '必须绑定其上层归属的服务模板',
            trigger: 'change'
          }
        ],
        PTID: [
          {
            required: true,
            message: '必须指派关联一个现役受控平台',
            trigger: 'change'
          }
        ],
        serviceName: [
          {required: true, message: '运行时端点实例名称必填', trigger: 'blur'}
        ],
        serviceIp: [
          {required: true, message: '网络定位编组IP不可为空', trigger: 'blur'}
        ],
        servicePort: [
          {required: true, message: '通信端口缺省错误', trigger: 'blur'}
        ]
      }
    }
  },
  mounted() {
    this.fetchTemplateList()
    this.syncAllTemplatesPool()
    this.loadPlatformTrees()
  },
  methods: {
    // 纯中文转换机制
    translateMethod(method) {
      const dic = {
        POST: '提交数据(POST)',
        GET: '调阅获取(GET)',
        PUT: '覆盖更新(PUT)'
      }
      return dic[method] || method
    },
    secretLevelText(level) {
      return this.dictSecretLevel[level] || `未知密级(${level})`
    },
    formatDate(dateStr) {
      if (!dateStr) return '---'
      const d = new Date(dateStr)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(d.getDate()).padStart(2, '0')} ${String(
        d.getHours()
      ).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
    },

    // 拉取全量服务模板提供给下拉框
    syncAllTemplatesPool() {
      apiPage(this.baseTemplateUrl, {pageNum: 1, pageSize: 1000, params: {}})
        .then(res => {
          this.allTemplatesPool = res.data?.list || res.data || []
        })
        .catch(() => {
          this.allTemplatesPool = []
        })
    },

    // 核心联动：拉取受控平台树形框架数据 (zzrwpt/findAllTrees)
    loadPlatformTrees() {
      apiFindAllTrees('zzrwpt')
        .then(res => {
          // 后端直接返回标准的树结构，含 PTID 与 PTMC
          this.platformTreeOptions = res.data || res || []
        })
        .catch(() => {
          this.platformTreeOptions = []
        })
    },

    // 树选择发生突变时，递归或直接提取选中的 PTMC 名称挂载到表单数据，保证展示一致性
    handlePlatformTreeChange(val) {
      if (!val) {
        this.formInfo.PTMC = ''
        return
      }
      const findNode = (nodes, id) => {
        for (let item of nodes) {
          if (item.PTID === id) return item
          if (item.children && item.children.length > 0) {
            let found = findNode(item.children, id)
            if (found) return found
          }
        }
        return null
      }
      const matchedNode = findNode(this.platformTreeOptions, val)
      if (matchedNode) {
        this.formInfo.PTMC = matchedNode.PTMC
      }
    },

    // ===================================================================
    // 右翼：核心主控轴 - 服务模板表格驱动模块
    // ===================================================================
    fetchTemplateList() {
      this.loadingRight = true
      const payload = {
        pageNum: this.pageTemplate.pageNum,
        pageSize: this.pageTemplate.pageSize,
        params: {
          // 参数字段精准指定为 templateName
          templateName: this.queryTemplate.templateName || undefined
        }
      }
      apiPage(this.baseTemplateUrl, payload)
        .then(res => {
          this.templateTable = res.data?.list || res.data || []
          this.totalTemplate = res.data?.total || this.templateTable.length
          // 状态复位
          this.activeTemplateId = null
          this.activeTemplateName = ''
          this.infoCardList = []
        })
        .catch(() => {
          this.templateTable = []
          this.totalTemplate = 0
        })
        .finally(() => {
          this.loadingRight = false
        })
    },
    handleTemplateSelect(currentRow) {
      if (!currentRow) return
      this.activeTemplateId = currentRow.serviceTemplateId
      this.activeTemplateName = currentRow.templateName
      this.pageInfo.pageNum = 1
      this.fetchInfoList()
    },
    openTemplateDialog(isEdit, row = null) {
      this.isEditTemplate = isEdit
      if (isEdit && row) {
        this.formTemplate = {...row}
      } else {
        this.formTemplate = {
          serviceTemplateId: null,
          templateName: '',
          serviceType: '契约级通信',
          affiliatedSystem: '体系运控',
          secretLevel: 0,
          serviceVersion: 'V1.0',
          inputParams: '',
          outputParams: ''
        }
      }
      this.dialogTemplateVisible = true
      this.$nextTick(() => {
        if (this.$refs.templateForm) this.$refs.templateForm.clearValidate()
      })
    },
    submitTemplateForm() {
      this.$refs.templateForm.validate(valid => {
        if (!valid) return
        const action = this.isEditTemplate
          ? apiUpdate(this.baseTemplateUrl, this.formTemplate)
          : apiAdd(this.baseTemplateUrl, this.formTemplate)

        action.then(() => {
          this.$message.success('基础业务保障模板变更同步完成')
          this.dialogTemplateVisible = false
          this.fetchTemplateList()
          this.syncAllTemplatesPool()
        })
      })
    },
    handleDeleteTemplate(row) {
      const id = row.serviceTemplateId
      if (!id) return
      this.$confirm(
        `确认释放并卸载当前受控服务模板吗？[${row.templateName}]`,
        '战术最高安全警告',
        {
          type: 'warning',
          confirmButtonText: '强制释放',
          cancelButtonText: '暂缓'
        }
      ).then(() => {
        apiDelete(this.baseTemplateUrl, id).then(() => {
          this.$message.success('模板释卸成功')
          this.fetchTemplateList()
          this.syncAllTemplatesPool()
        })
      })
    },

    // ===================================================================
    // 左翼：联动级联副翼 - 服务信息卡片驱动模块（无来源字段）
    // ===================================================================
    fetchInfoList() {
      if (!this.activeTemplateId) return
      this.loadingLeft = true
      const payload = {
        pageNum: this.pageInfo.pageNum,
        pageSize: this.pageInfo.pageSize,
        params: {
          templateId: this.activeTemplateId,
          templateName: this.activeTemplateName || undefined
        }
      }
      apiPage(this.baseInfoUrl, payload)
        .then(res => {
          this.infoCardList = res.data?.list || res.data || []
          this.totalInfo = res.data?.total || this.infoCardList.length
        })
        .catch(() => {
          this.infoCardList = []
          this.totalInfo = 0
        })
        .finally(() => {
          this.loadingLeft = false
        })
    },
    openInfoDialog(isEdit, row = null) {
      this.isEditInfo = isEdit
      if (isEdit && row) {
        this.formInfo = {...row}
      } else {
        this.formInfo = {
          serviceId: null,
          serviceTemplateId: this.activeTemplateId,
          PTID: null,
          PTMC: '',
          serviceName: '',
          serviceIp: '',
          servicePort: 80,
          serviceURL: '',
          servicePassword: '',
          requestProtocol: 'HTTP',
          requestMethod: 'POST'
          // serviceSource 已经完全剔除
        }
      }
      this.dialogInfoVisible = true
      this.$nextTick(() => {
        if (this.$refs.infoForm) this.$refs.infoForm.clearValidate()
      })
    },
    submitInfoForm() {
      this.$refs.infoForm.validate(valid => {
        if (!valid) return
        const action = this.isEditInfo
          ? apiUpdate(this.baseInfoUrl, this.formInfo)
          : apiAdd(this.baseInfoUrl, this.formInfo)

        action.then(() => {
          this.$message.success('端点物理服务实例同步就绪')
          this.dialogInfoVisible = false
          this.fetchInfoList()
        })
      })
    },
    handleDeleteInfo(row) {
      const id = row.serviceId
      if (!id) return
      this.$confirm('确定要在拓扑中安全下线该物理服务实体吗？', '运维核验', {
        type: 'warning'
      }).then(() => {
        apiDelete(this.baseInfoUrl, id).then(() => {
          this.$message.success('实例安全下线切断完毕')
          this.fetchInfoList()
        })
      })
    }
  }
}
</script>

<style scoped>
/* ===================================================================
   主视窗大屏全扁平、无阴影底层物理底盘隔离样式
   =================================================================== */
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

.main-body-layout {
  display: flex;
  flex: 1;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

/* ===================================================================
   左翼栏：服务信息实体【卡片舱段】
   =================================================================== */
.panel-wing-left {
  width: 40%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  position: relative;
  box-sizing: border-box;
}
.cascade-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

.card-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}

/* 纯中文硬化数字态势感卡片 (全扁平、无阴影) */
.tactical-card {
  background: #0c1424;
  border: 1px solid #1e293b;
  border-radius: 3px;
  padding: 10px 12px;
  position: relative;
  box-shadow: none !important;
}

.card-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  border-bottom: 1px dashed #16243a;
  padding-bottom: 4px;
}
.card-title {
  font-size: 12px;
  color: #ffffff;
}

.card-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 10px;
  font-size: 11px;
}
.meta-item {
  display: flex;
  align-items: flex-start;
}
.meta-item.col-span-2 {
  grid-column: span 2;
}
.meta-item .label {
  color: #475569;
  margin-right: 6px;
  white-space: nowrap;
}
.meta-item .val {
  color: #cbd5e1;
  word-break: break-all;
}

.card-action-overlay {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
  border-top: 1px solid #111b2b;
  padding-top: 6px;
}

/* ===================================================================
   右翼栏：服务模板核心主控制轴【高亮/小手表格舱】
   =================================================================== */
.panel-wing-right {
  width: 60%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
}

/* 特效：行选指针对准转为高亮小手形状 */
.hand-pointer-table /deep/ .el-table__row {
  cursor: pointer !important;
}

/* 核心强化：Element UI 表格当前行选中扁平激光蓝高亮，拒绝任何原生高光过渡阴影 */
.highlight-row-selected /deep/ .el-table__row.current-row > td {
  background-color: #162c4c !important;
  border-top: 1px solid #38bdf8 !important;
  border-bottom: 1px solid #38bdf8 !important;
  color: #ffffff !important;
}

/* ===================================================================
   全局大屏统一布局基础样式
   =================================================================== */
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
  color: #38bdf8;
}

.filter-action-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.dark-mini-input {
  width: 170px;
}

.table-container-flex {
  flex: 1;
  min-height: 0;
  position: relative;
}

.pagination-row {
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
  flex-shrink: 0;
}

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
  color: #38bdf8 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-red {
  color: #f43f5e !important;
}

.status-badge {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: bold;
}
/* 战术密级不同色块细边高亮 */
.badge-high {
  background-color: rgba(239, 68, 68, 0.15);
  border: 1px solid #ef4444;
  color: #ef4444;
}
.badge-normal {
  background-color: rgba(6, 182, 212, 0.15);
  border: 1px solid #06b6d4;
  color: #06b6d4;
}

.form-grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 10px;
}
.col-span-2 {
  grid-column: span 2 !important;
}

.sub-empty {
  text-align: center;
  font-size: 11px;
  color: #2e3c51;
  padding: 40px 10px;
  user-select: none;
}

.empty-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #080e18;
  z-index: 10;
  color: #415169;
  font-size: 11px;
  padding: 0 20px;
  text-align: center;
}
.radar-scan-loader {
  width: 32px;
  height: 32px;
  border: 2px dashed #172438;
  border-radius: 50%;
  animation: spin 4s linear infinite;
  margin-bottom: 10px;
}
@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.card-scroll-container::-webkit-scrollbar {
  width: 4px;
}
.card-scroll-container::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 2px;
}
</style>
