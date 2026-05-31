<template>
  <div class="governance-page">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">📋 数据治理模型维护总线</span>
        <span class="header-subtitle">数据分类模型与数据标注模型分区维护</span>
      </div>
      <el-button
        type="info"
        size="mini"
        icon="el-icon-refresh"
        class="action-btn"
        @click="initPage"
      >
        同步模型数据
      </el-button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <span>数据分类节点</span
        ><strong class="font-num text-blue">{{ dataModelCount }}</strong
        ><small>树节点总量</small>
      </div>
      <div class="stat-card">
        <span>分类目录</span
        ><strong class="font-num text-green">{{ dataFolderCount }}</strong
        ><small>nodeType = 1</small>
      </div>
      <div class="stat-card">
        <span>数据叶子</span
        ><strong class="font-num text-orange">{{ dataLeafCount }}</strong
        ><small>nodeType = 2</small>
      </div>
      <div class="stat-card">
        <span>标注分类</span
        ><strong class="font-num text-cyan">{{ labelClassCount }}</strong
        ><small>树节点总量</small>
      </div>
      <div class="stat-card">
        <span>标签模型</span
        ><strong class="font-num text-green">{{ labelModelTotal }}</strong
        ><small>实例总量</small>
      </div>
      <div class="stat-card">
        <span>数据源</span
        ><strong class="font-num text-blue">{{
          dataSourceOptions.length
        }}</strong
        ><small>可绑定数量</small>
      </div>
    </div>

    <div class="model-workbench">
      <el-tabs
        v-model="activeTab"
        class="dark-tabs fill-tabs"
        @tab-click="handleTabClick"
      >
        <el-tab-pane name="dataModel" class="full-pane">
          <span slot="label">数据分类模型</span>
          <div class="tab-layout">
            <div class="side-panel" v-loading="loadingDataModel">
              <div class="panel-header-summary">
                <span class="title">🗂️ 数据分类导航树</span>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  @click="openDataModelDialog(false)"
                  >新建根节点</el-button
                >
              </div>
              <el-input
                v-model="dataModelFilter"
                size="mini"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索过滤数据分类..."
              />
              <div class="tree-box">
                <el-tree
                  ref="dataModelTree"
                  :data="dataModelTree"
                  :props="dataModelProps"
                  node-key="dataModelId"
                  default-expand-all
                  highlight-current
                  :expand-on-click-node="false"
                  :filter-node-method="filterDataModelNode"
                  @node-click="handleDataModelClick"
                >
                  <span class="tree-node" slot-scope="{data}">
                    <span class="node-content-flex">
                      <i
                        :class="[
                          data.nodeType === 2
                            ? 'el-icon-s-grid'
                            : 'el-icon-folder-opened',
                          data.nodeType === 2
                            ? 'icon-color-table'
                            : 'icon-color-folder'
                        ]"
                      ></i>
                      <span class="node-text-span">{{ data.modelName }}</span>
                    </span>
                    <span class="tree-actions">
                      <i
                        class="el-icon-plus text-blue"
                        title="添加子节点"
                        @click.stop="openDataModelDialog(false, data)"
                      ></i>
                      <i
                        class="el-icon-edit text-green"
                        title="编辑节点"
                        @click.stop="openDataModelDialog(true, data)"
                      ></i>
                      <i
                        class="el-icon-delete text-red"
                        title="删除节点"
                        @click.stop="deleteDataModel(data)"
                      ></i>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>

            <div class="content-panel">
              <div v-if="activeDataModel" class="fixed-visual-container">
                <div class="visual-hero-card static-top-card">
                  <div class="hero-top-flex">
                    <h3 class="hero-title">{{ activeDataModel.modelName }}</h3>
                    <div class="tag-group">
                      <el-tag
                        size="mini"
                        :type="
                          activeDataModel.nodeType === 2 ? 'success' : 'info'
                        "
                        >{{ nodeTypeText(activeDataModel.nodeType) }}</el-tag
                      >
                      <el-tag size="mini" type="warning">{{
                        dataTypeText(activeDataModel.dataType)
                      }}</el-tag>
                    </div>
                  </div>
                  <p class="hero-memo">
                    {{
                      activeDataModel.dataMemo ||
                      '未录入该分类模型的业务资产描述信息。'
                    }}
                  </p>
                </div>

                <div class="visual-data-grid">
                  <div class="v-grid-item">
                    <span class="v-label">物理数据源</span
                    ><strong class="v-val text-blue">{{
                      activeDataModel.sourceName || '未绑定源'
                    }}</strong>
                  </div>
                  <div class="v-grid-item">
                    <span class="v-label">物理库名 (DB)</span
                    ><strong class="v-val text-cyan">{{
                      activeDataModel.dbName || '--'
                    }}</strong>
                  </div>
                  <div class="v-grid-item">
                    <span class="v-label">父代节点</span
                    ><strong class="v-val text-green">{{
                      activeDataModel.parentModelName || '系统主干根节点'
                    }}</strong>
                  </div>
                </div>

                <div class="visual-tables-block fixed-height-block">
                  <span class="block-subtitle"
                    >🔗 映射绑定物理实体表名称
                    (点击表名可下钻预览数据并进行手工标注)</span
                  >
                  <div
                    v-if="activeDataModel.tableNames"
                    class="tokens-flex-layout scrollable-tokens"
                  >
                    <div
                      v-for="table in activeDataModel.tableNames.split(',')"
                      :key="table"
                      class="visual-table-token interactive-token"
                      @click="previewPhysicalTableData(table)"
                    >
                      <i class="el-icon-notebook-2"></i>
                      <span class="token-text">{{ table }}</span>
                    </div>
                  </div>
                  <div v-else class="empty-tables-holder">
                    <i class="el-icon-warning-outline"></i
                    >该模型分类节点当前尚未绑定底层数据物理表
                  </div>
                </div>
              </div>
              <div v-else class="empty-visual-placeholder">
                <i class="el-icon-monitor"></i>
                <p>请点击左侧分类树节点激活数据模型详情可视化视图</p>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="labelModel" class="full-pane">
          <span slot="label">数据标注模型</span>
          <div class="tab-layout">
            <div class="side-panel" v-loading="loadingLabelClass">
              <div class="panel-header-summary">
                <span class="title">🏷️ 标注分类导航树</span>
                <div>
                  <el-button
                    type="warning"
                    size="mini"
                    icon="el-icon-cpu"
                    @click="openAutoLabelDialog(null)"
                    >自动标注</el-button
                  >
                  <el-button
                    type="primary"
                    size="mini"
                    icon="el-icon-plus"
                    @click="openLabelClassDialog(false)"
                    >新建分类</el-button
                  >
                </div>
              </div>
              <el-input
                v-model="labelClassFilter"
                size="mini"
                clearable
                prefix-icon="el-icon-search"
                placeholder="搜索过滤标注分类..."
              />
              <div class="tree-box">
                <el-tree
                  ref="labelClassTree"
                  :data="labelClassTree"
                  :props="labelClassProps"
                  node-key="labelClassId"
                  default-expand-all
                  highlight-current
                  :expand-on-click-node="false"
                  :filter-node-method="filterLabelClassNode"
                  @node-click="handleLabelClassClick"
                >
                  <span class="tree-node" slot-scope="{data}">
                    <span class="node-content-flex">
                      <i
                        :class="[
                          Number(data.classType) === 1
                            ? 'el-icon-folder-opened'
                            : 'el-icon-price-tag',
                          Number(data.classType) === 1
                            ? 'icon-color-folder'
                            : 'icon-color-label'
                        ]"
                      ></i>
                      <span class="node-text-span">{{ data.className }}</span>
                    </span>
                    <span class="tree-actions">
                      <i
                        v-if="Number(data.classType) === 1"
                        class="el-icon-plus text-blue"
                        title="新建子标签模型"
                        @click.stop="openLabelModelDialog(false, data)"
                      ></i>
                      <i
                        class="el-icon-cpu text-warning"
                        title="针对此分类自动标注"
                        @click.stop="openAutoLabelDialog(data)"
                      ></i>
                      <i
                        class="el-icon-edit text-green"
                        title="编辑分类"
                        @click.stop="openLabelClassDialog(true, data)"
                      ></i>
                      <i
                        class="el-icon-delete text-red"
                        title="删除分类"
                        @click.stop="deleteLabelClass(data)"
                      ></i>
                    </span>
                  </span>
                </el-tree>
              </div>
            </div>

            <div class="content-panel">
              <div class="toolbar top-fixed-toolbar">
                <el-form :inline="true" :model="labelModelQuery" size="mini">
                  <el-form-item label="分类名称"
                    ><el-input
                      v-model="labelModelQuery.className"
                      clearable
                      placeholder="输入分类检索"
                  /></el-form-item>
                  <el-form-item label="标签名称"
                    ><el-input
                      v-model="labelModelQuery.labelName"
                      clearable
                      placeholder="输入标签检索"
                  /></el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      icon="el-icon-search"
                      @click="fetchLabelModels"
                      >查询</el-button
                    >
                    <el-button
                      icon="el-icon-refresh"
                      @click="resetLabelModelQuery"
                      >重置</el-button
                    >
                  </el-form-item>
                </el-form>
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-plus"
                  @click="openLabelModelDialog(false)"
                  >新建标签模型</el-button
                >
              </div>

              <div v-if="activeLabelClass" class="fixed-visual-container">
                <div class="visual-hero-card label-class-theme static-top-card">
                  <div class="hero-top-flex">
                    <h3 class="hero-title">
                      🏷️ {{ activeLabelClass.className }}
                    </h3>
                    <div class="tag-group">
                      <el-tag size="mini" type="info">{{
                        classTypeText(activeLabelClass.classType)
                      }}</el-tag>
                    </div>
                  </div>
                  <p class="hero-memo">
                    <strong>所属来源: </strong
                    >{{ activeLabelClass.classSource || '内部定义' }} |
                    <strong>功能简述: </strong
                    >{{ activeLabelClass.classMemo || '暂无分类深度描述。' }}
                  </p>
                </div>

                <span class="block-subtitle"
                  >📌 包含的具体标签模型看板
                  (点击卡片穿透下钻多模态标注视窗)</span
                >

                <div
                  class="label-cards-layout-grid flex-scroll-grid"
                  v-loading="loadingLabelModel"
                >
                  <div
                    v-for="model in labelModelList"
                    :key="model.labelModelId"
                    class="label-instance-card interactive-label-card"
                    @click="previewLabelModelData(model)"
                  >
                    <div class="card-header-meta">
                      <span class="card-badge">LABEL MODEL</span>
                      <div class="card-action-icons" @click.stop>
                        <i
                          class="el-icon-edit text-green"
                          title="编辑模型"
                          @click="openLabelModelDialog(true, model)"
                        ></i>
                        <i
                          class="el-icon-delete text-red"
                          title="删除模型"
                          @click="deleteLabelModel(model)"
                        ></i>
                      </div>
                    </div>
                    <h4 class="card-model-name">{{ model.labelName }}</h4>
                    <p class="card-model-memo" :title="model.labelMemo">
                      {{ model.labelMemo || '未补充额外注释说明。' }}
                    </p>
                    <div class="card-footer-flex">
                      <span>👤 {{ model.opUserName || '系统' }}</span>
                      <span
                        >⏱️
                        {{
                          model.opTime ? model.opTime.split(' ')[0] : '--'
                        }}</span
                      >
                    </div>
                  </div>
                  <div
                    v-if="labelModelList.length === 0"
                    class="empty-cards-alert"
                  >
                    该标注分类目录项下暂无绑定具体的标签模型实例。
                  </div>
                </div>
                <el-pagination
                  class="pager"
                  small
                  layout="total, prev, pager, next"
                  :current-page.sync="labelModelPage.pageNum"
                  :page-size="labelModelPage.pageSize"
                  :total="labelModelTotal"
                  @current-change="fetchLabelModels"
                />
              </div>
              <div v-else class="empty-visual-placeholder">
                <i class="el-icon-collection"></i>
                <p>请点击左侧标注树分类节点激活标注模型可视化管理视图</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      :title="drillDownTitle"
      :visible.sync="drillDownVisible"
      width="85%"
      append-to-body
      custom-class="dark-drilldown-dialog"
    >
      <div v-loading="loadingDrillDownData" class="drilldown-body">
        <el-tabs
          v-model="drillActiveTab"
          type="border-card"
          class="drill-internal-tabs"
          @tab-change="handleDrillTabChange"
        >
          <el-tab-pane name="annotated" label="📋 已标注明细快照">
            <div class="drilldown-filter-bar">
              <el-form :inline="true" size="mini" class="dark-form-inline">
                <el-form-item label="过滤字段 (Key)">
                  <el-select
                    v-model="drillQueryForm.itemKey"
                    clearable
                    placeholder="请选择表头字段"
                  >
                    <el-option
                      v-for="col in drillDownColumns"
                      :key="col"
                      :label="col"
                      :value="col"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="过滤值 (Value)">
                  <el-input
                    v-model="drillQueryForm.itemValue"
                    clearable
                    placeholder="请输入检索内容"
                    :disabled="!drillQueryForm.itemKey"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    icon="el-icon-search"
                    @click="handleDrillFilterSearch"
                    >筛选</el-button
                  >
                  <el-button icon="el-icon-refresh" @click="resetDrillFilter"
                    >重置</el-button
                  >
                </el-form-item>
              </el-form>
            </div>

            <div class="fixed-table-viewport">
              <el-table
                :data="drillDownTableData"
                size="mini"
                stripe
                border
                class="dark-table full-stretch-table"
              >
                <el-table-column
                  v-for="col in drillDownColumns"
                  :key="col"
                  :prop="col"
                  :label="col"
                  show-overflow-tooltip
                  min-width="140"
                />
                <template slot="empty">
                  <span style="color: #52637a"
                    >暂无检索到相匹配的数据项或 rowData 核心指标为空</span
                  >
                </template>
              </el-table>
            </div>
          </el-tab-pane>

          <el-tab-pane name="manualTagging" label="✍️ 交互式手工标注空间">
            <div class="manual-workbench-top-bar">
              <span class="alert-info-text"
                ><i class="el-icon-info"></i>
                请勾选下方需要绑定到当前标签/目录架构的行级物理实体数据，系统会自动进行深度差异哈希对齐。</span
              >
              <el-button
                type="success"
                size="mini"
                icon="el-icon-check"
                :disabled="manualSelectionRows.length === 0"
                @click="submitManualLabelAction"
              >
                保存并提交手工标注 (已选 {{ manualSelectionRows.length }} 行)
              </el-button>
            </div>

            <div class="drilldown-filter-bar">
              <el-form :inline="true" size="mini" class="dark-form-inline">
                <el-form-item label="检索字段"
                  ><el-input
                    v-model="manualQueryForm.itemKey"
                    placeholder="字段KEY"
                /></el-form-item>
                <el-form-item label="检索值"
                  ><el-input
                    v-model="manualQueryForm.itemValue"
                    placeholder="字段VALUE"
                /></el-form-item>
                <el-form-item>
                  <el-button
                    type="primary"
                    icon="el-icon-search"
                    @click="executeDrillQuery(false)"
                    >查询物理表</el-button
                  >
                </el-form-item>
              </el-form>
            </div>

            <div class="fixed-table-viewport">
              <el-table
                :data="drillDownTableData"
                size="mini"
                stripe
                border
                class="dark-table full-stretch-table"
                ref="manualTable"
                @selection-change="handleManualSelectionChange"
              >
                <el-table-column type="selection" width="50" align="center" />
                <el-table-column
                  v-for="col in drillDownColumns"
                  :key="col"
                  :prop="col"
                  :label="col"
                  show-overflow-tooltip
                  min-width="140"
                />
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>

        <el-pagination
          class="pager"
          small
          background
          layout="total, prev, pager, next, sizes"
          :current-page.sync="drillPage.pageNum"
          :page-size.sync="drillPage.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="drillTotal"
          @current-change="executeDrillQuery(false)"
          @size-change="handleDrillSizeChange"
        />
      </div>
    </el-dialog>

    <el-dialog
      :title="autoLabelTitle"
      :visible.sync="autoLabelVisible"
      width="560px"
      append-to-body
      custom-class="dark-drilldown-dialog"
    >
      <el-form
        ref="autoLabelForm"
        :model="autoLabelForm"
        :rules="autoLabelRules"
        label-width="120px"
        size="mini"
      >
        <el-form-item label="隶属标签分类" prop="labelClassId">
          <el-cascader
            v-model="autoLabelForm.labelClassId"
            :options="labelClassTree"
            :props="labelClassCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="数据交互服务端URL" prop="fetchUrl">
          <div style="display: flex; gap: 8px">
            <el-input
              v-model="autoLabelForm.fetchUrl"
              placeholder="http://api.internal/rest/datasource/json-array"
            />
            <el-button
              type="primary"
              :loading="loadingRemoteJson"
              @click="loadRemoteJsonMetadata"
              >解析抽取</el-button
            >
          </div>
        </el-form-item>

        <el-form-item
          v-if="parsedJsonKeys.length > 0"
          label="映射标注属性"
          prop="labelAttrName"
        >
          <el-select
            v-model="autoLabelForm.labelAttrName"
            placeholder="请选择抽取的关键特征属性列 Key"
            class="full-width"
          >
            <el-option
              v-for="item in parsedJsonKeys"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <div v-if="parsedJsonSummary" class="json-summary-card">
          <p>
            <i class="el-icon-finished"></i> 远程探查成功！检索到
            <strong>{{ parsedJsonRows.length }}</strong>
            条标准元实体记录对。数据样本预览已准备就绪。
          </p>
        </div>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="autoLabelVisible = false"
          >取消</el-button
        >
        <el-button
          size="mini"
          type="primary"
          :disabled="
            parsedJsonRows.length === 0 || !autoLabelForm.labelAttrName
          "
          @click="submitAutoLabelAction"
          >启动自动化清洗打标Pipeline</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditDataModel ? '编辑数据分类模型' : '新增数据分类模型'"
      :visible.sync="dataModelDialogVisible"
      width="640px"
      append-to-body
    >
      <el-form
        ref="dataModelForm"
        :model="dataModelForm"
        :rules="dataModelRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="上级目录"
          ><el-cascader
            v-model="dataModelForm.parentModelId"
            :options="dataModelTree"
            :props="dataModelCascaderProps"
            clearable
            filterable
            class="full-width"
        /></el-form-item>
        <el-form-item label="模型名称" prop="modelName"
          ><el-input v-model="dataModelForm.modelName"
        /></el-form-item>
        <el-form-item label="关联数据源">
          <el-select
            v-model="dataModelForm.dataSourceId"
            filterable
            clearable
            class="full-width"
            @change="handleDataSourceChange"
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
          <el-col :span="12"
            ><el-form-item label="数据类型"
              ><el-radio-group v-model="dataModelForm.dataType"
                ><el-radio-button :label="0">非结构化</el-radio-button
                ><el-radio-button :label="1"
                  >结构化</el-radio-button
                ></el-radio-group
              ></el-form-item
            ></el-col
          >
          <el-col :span="12"
            ><el-form-item label="节点类型"
              ><el-radio-group v-model="dataModelForm.nodeType"
                ><el-radio-button :label="1">文件夹</el-radio-button
                ><el-radio-button :label="2"
                  >数据表</el-radio-button
                ></el-radio-group
              ></el-form-item
            ></el-col
          >
        </el-row>
        <el-form-item label="绑定数据表">
          <el-select
            v-model="selectedTableList"
            multiple
            filterable
            clearable
            :loading="loadingRemoteTables"
            placeholder="请先关联数据源"
            class="full-width"
          >
            <el-option
              v-for="table in remoteDataSourceTables"
              :key="table"
              :label="table"
              :value="table"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据描述"
          ><el-input v-model="dataModelForm.dataMemo" type="textarea" :rows="3"
        /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="dataModelDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitDataModel"
          >确认保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditLabelClass ? '编辑标注分类' : '新增标注分类'"
      :visible.sync="labelClassDialogVisible"
      width="580px"
      append-to-body
    >
      <el-form
        ref="labelClassForm"
        :model="labelClassForm"
        :rules="labelClassRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="上级分类"
          ><el-cascader
            v-model="labelClassForm.parentClassId"
            :options="labelClassTree"
            :props="labelClassCascaderProps"
            clearable
            filterable
            class="full-width"
        /></el-form-item>
        <el-form-item label="分类名称" prop="className"
          ><el-input v-model="labelClassForm.className"
        /></el-form-item>
        <el-row :gutter="8">
          <el-col :span="12"
            ><el-form-item label="分类类型"
              ><el-radio-group v-model="labelClassForm.classType"
                ><el-radio-button :label="1">标签目录</el-radio-button
                ><el-radio-button :label="0"
                  >标签类型</el-radio-button
                ></el-radio-group
              ></el-form-item
            ></el-col
          >
        </el-row>
        <el-form-item label="分类来源"
          ><el-input v-model="labelClassForm.classSource"
        /></el-form-item>
        <el-form-item label="分类描述"
          ><el-input
            v-model="labelClassForm.classMemo"
            type="textarea"
            :rows="3"
        /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="labelClassDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitLabelClass"
          >保存配置</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditLabelModel ? '编辑标签模型' : '新增标签模型'"
      :visible.sync="labelModelDialogVisible"
      width="560px"
      append-to-body
    >
      <el-form
        ref="labelModelForm"
        :model="labelModelForm"
        :rules="labelModelRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="所属分类" prop="labelClassId"
          ><el-cascader
            v-model="labelModelForm.labelClassId"
            :options="labelClassTree"
            :props="labelClassCascaderProps"
            clearable
            filterable
            class="full-width"
        /></el-form-item>
        <el-form-item label="标签名称" prop="labelName"
          ><el-input v-model="labelModelForm.labelName"
        /></el-form-item>
        <el-form-item label="模型说明"
          ><el-input
            v-model="labelModelForm.labelMemo"
            type="textarea"
            :rows="3"
        /></el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="labelModelDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitLabelModel"
          >确认保存</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'
// 导入穿透下钻及新加入的手工/自动异步标注服务
import {tableDataPaged, page, manual, auto} from '@/api/dataInfo.js'

export default {
  name: 'DataGovernanceModel',
  data() {
    return {
      activeTab: 'dataModel',
      loadingDataModel: false,
      loadingLabelClass: false,
      loadingLabelModel: false,
      loadingRemoteTables: false,
      loadingDrillDownData: false,
      loadingRemoteJson: false,

      dataModelFilter: '',
      labelClassFilter: '',
      dataModelTree: [],
      labelClassTree: [],
      dataSourceOptions: [],
      modelTypeOptions: [],
      remoteDataSourceTables: [],
      selectedTableList: [],
      activeDataModel: null,
      activeLabelClass: null,

      dataModelProps: {children: 'children', label: 'modelName'},
      labelClassProps: {children: 'children', label: 'className'},
      dataModelCascaderProps: {
        value: 'dataModelId',
        label: 'modelName',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },
      labelClassCascaderProps: {
        value: 'labelClassId',
        label: 'className',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },

      labelModelQuery: {labelClassId: '', className: '', labelName: ''},
      labelModelList: [],
      labelModelTotal: 0,
      labelModelPage: {pageNum: 1, pageSize: 8},

      // --- 穿透控制核心扩展状态集 ---
      drillDownVisible: false,
      drillActiveTab: 'annotated', // 默认聚焦“已标注数据”
      drillDrillType: 'table', // table 或 label
      drillDownTitle: '物理明细穿透工作视窗',
      drillDownTableData: [],
      drillDownColumns: [],
      drillTotal: 0,
      drillPage: {pageNum: 1, pageSize: 10},
      currentTargetTable: '',
      currentLabelModelId: null,

      drillQueryForm: {itemKey: '', itemValue: ''}, // 已标注查询条件
      manualQueryForm: {itemKey: '', itemValue: ''}, // 手工标注页面下的查询条件
      manualSelectionRows: [], // 存储手工打标用户勾选的元数据

      // --- 自动标注相关组件状态 ---
      autoLabelVisible: false,
      autoLabelTitle: '⚡ 智能驱动自动化打标 Pipeline',
      parsedJsonKeys: [],
      parsedJsonRows: [],
      parsedJsonSummary: false,
      autoLabelForm: {
        labelClassId: null,
        fetchUrl: '',
        labelAttrName: ''
      },
      autoLabelRules: {
        labelClassId: [
          {required: true, message: '请指定关联目标分类架构', trigger: 'change'}
        ],
        fetchUrl: [
          {
            required: true,
            message: '请求的远程网络终点 URL 不能为空',
            trigger: 'blur'
          }
        ],
        labelAttrName: [
          {
            required: true,
            message: '必须映射一个特征主键属性进行分流',
            trigger: 'change'
          }
        ]
      },

      dataModelDialogVisible: false,
      labelClassDialogVisible: false,
      labelModelDialogVisible: false,
      isEditDataModel: false,
      isEditLabelClass: false,
      isEditLabelModel: false,

      dataModelForm: this.getEmptyDataModelForm(),
      labelClassForm: this.getEmptyLabelClassForm(),
      labelModelForm: this.getEmptyLabelModelForm(),

      dataModelRules: {
        modelName: [
          {required: true, message: '请输入模型名称', trigger: 'blur'}
        ]
      },
      labelClassRules: {
        className: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      labelModelRules: {
        labelClassId: [
          {required: true, message: '请选择所属分类', trigger: 'change'}
        ],
        labelName: [
          {required: true, message: '请输入标签名称', trigger: 'blur'}
        ]
      }
    }
  },
  computed: {
    flatDataModels() {
      return this.flattenTree(this.dataModelTree)
    },
    dataModelCount() {
      return this.flatDataModels.length
    },
    dataFolderCount() {
      return this.flatDataModels.filter(item => Number(item.nodeType) === 1)
        .length
    },
    dataLeafCount() {
      return this.flatDataModels.filter(item => Number(item.nodeType) === 2)
        .length
    },
    labelClassCount() {
      return this.flattenTree(this.labelClassTree).length
    }
  },
  watch: {
    dataModelFilter(val) {
      if (this.$refs.dataModelTree) this.$refs.dataModelTree.filter(val)
    },
    labelClassFilter(val) {
      if (this.$refs.labelClassTree) this.$refs.labelClassTree.filter(val)
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    initPage() {
      this.fetchDataSources()
      this.fetchDataModelTree()
      this.fetchLabelClassTree()
      this.fetchLabelModels()
      this.fetchModelTypes()
    },
    getEmptyDataModelForm() {
      return {
        dataModelId: null,
        parentModelId: null,
        dataSourceId: null,
        modelName: '',
        dataType: 1,
        nodeType: 1,
        tableNames: '',
        dataMemo: ''
      }
    },
    getEmptyLabelClassForm() {
      return {
        labelClassId: null,
        parentClassId: null,
        className: '',
        classType: 1,
        classSource: '',
        classMemo: ''
      }
    },
    getEmptyLabelModelForm() {
      return {
        labelModelId: null,
        labelClassId: null,
        labelName: '',
        labelMemo: ''
      }
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    normalizeMapOptions(res) {
      const data = res && res.data ? res.data : {}
      if (Array.isArray(data)) return data
      return Object.keys(data).map(key => ({
        value: Number(key),
        label: data[key]
      }))
    },
    flattenTree(nodes, parentName = '') {
      return (nodes || []).reduce((list, node) => {
        const item = {
          ...node,
          parentModelName: node.parentModelName || parentName
        }
        list.push(item)
        return list.concat(
          this.flattenTree(
            node.children,
            node.modelName || node.className || parentName
          )
        )
      }, [])
    },
    handleTabClick(tab) {
      if (tab.name === 'dataModel') this.fetchDataModelTree()
      if (tab.name === 'labelModel') {
        this.fetchLabelClassTree()
        this.fetchLabelModels()
      }
    },
    filterDataModelNode(value, data) {
      if (!value) return true
      return String(data.modelName || '').indexOf(value) !== -1
    },
    filterLabelClassNode(value, data) {
      if (!value) return true
      return String(data.className || '').indexOf(value) !== -1
    },
    fetchDataSources() {
      request({url: '/rest/dataSource/dataSources', method: 'get'}).then(
        res => {
          this.dataSourceOptions = this.normalizeList(res)
        }
      )
    },
    async handleDataSourceChange(dataSourceId) {
      this.remoteDataSourceTables = []
      if (!dataSourceId) {
        this.selectedTableList = []
        return
      }
      this.loadingRemoteTables = true
      try {
        const response = await request({
          url: `/rest/dataSource/tableNames/${dataSourceId}`,
          method: 'get'
        })
        if (response && response.code === 200) {
          this.remoteDataSourceTables = response.data || []
        }
      } catch (error) {
        console.error(error)
      } finally {
        this.loadingRemoteTables = false
      }
    },
    fetchDataModelTree() {
      this.loadingDataModel = true
      request({url: '/rest/dataModel/findTree', method: 'get'})
        .then(res => {
          this.dataModelTree = this.normalizeList(res)
          if (!this.activeDataModel && this.dataModelTree.length) {
            this.activeDataModel = this.dataModelTree[0]
          }
        })
        .finally(() => {
          this.loadingDataModel = false
        })
    },
    fetchLabelClassTree() {
      this.loadingLabelClass = true
      request({url: '/rest/labelClass/findTree', method: 'get'})
        .then(res => {
          this.labelClassTree = this.normalizeList(res)
          if (!this.activeLabelClass && this.labelClassTree.length) {
            this.activeLabelClass = this.labelClassTree[0]
          }
        })
        .finally(() => {
          this.loadingLabelClass = false
        })
    },
    fetchModelTypes() {
      request({url: '/rest/labelClass/modelTypes', method: 'get'}).then(res => {
        this.modelTypeOptions = this.normalizeMapOptions(res)
      })
    },
    fetchLabelModels() {
      this.loadingLabelModel = true
      const params = {...this.labelModelQuery}
      if (!params.labelClassId) delete params.labelClassId
      apiPage('labelModel', {
        pageNum: this.labelModelPage.pageNum,
        pageSize: this.labelModelPage.pageSize,
        params
      })
        .then(res => {
          this.labelModelList = this.normalizeList(res)
          this.labelModelTotal =
            (res.data && res.data.total) || this.labelModelList.length
        })
        .finally(() => {
          this.loadingLabelModel = false
        })
    },
    handleDataModelClick(data) {
      this.activeDataModel = data
    },
    handleLabelClassClick(data) {
      this.activeLabelClass = data
      this.labelModelQuery.labelClassId = data.labelClassId
      this.labelModelQuery.className = data.className
      this.labelModelPage.pageNum = 1
      this.fetchLabelModels()
    },
    resetLabelModelQuery() {
      this.labelModelQuery = {labelClassId: '', className: '', labelName: ''}
      this.labelModelPage.pageNum = 1
      this.fetchLabelModels()
    },

    /* ==================== 🛠️ 改造核心一：穿透工作窗交互体系 ==================== */
    previewPhysicalTableData(tableName) {
      this.drillDrillType = 'table'
      this.currentTargetTable = tableName
      this.currentLabelModelId = null
      this.drillPage.pageNum = 1
      this.drillActiveTab = 'manualTagging' // 数据表点进来默认进行手工标注
      this.clearDrillFilters()
      this.drillDownTitle = `🔍 物理表穿透治理视窗 -> [表: ${tableName}]`
      this.drillDownVisible = true
      this.executeDrillQuery(true)
    },

    previewLabelModelData(model) {
      this.drillDrillType = 'label'
      this.currentLabelModelId = model.labelModelId
      this.currentTargetTable = this.activeDataModel
        ? this.activeDataModel.tableNames.split(',')[0]
        : 'DATAMODEL'
      this.drillPage.pageNum = 1
      this.drillActiveTab = 'annotated' // 标签点进来默认查看已标注
      this.clearDrillFilters()
      this.drillDownTitle = `🔍 标注模型数据穿透视窗 -> [标签: ${model.labelName}]`
      this.drillDownVisible = true
      this.executeDrillQuery(true)
    },

    clearDrillFilters() {
      this.drillQueryForm = {itemKey: '', itemValue: ''}
      this.manualQueryForm = {itemKey: '', itemValue: ''}
      this.manualSelectionRows = []
    },

    handleDrillTabChange() {
      this.drillPage.pageNum = 1
      this.executeDrillQuery(false)
    },

    /**
     * @description 分流拉取引擎 (核心支持手工标注列表过滤和空值对齐条件)
     */
    executeDrillQuery(isFirstLoad = false) {
      this.loadingDrillDownData = true
      this.drillDownTableData = []

      // 根据当前活跃的内嵌 Tab 组装参数
      const isManualMode = this.drillActiveTab === 'manualTagging'
      const key = isManualMode
        ? this.manualQueryForm.itemKey
        : this.drillQueryForm.itemKey
      const val = isManualMode
        ? this.manualQueryForm.itemValue
        : this.drillQueryForm.itemValue

      const payload = {
        pageNum: this.drillPage.pageNum,
        pageSize: this.drillPage.pageSize,
        params: {
          tableName: this.currentTargetTable,
          itemKey: key || '',
          itemValue: key ? val || '' : '',
          dataModelId: this.activeDataModel
            ? this.activeDataModel.dataModelId
            : 5
        }
      }

      if (this.drillDrillType === 'label' && !isManualMode) {
        payload.params.labelModelId = this.currentLabelModelId
        page(payload)
          .then(res => this.handleDrillResponse(res, isFirstLoad, 'rowData'))
          .finally(() => {
            this.loadingDrillDownData = false
          })
      } else {
        tableDataPaged(payload)
          .then(res => this.handleDrillResponse(res, isFirstLoad, 'ROWDATA'))
          .finally(() => {
            this.loadingDrillDownData = false
          })
      }
    },

    handleDrillResponse(res, updateColumns = false, rowKeyField) {
      const rawList = this.normalizeList(res)
      this.drillTotal = (res.data && res.data.total) || rawList.length
      const columnSet = new Set()

      this.drillDownTableData = rawList.map(item => {
        let parsedData = {}
        if (rowKeyField === 'rowData' && item.rowData) {
          if (typeof item.rowData === 'string') {
            try {
              parsedData = JSON.parse(item.rowData)
            } catch {
              parsedData = {_rawString: item.rowData}
            }
          } else {
            parsedData = item.rowData
          }
          // 留存额外审计元数据
          parsedData.opUserName = item.opUserName
          parsedData.opTime = item.opTime
        } else if (item[rowKeyField] && typeof item[rowKeyField] === 'string') {
          try {
            parsedData = JSON.parse(item[rowKeyField])
          } catch {
            parsedData = {_rawString: item[rowKeyField]}
          }
        } else {
          parsedData = {...item}
        }

        Object.keys(parsedData).forEach(k => {
          if (k !== 'opUserName' && k !== 'opTime') columnSet.add(k)
        })
        return parsedData
      })

      if (updateColumns || this.drillDownColumns.length === 0) {
        this.drillDownColumns = Array.from(columnSet)
      }
    },

    handleDrillFilterSearch() {
      this.drillPage.pageNum = 1
      this.executeDrillQuery(false)
    },
    resetDrillFilter() {
      this.drillQueryForm = {itemKey: '', itemValue: ''}
      this.drillPage.pageNum = 1
      this.executeDrillQuery(false)
    },
    handleDrillSizeChange(val) {
      this.drillPage.pageSize = val
      this.executeDrillQuery()
    },
    handleManualSelectionChange(rows) {
      this.manualSelectionRows = rows
    },

    /* ==================== ✍️ 改造核心二：交互式手工标注提交逻辑 ==================== */
    /**
     * @description 用于精确比对包含空值、null或undefined的多物理行是否实质重复的高级清洗算法
     */
    isSameRowRecord(rowA, rowB) {
      const keys = Object.keys({...rowA, ...rowB})
      return keys.every(key => {
        const valA =
          rowA[key] === null || rowA[key] === undefined
            ? ''
            : String(rowA[key]).trim()
        const valB =
          rowB[key] === null || rowB[key] === undefined
            ? ''
            : String(rowB[key]).trim()
        return valA === valB
      })
    },

    submitManualLabelAction() {
      if (!this.currentLabelModelId) {
        this.$message.warning(
          '无法执行手工标注：未检测到有效激活的标签模型实例。请从标签看板穿透进入。'
        )
        return
      }

      // 提取核心标识，构建标准的规范化 Payload
      const targetDataModelId = this.activeDataModel
        ? this.activeDataModel.dataModelId
        : 5
      const targetTableName = this.currentTargetTable || 'DATAMODEL'

      // 将选中的底层物理数据进行格式标准化清洗
      const formattedSelection = this.manualSelectionRows.map(row => {
        const copy = {...row}
        delete copy.opUserName
        delete copy.opTime
        return copy
      })

      // 构建统一提交参数
      const payload = {
        labelModelId: this.currentLabelModelId,
        manualLabels: [
          {
            dataModelId: targetDataModelId,
            tableName: targetTableName,
            submitRowDatas: formattedSelection
          }
        ]
      }

      this.loadingDrillDownData = true
      manual(payload)
        .then(res => {
          if (res && res.code === 200) {
            this.$message.success(
              `成功为表 [${targetTableName}] 手工追加标记 ${formattedSelection.length} 项数据记录。`
            )
            this.drillDownVisible = false
            this.fetchLabelModels()
          } else {
            this.$message.error(res.msg || '手工标注服务接口中台处理异常')
          }
        })
        .catch(err => {
          console.error(err)
          this.$message.error('无法同步打标结果，请检查服务管道连通性')
        })
        .finally(() => {
          this.loadingDrillDownData = false
        })
    },

    /* ==================== ⚡ 改造核心三：智能驱动自动化标注逻辑 ==================== */
    openAutoLabelDialog(node = null) {
      this.autoLabelForm = {
        labelClassId: node
          ? node.labelClassId
          : this.activeLabelClass
            ? this.activeLabelClass.labelClassId
            : null,
        fetchUrl: '',
        labelAttrName: ''
      }
      this.parsedJsonKeys = []
      this.parsedJsonRows = []
      this.parsedJsonSummary = false
      this.autoLabelVisible = true
      this.$nextTick(
        () =>
          this.$refs.autoLabelForm && this.$refs.autoLabelForm.clearValidate()
      )
    },

    /**
     * @description 异步探查远程三方服务终点，拉取 JSON 数组块并深度计算其 KeySchema
     */
    loadRemoteJsonMetadata() {
      if (!this.autoLabelForm.fetchUrl) {
        this.$message.warning('请先指定远端微服务 JSON 数据源探查端点 URL')
        return
      }
      this.loadingRemoteJson = true
      this.parsedJsonKeys = []
      this.parsedJsonRows = []
      this.parsedJsonSummary = false

      // 跨域探查远端数据管道
      request({url: this.autoLabelForm.fetchUrl, method: 'get'})
        .then(res => {
          // 弹性兼容统一返回体包裹或原生纯数组
          const dataArray = Array.isArray(res)
            ? res
            : res.data && Array.isArray(res.data)
              ? res.data
              : null

          if (!dataArray || dataArray.length === 0) {
            this.$message.error(
              '未在远程端点嗅探到合法的有效标准 JSON 对象数组。'
            )
            return
          }

          this.parsedJsonRows = dataArray
          // 深度抽取融合特征列
          const keyset = new Set()
          dataArray.forEach(obj => {
            if (obj && typeof obj === 'object') {
              Object.keys(obj).forEach(k => keyset.add(k))
            }
          })

          this.parsedJsonKeys = Array.from(keyset)
          this.parsedJsonSummary = true
          this.$message.success(
            `远端探查成功！成功抽取 [${this.parsedJsonKeys.length}] 组元特征键。`
          )
        })
        .catch(err => {
          console.error(err)
          this.$message.error('无法建立远程 HTTP 请求握手，探查失败')
        })
        .finally(() => {
          this.loadingRemoteJson = false
        })
    },

    submitAutoLabelAction() {
      this.$refs.autoLabelForm.validate(valid => {
        if (!valid) return

        const payload = {
          labelClassId: this.autoLabelForm.labelClassId,
          labelAttrName: this.autoLabelForm.labelAttrName,
          submitRowDatas: this.parsedJsonRows
        }

        this.loadingDataModel = true
        auto(payload)
          .then(res => {
            if (res && res.code === 200) {
              this.$message({
                type: 'success',
                message:
                  '🚀 自动化打标特征比对 Pipeline 触发成功，底层分类快照已同步更新。',
                duration: 4000
              })
              this.autoLabelVisible = false
              this.initPage()
            }
          })
          .catch(err => console.error(err))
          .finally(() => {
            this.loadingDataModel = false
          })
      })
    },

    /* ==================== 基础基础表单 CUD 交互控制代码（完好保留） ==================== */
    openDataModelDialog(isEdit, row = null) {
      this.isEditDataModel = isEdit
      this.remoteDataSourceTables = []
      if (isEdit && row) {
        this.dataModelForm = {...row}
        if (row.dataSourceId) {
          this.handleDataSourceChange(row.dataSourceId)
          this.selectedTableList = row.tableNames
            ? row.tableNames.split(',')
            : []
        } else {
          this.selectedTableList = []
        }
      } else {
        this.dataModelForm = {
          ...this.getEmptyDataModelForm(),
          parentModelId: row
            ? row.dataModelId
            : this.activeDataModel && this.activeDataModel.dataModelId
        }
        this.selectedTableList = []
      }
      this.dataModelDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.dataModelForm && this.$refs.dataModelForm.clearValidate()
      )
    },
    submitDataModel() {
      this.$refs.dataModelForm.validate(valid => {
        if (!valid) return
        this.dataModelForm.tableNames = this.selectedTableList.join(',')
        const action = this.isEditDataModel
          ? apiUpdate('dataModel', this.dataModelForm)
          : apiAdd('dataModel', this.dataModelForm)
        action.then(() => {
          this.$message.success('数据分类模型已保存')
          this.dataModelDialogVisible = false
          this.fetchDataModelTree()
        })
      })
    },
    deleteDataModel(row) {
      this.$confirm(`确定级联删除数据分类模型 [${row.modelName}] ？`, '警告', {
        type: 'warning'
      }).then(() => {
        apiDelete('dataModel', row.dataModelId).then(() => {
          this.$message.success('删除成功')
          if (
            this.activeDataModel &&
            this.activeDataModel.dataModelId === row.dataModelId
          )
            this.activeDataModel = null
          this.fetchDataModelTree()
        })
      })
    },
    openLabelClassDialog(isEdit, row = null) {
      this.isEditLabelClass = isEdit
      this.labelClassForm =
        isEdit && row
          ? {...row}
          : {
              ...this.getEmptyLabelClassForm(),
              parentClassId: row
                ? row.labelClassId
                : this.activeLabelClass && this.activeLabelClass.labelClassId
            }
      this.labelClassDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.labelClassForm && this.$refs.labelClassForm.clearValidate()
      )
    },
    submitLabelClass() {
      this.$refs.labelClassForm.validate(valid => {
        if (!valid) return
        const action = this.isEditLabelClass
          ? apiUpdate('labelClass', this.labelClassForm)
          : apiAdd('labelClass', this.labelClassForm)
        action.then(() => {
          this.$message.success('标注分类元数据已保存')
          this.labelClassDialogVisible = false
          this.fetchLabelClassTree()
        })
      })
    },
    deleteLabelClass(row) {
      this.$confirm(`确定删除标注分类 [${row.className}] ？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('labelClass', row.labelClassId).then(() => {
          this.$message.success('删除成功')
          if (
            this.activeLabelClass &&
            this.activeLabelClass.labelClassId === row.labelClassId
          )
            this.activeLabelClass = null
          this.fetchLabelClassTree()
        })
      })
    },
    openLabelModelDialog(isEdit, row = null) {
      this.isEditLabelModel = isEdit
      if (!isEdit && row && row.labelClassId) {
        this.labelModelForm = {
          ...this.getEmptyLabelModelForm(),
          labelClassId: row.labelClassId
        }
      } else if (isEdit && row) {
        this.labelModelForm = {...row}
      } else {
        this.labelModelForm = {
          ...this.getEmptyLabelModelForm(),
          labelClassId:
            this.activeLabelClass && this.activeLabelClass.labelClassId
        }
      }
      this.labelModelDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.labelModelForm && this.$refs.labelModelForm.clearValidate()
      )
    },
    submitLabelModel() {
      this.$refs.labelModelForm.validate(valid => {
        if (!valid) return
        const action = this.isEditLabelModel
          ? apiUpdate('labelModel', this.labelModelForm)
          : apiAdd('labelModel', this.labelModelForm)
        action.then(() => {
          this.$message.success('标签模型已保存')
          this.labelModelDialogVisible = false
          this.fetchLabelModels()
        })
      })
    },
    deleteLabelModel(row) {
      this.$confirm(`确定将标签模型 [${row.labelName}] 移出吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('labelModel', row.labelModelId).then(() => {
          this.$message.success('删除成功')
          this.fetchLabelModels()
        })
      })
    },
    dataTypeText(type) {
      return Number(type) === 0 ? '非结构化' : '结构化'
    },
    nodeTypeText(type) {
      return Number(type) === 2 ? '数据表' : '文件夹'
    },
    classTypeText(type) {
      return Number(type) === 0 ? '标签类型' : '标签目录'
    }
  }
}
</script>

<style scoped>
/* ========================================================================
   暗黑科技版面系统（追加手工打标及多选视窗核心样式）
   ======================================================================== */
.governance-page {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
  overflow: hidden;
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
.search-flex,
.stats-grid,
.panel-header-summary,
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hub-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
}
.header-subtitle {
  color: #52637a;
  font-size: 11px;
}
.action-btn {
  background: #101b2e;
  border: 1px solid #1e3557;
  font-size: 11px;
  color: #fff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin-bottom: 12px;
  flex-shrink: 0;
  gap: 12px;
}
.stat-card {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  min-height: 72px;
  padding: 10px 12px;
}
.stat-card span {
  color: #52637a;
  font-size: 11px;
}
.stat-card strong {
  display: block;
  font-size: 20px;
  line-height: 26px;
}
.stat-card small {
  display: block;
  color: #52637a;
  font-size: 11px;
}

.model-workbench {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
}
.fill-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  min-height: 0;
}

::v-deep .fill-tabs .el-tabs__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: transparent !important;
}
::v-deep .dark-tabs .el-tabs__header {
  margin-bottom: 8px;
  border-bottom: 1px solid #17263d !important;
}
::v-deep .dark-tabs .el-tabs__item {
  color: #64748b;
  font-size: 12px;
  font-weight: bold;
  height: 34px;
  line-height: 34px;
}
::v-deep .dark-tabs .el-tabs__item.is-active {
  color: #38bdf8 !important;
}
::v-deep .dark-tabs .el-tabs__active-bar {
  background-color: #38bdf8;
}

.full-pane,
.tab-layout {
  height: 100%;
  flex: 1;
  min-height: 0;
}
.tab-layout {
  display: grid;
  grid-template-columns: 330px minmax(0, 1fr);
  gap: 12px;
}

.side-panel,
.content-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.panel-header-summary {
  justify-content: space-between;
  margin-bottom: 10px;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 8px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #06b6d4;
}

.tree-box {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin-top: 10px;
}
.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  padding-right: 6px;
}
.tree-actions {
  display: none;
  gap: 8px;
}
.tree-node:hover .tree-actions {
  display: inline-flex;
}

.node-content-flex {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.node-text-span {
  font-size: 12px;
  color: #e2e8f0;
}
.icon-color-folder {
  color: #fbbf24 !important;
}
.icon-color-table {
  color: #38bdf8 !important;
}
.icon-color-label {
  color: #10b981 !important;
}

/* 看板高度固定及流动分布 */
.fixed-visual-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  gap: 12px;
}
.static-top-card {
  flex-shrink: 0;
}
.visual-hero-card {
  background: linear-gradient(135deg, #0e1a30 0%, #070f1e 100%);
  border: 1px solid #1e3557;
  border-radius: 6px;
  padding: 14px;
}
.label-class-theme {
  background: linear-gradient(135deg, #112521 0%, #071012 100%);
  border-color: #115e59;
}
.hero-top-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.hero-title {
  margin: 0;
  font-size: 14px;
  color: #fff;
  font-weight: bold;
}
.tag-group {
  display: flex;
  gap: 6px;
}
.hero-memo {
  margin: 0;
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.5;
}

.visual-data-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  flex-shrink: 0;
}
.v-grid-item {
  background: #0d1625;
  border: 1px solid #16253d;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.v-label {
  font-size: 11px;
  color: #52637a;
}
.v-val {
  font-size: 12px;
}

.fixed-height-block {
  background: #070e17;
  border: 1px solid #132238;
  border-radius: 4px;
  padding: 14px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.block-subtitle {
  font-size: 12px;
  font-weight: bold;
  color: #e2e8f0;
  display: block;
  margin-bottom: 10px;
  flex-shrink: 0;
}
.scrollable-tokens {
  flex: 1;
  overflow-y: auto;
  align-content: flex-start;
  padding-right: 4px;
}
.tokens-flex-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.visual-table-token {
  background: #111c30;
  border: 1px solid #1d3354;
  border-radius: 3px;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.visual-table-token i {
  color: #f59e0b;
  font-size: 12px;
}
.token-text {
  font-size: 12px;
  color: #38bdf8;
}
.interactive-token {
  cursor: pointer;
  transition: all 0.2s ease;
}
.interactive-token:hover {
  background: #172a47;
  border-color: #38bdf8;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.3);
}

.top-fixed-toolbar {
  background: #09101d;
  border: 1px solid #15233c;
  padding: 10px 12px 2px 12px;
  border-radius: 4px;
  margin-bottom: 10px;
  justify-content: space-between;
  flex-shrink: 0;
}
.flex-scroll-grid {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}
.label-cards-layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  align-content: flex-start;
}
.label-instance-card {
  background: #0c1424;
  border: 1px solid #1a2a44;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.25s;
}
.interactive-label-card {
  cursor: pointer;
}
.interactive-label-card:hover {
  border-color: #10b981;
  background: #0f221f;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
}

.card-header-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-badge {
  font-size: 9px;
  background: #1e293b;
  color: #94a3b8;
  padding: 1px 4px;
  border-radius: 2px;
  font-weight: bold;
}
.card-action-icons {
  display: flex;
  gap: 8px;
}
.card-action-icons i {
  cursor: pointer;
  font-size: 12px;
}
.card-model-name {
  margin: 0;
  font-size: 13px;
  color: #f8fafc;
}
.card-model-memo {
  margin: 0;
  font-size: 11px;
  color: #64748b;
  height: 32px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer-flex {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #475569;
  border-top: 1px solid #132035;
  padding-top: 6px;
  margin-top: 2px;
}

/* ==================== 🌟 弹窗内固定高度查看与交互区 ==================== */
.drilldown-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 46px;
}
.fixed-table-viewport {
  height: 380px;
  overflow-y: auto;
  border: 1px solid #17253f;
  border-radius: 4px;
  background-color: #060b13;
}
.full-stretch-table {
  width: 100%;
  height: 100%;
}

.manual-workbench-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #11221a;
  border: 1px solid #124e36;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 6px;
}
.alert-info-text {
  font-size: 12px;
  color: #10b981;
}

.json-summary-card {
  background: #172438;
  border: 1px solid #1e3a63;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 11px;
  color: #94a3b8;
}

::v-deep .dark-drilldown-dialog .el-dialog__body {
  background-color: #040810;
  padding: 12px 16px;
}
::v-deep .dark-drilldown-dialog .el-dialog__header {
  background-color: #09101d;
  border-bottom: 1px solid #192a47;
  padding: 12px 20px;
}
::v-deep .dark-drilldown-dialog .el-dialog__title {
  color: #38bdf8;
  font-size: 13px;
  font-weight: bold;
}
::v-deep .drill-internal-tabs.el-tabs--border-card {
  background: #070d17;
  border: 1px solid #14233c;
}
::v-deep .drill-internal-tabs .el-tabs__header {
  background-color: #0a1322;
  border-bottom: 1px solid #14233c;
}
::v-deep .drill-internal-tabs .el-tabs__item.is-active {
  background-color: #070d17 !important;
  color: #38bdf8 !important;
  border-right-color: #14233c !important;
  border-left-color: #14233c !important;
}

.drilldown-filter-bar {
  background: #09111e;
  border: 1px solid #16263f;
  padding: 10px 12px 2px 12px;
  border-radius: 4px;
  margin-bottom: 8px;
}
::v-deep .dark-form-inline .el-form-item__label {
  color: #94a3b8 !important;
  font-size: 11px;
}
::v-deep .dark-form-inline .el-input__inner {
  background: #050a12 !important;
  border-color: #1a2f4c !important;
  color: #fff !important;
}

.empty-tables-holder,
.empty-cards-alert {
  padding: 24px;
  text-align: center;
  font-size: 12px;
  color: #475569;
}
.empty-visual-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #475569;
}
.empty-visual-placeholder i {
  font-size: 40px;
}
.empty-visual-placeholder p {
  font-size: 12px;
  margin: 0;
}

.pager {
  margin-top: 12px;
  text-align: right;
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
.text-red {
  color: #f56c6c !important;
}
.full-width {
  width: 100%;
}

::v-deep .el-tree {
  background: transparent;
  color: #cbd5e1;
}
::v-deep .el-tree-node__content:hover,
::v-deep .el-tree-node.is-current > .el-tree-node__content {
  background: #13253e;
}
::v-deep .el-input__inner,
::v-deep .el-textarea__inner {
  background: #0d1522;
  border-color: #1e3557;
  color: #fff;
}

::v-deep .dark-table.el-table {
  background: #080e18;
  color: #cbd5e1;
  border-color: #172438;
}
::v-deep .dark-table.el-table th {
  background: #0d1726 !important;
  color: #38bdf8;
  border-bottom: 1px solid #172438;
}
::v-deep .dark-table.el-table td {
  border-bottom: 1px solid #121e30;
  background: #080e18;
}
::v-deep .dark-table.el-table--enable-row-hover .el-table__body tr:hover > td {
  background: #112035 !important;
}
</style>
