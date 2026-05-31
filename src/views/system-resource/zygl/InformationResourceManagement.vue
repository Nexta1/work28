<template>
  <div class="screen-container">
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
            <el-input-number
              v-model="bshQuery.queryBsh"
              size="mini"
              :min="0"
              controls-position="right"
              placeholder="查询编识号"
              class="filter-item-num"
            />
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
              <el-table-column prop="opTime" label="操作时间" min-width="150" />
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
                    @click="openBshDialog(true, scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
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

      <el-tab-pane label="平台信息" name="ptxx">
        <div class="tab-pane-body" v-loading="loading.ptxx">
          <div class="panel-header-summary">
            <span class="title text-cyan">平台信息</span>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openPtxxDialog(false)"
            >
              新增平台
            </el-button>
          </div>
          <div class="filter-action-row">
            <el-input
              v-model="ptxxQuery.PTMC"
              size="mini"
              clearable
              placeholder="平台名称"
              class="filter-item"
            />
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="searchPtxx"
              >查询</el-button
            >
          </div>
          <div class="table-container-flex">
            <el-table
              :data="ptxxList"
              size="mini"
              height="100%"
              class="dark-dashboard-table"
              stripe
              border
            >
              <el-table-column prop="PTXXID" label="平台标识" width="90" />
              <el-table-column prop="PTMC" label="平台名称" min-width="130" />
              <el-table-column prop="ptxhmc" label="平台型号" width="130" />
              <el-table-column prop="SSZQMC" label="战区" width="100" />
              <el-table-column prop="SSJZMC" label="军种" width="100" />
              <el-table-column
                prop="PTBSH"
                label="平台编识号"
                width="110"
                class-name="font-num"
              />
              <el-table-column
                prop="PTID"
                label="平台ID"
                width="90"
                class-name="font-num"
              />
              <el-table-column prop="opTime" label="操作时间" min-width="150" />
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
                    @click="openPtxxDialog(true, scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
                    class="text-red"
                    @click="deletePtxx(scope.row)"
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
              :current-page.sync="ptxxPage.pageNum"
              :page-size="ptxxPage.pageSize"
              :total="ptxxTotal"
              @current-change="fetchPtxx"
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
              <el-table-column
                prop="ptBSHSegmentId"
                label="分配标识"
                width="90"
              />
              <el-table-column prop="PTXXID" label="平台标识" width="90" />
              <el-table-column
                prop="bshSegmentId"
                label="号段标识"
                width="90"
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
              <el-table-column prop="opTime" label="操作时间" min-width="150" />
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
                    @click="openPtBshDialog(true, scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
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
            <el-input
              v-model="allocateQuery.businessName"
              size="mini"
              clearable
              placeholder="业务名称"
              class="filter-item"
            />
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
                prop="ptBSHAllocateId"
                label="分配标识"
                width="90"
              />
              <el-table-column
                prop="allocatedPTXXID"
                label="平台标识"
                width="100"
              />
              <el-table-column
                prop="ptBSHSegmentId"
                label="号段分配标识"
                width="110"
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
              <el-table-column prop="opTime" label="操作时间" min-width="150" />
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
                    @click="openAllocateDialog(true, scope.row)"
                    >修改</el-button
                  >
                  <el-button
                    type="text"
                    size="mini"
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
        label-width="110px"
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

    <!-- 平台信息 -->
    <el-dialog
      :title="ptxxEdit ? '修改平台信息' : '新增平台信息'"
      :visible.sync="ptxxDialogVisible"
      width="560px"
      append-to-body
    >
      <el-form
        ref="ptxxFormRef"
        :model="ptxxForm"
        :rules="ptxxRules"
        label-width="110px"
        size="mini"
      >
        <el-form-item label="平台名称" prop="PTMC">
          <el-input v-model="ptxxForm.PTMC" />
        </el-form-item>
        <el-form-item label="平台型号" prop="PTXHID">
          <el-select v-model="ptxxForm.PTXHID" filterable class="full-width">
            <el-option
              v-for="item in ptxhOptions"
              :key="item.PTXHID || item.ptxhid"
              :label="item.PTXHMC || item.ptxhmc"
              :value="pickRowId(item, ['PTXHID', 'ptxhid'])"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="平台ID" prop="PTID">
          <el-input-number
            v-model="ptxxForm.PTID"
            :min="0"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="数据链ID" prop="SJLID">
          <el-input-number
            v-model="ptxxForm.SJLID"
            :min="0"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="平台编识号" prop="PTBSH">
          <el-input-number
            v-model="ptxxForm.PTBSH"
            :min="0"
            class="full-width"
          />
        </el-form-item>
        <el-form-item label="所属战区" prop="SSZQNM">
          <el-select v-model="ptxxForm.SSZQNM" class="full-width">
            <el-option
              v-for="item in theaterOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属军种" prop="SSJZNM">
          <el-select v-model="ptxxForm.SSJZNM" class="full-width">
            <el-option
              v-for="item in armyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="服役时间">
          <el-date-picker
            v-model="ptxxForm.FYSJ"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            class="full-width"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="mini" @click="ptxxDialogVisible = false"
          >取消</el-button
        >
        <el-button size="mini" type="primary" @click="submitPtxx"
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
      loading: {bsh: false, ptxx: false, ptBsh: false, allocate: false},
      bshList: [],
      bshTotal: 0,
      bshPage: {pageNum: 1, pageSize: 15},
      bshQuery: {bshType: null, SSZQNM: null, SSJZNM: null, queryBsh: null},
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
      ptxxList: [],
      ptxxTotal: 0,
      ptxxPage: {pageNum: 1, pageSize: 15},
      ptxxQuery: {PTMC: ''},
      ptxxDialogVisible: false,
      ptxxEdit: false,
      ptxxForm: {
        PTXXID: null,
        PTMC: '',
        PTXHID: null,
        PTID: null,
        SJLID: null,
        PTBSH: null,
        SSZQNM: null,
        SSJZNM: null,
        FYSJ: ''
      },
      ptxxRules: {
        PTMC: [{required: true, message: '请输入平台名称', trigger: 'blur'}],
        PTXHID: [{required: true, message: '请选择平台型号', trigger: 'change'}]
      },
      ptBshList: [],
      ptBshTotal: 0,
      ptBshPage: {pageNum: 1, pageSize: 15},
      ptBshQuery: {bshType: null},
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
        ]
      },
      allocateList: [],
      allocateTotal: 0,
      allocatePage: {pageNum: 1, pageSize: 15},
      allocateQuery: {businessName: ''},
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
        ]
      }
    }
  },
  mounted() {
    this.loadMaps()
    this.loadReferenceData()
    this.fetchBsh()
    this.fetchPtxx()
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
      return `平台${item.PTXXID} 号段${item.bshSegmentId} [${item.startBsh}-${item.endBsh}]`
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
          this.ptBshSegmentOptions = this.normalizeList(ptBshRes)
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
      if (this.bshQuery.queryBsh != null)
        params.queryBsh = this.bshQuery.queryBsh
      apiPage('bshSegment', {
        pageNum: this.bshPage.pageNum,
        pageSize: this.bshPage.pageSize,
        params
      })
        .then(res => {
          this.bshList = this.normalizeList(res)
          this.bshTotal = (res.data && res.data.total) || this.bshList.length
        })
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
        action.then(() => {
          this.$message.success('编识号段已保存')
          this.bshDialogVisible = false
          this.fetchBsh()
          this.loadReferenceData()
        })
      })
    },
    deleteBsh(row) {
      const id = this.pickRowId(row, ['bshSegmentId'])
      this.$confirm('确定删除该编识号段吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('bshSegment', id).then(() => {
            this.$message.success('删除成功')
            this.fetchBsh()
            this.loadReferenceData()
          })
        }
      )
    },
    fetchPtxx() {
      this.loading.ptxx = true
      apiPage('ptxx', {
        pageNum: this.ptxxPage.pageNum,
        pageSize: this.ptxxPage.pageSize,
        params: {PTMC: this.ptxxQuery.PTMC || undefined}
      })
        .then(res => {
          this.ptxxList = this.normalizeList(res)
          this.ptxxTotal = (res.data && res.data.total) || this.ptxxList.length
        })
        .finally(() => {
          this.loading.ptxx = false
        })
    },
    searchPtxx() {
      this.ptxxPage.pageNum = 1
      this.fetchPtxx()
    },
    openPtxxDialog(isEdit, row = null) {
      this.ptxxEdit = isEdit
      this.ptxxForm =
        isEdit && row
          ? {
              PTXXID: this.pickRowId(row, ['PTXXID', 'ptxxid']),
              PTMC: row.PTMC || row.ptmc,
              PTXHID: row.PTXHID || row.ptxhid,
              PTID: row.PTID || row.ptid,
              SJLID: row.SJLID || row.sjlid,
              PTBSH: row.PTBSH || row.ptbsh,
              SSZQNM: row.SSZQNM || row.sszqnm,
              SSJZNM: row.SSJZNM || row.ssjznm,
              FYSJ: row.FYSJ || row.fysj
            }
          : {
              PTXXID: null,
              PTMC: '',
              PTXHID: null,
              PTID: null,
              SJLID: null,
              PTBSH: null,
              SSZQNM: null,
              SSJZNM: null,
              FYSJ: ''
            }
      this.ptxxDialogVisible = true
      this.$nextTick(
        () => this.$refs.ptxxFormRef && this.$refs.ptxxFormRef.clearValidate()
      )
    },
    submitPtxx() {
      this.$refs.ptxxFormRef.validate(valid => {
        if (!valid) return
        const action = this.ptxxEdit
          ? apiUpdate('ptxx', this.ptxxForm)
          : apiAdd('ptxx', this.ptxxForm)
        action.then(() => {
          this.$message.success('平台信息已保存')
          this.ptxxDialogVisible = false
          this.fetchPtxx()
          this.loadReferenceData()
        })
      })
    },
    deletePtxx(row) {
      const id = this.pickRowId(row, ['PTXXID', 'ptxxid'])
      this.$confirm('确定删除该平台信息吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('ptxx', id).then(() => {
            this.$message.success('删除成功')
            this.fetchPtxx()
            this.loadReferenceData()
          })
        }
      )
    },
    fetchPtBsh() {
      this.loading.ptBsh = true
      const params = {}
      if (this.ptBshQuery.bshType != null)
        params.bshType = this.ptBshQuery.bshType
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
        action.then(() => {
          this.$message.success('平台号段分配已保存')
          this.ptBshDialogVisible = false
          this.fetchPtBsh()
          this.loadReferenceData()
        })
      })
    },
    deletePtBsh(row) {
      const id = this.pickRowId(row, ['ptBSHSegmentId', 'serviceId'])
      this.$confirm('确定删除该分配记录吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('ptBSHSegment', id).then(() => {
            this.$message.success('删除成功')
            this.fetchPtBsh()
            this.loadReferenceData()
          })
        }
      )
    },
    fetchAllocate() {
      this.loading.allocate = true
      apiPage('ptBSHAllocate', {
        pageNum: this.allocatePage.pageNum,
        pageSize: this.allocatePage.pageSize,
        params: {
          businessName: this.allocateQuery.businessName || undefined
        }
      })
        .then(res => {
          this.allocateList = this.normalizeList(res)
          this.allocateTotal =
            (res.data && res.data.total) || this.allocateList.length
        })
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
        action.then(() => {
          this.$message.success('编识号分配已保存')
          this.allocateDialogVisible = false
          this.fetchAllocate()
        })
      })
    },
    deleteAllocate(row) {
      const id = this.pickRowId(row, ['ptBSHAllocateId'])
      this.$confirm('确定删除该编识号分配吗？', '提示', {type: 'warning'}).then(
        () => {
          apiDelete('ptBSHAllocate', id).then(() => {
            this.$message.success('删除成功')
            this.fetchAllocate()
          })
        }
      )
    }
  }
}
</script>

<style scoped lang="scss">
@use '../styles/resource-screen.scss' as *;

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
  margin-bottom: 10px;
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
