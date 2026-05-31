<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">🛰️ 数据采集项目流程编排总线</span>
        <div class="search-item">
          <label>项目名称</label>
          <input
            v-model="projectQuery.projectName"
            class="global-input"
            placeholder="输入项目名称..."
            @input="fetchProjects"
          />
        </div>
        <div class="search-item">
          <label>项目分组</label>
          <input
            v-model="projectQuery.projectGroup"
            class="global-input"
            placeholder="输入项目分组..."
            @input="fetchProjects"
          />
        </div>
      </div>
      <div class="monitor-legend">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          class="action-btn"
          @click="openProjectDialog(false)"
        >
          新建项目
        </el-button>
        <el-button
          type="info"
          size="mini"
          icon="el-icon-refresh"
          class="action-btn"
          @click="initPage"
        >
          同步数据源
        </el-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span>项目总数</span>
        <strong class="font-num text-blue">{{ projectTotal }}</strong>
        <small>当前查询命中</small>
      </div>
      <div class="stat-card">
        <span>启用项目</span>
        <strong class="font-num text-green">{{ runningProjectCount }}</strong>
        <small>projectState = 2</small>
      </div>
      <div class="stat-card">
        <span>当前步骤</span>
        <strong class="font-num text-cyan">{{ stepList.length }}</strong>
        <small>当前项目流程节点</small>
      </div>
      <div class="stat-card">
        <span>启用步骤</span>
        <strong class="font-num text-green">{{ enabledStepCount }}</strong>
        <small>stepState = 1</small>
      </div>
      <div class="stat-card">
        <span>数据源</span>
        <strong class="font-num text-orange">{{
          dataSourceOptions.length
        }}</strong>
        <small>可绑定数据源</small>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-tree-panel" v-loading="loadingProjects">
        <div class="panel-header-summary">
          <span class="title">📦 数据采集项目</span>
          <span class="badge font-num text-cyan">{{ projectTotal }} 项</span>
        </div>

        <div class="task-scroll-box">
          <div
            v-for="project in projectList"
            :key="project.dataProjectId"
            class="task-item-card"
            :class="{
              'task-active':
                activeProject &&
                activeProject.dataProjectId === project.dataProjectId
            }"
            @click="selectProject(project)"
          >
            <div class="task-card-header">
              <span class="rw-title ellipsis-text" :title="project.projectName"
                >🔹 {{ project.projectName }}</span
              >
              <span
                class="status-tag"
                :class="
                  project.projectState === 2 ? 'tag-active' : 'tag-pending'
                "
              >
                {{ projectStateText(project.projectState) }}
              </span>
            </div>
            <div class="task-card-body">
              <div class="meta-grid">
                <div>
                  分组:
                  <span class="text-green">{{
                    project.projectGroup || '未分组'
                  }}</span>
                </div>
                <div>
                  源:
                  <span class="text-cyan">{{ project.sourceName || '-' }}</span>
                </div>
                <div>
                  间隔:
                  <span class="text-blue font-num"
                    >{{ project.execIntervalMinutes || 0 }} min</span
                  >
                </div>
                <div>
                  组件:
                  <span class="text-orange">{{
                    project.execComponent || '-'
                  }}</span>
                </div>
              </div>
            </div>
            <div class="card-actions">
              <el-button
                type="text"
                size="mini"
                icon="el-icon-video-play"
                @click.stop="toggleProject(project, true)"
                >启动</el-button
              >
              <el-button
                type="text"
                size="mini"
                icon="el-icon-video-pause"
                @click.stop="toggleProject(project, false)"
                >停止</el-button
              >
              <el-button
                type="text"
                size="mini"
                icon="el-icon-edit"
                @click.stop="openProjectDialog(true, project)"
                >编辑</el-button
              >
              <el-button
                type="text"
                size="mini"
                class="danger-link"
                icon="el-icon-delete"
                @click.stop="deleteProject(project)"
                >删除</el-button
              >
            </div>
          </div>
          <el-empty
            v-if="!projectList.length && !loadingProjects"
            description="暂无数据采集项目"
          />
        </div>

        <el-pagination
          class="dark-pager"
          small
          layout="prev, pager, next"
          :current-page.sync="projectPage.pageNum"
          :page-size="projectPage.pageSize"
          :total="projectTotal"
          @current-change="fetchProjects"
        />
      </div>

      <div class="right-combined-panel">
        <div class="canvas-top-bar">
          <div class="active-tip">
            当前项目:
            <span class="active-flow-name">{{
              activeProject ? activeProject.projectName : '未选择'
            }}</span>
            <span v-if="activeProject" class="flow-state-tag"
              >状态: {{ projectStateText(activeProject.projectState) }}</span
            >
          </div>
          <div class="action-btn-group">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              :disabled="!activeProject"
              @click="openStepDialog(false)"
            >
              新增步骤
            </el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-rank"
              @click="layoutGraph"
              >自动编排</el-button
            >
            <el-button
              type="info"
              size="mini"
              icon="el-icon-refresh"
              @click="renderStepGraph"
              >刷新画布</el-button
            >
          </div>
        </div>

        <div class="workspace-body">
          <div class="canvas-container" v-loading="loadingSteps">
            <div v-if="!activeProject" class="empty-fallback">
              <div class="radar-scan-loader"></div>
              <p>请选择左侧数据采集项目以激活 X6 步骤流程图...</p>
            </div>
            <div id="data-project-x6-canvas" class="x6-graph-instance"></div>
          </div>

          <div class="step-table-panel">
            <div class="panel-header-summary">
              <span class="title">⚙️ 项目步骤参数</span>
              <span class="badge font-num text-cyan"
                >{{ stepList.length }} 步</span
              >
            </div>
            <el-table
              :data="stepList"
              size="mini"
              stripe
              border
              class="dark-table"
              v-loading="loadingSteps"
            >
              <el-table-column prop="stepNumber" label="序号" width="70" />
              <el-table-column
                prop="stepName"
                label="步骤名称"
                min-width="130"
                show-overflow-tooltip
              />
              <el-table-column prop="inputFormat" label="输入" width="105" />
              <el-table-column
                prop="opTransform"
                label="转换"
                min-width="120"
                show-overflow-tooltip
              />
              <el-table-column prop="outputFormat" label="输出" width="90" />
              <el-table-column prop="stepState" label="状态" width="80">
                <template slot-scope="scope">
                  <el-tag
                    size="mini"
                    :type="scope.row.stepState === 1 ? 'success' : 'info'"
                  >
                    {{ stepStateText(scope.row.stepState) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="135" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="mini"
                    icon="el-icon-edit"
                    @click="openStepDialog(true, scope.row)"
                    >编辑</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    class="danger-link"
                    icon="el-icon-delete"
                    @click="deleteStep(scope.row)"
                    >删除</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="isEditProject ? '编辑数据采集项目' : '新增数据采集项目'"
      :visible.sync="projectDialogVisible"
      width="680px"
      append-to-body
    >
      <el-form
        ref="projectForm"
        :model="projectForm"
        :rules="projectRules"
        label-width="120px"
        size="mini"
      >
        <el-row :gutter="8">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="projectForm.projectName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目分组">
              <el-select
                v-model="projectForm.projectGroup"
                filterable
                allow-create
                class="full-width"
              >
                <el-option
                  v-for="item in projectGroups"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="数据源">
          <el-select
            v-model="projectForm.dataSourceId"
            filterable
            clearable
            class="full-width"
          >
            <el-option
              v-for="item in dataSourceOptions"
              :key="item.dataSourceId"
              :label="item.sourceName || item.dbName || item.dataSourceId"
              :value="item.dataSourceId"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="8">
            <el-form-item label="开始时间">
              <el-time-picker
                v-model="projectForm.execStartTime"
                value-format="HH:mm:ss"
                placeholder="选择时间"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="间隔分钟">
              <el-input-number
                v-model="projectForm.execIntervalMinutes"
                :min="1"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="项目状态">
              <el-select v-model="projectForm.projectState" class="full-width">
                <el-option
                  v-for="(label, value) in projectStateMap"
                  :key="value"
                  :label="label"
                  :value="Number(value)"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="执行组件">
          <el-input
            v-model="projectForm.execComponent"
            placeholder="采集执行组件或处理器名称"
          />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="projectForm.projectMemo"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="projectDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitProject"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditStep ? '编辑采集步骤' : '新增采集步骤'"
      :visible.sync="stepDialogVisible"
      width="760px"
      append-to-body
    >
      <el-form
        ref="stepForm"
        :model="stepForm"
        :rules="stepRules"
        label-width="120px"
        size="mini"
      >
        <el-row :gutter="8">
          <el-col :span="8">
            <el-form-item label="步骤序号" prop="stepNumber">
              <el-input-number
                v-model="stepForm.stepNumber"
                :min="1"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="步骤名称" prop="stepName">
              <el-input v-model="stepForm.stepName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="依赖输入步骤">
          <el-select
            v-model="stepInputIds"
            multiple
            filterable
            clearable
            class="full-width"
          >
            <el-option
              v-for="item in stepList"
              :key="item.dataProjectStepId"
              :label="`${item.stepNumber || '-'} - ${item.stepName}`"
              :value="item.dataProjectStepId"
              :disabled="item.dataProjectStepId === stepForm.dataProjectStepId"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="8">
          <el-col :span="8">
            <el-form-item label="输入格式">
              <el-select v-model="stepForm.inputFormat" class="full-width">
                <el-option
                  v-for="item in inputFormats"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="转换操作">
              <el-select v-model="stepForm.opTransform" class="full-width">
                <el-option
                  v-for="item in transformOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="输出格式">
              <el-select v-model="stepForm.outputFormat" class="full-width">
                <el-option
                  v-for="item in outputFormats"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="输入参数">
          <el-input v-model="stepForm.inputParams" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="转换参数">
          <el-input
            v-model="stepForm.transformParams"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
        <el-form-item label="输出参数">
          <el-input v-model="stepForm.outputParams" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="步骤状态">
          <el-radio-group v-model="stepForm.stepState">
            <el-radio-button :label="1">启用</el-radio-button>
            <el-radio-button :label="0">停用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="stepDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitStep"
          >保存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {Graph} from '@antv/x6'
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'

export default {
  name: 'DataCollectionProject',
  data() {
    return {
      graph: null,
      loadingProjects: false,
      loadingSteps: false,
      projectList: [],
      stepList: [],
      dataSourceOptions: [],
      activeProject: null,
      projectTotal: 0,
      projectPage: {pageNum: 1, pageSize: 12},
      projectQuery: {projectName: '', projectGroup: ''},
      projectDialogVisible: false,
      stepDialogVisible: false,
      isEditProject: false,
      isEditStep: false,
      projectForm: this.getEmptyProjectForm(),
      stepForm: this.getEmptyStepForm(),
      stepInputIds: [],
      projectGroups: [
        '数据清洗',
        '型号清洗',
        '接口数据采集',
        'JSON文件',
        'EXCEL文件',
        '数据库数据源',
        'DDS采集消息'
      ],
      projectStateMap: {0: '停用', 1: '创建', 2: '启用'},
      inputFormats: ['JSON', 'REST Client', '数据表', 'DDS消费者'],
      outputFormats: ['数据表', 'JSON'],
      transformOptions: [
        '不转换',
        '字段抽取',
        '合并集合',
        '值填充',
        '笛卡尔连接',
        '关键字过滤',
        'JSON转数据表'
      ],
      projectRules: {
        projectName: [
          {required: true, message: '请输入项目名称', trigger: 'blur'}
        ]
      },
      stepRules: {
        stepNumber: [
          {required: true, message: '请输入步骤序号', trigger: 'blur'}
        ],
        stepName: [{required: true, message: '请输入步骤名称', trigger: 'blur'}]
      }
    }
  },
  computed: {
    runningProjectCount() {
      return this.projectList.filter(item => Number(item.projectState) === 2)
        .length
    },
    enabledStepCount() {
      return this.stepList.filter(item => Number(item.stepState) === 1).length
    }
  },
  mounted() {
    this.initGraph()
    this.initPage()
    window.addEventListener('resize', this.resizeGraph)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeGraph)
    if (this.graph) this.graph.dispose()
  },
  methods: {
    initPage() {
      this.fetchDataSources()
      this.fetchProjects()
    },
    getEmptyProjectForm() {
      return {
        dataProjectId: null,
        dataSourceId: null,
        projectName: '',
        projectGroup: '接口数据采集',
        projectMemo: '',
        execStartTime: '00:00:00',
        execIntervalMinutes: 5,
        execComponent: '',
        projectState: 1
      }
    },
    getEmptyStepForm() {
      return {
        dataProjectStepId: null,
        dataProjectId: null,
        stepNumber: 1,
        stepName: '',
        inputStepIds: '',
        inputFormat: 'JSON',
        inputParams: '',
        opTransform: '不转换',
        transformParams: '',
        outputFormat: '数据表',
        outputParams: '',
        stepState: 1
      }
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    toIdArray(value) {
      if (!value) return []
      if (Array.isArray(value)) return value.map(v => Number(v)).filter(Boolean)
      return String(value)
        .split(',')
        .map(v => Number(v))
        .filter(Boolean)
    },
    toIdString(ids) {
      return (ids || []).filter(Boolean).join(',')
    },
    initGraph() {
      this.$nextTick(() => {
        const container = document.getElementById('data-project-x6-canvas')
        if (!container) return
        this.graph = new Graph({
          container,
          background: {color: '#070c14'},
          grid: {
            visible: true,
            type: 'dot',
            args: {color: '#1f2d44', thickness: 1}
          },
          panning: true,
          mousewheel: {enabled: true, modifiers: ['ctrl', 'meta']},
          connecting: {
            connector: 'rounded',
            router: {name: 'manhattan'},
            allowBlank: false
          }
        })
        this.renderStepGraph()
      })
    },
    resizeGraph() {
      if (!this.graph) return
      const container = document.getElementById('data-project-x6-canvas')
      if (container)
        this.graph.resize(container.clientWidth, container.clientHeight)
      this.graph.centerContent()
    },
    fetchDataSources() {
      request({url: '/rest/dataSource/dataSources', method: 'get'}).then(
        res => {
          this.dataSourceOptions = this.normalizeList(res)
        }
      )
    },
    fetchProjects() {
      this.loadingProjects = true
      apiPage('dataProject', {
        pageNum: this.projectPage.pageNum,
        pageSize: this.projectPage.pageSize,
        params: {...this.projectQuery}
      })
        .then(res => {
          this.projectList = this.normalizeList(res)
          this.projectTotal =
            (res.data && res.data.total) || this.projectList.length
          if (!this.activeProject && this.projectList.length)
            this.selectProject(this.projectList[0])
        })
        .finally(() => {
          this.loadingProjects = false
        })
    },
    selectProject(project) {
      this.activeProject = project
      this.fetchSteps()
    },
    fetchSteps() {
      if (!this.activeProject) {
        this.stepList = []
        this.renderStepGraph()
        return
      }
      this.loadingSteps = true
      apiPage('dataProjectStep', {
        pageNum: 1,
        pageSize: 500,
        params: {
          projectName: this.activeProject.projectName,
          projectGroup: this.activeProject.projectGroup
        }
      })
        .then(res => {
          const projectId = this.activeProject.dataProjectId
          this.stepList = this.normalizeList(res)
            .filter(
              item => !item.dataProjectId || item.dataProjectId === projectId
            )
            .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
          this.renderStepGraph()
        })
        .finally(() => {
          this.loadingSteps = false
        })
    },
    renderStepGraph() {
      if (!this.graph) return
      this.graph.clearCells()
      const steps = this.stepList || []
      if (!steps.length) return

      const colWidth = 230
      const rowHeight = 110
      const nodeMap = {}
      steps.forEach((step, index) => {
        const level = this.toIdArray(step.inputStepIds).length
          ? 1 + Math.floor(index / 3)
          : 0
        const row = index % 3
        const node = this.graph.addNode({
          id: `step-${step.dataProjectStepId}`,
          x: 60 + level * colWidth,
          y: 40 + row * rowHeight,
          width: 170,
          height: 66,
          shape: 'rect',
          attrs: {
            body: {
              rx: 6,
              ry: 6,
              fill: Number(step.stepState) === 1 ? '#0d2531' : '#1b2431',
              stroke: Number(step.stepState) === 1 ? '#38bdf8' : '#475569',
              strokeWidth: 1.4
            },
            label: {
              text: `${step.stepNumber || '-'} ${step.stepName || '未命名步骤'}\n${step.inputFormat || '-'} → ${step.outputFormat || '-'}`,
              fill: '#e2e8f0',
              fontSize: 12,
              lineHeight: 18
            }
          },
          data: step
        })
        node.on('change:*', () => {})
        nodeMap[step.dataProjectStepId] = node
      })

      steps.forEach(step => {
        const target = nodeMap[step.dataProjectStepId]
        this.toIdArray(step.inputStepIds).forEach(inputId => {
          const source = nodeMap[inputId]
          if (!source || !target) return
          this.graph.addEdge({
            source,
            target,
            attrs: {
              line: {
                stroke: '#38bdf8',
                strokeWidth: 1.2,
                targetMarker: {name: 'classic', size: 7}
              }
            },
            router: {name: 'manhattan'},
            connector: {name: 'rounded'}
          })
        })
      })

      this.graph.on('node:dblclick', ({node}) => {
        this.openStepDialog(true, node.getData())
      })
      this.layoutGraph()
    },
    layoutGraph() {
      if (!this.graph || !this.stepList.length) return
      this.graph.centerContent()
      this.graph.zoomTo(1)
    },
    openProjectDialog(isEdit, row) {
      this.isEditProject = isEdit
      this.projectForm = isEdit && row ? {...row} : this.getEmptyProjectForm()
      this.projectDialogVisible = true
      this.$nextTick(
        () => this.$refs.projectForm && this.$refs.projectForm.clearValidate()
      )
    },
    submitProject() {
      this.$refs.projectForm.validate(valid => {
        if (!valid) return
        const action = this.isEditProject
          ? apiUpdate('dataProject', this.projectForm)
          : apiAdd('dataProject', this.projectForm)
        action.then(() => {
          this.$message.success('数据采集项目已保存')
          this.projectDialogVisible = false
          this.fetchProjects()
        })
      })
    },
    deleteProject(row) {
      this.$confirm(`确定删除项目 [${row.projectName}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('dataProject', row.dataProjectId).then(() => {
          this.$message.success('删除成功')
          if (
            this.activeProject &&
            this.activeProject.dataProjectId === row.dataProjectId
          )
            this.activeProject = null
          this.fetchProjects()
          this.fetchSteps()
        })
      })
    },
    toggleProject(row, start) {
      request({
        url: `/rest/dataProject/${start ? 'start' : 'stop'}/${row.dataProjectId}`,
        method: 'post'
      }).then(() => {
        this.$message.success(start ? '项目已启动' : '项目已停止')
        this.fetchProjects()
      })
    },
    openStepDialog(isEdit, row) {
      if (!this.activeProject) return
      this.isEditStep = isEdit
      this.stepForm =
        isEdit && row
          ? {...row}
          : {
              ...this.getEmptyStepForm(),
              dataProjectId: this.activeProject.dataProjectId,
              stepNumber: this.stepList.length + 1
            }
      this.stepInputIds = this.toIdArray(this.stepForm.inputStepIds)
      this.stepDialogVisible = true
      this.$nextTick(
        () => this.$refs.stepForm && this.$refs.stepForm.clearValidate()
      )
    },
    submitStep() {
      this.$refs.stepForm.validate(valid => {
        if (!valid) return
        const payload = {
          ...this.stepForm,
          inputStepIds: this.toIdString(this.stepInputIds),
          dataProjectId: this.activeProject.dataProjectId
        }
        const action = this.isEditStep
          ? apiUpdate('dataProjectStep', payload)
          : apiAdd('dataProjectStep', payload)
        action.then(() => {
          this.$message.success('采集步骤已保存')
          this.stepDialogVisible = false
          this.fetchSteps()
        })
      })
    },
    deleteStep(row) {
      this.$confirm(`确定删除步骤 [${row.stepName}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('dataProjectStep', row.dataProjectStepId).then(() => {
          this.$message.success('删除成功')
          this.fetchSteps()
        })
      })
    },
    projectStateText(state) {
      return this.projectStateMap[state] || '未知'
    },
    stepStateText(state) {
      return Number(state) === 1 ? '启用' : '停用'
    }
  }
}
</script>

<style scoped>
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
  padding: 0 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}
.search-flex,
.monitor-legend,
.search-item,
.canvas-top-bar,
.action-btn-group,
.panel-header-summary,
.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.search-item {
  gap: 6px;
}
.search-item label {
  font-size: 11px;
  color: #52637a;
}
.global-input {
  background: #0d1522;
  border: 1px solid #1e3557;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  outline: none;
  width: 180px;
}
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
  color: #fff;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.stat-card {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 10px 12px;
  min-height: 68px;
}
.stat-card span,
.stat-card small {
  display: block;
  color: #52637a;
  font-size: 11px;
}
.stat-card strong {
  display: block;
  font-size: 22px;
}
.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}
.left-tree-panel {
  width: 380px;
  flex-shrink: 0;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.right-combined-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  box-sizing: border-box;
}
.panel-header-summary {
  margin-bottom: 12px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 8px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #06b6d4;
}
.panel-header-summary .badge {
  font-size: 10px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}
.task-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.task-item-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}
.task-active {
  border-color: #38bdf8 !important;
  background: #13253e !important;
}
.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rw-title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.status-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
}
.tag-active {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.tag-pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.task-card-body {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px 8px;
}
.card-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.canvas-top-bar {
  justify-content: space-between;
  background: #0c1424;
  padding: 8px 12px;
  border-radius: 3px;
  margin-bottom: 10px;
  border: 1px solid #16243a;
  flex-shrink: 0;
}
.active-tip {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.active-flow-name {
  color: #10b981;
  font-weight: bold;
}
.flow-state-tag {
  background: #1e293b;
  padding: 2px 6px;
  border-radius: 3px;
  color: #94a3b8;
  font-size: 11px;
}
.workspace-body {
  flex: 1;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 250px;
  gap: 12px;
  min-height: 0;
}
.canvas-container,
.step-table-panel {
  border: 1px solid #16243a;
  border-radius: 3px;
  position: relative;
  overflow: hidden;
  background: #070c14;
}
.step-table-panel {
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.x6-graph-instance {
  width: 100%;
  height: 100%;
}
.empty-fallback {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #070c14;
  color: #415169;
  font-size: 11px;
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
.dark-pager {
  margin-top: 8px;
  text-align: center;
  flex-shrink: 0;
}
.font-num {
}
.text-blue {
  color: #38bdf8 !important;
}
.text-green {
  color: #10b981 !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.danger-link,
.text-red {
  color: #f56c6c !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
::v-deep .el-table,
::v-deep .el-table th,
::v-deep .el-table tr {
  background: #070c14;
  color: #cbd5e1;
}
::v-deep .el-table td,
::v-deep .el-table th.is-leaf {
  border-bottom-color: #172438;
}
::v-deep .el-table--border,
::v-deep .el-table--group {
  border-color: #172438;
}
::v-deep .el-table--enable-row-hover .el-table__body tr:hover > td {
  background: #13253e;
}
</style>
