<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title"
          ><i class="el-icon-s-data"></i> 数据采集项目流程编排</span
        >
        <div class="search-item">
          <label>项目名称</label>
          <el-input
            v-model="projectQuery.projectName"
            placeholder="输入项目名称..."
            @input="fetchProjects"
            size="small"
          />
        </div>
        <div class="search-item">
          <label>项目分组</label>
          <el-select
            v-model="projectQuery.projectGroup"
            size="mini"
            clearable
            placeholder="全部分组"
            style="width: 150px"
            @change="fetchProjects"
          >
            <el-option
              v-for="item in projectGroups"
              :key="item"
              :label="item"
              :value="item"
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
        <el-button
          type="warning"
          size="mini"
          icon="el-icon-upload2"
          class="action-btn"
          @click="openImportLogDialog"
        >
          导入日志
        </el-button>
        <el-button
          type="success"
          size="mini"
          icon="el-icon-search"
          class="action-btn"
          @click="openLogQueryDialog"
        >
          日志查询
        </el-button>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span>项目总数</span>
        <strong class="font-num text-blue">{{ projectTotal }}</strong>
        <small>当前项目总数</small>
      </div>
      <div class="stat-card">
        <span>启用项目</span>
        <strong class="font-num text-green">{{ runningProjectCount }}</strong>
        <small>已启用数量</small>
      </div>
      <div class="stat-card">
        <span>当前步骤</span>
        <strong class="font-num text-cyan">{{ stepList.length }}</strong>
        <small>当前项目流程节点</small>
      </div>
      <div class="stat-card">
        <span>启用步骤</span>
        <strong class="font-num text-green">{{ enabledStepCount }}</strong>
        <small>已启用步骤</small>
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
          <span class="title"
            ><i class="el-icon-collection"></i> 数据采集项目</span
          >
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
                ><i class="el-icon-document"></i>
                {{ project.projectName }}</span
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
            <span
              style="
                font-size: 11px;
                color: var(--color-text-muted);
                margin-right: 4px;
              "
              >布局方向:</span
            >
            <el-radio-group
              v-model="graphDirection"
              size="mini"
              style="margin-right: 12px"
            >
              <el-radio-button label="LR">朝东 (左→右)</el-radio-button>
              <el-radio-button label="TB">朝南 (上→下)</el-radio-button>
            </el-radio-group>

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
              type="info"
              size="mini"
              icon="el-icon-refresh"
              @click="fetchSteps"
              >刷新画布</el-button
            >
            <el-button
              :type="showBottomTable ? 'success' : 'default'"
              size="mini"
              icon="el-icon-tickets"
              @click="showBottomTable = !showBottomTable"
            >
              {{ showBottomTable ? '隐藏参数列表' : '查看参数列表' }}
            </el-button>
          </div>
        </div>

        <div class="action-tip-banner">
          <i class="el-icon-info"></i>
          <span
            >操作提示：点击左侧项目激活画布；<b>双击画布中的树形节点</b>可快速编辑步骤。点击右上角“查看参数列表”可展开底层视图。</span
          >
        </div>

        <div class="workspace-body">
          <div class="canvas-container" v-loading="loadingSteps">
            <project-graph-x-6
              :steps="stepList"
              :layout-direction="graphDirection"
              @node-dblclick="handleNodeDblClick"
            />
          </div>

          <div
            class="step-table-panel-absolute"
            :class="{'panel-expanded': showBottomTable}"
          >
            <div
              class="panel-header-summary"
              style="
                margin-bottom: 6px;
                padding-bottom: 4px;
                display: flex;
                justify-content: space-between;
              "
            >
              <span class="title"
                ><i class="el-icon-setting"></i> 项目步骤参数明细 ({{
                  stepList.length
                }}
                步)</span
              >
              <i
                class="el-icon-close close-table-icon"
                @click="showBottomTable = false"
              ></i>
            </div>
            <div class="table-scroll-wrapper">
              <el-table
                :data="stepList"
                size="mini"
                stripe
                border
                height="100%"
                class="dark-table"
                v-loading="loadingSteps"
              >
                <el-table-column
                  prop="stepNumber"
                  label="序号"
                  width="60"
                  align="center"
                />
                <el-table-column
                  prop="stepName"
                  label="步骤名称"
                  min-width="140"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="inputFormat"
                  label="输入格式"
                  width="110"
                />
                <el-table-column
                  prop="opTransform"
                  label="转换操作"
                  min-width="120"
                  show-overflow-tooltip
                />
                <el-table-column
                  prop="outputFormat"
                  label="输出格式"
                  width="90"
                />
                <el-table-column
                  prop="stepState"
                  label="状态"
                  width="70"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-tag
                      size="mini"
                      :type="scope.row.stepState === 1 ? 'success' : 'info'"
                    >
                      {{ stepStateText(scope.row.stepState) }}
                    </el-tag>
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
          <el-col :span="12">
            <el-form-item label="开始时间">
              <el-time-picker
                v-model="projectForm.execStartTime"
                value-format="HH:mm:ss"
                placeholder="选择时间"
                class="full-width"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="间隔分钟">
              <el-input-number
                v-model="projectForm.execIntervalMinutes"
                :min="1"
                controls-position="right"
                class="full-width"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
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
          <el-col :span="16">
            <el-form-item label="执行组件">
              <el-input
                v-model="projectForm.execComponent"
                placeholder="采集执行组件或处理器名称"
              />
            </el-form-item> </el-col
        ></el-row>

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
      width="850px"
      append-to-body
      top="5vh"
    >
      <el-form
        ref="stepForm"
        :model="stepForm"
        :rules="stepRules"
        label-width="120px"
        size="mini"
        :key="formRenderKey"
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

        <hr class="form-divider" />

        <el-row :gutter="8">
          <el-col :span="8">
            <el-form-item label="输入格式">
              <el-select
                v-model="stepForm.inputFormat"
                class="full-width"
                @change="handleInputFormatChange"
              >
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
              <el-select
                v-model="stepForm.opTransform"
                class="full-width"
                @change="handleTransformChange"
              >
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
              <el-select
                v-model="stepForm.outputFormat"
                class="full-width"
                @change="handleOutputFormatChange"
              >
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

        <el-form-item label="输入请求参数">
          <div
            v-if="stepForm.inputFormat === 'REST Client'"
            class="rest-url-input-box"
          >
            <el-input
              v-model="restRequestPath"
              placeholder="请输入请求路径，如: simulator/info/XXCL_TXYK_ZYML"
            >
              <template slot="prepend">URL路径:</template>
            </el-input>
          </div>
          <el-input
            v-else
            v-model="stepForm.inputParams"
            type="textarea"
            :rows="2"
            placeholder="请输入输入源配置JSON参数..."
          />
        </el-form-item>

        <el-form-item label="转换参数配置">
          <div v-if="stepForm.opTransform === '字段抽取'">
            <div class="table-op-bar">
              <el-button
                type="success"
                size="mini"
                icon="el-icon-plus"
                @click="addTransformRow('extract')"
                >添加抽取字段</el-button
              >
            </div>
            <div class="inner-table-max-holder">
              <el-table
                :data="dynamicParams.extractList"
                size="mini"
                border
                class="inner-edit-table"
              >
                <el-table-column label="数据名称(dataName)" min-width="120">
                  <template slot-scope="scope"
                    ><el-input v-model="scope.row.dataName" size="mini"
                  /></template>
                </el-table-column>
                <el-table-column label="字段路径(fieldPath)" min-width="150">
                  <template slot-scope="scope"
                    ><el-input
                      v-model="scope.row.fieldPath"
                      size="mini"
                      placeholder="e.g. LLList[*].SJ"
                  /></template>
                </el-table-column>
                <el-table-column
                  label="自定义字段名(fieldName)"
                  min-width="120"
                >
                  <template slot-scope="scope"
                    ><el-input v-model="scope.row.fieldName" size="mini"
                  /></template>
                </el-table-column>
                <el-table-column label="操作" width="60" align="center">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      class="danger-link"
                      icon="el-icon-delete"
                      @click="removeTransformRow('extract', scope.$index)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <div v-else-if="stepForm.opTransform === '关键字过滤'">
            <div class="deduplicate-box-mini">
              <span class="dedup-label">是否需要去重过滤:</span>
              <el-radio-group v-model="isDeduplicateValue" size="mini">
                <el-radio label="是">是 (开启去重)</el-radio>
                <el-radio label="否">否 (默认关闭)</el-radio>
              </el-radio-group>
            </div>
          </div>

          <div v-else-if="stepForm.opTransform === 'JSON转数据表'">
            <div class="table-op-bar">
              <el-button
                type="success"
                size="mini"
                icon="el-icon-plus"
                @click="addTransformRow('jsonToTable')"
                >添加映射字段</el-button
              >
            </div>
            <div class="inner-table-max-holder">
              <el-table
                :data="dynamicParams.jsonToTableList"
                size="mini"
                border
                class="inner-edit-table"
              >
                <el-table-column label="数据名称" width="120">
                  <template slot-scope="scope"
                    ><el-input v-model="scope.row.dataName" size="mini"
                  /></template>
                </el-table-column>
                <el-table-column label="JSON属性路径" min-width="130">
                  <template slot-scope="scope"
                    ><el-input v-model="scope.row.jsonAttrPath" size="mini"
                  /></template>
                </el-table-column>
                <el-table-column label="列名" width="120">
                  <template slot-scope="scope"
                    ><el-input v-model="scope.row.columnName" size="mini"
                  /></template>
                </el-table-column>
                <el-table-column label="列类型" width="120">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.columnType" size="mini">
                      <el-option
                        v-for="t in attrTypeOptions"
                        :key="t"
                        :label="t"
                        :value="t"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="乘系数" width="80">
                  <template slot-scope="scope"
                    ><el-input
                      v-model="scope.row.multiplyFactor"
                      size="mini"
                      placeholder="0.01"
                  /></template>
                </el-table-column>
                <el-table-column label="操作" width="50" align="center">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      class="danger-link"
                      icon="el-icon-delete"
                      @click="removeTransformRow('jsonToTable', scope.$index)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <div v-else-if="stepForm.opTransform === '值填充'">
            <div class="table-op-bar">
              <el-button
                type="success"
                size="mini"
                icon="el-icon-plus"
                @click="addTransformRow('fill')"
                >添加填充项</el-button
              >
            </div>
            <div class="inner-table-max-holder">
              <el-table
                :data="dynamicParams.fillList"
                size="mini"
                border
                class="inner-edit-table"
              >
                <el-table-column label="JSON属性路径" min-width="140">
                  <template slot-scope="scope"
                    ><el-input v-model="scope.row.jsonAttrPath" size="mini"
                  /></template>
                </el-table-column>
                <el-table-column label="填充算子" min-width="130">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.fillOperator" size="mini">
                      <el-option label="当前时间戳" value="当前时间戳" />
                      <el-option label="固定默认值" value="固定默认值" />
                      <el-option label="UUID流水号" value="UUID流水号" />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="填充类型" width="120">
                  <template slot-scope="scope">
                    <el-select
                      v-model="scope.row.fillType"
                      size="mini"
                      clearable
                      placeholder="请选择"
                    >
                      <el-option
                        v-for="t in attrTypeOptions"
                        :key="t"
                        :label="t"
                        :value="t"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="填充值" min-width="120">
                  <template slot-scope="scope">
                    <el-input
                      v-model="scope.row.fillValue"
                      size="mini"
                      :disabled="scope.row.fillOperator === '当前时间戳'"
                      placeholder="选填"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="50" align="center">
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      class="danger-link"
                      icon="el-icon-delete"
                      @click="removeTransformRow('fill', scope.$index)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <div v-else>
            <el-input
              v-model="stepForm.transformParams"
              type="textarea"
              :rows="2"
              placeholder="无需配置详细表格..."
            />
          </div>
        </el-form-item>

        <el-form-item label="输出参数配置">
          <div
            v-if="stepForm.outputFormat === '数据表'"
            class="table-output-box"
          >
            <el-row :gutter="8">
              <el-col :span="12">
                <el-form-item label="目标表名" label-width="70px">
                  <el-input
                    v-model="dynamicParams.outputTable.tableName"
                    placeholder="如: TEMP_PTZY"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="更新策略" label-width="70px">
                  <el-select
                    v-model="dynamicParams.outputTable.updateMethod"
                    class="full-width"
                  >
                    <el-option label="总是新增" value="总是新增" />
                    <el-option label="存在则更新" value="存在则更新" />
                    <el-option label="覆盖导入" value="覆盖导入" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item
                  label="主键比对"
                  label-width="70px"
                  style="margin-bottom: 0"
                >
                  <el-input
                    v-model="dynamicParams.outputTable.compareColumnNames"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入用于主键比对判定或冲突更新的字段列名，多个字段用英文逗号分离开"
                    :disabled="
                      dynamicParams.outputTable.updateMethod === '总是新增'
                    "
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
          <div v-else>
            <el-input
              v-model="stepForm.outputParams"
              type="textarea"
              :rows="2"
              placeholder="请输入输出目的配置参数..."
            />
          </div>
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
          >保存步骤配置</el-button
        >
      </span>
    </el-dialog>

    <!-- 导入日志弹窗 -->
    <el-dialog
      title="导入设备日志"
      :visible.sync="importLogDialogVisible"
      width="500px"
      append-to-body
    >
      <el-form label-width="100px" size="mini">
        <el-form-item label="选择文件">
          <div style="display: flex; align-items: center; gap: 10px">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-folder-opened"
              @click="$refs.fileInput.click()"
            >
              选取文件
            </el-button>
            <span v-if="selectedFile" style="color: #10b981; font-size: 12px">
              <i class="el-icon-document"></i> {{ selectedFile.name }}
            </span>
            <span v-else style="color: var(--color-text-muted); font-size: 11px"
              >未选择文件</span
            >
          </div>
          <input
            ref="fileInput"
            type="file"
            accept=".csv,.zip"
            style="display: none"
            @change="handleFileSelect"
          />
          <div
            style="
              color: var(--color-text-muted);
              font-size: 11px;
              margin-top: 6px;
            "
          >
            支持 .csv 或 .zip 格式文件
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="importLogDialogVisible = false"
          >取消</el-button
        >
        <el-button
          size="mini"
          type="warning"
          :loading="uploading"
          :disabled="!selectedFile"
          @click="submitImportLog"
        >
          {{ uploading ? '导入中...' : '开始导入' }}
        </el-button>
      </span>
    </el-dialog>

    <!-- 日志查询弹窗 -->
    <el-dialog
      title="设备日志查询"
      :visible.sync="logQueryDialogVisible"
      width="1100px"
      append-to-body
      top="3vh"
    >
      <div class="log-query-filter">
        <el-form :inline="true" size="mini" label-width="80px">
          <el-form-item label="日志级别">
            <el-select
              v-model="logQuery.logLevel"
              clearable
              placeholder="全部"
              style="width: 120px"
            >
              <el-option label="INFO" value="INFO" />
              <el-option label="WARN" value="WARN" />
              <el-option label="ERROR" value="ERROR" />
              <el-option label="DEBUG" value="DEBUG" />
            </el-select>
          </el-form-item>
          <el-form-item label="通信协议">
            <el-select
              v-model="logQuery.protocol"
              clearable
              placeholder="全部"
              style="width: 130px"
            >
              <el-option label="TCP" value="TCP" />
              <el-option label="UDP" value="UDP" />
              <el-option label="HTTP" value="HTTP" />
              <el-option label="MQTT" value="MQTT" />
            </el-select>
          </el-form-item>
          <el-form-item label="链路类型">
            <el-select
              v-model="logQuery.linkType"
              clearable
              placeholder="全部"
              style="width: 130px"
            >
              <el-option label="有线" value="有线" />
              <el-option label="无线" value="无线" />
              <el-option label="卫星" value="卫星" />
            </el-select>
          </el-form-item>
          <el-form-item label="源平台ID">
            <el-input
              v-model="logQuery.srcPTID"
              placeholder="源平台ID"
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item label="目标平台ID">
            <el-input
              v-model="logQuery.dstPTID"
              placeholder="目标平台ID"
              style="width: 120px"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="fetchLogs(1)"
              >查询</el-button
            >
            <el-button icon="el-icon-refresh" @click="resetLogQuery"
              >重置</el-button
            >
          </el-form-item>
        </el-form>
      </div>

      <el-table
        :data="logList"
        size="mini"
        stripe
        border
        height="420px"
        v-loading="loadingLogs"
        class="dark-table"
      >
        <el-table-column prop="logTime" label="日志时间" width="150" />
        <el-table-column
          prop="logLevel"
          label="级别"
          width="100"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag
              size="mini"
              :type="
                scope.row.logLevel === 'ERROR'
                  ? 'danger'
                  : scope.row.logLevel === 'WARN'
                    ? 'warning'
                    : 'info'
              "
            >
              {{ scope.row.logLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="xxXH"
          label="信息序号"
          width="80"
          align="center"
        />
        <el-table-column
          prop="srcSBMC"
          label="源设备"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="dstSBMC"
          label="目标设备"
          min-width="100"
          show-overflow-tooltip
        />
        <el-table-column
          prop="protocol"
          label="协议"
          width="80"
          align="center"
        />
        <el-table-column
          prop="linkType"
          label="链路类型"
          width="80"
          align="center"
        />
        <el-table-column
          prop="opType"
          label="操作类型"
          width="90"
          align="center"
        />
        <el-table-column
          prop="statusCode"
          label="状态码"
          width="70"
          align="center"
        />
        <el-table-column
          prop="logMsg"
          label="日志消息"
          min-width="180"
          show-overflow-tooltip
        />
      </el-table>

      <div class="log-pagination">
        <el-pagination
          small
          layout="total, prev, pager, next, sizes"
          :current-page.sync="logPage.pageNum"
          :page-size.sync="logPage.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="logTotal"
          @current-change="fetchLogs"
          @size-change="fetchLogs(1)"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'
// 需求 1：导入抽离出去的 X6 渲染画布独立组件
import ProjectGraphX6 from '../components/ProjectGraphX6.vue'

export default {
  name: 'DataCollectionProject',
  components: {
    ProjectGraphX6
  },
  data() {
    return {
      graphDirection: 'LR', // 默认 'LR'（朝东：左到右），可选 'TB'（朝南：上到下）
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
      importLogDialogVisible: false,
      uploading: false,
      uploadedFileName: '',
      selectedFile: null,
      logQueryDialogVisible: false,
      loadingLogs: false,
      logList: [],
      logTotal: 0,
      logPage: {pageNum: 1, pageSize: 20},
      logQuery: {
        logLevel: '',
        protocol: '',
        linkType: '',
        srcPTID: '',
        dstPTID: ''
      },
      showBottomTable: false,
      formRenderKey: 1,

      projectForm: this.getEmptyProjectForm(),
      stepForm: this.getEmptyStepForm(),
      stepInputIds: [],
      restRequestPath: '',
      isDeduplicateValue: '否',

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

      dynamicParams: {
        extractList: [],
        jsonToTableList: [],
        fillList: [],
        outputTable: {
          tableName: '',
          updateMethod: '总是新增',
          compareColumnNames: ''
        }
      },

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
    },
    attrTypeOptions() {
      return this.getAttrTypes()
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    getAttrTypes() {
      return ['浮点数', '整数', '长整数', '字符串', '日期时间', '选择项']
    },
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
        })
        .finally(() => {
          this.loadingSteps = false
        })
    },

    // 处理 X6 组件双击传回来的触发动作
    handleNodeDblClick(stepData) {
      this.openStepDialog(true, stepData)
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

    handleInputFormatChange(val) {
      if (val === 'REST Client' && !this.restRequestPath) {
        this.restRequestPath = 'simulator/info/XXCL_TXYK_ZYML'
      }
      this.$forceUpdate()
    },
    handleTransformChange() {
      this.formRenderKey++
      this.$forceUpdate()
    },
    handleOutputFormatChange() {
      this.$forceUpdate()
    },

    addTransformRow(type) {
      if (type === 'extract') {
        this.dynamicParams.extractList.push({
          dataName: '',
          fieldPath: '',
          fieldName: ''
        })
      } else if (type === 'jsonToTable') {
        this.dynamicParams.jsonToTableList.push({
          dataName: '',
          jsonAttrPath: '',
          columnName: '',
          columnType: '字符串',
          multiplyFactor: ''
        })
      } else if (type === 'fill') {
        this.dynamicParams.fillList.push({
          jsonAttrPath: '',
          fillOperator: '当前时间戳',
          fillType: '',
          fillValue: ''
        })
      }
      this.$forceUpdate()
    },
    removeTransformRow(type, index) {
      if (type === 'extract') this.dynamicParams.extractList.splice(index, 1)
      if (type === 'jsonToTable')
        this.dynamicParams.jsonToTableList.splice(index, 1)
      if (type === 'fill') this.dynamicParams.fillList.splice(index, 1)
      this.$forceUpdate()
    },

    openStepDialog(isEdit, row) {
      if (!this.activeProject) return
      this.isEditStep = isEdit
      this.formRenderKey++

      this.stepForm =
        isEdit && row
          ? {...row}
          : {
              ...this.getEmptyStepForm(),
              dataProjectId: this.activeProject.dataProjectId,
              stepNumber: this.stepList.length + 1
            }

      this.stepInputIds = this.toIdArray(this.stepForm.inputStepIds)

      this.restRequestPath = ''
      this.isDeduplicateValue = '否'
      this.$set(this.dynamicParams, 'extractList', [])
      this.$set(this.dynamicParams, 'jsonToTableList', [])
      this.$set(this.dynamicParams, 'fillList', [])
      this.$set(this.dynamicParams, 'outputTable', {
        tableName: '',
        updateMethod: '总是新增',
        compareColumnNames: ''
      })

      if (
        isEdit &&
        this.stepForm.inputFormat === 'REST Client' &&
        this.stepForm.inputParams
      ) {
        try {
          const inParsed = JSON.parse(this.stepForm.inputParams)
          this.restRequestPath = inParsed.requestPath || ''
        } catch (e) {
          this.restRequestPath = this.stepForm.inputParams
        }
      }

      if (isEdit && this.stepForm.transformParams) {
        try {
          const parsed = JSON.parse(this.stepForm.transformParams)
          const op = this.stepForm.opTransform

          if (op === '字段抽取') {
            const arr = []
            for (let i = 0; i < 15; i++) {
              if (
                parsed[`dataName${i}`] !== undefined ||
                parsed[`fieldPath${i}`] !== undefined
              ) {
                arr.push({
                  dataName: parsed[`dataName${i}`] || '',
                  fieldPath: parsed[`fieldPath${i}`] || '',
                  fieldName: parsed[`fieldName${i}`] || ''
                })
              }
            }
            this.$set(
              this.dynamicParams,
              'extractList',
              arr.filter(i => i.dataName || i.fieldPath)
            )
          } else if (op === '关键字过滤') {
            this.isDeduplicateValue = parsed.isDeduplicate || '否'
          } else if (op === 'JSON转数据表') {
            const arr = []
            for (let i = 0; i < 15; i++) {
              if (
                parsed[`dataName${i}`] !== undefined ||
                parsed[`jsonAttrPath${i}`] !== undefined
              ) {
                arr.push({
                  dataName: parsed[`dataName${i}`] || '',
                  jsonAttrPath: parsed[`jsonAttrPath${i}`] || '',
                  columnName: parsed[`columnName${i}`] || '',
                  columnType: parsed[`columnType${i}`] || '字符串',
                  multiplyFactor: parsed[`multiplyFactor${i}`] || ''
                })
              }
            }
            this.$set(
              this.dynamicParams,
              'jsonToTableList',
              arr.filter(i => i.dataName || i.jsonAttrPath)
            )
          } else if (op === '值填充') {
            const arr = []
            for (let i = 0; i < 15; i++) {
              if (
                parsed[`jsonAttrPath${i}`] !== undefined ||
                parsed[`fillOperator${i}`] !== undefined
              ) {
                arr.push({
                  jsonAttrPath: parsed[`jsonAttrPath${i}`] || '',
                  fillOperator: parsed[`fillOperator${i}`] || '当前时间戳',
                  fillType: parsed[`fillType${i}`] || '',
                  fillValue: parsed[`fillValue${i}`] || ''
                })
              }
            }
            this.$set(
              this.dynamicParams,
              'fillList',
              arr.filter(i => i.jsonAttrPath || i.fillOperator)
            )
          }
        } catch (e) {
          console.error('转换参数解析回显失败:', e)
        }
      }

      if (
        isEdit &&
        this.stepForm.outputFormat === '数据表' &&
        this.stepForm.outputParams
      ) {
        try {
          const outParsed = JSON.parse(this.stepForm.outputParams)
          if (outParsed.tableName) {
            this.$set(this.dynamicParams, 'outputTable', {
              tableName: outParsed.tableName || '',
              updateMethod: outParsed.updateMethod || '总是新增',
              compareColumnNames: outParsed.compareColumnNames || ''
            })
          }
        } catch (e) {
          console.error('输出参数回显解析失败:', e)
        }
      }

      this.stepDialogVisible = true
      this.$nextTick(() => {
        this.$refs.stepForm && this.$refs.stepForm.clearValidate()
        this.$forceUpdate()
      })
    },

    submitStep() {
      this.$refs.stepForm.validate(valid => {
        if (!valid) return

        if (this.stepForm.inputFormat === 'REST Client') {
          this.stepForm.inputParams = JSON.stringify({
            requestPath: this.restRequestPath
          })
        }

        const op = this.stepForm.opTransform
        let finalTransformObj = {}

        if (op === '字段抽取') {
          const list = [...this.dynamicParams.extractList]
          while (list.length < 10)
            list.push({dataName: '', fieldPath: '', fieldName: ''})
          list.forEach((row, i) => {
            finalTransformObj[`dataName${i}`] = row.dataName || ''
            finalTransformObj[`fieldPath${i}`] = row.fieldPath || ''
            finalTransformObj[`fieldName${i}`] = row.fieldName || ''
          })
          this.stepForm.transformParams = JSON.stringify(finalTransformObj)
        } else if (op === '关键字过滤') {
          this.stepForm.transformParams = JSON.stringify({
            isDeduplicate: this.isDeduplicateValue
          })
        } else if (op === 'JSON转数据表') {
          const list = [...this.dynamicParams.jsonToTableList]
          while (list.length < 10)
            list.push({
              dataName: '',
              jsonAttrPath: '',
              columnName: '',
              columnType: '',
              multiplyFactor: ''
            })
          list.forEach((row, i) => {
            finalTransformObj[`dataName${i}`] = row.dataName || ''
            finalTransformObj[`jsonAttrPath${i}`] = row.jsonAttrPath || ''
            finalTransformObj[`columnName${i}`] = row.columnName || ''
            finalTransformObj[`columnType${i}`] = row.columnType || ''
            finalTransformObj[`multiplyFactor${i}`] = row.multiplyFactor || ''
          })
          this.stepForm.transformParams = JSON.stringify(finalTransformObj)
        } else if (op === '值填充') {
          const list = [...this.dynamicParams.fillList]
          while (list.length < 3)
            list.push({
              jsonAttrPath: '',
              fillOperator: '',
              fillType: '',
              fillValue: ''
            })
          list.forEach((row, i) => {
            finalTransformObj[`jsonAttrPath${i}`] = row.jsonAttrPath || ''
            finalTransformObj[`fillOperator${i}`] = row.fillOperator || ''
            finalTransformObj[`fillType${i}`] = row.fillType || ''
            finalTransformObj[`fillValue${i}`] = row.fillValue || ''
          })
          this.stepForm.transformParams = JSON.stringify(finalTransformObj)
        }

        if (this.stepForm.outputFormat === '数据表') {
          this.stepForm.outputParams = JSON.stringify(
            this.dynamicParams.outputTable
          )
        }

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
    },
    openImportLogDialog() {
      this.importLogDialogVisible = true
      this.uploadedFileName = ''
      this.selectedFile = null
      this.$nextTick(() => {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
      })
    },
    handleFileSelect(e) {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        const ext = file.name.split('.').pop().toLowerCase()
        if (ext !== 'csv' && ext !== 'zip') {
          this.$message.error('仅支持 .csv 或 .zip 格式文件')
          this.selectedFile = null
          this.$refs.fileInput.value = ''
          return
        }
        this.selectedFile = file
      } else {
        this.selectedFile = null
      }
    },
    submitImportLog() {
      if (!this.selectedFile) {
        this.$message.warning('请先选择文件')
        return
      }
      this.uploading = true
      const formData = new FormData()
      formData.append('file', this.selectedFile)
      request({
        url: '/rest/deviceLog/upload',
        method: 'post',
        headers: {'Content-Type': 'multipart/form-data'},
        data: formData
      })
        .then(res => {
          const fileName = res && res.length > 0 ? res[0] : res || ''
          if (!fileName) {
            this.$message.error('文件上传失败，返回为空')
            this.uploading = false
            return
          }
          this.uploadedFileName = fileName
          this.$message.success('文件上传成功')
          // 上传成功后自动调用导入接口
          return request({
            url: `/device/deviceLog/import/${fileName}`,
            method: 'post'
          })
        })
        .then(() => {
          this.$message.success('日志导入成功')
          this.importLogDialogVisible = false
          this.uploading = false
        })
        .catch(() => {
          this.$message.error('日志导入失败')
          this.uploading = false
        })
    },
    openLogQueryDialog() {
      this.logQueryDialogVisible = true
      this.$nextTick(() => {
        this.fetchLogs(1)
      })
    },
    fetchLogs(page) {
      if (page) this.logPage.pageNum = page
      this.loadingLogs = true
      const params = {}
      if (this.logQuery.logLevel) params.logLevel = this.logQuery.logLevel
      if (this.logQuery.protocol) params.protocol = this.logQuery.protocol
      if (this.logQuery.linkType) params.linkType = this.logQuery.linkType
      if (this.logQuery.srcPTID) params.srcPTID = this.logQuery.srcPTID
      if (this.logQuery.dstPTID) params.dstPTID = this.logQuery.dstPTID
      request({
        url: '/rest/deviceLogPage',
        method: 'post',
        data: {
          pageNum: this.logPage.pageNum,
          pageSize: this.logPage.pageSize,
          params
        }
      })
        .then(res => {
          const data = res.data || res
          this.logList = data.list || []
          this.logTotal = data.total || 0
        })
        .catch(() => {
          this.logList = []
          this.logTotal = 0
        })
        .finally(() => {
          this.loadingLogs = false
        })
    },
    resetLogQuery() {
      this.logQuery = {
        logLevel: '',
        protocol: '',
        linkType: '',
        srcPTID: '',
        dstPTID: ''
      }
      this.fetchLogs(1)
    }
  }
}
</script>

<style scoped>
.screen-container {
  width: 100%;
  height: 100%;
  background-color: var(--bg-base);
  color: var(--color-text-main);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px;
}
.top-search-header {
  height: 46px;
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
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
  color: var(--color-primary);
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
  color: var(--color-text-muted);
}
.action-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  font-size: 11px;
  color: var(--color-text-main);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}
.stat-card {
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 11px 12px;
  min-height: 68px;
}
.stat-card span,
.stat-card small {
  display: block;
  color: var(--color-text-muted);
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
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 11px;
  display: flex;
  flex-direction: column;
}
.right-combined-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
  box-sizing: border-box;
  position: relative;
}

.action-tip-banner {
  background: rgba(6, 182, 212, 0.06);
  border: 1px dashed #14465b;
  padding: 6px 11px;
  font-size: 11px;
  border-radius: 4px;
  margin-bottom: 11px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
.action-tip-banner b {
  color: var(--color-primary);
}

.panel-header-summary {
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-dark);
  padding-bottom: 8px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-cyan);
}
.panel-header-summary .badge {
  font-size: 11px;
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
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}
.task-active {
  border-color: var(--color-primary) !important;
  background: var(--bg-hover) !important;
}
.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rw-title {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-text-main);
}
.status-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
}
.tag-active {
  background: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
}
.tag-pending {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}
.task-card-body {
  font-size: 11px;
  color: var(--color-text-muted);
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
  background: var(--bg-panel);
  padding: 8px 12px;
  border-radius: 3px;
  margin-bottom: 11px;
  border: 1px solid var(--border-dark);
  flex-shrink: 0;
}
.active-tip {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.active-flow-name {
  color: var(--color-success);
  font-weight: bold;
}
.flow-state-tag {
  background: var(--bg-input);
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.workspace-body {
  flex: 1;
  position: relative;
  min-height: 0;
  overflow: hidden;
}
.canvas-container {
  width: 100%;
  height: 100%;
  border: 1px solid var(--border-dark);
  border-radius: 3px;
  background: var(--bg-input);
}

.step-table-panel-absolute {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 260px;
  background: var(--bg-base);
  border-top: 2px solid var(--border-light);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.8);
  padding: 11px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateY(100%);
}
.panel-expanded {
  transform: translateY(0);
}
.close-table-icon {
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-muted);
}
.close-table-icon:hover {
  color: #f56c6c;
}
.table-scroll-wrapper {
  flex: 1;
  min-height: 0;
  width: 100%;
}

.dark-pager {
  margin-top: 8px;
  text-align: center;
  flex-shrink: 0;
}
/* font-num */
.text-blue {
  color: var(--color-primary) !important;
}
.text-green {
  color: var(--color-success) !important;
}
.text-cyan {
  color: var(--color-cyan) !important;
}
.text-orange {
  color: var(--color-warning) !important;
}
.danger-link,
.text-red {
  color: var(--color-danger) !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.full-width {
  width: 100%;
}

.form-divider {
  border: 0;
  border-top: 1px solid var(--border-dark);
  margin: 8px 0 16px 0;
}
.table-op-bar {
  margin-bottom: 6px;
  text-align: right;
}
.inner-table-max-holder {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid var(--border-dark);
  border-radius: 3px;
}

/* 需求 3：优化“是否去重”过滤界面的小微样式，收缩字体、对齐表单行高 */
.deduplicate-box-mini {
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.dedup-label {
  margin-right: 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}
.deduplicate-box-mini ::v-deep .el-radio__label {
  font-size: 12px !important;
}

.rest-url-input-box {
  margin-bottom: 6px;
}
.inner-edit-table {
  background-color: var(--bg-input) !important;
}
.inner-edit-table ::v-deep th {
  background-color: var(--bg-panel) !important;
  color: var(--color-text-muted) !important;
  padding: 4px 0;
}
.inner-edit-table ::v-deep td {
  padding: 2px 0;
  background-color: var(--bg-input) !important;
}
.table-output-box {
  background: var(--bg-input);
  border: 1px solid var(--border-light);
  padding: 11px;
  border-radius: 4px;
}

::v-deep .el-input-group__prepend {
  background-color: var(--bg-input) !important;
  border-color: var(--border-light) !important;
  color: var(--color-primary) !important;
}

/* 日志查询 */
.log-query-filter {
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 10px;
}
.log-query-filter ::v-deep .el-form-item {
  margin-bottom: 0;
}
.log-query-filter ::v-deep .el-form-item__label {
  color: var(--color-text-muted);
  font-size: 11px;
}
.log-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}
.log-pagination ::v-deep .el-pagination {
  color: var(--color-text-muted);
}
.log-pagination ::v-deep .el-pagination button,
.log-pagination ::v-deep .el-pager li {
  background-color: var(--bg-panel);
  color: var(--color-text-muted);
  border: 1px solid var(--border-light);
}
.log-pagination ::v-deep .el-pager li.active {
  background-color: var(--bg-hover);
  color: var(--color-primary);
}
</style>
