<template>
  <div class="topology-container">
    <!-- 顶部工具栏 -->
    <div class="monitor-toolbar">
      <el-form :model="filterForm" inline size="small">
        <el-form-item label="作战任务">
          <el-select
            v-model="filterForm.ZZRWID"
            placeholder="选择作战任务"
            @change="onTaskSelect"
            popper-class="monitor-select-dropdown"
            style="width: 250px"
          >
            <el-option
              v-for="task in taskList"
              :key="task.ZZRWID"
              :label="`${task.RWMC} (${task.ZZRWID})`"
              :value="task.ZZRWID"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="floating-toolbar">
      <el-button
        type="primary"
        size="mini"
        circle
        icon="el-icon-rank"
        title="适应画布"
        @click="resetLayout"
      />
    </div>

    <!-- 画布容器 -->
    <div id="container" ref="container"></div>

    <!-- 右侧详情面板 -->
    <transition name="panel-slide">
      <div v-if="detailVisible" class="detail-panel">
        <div class="panel-header">
          <span
            ><i class="el-icon-cpu"></i>
            {{ selectedNode.isNetwork ? '网络状态监控' : '节点属性' }}</span
          >
          <i class="el-icon-close close-btn" @click="detailVisible = false"></i>
        </div>

        <div
          class="panel-content"
          v-loading="loading"
          element-loading-background="transparent"
        >
          <!-- 顶部基础信息区 -->
          <div style="margin-bottom: 20px">
            <h3 style="margin: 0; font-size: 18px; color: #eee">
              {{ selectedNode.WLMC || selectedNode.name }}
            </h3>
            <p style="margin: 5px 0; font-size: 12px; color: #666">
              ID: {{ selectedNode.WLH || selectedNode.id }}
            </p>
            <div style="margin-top: 10px">
              <span
                class="status-indicator"
                :style="{
                  backgroundColor: selectedNode.healthColor,
                  color: selectedNode.healthColor
                }"
              ></span>
              <span
                :style="{color: selectedNode.healthColor, fontSize: '13px'}"
                >{{ selectedNode.healthStatus }}</span
              >
            </div>
          </div>

          <!-- 网络特有可视化指标 -->
          <template v-if="selectedNode.isNetwork">
            <div class="stat-card">
              <div class="stat-label">数据链组件类型</div>
              <div style="font-size: 14px; color: #ccc">
                {{ selectedNode.typeName }}
              </div>
            </div>

            <div class="stat-card" style="border-left-color: #722ed1">
              <div class="stat-label">频段覆盖 (MHz)</div>
              <div class="stat-value">
                {{ selectedNode.PDXX }}
                <span style="font-size: 12px; color: #444">~</span>
                {{ selectedNode.PDSX }}
              </div>
            </div>

            <!-- 带宽进度条可视化 -->
            <div class="stat-card" style="border-left-color: #52c41a">
              <div style="display: flex; justify-content: space-between">
                <div class="stat-label">
                  带宽占用 (剩余 {{ selectedNode.SYDK }} /
                  {{ selectedNode.DK }} Mbps)
                </div>
                <div style="color: #52c41a; font-size: 12px">
                  {{ Math.round((selectedNode.SYDK / selectedNode.DK) * 100) }}%
                  剩余
                </div>
              </div>
              <div class="progress-container">
                <div
                  class="progress-bar"
                  :style="{
                    width: (selectedNode.SYDK / selectedNode.DK) * 100 + '%'
                  }"
                ></div>
              </div>
            </div>

            <div
              class="stat-card"
              :style="{
                borderLeftColor: selectedNode.DBL > 5 ? '#ff4d4f' : '#00e5ff'
              }"
            >
              <div class="stat-label">实时丢包率</div>
              <div
                class="stat-value"
                :style="{color: selectedNode.DBL > 5 ? '#ff4d4f' : '#00e5ff'}"
              >
                {{ selectedNode.DBL }}<span style="font-size: 14px">%</span>
              </div>
            </div>
          </template>

          <!-- 普通节点 -->
          <template v-else>
            <div class="stat-card">
              <div class="stat-label">节点类型</div>
              <div style="font-size: 14px; color: #ccc">
                {{ selectedNode.type || '常规物理终端' }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </transition>
    <!-- 底部监控面板容器 -->
    <div class="monitor-dashboard-footer">
      <div class="monitor-header">
        <div class="monitor-title">
          <span class="pulse-dot"></span>
          <span class="text">全域信息流量监控实时总线</span>
        </div>
        <div class="monitor-timer">刷新时间: {{ lastRefreshTime }}</div>
      </div>

      <div class="monitor-list-container">
        <!-- 表头 -->
        <div class="monitor-list-header">
          <div class="col-time">时间戳</div>
          <div class="col-net">网络/代码</div>
          <div class="col-path">源平台 ➔ 目的平台 (编识号)</div>
          <div class="col-type">链路/信息类型</div>
          <div class="col-data">数据交互 (发送/接收)</div>
        </div>

        <!-- 滚动列表 -->
        <div class="monitor-list-body">
          <transition-group name="row-fade">
            <div
              v-for="item in trafficList"
              :key="item.XXLLTJID"
              class="monitor-row"
            >
              <div class="col-time">{{ formatTime(item.SJ) }}</div>

              <div class="col-net">
                <div class="wlh">WLH-{{ item.WLH }}</div>
                <div class="xxdm">代码: {{ item.XXDM }}</div>
              </div>

              <div class="col-path">
                <div class="node origin">
                  <span class="name">{{ item.PT1MC }}</span>
                  <span class="bsh">[{{ item.PT1BSH }}]</span>
                </div>
                <div class="flow-arrow">
                  <div class="arrow-line"></div>
                </div>
                <div class="node target">
                  <span class="name">{{ item.PT2MC }}</span>
                  <span class="bsh">[{{ item.PT2BSH }}]</span>
                </div>
              </div>

              <div class="col-type">
                <div class="ll-tag">{{ item.LLLXMC }}</div>
                <div class="xx-tag">{{ item.XXLXMC }}</div>
              </div>

              <div class="col-data">
                <div class="data-box tx">
                  <span class="label">TX</span>
                  <span class="val">{{ item.FSXXTS }}</span>
                </div>
                <div class="data-box rx">
                  <span class="label">RX</span>
                  <span class="val">{{ item.JSXXTS }}</span>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {Graph, Shape} from '@antv/x6'
import {pageQueryTask} from '@/api/combat-task'
import {queryNetworkTree} from '@/api/network-requirement'
import {wlzt, xxlltj} from '@/api/wl'
import {transformTopologyData} from './test'

export default {
  name: 'VerticalTopology',
  data() {
    return {
      trafficList: [], // 存储全量流量数据
      refreshTimer: null,
      graph: null,
      detailVisible: false,
      selectedNode: {},
      taskList: [],
      filterForm: {
        ZZRWID: ''
      },
      theme: {
        background: '#0a192f',
        network: '#00d8ff',
        subnet: '#52c41a',
        group: 'rgba(250, 173, 20, 0.05)',
        groupBorder: '#faad14',
        edge: '#00e5ff', // 连线：明亮的青蓝色
        edgeGradient: '#0055ff', // 渐变终止色：深蓝色
        text: '#a6a6a6',
        flowDot: {
          color: '#00f2fe', // 科技感青色
          shadow: '#03a9f4', // 发光颜色
          r: 4,
          duration: 2500
        }
      },
      loading: false
    }
  },
  mounted() {
    this.startLiveMonitoring()
    this.initGraph()
    this.loadTaskList()
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize)
    if (this.refreshTimer) clearInterval(this.refreshTimer)
  },
  methods: {
    formatTime(sj) {
      if (!sj) return '--:--:--'
      // 假设 SJ 是 13 位毫秒或 10 位秒
      const date = new Date(sj.toString().length === 10 ? sj * 1000 : sj)
      return date.toLocaleTimeString('zh-CN', {hour12: false})
    },
    async startLiveMonitoring() {
      this.fetchGlobalTraffic()
      // 每隔 5 秒刷新一次
      this.refreshTimer = setInterval(() => {
        this.fetchGlobalTraffic()
      }, 5000)
    },
    async fetchGlobalTraffic() {
      try {
        const res = await xxlltj({
          pageNum: 1,
          pageSize: 50,
          params: {} // 查询全量
        })

        // 按时间戳倒序排列，最新的在最上面
        const list = res.data?.list || []
        this.trafficList = list.sort((a, b) => b.SJ - a.SJ)
        this.lastRefreshTime = new Date().toLocaleTimeString()
      } catch (err) {
        console.error('流量查询失败', err)
      }
    },
    fetchNetworkDetail(wlh, name, originalData) {
      this.loading = true
      const queryParams = {
        pageNum: 1,
        pageSize: 10,
        params: {
          RWMC: '',
          WLMC: '',
          WLH: wlh // 只修改 WLH 参数
        }
      }

      wlzt(queryParams)
        .then(res => {
          // 假设返回的详情在 res.data.list[0] 中
          const detail = (res.data.list && res.data.list[0]) || {}

          // 映射网络类型枚举
          const typeMap = {
            1: '地基接入数据链组件',
            2: '天基信息直接入链星弹数据链组件',
            3: '天基侦察信息分发数据链组件',
            4: '天基接入数据链专用组件',
            5: '宽频段混合组网数据链组件',
            6: '视距/超视距一体化组网数据链组件',
            7: '全向低时延数据链组件',
            8: '定向低时延数据链组件',
            9: '低成本短距离导弹控制数据链组件',
            10: '高频段高带宽数据链组件',
            11: '激光频射一体化数据链组件',
            12: '波形动态调整体制组件',
            13: '波形在线定义体制组件'
          }

          // 整合数据用于显示
          this.selectedNode = {
            ...originalData,
            ...detail,
            isNetwork: true,
            typeName: typeMap[detail.WLLX] || '未知组件',
            // 核心：处理数值兜底，防止可视化计算报错
            DK: detail.DK || 100,
            SYDK: detail.SYDK || 0,
            DBL: detail.DBL || 0,
            healthStatus:
              detail.JKZT === 0 ? '运行中 / 良好' : '异常 / 故障告警',
            healthColor: detail.JKZT === 0 ? '#52c41a' : '#ff4d4f'
          }
          this.detailVisible = true
        })
        .catch(err => {
          this.$message.error('获取网络状态失败')
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    initGraph() {
      this.graph = new Graph({
        container: this.$refs.container,
        autoResize: true,
        background: {
          color: '#141a23' // 核心深蓝色底色
        },
        grid: {
          visible: true,
          // type: 'doubleMesh',
          args: [
            {
              color: 'rgba(0, 162, 255, 0.05)', // 主网格线
              thickness: 1
            },
            {
              color: 'rgba(0, 162, 255, 0.02)', // 次网格线
              thickness: 1,
              factor: 4
            }
          ]
        },
        panning: true,
        mousewheel: {enabled: true, modifiers: ['ctrl', 'meta']},
        connecting: {
          router: {name: 'normal'},
          connector: {name: 'normal'},
          anchor: 'center',
          connectionPoint: 'boundary'
        }
      })

      this.graph.on('node:click', ({node}) => {
        const data = node.getData()
        if (data?.isGroup) return // 群组不处理

        // 判断是否为网络节点（一级节点）
        // 通常根据 buildVerticalLayout 中定义的 data.type 或 data.id 前缀判断
        if (
          data.type === '核心层' ||
          data.type === '汇聚层' ||
          node.id.toLowerCase().includes('wl')
        ) {
          console.log(data)
          this.fetchNetworkDetail(data.wlh, node.getLabel(), data)
        } else {
          // 普通子网或节点详情
          this.selectedNode = {id: node.id, name: node.getLabel(), ...data}
          this.detailVisible = true
        }
      })

      this.graph.on('blank:click', () => {
        this.detailVisible = false
      })
    },

    loadTaskList() {
      this.loading = true
      pageQueryTask({pageNum: 1, pageSize: 100})
        .then(res => {
          this.taskList = res.data.list || []
          if (this.taskList.length > 0) {
            this.filterForm.ZZRWID = this.taskList[0].ZZRWID
            this.onTaskSelect()
          }
        })
        .catch(() => {
          this.renderDefaultData()
        })
        .finally(() => {
          this.loading = false
        })
    },

    onTaskSelect() {
      if (!this.filterForm.ZZRWID) return
      this.loading = true
      queryNetworkTree(this.filterForm.ZZRWID)
        .then(res => {
          const topologyData = [res.data]
          this.clearGraph()
          if (topologyData && topologyData.length > 0) {
            const data = transformTopologyData(topologyData)
            this.buildVerticalLayout(data)
          }
        })
        .catch(() => {
          this.clearGraph()
        })
        .finally(() => {
          this.loading = false
        })
    },

    clearGraph() {
      if (this.graph) this.graph.clearCells()
    },

    buildVerticalLayout(data) {
      const containerWidth = this.$refs.container.clientWidth
      const centerX = containerWidth / 2
      let currentY = 80
      const layerGap = 200
      const subGap = 400
      const groupGap = 220

      data.forEach(net => {
        this.createNode(
          net.id,
          net.wlmc || net.name,
          centerX - 30,
          currentY,
          'https://cdn-icons-png.flaticon.com/512/2111/2111303.png',
          this.theme.network,
          {...net}
        )

        if (!net.children) return

        const subY = currentY + layerGap
        const subStartX = centerX - ((net.children.length - 1) * subGap) / 2

        net.children.forEach((sub, subIdx) => {
          const subX = subStartX + subIdx * subGap
          this.createNode(
            sub.id,
            sub.name,
            subX - 30,
            subY,
            'https://cdn-icons-png.flaticon.com/512/906/906204.png',
            this.theme.subnet,
            {...sub}
          )
          this.createEdge(net.id, sub.id)

          if (!sub.groups) return

          const groupY = subY + layerGap
          const groupStartX = subX - ((sub.groups.length - 1) * groupGap) / 2

          sub.groups.forEach((group, gIdx) => {
            const groupX = groupStartX + gIdx * groupGap - 90
            const gHeight = 80 + (group.nodes?.length || 0) * 65

            const groupNode = this.graph.addNode({
              id: group.id,
              x: groupX,
              y: groupY,
              width: 180,
              height: gHeight,
              label: group.name,
              zIndex: 1,
              data: {isGroup: true},
              attrs: {
                body: {
                  fill: this.theme.group,
                  stroke: this.theme.groupBorder,
                  strokeWidth: 1,
                  rx: 8,
                  ry: 8,
                  strokeDasharray: '5,5'
                },
                label: {
                  refX: 0.5,
                  refY: 15,
                  fill: this.theme.groupBorder,
                  fontSize: 12,
                  fontWeight: 'bold'
                }
              }
            })
            this.createEdge(sub.id, group.id)

            if (group.nodes) {
              group.nodes.forEach((node, nIdx) => {
                const dev = this.graph.addNode({
                  id: node.id,
                  x: groupX + 67,
                  y: groupY + 55 + nIdx * 65,
                  width: 45,
                  height: 45,
                  shape: 'image',
                  imageUrl: node.icon || node.txurl,
                  label: node.name,
                  zIndex: 10,
                  data: {...node},
                  attrs: {
                    label: {
                      fill: this.theme.text,
                      fontSize: 11,
                      refY: '100%',
                      refY2: 5
                    }
                  }
                })
                groupNode.addChild(dev)
              })
            }
          })
        })
      })
      this.graph.centerContent()
    },

    createNode(id, label, x, y, icon, color, data) {
      return this.graph.addNode({
        id,
        x,
        y,
        width: 60,
        height: 60,
        shape: 'image',
        imageUrl: icon,
        label,
        data,
        attrs: {
          label: {
            fill: color,
            fontSize: 14,
            fontWeight: 'bold',
            refY: '100%',
            refY2: 12
          }
        }
      })
    },

    createEdge(source, target) {
      return this.graph.addEdge({
        source,
        target,
        zIndex: 0,
        markup: [
          ...Shape.Edge.getMarkup(),
          {
            tagName: 'circle',
            selector: 'dot-marker'
          }
        ],
        attrs: {
          line: {
            // --- 连线颜色改为渐变 ---
            stroke: {
              type: 'linearGradient',
              stops: [
                {offset: '0%', color: this.theme.edgeGradient}, // 起点深蓝
                {offset: '100%', color: this.theme.edge} // 终点亮青
              ]
            },
            strokeWidth: 2,
            targetMarker: {
              name: 'classic',
              args: {size: 8, fill: this.theme.edge}
            }
          },
          'dot-marker': {
            r: this.theme.flowDot.r,
            fill: this.theme.flowDot.color,
            atConnectionRatio: 0,
            style: {
              // 强力发光滤镜
              filter: `drop-shadow(0 0 5px ${this.theme.flowDot.shadow}) drop-shadow(0 0 10px ${this.theme.flowDot.shadow})`
            }
          }
        },
        animation: [
          [
            {'attrs/dot-marker/atConnectionRatio': 1},
            {
              duration: this.theme.flowDot.duration,
              iterations: Infinity,
              easing: 'linear'
            }
          ]
        ]
      })
    },

    resetLayout() {
      this.graph.zoomToFit({padding: 80, maxScale: 1})
      this.graph.centerContent()
    },

    handleResize() {
      if (this.graph) {
        const {clientWidth, clientHeight} = this.$refs.container
        this.graph.resize(clientWidth, clientHeight)
      }
    },

    renderDefaultData() {
      // ... 原有示例数据保持不变 ...
    }
  }
}
</script>

<style scoped>
.topology-container {
  width: 100vw;
  height: 100vh;
  background: #1a1a1a;
  position: relative;
  overflow: hidden;
}

#container {
  width: 100%;
  height: calc(100% - 60px);
  margin-top: 60px;
}

.toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(24, 24, 24, 0.9);
  border-bottom: 1px solid #333;
  padding: 0 20px;
  z-index: 100;
  display: flex;
  align-items: center;
}

.floating-toolbar {
  position: absolute;
  top: 80px;
  left: 20px;
  z-index: 90;
}

/* 详情面板容器优化 */
.detail-panel {
  position: fixed;
  top: 80px;
  right: 20px;
  width: 340px;
  /* 背景：更深邃的渐变 */
  background: linear-gradient(
    145deg,
    rgba(30, 35, 45, 0.95),
    rgba(20, 25, 30, 0.98)
  );
  /* 边框：调低亮度，半透明 */
  border: 1px solid rgba(0, 229, 255, 0.15);
  /* 阴影：多层阴影营造悬浮层级感 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 229, 255, 0.05);
  color: #fff;
  z-index: 1000;
  border-radius: 12px;
  backdrop-filter: blur(15px);
  overflow: hidden;
}
.panel-header {
  padding: 15px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  color: #177ddc;
  font-weight: bold;
}

/* 内部内容布局 */
.panel-content {
  padding: 20px;
}

/* 核心指标卡片样式 */
.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  border-left: 3px solid #00e5ff;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-family: 'Orbitron', 'Consolas', monospace; /* 科技感字体 */
  color: #00e5ff;
  text-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}

/* 进度条可视化 */
.progress-container {
  margin-top: 8px;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #0055ff, #00e5ff);
  transition: width 0.6s ease;
}

/* 健康状态灯 */
.status-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  box-shadow: 0 0 8px currentColor;
}

.close-btn {
  cursor: pointer;
  font-size: 18px;
  color: #999;
}
.close-btn:hover {
  color: #fff;
}

.panel-body {
  padding: 20px;
}

/* Element UI 描述列表深色适配 */
.custom-desc /deep/ .el-descriptions__body {
  background: transparent;
}
.custom-desc /deep/ .el-descriptions-item__label {
  background: #2a2a2a !important;
  color: #999 !important;
  width: 80px;
}
.custom-desc /deep/ .el-descriptions-item__content {
  color: #eee;
  background: transparent;
}

/* 面板动画 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s ease;
}
.panel-slide-enter,
.panel-slide-leave-to {
  transform: translateX(350px);
  opacity: 0;
}

/deep/ g.x6-cell.x6-edge:hover path.x6-edge-line {
  stroke-width: 3;
  stroke: #fff;
  transition: all 0.3s;
}
/* 圆点呼吸闪烁效果 */
/deep/ [selector='dot-marker'] {
  animation: pulse 2s infinite ease-in-out;
  transform-origin: center;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
    r: 3.5;
  }
  50% {
    opacity: 1;
    r: 4.5;
  }
  100% {
    opacity: 0.8;
    r: 3.5;
  }
}

/* 连线悬停时的科技感提升 */
/deep/ g.x6-cell.x6-edge:hover path.x6-edge-line {
  stroke: #00f2fe; /* 悬停时变为高亮色 */
  stroke-width: 3;
  filter: drop-shadow(0 0 5px #00f2fe);
  transition: all 0.3s ease;
}
/* 统一封装在 monitor-dashboard-footer 类下 */
.monitor-dashboard-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 240px;
  /* 偏蓝色深色系渐变 */
  background: linear-gradient(
    180deg,
    rgba(8, 22, 45, 0.98) 0%,
    rgba(4, 12, 24, 0.95) 100%
  );
  border-top: 1px solid rgba(0, 162, 255, 0.4);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  padding: 15px 25px;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: #fff;
}

/* 头部样式 */
.monitor-dashboard-footer .monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.monitor-dashboard-footer .monitor-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.monitor-dashboard-footer .pulse-dot {
  width: 8px;
  height: 8px;
  background: #00e5ff;
  border-radius: 50%;
  box-shadow: 0 0 10px #00e5ff;
  animation: pulse 1.5s infinite;
}

.monitor-dashboard-footer .monitor-title .text {
  font-size: 15px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #00e5ff;
}

.monitor-dashboard-footer .monitor-timer {
  font-size: 12px;
  color: #476685;
}

/* 列表容器 */
.monitor-dashboard-footer .monitor-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 列表表头 */
.monitor-dashboard-footer .monitor-list-header {
  display: flex;
  padding: 10px 15px;
  background: rgba(0, 162, 255, 0.1);
  border-radius: 4px;
  color: #5c7b99;
  font-size: 12px;
  font-weight: bold;
}

/* 滚动区域 */
.monitor-dashboard-footer .monitor-list-body {
  flex: 1;
  overflow-y: auto;
  margin-top: 5px;
}

/* 每一行样式 */
.monitor-dashboard-footer .monitor-row {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.3s;
}

.monitor-dashboard-footer .monitor-row:hover {
  background: rgba(0, 162, 255, 0.06);
}

/* 列宽度定义 */
.monitor-dashboard-footer .col-time {
  width: 90px;
  font-size: 12px;
  color: #5c7b99;
}
.monitor-dashboard-footer .col-net {
  width: 130px;
}
.monitor-dashboard-footer .col-path {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}
.monitor-dashboard-footer .col-type {
  width: 220px;
}
.monitor-dashboard-footer .col-data {
  width: 180px;
  display: flex;
  gap: 8px;
}

/* 内部小元素 */
.monitor-dashboard-footer .wlh {
  color: #00d8ff;
  font-weight: bold;
}
.monitor-dashboard-footer .xxdm {
  font-size: 11px;
  color: #476685;
  margin-top: 2px;
}

.monitor-dashboard-footer .node {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.monitor-dashboard-footer .node .name {
  font-size: 14px;
  color: #fff;
}
.monitor-dashboard-footer .node .bsh {
  font-size: 10px;
  color: #476685;
}

.monitor-dashboard-footer .flow-arrow {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00e5ff, transparent);
  position: relative;
}

.monitor-dashboard-footer .ll-tag {
  color: #00d8ff;
  font-size: 12px;
}
.monitor-dashboard-footer .xx-tag {
  color: #5c7b99;
  font-size: 11px;
  margin-top: 2px;
}

.monitor-dashboard-footer .data-box {
  flex: 1;
  padding: 4px 10px;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.monitor-dashboard-footer .data-box.tx {
  border-left: 3px solid #0055ff;
}
.monitor-dashboard-footer .data-box.rx {
  border-left: 3px solid #00e5ff;
}
.monitor-dashboard-footer .data-box .label {
  font-size: 10px;
  color: #476685;
}
.monitor-dashboard-footer .data-box .val {
  font-weight: bold;
  color: #fff;
}

/* 滚动条 */
.monitor-dashboard-footer .monitor-list-body::-webkit-scrollbar {
  width: 4px;
}
.monitor-dashboard-footer .monitor-list-body::-webkit-scrollbar-thumb {
  background: rgba(0, 162, 255, 0.3);
  border-radius: 2px;
}

/* 动画 */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.row-fade-enter {
  opacity: 0;
  transform: translateY(-10px);
}
.row-fade-enter-active {
  transition: all 0.5s;
}
/* 工具栏整体容器 */
.monitor-toolbar {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  padding: 12px 20px;
  /* 深蓝色半透明背景 */
  background: rgba(10, 26, 47, 0.85);
  border: 1px solid rgba(0, 162, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
}

/* 修改表单文字颜色 */
.monitor-toolbar ::v-deep .el-form-item__label {
  color: #a5b4fc; /* 浅蓝紫色 */
  font-weight: bold;
  text-shadow: 0 0 5px rgba(0, 229, 255, 0.2);
}

/* 修改输入框/选择框主体样式 */
.monitor-toolbar ::v-deep .el-input__inner {
  background-color: rgba(13, 31, 56, 0.9) !important;
  border: 1px solid rgba(0, 162, 255, 0.4) !important;
  color: #00e5ff !important; /* 科技青文字 */
  border-radius: 4px;
}

/* 悬停及聚焦样式 */
.monitor-toolbar ::v-deep .el-input__inner:focus {
  border-color: #00e5ff !important;
  box-shadow: 0 0 8px rgba(0, 229, 255, 0.3);
}

/* 占位符颜色 */
.monitor-toolbar ::v-deep .el-input__inner::placeholder {
  color: #476685;
}

/* ------------------------------------------------ */
/* 下拉菜单弹出层样式 (注意：el-select 的下拉层通常在 body 下) */
/* 需要在 el-select 上增加 popper-class="monitor-select-dropdown" */
/* ------------------------------------------------ */
.el-select-dropdown.monitor-select-dropdown {
  background-color: rgba(10, 26, 47, 0.95) !important;
  border: 1px solid rgba(0, 162, 255, 0.5) !important;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
}

.monitor-select-dropdown .el-select-dropdown__item {
  color: #b0c4de !important;
}

.monitor-select-dropdown .el-select-dropdown__item.hover,
.monitor-select-dropdown .el-select-dropdown__item:hover {
  background-color: rgba(0, 162, 255, 0.2) !important;
  color: #00e5ff !important;
}

.monitor-select-dropdown .el-select-dropdown__item.selected {
  color: #00e5ff !important;
  font-weight: bold;
}

/* 下拉菜单箭头 */
.monitor-select-dropdown .popper__arrow::after {
  border-bottom-color: rgba(10, 26, 47, 0.95) !important;
}
</style>
