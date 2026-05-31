<template>
  <div class="sidebar-container">
    <!-- 侧边导航栏：通过 isCollapsed 动态切换 class -->
    <nav class="side-nav" :class="{'is-collapsed': isCollapsed}">
      <div class="nav-scroll-container">
        <div
          v-for="subsystem in subsystems"
          :key="subsystem"
          class="subsystem-section"
        >
          <!-- 子系统标题：收起时隐藏 -->
          <div v-if="!isCollapsed" class="subsystem-title">{{ subsystem }}</div>

          <div
            v-for="category in getCategoriesBySubsystem(subsystem)"
            :key="category"
            class="category-group"
          >
            <!-- 分类标题：收起时隐藏 -->
            <div v-if="!isCollapsed" class="category-title">{{ category }}</div>

            <router-link
              v-for="route in getRoutesBySubsystemAndCategory(
                subsystem,
                category
              )"
              :key="route.path"
              :to="route.path"
              class="nav-item"
              :class="{active: $route.path === route.path}"
            >
              <span class="nav-icon">{{ route.meta.icon }}</span>
              <!-- 菜单文字：收起时通过 v-if 隐藏 -->
              <span v-if="!isCollapsed" class="nav-text">{{
                route.meta.title
              }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- 切换按钮：根据状态动态改变 left 位置 -->
    <button
      class="floating-nav-toggle"
      :style="{left: isCollapsed ? '60px' : '220px'}"
      @click="toggleNav"
      :title="isCollapsed ? '展开菜单' : '收起菜单'"
    >
      {{ isCollapsed ? '▶' : '◀' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  data() {
    return {
      isCollapsed: false // 控制侧边栏是否收起
    }
  },
  computed: {
    subsystems() {
      return ['体系运控', '资源和数据管理', '系统运维']
    }
  },
  methods: {
    toggleNav() {
      this.isCollapsed = !this.isCollapsed
    },
    getCategoriesBySubsystem(subsystem) {
      const routes = this.$router.getRoutes()
      const categories = new Set()
      routes.forEach(route => {
        if (
          route.meta &&
          route.meta.subsystem === subsystem &&
          route.meta.category
        ) {
          categories.add(route.meta.category)
        }
      })
      return Array.from(categories)
    },
    getRoutesBySubsystemAndCategory(subsystem, category) {
      return this.$router
        .getRoutes()
        .filter(
          route =>
            route.meta &&
            route.meta.subsystem === subsystem &&
            route.meta.category === category
        )
    }
  }
}
</script>

<style scoped>
.sidebar-container {
  position: relative;
  height: 100%;
}

/* 侧边栏基础样式 */
.side-nav {
  width: 220px; /* 展开宽度 */
  height: 100%;
  background: rgba(10, 15, 30, 0.95);
  border-right: 1px solid rgba(0, 243, 255, 0.1);
  display: flex;
  flex-direction: column;
  /* 关键：宽度过渡动画 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  white-space: nowrap; /* 防止收起时文字换行 */
}

/* 收起状态：保留 60px 宽度用于显示图标 */
.side-nav.is-collapsed {
  width: 60px;
}

/* 滚动容器 */
.nav-scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 11px 0;
}

/* 标题样式 */
.subsystem-title {
  color: #00f3ff;
  font-size: 11px;
  font-weight: 700;
  padding: 15px 20px 5px;
  opacity: 0.8;
  letter-spacing: 0.5px;
}
.category-title {
  color: #666;
  font-size: 11px;
  font-weight: 600;
  padding: 11px 20px 5px;
  text-transform: uppercase;
}

/* 菜单项样式 */
.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 20px;
  color: #aaa;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  border-left: 2px solid transparent;
  overflow: hidden; /* 隐藏超出的内容 */
}
.nav-item:hover {
  background: rgba(0, 243, 255, 0.05);
  color: #fff;
}
.nav-item.active {
  background: rgba(0, 243, 255, 0.08);
  color: #00f3ff;
  border-left-color: #00f3ff;
}

/* 图标在收起时居中显示 */
.side-nav.is-collapsed .nav-item {
  justify-content: center;
  padding: 11px 0;
}
.nav-icon {
  font-size: 16px;
  min-width: 16px; /* 保证图标占位 */
  text-align: center;
}

/* 浮动切换按钮 */
.floating-nav-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  z-index: 1000;
  background: rgba(0, 243, 255, 0.1);
  border: 1px solid rgba(0, 243, 255, 0.2);
  border-left: none;
  color: #00f3ff;
  cursor: pointer;
  border-radius: 0 4px 4px 0;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
