<template>
  <div class="data-hub">
    <div class="hub-header">
      <div>
        <span class="panel-kicker">RESOURCE MANAGEMENT CENTER</span>
        <h1>资源管理</h1>
        <p>
          负责信息资源管理、数据链装备全生命周期管理、数据链频谱资源管理与数据链用户信息。
        </p>
      </div>
    </div>

    <div class="module-grid">
      <router-link
        v-for="item in modules"
        :key="item.path"
        :to="item.path"
        class="module-card"
      >
        <div :class="['module-mark', item.tone]">
          <i :class="item.icon"></i>
        </div>
        <div class="module-content">
          <span>{{ item.code }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </div>
        <i class="el-icon-arrow-right arrow"></i>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResourceManagement',
  data() {
    return {
      modules: [
        {
          path: '/information-resource-management',
          code: 'INFO / RESOURCE',
          title: '信息资源管理',
          desc: '维护与调度体系信息资源目录、属性及关联关系。',
          icon: 'el-icon-document',
          tone: 'blue'
        },
        {
          path: '/datalink-equipment-lifecycle',
          code: 'EQUIPMENT / LIFECYCLE',
          title: '数据链装备全生命周期管理',
          desc: '覆盖装备建档、部署、运行、维护与退役全流程。',
          icon: 'el-icon-s-cooperation',
          tone: 'green'
        },
        {
          path: '/datalink-spectrum-resource',
          code: 'SPECTRUM / RESOURCE',
          title: '数据链频谱资源管理',
          desc: '管理频谱分配、占用状态与冲突协调策略。',
          icon: 'el-icon-data-line',
          tone: 'amber'
        },
        {
          path: '/datalink-user-info',
          code: 'PT / WQ / CGQ',
          title: '数据链用户信息',
          desc: '维护平台、武器、传感器型号及具体实例信息。',
          icon: 'el-icon-s-platform',
          tone: 'violet'
        }
      ]
    }
  },
  mounted() {
    this.$emit('update:title', '资源管理')
  }
}
</script>

<style scoped>
.data-hub {
  min-height: 100%;
  padding: 18px;
  box-sizing: border-box;
  background: var(--bg-base);
  color: var(--color-text-main);
}

.hub-header {
  min-height: 136px;
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  background: var(--bg-panel);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  margin-bottom: 14px;
}

.panel-kicker {
  display: block;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

h1,
h3,
p {
  margin: 0;
}

h1 {
  font-size: 28px;
  color: var(--color-primary);
}

.hub-header p {
  margin-top: 8px;
  color: var(--color-text-muted);
  font-size: 13px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.module-card {
  min-height: 128px;
  display: grid;
  grid-template-columns: 52px 1fr 18px;
  gap: 12px;
  align-items: center;
  background: var(--bg-panel);
  border: 1px solid var(--border-dark);
  border-radius: 4px;
  padding: 16px;
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    transform 0.2s;
}

.module-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 8px 20px rgba(56, 189, 248, 0.08);
  transform: translateY(-2px);
}

.module-mark {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.module-mark.blue {
  color: var(--color-primary);
  background: rgba(56, 189, 248, 0.12);
}

.module-mark.green {
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.12);
}

.module-mark.amber {
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.12);
}

.module-mark.violet {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.12);
}

.module-content span {
  display: block;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-bottom: 5px;
}

.module-content h3 {
  color: var(--color-text-main);
  font-size: 16px;
}

.module-content p {
  margin-top: 7px;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.arrow {
  color: var(--color-text-muted);
}
</style>
