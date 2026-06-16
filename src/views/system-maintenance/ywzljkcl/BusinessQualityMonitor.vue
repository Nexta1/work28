<template>
  <div class="business-screen-container">
    <div class="business-top-header">
      <div class="brand-title">
        <Icon
          icon="lucide:layout-dashboard"
          :size="14"
          color="#38bdf8"
          style="vertical-align: middle; margin-right: 4px"
        />业务质量监控
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
          />应用服务
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
          />离线平台
        </div>
        <div
          class="stat-val font-num"
          :class="globalStats.alertCount > 0 ? 'text-red' : 'text-gray'"
        >
          {{ globalStats.alertCount }}<small>项</small>
        </div>
      </div>
    </div>

    <div class="business-main-layout two-col-layout">
      <div class="business-column width-60">
        <div class="sub-panel flex-100">
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

          <div class="inner-filter-bar grid-2 custom-el-form">
            <el-input
              v-model="taskQueryParams.QZMC"
              @input="fetchTaskGroupPage"
              placeholder="输入群组名称检索..."
              size="mini"
              clearable
            />
            <el-input
              v-model="taskQueryParams.RWMC"
              @input="fetchTaskGroupPage"
              placeholder="输入任务名称检索..."
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

              <div class="task-rwmc-row">
                <Icon
                  icon="lucide:flag"
                  :size="11"
                  color="#facc15"
                  style="vertical-align: middle; margin-right: 4px"
                />
                <span class="rwmc-text">{{ task.RWMC }}</span>
              </div>

              <div class="platform-section">
                <div class="pl-header">
                  <span class="pl-header-lbl">
                    <Icon
                      icon="lucide:radio"
                      :size="11"
                      color="#22d3ee"
                      style="vertical-align: middle; margin-right: 4px"
                    />编组平台
                  </span>
                  <span class="online-badge"
                    >{{ getOnlineCount(task) }}/{{
                      getTotalCount(task)
                    }}在线</span
                  >
                </div>
                <div class="pl-tags-wrap">
                  <div class="pl-tags-inner" ref="plTags">
                    <span
                      v-for="(pt, pi) in getPlatformItems(task)"
                      :key="pi"
                      class="pl-tag"
                      :class="pt.online ? 'tag-online' : 'tag-offline'"
                    >
                      <span
                        class="pl-dot"
                        :class="pt.online ? 'dot-online' : 'dot-offline'"
                      ></span>
                      <span class="pl-name">{{ pt.name }}</span>
                    </span>
                  </div>
                  <el-popover
                    v-if="getPlatformItems(task).length > platformVisibleLimit"
                    placement="right"
                    trigger="hover"
                    popper-class="dark-pl-popover"
                  >
                    <span slot="reference" class="pl-more-btn"
                      >+{{
                        getPlatformItems(task).length - platformVisibleLimit
                      }}</span
                    >
                    <div class="popover-pl-list">
                      <div
                        v-for="(pt, pi) in getPlatformItems(task)"
                        :key="pi"
                        class="popover-pl-item"
                      >
                        <span
                          class="pl-dot"
                          :class="pt.online ? 'dot-online' : 'dot-offline'"
                        ></span>
                        <span
                          class="pl-name"
                          :class="pt.online ? 'text-green' : 'text-gray'"
                          >{{ pt.name }}</span
                        >
                      </div>
                    </div>
                  </el-popover>
                </div>
              </div>

              <div class="time-period-row font-num">
                <span class="tp-item">
                  <Icon
                    icon="lucide:play"
                    :size="11"
                    color="#34d399"
                    style="vertical-align: middle; margin-right: 3px"
                  />开始:
                  <span class="tp-val text-green">{{ task.RWKSSJ }}</span>
                </span>
                <span class="tp-sep"></span>
                <span class="tp-item">
                  <Icon
                    icon="lucide:square"
                    :size="11"
                    color="#f87171"
                    style="vertical-align: middle; margin-right: 3px"
                  />终止:
                  <span class="tp-val text-red">{{ task.RWZZSJ }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="business-column width-40">
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
                  {{ Number(srv.serviceStatus) === 1 ? '离线' : '在线' }}
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

export default {
  name: 'BusinessQualityMonitor',
  components: {},
  data() {
    return {
      eventDrawerVisible: false,
      loadingTimeSync: false,
      loadingTask: false,
      loadingService: false,
      globalPollingTimer: null,

      timeSyncList: [],
      taskGroupList: [],
      serviceList: [],

      globalStats: {
        activeGroups: 0,
        totalServices: 0,
        alertCount: 0
      },

      taskQueryParams: {QZMC: '', RWMC: ''},
      serviceQueryParams: {serviceName: '', serviceStatus: ''},

      pageConfig: {pageNum: 1, pageSize: 50},

      chartIns: null,
      platformVisibleLimit: 6
    }
  },
  created() {
    this.initialMasterWorkflow()
    this.globalPollingTimer = setInterval(() => {
      this.executeSilentSyncWorkflow()
    }, 15000)
  },
  mounted() {},
  beforeDestroy() {
    if (this.globalPollingTimer) clearInterval(this.globalPollingTimer)
    if (this.chartIns) this.chartIns.dispose()
  },
  methods: {
    async initialMasterWorkflow() {
      this.loadingTimeSync = true
      this.loadingTask = true
      this.loadingService = true

      await Promise.all([
        this.fetchTimeSyncPage(),
        this.fetchTaskGroupPage(),
        this.fetchServicePage()
      ])

      this.loadingTimeSync = false
      this.loadingTask = false
      this.loadingService = false
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
          params: {
            QZMC: this.taskQueryParams.QZMC || undefined,
            RWMC: this.taskQueryParams.RWMC || undefined
          }
        }
        const res = await getZzrwqzPage(payload)
        this.taskGroupList = res?.rows || res?.data?.list || []

        if (!this.taskGroupList || this.taskGroupList.length === 0) {
          this.taskGroupList = [
            {
              ZZRWQZID: 'QZ_881',
              QZMC: '海面火力打击群',
              RWMC: '近海低空警戒任务',
              QZSTATE: 1,
              QSPTBSH: 1,
              ZZPTBSH: 4,
              QSMBBSH: 3,
              ZZMBBSH: 7,
              PTXXMCS: '辽宁舰,052D型导弹驱逐舰-1,歼-15-1',
              onlineCount: 3,
              onlinePTs: [
                {PTMC: '辽宁舰'},
                {PTMC: '052D型导弹驱逐舰-1'},
                {PTMC: '歼-15-1'}
              ],
              RWKSSJ: '2026-02-08 00:00:00',
              RWZZSJ: '2026-02-27 00:00:00'
            },
            {
              ZZRWQZID: 'QZ_882',
              QZMC: '多维协同深空侦察编群',
              RWMC: '卫星侦察与数据回传任务',
              QZSTATE: 0,
              QSPTBSH: 5,
              ZZPTBSH: 9,
              QSMBBSH: 2,
              ZZMBBSH: 6,
              PTXXMCS:
                '高分侦察卫星-2,空警-500,地面接收站-3,无人机-7,预警雷达-1,通讯中继-2',
              onlineCount: 1,
              onlinePTs: [{PTMC: '高分侦察卫星-2'}],
              RWKSSJ: '2026-02-10 06:30:00',
              RWZZSJ: '2026-03-05 18:00:00'
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

    async executeSilentSyncWorkflow() {
      await Promise.all([
        this.fetchTimeSyncPage(),
        this.fetchTaskGroupPage(),
        this.fetchServicePage()
      ])
    },

    calculateGlobalStats() {
      this.globalStats.activeGroups = this.taskGroupList.filter(
        t => t.QZSTATE === 1
      ).length
      this.globalStats.totalServices = this.serviceList.length

      const deadServices = this.serviceList.filter(
        s => Number(s.serviceStatus) === 1
      ).length
      this.globalStats.alertCount = deadServices
    },

    getTaskStateText(s) {
      return {0: '新建', 1: '在线', 2: '离线'}[s] || '未知'
    },
    getPlatformItems(task) {
      const names = (task.PTXXMCS || '').split(',').filter(Boolean)
      const onlineNames = (task.onlinePTs || []).map(pt => pt.PTMC)
      return names.map(name => ({
        name,
        online: onlineNames.includes(name)
      }))
    },
    getOnlineCount(task) {
      return task.onlineCount || (task.onlinePTs || []).length
    },
    getTotalCount(task) {
      return (task.PTXXMCS || '').split(',').filter(Boolean).length
    }
  }
}
</script>

<style scoped>
/* ===== 全局动画关键帧 ===== */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 4px rgba(56, 189, 248, 0);
  }
  50% {
    box-shadow: 0 0 16px rgba(56, 189, 248, 0.2);
  }
}

@keyframes countPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.business-screen-container {
  width: 100%;
  height: 100%;
  background-color: #03060c;
  color: #cbd5e1;
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
.global-legend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #94a3b8;
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
  grid-template-columns: repeat(3, 1fr);
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
  animation: fadeSlideUp 0.5s ease both;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
  opacity: 0.4;
}
.stat-card:hover {
  border-color: #1e3a5f;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.stat-card:nth-child(1) {
  animation-delay: 0s;
}
.stat-card:nth-child(2) {
  animation-delay: 0.1s;
}
.stat-card:nth-child(3) {
  animation-delay: 0.2s;
}

.stat-lbl {
  font-size: 11px;
  color: #94a3b8;
  font-weight: bold;
  margin-bottom: 2px;
}
.stat-val {
  font-size: 22px;
  font-weight: bold;
  letter-spacing: -0.5px;
  animation: pulseGlow 3s ease-in-out infinite;
}
.stat-val small {
  font-size: 11px;
  font-weight: normal;
  margin-left: 3px;
  color: #94a3b8;
}

/* 大屏布局 */
.business-main-layout {
  display: flex;
  flex: 1;
  gap: 14px;
  height: calc(100% - 130px);
  min-height: 0;
}
.two-col-layout .width-60 {
  width: 60%;
}
.two-col-layout .width-40 {
  width: 40%;
}
.business-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
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
  border-left: 3px solid #94a3b8;
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
  font-size: 9px;
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
  font-size: 9px;
  color: #94a3b8;
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
  color: #4e6890;
}
.card-id-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 4px 0;
  font-size: 9px;
  flex-wrap: wrap;
}
.card-id-row .id-tag {
  color: #94a3b8;
  background: #070c14;
  padding: 1px 5px;
  border-radius: 2px;
  border: 1px solid #172438;
}
.health-score {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: 2px;
  font-weight: bold;
}
.health-excellent {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
}
.health-warning {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
}
.health-critical {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.anomaly-tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: 2px;
  font-weight: bold;
  font-size: 9px;
}
.anomaly-yes {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.anomaly-no {
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.card-time-row {
  margin-top: 4px;
  font-size: 9px;
  color: #94a3b8;
  padding: 2px 4px;
  background: #070c14;
  border-radius: 2px;
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
  border-left: 3px solid #3b82f6;
  border-radius: 3px;
  padding: 10px 11px;
  transition: all 0.3s ease;
  animation: fadeSlideUp 0.5s ease both;
  position: relative;
}
.task-group-dashboard:nth-child(1) {
  animation-delay: 0s;
}
.task-group-dashboard:nth-child(2) {
  animation-delay: 0.08s;
}
.task-group-dashboard:nth-child(3) {
  animation-delay: 0.16s;
}
.task-group-dashboard:nth-child(4) {
  animation-delay: 0.24s;
}
.task-group-dashboard:nth-child(5) {
  animation-delay: 0.32s;
}
.task-group-dashboard:hover {
  background: #111b2f;
  border-color: #2d4a7a;
  border-left-color: #60a5fa;
  transform: translateX(3px);
  box-shadow: 0 2px 16px rgba(56, 189, 248, 0.08);
}
.task-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.task-top-meta .qz-title {
  font-size: 12px;
  font-weight: bold;
  color: #e2e8f0;
  letter-spacing: 0.5px;
}
.state-tag {
  font-size: 9px;
  padding: 2px 7px;
  border-radius: 3px;
  background: transparent;
  font-weight: bold;
  letter-spacing: 0.3px;
}
.state-0 {
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.5);
  background: rgba(56, 189, 248, 0.06);
}
.state-1 {
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.5);
  background: rgba(16, 185, 129, 0.06);
}
.state-2 {
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.06);
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
/* 作战群组 — 任务名称行 */
.task-rwmc-row {
  font-size: 10px;
  color: #facc15;
  padding: 4px 6px;
  background: rgba(250, 204, 21, 0.06);
  border: 1px solid rgba(250, 204, 21, 0.12);
  border-radius: 2px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}
.rwmc-text {
  font-weight: bold;
  letter-spacing: 0.3px;
}

/* 作战群组 — 编组平台区域 */
.platform-section {
  background: #070c14;
  border-radius: 2px;
  padding: 5px 6px;
  margin-bottom: 4px;
}
.pl-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.pl-header-lbl {
  font-size: 9px;
  color: #94a3b8;
}
.online-badge {
  font-size: 9px;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 1px 7px;
  border-radius: 3px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  font-weight: bold;
}
.pl-tags-wrap {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}
.pl-tags-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  flex: 1;
  max-height: 36px;
  overflow: hidden;
}
.pl-tag {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 2px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
.tag-online {
  color: #a7f3d0;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.2);
}
.tag-offline {
  color: #94a3b8;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.15);
}
.pl-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-online {
  background: #10b981;
  box-shadow: 0 0 3px rgba(16, 185, 129, 0.5);
}
.dot-offline {
  background: #94a3b8;
}
.pl-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pl-more-btn {
  font-size: 9px;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 2px 6px;
  border-radius: 2px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.pl-more-btn:hover {
  background: rgba(56, 189, 248, 0.2);
}

/* 作战群组 — 时间单行 */
.time-period-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 9px;
  padding: 3px 0;
}
.tp-item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.tp-sep {
  width: 1px;
  height: 10px;
  background: #1e293b;
  flex-shrink: 0;
}
.tp-val {
  font-weight: bold;
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
  animation: fadeSlideUp 0.5s ease both;
  transition: all 0.3s ease;
}
.sync-compact-row:nth-child(1) {
  animation-delay: 0s;
}
.sync-compact-row:nth-child(2) {
  animation-delay: 0.08s;
}
.sync-compact-row:nth-child(3) {
  animation-delay: 0.16s;
}
.sync-compact-row:hover {
  border-color: #1e3a5f;
  transform: translateX(2px);
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
  color: #94a3b8;
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
  animation: fadeSlideUp 0.5s ease both;
  transition: all 0.3s ease;
}
.service-mesh-card:nth-child(1) {
  animation-delay: 0s;
}
.service-mesh-card:nth-child(2) {
  animation-delay: 0.08s;
}
.service-mesh-card:nth-child(3) {
  animation-delay: 0.16s;
}
.service-mesh-card:nth-child(4) {
  animation-delay: 0.24s;
}
.service-mesh-card:hover {
  border-color: #2d4a7a;
  transform: translateY(-1px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
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
  font-size: 9px;
}
.status-light {
  font-size: 9px;
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
  color: #94a3b8;
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
  font-size: 9px;
  display: flex;
}
.contract-node .c-lbl {
  color: #94a3b8;
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
  color: #94a3b8 !important;
}
</style>

<style>
/* el-popover 深色主题 — 全局样式 */
.dark-pl-popover {
  background: #0d1522 !important;
  border: 1px solid #1e2d4a !important;
  border-radius: 4px !important;
  padding: 8px 10px !important;
  max-height: 200px;
  overflow-y: auto;
}
.dark-pl-popover .popper__arrow {
  display: none !important;
}
.dark-pl-popover .popover-pl-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dark-pl-popover .popover-pl-item {
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 4px;
  border-radius: 2px;
}
.dark-pl-popover .popover-pl-item:hover {
  background: rgba(56, 189, 248, 0.06);
}
</style>
