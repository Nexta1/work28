<template>
  <div class="kill-chain-container">
    <!-- 背景网格 -->
    <div class="cyber-grid"></div>

    <!-- SVG 连接线 -->
    <svg class="connections-svg" ref="connectionsSvg">
      <defs>
        <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ff003c" />
        </marker>
        <marker id="arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#00f3ff" />
        </marker>
        <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#0aff00" />
        </marker>
      </defs>
    </svg>

    <!-- 网络图例 -->
    <!-- <div class="network-legend">
      <div class="legend-title">网络层级</div>
      <div 
        v-for="net in networks" 
        :key="net.id"
        class="legend-item"
        :class="{ active: activeNetworks[net.id] }"
        @click="toggleNetwork(net.id)"
      >
        <div class="legend-line" :style="{ background: net.color }"></div>
        <span>{{ net.name }}</span>
      </div>
      <div class="legend-status">
        <div class="status-item">
          <div class="status-dot dot-green pulse-dot"></div>
          <span>在线节点: {{ onlineCount }}</span>
        </div>
        <div class="status-item">
          <div class="status-dot dot-blue"></div>
          <span>数据吞吐: {{ dataRate }} TB/s</span>
        </div>
      </div>
    </div> -->

    <!-- 主容器 -->
    <div class="main-container">
      
      <!-- 顶部标题 -->
      <div class="header">
        <div>
          <h1>KILL CHAIN ARCHITECTURE</h1>
          <div class="subtitle">杀伤链路构建系统 · 多域协同作战视图</div>
        </div>
        <div class="header-controls">
          <button @click="resetView">重置视图</button>
          <button @click="toggleAnimation">
            <span>{{ animationEnabled ? '⏸' : '▶' }}</span> 数据流动
          </button>
        </div>
      </div>

      <!-- 滚动区域 -->
      <div class="scroll-wrapper" ref="scrollWrapper">
        
        <!-- 时间轴 -->
        <div class="time-axis">
          <div 
            v-for="(marker, index) in timeMarkers" 
            :key="index"
            class="time-marker"
          >
            {{ marker.time }}<br>{{ marker.label }}
          </div>
        </div>

        <!-- 可视化容器 -->
        <div class="viz-container">
          
          <!-- 阶段标题 -->
          <div class="stage-header">
            <div class="network-label">NETWORK<br>LAYER</div>
            <div class="stages-row">
              <div 
                v-for="(stage, index) in stages" 
                :key="index"
                class="stage-column"
              >
                <div class="stage-num">{{ String(index + 1).padStart(2, '0') }}</div>
                <div class="stage-name">{{ stage.name }}</div>
                <div class="stage-en">{{ stage.en }}</div>
              </div>
            </div>
          </div>

          <!-- 网络泳道 -->
          <div 
            v-for="network in networkLanes" 
            :key="network.id"
            class="network-lane"
            :class="`lane-${network.id}`"
            :id="`lane-${network.id}`"
            v-show="activeNetworks[network.id]"
          >
            <div class="lane-label">
              <div class="lane-title">{{ network.title }}</div>
              <div class="lane-sub">{{ network.subTitle }}<br>{{ network.tech }}</div>
            </div>
            <div class="lane-content">
              <div 
                v-for="stageIndex in 6" 
                :key="stageIndex"
                class="stage-cell"
                :data-stage="stageIndex"
              >
                <div 
                  v-for="platform in getPlatformsByNetworkAndStage(network.id, stageIndex)"
                  :key="platform.id"
                  class="platform-card"
                  :class="{ active: selectedPlatform === platform.id }"
                  @click="showDetails(platform.id)"
                >
                  <div class="card-header">
                    <span class="platform-icon">{{ platform.icon }}</span>
                    <span class="platform-id">{{ platform.id.toUpperCase() }}</span>
                  </div>
                  <div class="platform-name">{{ platform.name }}</div>
                  <div class="weapon-tags">
                    <span 
                      v-for="(sensor, sIdx) in platform.sensors.slice(0, 2)" 
                      :key="sIdx"
                      class="tag"
                      :class="platform.network === 'strategic' && platform.stage === '交战' ? 'tag-weapon' : 
                              platform.network === 'tactical' && platform.stage === '交战' ? 'tag-weapon' :
                              platform.network === 'data' && platform.stage === '交战' ? 'tag-weapon' : 'tag-sensor'"
                    >
                      {{ sensor.length > 4 ? sensor.substring(0, 4) : sensor }}
                    </span>
                  </div>
                  <div v-if="platform.signal" class="signal-info">{{ platform.signal }}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 底部状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <div class="status-item-bar">
            <div class="pulse-dot"></div>
            <span class="status-label">系统正常</span>
          </div>
          <div class="status-item-bar">
            <span class="status-label">网络延迟:</span>
            <span class="status-value">{{ latency }}ms</span>
          </div>
          <div class="status-item-bar">
            <span class="status-label">数据同步:</span>
            <span class="status-value" style="color: #0aff00;">实时</span>
          </div>
        </div>
        <div class="status-time">
          最后更新: {{ lastUpdate }}
        </div>
      </div>

    </div>

    <!-- 详情侧边栏 -->
    <div class="detail-panel" :class="{ open: detailPanelOpen }">
      <div class="panel-header">
        <div class="panel-title">平台详情</div>
        <button class="close-btn" @click="closeDetails">&times;</button>
      </div>
      <div v-if="currentPlatform" class="detail-content">
        <div class="detail-section">
          <div class="detail-icon">{{ currentPlatform.icon }}</div>
          <div class="detail-name">{{ currentPlatform.name }}</div>
          <div class="detail-meta">ID: {{ currentPlatform.id.toUpperCase() }} | 阶段: {{ currentPlatform.stage }}</div>
        </div>
        
        <div :class="['network-badge', `badge-${currentPlatform.network}`]">
          <strong>网络归属:</strong> {{ networkNames[currentPlatform.network] }}
        </div>
        
        <div class="detail-section">
          <div class="section-title">载荷配置</div>
          <div class="sensor-list">
            <div 
              v-for="(sensor, index) in currentPlatform.sensors" 
              :key="index"
              class="sensor-item"
            >
              <div class="sensor-name">
                <div class="sensor-dot"></div>
                <span>{{ sensor }}</span>
              </div>
              <div class="sensor-channel">CH-{{ String(index + 1).padStart(2, '0') }}</div>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <div class="section-title">状态监控</div>
          <div class="metric">
            <div class="metric-header">
              <span class="metric-label">系统健康度</span>
              <span class="metric-value">98%</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill fill-green" style="width: 98%"></div>
            </div>
          </div>
          <div class="metric">
            <div class="metric-header">
              <span class="metric-label">数据链路质量</span>
              <span class="metric-value" style="color: #00f3ff;">优</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill fill-cyan" style="width: 95%"></div>
            </div>
          </div>
          <div class="metric">
            <div class="metric-header">
              <span class="metric-label">电源状态</span>
              <span class="metric-value" style="color: #ffee00;">正常</span>
            </div>
            <div class="metric-bar">
              <div class="metric-fill fill-yellow" style="width: 72%"></div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <button class="btn-primary">发送指令</button>
          <button class="btn-danger">紧急断开</button>
        </div>
      </div>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
        <div class="section-title">实时数据流</div>
        <div class="data-stream">
          <div 
            v-for="(line, index) in dataStream" 
            :key="index"
            class="stream-line"
          >
            {{ line }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KillChainVisualization',
  
  data() {
    return {
      // 网络配置
      networks: [
        { id: 'strategic', name: '战略网', color: '#ff003c' },
        { id: 'tactical', name: '战术链', color: '#00f3ff' },
        { id: 'data', name: '数据链', color: '#0aff00' }
      ],
      
      // 激活状态
      activeNetworks: {
        strategic: true,
        tactical: true,
        data: true
      },
      
      // 阶段定义
      stages: [
        { name: '发现', en: 'DETECTION' },
        { name: '定位', en: 'LOCATION' },
        { name: '跟踪', en: 'TRACKING' },
        { name: '瞄准', en: 'TARGETING' },
        { name: '交战', en: 'ENGAGEMENT' },
        { name: '评估', en: 'ASSESSMENT' }
      ],
      
      // 时间轴
      timeMarkers: [
        { time: 'T+0s', label: '发现' },
        { time: 'T+30s', label: '定位' },
        { time: 'T+60s', label: '跟踪' },
        { time: 'T+90s', label: '瞄准' },
        { time: 'T+120s', label: '交战' },
        { time: 'T+150s', label: '评估' }
      ],
      
      // 网络泳道配置
      networkLanes: [
        { id: 'strategic', title: 'STRATEGIC', subTitle: '战略网', tech: 'SATCOM' },
        { id: 'tactical', title: 'TACTICAL', subTitle: '战术链', tech: 'LINK-16' },
        { id: 'data', title: 'DATA LINK', subTitle: '数据链', tech: 'TCDL' }
      ],
      
      // 平台数据
      platforms: [
        // 战略网
        { id: 'sat1', name: '侦察卫星', type: 'space', network: 'strategic', sensors: ['合成孔径雷达', '红外传感器', '光学相机'], stage: '发现', stageNum: 1, icon: '🛰', signal: '▼ 2.4GHz | 信号强' },
        { id: 'ew1', name: '电子战卫星', type: 'space', network: 'strategic', sensors: ['电子侦察', '信号分析', '测向定位'], stage: '定位', stageNum: 2, icon: '📡' },
        { id: 'awacs', name: '预警机', type: 'air', network: 'strategic', sensors: ['相控阵雷达', '指挥控制', '数据融合'], stage: '跟踪', stageNum: 3, icon: '✈' },
        { id: 'cmd1', name: '战略指挥所', type: 'ground', network: 'strategic', sensors: ['战场管理', '火力协调', '威胁评估'], stage: '瞄准', stageNum: 4, icon: '🏢' },
        { id: 'bomber', name: '战略轰炸机', type: 'air', network: 'strategic', sensors: ['巡航导弹', '精确制导炸弹', '电子战'], stage: '交战', stageNum: 5, icon: '🚀' },
        { id: 'sat2', name: '评估卫星', type: 'space', network: 'strategic', sensors: ['高分辨率光学', '毁伤评估', '战场监视'], stage: '评估', stageNum: 6, icon: '🛰' },
        
        // 战术链
        { id: 'ground-radar', name: '地面雷达站', type: 'ground', network: 'tactical', sensors: ['远程警戒雷达', '目标识别', '低空补盲'], stage: '发现', stageNum: 1, icon: '📡' },
        { id: 'uav1', name: '侦察无人机', type: 'air', network: 'tactical', sensors: ['光电吊舱', 'SAR雷达', '激光测距'], stage: '定位', stageNum: 2, icon: '🚁' },
        { id: 'spec', name: '特种侦察', type: 'ground', network: 'tactical', sensors: ['便携式雷达', '激光指示器', '通信中继'], stage: '定位', stageNum: 2, icon: '👁' },
        { id: 'ship1', name: '驱逐舰', type: 'sea', network: 'tactical', sensors: ['相控阵雷达', '垂直发射系统', '直升机'], stage: '跟踪', stageNum: 3, icon: '🚢' },
        { id: 'tank', name: '主战坦克', type: 'ground', network: 'tactical', sensors: ['火控系统', '热成像', '激光测距'], stage: '瞄准', stageNum: 4, icon: '⚔' },
        { id: 'fighter', name: '战斗机', type: 'air', network: 'tactical', sensors: ['有源相控阵', '空空导弹', '空地导弹'], stage: '交战', stageNum: 5, icon: '✈' },
        { id: 'arty', name: '自行火炮', type: 'ground', network: 'tactical', sensors: ['155mm榴弹炮', '制导炮弹', '自动装填'], stage: '交战', stageNum: 5, icon: '💥' },
        { id: 'uav2', name: '评估无人机', type: 'air', network: 'tactical', sensors: ['光电侦察', '毁伤评估', '实时回传'], stage: '评估', stageNum: 6, icon: '🚁' },
        
        // 数据链
        { id: 'elint', name: '电子侦察站', type: 'ground', network: 'data', sensors: ['信号截获', '频谱分析', '辐射源定位'], stage: '发现', stageNum: 1, icon: '📻' },
        { id: 'radar2', name: '机动雷达', type: 'ground', network: 'data', sensors: ['三坐标雷达', '高度测量', '速度测量'], stage: '定位', stageNum: 2, icon: '📡' },
        { id: 'radar3', name: '火控雷达', type: 'ground', network: 'data', sensors: ['跟踪照射', '导弹制导', '多目标处理'], stage: '跟踪', stageNum: 3, icon: '🎯' },
        { id: 'ifv', name: '步兵战车', type: 'ground', network: 'data', sensors: ['稳定火控', '反坦克导弹', '并列机枪'], stage: '瞄准', stageNum: 4, icon: '⚔' },
        { id: 'sam', name: '防空导弹', type: 'ground', network: 'data', sensors: ['主动雷达', '红外成像', '数据链'], stage: '交战', stageNum: 5, icon: '🚀' },
        { id: 'atgm', name: '反坦克导弹', type: 'ground', network: 'data', sensors: ['光纤制导', '图像匹配', '攻顶打击'], stage: '交战', stageNum: 5, icon: '🎯' },
        { id: 'ground', name: '地面评估组', type: 'ground', network: 'data', sensors: ['现场勘察', '损伤评估', '报告生成'], stage: '评估', stageNum: 6, icon: '👥' }
      ],
      
      networkNames: {
        strategic: '战略网 (SATCOM)',
        tactical: '战术链 (LINK-16)',
        data: '数据链 (TCDL)'
      },
      
      // 状态
      animationEnabled: true,
      detailPanelOpen: false,
      selectedPlatform: null,
      currentPlatform: null,
      dataStream: ['> 等待连接...'],
      
      // 实时数据
      onlineCount: 24,
      dataRate: '1.2',
      latency: 12,
      lastUpdate: '2026-04-02 09:57:00',
      
      // 定时器
      updateTimer: null,
      streamTimer: null
    }
  },
  
  computed: {
    // 按网络和阶段筛选平台
    filteredPlatforms() {
      return (networkId, stageNum) => {
        return this.platforms.filter(p => 
          p.network === networkId && 
          p.stageNum === stageNum
        )
      }
    }
  },
  
  mounted() {
    this.initUpdateTimer()
    this.$nextTick(() => {
      this.updateConnections()
      window.addEventListener('resize', this.updateConnections)
      this.$refs.scrollWrapper.addEventListener('scroll', this.updateConnections)
    })
  },
  
  beforeDestroy() {
    clearInterval(this.updateTimer)
    clearInterval(this.streamTimer)
    window.removeEventListener('resize', this.updateConnections)
    if (this.$refs.scrollWrapper) {
      this.$refs.scrollWrapper.removeEventListener('scroll', this.updateConnections)
    }
  },
  
  methods: { mergeColorsToData(dataList) {
  // 1. 定义风格类似的颜色数组 (霓虹/科技风)
  const colorPalette = [
    '#ff003c', // 战略红 (原色)
    '#00f3ff', // 战术青 (原色)
    '#0aff00', // 数据绿 (原色)
    '#ff9d00', // 警示橙 (补充)
    '#bd00ff', // 霓虹紫 (补充)
    '#ffe600', // 信号黄 (补充)
    '#ff0055', // 激光红 (补充)
    '#00ff9d'  // 矩阵绿 (补充)
  ];

  // 2. 合并颜色并返回新数组
  return dataList.map((item, index) => {
    // 核心逻辑：使用取模运算 (%) 确保索引超出颜色数组长度时自动循环
    const color = colorPalette[index % colorPalette.length];
    
    return {
      ...item,       // 保留后端返回的原始数据
      color: color  // 注入颜色属性
    };
  });
},
    // 获取指定网络和阶段的平台
    getPlatformsByNetworkAndStage(networkId, stageNum) {
      return this.platforms.filter(p => 
        p.network === networkId && 
        p.stageNum === stageNum
      )
    },
    
    // 切换网络显示
    toggleNetwork(networkId) {
      this.$set(this.activeNetworks, networkId, !this.activeNetworks[networkId])
      this.$nextTick(() => {
        this.updateConnections()
      })
    },
    
    // 显示详情
    showDetails(platformId) {
      this.selectedPlatform = platformId
      this.currentPlatform = this.platforms.find(p => p.id === platformId)
      this.detailPanelOpen = true
      this.startDataStream()
    },
    
    // 关闭详情
    closeDetails() {
      this.detailPanelOpen = false
      this.selectedPlatform = null
      clearInterval(this.streamTimer)
    },
    
    // 启动数据流
    startDataStream() {
      const msgs = [
        '> 建立安全连接...',
        '> 握手成功 (AES-256)',
        `> 正在同步 ${this.currentPlatform.name} 数据...`,
        '> 接收遥测数据流',
        '> 传感器状态: 正常',
        '> 武器系统: 待命',
        '> 网络延迟: 12ms',
        '> 数据包完整性: 100%'
      ]
      
      this.dataStream = []
      let i = 0
      
      const interval = setInterval(() => {
        if (i < msgs.length) {
          this.dataStream.push(msgs[i])
          i++
        } else {
          clearInterval(interval)
          this.streamTimer = setInterval(() => {
            const randomMsgs = [
              `> 心跳包 [${new Date().toLocaleTimeString()}]`,
              `> 数据更新: ${(Math.random() * 100).toFixed(2)} MB`,
              '> 链路质量检测: 优',
              `> 平台坐标 [${(Math.random() * 180).toFixed(4)}, ${(Math.random() * 90).toFixed(4)}]`
            ]
            this.dataStream.push(randomMsgs[Math.floor(Math.random() * randomMsgs.length)])
            if (this.dataStream.length > 20) {
              this.dataStream.shift()
            }
          }, 2000)
        }
      }, 300)
    },
    
    // 切换动画
    toggleAnimation() {
      this.animationEnabled = !this.animationEnabled
      this.updateConnections()
    },
    
    // 重置视图
    resetView() {
      this.activeNetworks = { strategic: true, tactical: true, data: true }
      this.closeDetails()
      this.$nextTick(() => {
        this.updateConnections()
      })
    },
    
    // 更新连接线
    updateConnections() {
      const svg = this.$refs.connectionsSvg
      if (!svg) return
      
      // 保留 defs，清除其他
      const defs = svg.querySelector('defs')
      svg.innerHTML = ''
      svg.appendChild(defs)
      
      if (!this.animationEnabled) return
      
      const colors = { strategic: '#ff003c', tactical: '#00f3ff', data: '#0aff00' }
      const markers = { strategic: 'arrow-red', tactical: 'arrow-blue', data: 'arrow-green' }
      
      Object.keys(this.activeNetworks).forEach(net => {
        if (!this.activeNetworks[net]) return
        
        const lane = document.getElementById(`lane-${net}`)
        if (!lane || lane.style.display === 'none') return
        
        const cards = Array.from(lane.querySelectorAll('.platform-card'))
        const positions = cards.map(card => {
          const rect = card.getBoundingClientRect()
          const stage = parseInt(card.closest('.stage-cell').dataset.stage)
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            stage: stage
          }
        })
        
        positions.sort((a, b) => a.stage - b.stage)
        
        for (let i = 0; i < positions.length - 1; i++) {
          if (positions[i].stage < positions[i + 1].stage) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
            const mx = (positions[i].x + positions[i + 1].x) / 2
            const my = positions[i].y - 50
            path.setAttribute('d', `M ${positions[i].x} ${positions[i].y} Q ${mx} ${my} ${positions[i + 1].x} ${positions[i + 1].y}`)
            path.setAttribute('stroke', colors[net])
            path.setAttribute('class', 'connection-line')
            path.setAttribute('marker-end', `url(#${markers[net]})`)
            svg.appendChild(path)
          }
        }
      })
    },
    
    // 初始化定时更新
    initUpdateTimer() {
      this.updateTimer = setInterval(() => {
        this.latency = Math.floor(Math.random() * 20 + 5)
        this.dataRate = (Math.random() * 0.5 + 1.0).toFixed(1)
        this.lastUpdate = new Date().toLocaleString('zh-CN')
      }, 3000)
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.kill-chain-container {
  background: #050508;
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  color: #e0e0e0;
  overflow: hidden;
  height: 100vh;
  position: relative;
}

/* 背景网格 */
.cyber-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

/* SVG 连接线 */
.connections-svg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.connection-line {
  fill: none;
  stroke-width: 2;
  opacity: 0.3;
  stroke-dasharray: 5,5;
  animation: dash 20s linear infinite;
}

@keyframes dash {
  to { stroke-dashoffset: -100; }
}

/* 网络图例 */
.network-legend {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(10, 15, 30, 0.95);
  border: 1px solid rgba(0, 243, 255, 0.2);
  padding: 20px;
  z-index: 100;
  width: 120px;
}

.legend-title {
  color: #888;
  font-size: 11px;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 12px 0;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s;
}

.legend-item:hover, .legend-item.active {
  opacity: 1;
  transform: translateX(5px);
}

.legend-line {
  width: 30px;
  height: 3px;
  margin-right: 10px;
  border-radius: 2px;
}

.legend-status {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #333;
  font-size: 11px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  color: #aaa;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot-green { 
  background: #0aff00; 
  box-shadow: 0 0 8px #0aff00; 
}

.dot-blue { 
  background: #00f3ff; 
}

.pulse-dot {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 主容器 */
.main-container {
  position: relative;
  z-index: 10;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部标题 */
.header {
  background: rgba(10, 15, 30, 0.9);
  border-bottom: 1px solid rgba(0, 243, 255, 0.2);
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header h1 {
  color: #00f3ff;
  font-size: 20px;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
}

.subtitle {
  color: #888;
  font-size: 12px;
  margin-top: 5px;
}

.header-controls {
  display: flex;
  gap: 10px;
}

button {
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid rgba(0, 243, 255, 0.3);
  color: #00f3ff;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

button:hover {
  background: rgba(0, 243, 255, 0.2);
}

/* 滚动区域 */
.scroll-wrapper {
  flex: 1;
  overflow: auto;
  /* margin-left: 140px; */
  padding: 20px;
}

/* 时间轴 */
.time-axis {
  display: flex;
  background: rgba(0, 243, 255, 0.05);
  border: 1px solid rgba(0, 243, 255, 0.2);
  margin-bottom: 20px;
  height: 40px;
  align-items: center;
  /* min-width: 1200px; */
}

.time-marker {
  flex: 1;
  text-align: center;
  font-size: 12px;
  color: #00f3ff;
  border-right: 1px solid rgba(0, 243, 255, 0.1);
}

.time-marker:last-child {
  border-right: none;
}

/* 可视化容器 */
.viz-container {
  background: rgba(10, 15, 30, 0.8);
  border: 1px solid rgba(0, 243, 255, 0.2);
  min-width: 1200px;
}

/* 阶段标题 */
.stage-header {
  display: flex;
  border-bottom: 1px solid rgba(0, 243, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
}

.network-label {
  width: 100px;
  padding: 15px;
  border-right: 1px solid rgba(0, 243, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.stages-row {
  flex: 1;
  display: flex;
}

.stage-column {
  flex: 1;
  padding: 15px;
  text-align: center;
  border-right: 1px solid rgba(0, 243, 255, 0.1);
}

.stage-column:last-child {
  border-right: none;
}

.stage-num {
  color: #00f3ff;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stage-name {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 3px;
}

.stage-en {
  color: #666;
  font-size: 10px;
  text-transform: uppercase;
}

/* 网络泳道 */
.network-lane {
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.lane-strategic { 
  background: rgba(255, 0, 60, 0.05); 
  border-left: 3px solid #ff003c;
}

.lane-tactical { 
  background: rgba(0, 243, 255, 0.05); 
  border-left: 3px solid #00f3ff;
}

.lane-data { 
  background: rgba(10, 255, 0, 0.05); 
  border-left: 3px solid #0aff00;
}

.lane-label {
  width: 100px;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-right: 1px solid rgba(0, 243, 255, 0.1);
  font-size: 12px;
  text-align: center;
}

.lane-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.lane-strategic .lane-title { color: #ff003c; }
.lane-tactical .lane-title { color: #00f3ff; }
.lane-data .lane-title { color: #0aff00; }

.lane-sub {
  font-size: 10px;
  opacity: 0.6;
}

.lane-content {
  flex: 1;
  display: flex;
  padding: 10px;
  gap: 10px;
}

.stage-cell {
  flex: 1;
  padding: 8px;
  min-height: 150px;
  border: 1px dashed rgba(0, 243, 255, 0.1);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}

/* 平台卡片 */
.platform-card {
  background: linear-gradient(135deg, rgba(20, 30, 48, 0.95), rgba(10, 20, 35, 1));
  border: 2px solid rgba(0, 243, 255, 0.4);
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(0, 243, 255, 0.1);
}

.platform-card:hover {
  border-color: #00f3ff;
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 243, 255, 0.2);
}

.platform-card.active {
  border-color: #ffee00;
  box-shadow: 0 0 20px rgba(255, 238, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.platform-icon {
  font-size: 20px;
}

.platform-id {
  font-size: 10px;
  color: #666;
}

.platform-name {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8px;
}

.weapon-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid currentColor;
  background: rgba(0, 0, 0, 0.3);
}

.tag-sensor { 
  color: #00f3ff; 
  border-color: #00f3ff; 
}

.tag-weapon { 
  color: #ff003c; 
  border-color: #ff003c; 
}

.signal-info {
  font-size: 10px;
  color: #0aff00;
  margin-top: 8px;
  font-family: monospace;
  opacity: 0.7;
}

/* 底部状态栏 */
.status-bar {
  background: rgba(10, 15, 30, 0.9);
  border-top: 1px solid rgba(0, 243, 255, 0.2);
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  flex-shrink: 0;
}

.status-left {
  display: flex;
  gap: 30px;
}

.status-item-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  color: #666;
}

.status-value {
  color: #00f3ff;
  font-family: monospace;
}

.status-time {
  color: #666;
}

/* 详情侧边栏 */
.detail-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 380px;
  height: 100vh;
  background: rgba(10, 15, 30, 0.98);
  border-left: 3px solid rgba(0, 243, 255, 0.5);
  z-index: 200;
  overflow-y: auto;
  overflow-x: hidden;
  transform: translateX(100%);
  transition: transform 0.3s ease-out;
  padding: 0;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.5);
}

.detail-panel.open {
  transform: translateX(0);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 243, 255, 0.2);
  position: sticky;
  top: 0;
  background: rgba(10, 15, 30, 0.99);
  z-index: 10;
}

.panel-title {
  color: #00f3ff;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #fff;
}

.detail-content {
  padding-bottom: 40px;
}

.detail-section {
  margin-bottom: 25px;
  padding: 0 20px;
}

.detail-icon {
  font-size: 40px;
  margin-bottom: 10px;
}

.detail-name {
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 5px;
}

.detail-meta {
  color: #888;
  font-size: 12px;
}

.network-badge {
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 13px;
}

.badge-strategic {
  background: rgba(255, 0, 60, 0.1);
  border: 1px solid rgba(255, 0, 60, 0.3);
  color: #ff003c;
}

.badge-tactical {
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid rgba(0, 243, 255, 0.3);
  color: #00f3ff;
}

.badge-data {
  background: rgba(10, 255, 0, 0.1);
  border: 1px solid rgba(10, 255, 0, 0.3);
  color: #0aff00;
}

.section-title {
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 1px;
  margin-top: 15px;
  margin-left: 20px;
  margin-right: 20px;
}

.sensor-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px;
}

.sensor-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 4px;
}

.sensor-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.sensor-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00f3ff;
}

.sensor-channel {
  font-size: 11px;
  color: #666;
}

.metric {
  margin-bottom: 15px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 5px;
}

.metric-bar {
  height: 4px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s;
}

.fill-green { 
  background: linear-gradient(90deg, #0aff00, #00ff88); 
}

.fill-cyan { 
  background: linear-gradient(90deg, #00f3ff, #0088ff); 
}

.fill-yellow { 
  background: linear-gradient(90deg, #ffee00, #ff8800); 
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 20px;
  padding: 0 20px;
}

.btn-primary {
  background: rgba(0, 243, 255, 0.2);
  border: 1px solid #00f3ff;
  color: #00f3ff;
  padding: 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-danger {
  background: rgba(255, 0, 60, 0.2);
  border: 1px solid #ff003c;
  color: #ff003c;
  padding: 12px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: rgba(0, 243, 255, 0.3);
}

.btn-danger:hover {
  background: rgba(255, 0, 60, 0.3);
}

.data-stream {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #0aff00;
  line-height: 1.8;
  opacity: 0.8;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(10, 255, 0, 0.2);
  border-radius: 4px;
  margin: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.stream-line {
  opacity: 0;
  animation: fadeIn 0.3s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}
</style>