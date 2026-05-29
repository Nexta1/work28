<template>
  <div id="app">
    <template v-if="isLoginPage">
      <router-view />
    </template>

    <template v-else>
      <div class="app-layout">
        <!-- 顶部 -->
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
            <span class="time">
              {{ currentTime }}
            </span>

            <span class="user" v-if="userInfo">
              {{ userInfo.name }} | {{ userInfo.role }}
            </span>

            <button class="logout-btn" @click="logout">退出</button>
          </div>
        </header>

        <!-- 主体 -->
        <div class="main-layout">
          <!-- 左侧菜单 -->
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
                <!-- 子系统标题 -->
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
                      <!-- 父级菜单 -->
                      <div
                        v-for="moduleRoute in getModuleRoutes(
                          subsystem,
                          category
                        )"
                        :key="moduleRoute.path"
                        class="module-item"
                        @click="toggleCategory(category)"
                      >
                        <span class="nav-icon">
                          {{ moduleRoute.meta.icon }}
                        </span>

                        <span class="nav-text">
                          {{ moduleRoute.meta.title }}
                        </span>

                        <span class="module-arrow">
                          {{ isCategoryExpanded(category) ? '▼' : '▶' }}
                        </span>
                      </div>

                      <!-- 子菜单 -->
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
                            <span class="nav-icon">
                              {{ subRoute.meta.icon }}
                            </span>

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

          <!-- 内容区域 -->
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

    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)

    this.loadUserInfo()
  },

  beforeDestroy() {
    clearInterval(this.timer)
  },

  methods: {
    // 左侧菜单显示隐藏
    toggleNav() {
      this.navVisible = !this.navVisible
    },

    // 展开收缩
    toggleCategory(category) {
      this.$set(
        this.expandedCategories,
        category,
        !this.expandedCategories[category]
      )
    },

    // 是否展开
    isCategoryExpanded(category) {
      return this.expandedCategories[category] !== false
    },

    // 获取分类
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

    // 获取模块
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

    // 获取子菜单
    getSubRoutes(module) {
      return this.$router
        .getRoutes()
        .filter(route => route.meta && route.meta.parentModule === module)
    },

    // 更新时间
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

    // 用户信息
    loadUserInfo() {
      const saved = localStorage.getItem('userInfo')

      if (saved) {
        this.userInfo = JSON.parse(saved)
      }
    },

    // 退出
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
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, 'Noto Sans', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei',
    sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';

  /* 字体平滑抗锯齿渲染优化，配合解决清晰度不一致问题 */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #050508;
  color: #e0e0e0;
}

/* =========================
   主布局
========================= */

.app-layout {
  display: flex;
  flex-direction: column;

  width: 100%;
  height: 100%;
}

/* =========================
   顶部
========================= */

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

/* =========================
   按钮
========================= */

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

/* =========================
   主区域
========================= */

.main-layout {
  flex: 1;

  display: flex;

  overflow: hidden;
}

/* =========================
   左侧菜单
========================= */

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

/* 修复收缩压扁文字 */
.left-menu * {
  white-space: nowrap;
}

/* =========================
   菜单头部
========================= */

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

/* =========================
   菜单内容
========================= */

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

  font-size: 15px;
  font-weight: 700;

  letter-spacing: 1px;
}

/* =========================
   父菜单
========================= */

.module-item {
  position: relative;

  display: flex;
  align-items: center;

  gap: 12px;

  margin: 6px 12px;

  padding: 13px 14px;

  border-radius: 12px;

  color: #aebed1;

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

  font-size: 10px;

  flex-shrink: 0;
}

/* =========================
   子菜单
========================= */

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

  font-size: 13px;

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

/* =========================
   图标
========================= */

.nav-icon {
  width: 18px;

  flex-shrink: 0;

  text-align: center;
}

.nav-text {
  overflow: hidden;

  text-overflow: ellipsis;
}

/* =========================
   内容区
========================= */

.content-area {
  flex: 1;

  overflow: auto;

  background: radial-gradient(circle at top, #0c1529 0%, #050508 60%);
}

/* =========================
   子菜单动画
========================= */

.menu-expand-enter-active,
.menu-expand-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    max-height 0.22s ease;

  overflow: hidden;

  transform-origin: top;
}

.menu-expand-enter {
  opacity: 0;
  transform: translateY(-6px);

  max-height: 0;
}

.menu-expand-enter-to {
  opacity: 1;
  transform: translateY(0);

  max-height: 500px;
}

.menu-expand-leave {
  opacity: 1;
  transform: translateY(0);

  max-height: 500px;
}

.menu-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);

  max-height: 0;
}
</style>
