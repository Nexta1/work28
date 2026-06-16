<template>
  <div class="screen-container">
    <div class="tab-header-wrapper">
      <el-tabs v-model="activeTab" class="fill-tabs dark-tabs tab-workbench">
        <el-tab-pane label="编识号段预分配" name="bshSegment">
          <div class="tab-pane-body" v-loading="loading.bsh">
            <div class="panel-header-summary">
              <span class="title text-cyan">编识号段预分配</span>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="openBshDialog(false)"
              >
                新增号段
              </el-button>
            </div>
            <div class="filter-action-row">
              <el-select
                v-model="bshQuery.bshType"
                size="mini"
                clearable
                placeholder="编识号类型"
                class="filter-item"
              >
                <el-option
                  v-for="item in bshTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-model="bshQuery.SSZQNM"
                size="mini"
                clearable
                placeholder="所属战区"
                class="filter-item"
              >
                <el-option
                  v-for="item in theaterOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-model="bshQuery.SSJZNM"
                size="mini"
                clearable
                placeholder="所属军种"
                class="filter-item"
              >
                <el-option
                  v-for="item in armyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>

              <el-button
                type="primary"
                size="mini"
                icon="el-icon-search"
                @click="searchBsh"
                >查询</el-button
              >
            </div>
            <div class="table-container-flex">
              <el-table
                :data="bshList"
                size="mini"
                height="100%"
                class="dark-dashboard-table"
                stripe
                border
              >
                <el-table-column prop="bshSegmentId" label="标识" width="80" />
                <el-table-column prop="SSZQMC" label="战区" width="110" />
                <el-table-column prop="SSJZMC" label="军种" width="110" />
                <el-table-column
                  prop="bshType"
                  label="类型"
                  width="110"
                  :formatter="(_, __, v) => mapLabel(bshTypeOptions, v)"
                />
                <el-table-column
                  prop="startBsh"
                  label="起始号"
                  width="100"
                  class-name="font-num"
                />
                <el-table-column
                  prop="endBsh"
                  label="终止号"
                  width="100"
                  class-name="font-num"
                />
                <el-table-column
                  prop="affiliatedScenario"
                  label="作战场景"
                  min-width="120"
                />
                <el-table-column
                  prop="opTime"
                  label="操作时间"
                  min-width="150"
                />
                <el-table-column
                  label="操作"
                  width="180"
                  fixed="right"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-edit"
                      @click="openBshDialog(true, scope.row)"
                      >修改</el-button
                    >
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      class="text-red"
                      @click="deleteBsh(scope.row)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="pagination-row">
              <el-pagination
                small
                layout="total, prev, pager, next"
                :current-page.sync="bshPage.pageNum"
                :page-size="bshPage.pageSize"
                :total="bshTotal"
                @current-change="fetchBsh"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="平台编识号分配" name="ptBshSegment">
          <div class="tab-pane-body" v-loading="loading.ptBsh">
            <div class="panel-header-summary">
              <span class="title text-cyan">平台分配编识号段</span>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="openPtBshDialog(false)"
              >
                新增分配
              </el-button>
            </div>
            <div class="filter-action-row">
              <el-select
                v-model="ptBshQuery.bshType"
                size="mini"
                clearable
                placeholder="编识号类型"
                class="filter-item"
              >
                <el-option
                  v-for="item in bshTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-model="ptBshQuery.SSZQNM"
                size="mini"
                clearable
                placeholder="所属战区"
                class="filter-item"
              >
                <el-option
                  v-for="item in theaterOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-model="ptBshQuery.SSJZNM"
                size="mini"
                clearable
                placeholder="所属军种"
                class="filter-item"
              >
                <el-option
                  v-for="item in armyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-search"
                @click="searchPtBsh"
                >查询</el-button
              >
            </div>
            <div class="table-container-flex">
              <el-table
                :data="ptBshList"
                size="mini"
                height="100%"
                class="dark-dashboard-table"
                stripe
                border
              >
                <el-table-column prop="PTMC" label="平台名称" min-width="120" />
                <el-table-column prop="SSZQMC" label="战区" width="100" />
                <el-table-column prop="SSJZMC" label="军种" width="100" />
                <el-table-column
                  prop="bshType"
                  label="类型"
                  width="100"
                  :formatter="(_, __, v) => mapLabel(bshTypeOptions, v)"
                />
                <el-table-column
                  prop="startBsh"
                  label="起始号"
                  width="100"
                  class-name="font-num"
                />
                <el-table-column
                  prop="endBsh"
                  label="终止号"
                  width="100"
                  class-name="font-num"
                />
                <el-table-column
                  prop="opTime"
                  label="操作时间"
                  min-width="150"
                />
                <el-table-column
                  label="操作"
                  width="140"
                  fixed="right"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-edit"
                      @click="openPtBshDialog(true, scope.row)"
                      >修改</el-button
                    >
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      class="text-red"
                      @click="deletePtBsh(scope.row)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="pagination-row">
              <el-pagination
                small
                layout="total, prev, pager, next"
                :current-page.sync="ptBshPage.pageNum"
                :page-size="ptBshPage.pageSize"
                :total="ptBshTotal"
                @current-change="fetchPtBsh"
              />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="分配编识号" name="ptBshAllocate">
          <div class="tab-pane-body" v-loading="loading.allocate">
            <div class="panel-header-summary">
              <span class="title text-cyan">编识号业务分配</span>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-plus"
                @click="openAllocateDialog(false)"
              >
                新增分配
              </el-button>
            </div>
            <div class="filter-action-row">
              <el-select
                v-model="allocateQuery.bshType"
                size="mini"
                clearable
                placeholder="编识号类型"
                class="filter-item"
              >
                <el-option
                  v-for="item in bshTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-model="allocateQuery.SSZQNM"
                size="mini"
                clearable
                placeholder="所属战区"
                class="filter-item"
              >
                <el-option
                  v-for="item in theaterOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-select
                v-model="allocateQuery.SSJZNM"
                size="mini"
                clearable
                placeholder="所属军种"
                class="filter-item"
              >
                <el-option
                  v-for="item in armyOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <el-button
                type="primary"
                size="mini"
                icon="el-icon-search"
                @click="searchAllocate"
                >查询</el-button
              >
            </div>
            <div class="table-container-flex">
              <el-table
                :data="allocateList"
                size="mini"
                height="100%"
                class="dark-dashboard-table"
                stripe
                border
              >
                <el-table-column
                  prop="allocatedPTMC"
                  label="被分配平台"
                  min-width="120"
                />
                <el-table-column
                  prop="allocatedSSZQMC"
                  label="战区"
                  width="100"
                />
                <el-table-column
                  prop="allocatedSSJZMC"
                  label="军种"
                  width="100"
                />
                <el-table-column
                  prop="bshType"
                  label="类型"
                  width="100"
                  :formatter="(_, __, v) => mapLabel(bshTypeOptions, v)"
                />
                <el-table-column
                  prop="startBsh"
                  label="起始号"
                  width="100"
                  class-name="font-num"
                />
                <el-table-column
                  prop="endBsh"
                  label="终止号"
                  width="100"
                  class-name="font-num"
                />
                <el-table-column
                  prop="opTime"
                  label="操作时间"
                  min-width="150"
                />
                <el-table-column
                  label="操作"
                  width="140"
                  fixed="right"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-edit"
                      @click="openAllocateDialog(true, scope.row)"
                      >修改</el-button
                    >
                    <el-button
                      type="text"
                      size="mini"
                      icon="el-icon-delete"
                      class="text-red"
                      @click="deleteAllocate(scope.row)"
                      >删除</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="pagination-row">
              <el-pagination
                small
                layout="total, prev, pager, next"
                :current-page.sync="allocatePage.pageNum"
                :page-size="allocatePage.pageSize"
                :total="allocateTotal"
                @current-change="fetchAllocate"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 编识号段 -->
      <el-dialog
        :title="bshEdit ? '修改编识号段' : '新增编识号段'"
        :visible.sync="bshDialogVisible"
        width="520px"
        append-to-body
      >
        <el-form
          ref="bshFormRef"
          :model="bshForm"
          :rules="bshRules"
          label-width="111px"
          size="mini"
        >
          <el-form-item label="所属战区" prop="SSZQNM">
            <el-select v-model="bshForm.SSZQNM" class="full-width">
              <el-option
                v-for="item in theaterOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属军种" prop="SSJZNM">
            <el-select v-model="bshForm.SSJZNM" class="full-width">
              <el-option
                v-for="item in armyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="编识号类型" prop="bshType">
            <el-select v-model="bshForm.bshType" class="full-width">
              <el-option
                v-for="item in bshTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="起始编识号" prop="startBsh">
            <el-input-number
              v-model="bshForm.startBsh"
              :min="0"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="终止编识号" prop="endBsh">
            <el-input-number
              v-model="bshForm.endBsh"
              :min="0"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="作战场景">
            <el-input v-model="bshForm.affiliatedScenario" />
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button size="mini" @click="bshDialogVisible = false"
            >取消</el-button
          >
          <el-button size="mini" type="primary" @click="submitBsh"
            >保存</el-button
          >
        </span>
      </el-dialog>

      <!-- 平台编识号分配 -->
      <el-dialog
        :title="ptBshEdit ? '修改平台号段分配' : '新增平台号段分配'"
        :visible.sync="ptBshDialogVisible"
        width="520px"
        append-to-body
      >
        <el-form
          ref="ptBshFormRef"
          :model="ptBshForm"
          :rules="ptBshRules"
          label-width="120px"
          size="mini"
        >
          <el-form-item label="平台信息" prop="PTXXID">
            <el-select v-model="ptBshForm.PTXXID" filterable class="full-width">
              <el-option
                v-for="item in ptxxOptions"
                :key="item.PTXXID || item.ptxxid"
                :label="item.PTMC || item.ptmc"
                :value="pickRowId(item, ['PTXXID', 'ptxxid'])"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="预分配号段" prop="bshSegmentId">
            <el-select
              v-model="ptBshForm.bshSegmentId"
              filterable
              class="full-width"
            >
              <el-option
                v-for="item in bshSegmentOptions"
                :key="item.bshSegmentId"
                :label="formatBshSegmentLabel(item)"
                :value="item.bshSegmentId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="起始编识号" prop="startBsh">
            <el-input-number
              v-model="ptBshForm.startBsh"
              :min="0"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="终止编识号" prop="endBsh">
            <el-input-number
              v-model="ptBshForm.endBsh"
              :min="0"
              class="full-width"
            />
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button size="mini" @click="ptBshDialogVisible = false"
            >取消</el-button
          >
          <el-button size="mini" type="primary" @click="submitPtBsh"
            >保存</el-button
          >
        </span>
      </el-dialog>

      <!-- 编识号业务分配 -->
      <el-dialog
        :title="allocateEdit ? '修改编识号分配' : '新增编识号分配'"
        :visible.sync="allocateDialogVisible"
        width="520px"
        append-to-body
      >
        <el-form
          ref="allocateFormRef"
          :model="allocateForm"
          :rules="allocateRules"
          label-width="130px"
          size="mini"
        >
          <el-form-item label="分配平台" prop="allocatedPTXXID">
            <el-select
              v-model="allocateForm.allocatedPTXXID"
              filterable
              class="full-width"
            >
              <el-option
                v-for="item in ptxxOptions"
                :key="'a-' + (item.PTXXID || item.ptxxid)"
                :label="item.PTMC || item.ptmc"
                :value="pickRowId(item, ['PTXXID', 'ptxxid'])"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="平台号段分配" prop="ptBSHSegmentId">
            <el-select
              v-model="allocateForm.ptBSHSegmentId"
              filterable
              class="full-width"
            >
              <el-option
                v-for="item in ptBshSegmentOptions"
                :key="item.ptBSHSegmentId"
                :label="formatPtBshLabel(item)"
                :value="item.ptBSHSegmentId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="起始编识号" prop="startBsh">
            <el-input-number
              v-model="allocateForm.startBsh"
              :min="0"
              class="full-width"
            />
          </el-form-item>
          <el-form-item label="终止编识号" prop="endBsh">
            <el-input-number
              v-model="allocateForm.endBsh"
              :min="0"
              class="full-width"
            />
          </el-form-item>
        </el-form>
        <span slot="footer">
          <el-button size="mini" @click="allocateDialogVisible = false"
            >取消</el-button
          >
          <el-button size="mini" type="primary" @click="submitAllocate"
            >保存</el-button
          >
        </span>
      </el-dialog>
      <el-popover
        placement="bottom-end"
        width="220"
        trigger="hover"
        popper-class="relation-popover"
      >
        <el-button
          slot="reference"
          type="text"
          size="mini"
          class="relation-trigger-btn"
          icon="el-icon-info"
        />
        <div class="relation-popover-body">
          <div class="relation-title">编识号分配流程</div>
          <div class="relation-list">
            <div
              class="relation-item"
              :class="{active: activeTab === 'bshSegment'}"
            >
              <span class="rel-num">①</span>
              <span class="rel-text"
                >编识号段预分配 — 定义号段范围（战区·军种·类型·起止号）</span
              >
            </div>
            <div class="rel-arrow">↓</div>
            <div
              class="relation-item"
              :class="{active: activeTab === 'ptBshSegment'}"
            >
              <span class="rel-num">②</span>
              <span class="rel-text"
                >平台编识号分配 — 预分配号段分配到平台</span
              >
            </div>
            <div class="rel-arrow">↓</div>
            <div
              class="relation-item"
              :class="{active: activeTab === 'ptBshAllocate'}"
            >
              <span class="rel-num">③</span>
              <span class="rel-text"
                >编识号业务分配 — 平台号段分配给具体业务</span
              >
            </div>
          </div>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'
import {apiAdd, apiDelete, apiPage, apiUpdate} from '@/api/common.js'
import {
  BSH_TYPE_OPTIONS,
  getBshSegmentArmyMap,
  getBshSegmentTheaterMap,
  getPtxhInfos,
  normalizeMapOptions
} from '@/api/resourceManagement.js'
import resourcePageMixin from '../mixins/resourcePageMixin'

export default {
  name: 'InformationResourceManagement',
  mixins: [resourcePageMixin],
  data() {
    return {
      activeTab: 'bshSegment',
      bshTypeOptions: BSH_TYPE_OPTIONS,
      theaterOptions: [],
      armyOptions: [],
      ptxhOptions: [],
      ptxxOptions: [],
      bshSegmentOptions: [],
      ptBshSegmentOptions: [],
      loading: {bsh: false, ptBsh: false, allocate: false},
      bshList: [],
      bshTotal: 0,
      bshPage: {pageNum: 1, pageSize: 30},
      bshQuery: {bshType: null, SSZQNM: null, SSJZNM: null},
      bshDialogVisible: false,
      bshEdit: false,
      bshForm: {
        bshSegmentId: null,
        SSZQNM: null,
        SSJZNM: null,
        bshType: 0,
        startBsh: null,
        endBsh: null,
        affiliatedScenario: '-'
      },
      bshRules: {
        SSZQNM: [{required: true, message: '请选择战区', trigger: 'change'}],
        SSJZNM: [{required: true, message: '请选择军种', trigger: 'change'}],
        startBsh: [{required: true, message: '请输入起始号', trigger: 'blur'}],
        endBsh: [{required: true, message: '请输入终止号', trigger: 'blur'}]
      },
      ptBshList: [],
      ptBshTotal: 0,
      ptBshPage: {pageNum: 1, pageSize: 30},
      ptBshQuery: {bshType: null, SSZQNM: null, SSJZNM: null},
      ptBshDialogVisible: false,
      ptBshEdit: false,
      ptBshForm: {
        ptBSHSegmentId: null,
        PTXXID: null,
        bshSegmentId: null,
        startBsh: null,
        endBsh: null
      },
      ptBshRules: {
        PTXXID: [{required: true, message: '请选择平台', trigger: 'change'}],
        bshSegmentId: [
          {required: true, message: '请选择号段', trigger: 'change'}
        ],
        startBsh: [
          {required: true, message: '请输入起始编识号', trigger: 'blur'},
          {validator: this.checkPtBshStartBsh, trigger: 'blur'}
        ],
        endBsh: [
          {required: true, message: '请输入终止编识号', trigger: 'blur'},
          {validator: this.checkPtBshEndBsh, trigger: 'blur'}
        ]
      },
      allocateList: [],
      allocateTotal: 0,
      allocatePage: {pageNum: 1, pageSize: 30},
      allocateQuery: {bshType: null, SSZQNM: null, SSJZNM: null},
      allocateDialogVisible: false,
      allocateEdit: false,
      allocateForm: {
        ptBSHAllocateId: null,
        allocatedPTXXID: null,
        ptBSHSegmentId: null,
        startBsh: null,
        endBsh: null
      },
      allocateRules: {
        allocatedPTXXID: [
          {required: true, message: '请选择平台', trigger: 'change'}
        ],
        ptBSHSegmentId: [
          {required: true, message: '请选择号段分配', trigger: 'change'}
        ],
        startBsh: [
          {required: true, message: '请输入起始编识号', trigger: 'blur'},
          {validator: this.checkAllocateStartBsh, trigger: 'blur'}
        ],
        endBsh: [
          {required: true, message: '请输入终止编识号', trigger: 'blur'},
          {validator: this.checkAllocateEndBsh, trigger: 'blur'}
        ]
      }
    }
  },
  mounted() {
    this.loadMaps()
    this.loadReferenceData()
    this.fetchBsh()
  },
  watch: {
    activeTab(val) {
      if (val === 'ptBshSegment' && !this.ptBshList.length) this.fetchPtBsh()
      if (val === 'ptBshAllocate' && !this.allocateList.length)
        this.fetchAllocate()
    }
  },
  methods: {
    formatBshSegmentLabel(item) {
      return `${item.SSZQMC || item.sszqmc || ''} ${item.SSJZMC || item.ssjzmc || ''} [${item.startBsh}-${item.endBsh}]`
    },
    formatPtBshLabel(item) {
      return `${item.PTMC || item.ptmc || ''} [${item.startBsh}-${item.endBsh}]`
    },

    // ---- 号段范围验证 ----

    getSelectedBshSegment() {
      return this.bshSegmentOptions.find(
        s => s.bshSegmentId === this.ptBshForm.bshSegmentId
      )
    },
    getSelectedPtBshSegment() {
      return this.ptBshSegmentOptions.find(
        s => s.ptBSHSegmentId === this.allocateForm.ptBSHSegmentId
      )
    },

    checkPtBshStartBsh(rule, value, callback) {
      const seg = this.getSelectedBshSegment()
      if (seg && value < Number(seg.startBsh)) {
        callback(new Error(`起始号不能小于号段起始值 ${seg.startBsh}`))
        return
      }
      if (
        this.ptBshForm.endBsh != null &&
        value > Number(this.ptBshForm.endBsh)
      ) {
        callback(new Error('起始号不能大于终止号'))
        return
      }
      callback()
    },
    checkPtBshEndBsh(rule, value, callback) {
      const seg = this.getSelectedBshSegment()
      if (seg && value > Number(seg.endBsh)) {
        callback(new Error(`终止号不能大于号段终止值 ${seg.endBsh}`))
        return
      }
      if (
        this.ptBshForm.startBsh != null &&
        value < Number(this.ptBshForm.startBsh)
      ) {
        callback(new Error('终止号不能小于起始号'))
        return
      }
      callback()
    },

    checkAllocateStartBsh(rule, value, callback) {
      const seg = this.getSelectedPtBshSegment()
      if (seg && value < Number(seg.startBsh)) {
        callback(new Error(`起始号不能小于号段起始值 ${seg.startBsh}`))
        return
      }
      if (
        this.allocateForm.endBsh != null &&
        value > Number(this.allocateForm.endBsh)
      ) {
        callback(new Error('起始号不能大于终止号'))
        return
      }
      callback()
    },
    checkAllocateEndBsh(rule, value, callback) {
      const seg = this.getSelectedPtBshSegment()
      if (seg && value > Number(seg.endBsh)) {
        callback(new Error(`终止号不能大于号段终止值 ${seg.endBsh}`))
        return
      }
      if (
        this.allocateForm.startBsh != null &&
        value < Number(this.allocateForm.startBsh)
      ) {
        callback(new Error('终止号不能小于起始号'))
        return
      }
      callback()
    },

    loadMaps() {
      this.promiseAllHandled(
        [getBshSegmentTheaterMap(), getBshSegmentArmyMap()],
        '战区/军种字典加载失败'
      )
        .then(([theaterRes, armyRes]) => {
          this.theaterOptions = normalizeMapOptions(theaterRes)
          this.armyOptions = normalizeMapOptions(armyRes)
        })
        .catch(() => {
          this.theaterOptions = []
          this.armyOptions = []
        })
    },
    loadReferenceData() {
      this.promiseAllHandled(
        [
          getPtxhInfos(),
          request({url: '/rest/ptxx/ptxxs', method: 'get'}),
          request({url: '/rest/bshSegment/bshSegments', method: 'get'}),
          request({url: '/rest/ptBSHSegment/ptBSHSegments', method: 'get'})
        ],
        '关联基础数据加载失败'
      )
        .then(([ptxhRes, ptxxRes, bshRes, ptBshRes]) => {
          this.ptxhOptions = this.normalizeList(ptxhRes)
          this.ptxxOptions = this.normalizeList(ptxxRes)
          this.bshSegmentOptions = this.normalizeList(bshRes)
          // 后端 findAll 未返回 PTMC，前端通过 ptxxOptions 手动补充
          const ptxxMap = {}
          this.normalizeList(ptxxRes).forEach(p => {
            const id = this.pickRowId(p, ['PTXXID', 'ptxxid'])
            ptxxMap[id] = p.PTMC || p.ptmc || ''
          })
          this.ptBshSegmentOptions = this.normalizeList(ptBshRes).map(item => {
            const id = this.pickRowId(item, ['PTXXID', 'ptxxid'])
            return {...item, PTMC: item.PTMC || ptxxMap[id] || ''}
          })
        })
        .catch(() => {
          this.ptxhOptions = []
          this.ptxxOptions = []
          this.bshSegmentOptions = []
          this.ptBshSegmentOptions = []
        })
    },
    fetchBsh() {
      this.loading.bsh = true
      const params = {}
      if (this.bshQuery.bshType != null) params.bshType = this.bshQuery.bshType
      if (this.bshQuery.SSZQNM != null) params.SSZQNM = this.bshQuery.SSZQNM
      if (this.bshQuery.SSJZNM != null) params.SSJZNM = this.bshQuery.SSJZNM

      apiPage('bshSegment', {
        pageNum: this.bshPage.pageNum,
        pageSize: this.bshPage.pageSize,
        params
      })
        .then(res => {
          this.bshList = this.normalizeList(res)
          this.bshTotal = (res.data && res.data.total) || this.bshList.length
        })
        .catch(() => {})
        .finally(() => {
          this.loading.bsh = false
        })
    },
    searchBsh() {
      this.bshPage.pageNum = 1
      this.fetchBsh()
    },
    openBshDialog(isEdit, row = null) {
      this.bshEdit = isEdit
      this.bshForm =
        isEdit && row
          ? {
              bshSegmentId: this.pickRowId(row, [
                'bshSegmentId',
                'BSHSEGMENTID'
              ]),
              SSZQNM: row.SSZQNM,
              SSJZNM: row.SSJZNM,
              bshType: row.bshType,
              startBsh: row.startBsh,
              endBsh: row.endBsh,
              affiliatedScenario: row.affiliatedScenario
            }
          : {
              bshSegmentId: null,
              SSZQNM: null,
              SSJZNM: null,
              bshType: 0,
              startBsh: null,
              endBsh: null,
              affiliatedScenario: '-'
            }
      this.bshDialogVisible = true
      this.$nextTick(
        () => this.$refs.bshFormRef && this.$refs.bshFormRef.clearValidate()
      )
    },
    submitBsh() {
      this.$refs.bshFormRef.validate(valid => {
        if (!valid) return
        const action = this.bshEdit
          ? apiUpdate('bshSegment', this.bshForm)
          : apiAdd('bshSegment', this.bshForm)
        action
          .then(() => {
            this.$message.success('编识号段已保存')
            this.bshDialogVisible = false
            this.fetchBsh()
            this.loadReferenceData()
          })
          .catch(() => {})
      })
    },
    deleteBsh(row) {
      const id = this.pickRowId(row, ['bshSegmentId'])
      this.$confirm('确定删除该编识号段吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('bshSegment', id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchBsh()
              this.loadReferenceData()
            })
            .catch(() => {})
        }
      )
    },

    fetchPtBsh() {
      this.loading.ptBsh = true
      const params = {}
      if (this.ptBshQuery.bshType != null)
        params.bshType = this.ptBshQuery.bshType
      if (this.ptBshQuery.SSZQNM != null) params.SSZQNM = this.ptBshQuery.SSZQNM
      if (this.ptBshQuery.SSJZNM != null) params.SSJZNM = this.ptBshQuery.SSJZNM
      apiPage('ptBSHSegment', {
        pageNum: this.ptBshPage.pageNum,
        pageSize: this.ptBshPage.pageSize,
        params
      })
        .then(res => {
          this.ptBshList = this.normalizeList(res)
          this.ptBshTotal =
            (res.data && res.data.total) || this.ptBshList.length
        })
        .catch(() => {})
        .finally(() => {
          this.loading.ptBsh = false
        })
    },
    searchPtBsh() {
      this.ptBshPage.pageNum = 1
      this.fetchPtBsh()
    },
    openPtBshDialog(isEdit, row = null) {
      this.ptBshEdit = isEdit
      this.ptBshForm =
        isEdit && row
          ? {
              ptBSHSegmentId: this.pickRowId(row, ['ptBSHSegmentId']),
              PTXXID: row.PTXXID,
              bshSegmentId: row.bshSegmentId,
              startBsh: row.startBsh,
              endBsh: row.endBsh
            }
          : {
              ptBSHSegmentId: null,
              PTXXID: null,
              bshSegmentId: null,
              startBsh: null,
              endBsh: null
            }
      this.ptBshDialogVisible = true
      this.$nextTick(
        () => this.$refs.ptBshFormRef && this.$refs.ptBshFormRef.clearValidate()
      )
    },
    submitPtBsh() {
      this.$refs.ptBshFormRef.validate(valid => {
        if (!valid) return
        const action = this.ptBshEdit
          ? apiUpdate('ptBSHSegment', this.ptBshForm)
          : apiAdd('ptBSHSegment', this.ptBshForm)
        action
          .then(() => {
            this.$message.success('平台号段分配已保存')
            this.ptBshDialogVisible = false
            this.fetchPtBsh()
            this.loadReferenceData()
          })
          .catch(() => {})
      })
    },
    deletePtBsh(row) {
      const id = this.pickRowId(row, ['ptBSHSegmentId', 'serviceId'])
      this.$confirm('确定删除该分配记录吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('ptBSHSegment', id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchPtBsh()
              this.loadReferenceData()
            })
            .catch(() => {})
        }
      )
    },
    fetchAllocate() {
      this.loading.allocate = true
      const params = {}
      if (this.allocateQuery.bshType != null)
        params.bshType = this.allocateQuery.bshType
      if (this.allocateQuery.SSZQNM != null)
        params.SSZQNM = this.allocateQuery.SSZQNM
      if (this.allocateQuery.SSJZNM != null)
        params.SSJZNM = this.allocateQuery.SSJZNM
      apiPage('ptBSHAllocate', {
        pageNum: this.allocatePage.pageNum,
        pageSize: this.allocatePage.pageSize,
        params
      })
        .then(res => {
          this.allocateList = this.normalizeList(res)
          this.allocateTotal =
            (res.data && res.data.total) || this.allocateList.length
        })
        .catch(() => {})
        .finally(() => {
          this.loading.allocate = false
        })
    },
    searchAllocate() {
      this.allocatePage.pageNum = 1
      this.fetchAllocate()
    },
    openAllocateDialog(isEdit, row = null) {
      this.allocateEdit = isEdit
      this.allocateForm =
        isEdit && row
          ? {
              ptBSHAllocateId: this.pickRowId(row, ['ptBSHAllocateId']),
              allocatedPTXXID: row.allocatedPTXXID,
              ptBSHSegmentId: row.ptBSHSegmentId,
              startBsh: row.startBsh,
              endBsh: row.endBsh
            }
          : {
              ptBSHAllocateId: null,
              allocatedPTXXID: null,
              ptBSHSegmentId: null,
              startBsh: null,
              endBsh: null
            }
      this.allocateDialogVisible = true
      this.$nextTick(
        () =>
          this.$refs.allocateFormRef &&
          this.$refs.allocateFormRef.clearValidate()
      )
    },
    submitAllocate() {
      this.$refs.allocateFormRef.validate(valid => {
        if (!valid) return
        const action = this.allocateEdit
          ? apiUpdate('ptBSHAllocate', this.allocateForm)
          : apiAdd('ptBSHAllocate', this.allocateForm)
        action
          .then(() => {
            this.$message.success('编识号分配已保存')
            this.allocateDialogVisible = false
            this.fetchAllocate()
          })
          .catch(() => {})
      })
    },
    deleteAllocate(row) {
      const id = this.pickRowId(row, ['ptBSHAllocateId'])
      this.$confirm('确定删除该编识号分配吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('ptBSHAllocate', id)
            .then(() => {
              this.$message.success('删除成功')
              this.fetchAllocate()
            })
            .catch(() => {})
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
@use '../styles/resource-screen.scss' as *;

.tab-header-wrapper {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.relation-trigger-btn {
  position: absolute;
  top: 2px;
  right: 4px;
  z-index: 10;
  font-size: 16px;
  color: #60a5fa;
  padding: 4px;
}

.relation-trigger-btn:hover {
  color: #38bdf8;
}

.filter-item {
  width: 150px;
}
.filter-item-num {
  width: 140px;
}
.full-width {
  width: 100%;
}
.text-red {
  color: #f56c6c !important;
}

::v-deep .tab-workbench.el-tabs {
  display: flex;
  flex-direction: column;
}

::v-deep .tab-workbench > .el-tabs__header {
  flex-shrink: 0;
  margin-bottom: 11px;
}

::v-deep .tab-workbench > .el-tabs__content {
  flex: 1;
  min-height: 0;
}

::v-deep .tab-workbench .el-tab-pane {
  height: 100%;
}

::v-deep .dark-tabs .el-tabs__item.is-active {
  color: #38bdf8 !important;
}

::v-deep .dark-tabs .el-tabs__nav-wrap::after {
  background-color: #17263d;
}
</style>

<style>
/* popover 内容渲染在 body 下，需全局样式 */
.relation-popover {
  background: #0f1923 !important;
  border: 1px solid #1e3a5f !important;
}

.relation-popover .popper__arrow {
  border-bottom-color: #1e3a5f !important;
}

.relation-popover .popper__arrow::after {
  border-bottom-color: #0f1923 !important;
}

.relation-popover-body .relation-title {
  color: #38bdf8;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
  letter-spacing: 1px;
}

.relation-popover-body .relation-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.relation-popover-body .relation-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s;
}

.relation-popover-body .relation-item.active {
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.relation-popover-body .rel-num {
  font-size: 16px;
  color: #60a5fa;
  flex-shrink: 0;
  margin-right: 8px;
  line-height: 1.3;
}

.relation-popover-body .relation-item.active .rel-num {
  color: #38bdf8;
}

.relation-popover-body .rel-text {
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.5;
}

.relation-popover-body .relation-item.active .rel-text {
  color: #38bdf8;
}

.relation-popover-body .rel-arrow {
  color: #2d4a6a;
  font-size: 14px;
  line-height: 1;
  padding: 2px 0;
}
</style>
