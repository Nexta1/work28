<template>
  <div class="resource-page">
    <div class="resource-aside" v-loading="loadingClass">
      <div class="panel-title-row">
        <div>
          <h3>主题分类</h3>
        </div>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="openClassDialog(false)"
        >
          新建分类
        </el-button>
      </div>

      <div class="tree-box">
        <el-tree
          :data="[classTree]"
          :props="classTreeProps"
          node-key="subjectClassId"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleClassClick"
        >
          <span class="tree-node" slot-scope="{data}">
            <span
              ><i class="el-icon-folder text-blue"></i>
              {{ data.className }}</span
            >
            <span class="tree-actions">
              <i
                class="el-icon-edit text-green"
                @click.stop="openClassDialog(true, data)"
              ></i>
              <i
                class="el-icon-delete text-red"
                @click.stop="deleteClass(data)"
              ></i>
            </span>
          </span>
        </el-tree>
      </div>
    </div>

    <div class="resource-main">
      <div class="hero-strip">
        <div>
          <h2>订阅分发</h2>
          <p>管理主题发布、订阅申请和审核状态，形成可追踪的数据分发链路。</p>
        </div>
        <div class="metric-group">
          <div class="metric-card">
            <strong>{{ subjectTotal }}</strong>
            <span>主题</span>
          </div>
          <div class="metric-card warn">
            <strong>{{ subscribeTotal }}</strong>
            <span>订阅</span>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部主题" name="subjectAll">
          <div class="toolbar">
            <el-form :inline="true" :model="subjectQueryAll" size="mini">
              <el-form-item label="主题">
                <el-input
                  v-model="subjectQueryAll.keyword"
                  clearable
                  placeholder="主题关键词"
                />
              </el-form-item>
              <el-form-item label="分类">
                <el-input
                  v-model="subjectQueryAll.className"
                  clearable
                  placeholder="分类名称"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="fetchSubjects(0)"
                  >查询</el-button
                >
                <el-button icon="el-icon-refresh" @click="resetSubjectQuery(0)"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openSubjectDialog(false)"
            >
              新建主题
            </el-button>
          </div>

          <div v-loading="loadingSubject" class="card-container">
            <div class="card-grid">
              <div v-for="item in subjectList" :key="item.subjectId">
                <el-card
                  shadow="hover"
                  :body-style="{padding: '14px'}"
                  class="subject-card"
                >
                  <div class="card-title-row">
                    <span class="card-title-text">{{ item.keyword }}</span>
                    <el-tag size="mini" type="info">{{
                      item.className
                    }}</el-tag>
                  </div>
                  <div class="card-body-content">
                    <div class="info-row info-h">
                      <span class="info-label">模型关联</span>
                      <div class="model-pair-group">
                        <template v-if="getModelAttrList(item).length > 0">
                          <div
                            v-for="(pair, idx) in getModelAttrList(item)"
                            :key="idx"
                            class="model-pair-item"
                          >
                            <span class="pair-model">
                              {{ pair.modelName }}
                              <span class="pair-roleid" v-if="pair.modelId">
                                ({{ pair.modelId }})
                              </span>
                            </span>
                            <span class="pair-attr">
                              <i class="el-icon-right"></i>
                              {{ pair.attrName || '--' }}
                            </span>
                          </div>
                        </template>
                        <span v-else class="text-dim">--</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="meta-group">
                        <div class="meta-item">
                          <span class="meta-badge type-badge">{{
                            formatOutputType(item.outputType)
                          }}</span>
                          <span class="meta-label">输出类型</span>
                        </div>
                        <div class="meta-divider"></div>
                        <div class="meta-item">
                          <span class="meta-badge rate-badge">{{
                            formatUpdateRate(item)
                          }}</span>
                          <span class="meta-label">更新频率</span>
                        </div>
                        <div class="meta-divider"></div>
                        <div class="meta-item">
                          <el-tag
                            :type="item.subjectState === 1 ? 'success' : 'info'"
                            size="mini"
                            class="state-badge"
                            effect="dark"
                          >
                            <i
                              :class="
                                item.subjectState === 1
                                  ? 'el-icon-success'
                                  : 'el-icon-warning'
                              "
                            ></i>
                            {{ item.subjectState === 1 ? '已启用' : '未启用' }}
                          </el-tag>
                          <!-- <span class="meta-label">状态</span> -->
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer-row">
                    <div
                      v-if="
                        item.subjectState === 1 ||
                        item.loginUserSubscribeState === 2
                      "
                      class="card-footer-right"
                    >
                      <el-button
                        size="mini"
                        type="primary"
                        plain
                        icon="el-icon-download"
                        @click="outputSubject(item)"
                        >输出</el-button
                      >
                    </div>
                  </div>
                  <div class="card-subscribe-row">
                    <div class="card-footer-left" v-if="isOwner(item)">
                      <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-edit"
                        @click="openSubjectDialog(true, item)"
                        >编辑</el-button
                      >
                      <el-button
                        size="mini"
                        type="text"
                        class="text-red"
                        icon="el-icon-delete"
                        @click="deleteSubject(item)"
                        >删除</el-button
                      >
                    </div>
                    <span
                      v-if="item.loginUserSubscribeState === 1"
                      class="status-txt text-orange"
                      >审核中</span
                    >
                    <span
                      v-else-if="item.loginUserSubscribeState === 2"
                      class="status-txt text-green"
                      >已订阅</span
                    >
                    <el-button
                      v-else
                      size="mini"
                      type="success"
                      plain
                      icon="el-icon-star-off"
                      @click="openQuickSubscribe(item)"
                      >订阅</el-button
                    >
                  </div>
                </el-card>
              </div>
            </div>
          </div>

          <el-pagination
            class="pager"
            small
            layout="total, prev, pager, next"
            :current-page.sync="subjectPageAll.pageNum"
            :page-size="subjectPageAll.pageSize"
            :total="subjectTotal"
            @current-change="() => fetchSubjects(0)"
          />
        </el-tab-pane>

        <el-tab-pane label="我的主题" name="subjectOwn">
          <div class="toolbar">
            <el-form :inline="true" :model="subjectQueryOwn" size="mini">
              <el-form-item label="主题">
                <el-input
                  v-model="subjectQueryOwn.keyword"
                  clearable
                  placeholder="主题关键词"
                />
              </el-form-item>
              <el-form-item label="分类">
                <el-input
                  v-model="subjectQueryOwn.className"
                  clearable
                  placeholder="分类名称"
                />
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="fetchSubjects(2)"
                  >查询</el-button
                >
                <el-button icon="el-icon-refresh" @click="resetSubjectQuery(2)"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>

          <div v-loading="loadingSubject" class="card-container">
            <div class="card-grid">
              <div v-for="item in subjectOwnList" :key="item.subjectId">
                <el-card
                  shadow="hover"
                  :body-style="{padding: '14px'}"
                  class="subject-card own-card"
                >
                  <div class="card-title-row">
                    <span class="card-title-text">{{ item.keyword }}</span>
                    <el-tag size="mini" type="success">我的</el-tag>
                  </div>
                  <div class="card-body-content">
                    <div class="info-row info-h">
                      <span class="info-label">模型关联</span>
                      <div class="model-pair-group">
                        <template v-if="getModelAttrList(item).length > 0">
                          <div
                            v-for="(pair, idx) in getModelAttrList(item)"
                            :key="idx"
                            class="model-pair-item"
                          >
                            <span class="pair-model">
                              {{ pair.modelName }}
                              <span class="pair-roleid" v-if="pair.modelId">
                                ({{ pair.modelId }})
                              </span>
                            </span>
                            <span class="pair-attr">
                              <i class="el-icon-right"></i>
                              {{ pair.attrName || '--' }}
                            </span>
                          </div>
                        </template>
                        <span v-else class="text-dim">--</span>
                      </div>
                    </div>
                    <div class="info-row">
                      <div class="meta-group">
                        <div class="meta-item">
                          <span class="meta-badge type-badge">{{
                            formatOutputType(item.outputType)
                          }}</span>
                          <span class="meta-label">输出类型</span>
                        </div>
                        <div class="meta-divider"></div>
                        <div class="meta-item">
                          <span class="meta-badge rate-badge">{{
                            formatUpdateRate(item)
                          }}</span>
                          <span class="meta-label">更新频率</span>
                        </div>
                        <div class="meta-divider"></div>
                        <div class="meta-item">
                          <el-tag
                            :type="item.subjectState === 1 ? 'success' : 'info'"
                            size="mini"
                            class="state-badge"
                            effect="dark"
                          >
                            <i
                              :class="
                                item.subjectState === 1
                                  ? 'el-icon-success'
                                  : 'el-icon-warning'
                              "
                            ></i>
                            {{ item.subjectState === 1 ? '已启用' : '未启用' }}
                          </el-tag>
                          <!-- <span class="meta-label">状态</span> -->
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="card-footer-row">
                    <div class="card-footer-right">
                      <el-button
                        v-if="item.subjectState === 1 && isOwner(item)"
                        size="mini"
                        type="warning"
                        plain
                        icon="el-icon-video-pause"
                        @click="disableSubject(item)"
                        >停用</el-button
                      >
                      <el-button
                        v-else-if="item.subjectState !== 1 && isOwner(item)"
                        size="mini"
                        type="success"
                        plain
                        icon="el-icon-video-play"
                        @click="enableSubject(item)"
                        >启用</el-button
                      >
                      <el-button
                        v-if="item.subjectState === 1"
                        size="mini"
                        type="primary"
                        plain
                        icon="el-icon-download"
                        @click="outputSubject(item)"
                        >输出</el-button
                      >
                    </div>
                  </div>
                  <div class="card-subscribe-row">
                    <div class="card-footer-left" v-if="isOwner(item)">
                      <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-edit"
                        @click="openSubjectDialog(true, item)"
                        >编辑</el-button
                      >
                      <el-button
                        size="mini"
                        type="text"
                        class="text-red"
                        icon="el-icon-delete"
                        @click="deleteSubject(item)"
                        >删除</el-button
                      >
                    </div>
                    <span
                      v-if="item.loginUserSubscribeState === 1"
                      class="status-txt text-orange"
                      >审核中</span
                    >
                    <span
                      v-else-if="item.loginUserSubscribeState === 2"
                      class="status-txt text-green"
                      >已订阅</span
                    >
                    <el-button
                      v-else
                      size="mini"
                      type="success"
                      plain
                      icon="el-icon-star-off"
                      @click="openQuickSubscribe(item)"
                      >订阅</el-button
                    >
                  </div>
                </el-card>
              </div>
            </div>
          </div>

          <el-pagination
            class="pager"
            small
            layout="total, prev, pager, next"
            :current-page.sync="subjectPageOwn.pageNum"
            :page-size="subjectPageOwn.pageSize"
            :total="subjectOwnTotal"
            @current-change="() => fetchSubjects(2)"
          />
        </el-tab-pane>

        <el-tab-pane label="订阅审核" name="subscribe">
          <div class="toolbar">
            <el-form :inline="true" :model="subscribeQuery" size="mini">
              <el-form-item label="订阅人">
                <el-input
                  v-model="subscribeQuery.subscribeUserName"
                  clearable
                  placeholder="订阅用户姓名"
                />
              </el-form-item>
              <el-form-item label="主题">
                <el-input
                  v-model="subscribeQuery.keyword"
                  clearable
                  placeholder="主题关键词"
                />
              </el-form-item>
              <el-form-item label="状态">
                <el-select
                  v-model="subscribeQuery.subscribeState"
                  clearable
                  placeholder="全部"
                  style="width: 111px"
                >
                  <el-option label="待审核" :value="0" />
                  <el-option label="已拒绝" :value="1" />
                  <el-option label="已通过" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="fetchSubscribes"
                  >查询</el-button
                >
                <el-button icon="el-icon-refresh" @click="resetSubscribeQuery"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </div>

          <el-table
            :data="subscribeList"
            size="mini"
            stripe
            border
            v-loading="loadingSubscribe"
            header-row-class-name="custom-table-header"
          >
            <el-table-column
              prop="subscribeUserName"
              label="订阅用户姓名"
              min-width="120"
            />
            <el-table-column prop="keyword" label="主题" min-width="140" />

            <el-table-column
              prop="subscribeReason"
              label="订阅理由"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column
              prop="subscribeTime"
              label="申请时间"
              min-width="145"
            />
            <el-table-column prop="opUserName" label="处理人" min-width="110" />
            <el-table-column prop="subscribeState" label="订阅状态" width="100">
              <template slot-scope="scope">
                <el-tag
                  size="mini"
                  :type="stateTagType(scope.row.subscribeState)"
                >
                  {{ stateText(scope.row.subscribeState) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130" fixed="right">
              <template slot-scope="scope">
                <template v-if="scope.row.subscribeState === 1">
                  <el-button
                    size="mini"
                    type="text"
                    icon="el-icon-check"
                    @click="auditSubscribe(scope.row, true)"
                    >通过</el-button
                  >
                  <el-button
                    size="mini"
                    type="text"
                    class="text-red"
                    icon="el-icon-close"
                    @click="auditSubscribe(scope.row, false)"
                    >拒绝</el-button
                  >
                </template>
                <span v-else class="text-disabled">已处理</span>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            class="pager"
            small
            layout="total, prev, pager, next"
            :current-page.sync="subscribePage.pageNum"
            :page-size="subscribePage.pageSize"
            :total="subscribeTotal"
            @current-change="fetchSubscribes"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-dialog
      :title="isEditClass ? '编辑主题分类' : '新增主题分类'"
      :visible.sync="classDialogVisible"
      width="520px"
      append-to-body
    >
      <el-form
        ref="classForm"
        :model="classForm"
        :rules="classRules"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="上级分类">
          <el-cascader
            v-model="classForm.parentClassId"
            :options="classTree"
            :props="classCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="className">
          <el-input v-model="classForm.className" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="classForm.classMemo" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="classDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitClass"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :title="isEditSubject ? '编辑主题' : '新增主题'"
      :visible.sync="subjectDialogVisible"
      width="750px"
      append-to-body
    >
      <el-form
        ref="subjectForm"
        :model="subjectForm"
        :rules="subjectRules"
        label-width="100px"
        size="mini"
      >
        <el-form-item label="主题分类" prop="subjectClassId">
          <el-cascader
            v-model="subjectForm.subjectClassId"
            :options="classTree"
            :props="classCascaderProps"
            clearable
            filterable
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="主题" prop="keyword">
          <el-input
            v-model="subjectForm.keyword"
            placeholder="请输入主题关键字"
          />
        </el-form-item>

        <el-form-item label="属性关联配置">
          <div class="selector-control-bar">
            <el-cascader
              v-model="tempClassId"
              :options="labelClassTree"
              :props="labelClassProps"
              placeholder="1. 请选择标签分类"
              clearable
              filterable
              style="flex: 1"
              @change="handleLabelClassChange"
            />
            <el-select
              v-model="tempModelObj"
              value-key="labelModelId"
              placeholder="2. 请选择标签模型"
              clearable
              filterable
              style="flex: 1"
              :disabled="!tempClassId"
            >
              <el-option
                v-for="model in labelModelOptions"
                :key="model.labelModelId"
                :label="model.labelName"
                :value="model"
              />
            </el-select>
            <el-input
              v-model="tempAttrName"
              placeholder="3. 输出属性名"
              style="flex: 0.9"
            />
            <el-button
              type="primary"
              icon="el-icon-check"
              @click="addMappingToTable"
              >确认添加</el-button
            >
          </div>

          <div class="matrix-table-wrapper">
            <el-table
              :data="modelMappings"
              size="mini"
              border
              stripe
              header-row-class-name="custom-table-header"
            >
              <el-table-column
                type="index"
                label="序号"
                width="55"
                align="center"
              />
              <el-table-column
                prop="labelModelName"
                label="标签模型名称"
                min-width="180"
                show-overflow-tooltip
              />
              <el-table-column
                prop="labelModelId"
                label="模型标识"
                width="120"
                align="center"
              />
              <el-table-column
                prop="attrName"
                label="对应输出属性名称"
                min-width="160"
              />
              <el-table-column label="操作" width="65" align="center">
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    class="text-red"
                    icon="el-icon-delete"
                    @click="removeMappingRow(scope.$index)"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-if="mappingErrorText" class="el-form-item__error">
            {{ mappingErrorText }}
          </div>
        </el-form-item>

        <el-row :gutter="8">
          <el-col :span="8">
            <el-form-item label="输出类型">
              <el-select v-model="subjectForm.outputType" class="full-width">
                <el-option label="JSON" :value="0" />
                <el-option label="XML" :value="1" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="更新频率">
              <div class="rate-combined">
                <el-input-number
                  v-model="subjectForm.updateRate"
                  :min="0"
                  controls-position="right"
                  class="rate-input"
                />
                <el-select
                  v-model="subjectForm.updateRateType"
                  class="rate-type-select"
                >
                  <el-option label="月" :value="0" />
                  <el-option label="时" :value="1" />
                  <el-option label="分" :value="2" />
                </el-select>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="subjectDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitSubject"
          >保存</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      title="申请订阅主题"
      :visible.sync="quickSubscribeVisible"
      width="520px"
      append-to-body
    >
      <el-form
        ref="quickSubscribeForm"
        :model="quickSubscribeForm"
        :rules="quickSubscribeRules"
        label-width="111px"
        size="mini"
      >
        <el-form-item label="订阅标识">
          <el-input
            :value="quickSubscribeForm.subscribeId"
            disabled
            placeholder="系统将自动绑定该主题主键标识"
          />
        </el-form-item>
        <el-form-item label="主题名称">
          <el-input :value="quickSubscribeTargetKeyword" disabled />
        </el-form-item>
        <el-form-item label="订阅理由" prop="subscribeReason">
          <el-input
            v-model="quickSubscribeForm.subscribeReason"
            type="textarea"
            :rows="4"
            placeholder="请阐述需要申请此主题数据的核心理由"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="quickSubscribeVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitQuickSubscribe"
          >提交申请</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'

export default {
  name: 'SubscriptionDistribution',
  data() {
    return {
      activeTab: 'subjectAll',
      classTree: [],
      classTreeProps: {children: 'children', label: 'className'},
      classCascaderProps: {
        value: 'subjectClassId',
        label: 'className',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },

      // 标签树与选择器级联联动所需变量
      labelClassTree: [],
      labelClassProps: {
        value: 'labelClassId',
        label: 'className',
        children: 'children',
        emitPath: false,
        checkStrictly: true
      },
      labelModelOptions: [], // 联动模型存储池

      // 表单上方临时绑定变量
      tempClassId: null,
      tempModelObj: null, // 选中存储整个对象获取 id 和 name
      tempAttrName: '',

      // 核心表格数据矩阵结构
      modelMappings: [],
      mappingErrorText: '',

      activeClass: null,
      loadingClass: false,
      loadingSubject: false,
      loadingSubscribe: false,

      subjectQueryAll: {searchType: 0, className: '', keyword: ''},
      subjectQueryOwn: {searchType: 2, className: '', keyword: ''},
      subscribeQuery: {subscribeUserName: '', keyword: '', subscribeState: ''},

      subjectList: [],
      subjectOwnList: [],
      subscribeList: [],

      subjectTotal: 0,
      subjectOwnTotal: 0,
      subscribeTotal: 0,

      subjectPageAll: {pageNum: 1, pageSize: 8},
      subjectPageOwn: {pageNum: 1, pageSize: 8},
      subscribePage: {pageNum: 1, pageSize: 12},

      classDialogVisible: false,
      subjectDialogVisible: false,
      quickSubscribeVisible: false,
      isEditClass: false,
      isEditSubject: false,

      classForm: this.getEmptyClassForm(),
      subjectForm: this.getEmptySubjectForm(),

      quickSubscribeTargetKeyword: '',
      quickSubscribeForm: {
        subscribeId: null,
        subjectId: null,
        subscribeReason: ''
      },

      classRules: {
        className: [
          {required: true, message: '请输入分类名称', trigger: 'blur'}
        ]
      },
      subjectRules: {
        subjectClassId: [
          {required: true, message: '请选择主题分类', trigger: 'change'}
        ],
        keyword: [{required: true, message: '请输入主题', trigger: 'blur'}]
      },
      quickSubscribeRules: {
        subscribeReason: [
          {required: true, message: '请输入申请订阅理由', trigger: 'blur'}
        ]
      }
    }
  },
  computed: {
    // 获取当前登录用户信息
    currentUser() {
      return this.$store.getters.currentUser
    }
  },

  mounted() {
    this.fetchClassTree()
    this.fetchLabelClassTree() // 加载标签左侧级联树
    this.fetchSubjects(0)
    this.fetchSubjects(2)
    this.fetchSubscribes()
  },
  methods: {
    /**
     * 判断当前登录用户是否为数据创建者（只有创建者才能编辑/删除/启停）
     */
    isOwner(item) {
      if (!this.currentUser || !item) return false
      // 支持多种可能的字段名以适应不同后端设计
      const ownerId = item.opUserId || item.createBy || item.userId
      console.log(item, this.currentUser)
      return ownerId && Number(ownerId) === Number(this.currentUser.userId)
    },
    getEmptyClassForm() {
      return {
        subjectClassId: null,
        parentClassId: null,
        className: '',
        classMemo: ''
      }
    },
    getEmptySubjectForm() {
      return {
        subjectId: null,
        subjectClassId: null,
        keyword: '',
        labelModelIds: '',
        labelModelNames: '',
        selectAttrNames: '',
        outputType: 0,
        updateRateType: 1,
        updateRate: 0
      }
    },
    normalizeList(res) {
      if (!res || !res.data) return []
      return res.data.list || res.data || []
    },
    fetchClassTree() {
      this.loadingClass = true
      request({url: '/rest/subjectClass/findTree', method: 'get'})
        .then(res => {
          this.classTree = this.normalizeList(res)
        })
        .finally(() => {
          this.loadingClass = false
        })
    },
    // 初始化获取标签分类树
    fetchLabelClassTree() {
      request({url: '/rest/labelClass/findTree', method: 'get'}).then(res => {
        this.labelClassTree = this.normalizeList(res)
      })
    },
    // 核心联动：选择标签分类节点后，动态切换请求路径拉取下属模型
    handleLabelClassChange(classId) {
      this.labelModelOptions = []
      this.tempModelObj = null
      if (!classId) return

      // 替换为您指定的路径格式接口
      request({
        url: `/rest/labelModel/labelClass/${classId}`,
        method: 'get'
      }).then(res => {
        this.labelModelOptions = this.normalizeList(res)
      })
    },
    // 校验并确认添加映射到表格展示
    addMappingToTable() {
      this.mappingErrorText = ''
      if (!this.tempModelObj) {
        this.mappingErrorText = '配置错误：请必须关联选择一个具体的标签模型'
        return
      }
      if (!this.tempAttrName || !this.tempAttrName.trim()) {
        this.mappingErrorText = '配置错误：请填写与此标签模型匹配的输出属性名称'
        return
      }

      // 检验是否已添加过同样关联
      if (
        this.modelMappings.some(
          m => m.labelModelId === this.tempModelObj.labelModelId
        )
      ) {
        this.$message.warning('该模型已存在于映射列表中，请勿重复添加')
        return
      }

      // 组装并追加数据到表格
      this.modelMappings.push({
        labelModelId: this.tempModelObj.labelModelId,
        labelModelName: this.tempModelObj.labelName,
        attrName: this.tempAttrName.trim()
      })

      // 重置清空添加控制区
      this.tempClassId = null
      this.tempModelObj = null
      this.tempAttrName = ''
    },
    removeMappingRow(index) {
      this.modelMappings.splice(index, 1)
    },
    fetchSubjects(type) {
      this.loadingSubject = true
      const isOwn = type === 2
      const query = isOwn ? this.subjectQueryOwn : this.subjectQueryAll
      const page = isOwn ? this.subjectPageAll : this.subjectPageAll
      apiPage('subjectInfo', {
        pageNum: page.pageNum,
        pageSize: page.pageSize,
        params: {...query}
      })
        .then(res => {
          if (isOwn) {
            this.subjectOwnList = this.normalizeList(res)
            this.subjectOwnTotal =
              (res.data && res.data.total) || this.subjectOwnList.length
          } else {
            this.subjectList = this.normalizeList(res)
            this.subjectTotal =
              (res.data && res.data.total) || this.subjectList.length
          }
        })
        .finally(() => {
          this.loadingSubject = false
        })
    },
    fetchSubscribes() {
      this.loadingSubscribe = true
      const params = {...this.subscribeQuery}
      if (params.subscribeState === '') delete params.subscribeState
      apiPage('subscribeInfo', {
        pageNum: this.subscribePage.pageNum,
        pageSize: this.subscribePage.pageSize,
        params
      })
        .then(res => {
          this.subscribeList = this.normalizeList(res)
          this.subscribeTotal =
            (res.data && res.data.total) || this.subscribeList.length
        })
        .finally(() => {
          this.loadingSubscribe = false
        })
    },
    handleTabClick(tab) {
      if (tab.name === 'subjectAll') this.fetchSubjects(0)
      if (tab.name === 'subjectOwn') this.fetchSubjects(2)
      if (tab.name === 'subscribe') this.fetchSubscribes()
    },
    handleClassClick(data) {
      this.activeClass = data
      this.subjectQueryAll.className = data.className
      this.subjectQueryOwn.className = data.className
      this.subjectPageAll.pageNum = 1
      this.subjectPageOwn.pageNum = 1
      if (this.activeTab === 'subjectOwn') {
        this.fetchSubjects(2)
      } else {
        this.activeTab = 'subjectAll'
        this.fetchSubjects(0)
      }
    },
    resetSubjectQuery(type) {
      if (type === 2) {
        this.subjectQueryOwn = {searchType: 2, className: '', keyword: ''}
        this.subjectPageOwn.pageNum = 1
        this.fetchSubjects(2)
      } else {
        this.subjectQueryAll = {searchType: 0, className: '', keyword: ''}
        this.subjectPageAll.pageNum = 1
        this.fetchSubjects(0)
      }
    },
    resetSubscribeQuery() {
      this.subscribeQuery = {
        subscribeUserName: '',
        keyword: '',
        subscribeState: ''
      }
      this.subscribePage.pageNum = 1
      this.fetchSubscribes()
    },
    openQuickSubscribe(row) {
      this.quickSubscribeTargetKeyword = row.keyword
      this.quickSubscribeForm = {
        subscribeId: row.subjectId,
        subjectId: row.subjectId,
        subscribeReason: ''
      }
      this.quickSubscribeVisible = true
      this.$nextTick(
        () =>
          this.$refs.quickSubscribeForm &&
          this.$refs.quickSubscribeForm.clearValidate()
      )
    },
    submitQuickSubscribe() {
      this.$refs.quickSubscribeForm.validate(valid => {
        if (!valid) return
        apiAdd('subscribeInfo', this.quickSubscribeForm).then(() => {
          this.$message.success('订阅申请已提交')
          this.quickSubscribeVisible = false
          this.fetchSubjects(0)
          this.fetchSubscribes()
        })
      })
    },
    openClassDialog(isEdit, row) {
      this.isEditClass = isEdit
      this.classForm =
        isEdit && row
          ? {...row}
          : {
              ...this.getEmptyClassForm(),
              parentClassId: this.activeClass && this.activeClass.subjectClassId
            }
      this.classDialogVisible = true
      this.$nextTick(
        () => this.$refs.classForm && this.$refs.classForm.clearValidate()
      )
    },
    submitClass() {
      this.$refs.classForm.validate(valid => {
        if (!valid) return
        const action = this.isEditClass
          ? apiUpdate('subjectClass', this.classForm)
          : apiAdd('subjectClass', this.classForm)
        action.then(() => {
          this.$message.success('主题分类已保存')
          this.classDialogVisible = false
          this.fetchClassTree()
        })
      })
    },
    deleteClass(row) {
      this.$confirm(`确定删除主题分类 [${row.className}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('subjectClass', row.subjectClassId).then(() => {
          this.$message.success('删除成功')
          this.fetchClassTree()
        })
      })
    },
    // 弹窗编辑打开机制：精准解析字符串并在表格中回显 Name 数据
    openSubjectDialog(isEdit, row) {
      this.isEditSubject = isEdit
      this.mappingErrorText = ''
      this.tempClassId = null
      this.tempModelObj = null
      this.tempAttrName = ''

      if (isEdit && row) {
        this.subjectForm = {...row}

        // 分解后端组合串
        const ids = row.labelModelIds
          ? String(row.labelModelIds).split(',')
          : []
        const names = row.labelModelNames
          ? String(row.labelModelNames).split(',')
          : []
        const attrs = row.selectAttrNames
          ? String(row.selectAttrNames).split(',')
          : []
        const maxLen = Math.max(ids.length, names.length, attrs.length)

        this.modelMappings = []
        for (let i = 0; i < maxLen; i++) {
          if (ids[i] || names[i] || attrs[i]) {
            this.modelMappings.push({
              labelModelId: ids[i] ? Number(ids[i]) : '',
              labelModelName: names[i] || `模型ID[${ids[i]}]`,
              attrName: attrs[i] || ''
            })
          }
        }
      } else {
        this.subjectForm = {
          ...this.getEmptySubjectForm(),
          subjectClassId: this.activeClass && this.activeClass.subjectClassId
        }
        this.modelMappings = []
      }
      this.subjectDialogVisible = true
      this.$nextTick(
        () => this.$refs.subjectForm && this.$refs.subjectForm.clearValidate()
      )
    },
    // 提报聚合转换保存层
    submitSubject() {
      this.$refs.subjectForm.validate(valid => {
        if (!valid) return
        if (this.modelMappings.length === 0) {
          this.mappingErrorText =
            '保存核心错误：必须点击确认追加至少包含一组“模型属性配置”关系'
          return
        }

        // 拼接成逗号分割的格式上传
        this.subjectForm.labelModelIds = this.modelMappings
          .map(m => m.labelModelId)
          .join(',')
        this.subjectForm.labelModelNames = this.modelMappings
          .map(m => m.labelModelName)
          .join(',')
        this.subjectForm.selectAttrNames = this.modelMappings
          .map(m => m.attrName)
          .join(',')

        const action = this.isEditSubject
          ? apiUpdate('subjectInfo', this.subjectForm)
          : apiAdd('subjectInfo', this.subjectForm)
        action.then(() => {
          this.$message.success('主题信息配置成功')
          this.subjectDialogVisible = false
          this.fetchSubjects(0)
          this.fetchSubjects(2)
          this.fetchSubscribes()
        })
      })
    },
    deleteSubject(row) {
      this.$confirm(`确定删除主题 [${row.keyword}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        apiDelete('subjectInfo', row.subjectId).then(() => {
          this.$message.success('删除成功')
          this.fetchSubjects(0)
          this.fetchSubjects(2)
        })
      })
    },
    enableSubject(row) {
      this.$confirm(`确定启用主题 [${row.keyword}] 吗？`, '提示', {
        type: 'info'
      }).then(() => {
        request({
          url: `/rest/subjectInfo/enable/${row.subjectId}`,
          method: 'post'
        }).then(() => {
          this.$message.success('主题已启用')
          this.fetchSubjects(0)
          this.fetchSubjects(2)
        })
      })
    },
    disableSubject(row) {
      this.$confirm(`确定停用主题 [${row.keyword}] 吗？`, '提示', {
        type: 'warning'
      }).then(() => {
        request({
          url: `/rest/subjectInfo/disable/${row.subjectId}`,
          method: 'post'
        }).then(() => {
          this.$message.success('主题已停用')
          this.fetchSubjects(0)
          this.fetchSubjects(2)
        })
      })
    },
    outputSubject(row) {
      const baseUrl = process.env.VUE_APP_BASE_API || location.origin
      const outputUrl = `${baseUrl}/rest/subjectInfo/output/${row.subjectId}`
      window.open(outputUrl, '_blank')
    },
    auditSubscribe(row, accept) {
      const url = accept
        ? `/rest/subscribeInfo/accept/${row.subscribeId}`
        : `/rest/subscribeInfo/refuse/${row.subscribeId}`
      request({url, method: 'post'}).then(() => {
        this.$message.success(accept ? '已通过数据订阅' : '已拒绝订阅申请')
        this.fetchSubscribes()
        this.fetchSubjects(0)
      })
    },
    /**
     * 格式化更新频率：将 updateRate 和 updateRateType 合并展示
     * updateRateType: 0=月, 1=时, 2=分
     */
    formatUpdateRate(item) {
      if (!item && item.updateRate === null && item.updateRate === undefined)
        return '--'
      const typeMap = {0: '月', 1: '时', 2: '分'}
      const typeLabel = typeMap[item.updateRateType] || ''
      return item.updateRate + typeLabel
    },
    /**
     * 将逗号分隔的字符串拆分为数组，用于 v-for 渲染标签
     */
    splitNames(str) {
      if (!str) return []
      return String(str)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    },
    /**
     * 将标签模型与输出属性合并为一一对应的配对列表
     * 每条记录包含：modelId(roleId), modelName, attrName
     */
    getModelAttrList(item) {
      if (!item) return []
      const ids = item.labelModelIds
        ? String(item.labelModelIds)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : []
      const names = item.labelModelNames
        ? String(item.labelModelNames)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : []
      const attrs = item.selectAttrNames
        ? String(item.selectAttrNames)
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : []
      const maxLen = Math.max(ids.length, names.length, attrs.length)
      const result = []
      for (let i = 0; i < maxLen; i++) {
        result.push({
          modelId: ids[i] || '',
          modelName: names[i] || '',
          attrName: attrs[i] || ''
        })
      }
      return result
    },
    formatOutputType(val) {
      return Number(val) === 1 ? 'XML' : 'JSON'
    },
    stateText(val) {
      const map = {0: '待审核', 1: '已拒绝', 2: '已通过'}
      return map[val] || '未知'
    },
    stateTagType(val) {
      const map = {0: 'warning', 1: 'danger', 2: 'success'}
      return map[val] || 'info'
    }
  }
}
</script>

<style scoped>
.resource-page {
  height: 100%;
  min-height: 0;
  padding: 12px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 12px;
  background: #03060c;
  color: #cbd5e1;
}

.resource-aside,
.resource-main {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  min-height: 0;
}
.resource-aside {
  display: flex;
  flex-direction: column;
  padding: 12px;
}
.resource-main {
  padding: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-title-row,
.toolbar,
.hero-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.panel-title-row {
  margin-bottom: 12px;
}
.panel-title-row h3 {
  color: #fff;
  font-size: 14px;
  margin: 0;
}
.tree-box {
  flex: 1;
  overflow: auto;
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

.hero-strip {
  background: #0c1424;
  border: 1px solid #16243a;
  border-radius: 4px;
  padding: 14px 16px;
  margin-bottom: 11px;
}
.hero-strip h2 {
  font-size: 18px;
  color: #38bdf8;
  margin: 0;
}
.hero-strip p {
  color: #94a3b8;
  font-size: 12px;
  margin: 4px 0 0 0;
}
.metric-group {
  display: flex;
  gap: 8px;
}
.metric-card {
  min-width: 82px;
  border: 1px solid #172438;
  background: #0d1522;
  border-radius: 4px;
  padding: 6px 12px;
  text-align: center;
}
.metric-card strong {
  display: block;
  font-size: 18px;
  color: #10b981;
}
.metric-card.warn strong {
  color: #f59e0b;
}
.metric-card span {
  font-size: 11px;
  color: #94a3b8;
}
.toolbar {
  margin-bottom: 11px;
}
.card-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2px 4px;
}

/* 🛠️ 修复卡片高度不一致：使用 CSS Grid 布局替代 el-row/el-col */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.card-grid > div {
  display: flex;
}
.subject-card {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.subject-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(56, 189, 248, 0.08);
  padding-bottom: 8px;
  margin-bottom: 8px;
}
.card-title-text {
  font-weight: 600;
  font-size: 13px;
  color: #e2e8f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.3px;
}
.card-body-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #94a3b8;
}

/* 信息行 — 优化为紧凑且视觉清晰的布局 */
.info-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 3px;
  transition: background 0.2s;
}
.info-row:hover {
  background: rgba(56, 189, 248, 0.04);
}
.info-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 600;
  letter-spacing: 0.5px;
  white-space: nowrap;
  min-width: 52px;
  padding-top: 2px;
  flex-shrink: 0;
  position: relative;
}
.info-label::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 4px;
  bottom: 4px;
  width: 1px;
  background: #1e2a3a;
}
.info-value {
  color: #cbd5e1;
  font-size: 12px;
  display: inline;
  line-height: 1.6;
  word-break: break-word;
  cursor: default;
  padding-left: 4px;
}

/* 模型与属性合并配对展示组 */
.model-pair-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}
.model-pair-item {
  display: flex;
  /* flex-direction: column; */
  gap: 1px;
  background: rgba(56, 189, 248, 0.04);
  border: 1px solid rgba(56, 189, 248, 0.08);
  border-radius: 3px;
  padding: 4px 8px;
  transition: all 0.2s;
}
.model-pair-item:hover {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.18);
}
.pair-model {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  line-height: 1.5;
}
.pair-roleid {
  font-size: 11px;
  font-weight: 400;
  color: #94a3b8;
  font-family: 'SF Mono', 'Fira Code', monospace;
  margin-left: 2px;
}
.pair-attr {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.5;
  padding-left: 4px;
}
.pair-attr .el-icon-right {
  font-size: 11px;
  color: #4b5563;
  margin-right: 2px;
}
.text-dim {
  color: #94a3b8;
  font-style: italic;
  font-size: 12px;
}

/* 底部三列元信息组 — 增强视觉层次 */
.meta-group {
  display: flex;
  align-items: center;
  /* background: linear-gradient(135deg, #0a111f 0%, #0d1728 100%); */
  border: 1px solid #16243a;
  border-radius: 4px;
  padding: 5px 6px;
  margin-top: 2px;
  width: 100%;
}
.meta-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 0;
  padding: 2px 0;
}
.meta-badge {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.04);
}
.type-badge {
  color: #f59e0b;
}

.rate-badge {
  color: #38bdf8;
  font-family: 'SF Mono', 'Fira Code', monospace;
}
.state-badge {
  font-size: 11px !important;
  border: none !important;
}
.state-badge i {
  margin-right: 2px;
}
.meta-label {
  font-size: 11px;
  color: #4b5563;
  white-space: nowrap;
  letter-spacing: 0.3px;
}
.meta-divider {
  width: 1px;
  height: 26px;
  background: linear-gradient(to bottom, transparent, #1e2a3a, transparent);
  flex-shrink: 0;
  margin: 0 4px;
}
.card-footer-row {
  border-top: 1px solid rgba(56, 189, 248, 0.06);
  padding-top: 8px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.card-footer-left {
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-footer-right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.card-subscribe-row {
  border-top: 1px solid rgba(56, 189, 248, 0.06);
  padding-top: 6px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.status-txt {
  font-size: 12px;
  font-weight: bold;
}
.own-card {
  border-left: 3px solid #10b981;
}
.text-disabled {
  color: #5c6b73;
  font-size: 12px;
}
.info-h {
  height: 120px;
  overflow: auto;
}
/* 🌟 控制添加区域容器条样式 */
.selector-control-bar {
  display: flex;
  align-items: center;
  gap: 11px;
  background: #111c2e;
  padding: 8px 12px;
  border: 1px solid #1c2e4a;
  border-radius: 4px 4px 0 0;
}

/* 🌟 核心：高阶可视化表格框、控制 35vh 滚动 */
.matrix-table-wrapper {
  max-height: 35vh;
  overflow-y: auto;
  border-left: 1px solid #1c2e4a;
  border-right: 1px solid #1c2e4a;
  border-bottom: 1px solid #1c2e4a;
  background: #090f19;
}

.pager {
  margin-top: 11px;
  text-align: right;
}
.full-width {
  width: 100%;
}

/* 更新频率组合控件 */
.rate-combined {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rate-input {
  flex: none;
  width: 111px;
}
.rate-input .el-input-number__decrease,
.rate-input .el-input-number__increase {
  background: transparent;
}
.rate-type-select {
  width: 90px;
  flex-shrink: 0;
}
.text-blue {
  color: #38bdf8;
}
.text-green {
  color: #67c23a;
}
.text-orange {
  color: #e6a23c;
}
.text-red {
  color: #f56c6c;
}
</style>
