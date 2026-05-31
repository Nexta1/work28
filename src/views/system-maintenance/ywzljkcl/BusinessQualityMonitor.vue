<template>
  <div class="business-screen-container">
    <div class="business-top-header">
      <div class="brand-title">
        <Icon
          icon="lucide:layout-dashboard"
          :size="14"
          color="#38bdf8"
          style="vertical-align: middle; margin-right: 4px"
        />战术网络与业务质量数字化监控舱
      </div>
      <div class="global-legend">
        <div class="legend-node"><span class="dot bg-safe"></span>稳健运行</div>
        <div class="legend-node"><span class="dot bg-warn"></span>轻度越限</div>
        <div class="legend-node"><span class="dot bg-crit"></span>严重告警</div>
        <div class="sync-countdown-badge font-num">
          <Icon
            icon="lucide:refresh-cw"
            :size="11"
            color="#a7f3d0"
            style="vertical-align: middle; margin-right: 3px"
          />15S 轮询步进
        </div>
      </div>
    </div>

    <div class="global-statistics-bar">
      <div class="stat-card">
        <div class="stat-lbl">
          <Icon
            icon="lucide:globe"
            :size="12"
            color="#34d399"
            style="vertical-align: middle; margin-right: 4px"
          />全网链路成功率 (均值)
        </div>
        <div class="stat-val text-green font-num">
          {{ globalStats.avgSuccessRate }}<small>%</small>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">
          <Icon
            icon="lucide:swords"
            :size="12"
            color="#60a5fa"
            style="vertical-align: middle; margin-right: 4px"
          />在网作战任务群组
        </div>
        <div class="stat-val text-blue font-num">
          {{ globalStats.activeGroups }}<small>组</small>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-lbl">
          <Icon
            icon="lucide:boxes"
            :size="12"
            color="#22d3ee"
            style="vertical-align: middle; margin-right: 4px"
          />活动应用服务网格
        </div>
        <div class="stat-val text-cyan font-num">
          {{ globalStats.totalServices }}<small>个</small>
        </div>
      </div>
      <div
        class="stat-card"
        :class="globalStats.alertCount > 0 ? 'alert-flash-border' : ''"
      >
        <div class="stat-lbl">
          <Icon
            icon="lucide:alert-triangle"
            :size="12"
            color="#f87171"
            style="vertical-align: middle; margin-right: 4px"
          />实时阻断性告警源
        </div>
        <div
          class="stat-val font-num"
          :class="globalStats.alertCount > 0 ? 'text-red' : 'text-gray'"
        >
          {{ globalStats.alertCount }}<small>项</small>
        </div>
      </div>
    </div>

    <div class="business-main-layout">
      <div class="business-column width-30">
        <div class="sub-panel flex-100">
          <div class="panel-title-bar">
            <span class="title">
              <Icon
                icon="lucide:activity"
                :size="12"
                color="#38bdf8"
                style="vertical-align: middle; margin-right: 4px"
              />链路传输质量监测
            </span>
          </div>

          <div class="inner-filter-bar grid-2 custom-el-form">
            <el-input
              v-model="linkQueryParams.WLMC"
              @input="fetchLinkDetectPage"
              placeholder="过滤网络名称..."
              size="mini"
              clearable
            />
            <el-select
              v-model="linkQueryParams.LLLX"
              @change="fetchLinkDetectPage"
              placeholder="全链路体制类型"
              size="mini"
              clearable
            >
              <el-option
                v-for="(val, key) in linkTypeMap"
                :key="key"
                :label="val"
                :value="Number(key)"
              />
            </el-select>
          </div>

          <div class="scroll-wrapper" v-loading="loadingLink">
            <div v-if="linkDetectList.length === 0" class="empty-holder">
              未捕捉到链路传输质量遥测数据
            </div>

            <div
              v-for="item in linkDetectList"
              :key="item.wlllDetectId"
              class="quality-glass-card"
              :class="[
                getWarnClass(item.warnLevel),
                {'is-active': activeLinkId === item.wlllDetectId}
              ]"
              @click="selectLink(item)"
            >
              <div class="card-row-top">
                <span class="main-code">
                  <Icon
                    icon="lucide:network"
                    :size="12"
                    color="#818cf8"
                    style="vertical-align: middle; margin-right: 3px"
                  />{{ item.WLMC || '模拟未命名网络' }}
                  <small class="text-gray">({{ item.WLH || '-' }}号网)</small>
                </span>
                <span class="status-badge" :class="'badge-' + item.warnLevel"
                  >级别: {{ item.warnLevel }}</span
                >
              </div>

              <div class="metrics-triple-grid">
                <div class="triple-cell">
                  <div class="lbl">成功率</div>
                  <div
                    class="val font-num"
                    :class="item.successRate < 0.95 ? 'text-red' : 'text-green'"
                  >
                    {{ (item.successRate * 100).toFixed(1) }}%
                  </div>
                </div>
                <div class="triple-cell">
                  <div class="lbl">平均时延</div>
                  <div class="val font-num text-cyan">
                    {{ item.delayAvg || 0 }} <small>ms</small>
                  </div>
                </div>
                <div class="triple-cell">
                  <div class="lbl">时延抖动</div>
                  <div class="val font-num text-orange">
                    {{ item.delayJitter || 0 }} <small>ms</small>
                  </div>
                </div>
              </div>

              <div class="card-row-nodes font-num">
                <span>
                  <Icon
                    icon="lucide:log-out"
                    :size="12"
                    color="#fbbf24"
                    style="vertical-align: middle; margin-right: 3px"
                  />源端: #{{ item.PT1BSH || '-' }}
                </span>
                <span>
                  <Icon
                    icon="lucide:log-in"
                    :size="12"
                    color="#34d399"
                    style="vertical-align: middle; margin-right: 3px"
                  />目的: #{{ item.PT2BSH || '-' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="business-column width-40">
        <div class="sub-panel flex-50 bg-chart-radar">
          <div class="panel-title-bar">
            <span class="title">
              <Icon
                icon="lucide:trending-up"
                :size="12"
                color="#a78bfa"
                style="vertical-align: middle; margin-right: 4px"
              />核心侧重：激活链路效能历史演进趋势 (时序遥测)
            </span>
            <span class="active-node-desc text-cyan" v-if="activeLinkName"
              >当前激活: {{ activeLinkName }}</span
            >
          </div>
          <div class="chart-container-box">
            <div ref="linkTrendChart" class="echart-container"></div>
          </div>
        </div>

        <div class="sub-panel flex-50">
          <div class="panel-title-bar">
            <span class="title">
              <Icon
                icon="lucide:shield-alert"
                :size="12"
                color="#f43f5e"
                style="vertical-align: middle; margin-right: 4px"
              />作战任务群组在网态势监视
            </span>
          </div>

          <div class="inner-filter-bar custom-el-form">
            <el-input
              v-model="taskQueryParams.QZMC"
              @input="fetchTaskGroupPage"
              placeholder="输入作战群组名称检索..."
              size="mini"
              clearable
            />
          </div>

          <div class="scroll-wrapper" v-loading="loadingTask">
            <div v-if="taskGroupList.length === 0" class="empty-holder">
              当前无在网执行的作战群组任务
            </div>

            <div
              v-for="task in taskGroupList"
              :key="task.ZZRWQZID"
              class="task-group-dashboard"
            >
              <div class="task-top-meta">
                <span class="qz-title">
                  <Icon
                    icon="lucide:shield"
                    :size="12"
                    color="#60a5fa"
                    style="vertical-align: middle; margin-right: 4px"
                  />{{ task.QZMC }}
                </span>
                <span class="state-tag" :class="'state-' + task.QZSTATE">{{
                  getTaskStateText(task.QZSTATE)
                }}</span>
              </div>

              <div class="topo-route-line font-num">
                <div class="route-node">
                  <div class="dot-icon bg-blue"></div>
                  <div class="node-lbl">起点: #{{ task.QSPTBSH }}</div>
                </div>
                <div class="route-arrow">➔ ➔</div>
                <div class="route-node text-right">
                  <div class="dot-icon bg-orange"></div>
                  <div class="node-lbl">终点: #{{ task.ZZPTBSH }}</div>
                </div>
              </div>

              <div class="target-track-panel font-num">
                <span>
                  <Icon
                    icon="lucide:crosshair"
                    :size="12"
                    color="#f87171"
                    style="vertical-align: middle; margin-right: 3px"
                  />起始目标: <b class="text-red">{{ task.QSMBBSH }}</b>
                </span>
                <span>
                  <Icon
                    icon="lucide:target"
                    :size="12"
                    color="#f87171"
                    style="vertical-align: middle; margin-right: 3px"
                  />终止目标: <b class="text-red">{{ task.ZZMBBSH }}</b>
                </span>
              </div>

              <div class="time-period-box font-num text-gray">
                <div>
                  <Icon
                    icon="lucide:play"
                    :size="11"
                    color="#94a3b8"
                    style="vertical-align: middle; margin-right: 3px"
                  />开始时间: {{ task.RWKSSJ }}
                </div>
                <div>
                  <Icon
                    icon="lucide:square"
                    :size="11"
                    color="#94a3b8"
                    style="vertical-align: middle; margin-right: 3px"
                  />终止时间: {{ task.RWZZSJ }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="business-column width-30">
        <div class="sub-panel flex-35">
          <div class="panel-title-bar">
            <span class="title">
              <Icon
                icon="lucide:compass"
                :size="12"
                color="#22d3ee"
                style="vertical-align: middle; margin-right: 4px"
              />时空同源步进监测
            </span>
          </div>
          <div class="scroll-wrapper" v-loading="loadingTimeSync">
            <div
              v-for="pt in timeSyncList"
              :key="pt.PTBSH"
              class="sync-compact-row"
            >
              <div class="sync-meta">
                <div class="node-name">
                  <Icon
                    icon="lucide:satellite"
                    :size="12"
                    color="#38bdf8"
                    style="vertical-align: middle; margin-right: 4px"
                  />{{ pt.PTMC }}
                  <small class="font-num text-cyan">#{{ pt.PTBSH }}</small>
                </div>
                <div class="time-lbl font-num">
                  授时基准 [{{ pt.STSMC }}]: {{ pt.STSSJ }}
                </div>
              </div>
              <div
                class="deviation-badge"
                :class="
                  Number(pt.deviation || 0) > 50 ? 'dev-high' : 'dev-normal'
                "
              >
                <span class="font-num">{{ pt.deviation || 0 }}ms</span>
              </div>
            </div>
          </div>
        </div>

        <div class="sub-panel flex-65">
          <div class="panel-title-bar">
            <span class="title">
              <Icon
                icon="lucide:layers"
                :size="12"
                color="#facc15"
                style="vertical-align: middle; margin-right: 4px"
              />业务微服务集群网格
            </span>
          </div>

          <div class="inner-filter-bar grid-2 custom-el-form">
            <el-input
              v-model="serviceQueryParams.serviceName"
              @input="fetchServicePage"
              placeholder="搜索微服务..."
              size="mini"
              clearable
            />
            <el-select
              v-model="serviceQueryParams.serviceStatus"
              @change="fetchServicePage"
              placeholder="全部状态"
              size="mini"
              clearable
            >
              <el-option label="全部状态" value="" />
              <el-option label="正常就绪" value="0" />
              <el-option label="宕机挂起" value="1" />
            </el-select>
          </div>

          <div class="scroll-wrapper" v-loading="loadingService">
            <div v-if="serviceList.length === 0" class="empty-holder">
              未捕捉到运行微服务监控指标
            </div>

            <div
              v-for="srv in serviceList"
              :key="srv.serviceId"
              class="service-mesh-card"
              :class="
                Number(srv.serviceStatus) === 1 ? 'border-dead' : 'border-alive'
              "
            >
              <div class="service-title-row">
                <div class="srv-main">
                  <span class="srv-name">
                    <Icon
                      icon="lucide:box"
                      :size="12"
                      color="#fb7185"
                      style="vertical-align: middle; margin-right: 4px"
                    />{{ srv.serviceName }}
                  </span>
                  <span class="srv-template text-gray">{{
                    srv.templateName
                  }}</span>
                </div>
                <div
                  class="status-light"
                  :class="
                    Number(srv.serviceStatus) === 1
                      ? 'light-red'
                      : 'light-green'
                  "
                >
                  {{ Number(srv.serviceStatus) === 1 ? 'OFFLINE' : 'ONLINE' }}
                </div>
              </div>

              <div class="service-resource-bars">
                <div class="bar-item">
                  <span class="lbl">CPU 开销</span>
                  <el-progress
                    :percentage="Math.min(Math.floor(srv.useCpu || 0), 100)"
                    :status="srv.useCpu > 80 ? 'exception' : 'success'"
                    :stroke-width="3"
                    :show-text="false"
                  />
                  <span class="num font-num">{{ srv.useCpu || 0 }}%</span>
                </div>
                <div class="bar-item">
                  <span class="lbl">内存吞吐</span>
                  <span class="num font-num text-blue"
                    >{{ srv.useMemory || 0 }} <small>MB</small></span
                  >
                </div>
              </div>

              <div class="network-contract-box font-num">
                <div class="contract-node">
                  <span class="c-lbl">套接字:</span>
                  <span class="text-cyan"
                    >{{ srv.serviceIp }}:{{ srv.servicePort }}</span
                  >
                </div>
                <div class="contract-node ellipsis">
                  <span class="c-lbl">资源定位:</span>
                  <span class="text-gray" :title="srv.serviceURL">{{
                    srv.serviceURL
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import {
  getPlatformPage,
  getServiceInfoPage,
  getZzrwqzPage
} from '@/api/platform'
import {wlllDetect} from '@/api/network'

export default {
  name: 'BusinessQualityMonitor',
  data() {
    return {
      loadingLink: false,
      loadingTimeSync: false,
      loadingTask: false,
      loadingService: false,
      globalPollingTimer: null,

      linkDetectList: [],
      timeSyncList: [],
      taskGroupList: [],
      serviceList: [],

      globalStats: {
        avgSuccessRate: '99.2',
        activeGroups: 0,
        totalServices: 0,
        alertCount: 0
      },

      linkQueryParams: {WLMC: '', LLLX: ''},
      taskQueryParams: {QZMC: ''},
      serviceQueryParams: {serviceName: '', serviceStatus: ''},

      pageConfig: {pageNum: 1, pageSize: 10},

      chartIns: null,
      activeLinkId: null,
      activeLinkName: '',
      chartHistory: {timeline: [], successRate: [], delay: [], jitter: []},

      linkTypeMap: {
        1: '地基接入数据链组件',
        2: '天基信息直接入链星弹数据链组件',
        3: '天基侦察信息分发数据链组件',
        4: '天基接入数据链专用组件',
        5: '宽频段混合组网数据链组件',
        6: '视距/超视距一体化组网数据链组件'
      }
    }
  },
  created() {
    this.initialMasterWorkflow()
    this.globalPollingTimer = setInterval(() => {
      this.executeSilentSyncWorkflow()
    }, 15000)
  },
  mounted() {
    this.initTrendChart()
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    if (this.globalPollingTimer) clearInterval(this.globalPollingTimer)
    window.removeEventListener('resize', this.resizeChart)
    if (this.chartIns) this.chartIns.dispose()
  },
  methods: {
    async initialMasterWorkflow() {
      this.loadingLink = true
      this.loadingTimeSync = true
      this.loadingTask = true
      this.loadingService = true

      await Promise.all([
        this.fetchLinkDetectPage(),
        this.fetchTimeSyncPage(),
        this.fetchTaskGroupPage(),
        this.fetchServicePage()
      ])

      this.loadingLink = false
      this.loadingTimeSync = false
      this.loadingTask = false
      this.loadingService = false

      if (this.linkDetectList.length > 0) {
        this.selectLink(this.linkDetectList[0])
      }
    },

    async fetchLinkDetectPage() {
      try {
        const payload = {
          pageNum: this.pageConfig.pageNum,
          pageSize: this.pageConfig.pageSize,
          params: {
            WLMC: this.linkQueryParams.WLMC || undefined,
            LLLX:
              this.linkQueryParams.LLLX !== ''
                ? Number(this.linkQueryParams.LLLX)
                : undefined
          }
        }
        const res = await wlllDetect(payload)
        this.linkDetectList = res?.rows || res?.data?.list || []

        if (!this.linkDetectList || this.linkDetectList.length === 0) {
          this.linkDetectList = [
            {
              wlllDetectId: 'DET_001',
              WLMC: '地基高频骨干网组',
              WLH: '101',
              LLLX: 1,
              successRate: 0.994,
              delayAvg: 22,
              delayJitter: 2,
              healthScore: 98,
              warnLevel: 'SAFE',
              PT1BSH: 'PT_NODE_A',
              PT2BSH: 'PT_NODE_B'
            },
            {
              wlllDetectId: 'DET_002',
              WLMC: '宽带混合激光通信网',
              WLH: '105',
              LLLX: 5,
              successRate: 0.912,
              delayAvg: 145,
              delayJitter: 18,
              healthScore: 74,
              warnLevel: 'WARN',
              PT1BSH: 'PT_NODE_C',
              PT2BSH: 'PT_NODE_D'
            },
            {
              wlllDetectId: 'DET_003',
              WLMC: '视距超视距一体化网',
              WLH: '106',
              LLLX: 6,
              successRate: 0.985,
              delayAvg: 45,
              delayJitter: 5,
              healthScore: 94,
              warnLevel: 'SAFE',
              PT1BSH: 'PT_NODE_A',
              PT2BSH: 'PT_NODE_D'
            }
          ]
        }
        this.calculateGlobalStats()
      } catch (e) {
        console.warn('链路质量接口访问阻断')
      }
    },

    async fetchTimeSyncPage() {
      try {
        const payload = {pageNum: 1, pageSize: 10, params: {}}
        const res = await getPlatformPage(payload)
        this.timeSyncList = res?.rows || res?.data?.list || []

        if (!this.timeSyncList || this.timeSyncList.length === 0) {
          this.timeSyncList = [
            {
              PTBSH: '1001',
              PTMC: '一号测控雷达站',
              STSMC: '北京北斗主时钟',
              STSSJ: '13:28:05.110',
              deviation: 12
            },
            {
              PTBSH: '1002',
              PTMC: '预警机空基节点',
              STSMC: '北京北斗主时钟',
              STSSJ: '13:28:05.110',
              deviation: 64
            },
            {
              PTBSH: '1003',
              PTMC: '远洋护卫舰艇编队',
              STSMC: '长波授时授时源',
              STSSJ: '13:28:05.108',
              deviation: 28
            }
          ]
        }
      } catch (e) {
        console.warn('时空步进偏差载入挂起')
      }
    },

    async fetchTaskGroupPage() {
      try {
        const payload = {
          pageNum: this.pageConfig.pageNum,
          pageSize: this.pageConfig.pageSize,
          params: {QZMC: this.taskQueryParams.QZMC || undefined}
        }
        const res = await getZzrwqzPage(payload)
        this.taskGroupList = res?.rows || res?.data?.list || []

        if (!this.taskGroupList || this.taskGroupList.length === 0) {
          this.taskGroupList = [
            {
              ZZRWQZID: 'QZ_881',
              QZMC: '联合防空导弹截击任务群',
              QZSTATE: 1,
              QSPTBSH: 'PT_101',
              ZZPTBSH: 'PT_204',
              QSMBBSH: 'TGT_E09',
              ZZMBBSH: 'TGT_E12',
              RWKSSJ: '12:00:00',
              RWZZSJ: '16:30:00'
            },
            {
              ZZRWQZID: 'QZ_882',
              QZMC: '多维协同深空侦察编群',
              QZSTATE: 0,
              QSPTBSH: 'PT_105',
              ZZPTBSH: 'PT_301',
              QSMBBSH: 'TGT_X01',
              ZZMBBSH: 'TGT_X05',
              RWKSSJ: '13:15:00',
              RWZZSJ: '19:00:00'
            }
          ]
        }
        this.calculateGlobalStats()
      } catch (e) {
        console.warn('作战任务群组加载阻断')
      }
    },

    async fetchServicePage() {
      try {
        const payload = {
          pageNum: this.pageConfig.pageNum,
          pageSize: this.pageConfig.pageSize,
          params: {
            serviceName: this.serviceQueryParams.serviceName || undefined,
            serviceStatus:
              this.serviceQueryParams.serviceStatus !== ''
                ? Number(this.serviceQueryParams.serviceStatus)
                : undefined
          }
        }
        const res = await getServiceInfoPage(payload)
        this.serviceList = res?.rows || res?.data?.list || []

        if (!this.serviceList || this.serviceList.length === 0) {
          this.serviceList = [
            {
              serviceId: 'SRV_01',
              serviceName: '时空轨迹动态纠偏服务',
              templateName: '标准微服务模板',
              serviceStatus: 0,
              useCpu: 45,
              useMemory: 1024,
              serviceIp: '192.168.10.45',
              servicePort: '8081',
              serviceURL: '/api/v1/geo/rectify'
            },
            {
              serviceId: 'SRV_02',
              serviceName: '多模组网拓扑流转网关',
              templateName: '高负载专用组件',
              serviceStatus: 0,
              useCpu: 88,
              useMemory: 4096,
              serviceIp: '192.168.10.46',
              servicePort: '9000',
              serviceURL: '/api/v1/topology/stream'
            },
            {
              serviceId: 'SRV_03',
              serviceName: '雷达目标威胁判决服务',
              templateName: '核心算力模板',
              serviceStatus: 1,
              useCpu: 0,
              useMemory: 0,
              serviceIp: '192.168.10.50',
              servicePort: '8088',
              serviceURL: '/api/v1/threat/judge'
            }
          ]
        }
        this.calculateGlobalStats()
      } catch (e) {
        console.warn('微服务引擎状态解析异常')
      }
    },

    selectLink(item) {
      this.activeLinkId = item.wlllDetectId
      this.activeLinkName = item.WLMC
      this.chartHistory = {timeline: [], successRate: [], delay: [], jitter: []}

      for (let i = 5; i > 0; i--) {
        const d = new Date(Date.now() - i * 15000)
        const timeStr = d.toLocaleTimeString('zh-CN', {hour12: false})
        this.chartHistory.timeline.push(timeStr)
        this.chartHistory.successRate.push(
          (item.successRate * 100 - Math.random() * 2).toFixed(1)
        )
        this.chartHistory.delay.push(
          Math.floor(item.delayAvg + (Math.random() * 10 - 5))
        )
        this.chartHistory.jitter.push(
          Math.floor(item.delayJitter + (Math.random() * 4 - 2))
        )
      }
      this.renderTrendChart()
    },

    async executeSilentSyncWorkflow() {
      await Promise.all([
        this.fetchLinkDetectPage(),
        this.fetchTimeSyncPage(),
        this.fetchTaskGroupPage(),
        this.fetchServicePage()
      ])

      if (this.activeLinkId) {
        const curLink = this.linkDetectList.find(
          l => l.wlllDetectId === this.activeLinkId
        )
        if (curLink) {
          const nowStr = new Date().toLocaleTimeString('zh-CN', {hour12: false})
          this.chartHistory.timeline.push(nowStr)
          this.chartHistory.successRate.push(
            (curLink.successRate * 100).toFixed(1)
          )
          this.chartHistory.delay.push(curLink.delayAvg)
          this.chartHistory.jitter.push(curLink.delayJitter)

          if (this.chartHistory.timeline.length > 12) {
            this.chartHistory.timeline.shift()
            this.chartHistory.successRate.shift()
            this.chartHistory.delay.shift()
            this.chartHistory.jitter.shift()
          }
          this.renderTrendChart()
        }
      }
    },

    calculateGlobalStats() {
      if (this.linkDetectList.length > 0) {
        const sum = this.linkDetectList.reduce(
          (acc, cur) => acc + (cur.successRate || 0),
          0
        )
        this.globalStats.avgSuccessRate = (
          (sum / this.linkDetectList.length) *
          100
        ).toFixed(1)
      }
      this.globalStats.activeGroups = this.taskGroupList.filter(
        t => t.QZSTATE === 1
      ).length
      this.globalStats.totalServices = this.serviceList.length

      const critLinks = this.linkDetectList.filter(
        l => l.warnLevel === 'CRIT' || l.warnLevel === '3'
      ).length
      const deadServices = this.serviceList.filter(
        s => Number(s.serviceStatus) === 1
      ).length
      this.globalStats.alertCount = critLinks + deadServices
    },

    initTrendChart() {
      this.chartIns = echarts.init(this.$refs.linkTrendChart, 'dark')
      this.renderTrendChart()
    },
    renderTrendChart() {
      if (!this.chartIns) return
      this.chartIns.setOption(
        {
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'axis',
            backgroundColor: '#070c14',
            borderColor: '#172438'
          },
          legend: {
            data: ['传输成功率(%)', '平均延迟(ms)', '时延抖动(ms)'],
            bottom: 0,
            textStyle: {color: '#64748b', fontSize: 10}
          },
          grid: {top: 25, bottom: 45, left: 35, right: 35},
          xAxis: {
            type: 'category',
            data: this.chartHistory.timeline,
            axisLine: {lineStyle: {color: '#111b2b'}},
            axisLabel: {color: '#475569', fontSize: 9}
          },
          yAxis: [
            {
              type: 'value',
              name: '成功率',
              min: 80,
              max: 100,
              splitLine: {show: false}
            },
            {
              type: 'value',
              name: '时延/ms',
              position: 'right',
              splitLine: {lineStyle: {color: '#111b2b'}}
            }
          ],
          series: [
            {
              name: '传输成功率(%)',
              type: 'line',
              smooth: true,
              itemStyle: {color: '#10b981'},
              data: this.chartHistory.successRate,
              yAxisIndex: 0
            },
            {
              name: '平均延迟(ms)',
              type: 'bar',
              barWidth: 8,
              itemStyle: {color: '#3b82f6', opacity: 0.7},
              data: this.chartHistory.delay,
              yAxisIndex: 1
            },
            {
              name: '时延抖动(ms)',
              type: 'line',
              smooth: true,
              itemStyle: {color: '#ef4444'},
              data: this.chartHistory.jitter,
              yAxisIndex: 1
            }
          ]
        },
        true
      )
    },
    resizeChart() {
      if (this.chartIns) this.chartIns.resize()
    },
    getWarnClass(level) {
      if (level === 'CRIT' || level === '3') return 'lvl-crit'
      if (level === 'WARN' || level === '2') return 'lvl-warn'
      return 'lvl-safe'
    },
    getTaskStateText(s) {
      return {0: '新建描述', 1: '启动运行', 2: '任务终止'}[s] || '未知'
    }
  }
}
</script>

<style scoped>
.business-screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 14px;
}

/* 1. 全局标题头 */
.business-top-header {
  height: 46px;
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}
.brand-title {
  font-size: 13px;
  font-weight: bold;
  color: #38bdf8;
  letter-spacing: 1px;
}
.global-legend {
  display: flex;
  align-items: center;
  gap: 14px;
}
.legend-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
}
.legend-node .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.bg-safe {
  background: #10b981;
}
.bg-warn {
  background: #f59e0b;
}
.bg-crit {
  background: #ef4444;
}
.sync-countdown-badge {
  background: #111e36;
  color: #38bdf8;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
}

/* 2. 数据大屏核心统计带 */
.global-statistics-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 11px 0;
  flex-shrink: 0;
}
.stat-card {
  background: #080e18;
  border: 1px solid #132238;
  border-radius: 4px;
  padding: 11px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.stat-lbl {
  font-size: 11px;
  color: #475569;
  font-weight: bold;
  margin-bottom: 2px;
}
.stat-val {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: -0.5px;
}
.stat-val small {
  font-size: 11px;
  font-weight: normal;
  margin-left: 3px;
  color: #475569;
}

/* 大屏布局 */
.business-main-layout {
  display: flex;
  flex: 1;
  gap: 14px;
  height: calc(100% - 130px);
  min-height: 0;
}
.business-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}
.width-30 {
  width: 30%;
}
.width-40 {
  width: 40%;
}

.sub-panel {
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-sizing: border-box;
}
.flex-100 {
  flex: 1;
}
.flex-50 {
  flex: 0.5;
}
.flex-35 {
  flex: 0.35;
}
.flex-65 {
  flex: 0.65;
}

.panel-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #111b2b;
  padding-bottom: 6px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.panel-title-bar .title {
  font-size: 11px;
  font-weight: bold;
  color: #38bdf8;
}
.active-node-desc {
  font-size: 11px;
  font-weight: bold;
}

/* 过滤框 Element UI 深色主题覆盖配置 */
.inner-filter-bar {
  margin-bottom: 8px;
  flex-shrink: 0;
}
.inner-filter-bar.grid-2 {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 6px;
}
.custom-el-form ::v-nav,
.custom-el-form ::v-deep .el-input__inner {
  background-color: #070c14 !important;
  border: 1px solid #172438 !important;
  color: #fff !important;
  font-size: 11px !important;
  height: 28px !important;
  line-height: 28px !important;
}
.custom-el-form ::v-deep .el-input__icon {
  line-height: 28px !important;
}
/* 覆盖 El 单选下拉菜单底衬 */
.custom-el-form ::v-deep .el-select {
  width: 100%;
}

/* 滚动条机制 */
.scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-thumb {
  background: #172438;
  border-radius: 2px;
}

/* 链路质量卡片 */
.quality-glass-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-left: 3px solid #64748b;
  padding: 8px 11px;
  border-radius: 3px;
  cursor: pointer;
}
.quality-glass-card:hover,
.quality-glass-card.is-active {
  background: #111e33;
  border-color: #38bdf8;
}
.card-row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.card-row-top .main-code {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.status-badge {
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 2px;
  background: #070c14;
}

.metrics-triple-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: #070c14;
  padding: 5px;
  border-radius: 2px;
  margin: 6px 0;
}
.triple-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.triple-cell .lbl {
  font-size: 8px;
  color: #415169;
  transform: scale(0.9);
}
.triple-cell .val {
  font-size: 11px;
  font-weight: bold;
  margin-top: 1px;
}
.card-row-nodes {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #415169;
}

/* 中央图表 */
.bg-chart-radar {
  background-image: radial-gradient(
    circle at 50% 10%,
    rgba(56, 189, 248, 0.03) 0%,
    transparent 80%
  );
}
.chart-container-box {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
}
.echart-container {
  flex: 1;
  width: 100%;
}

/* 作战群组面板 */
.task-group-dashboard {
  background: #0d1522;
  border: 1px solid #16263d;
  border-radius: 3px;
  padding: 11px;
}
.task-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.task-top-meta .qz-title {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.state-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  background: #070c14;
}
.state-0 {
  color: #38bdf8;
  border: 1px solid #38bdf8;
}
.state-1 {
  color: #10b981;
  border: 1px solid #10b981;
}

.topo-route-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #070c14;
  padding: 5px 8px;
  border-radius: 2px;
  margin-bottom: 4px;
}
.route-node {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
}
.route-node .dot-icon {
  width: 4px;
  height: 4px;
  border-radius: 50%;
}
.bg-blue {
  background: #38bdf8;
}
.bg-orange {
  background: #f59e0b;
}
.route-arrow {
  color: #1e293b;
  font-size: 9px;
}
.target-track-panel {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  background: rgba(239, 68, 68, 0.02);
  padding: 4px;
  border-radius: 2px;
  margin-bottom: 4px;
}
.time-period-box {
  font-size: 8px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

/* 时空步进组件 */
.sync-compact-row {
  background: #0c1424;
  border: 1px solid #16233a;
  padding: 5px 8px;
  border-radius: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sync-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.sync-meta .node-name {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.sync-meta .time-lbl {
  font-size: 9px;
  color: #415169;
}
.deviation-badge {
  background: #070c14;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #172438;
  font-size: 9px;
}
.dev-normal {
  color: #10b981;
  border-color: #10b981;
}
.dev-high {
  color: #ef4444;
  border-color: #ef4444;
}

/* 应用微服务 */
.service-mesh-card {
  background: #0d1522;
  border: 1px solid #172438;
  border-radius: 3px;
  padding: 8px;
}
.border-alive {
  border-top: 2px solid #10b981;
}
.border-dead {
  border-top: 2px solid #ef4444;
}
.service-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}
.srv-main {
  display: flex;
  flex-direction: column;
}
.srv-name {
  font-size: 11px;
  font-weight: bold;
  color: #fff;
}
.srv-template {
  font-size: 8px;
}
.status-light {
  font-size: 8px;
  padding: 1px 4px;
  border-radius: 2px;
}
.light-green {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}
.light-red {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.service-resource-bars {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 5px 0;
}
.bar-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 9px;
  color: #415169;
}
.bar-item .el-progress {
  width: 50%;
}
.bar-item .num {
  color: #cbd5e1;
}
.network-contract-box {
  background: #070c14;
  padding: 4px;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.contract-node {
  font-size: 8px;
  display: flex;
}
.contract-node .c-lbl {
  color: #415169;
  width: 42px;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 警报状态定义 */
.lvl-crit {
  border-left-color: #ef4444 !important;
}
.lvl-warn {
  border-left-color: #f59e0b !important;
}
.lvl-safe {
  border-left-color: #10b981 !important;
}
.badge-CRIT,
.badge-3 {
  color: #ef4444;
}
.badge-WARN,
.badge-2 {
  color: #f59e0b;
}

@keyframes alert-pulse {
  0%,
  100% {
    border-color: #1e293b;
    box-shadow: none;
  }
  50% {
    border-color: rgba(239, 68, 68, 0.4);
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.2);
  }
}
.alert-flash-border {
  animation: alert-pulse 2s infinite ease-in-out;
}

.empty-holder {
  text-align: center;
  font-size: 11px;
  color: #223147;
  padding: 20px;
  border: 1px dashed #111b2b;
}
.text-green {
  color: #10b981 !important;
}
.text-red {
  color: #ef4444 !important;
}
.text-blue {
  color: #38bdf8 !important;
}
.text-cyan {
  color: #06b6d4 !important;
}
.text-orange {
  color: #f59e0b !important;
}
.text-gray {
  color: #415169 !important;
}
</style>
