
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
              ☰
            </button>

            <div class="header-page-title">
              {{ currentMenuTitle }}
            </div>
          </div>

          <div class="system-info">
            <span class="time">{{ currentTime }}</span>
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

              <button class="collapse-btn" @click="toggleNav">◀</button>
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
                    <template v-if="getModuleRoutes(subsystem, category).length > 0">
                      <router-link
                        v-for="moduleRoute in getModuleRoutes(subsystem, category)"
                        :key="moduleRoute.path"
                        :to="moduleRoute.path"
                        class="module-item"
                        :class="{active: $route.path === moduleRoute.path}"
                      >
                        <span class="nav-icon">{{ moduleRoute.meta.icon }}</span>
                        <span class="nav-text">{{ moduleRoute.meta.title }}</span>
                        <span
                          v-if="getSubRoutes(category).length > 0"
                          class="module-arrow"
                          @click.prevent="toggleCategory(category)"
                        >
                          {{ isCategoryExpanded(category) ? '▼' : '▶' }}
                        </span>
                      </router-link>

                      <transition name="expand">
                        <div
                          v-if="isCategoryExpanded(category) && getSubRoutes(category).length > 0"
                          class="sub-items-container"
                        >
                          <router-link
                            v-for="subRoute in getSubRoutes(category)"
                            :key="subRoute.path"
                            :to="subRoute.path"
                            class="nav-item"
                            :class="{active: $route.path === subRoute.path}"
                          >
                            <span class="nav-icon">{{ subRoute.meta.icon }}</span>
                            <span class="nav-text">{{ subRoute.meta.title }}</span>
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
    this.timer = setInterval(this.updateTime, 1000)
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
      this.$set(this.expandedCategories, category, !this.expandedCategories[category])
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

    getRoutesBySubsystemAndCategory(subsystem, category) {
      return this.$router
        .getRoutes()
        .filter(
          route =>
            route.meta &&
            route.meta.subsystem === subsystem &&
            route.meta.category === category
        )
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
        .filter(
          route =>
            route.meta &&
            route.meta.parentModule === module
        )
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'PingFang SC', 'Microsoft YaHei', sans-serif;
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
  padding: 0 8px;
  border-left: 3px solid #00f3ff;
  padding-left: 14px;
}

.system-info {
  display: flex;
  align-items: center;
  gap: 14px;
}

.top-nav-btn,
.logout-btn,
.collapse-btn {
  border: none;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.top-nav-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(0, 243, 255, 0.08);
  color: #7cecff;
  border: 1px solid rgba(0, 243, 255, 0.16);
  font-size: 18px;
  font-weight: 700;
}

.top-nav-btn:hover {
  background: rgba(0, 243, 255, 0.16);
  transform: translateY(-1px);
}

.left-expand-btn {
  margin-right: 4px;
}

.logout-btn {
  height: 32px;
  padding: 0 14px;
  border-radius: 6px;
  background: rgba(255, 80, 80, 0.15);
  color: #ff7b7b;
  border: 1px solid rgba(255, 80, 80, 0.2);
}

.logout-btn:hover {
  background: rgba(255, 80, 80, 0.25);
}

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-menu {
  width: 280px;
  background: linear-gradient(180deg, #0b1220 0%, #070b14 100%);
  border-right: 1px solid rgba(120, 210, 255, 0.12);
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.02);
}

.left-menu.hidden {
  width: 0;
  min-width: 0;
  border-right: none;
}

.menu-header {
  height: 64px;
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
  line-height: 1.2;
  letter-spacing: 1px;
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

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px 0;
}

.subsystem-block {
  margin-bottom: 14px;
}

.subsystem-title {
  padding: 16px 22px 10px;
  color: #7cecff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}

.module-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 6px 12px;
  padding: 13px 14px;
  color: #aebed1;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 12px;
  border: 1px solid transparent;
  font-weight: 600;
}

.module-item:hover {
  background: rgba(124, 236, 255, 0.08);
  color: #ffffff;
  border-color: rgba(124, 236, 255, 0.12);
}

.module-item.active {
  background: linear-gradient(
    90deg,
    rgba(0, 243, 255, 0.16),
    rgba(0, 243, 255, 0.04)
  );
  color: #7cecff;
  border-color: rgba(124, 236, 255, 0.18);
  box-shadow: 0 0 12px rgba(0, 243, 255, 0.08);
}

.module-arrow {
  margin-left: auto;
  font-size: 10px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.sub-items-container {
  padding-left: 12px;
  overflow: hidden;
}

.category-title {
  padding: 8px 22px;
  color: #6f8199;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.2s ease;
  user-select: none;
}

.category-title:hover {
  color: #7cecff;
}

.category-title.expanded {
  color: #7cecff;
}

.category-arrow {
  font-size: 10px;
  display: inline-block;
  transition: transform 0.2s ease;
}

.nav-items-container {
  overflow: hidden;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave {
  opacity: 1;
  max-height: 500px;
}

.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 12px 4px 28px;
  padding: 10px 12px;
  color: #8a98ad;
  text-decoration: none;
  transition: all 0.2s ease;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 13px;
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
  width: 18px;
  text-align: center;
}

.nav-text {
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.content-area {
  flex: 1;
  overflow: auto;
  background: radial-gradient(circle at top, #0c1529 0%, #050508 60%);
}

.time,
.user {
  color: #c7d2e3;
  font-size: 13px;
}
</style>
