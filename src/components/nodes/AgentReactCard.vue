<template>
  <div :class="['agent-card', theme]">
    <div class="header">
      <div class="icon">{{ iconText }}</div>
      <div class="title">{{ title }}</div>
      <div class="actions">
        <span 
          v-if="key !== 'start' && key !== 'end'"
          class="op" 
          @click.stop="removeNode" 
          title="删除节点"
        >✖️</span>
      </div>
    </div>
    
    <div v-if="inputPlaceholder" class="body">
      <span class="section">节点内容</span>
      <input type="text" :placeholder="inputPlaceholder" />
    </div>
    <div v-else class="desc">{{ desc }}</div>
  </div>
</template>

<script>
export default {
   inject: ['getNode'],
  computed: {
    data() {
      return this.getNode().getData() || {}
    },
    key() { return this.data.key || 'unknown' },
    iconText() { return this.data.iconText || '' },
    title() { return this.data.title || '' },
    desc() { return this.data.desc || '' },
    theme() { return this.data.theme || 'blue' },
    inputPlaceholder() { return this.data.inputPlaceholder },
  },
  methods: {
    removeNode() {
      this.getNode().remove()
    },
  },
}
</script>

<style>
/* 注意：不要加 scoped，因为节点渲染在 foreignObject 中，需要全局或特定类名生效 */
.agent-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #5F95FF;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 12px;
  width: 100%;
  height: 100%;
  background: #fff;
  gap: 8px;
  font-family: Inter, PingFang SC, Arial;
}
.agent-card .header { display: flex; align-items: center; gap: 12px; }
.agent-card .icon {
  width: 32px; height: 32px; border-radius: 8px;
  background: #F0F5FF; color: #1D39C4; display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600;
}
.agent-card.green .icon { background: #E6FFFB; color: #08979C; }
.agent-card.orange .icon { background: #FFF7E6; color: #FA8C16; }
.agent-card.red .icon { background: #FFF1F0; color: #CF1322; }

.agent-card .title { font-size: 16px; color: #141414; font-weight: 600; line-height: 20px; }
.agent-card .desc { font-size: 13px; color: rgba(0,0,0,0.65); line-height: 18px; }
.agent-card .body { display: flex; align-items: center; gap: 8px; }
.agent-card .section { font-size: 12px; color: #8c8c8c; flex: 0 0 auto; white-space: nowrap; }
.agent-card .body input {
  flex: 1; min-width: 0; height: 30px; border: 1px solid #5F95FF; border-radius: 6px; padding: 4px 8px; background: #FAFAFA; color: #141414;
}
.agent-card .actions { margin-left: auto; color: #8c8c8c; display: flex; gap: 8px; }
.agent-card .actions .op { font-size: 14px; cursor: pointer; }
</style>