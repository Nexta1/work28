<template>
  <!-- 任务群组和子网 (方形) -->
  <div 
    v-if="isTask || isSubnet"
    class="group-wrapper"
    :class="{ selected: isSelected, 'task-level': isTask, 'subnet-level': isSubnet }"
  >
    <div class="group-node">
      <!-- 群组边框发光效果 -->
      <div class="group-border" :style="{ borderColor: nodeData.color }"></div>
      
      <!-- 群组内容区 -->
      <div 
        class="group-content" 
        :style="{ 
          borderColor: nodeData.color, 
          boxShadow: isSelected ? `0 0 30px ${nodeData.color}` : `0 0 10px ${nodeData.color}` 
        }"
      >
        <div class="group-icon">{{ isTask ? '◼' : '▣' }}</div>
        <div class="group-label">{{ nodeData.label }}</div>
        <div class="group-stats">{{ nodeData.stats || '' }}</div>
      </div>
      
      <!-- 选中标记 -->
      <div v-if="isSelected" class="selected-border"></div>
    </div>
  </div>

  <!-- 成员节点 (圆形) -->
  <div 
    v-else
    class="node-wrapper"
    :class="{ selected: isSelected, core: isCore, edge: isEdge }"
  >
    <div class="network-node">
      <!-- 第一层光环 -->
      <div 
        class="node-ring" 
        :style="{ 
          borderColor: nodeData.color, 
          animationDuration: isCore ? '8s' : '12s' 
        }"
      ></div>
      
      <!-- 第二层光环 -->
      <div 
        class="node-ring secondary" 
        :style="{ 
          borderColor: nodeData.color, 
          animationDuration: isCore ? '12s' : '18s' 
        }"
      ></div>
      
      <!-- 核心节点 -->
      <div 
        class="node-core" 
        :style="{
          background: isCore ? nodeData.color : 'rgba(13, 20, 41, 0.9)',
          border: `2px solid ${nodeData.color}`,
          boxShadow: isSelected ? `0 0 30px ${nodeData.color}` : `0 0 15px ${nodeData.color}`
        }"
      >
        <span class="node-icon">{{ isCore ? '◆' : isEdge ? '◇' : '○' }}</span>
      </div>
      
      <!-- 状态指示点 -->
      <div class="node-status" :style="{ background: nodeData.statusColor }"></div>
      
      <!-- 选中标记 -->
      <div v-if="isSelected" class="selected-ring"></div>
      
      <!-- 标签 -->
      <div class="node-label">{{ nodeData.label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NetworkNode',
    inject: ['getNode'],
  computed: {
    // 提取数据，对应原 render 函数中的 const data = this.node.data || {}
    nodeData() {
        return this.getNode().getData() || {}
    },
    // 计算属性，对应原 render 函数中的逻辑判断
    isSelected() {
      return this.nodeData.selected
    },
    isCore() {
      return this.nodeData.type === 'core'
    },
    isEdge() {
      return this.nodeData.type === 'edge'
    },
    isTask() {
      return this.nodeData.level === 'task'
    },
    isSubnet() {
      return this.nodeData.level === 'subnet'
    }
  }
}
</script>

<style>
/* 群组节点样式 - 全局 */
.group-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-node {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.group-border {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 12px;
  border: 2px solid;
  opacity: 0.5;
  animation: pulse-border 3s ease infinite;
}

.group-content {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  border: 2px solid;
  background: rgba(13, 20, 41, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  position: relative;
  z-index: 2;
}

.group-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.group-label {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  line-height: 1.2;
}

.group-stats {
  font-size: 10px;
  color: #8b9dc3;
  margin-top: 4px;
}

.selected-border {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 14px;
  border: 2px solid #00d4ff;
  animation: pulse-ring 1.5s ease infinite;
  z-index: 1;
}

/* 成员节点样式 */
.node-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.network-node {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
}

.node-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid;
  animation: rotate 10s linear infinite;
}

.node-ring.secondary {
  width: 80%;
  height: 80%;
  animation-direction: reverse;
  opacity: 0.5;
}

.node-core {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.node-icon {
  font-size: 16px;
  color: #fff;
}

.node-status {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #0a0e1a;
  z-index: 3;
}

.selected-ring {
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 2px solid #00d4ff;
  animation: pulse-ring 1.5s ease infinite;
  z-index: 1;
}

.node-label {
  position: absolute;
  bottom: -30px;
  white-space: nowrap;
  font-size: 12px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  font-weight: 500;
  background: rgba(13, 20, 41, 0.8);
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #2a3f5f;
}

/* 节点类型样式 */
.node-wrapper.core .node-core {
  box-shadow: 0 0 25px currentColor;
}

.node-wrapper.edge .node-core {
  box-shadow: 0 0 15px currentColor;
}

.node-wrapper.selected .node-core {
  transform: scale(1.1);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-ring {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

@keyframes pulse-border {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
</style>