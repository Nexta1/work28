<template>
  <div
    class="pt-node-container"
    :class="{'node-arrival-flash': isNew}"
    :style="containerStyle"
  >
    <!-- 头部 -->
    <div class="node-header" :style="headerStyle">
      <i :class="getIcon"></i>
      <span class="pt-name">{{ data.killchain_Group_Member_PltName }}</span>
    </div>

    <div class="node-body">
      <!-- 资源列表：仅显示武器(wq)和传感器(cgq) -->
      <div v-if="displayResources.length > 0" class="res-list">
        <div v-for="(res, idx) in displayResources" :key="idx" class="res-tag">
          <!-- 标注区分：武器用瞄准，传感器用雷达 -->
          <i
            :class="res.isWq ? 'el-icon-aim' : 'el-icon-radar'"
            :style="{color: res.isWq ? '#ef4444' : '#3b82f6'}"
          ></i>
          <span
            class="res-type-label"
            :class="res.isWq ? 'label-wq' : 'label-cgq'"
          >
            {{ res.isWq ? '[武器]' : '[传感器]' }}
          </span>
          <span class="res-text" :title="res.name">{{ res.name }}</span>
        </div>

        <!-- 统计：如果武器+传感器超过2条，或者存在sbzts设备，显示更多提示 -->
        <div v-if="hasMore" class="more-tag">
          <i class="el-icon-more"></i>
          <span>点击查看全部 {{ totalCount }} 个资源...</span>
        </div>
      </div>
      <div v-else class="no-res-placeholder">暂无传感器/武器</div>
      <!-- 网络信息 -->
      <div class="net-info">
        <i class="el-icon-connection"></i>
        <span class="net-tag">{{ data.netName || '未加入网络' }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PtNode',
  inject: ['getNode'],
  data() {
    return {
      data: {},
      displayResources: [], // 存储过滤后的武器和传感器
      totalCount: 0,
      hasMore: false,
      themeColor: '#3b82f6',
      isNew: false
    }
  },
  computed: {
    containerStyle() {
      return {
        border: `1px solid ${this.themeColor}`,
        boxShadow: this.isNew
          ? `0 0 15px ${this.themeColor}`
          : '0 4px 12px rgba(0,0,0,0.5)'
      }
    },
    headerStyle() {
      return {
        color: this.themeColor,
        borderBottom: `1px solid ${this.themeColor}33`,
        background: `${this.themeColor}11`
      }
    },
    getIcon() {
      const name = this.data.killchain_Group_Member_PltName || ''
      if (name.includes('舰')) return 'el-icon-ship'
      if (name.includes('机')) return 'el-icon-position'
      return 'el-icon-monitor'
    }
  },
  mounted() {
    const node = this.getNode()
    const rawData = node.getData() || {}

    this.data = rawData
    this.themeColor = rawData.themeColor || '#3b82f6'
    this.isNew = rawData.isNew || false

    const detail = rawData.ptDetail || {}

    // 1. 提取传感器 (CGQMC)
    const sensors = (detail.cgqxxs || []).map(i => ({
      name: i.CGQMC,
      isWq: false
    }))

    // 2. 提取武器 (WQMC)
    const weapons = (detail.wqxxs || []).map(i => ({
      name: i.WQMC,
      isWq: true
    }))

    // 3. 统计总数（包含设备）用于“显示更多”判断
    const otherDevicesCount = (detail.sbzts || []).length
    this.totalCount = sensors.length + weapons.length + otherDevicesCount
    let filtered

    if (rawData.KILLCHAIN_EXECUTEPHASE == 4) {
      filtered = [...weapons, ...sensors]

      this.displayResources = filtered.slice(0, 2)
    } else {
      // 4. 仅合并武器和传感器进行展示
      filtered = [...sensors, ...weapons]
      this.displayResources = filtered.slice(0, 2)
    }

    // 如果 武器+传感器 > 2 或者 有其他设备，则显示“更多”
    this.hasMore = filtered.length > 2 || otherDevicesCount > 0

    if (this.isNew) {
      setTimeout(() => {
        this.isNew = false
      }, 3000)
    }
  }
}
</script>

<style scoped>
.pt-node-container {
  width: 185px;
  height: 140px;
  background: #151a24;
  border-radius: 4px;
  color: #d1d5db;
  font-size: 11px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden; /* 严禁内容撑开容器 */
  border-radius: 4px;
  cursor: pointer;
}

.node-header {
  padding: 6px 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.node-header i {
  margin-right: 6px;
}

.node-body {
  padding: 8px 10px;
  flex: 1; /* 自动填充剩余空间 */
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.res-list {
  margin-bottom: 4px;
}

.res-tag {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.03);
  padding: 2px 4px;
  border-radius: 2px;
}

.res-type-label {
  font-size: 10px;
  margin-right: 4px;
  transform: scale(0.9);
  white-space: nowrap;
}
.label-wq {
  color: #f87171;
} /* 武器红 */
.label-cgq {
  color: #60a5fa;
} /* 传感器蓝 */

.res-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  flex: 1;
}

.more-tag {
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
  padding-left: 2px;
  border-top: 1px dashed #334155;
  padding-top: 4px;
}

.net-info {
  margin-top: 6px;
  border-top: 1px solid #232c3d;
  padding-top: 6px;
  display: flex;
  align-items: center;
  color: #64748b;
  /* margin-top: auto; */
}
.net-tag {
  background: #1e293b;
  color: #94a3b8;
  padding: 1px 6px;
  border-radius: 2px;
  font-size: 10px;
  margin-left: 4px;
}

.node-arrival-flash {
  animation: node-glow 1.5s ease-in-out infinite;
}
@keyframes node-glow {
  50% {
    filter: brightness(1.4);
    transform: translateY(-2px);
  }
}
</style>
