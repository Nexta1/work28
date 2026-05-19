<template>
  <div :class="['flow-card', type]">
    <div class="header">
      <div class="icon">{{ type === 'end' ? 'E' : 'S' }}</div>
      <div class="title">{{ title }}</div>
      <div v-if="badge" class="badge">{{ badge }}</div>
    </div>
    
    <div v-if="type === 'start'" class="body">
      <span class="section">Agent 开始节点</span>
    </div>
    <div v-else class="footer">
      <span class="section">Agent 结束节点</span>
    </div>
  </div>
</template>

<script>
export default {
  inject: ['getNode'],
  computed: {
    data() { return this.getNode().getData() || {} },
    shape() { return this.getNode().shape },
    type() { return this.shape === 'agent-end-card' ? 'end' : 'start' },
    title() { return this.data.title || '' },
    badge() { return this.data.badge },
  },
}
</script>

<style>
.flow-card { 
  display: flex; flex-direction: column; border: 1px solid #5F95FF; border-radius: 12px; 
  background: #fff; width: 100%; height: 100%; box-sizing: border-box; padding: 12px; gap: 8px;
  font-family: Inter, PingFang SC, Arial;
}
.flow-card .header { display: flex; align-items: center; gap: 12px; }
.flow-card .icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; }
.flow-card.start .icon { background: #EEF2FF; color: #5F95FF; }
.flow-card.end .icon { background: #FFF1F0; color: #FF7875; }
.flow-card .title { font-size: 16px; color: #141414; font-weight: 600; }
.flow-card .badge { margin-left: auto; font-size: 12px; color: #8c8c8c; background: #F5F5F5; border-radius: 8px; padding: 2px 8px; }
.flow-card .body, .flow-card .footer { display: flex; align-items: center; gap: 8px; }
.flow-card .section { font-size: 12px; color: #8c8c8c; }
</style>