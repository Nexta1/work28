<template>
  <div id="app">
    <template v-if="isLoginPage">
      <router-view />
    </template>

    <template v-else>
      <div class="app-layout">
        <header class="system-header">
          <div class="header-left">
            <button
              v-if="!navVisible"
              class="top-nav-btn left-expand-btn"
              @click="toggleNav"
            >
              <Icon icon="lucide:menu" :size="16" />
            </button>

            <div class="header-page-title">
              {{ currentMenuTitle }}
            </div>
          </div>

          <div class="system-info">
            <span class="time">
              {{ currentTime }}
            </span>

            <span class="user" v-if="userInfo">
              {{ userInfo.name }} | {{ userInfo.role }}
            </span>

            <button class="logout-btn" @click="logout">退出</button>
          </div>
        </header>

        <div class="main-layout">
          <aside class="left-menu" :class="{hidden: !navVisible}">
            <div class="menu-header">
              <div class="menu-title">体系运营管理</div>

              <button class="collapse-btn" @click="toggleNav">
                <Icon icon="lucide:chevron-left" :size="16" />
              </button>
            </div>

            <div class="menu-content">
              <div
                v-for="subsystem in subsystems"
                :key="subsystem"
                class="subsystem-block"
              >
                <div class="subsystem-title">
                  {{ subsystem }}
                </div>

                <div class="modules-container">
                  <div
                    v-for="category in getCategoriesBySubsystem(subsystem)"
                    :key="category"
                    class="module-group"
                  >
                    <template
                      v-if="getModuleRoutes(subsystem, category).length > 0"
                    >
                      <div
                        v-for="moduleRoute in getModuleRoutes(
                          subsystem,
                          category
                        )"
                        :key="moduleRoute.path"
                        class="module-item"
                        @click="toggleCategory(category)"
                      >
                        <Icon
                          :icon="moduleRoute.meta.icon || 'lucide:box'"
                          :size="18"
                          class="nav-icon"
                        />

                        <span class="nav-text">
                          {{ moduleRoute.meta.title }}
                        </span>

                        <Icon
                          icon="lucide:chevron-right"
                          :size="14"
                          class="module-arrow"
                          :class="{expanded: isCategoryExpanded(category)}"
                        />
                      </div>

                      <transition name="menu-expand">
                        <div
                          v-if="
                            isCategoryExpanded(category) &&
                            getSubRoutes(category).length > 0
                          "
                          class="sub-items-container"
                        >
                          <router-link
                            v-for="subRoute in getSubRoutes(category)"
                            :key="subRoute.path"
                            :to="subRoute.path"
                            class="nav-item"
                            :class="{
                              active: $route.path === subRoute.path
                            }"
                          >
                            <Icon
                              :icon="subRoute.meta.icon || 'lucide:file-text'"
                              :size="16"
                              class="nav-icon"
                            />

                            <span class="nav-text">
                              {{ subRoute.meta.title }}
                            </span>
                          </router-link>
                        </div>
                      </transition>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main class="content-area">
            <router-view />
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
// 🟢 移除了所有关于 Vue.component('Icon') 的代码，保持干净！
export default {
  name: 'App',

  data() {
    return {
      currentTime: '',
      userInfo: null,
      timer: null,
      navVisible: true,
      expandedCategories: {}
    }
  },

  computed: {
    isLoginPage() {
      return this.$route.path === '/login'
    },

    subsystems() {
      return ['体系运营管理', '资源和数据管理', '系统运维']
    },

    currentMenuTitle() {
      return this.$route.meta?.title || '体系运营管理'
    }
  },

  mounted() {
    this.updateTime()

    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)

    this.loadUserInfo()
  },

  beforeDestroy() {
    clearInterval(this.timer)
  },

  methods: {
    toggleNav() {
      this.navVisible = !this.navVisible
    },

    toggleCategory(category) {
      this.$set(
        this.expandedCategories,
        category,
        !this.expandedCategories[category]
      )
    },

    isCategoryExpanded(category) {
      return this.expandedCategories[category] !== false
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

    getModuleRoutes(subsystem, category) {
      return this.$router
        .getRoutes()
        .filter(
          route =>
            route.meta &&
            route.meta.subsystem === subsystem &&
            route.meta.category === category &&
            route.meta.isModule
        )
    },

    getSubRoutes(module) {
      return this.$router
        .getRoutes()
        .filter(route => route.meta && route.meta.parentModule === module)
    },

    updateTime() {
      const now = new Date()
      this.currentTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    },

    loadUserInfo() {
      const saved = localStorage.getItem('userInfo')
      if (saved) {
        this.userInfo = JSON.parse(saved)
      }
    },

    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      this.$router.push('/login')
    }
  }
}
</script>

<style>
/* 保持刚才调好的所有样式不变 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #050508;
  color: #e0e0e0;
}

.app-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.system-header {
  height: 56px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(10, 15, 30, 0.96);
  border-bottom: 1px solid rgba(0, 243, 255, 0.18);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-page-title {
  color: #f4f7fb;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 1px;
  border-left: 3px solid #00f3ff;
  padding-left: 14px;
}

.system-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.time,
.user {
  color: #c7d2e3;
  font-size: 13px;
}

.top-nav-btn,
.logout-btn,
.collapse-btn {
  border: none;
  outline: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.top-nav-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(0, 243, 255, 0.08);
  color: #7cecff;
  border: 1px solid rgba(0, 243, 255, 0.16);
}

.top-nav-btn:hover {
  background: rgba(0, 243, 255, 0.16);
  transform: translateY(-1px);
}

.logout-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  background: rgba(255, 80, 80, 0.15);
  color: #ff7b7b;
  border: 1px solid rgba(255, 80, 80, 0.2);
  font-size: 13px;
}

.logout-btn:hover {
  background: rgba(255, 80, 80, 0.25);
}

.collapse-btn {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: rgba(0, 243, 255, 0.1);
  color: #00f3ff;
}

.collapse-btn:hover {
  background: rgba(0, 243, 255, 0.2);
}

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-menu {
  width: 280px;
  flex-shrink: 0;
  background: linear-gradient(180deg, #0b1220 0%, #070b14 100%);
  border-right: 1px solid rgba(120, 210, 255, 0.12);
  transition:
    width 0.28s ease,
    border 0.28s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.02);
}

.left-menu.hidden {
  width: 0;
  border-right: none;
}

.left-menu * {
  white-space: nowrap;
}

.menu-header {
  height: 64px;
  flex-shrink: 0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(120, 210, 255, 0.08);
  background: rgba(255, 255, 255, 0.015);
}

.menu-title {
  color: #eef7ff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
}

.subsystem-block {
  margin-bottom: 14px;
}

.subsystem-title {
  padding: 16px 22px 10px;
  color: #7cecff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
}

.module-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 12px;
  padding: 11px 14px;
  border-radius: 12px;
  color: #aebed1;
  font-size: 14px; /* 固定菜单字号 */
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.module-item:hover {
  background: rgba(124, 236, 255, 0.08);
  color: #ffffff;
  border-color: rgba(124, 236, 255, 0.12);
}

.module-arrow {
  margin-left: auto;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  color: #8a98ad;
}

.module-arrow.expanded {
  transform: rotate(90deg);
  color: #7cecff;
}

.sub-items-container {
  overflow: hidden;
  padding-left: 12px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 12px 4px 28px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #8a98ad;
  text-decoration: none;
  border: 1px solid transparent;
  font-size: 13px; /* 固定子菜单字号 */
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(124, 236, 255, 0.06);
  color: #b8c5d4;
  border-color: rgba(124, 236, 255, 0.1);
}

.nav-item.active {
  background: rgba(0, 243, 255, 0.12);
  color: #7cecff;
  border-color: rgba(124, 236, 255, 0.16);
  box-shadow: 0 0 8px rgba(0, 243, 255, 0.06);
}

.nav-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.content-area {
  flex: 1;
  overflow: auto;
  background: radial-gradient(circle at top, #0c1529 0%, #050508 60%);
}

.menu-expand-enter-active,
.menu-expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform-origin: top;
}

.menu-expand-enter,
.menu-expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

.menu-expand-enter-to,
.menu-expand-leave {
  opacity: 1;
  transform: translateY(0);
  max-height: 600px;
}
/* ===================================================================
   ⚡ 增量修正补丁：左侧菜单栏及顶部图标科技色彩注入
   =================================================================== */

/* 1. 顶部面包屑/折叠按钮图标默认颜色 */
.top-nav-btn.left-expand-btn .nav-icon,
.top-nav-btn.left-expand-btn svg {
  color: #38bdf8 !important; /* 锁定战术高亮蓝 */
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
}

/* 2. 一级模块项 (Module Item) 图标常态与悬浮 */
.module-item .nav-icon {
  color: #94a3b8 !important; /* 默认使用中性标签灰蓝 */
  transition:
    color 0.15s ease-in-out,
    filter 0.15s ease-in-out;
}

.module-item:hover .nav-icon {
  color: #06b6d4 !important; /* 悬浮时变为科技青色 */
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.6)); /* 赋予电光微弱荧光感 */
}

/* 一级右侧折叠小箭头状态 */
.module-arrow {
  color: #475569 !important; /* 默认暗灰不抢眼 */
  transition:
    transform 0.2s ease,
    color 0.15s ease-in-out !important;
}

.module-arrow.expanded {
  color: #38bdf8 !important; /* 展开后激活战术蓝 */
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
}

/* 3. 二级子路由项 (Nav Item) 图标常态、悬浮与高亮激活 */
.nav-item .nav-icon {
  color: #64748b !important; /* 次级图标默认更暗一点，保证层级 */
  transition: all 0.15s ease-in-out;
}

/* 子项悬浮时 */
.nav-item:hover .nav-icon {
  color: #cbd5e1 !important; /* 悬浮时跟随字色变亮灰白 */
}

/* 子项被选中激活时 (Active) */
.nav-item.active .nav-icon {
  color: #38bdf8 !important; /* 核心激活：战术高亮蓝 */
  filter: drop-shadow(
    0 0 8px rgba(56, 189, 248, 0.7)
  ) !important; /* 强力高光感知 */
}

/* 4. 菜单折叠控制按钮内部图标 */
.collapse-btn {
  background: rgba(6, 182, 212, 0.08) !important;
  border: 1px solid rgba(6, 182, 212, 0.2) !important;
  color: #06b6d4 !important; /* 科技青 */
}

.collapse-btn:hover {
  background: #06b6d4 !important;
  color: #03060c !important; /* 反黑高亮感知，对齐全局按钮逻辑 */
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.4) !important;
}
</style>
