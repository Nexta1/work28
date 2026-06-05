<template>
  <div class="screen-container">
    <div class="top-search-header">
      <div class="search-flex">
        <span class="hub-title">
          <Icon
            icon="lucide:map"
            :size="18"
            style="vertical-align: middle; margin-right: 6px"
          />
          作战筹划信息获取与数据链保障需求生成
        </span>

        <div class="search-item">
          <label>作战任务名称</label>
          <el-input
            v-model="queryParam.RWMC"
            @input="loadZzrwxxList"
            placeholder="输入任务名称搜索..."
            style="width: 260px"
            size="small"
          />
        </div>
      </div>

      <div class="monitor-legend">
        <el-button
          type="info"
          size="mini"
          class="action-btn"
          @click="initGlobalDashboard"
        >
          <Icon
            icon="lucide:refresh-cw"
            :size="13"
            style="vertical-align: middle; margin-right: 4px"
          />
          同步全要素数据源
        </el-button>
      </div>
    </div>

    <div class="main-body-layout">
      <div class="left-tree-panel">
        <div class="panel-header-summary">
          <span class="title">
            <Icon
              icon="lucide:swords"
              :size="16"
              style="vertical-align: middle; margin-right: 4px"
            />
            作战任务源
          </span>
          <span class="badge font-num text-cyan">{{ rwxxList.length }} 项</span>
        </div>

        <div class="task-scroll-box">
          <div
            v-for="rw in rwxxList"
            :key="rw.ZZRWXXID || rw.ZZRWID"
            class="task-item-card"
            :class="taskCardActiveClass(rw)"
            @click="handleSelectRw(rw)"
          >
            <div class="task-card-header">
              <span class="rw-title ellipsis-text" :title="rw.RWMC || rw.rwmc">
                <Icon
                  icon="lucide:layers"
                  :size="12"
                  style="color: var(--color-primary); margin-right: 4px"
                />
                {{ rw.RWMC || rw.rwmc }}
              </span>
              <span
                class="status-tag"
                :class="rw.STATE === 1 ? 'tag-active' : 'tag-pending'"
              >
                {{ rw.STATE === 1 ? '已启用' : '待命' }}
              </span>
            </div>

            <div class="task-card-body">
              <div class="meta-grid">
                <div>
                  任务ID:
                  <span class="text-blue font-num">{{
                    rw.ZZRWID || rw.zzrwid
                  }}</span>
                </div>
                <div>
                  信息ID:
                  <span class="text-cyan font-num">{{
                    rw.ZZRWXXID || rw.zzrwxxid
                  }}</span>
                </div>
                <div>
                  领域:
                  <span class="text-green">{{ rw.SSLY || '未划分' }}</span>
                </div>
                <div>
                  优先级:
                  <span class="text-orange">{{
                    yxjMap[rw.RWYXJ] || rw.RWYXJ || '常态'
                  }}</span>
                </div>
                <div>
                  开始时间:
                  <span>{{ formatStartTime(rw.STARTTIME) }}</span>
                </div>
                <div>
                  任务时长:
                  <span class="text-cyan font-num">{{
                    formatTaskDuration(rw.RWSJ)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-combined-panel">
        <div class="right-bottom-strategy-zone">
          <el-tabs
            v-model="activeTab"
            class="dark-tabs fill-tabs"
            @tab-click="handleTabClick"
          >
            <el-tab-pane name="platformTreeTab" class="full-pane">
              <span slot="label">
                <Icon
                  icon="lucide:network"
                  :size="14"
                  style="vertical-align: middle; margin-right: 4px"
                />
                体系编成编组拓扑
              </span>

              <div class="pane-content-box echarts-layout-box">
                <div
                  v-if="!selectedRw"
                  class="sub-empty"
                  style="padding-top: 80px; width: 100%"
                >
                  <Icon
                    icon="lucide:info"
                    :size="16"
                    style="vertical-align: middle; margin-right: 4px"
                  />
                  请先在左侧选择一个作战任务，以同步渲染编成架构。
                </div>
                <div
                  v-if="selectedRw && !hasPlatformData"
                  class="sub-empty"
                  style="padding-top: 80px; width: 100%"
                >
                  该任务暂无挂载的编成编组数据。
                </div>

                <div
                  v-show="selectedRw && hasPlatformData"
                  class="topology-flex-container"
                >
                  <div ref="treeChartRef" class="chart-split-dom"></div>

                  <div class="tree-directory-panel">
                    <div class="panel-inner-title">
                      <Icon
                        icon="lucide:git-merge"
                        :size="14"
                        style="vertical-align: middle; margin-right: 4px"
                      />
                      编成节点树
                    </div>
                    <div class="tree-scroll-container">
                      <el-tree
                        :data="platformTreeNodes"
                        :props="treeDefaultProps"
                        node-key="ZZRWPTID"
                        default-expand-all
                        :expand-on-click-node="false"
                        highlight-current
                        @node-click="handleNodeClick"
                        class="dark-el-tree"
                      >
                        <span class="custom-tree-node" slot-scope="{data}">
                          <span class="node-icon">
                            <Icon
                              icon="lucide:orbit"
                              :size="13"
                              style="color: var(--color-cyan)"
                            />
                          </span>
                          <span
                            class="node-text ellipsis-text"
                            :title="data.PTMC"
                            >{{ data.PTMC || '未命名平台' }}</span
                          >
                        </span>
                      </el-tree>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane name="routeInfoTab" class="full-pane">
              <span slot="label">
                <Icon
                  icon="lucide:route"
                  :size="14"
                  style="vertical-align: middle; margin-right: 4px"
                />
                任务编排路线
                <small class="text-cyan font-num" v-if="selectedRw"
                  >({{ routeList.length }} 条)</small
                >
              </span>

              <div class="pane-content-box split-vertical-layout">
                <template>
                  <div class="upper-detail-dashboard">
                    <div class="dash-inner-header">
                      <span>
                        <Icon
                          icon="lucide:activity"
                          :size="14"
                          style="
                            vertical-align: middle;
                            margin-right: 4px;
                            color: var(--color-cyan);
                          "
                        />
                        路线三维节点流明细
                      </span>
                      <span
                        v-if="routeLoading"
                        class="text-cyan font-num loader-text"
                        >数据加载中...</span
                      >
                    </div>
                    <div v-if="activeRouteDetail" class="dash-grid-content">
                      <div>
                        路线名称:
                        <span class="text-white">{{
                          activeRouteDetail.routeName ||
                          activeRouteDetail.QYMC ||
                          activeRouteDetail.qymc
                        }}</span>
                      </div>
                      <div>
                        唯一流水:
                        <span class="text-blue font-num"
                          >#{{
                            activeRouteDetail.routeId ||
                            activeRouteDetail.ZZQYID ||
                            activeRouteDetail.zzqyid
                          }}</span
                        >
                      </div>
                      <div>
                        类型体系:
                        <span class="text-green">{{
                          activeRouteDetail.typeName || '空中保障路线'
                        }}</span>
                      </div>
                      <div>
                        绑定任务:
                        <span class="text-cyan">{{
                          activeRouteDetail.RWMC || activeRouteDetail.rwmc
                        }}</span>
                      </div>
                      <div>
                        作战ID:
                        <span class="font-num text-orange"
                          >#{{
                            activeRouteDetail.ZZRWID || activeRouteDetail.zzrwid
                          }}</span
                        >
                      </div>
                      <div>
                        更新时间:
                        <span class="font-num text-gray">{{
                          activeRouteDetail.opTime || 'N/A'
                        }}</span>
                      </div>

                      <div
                        class="full-row parse-box"
                        v-if="
                          activeRouteDetail.routePoints &&
                          activeRouteDetail.routePoints.length > 0
                        "
                      >
                        <span class="text-cyan">
                          <Icon
                            icon="lucide:navigation"
                            :size="13"
                            style="vertical-align: middle; margin-right: 4px"
                          />
                          战术时序三维路径链 (按序号排序):
                        </span>
                        <div class="points-flex-wrap">
                          <span
                            v-for="pt in sortedRoutePoints(
                              activeRouteDetail.routePoints
                            )"
                            :key="pt.routePointId"
                            class="coord-tag"
                          >
                            <small class="text-gray"
                              >[{{ pt.pointIndex }}]</small
                            >
                            {{ pt.JD }}, {{ pt.WD }}
                            <span style="color: #a855f7">(↑{{ pt.GD }}m)</span>
                          </span>
                        </div>
                      </div>
                      <div class="full-row text-gray">
                        路线战略备忘录:
                        <span class="text-white">{{
                          activeRouteDetail.routeMemo || '暂无说明信息'
                        }}</span>
                      </div>
                    </div>
                    <div v-else class="dash-empty-tip">
                      请在下方列表中任意单击一行路线，以纵向占满调取全量三维轨迹链
                    </div>
                  </div>

                  <div class="lower-scroll-list-container fill-remaining-space">
                    <div
                      v-if="routeList.length === 0"
                      class="sub-empty"
                      style="padding: 20px 0"
                    >
                      当前任务未检索到关联路线
                    </div>
                    <div v-else class="route-grid-box">
                      <div
                        v-for="route in routeList"
                        :key="route.ZZQYID || route.zzqyid || route.routeId"
                        class="link-status-card compact-card interactive-row"
                        :class="{
                          'row-selected':
                            activeRouteDetail &&
                            (activeRouteDetail.routeId === route.routeId ||
                              activeRouteDetail.ZZQYID === route.ZZQYID)
                        }"
                        @click="fetchRouteDetailData(route)"
                      >
                        <div class="alarm-strip strip-level-safe"></div>
                        <div class="card-line">
                          <span class="wl-name ellipsis-text">
                            <Icon
                              icon="lucide:milestone"
                              :size="13"
                              style="
                                vertical-align: middle;
                                margin-right: 4px;
                                color: var(--color-primary);
                              "
                            />
                            {{ route.routeName || route.QYMC || route.qymc }}
                          </span>
                          <span class="status-tag tag-active"
                            >#{{
                              route.routeId || route.ZZQYID || route.zzqyid
                            }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </el-tab-pane>

            <el-tab-pane name="qyTab" class="full-pane">
              <span slot="label">
                <Icon
                  icon="lucide:globe"
                  :size="14"
                  style="vertical-align: middle; margin-right: 4px"
                />
                空间地理区域
                <small class="text-orange font-num" v-if="selectedRw"
                  >({{ qyList.length }} 域)</small
                >
              </span>

              <div class="pane-content-box split-vertical-layout">
                <template>
                  <div
                    class="upper-detail-dashboard"
                    style="border-left: 3px solid #f59e0b"
                  >
                    <div
                      class="dash-inner-header"
                      style="color: var(--color-warning)"
                    >
                      <span>
                        <Icon
                          icon="lucide:map-pin"
                          :size="14"
                          style="vertical-align: middle; margin-right: 4px"
                        />
                        空间区域原始要素明细
                      </span>
                      <span
                        v-if="areaLoading"
                        class="text-orange font-num loader-text"
                        >数据加载中...</span
                      >
                    </div>
                    <div v-if="activeQyDetail" class="dash-grid-content">
                      <div>
                        区域名称:
                        <span class="text-orange">{{
                          activeQyDetail.QYMC || activeQyDetail.qymc
                        }}</span>
                      </div>
                      <div>
                        区域内码:
                        <span class="text-white font-num">{{
                          activeQyDetail.QYNM || activeQyDetail.qynm
                        }}</span>
                      </div>
                      <div>
                        特征属性:
                        <span class="text-blue">{{
                          activeQyDetail.QYLX ||
                          activeQyDetail.qylx ||
                          '空间拦截'
                        }}</span>
                      </div>
                      <div>
                        地理唯一ID:
                        <span class="text-cyan font-num"
                          >#{{
                            activeQyDetail.ZZQYID || activeQyDetail.zzqyid
                          }}</span
                        >
                      </div>
                      <div>
                        所属任务:
                        <span class="text-green">{{
                          activeQyDetail.RWMC || activeQyDetail.rwmc
                        }}</span>
                      </div>
                      <div>
                        任务内码:
                        <span class="text-gray font-num"
                          >#{{
                            activeQyDetail.ZZRWID || activeQyDetail.zzrwid
                          }}</span
                        >
                      </div>

                      <div
                        class="full-row parse-box"
                        style="border-top: 1px dashed #3a2a18"
                        v-if="
                          parseQyxz(activeQyDetail.QYXZ || activeQyDetail.qyxz)
                        "
                      >
                        <span class="text-orange">
                          <Icon
                            icon="lucide:component"
                            :size="13"
                            style="vertical-align: middle; margin-right: 4px"
                          />
                          围栏多边形顶点阵列:
                        </span>
                        <span class="font-num text-white">
                          [垂直净空高度:
                          {{
                            parseQyxz(
                              activeQyDetail.QYXZ || activeQyDetail.qyxz
                            ).altitude_range
                          }}m]
                          <span
                            v-for="(coord, idx) in parseQyxz(
                              activeQyDetail.QYXZ || activeQyDetail.qyxz
                            ).boundary_coordinates"
                            :key="idx"
                            class="coord-tag org-tag"
                          >
                            [{{ coord.longitude }}, {{ coord.latitude }}]
                          </span>
                        </span>
                      </div>
                      <div class="full-row text-gray">
                        全局战略描述:
                        <span class="text-white">{{
                          activeQyDetail.MS ||
                          activeQyDetail.ms ||
                          '未填充具体战略描述说明'
                        }}</span>
                      </div>
                    </div>
                    <div v-else class="dash-empty-tip">
                      请在下方列表中任意单击一行区域，以纵向占满调取态势数据
                    </div>
                  </div>

                  <div class="lower-scroll-list-container fill-remaining-space">
                    <div
                      v-if="qyList.length === 0"
                      class="sub-empty"
                      style="padding: 20px 0"
                    >
                      当前任务未检索到关联区域
                    </div>
                    <div class="route-grid-box">
                      <div
                        v-for="qy in qyList"
                        :key="qy.ZZQYID || qy.zzqyid"
                        class="link-status-card compact-card interactive-row"
                        :class="{
                          'row-selected-orange':
                            activeQyDetail &&
                            (activeQyDetail.ZZQYID === qy.ZZQYID ||
                              activeQyDetail.zzqyid === qy.zzqyid)
                        }"
                        @click="fetchAreaDetailData(qy)"
                      >
                        <div class="card-line">
                          <span class="wl-name text-orange ellipsis-text">
                            <Icon
                              icon="lucide:radar"
                              :size="13"
                              style="vertical-align: middle; margin-right: 4px"
                            />
                            {{ qy.QYMC || qy.qymc }}
                          </span>
                          <span
                            class="text-gray font-num"
                            style="font-size: 11px"
                            >内码: {{ qy.QYNM || qy.qynm }}</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </el-tab-pane>

            <el-tab-pane name="sslrwTab" class="full-pane">
              <span slot="label">
                <Icon
                  icon="lucide:zap"
                  :size="14"
                  style="vertical-align: middle; margin-right: 4px"
                />
                杀伤链任务
                <small class="text-green font-num" v-if="selectedRw"
                  >({{ sslrwList.length }} 链)</small
                >
              </span>

              <div class="pane-content-box sslrw-stream-container">
                <div
                  v-if="!selectedRw"
                  class="sub-empty"
                  style="padding-top: 60px"
                >
                  <Icon
                    icon="lucide:info"
                    :size="16"
                    style="vertical-align: middle; margin-right: 4px"
                  />
                  请先在左侧选择一个作战任务，以自动加载关联的杀伤链全量网格
                </div>

                <template v-else>
                  <div
                    v-if="sslrwList.length === 0"
                    class="sub-empty"
                    style="padding-top: 60px"
                  >
                    当前任务未检索到任何挂载的杀伤链协同网络。
                  </div>

                  <div class="killchain-scroll-wall">
                    <div
                      v-for="chain in sslrwList"
                      :key="chain.SSLRWID || chain.sslrwid"
                      class="killchain-two-col-card"
                    >
                      <div class="kc-left-summary-col">
                        <div class="kc-card-badge">
                          <span class="pulse-dot"></span>
                          <span
                            >杀伤链 #{{ chain.SSLRWID || chain.sslrwid }}</span
                          >
                        </div>
                        <h4
                          class="kc-task-title ellipsis-text"
                          :title="chain.RWMC || chain.rwmc"
                        >
                          {{ chain.RWMC || chain.rwmc }}
                        </h4>

                        <div class="kc-meta-kv-list">
                          <div class="kv-row">
                            <span class="k">主控任务ID:</span>
                            <span class="v font-num text-cyan"
                              >#{{ chain.ZZRWID || chain.zzrwid }}</span
                            >
                          </div>
                          <div class="kv-row">
                            <span class="k">系统时间戳:</span>
                            <span
                              class="v font-num text-gray"
                              style="font-size: 11px"
                              >{{ chain.TIME || 'N/A' }}</span
                            >
                          </div>
                          <div class="kv-row">
                            <span class="k">同步时间:</span>
                            <span
                              class="v font-num text-orange"
                              style="font-size: 11px"
                              >{{ chain.opTime || 'N/A' }}</span
                            >
                          </div>
                        </div>
                      </div>

                      <div class="kc-right-ooda-grid-col">
                        <div class="ooda-cell border-red">
                          <div class="cell-top">
                            <Icon
                              icon="lucide:crosshair"
                              :size="13"
                              class="icon"
                              style="color: var(--color-danger)"
                            />
                            <span class="label text-red">敌方目标平台</span>
                            <span class="ids font-num"
                              >ID:[{{
                                chain.DFPTIDS || chain.dfptids || '无'
                              }}]</span
                            >
                          </div>
                          <div class="cell-bottom text-white">
                            {{
                              chain.DFPTMCS ||
                              chain.dfptmcs ||
                              '暂无对抗平台记录'
                            }}
                          </div>
                        </div>

                        <div class="ooda-cell border-cyan">
                          <div class="cell-top">
                            <Icon
                              icon="lucide:eye"
                              :size="13"
                              class="icon"
                              style="color: var(--color-cyan)"
                            />
                            <span class="label text-cyan">传感器平台</span>
                            <span class="ids font-num"
                              >ID:[{{
                                chain.CGQPTIDS || chain.cgqptids || '无'
                              }}]</span
                            >
                          </div>
                          <div class="cell-bottom text-white">
                            {{
                              chain.CGQPTMCS ||
                              chain.cgqptmcs ||
                              '暂无情报引导平台'
                            }}
                          </div>
                        </div>

                        <div class="ooda-cell border-orange">
                          <div class="cell-top">
                            <Icon
                              icon="lucide:brain"
                              :size="13"
                              class="icon"
                              style="color: var(--color-warning)"
                            />
                            <span class="label text-orange">核心决策平台</span>
                            <span class="ids font-num"
                              >ID:[{{
                                chain.JCPTIDS || chain.jcptids || '无'
                              }}]</span
                            >
                          </div>
                          <div class="cell-bottom text-white">
                            {{
                              chain.JCPTMCS ||
                              chain.jcptmcs ||
                              '暂无主控指挥节点'
                            }}
                          </div>
                        </div>

                        <div class="ooda-cell border-green">
                          <div class="cell-top">
                            <Icon
                              icon="lucide:rocket"
                              :size="13"
                              class="icon"
                              style="color: var(--color-success)"
                            />
                            <span class="label text-green">远程武器平台</span>
                            <span class="ids font-num"
                              >ID:[{{
                                chain.WQPTIDS || chain.wqptids || '无'
                              }}]</span
                            >
                          </div>
                          <div class="cell-bottom text-white">
                            {{
                              chain.WQPTMCS ||
                              chain.wqptmcs ||
                              '暂无火力打击节点'
                            }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </el-tab-pane>
            <el-tab-pane name="mbTab" class="full-pane">
              <span slot="label">
                <Icon
                  icon="lucide:crosshair"
                  :size="14"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-danger);
                  "
                />
                作战敌方目标
              </span>
              <div class="pane-content-box" style="height: 100%">
                <mbxx-manager
                  :selected-task="selectedRw"
                  :platformTreeNodes="platformTreeNodes"
                />
              </div>
            </el-tab-pane>
            <el-tab-pane name="dataLinkTab" class="full-pane">
              <span slot="label">
                <Icon
                  icon="lucide:file-output"
                  :size="14"
                  style="
                    vertical-align: middle;
                    margin-right: 4px;
                    color: var(--color-primary);
                  "
                />
                数据链保障需求生成
              </span>
              <div class="pane-content-box" style="height: 100%">
                <zzrw-wl-manager
                  :selected-task="selectedRw"
                  :platformTreeNodes="platformTreeNodes"
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>

    <el-dialog
      title="平台全要素战略态势核心指标大盘"
      :visible.sync="detailDialogVisible"
      width="780px"
      append-to-body
      custom-class="dark-dialog-clean"
    >
      <div v-if="activeNodeMeta" class="grid-detail-container">
        <div class="detail-block full-width">
          <div class="db-title">
            <Icon
              icon="lucide:anchor"
              :size="14"
              style="
                vertical-align: middle;
                margin-right: 4px;
                color: var(--color-primary);
              "
            />
            核心链属关系与通联头标
          </div>
          <div class="db-grid col-3">
            <div>
              平台名称:
              <span class="text-white font-bold">{{
                activeNodeMeta.PTMC || 'N/A'
              }}</span>
            </div>
            <div>
              上级名称:
              <span class="text-orange">{{
                activeNodeMeta.PARENTPTMC || '无 (根控主单元)'
              }}</span>
            </div>
            <div>
              作战任务:
              <span class="text-green">{{ activeNodeMeta.RWMC || 'N/A' }}</span>
            </div>
            <div>
              平台标识:
              <span class="text-cyan font-num">{{
                activeNodeMeta.PTBSH || 'N/A'
              }}</span>
            </div>
            <div>
              平台类型:
              <span class="text-white font-num">{{
                activeNodeMeta.PTLX || 'N/A'
              }}</span>
            </div>
            <div>
              分域指控:
              <span class="text-orange font-num">{{
                activeNodeMeta.PTFY || 'N/A'
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-block full-width">
          <div class="db-title">
            <Icon
              icon="lucide:settings"
              :size="14"
              style="
                vertical-align: middle;
                margin-right: 4px;
                color: var(--color-cyan);
              "
            />
            底层流水线 ID 链核验 (全量)
          </div>
          <div class="db-grid col-3">
            <div>
              任务平台标识:
              <span class="text-cyan font-num"
                >#{{ activeNodeMeta.ZZRWPTID }}</span
              >
            </div>
            <div>
              平台ID:
              <span class="text-blue font-num">{{ activeNodeMeta.PTID }}</span>
            </div>
            <div>
              任务ID:
              <span class="text-blue font-num">{{
                activeNodeMeta.ZZRWID
              }}</span>
            </div>
            <div>
              上级任务平台:
              <span class="font-num">{{
                activeNodeMeta.PARENTZZRWPTID || 'N/A'
              }}</span>
            </div>
            <div>
              上级平台ID:
              <span class="font-num">{{
                activeNodeMeta.PARENTPTID || 'N/A'
              }}</span>
            </div>
            <div>
              型号标识:
              <span class="font-num">{{ activeNodeMeta.PTXHID || 'N/A' }}</span>
            </div>
            <div class="col-span-3">
              型号名称:
              <span class="text-white">{{
                activeNodeMeta.PTXHMC || 'N/A'
              }}</span>
            </div>
          </div>
        </div>

        <div class="detail-block full-width">
          <div class="db-title">
            <Icon
              icon="lucide:sliders"
              :size="14"
              style="
                vertical-align: middle;
                margin-right: 4px;
                color: var(--color-warning);
              "
            />
            空间轨迹、航向与三维动力参数
          </div>
          <div class="db-grid col-3">
            <div>
              真实经度:
              <span class="text-blue font-num"
                >{{ activeNodeMeta.PTJD || '0.0' }} °</span
              >
            </div>
            <div>
              真实纬度:
              <span class="text-blue font-num"
                >{{ activeNodeMeta.PTWD || '0.0' }} °</span
              >
            </div>
            <div>
              基准高度:
              <span class="text-cyan font-num"
                >{{ activeNodeMeta.PTGD || '0' }} m</span
              >
            </div>
            <div>
              动能速度:
              <span class="text-green font-num"
                >{{ activeNodeMeta.PTSD || '0' }} m/s</span
              >
            </div>
            <div>
              规划航向:
              <span class="text-orange font-num"
                >{{ activeNodeMeta.PTHX || '0' }} °</span
              >
            </div>
            <div>
              规划航高:
              <span class="text-orange font-num"
                >{{ activeNodeMeta.PTHG || '0' }} m</span
              >
            </div>
          </div>
        </div>

        <div class="detail-block full-width">
          <div class="db-title">
            <Icon
              icon="lucide:clock"
              :size="14"
              style="
                vertical-align: middle;
                margin-right: 4px;
                color: var(--color-text-main);
              "
            />
            战术时序特征
          </div>
          <div class="db-grid col-2">
            <div>
              平台时间戳:
              <span class="text-gray font-num">{{
                activeNodeMeta.PTSJ || 'N/A'
              }}</span>
            </div>
            <div>
              操作时间:
              <span class="text-gray font-num">{{
                activeNodeMeta.opTime || 'N/A'
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button
          size="mini"
          type="primary"
          class="action-btn"
          @click="detailDialogVisible = false"
        >
          完成全量数据校验
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import {
  taskGetPage,
  getOrganizationByTaskId,
  getRoutePage,
  getRouteDetail,
  areaGetPage,
  getAreaDetail
  // 💡 引入您的 sslrw 接口
} from '@/api/task'
import {sslrw} from '@/api/killchain'
import {getYXJMap} from '@/api/map'
import {buildTree} from '@/utils'
import * as echarts from 'echarts'
import ZzrwWlManager from '../components/ZzrwWlManager.vue' // 引入外部保障需求管理组件
import MbxxManager from '../components/MbxxManager.vue' // 引入外部保障需求管理组件

export default {
  name: 'ZzrwOrchestrationDashboard',
  components: {
    ZzrwWlManager,
    MbxxManager
  },
  data() {
    return {
      activeTab: 'platformTreeTab',
      rwxxList: [],
      routeList: [],
      qyList: [],
      sslrwList: [],
      platformTreeNodes: [],
      selectedRw: null,
      chartInstance: null,
      activeRouteDetail: null,
      activeQyDetail: null,
      activeSslrwDetail: null,
      routeLoading: false,
      areaLoading: false,
      detailDialogVisible: false,
      activeNodeMeta: null,
      queryParam: {RWMC: ''},
      treeDefaultProps: {children: 'children', label: 'PTMC'},
      yxjMap: getYXJMap ? getYXJMap() : {1: '低', 2: '重要', 3: '高'}
    }
  },
  computed: {
    hasPlatformData() {
      return this.platformTreeNodes && this.platformTreeNodes.length > 0
    }
  },
  mounted() {
    this.initGlobalDashboard()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.chartInstance) this.chartInstance.dispose()
  },
  methods: {
    initGlobalDashboard() {
      this.loadZzrwxxList()
    },
    loadZzrwxxList() {
      taskGetPage({
        pageNum: 1,
        pageSize: 10,
        params: {RWMC: this.queryParam.RWMC || undefined}
      }).then(res => {
        this.rwxxList = res.data?.list || res.data || []
        if (this.rwxxList.length > 0) this.handleSelectRw(this.rwxxList[0])
      })
    },
    handleSelectRw(rw) {
      this.selectedRw = rw
      this.routeList = []
      this.qyList = []
      this.sslrwList = []
      this.platformTreeNodes = []
      this.activeRouteDetail = null
      this.activeQyDetail = null
      this.activeSslrwDetail = null

      this.loadPlatformTreeData()
      this.loadRoutePageData()
      this.loadQyPageData()
      this.loadsslrwData() // ⚡ 点击任务联动调用杀伤链
    },
    loadPlatformTreeData() {
      if (!this.selectedRw) return
      getOrganizationByTaskId(
        this.selectedRw.ZZRWID || this.selectedRw.zzrwid
      ).then(res => {
        const rawData = res.data?.list || res.data || []
        const treeResult = buildTree(rawData)
        this.platformTreeNodes = Array.isArray(treeResult)
          ? treeResult
          : [treeResult].filter(Boolean)
        if (this.activeTab === 'platformTreeTab') {
          this.$nextTick(() => {
            setTimeout(() => {
              this.initEChartsTree()
            }, 60)
          })
        }
      })
    },
    loadRoutePageData() {
      getRoutePage({
        pageNum: 1,
        pageSize: 9999,
        params: {RWMC: this.selectedRw.RWMC || this.selectedRw.rwmc}
      }).then(res => {
        this.routeList = res.data?.list || res.data || []
      })
    },
    loadQyPageData() {
      areaGetPage({
        pageNum: 1,
        pageSize: 9999,
        params: {RWMC: this.selectedRw.RWMC || this.selectedRw.rwmc}
      }).then(res => {
        this.qyList = res.data?.list || res.data || []
      })
    },
    /**
     * ⚡ 调用杀伤链核心接口
     */
    loadsslrwData() {
      if (!this.selectedRw) return
      const payload = {
        pageNum: 1,
        pageSize: 10,
        params: {
          RWMC: this.selectedRw.RWMC || this.selectedRw.rwmc,
          ZZRWID: this.selectedRw.ZZRWID || this.selectedRw.zzrwid
        }
      }
      sslrw(payload)
        .then(res => {
          this.sslrwList = res.data?.list || res.data?.records || []
        })
        .catch(() => {
          this.sslrwList = []
        })
    },
    fetchRouteDetailData(route) {
      const id = route.routeId || route.ZZQYID || route.zzqyid
      if (!id) return
      this.routeLoading = true
      getRouteDetail(id)
        .then(res => {
          this.activeRouteDetail = res.data || res || route
        })
        .finally(() => {
          this.routeLoading = false
        })
    },
    fetchAreaDetailData(qy) {
      const id = qy.ZZQYID || qy.zzqyid
      if (!id) return
      this.areaLoading = true
      getAreaDetail(id)
        .then(res => {
          this.activeQyDetail = res.data || res || qy
        })
        .finally(() => {
          this.areaLoading = false
        })
    },
    sortedRoutePoints(points) {
      if (!Array.isArray(points)) return []
      return [...points].sort(
        (a, b) => (a.pointIndex || 0) - (b.pointIndex || 0)
      )
    },
    parseQyxz(qyxzStr) {
      if (!qyxzStr) return null
      try {
        if (typeof qyxzStr === 'object') return qyxzStr
        return JSON.parse(qyxzStr)
      } catch (e) {
        return null
      }
    },
    initEChartsTree() {
      if (!this.$refs.treeChartRef || !this.hasPlatformData) return
      if (this.chartInstance) {
        this.chartInstance.dispose()
        this.chartInstance = null
      }
      this.chartInstance = echarts.init(this.$refs.treeChartRef)
      this.chartInstance.on('click', params => {
        if (params.data && params.data.rawSource)
          this.openDetailDialog(params.data.rawSource)
      })
      const convertToChartNode = bNode => {
        if (!bNode) return null
        return {
          name: bNode.PTMC || `ID: ${bNode.PTID}`,
          rawSource: bNode,
          children: Array.isArray(bNode.children)
            ? bNode.children.map(c => convertToChartNode(c)).filter(Boolean)
            : []
        }
      }
      const chartData = this.platformTreeNodes
        .map(item => convertToChartNode(item))
        .filter(Boolean)
      this.chartInstance.setOption(
        {
          tooltip: {
            trigger: 'item',
            backgroundColor: '#0a1220',
            borderColor: '#1e3a5f',
            textStyle: {color: '#cbd5e1', fontSize: 11}
          },
          series: [
            {
              type: 'tree',
              data: chartData,
              top: '8%',
              left: '16%',
              bottom: '8%',
              right: '16%',
              symbol: 'circle',
              symbolSize: 10,
              edgeShape: 'polyline',
              label: {
                position: 'left',
                verticalAlign: 'middle',
                align: 'right',
                fontSize: 11,
                color: '#fff',
                backgroundColor: '#111c30',
                padding: [4, 8],
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#1e3557'
              },
              leaves: {label: {position: 'right', align: 'left'}}
            }
          ]
        },
        true
      )
    },
    handleNodeClick(data) {
      if (data) this.openDetailDialog(data)
    },
    openDetailDialog(metaData) {
      this.activeNodeMeta = metaData
      this.detailDialogVisible = true
    },
    handleTabClick(tab) {
      if (tab.name === 'platformTreeTab') {
        this.$nextTick(() => {
          setTimeout(() => {
            if (this.chartInstance) this.chartInstance.resize()
            else this.initEChartsTree()
          }, 80)
        })
      }
    },
    handleResize() {
      if (this.chartInstance) this.chartInstance.resize()
    },
    taskCardActiveClass(rw) {
      const curId = this.selectedRw
        ? this.selectedRw.ZZRWID || this.selectedRw.zzrwid
        : null
      return {'task-active': curId && curId === (rw.ZZRWID || rw.zzrwid)}
    },
    /**
     * 格式化开始时间（毫秒时间戳转为可读格式）
     */
    formatStartTime(timestamp) {
      if (!timestamp) return '--'
      const date = new Date(Number(timestamp))
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    /**
     * 格式化任务时长（秒转为合适的单位显示）
     * 优化策略：
     * - 小于1分钟：显示秒
     * - 1分钟~1小时：显示分钟
     * - 1小时~24小时：显示小时（+分钟）
     * - 1天~30天：显示天（+小时）
     * - 超过30天：显示天
     */
    formatTaskDuration(seconds) {
      if (!seconds && seconds !== 0) return '--'
      const totalSeconds = Number(seconds / 1000)

      // 小于1分钟，显示秒
      if (totalSeconds < 60) {
        return `${totalSeconds} 秒`
      }

      const minutes = Math.floor(totalSeconds / 60)

      // 小于1小时，显示分钟
      if (minutes < 60) {
        return `${minutes} 分钟`
      }

      const hours = Math.floor(totalSeconds / 3600)

      // 小于24小时，显示小时和剩余分钟
      if (hours < 24) {
        const remainingMinutes = minutes % 60
        return remainingMinutes > 0
          ? `${hours} 小时 ${remainingMinutes} 分钟`
          : `${hours} 小时`
      }

      const days = Math.floor(hours / 24)

      // 小于30天，显示天和剩余小时
      if (days < 30) {
        const remainingHours = hours % 24
        return remainingHours > 0
          ? `${days} 天 ${remainingHours} 小时`
          : `${days} 天`
      }

      // 超过30天，只显示天数
      return `${days} 天`
    }
  }
}
</script>

<style scoped>
.panel-inner-title {
  font-size: 14px;
  font-weight: bold;
}
/* 全局大屏总控 */
.screen-container {
  width: 100%;
  height: 100%;
  color: var(--color-text-main);
  display: flex;
  flex-direction: column;
  padding: 12px;
  box-sizing: border-box;
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
.search-flex {
  display: flex;
  align-items: center;
  gap: 16px;
}
.search-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.search-item label {
  font-size: 11px;
  color: var(--color-text-muted);
}
.action-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  font-size: 11px;
  color: #fff;
}

.main-body-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  gap: 12px;
}
.left-tree-panel {
  width: 370px;
  flex-shrink: 0;
  background: var(--bg-base);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 11px;
  display: flex;
  flex-direction: column;
}
.task-scroll-box {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.right-combined-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.right-bottom-strategy-zone {
  background: var(--bg-base);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.pane-content-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-top: 4px;
}

.split-vertical-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}
.upper-detail-dashboard {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-left: 3px solid var(--color-primary);
  border-radius: 4px;
  padding: 12px;
  flex-shrink: 0;
}
.dash-inner-header {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dash-grid-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 16px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.dash-grid-content .full-row {
  grid-column: span 3;
  border-top: 1px dashed var(--border-dark);
  padding-top: 6px;
  margin-top: 2px;
}
.dash-empty-tip {
  text-align: center;
  font-size: 11px;
  color: var(--color-disabled);
  padding: 20px 0;
}

.parse-box {
  background: var(--bg-input);
  padding: 6px 11px;
  border-radius: 3px;
  border: 1px solid var(--border-dark);
  margin-top: 4px;
}
.points-flex-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.coord-tag {
  background: var(--bg-input);
  color: var(--color-cyan);
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
  display: inline-block;
}
.coord-tag.org-tag {
  background: #2d2215;
  color: var(--color-warning);
}

.lower-scroll-list-container.fill-remaining-space {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  background: rgba(13, 21, 34, 0.2);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 8px;
}
.route-grid-box {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* 杀伤链样式 */
.sslrw-meta-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 4px;
}
.kc-node-block {
  background: var(--bg-input);
  border-left: 3px solid #fff;
  padding: 6px 11px;
  border-radius: 2px;
}
.kc-node-block.border-red {
  border-color: var(--color-danger);
}
.kc-node-block.border-cyan {
  border-color: var(--color-cyan);
}
.kc-node-block.border-orange {
  border-color: var(--color-warning);
}
.kc-node-block.border-green {
  border-color: var(--color-success);
}
.kc-label {
  font-size: 11px;
  font-weight: bold;
  display: block;
  margin-bottom: 2px;
}
.kc-value {
  font-size: 11px;
  color: #fff;
}

.interactive-row {
  cursor: pointer;
}
.interactive-row:hover {
  border-color: var(--color-primary);
  background: var(--bg-hover);
}
.row-selected {
  border-color: var(--color-primary) !important;
  background: var(--bg-panel) !important;
}
.row-selected-orange {
  border-color: var(--color-warning) !important;
  background: #241e17 !important;
}
.row-selected-green {
  border-color: var(--color-success) !important;
  background: #0f2b20 !important;
}

.link-status-card.compact-card {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 3px;
  padding: 11px 12px;
  position: relative;
}
.alarm-strip {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}
.card-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}
.wl-name {
  font-weight: bold;
  color: #fff;
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
  background: var(--bg-panel) !important;
}
.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
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
  color: var(--color-success);
}
.tag-pending {
  background: rgba(245, 158, 11, 0.15);
  color: var(--color-warning);
}
.task-card-body {
  font-size: 11px;
  color: var(--color-text-muted);
}
.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px 8px;
}

.echarts-layout-box {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: row;
}
.topology-flex-container {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 14px;
  flex: 1;
}
.chart-split-dom {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: rgba(13, 21, 34, 0.3);
  border-radius: 4px;
  border: 1px solid var(--border-dark);
}
.tree-directory-panel {
  width: 280px;
  flex-shrink: 0;
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
  display: flex;
  flex-direction: column;
}
.tree-scroll-container {
  flex: 1;
  overflow-y: auto;
}

.dark-el-tree {
  background: transparent;
  color: var(--color-text-main);
}
::v-deep .dark-el-tree .el-tree-node__content {
  height: 28px;
  background: transparent;
}
::v-deep .dark-el-tree .el-tree-node.is-current > .el-tree-node__content {
  background-color: var(--bg-hover) !important;
  color: var(--color-cyan) !important;
}
.custom-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  width: 100%;
  min-width: 0;
}

.panel-header-summary {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid var(--border-dark);
  padding-bottom: 8px;
  flex-shrink: 0;
}
.panel-header-summary .title {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
}
.panel-header-summary .badge {
  font-size: 11px;
  background: rgba(6, 182, 212, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: auto;
}
.sub-empty {
  text-align: center;
  font-size: 11px;
  color: var(--color-disabled);
  width: 100%;
}

/* 全量大弹窗专属暗黑 */
::v-deep .dark-dialog-clean {
  background: var(--bg-input) !important;
  border: 1px solid var(--border-dark);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8) !important;
}
::v-deep .dark-dialog-clean .el-dialog__title {
  color: var(--color-primary);
  font-size: 13px;
  font-weight: bold;
}
::v-deep .dark-dialog-clean .el-dialog__body {
  padding: 14px 20px;
}
.grid-detail-container {
  display: flex;
  flex-direction: column;
  gap: 11px;
  max-height: 520px;
  overflow-y: auto;
}
.detail-block {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 12px;
}
.detail-block.full-width {
  width: 100%;
  box-sizing: border-box;
}
.db-title {
  font-size: 11px;
  font-weight: bold;
  color: var(--color-cyan);
  margin-bottom: 8px;
  border-left: 2px solid var(--color-cyan);
  padding-left: 6px;
}
.db-grid {
  display: grid;
  gap: 6px 12px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.db-grid.col-3 {
  grid-template-columns: repeat(3, 1fr);
}
.db-grid.col-2 {
  grid-template-columns: repeat(2, 1fr);
}
.col-span-3 {
  grid-column: span 3;
}

.font-num {
  font-family: monospace;
}
.font-bold {
  font-weight: bold;
}
.text-white {
  color: #fff !important;
}
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
.text-purple {
  color: #a855f7 !important;
}
.text-yellow {
  color: #eab308 !important;
}
.text-red {
  color: var(--color-danger) !important;
}
.text-gray {
  color: var(--color-disabled) !important;
}
.ellipsis-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* ==========================================================================
   ⚡ 杀伤链全量直显卡片瀑布流 - 两列立体响应式布局样式
   ========================================================================== */
.sslrw-stream-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.killchain-scroll-wall {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-right: 4px;
}

/* 核心两列卡片骨架 */
.killchain-two-col-card {
  background: linear-gradient(135deg, var(--bg-input) 0%, var(--bg-base) 100%);
  border: 1px solid var(--border-dark);
  border-radius: 6px;
  display: grid;
  grid-template-columns: 240px 1fr; /* 左列固定要素，右列宽度自适应撑满 */
  min-height: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: all 0.25s ease;
  overflow: hidden;
}

.killchain-two-col-card:hover {
  border-color: var(--color-success);
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.15);
}

/* 左侧列样式：基本概述舱 */
.kc-left-summary-col {
  background: var(--bg-input);
  border-right: 1px dashed var(--border-dark);
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.kc-card-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  color: var(--color-success);
  font-weight: bold;
  width: max-content;
}

/* 呼吸指示灯 */
.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: var(--color-success);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--color-success);
  animation: kcpulse 1.8s infinite;
}

@keyframes kcpulse {
  0% {
    transform: scale(0.9);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.9);
    opacity: 0.6;
  }
}

.kc-task-title {
  margin: 11px 0 4px 0;
  font-size: 13px;
  color: #ffffff;
  font-weight: bold;
}

.kc-meta-kv-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: auto;
}

.kv-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.kv-row .k {
  color: var(--color-text-muted);
}

.kv-row .v {
  font-weight: bold;
}

/* 右侧列样式：OODA 四宫格矩阵舱 */
.kc-right-ooda-grid-col {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 四要素横向平铺切分 */
  gap: 8px;
}

.ooda-cell {
  background: var(--bg-input);
  border: 1px solid var(--border-dark);
  border-left: 3px solid #fff;
  border-radius: 4px;
  padding: 8px 11px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 四色战术回路渲染 */
.ooda-cell.border-red {
  border-left-color: var(--color-danger);
  background: linear-gradient(
    90deg,
    rgba(239, 68, 68, 0.08) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}
.ooda-cell.border-cyan {
  border-left-color: var(--color-cyan);
  background: linear-gradient(
    90deg,
    rgba(6, 182, 212, 0.08) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}
.ooda-cell.border-orange {
  border-left-color: var(--color-warning);
  background: linear-gradient(
    90deg,
    rgba(245, 158, 11, 0.08) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}
.ooda-cell.border-green {
  border-left-color: var(--color-success);
  background: linear-gradient(
    90deg,
    rgba(16, 185, 129, 0.08) 0%,
    rgba(0, 0, 0, 0) 100%
  );
}

.cell-top {
  display: flex;
  align-items: center;
  font-size: 11px;
  margin-bottom: 4px;
  gap: 4px;
}

.cell-top .label {
  font-weight: bold;
}

.cell-top .ids {
  color: var(--color-text-muted);
  margin-left: auto;
  font-size: 11px;
}

.cell-bottom {
  font-size: 11px;
  color: var(--color-text-main);
  line-height: 1.4;
  word-break: break-all;
  background: rgba(0, 0, 0, 0.15);
  padding: 4px 6px;
  border-radius: 2px;
  min-height: 24px;
}
</style>
