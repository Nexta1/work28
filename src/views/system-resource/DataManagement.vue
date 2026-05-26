<template>
  <div class="data-hub">
    <div class="hub-header">
      <div>
        <span class="panel-kicker">RESOURCE DATA CENTER</span>
        <h1>数据管理</h1>
        <p>围绕权限、治理模型、分类存储与订阅分发构建数据资源管理入口。</p>
      </div>
    </div>

    <div class="module-grid">
      <router-link v-for="item in modules" :key="item.path" :to="item.path" class="module-card">
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
  name: 'DataManagement',
  data() {
    return {
      modules: [
        {
          path: '/permission-management',
          code: 'ROLE / DATA PRIVILEGE',
          title: '权限管理',
          desc: '维护角色信息与角色数据权限。',
          icon: 'el-icon-lock',
          tone: 'blue'
        },
        {
          path: '/data-governance-model',
          code: 'LABEL CLASS / MODEL',
          title: '数据治理模型维护',
          desc: '维护标签分类、标签模型和治理标注基础。',
          icon: 'el-icon-collection-tag',
          tone: 'green'
        },
        {
          path: '/classification-storage',
          code: 'SOURCE / DATA MODEL',
          title: '分类存储',
          desc: '维护数据源和数据目录树。',
          icon: 'el-icon-folder-opened',
          tone: 'amber'
        },
        {
          path: '/subscription-distribution',
          code: 'SUBJECT / SUBSCRIBE',
          title: '订阅分发',
          desc: '维护主题发布、订阅申请和审核分发。',
          icon: 'el-icon-position',
          tone: 'violet'
        }
      ]
    }
  },
  mounted() {
    this.$emit('update:title', '数据管理')
  }
}
</script>

<style scoped>
.data-hub {
  min-height: 100%;
  padding: 18px;
  box-sizing: border-box;
  background: #03060c;
  color: #cbd5e1;
}

.hub-header {
  min-height: 136px;
  border: 1px solid #111b2b;
  border-radius: 4px;
  background: #080e18;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  margin-bottom: 14px;
}

.panel-kicker {
  display: block;
  font-size: 12px;
  color: #52637a;
  margin-bottom: 6px;
}

h1,
h3,
p {
  margin: 0;
}

h1 {
  font-size: 28px;
  color: #38bdf8;
}

.hub-header p {
  margin-top: 8px;
  color: #94a3b8;
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
  background: #080e18;
  border: 1px solid #111b2b;
  border-radius: 4px;
  padding: 16px;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.module-card:hover {
  border-color: #38bdf8;
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
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
}

.module-mark.green {
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
}

.module-mark.amber {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}

.module-mark.violet {
  color: #a78bfa;
  background: rgba(167, 139, 250, 0.12);
}

.module-content span {
  display: block;
  font-size: 11px;
  color: #52637a;
  margin-bottom: 5px;
}

.module-content h3 {
  color: #fff;
  font-size: 16px;
}

.module-content p {
  margin-top: 7px;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.5;
}

.arrow {
  color: #52637a;
}
</style>
