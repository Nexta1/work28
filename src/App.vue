<template>
  <div id="app">
    <!-- 全屏粒子背景层 -->
    <div id="particle-bg">
      <div class="particle-layer"></div>
    </div>
    <div id="scan-beam"></div>
    <!-- 路由就绪后再渲染，防止刷新时登录页闪现菜单 -->
    <template v-if="routeReady">
      <!-- 菜单布局：仅在非登录页显示 -->
      <template v-if="!isLoginPage">
        <div class="app-layout">
          <header class="system-header">
            <div class="header-left">
              <button
                class="top-nav-btn left-expand-btn"
                @mouseenter="navVisible = true"
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

              <span class="user" v-if="userInfo" @click="showProfile = true">
                <Icon icon="lucide:user-circle" :size="16" class="user-icon" />
                <span class="user-name">{{ userInfo.name }}</span>
                <Icon
                  icon="lucide:chevron-down"
                  :size="12"
                  class="user-arrow"
                />
              </span>

              <button class="logout-btn" @click="logout">退出</button>
            </div>
          </header>

          <div class="main-layout">
            <!-- 悬浮侧边菜单（fixed定位，不占内容空间） -->
            <aside
              class="left-menu"
              :class="{visible: navVisible}"
              @mouseleave="navVisible = false"
            >
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
                  <div
                    class="subsystem-title"
                    @click="toggleSubsystem(subsystem)"
                  >
                    <span class="subsystem-text">{{ subsystem }}</span>
                    <Icon
                      icon="lucide:chevron-down"
                      :size="14"
                      class="subsystem-arrow"
                      :class="{collapsed: isSubsystemCollapsed(subsystem)}"
                    />
                  </div>

                  <transition name="menu-expand">
                    <div
                      class="modules-container"
                      v-show="!isSubsystemCollapsed(subsystem)"
                    >
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
                            :class="{
                              active:
                                getSubRoutes(category).length === 0 &&
                                $route.path === moduleRoute.path
                            }"
                            @click="handleModuleClick(moduleRoute, category)"
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
                              v-if="getSubRoutes(category).length > 0"
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
                                :class="{active: $route.path === subRoute.path}"
                              >
                                <Icon
                                  :icon="
                                    subRoute.meta.icon || 'lucide:file-text'
                                  "
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
                  </transition>
                </div>
              </div>
            </aside>

            <main class="content-area">
              <router-view v-if="!isLoginPage" />
            </main>
          </div>
        </div>
      </template>
      <!-- 登录页：全屏居中，无菜单布局 -->
      <router-view v-if="isLoginPage" />
    </template>
    <!-- 全局新告警通知 -->
    <new-alert-notification
      :visible="showAlertNotification"
      :alert-count="alertNotificationCount"
      :latest-alert="latestAlertInfo"
      @close="handleAlertClose"
      @ignore="handleAlertConfirmed"
      @snooze="handleAlertConfirmed"
      @goto-alarm="handleAlertConfirmed"
    />
    <!-- 个人信息弹窗 -->
    <user-profile-dialog
      :visible="showProfile"
      :user="userInfo || {}"
      @close="showProfile = false"
    />
  </div>
</template>

<script>
import NewAlertNotification from '@/components/NewAlertNotification.vue'
import UserProfileDialog from '@/components/UserProfileDialog.vue'
import {getLatestWarnInfo} from '@/api/warnInfo'

export default {
  name: 'App',
  components: {
    NewAlertNotification,
    UserProfileDialog
  },

  data() {
    return {
      routeReady: false,
      currentTime: '',
      timer: null,
      navVisible: false,
      collapsedCategories: {},
      collapsedSubsystems: {},
      // 个人信息弹窗
      showProfile: false,
      // 新告警通知
      showAlertNotification: false,
      alertNotificationCount: 0,
      latestAlertInfo: null,
      alertCheckTimer: null
    }
  },

  computed: {
    isLoginPage() {
      return this.$route && this.$route.path === '/login'
    },
    userInfo() {
      return this.$store.getters.currentUser
    },

    subsystems() {
      return ['体系运营管理', '资源和数据管理', '系统运维']
    },

    currentMenuTitle() {
      return this.$route.meta?.title || '体系运营管理'
    }
  },

  mounted() {
    // 等待路由就绪后再渲染，防止刷新时登录页闪现菜单背景
    this.$router.onReady(() => {
      this.routeReady = true
    })
    this.updateTime()
    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)
    this.$store.dispatch('restoreSession')
    // 刷新用户信息（从服务端获取最新数据，更新 localStorage 和 store）
    this.$store.dispatch('fetchCurrentUser')
    // 启动告警检查
    this.startAlertCheck()
    // 监听路由变化：如果用户自行进入告警页面，关闭通知并确认
    this.$router.afterEach(to => {
      if (to.path === '/alarm-monitoring') {
        if (this.showAlertNotification) {
          this.showAlertNotification = false
          this.handleAlertConfirmed()
        }
      }
    })
  },

  beforeDestroy() {
    clearInterval(this.timer)
    this.stopAlertCheck()
  },

  methods: {
    toggleNav() {
      this.navVisible = !this.navVisible
    },

    handleModuleClick(moduleRoute, category) {
      const hasSubRoutes = this.getSubRoutes(category).length > 0

      if (hasSubRoutes) {
        this.toggleCategory(category)
      } else {
        if (this.$route.path !== moduleRoute.path) {
          this.$router.push(moduleRoute.path)
        }
      }
    },

    toggleCategory(category) {
      this.$set(
        this.collapsedCategories,
        category,
        !this.collapsedCategories[category]
      )
    },

    isCategoryExpanded(category) {
      return !this.collapsedCategories[category]
    },

    toggleSubsystem(subsystem) {
      this.$set(
        this.collapsedSubsystems,
        subsystem,
        !this.collapsedSubsystems[subsystem]
      )
    },

    isSubsystemCollapsed(subsystem) {
      return !!this.collapsedSubsystems[subsystem]
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

    logout() {
      this.stopAlertCheck()
      this.clearSnoozeMarkers()
      // 清除告警确认时间，下次登录时重新初始化
      localStorage.removeItem('alert_last_check_time')
      this.$store.dispatch('logout')
    },

    // ===================================================================
    // 新告警通知轮询
    // ===================================================================

    /**
     * 判断是否在免打扰期内（被忽略或被 snooze）
     */
    isInSnoozePeriod() {
      const snoozeUntil = localStorage.getItem('alert_snooze_until')
      if (snoozeUntil) {
        const expireTime = Number(snoozeUntil)
        if (Date.now() < expireTime) {
          return true
        }
        // 已过期，清除
        localStorage.removeItem('alert_snooze_until')
      }
      const ignoreUntil = localStorage.getItem('alert_ignore_until')
      if (ignoreUntil) {
        const expireTime = Number(ignoreUntil)
        // 忽略标记有效期为 30 秒（避免刷新后立即再次弹出）
        if (Date.now() - expireTime < 30000) {
          return true
        }
        localStorage.removeItem('alert_ignore_until')
      }
      return false
    },

    /**
     * 清除所有免打扰标记
     */
    clearSnoozeMarkers() {
      localStorage.removeItem('alert_snooze_until')
      localStorage.removeItem('alert_ignore_until')
    },

    /**
     * 获取上次已确认的告警时间戳（用户已查看或已忽略）
     */
    getLastConfirmedTime() {
      return Number(localStorage.getItem('alert_last_check_time') || 0)
    },

    /**
     * 检查是否有新告警
     * 只提醒 lastConfirmedTime 之后产生的新告警
     */
    async checkNewAlerts() {
      if (!this.$store.getters.isAuthenticated || this.isLoginPage) {
        return
      }
      // 已在告警页面时不再弹窗提醒
      if (this.$route.path === '/alarm-monitoring') {
        return
      }
      if (this.isInSnoozePeriod()) {
        return
      }
      // 已弹窗时不再重复检查
      if (this.showAlertNotification) {
        return
      }
      try {
        const res = await getLatestWarnInfo()
        const list = res.data || res.list || []
        if (list.length === 0) return

        const lastConfirmed = this.getLastConfirmedTime()

        // 首次登录：将 lastConfirmed 初始化为当前时间，不弹历史告警
        if (!lastConfirmed && list.length > 0) {
          localStorage.setItem('alert_last_check_time', String(Date.now()))
          return
        }

        // 过滤出上次确认之后的新告警
        const newAlerts = list.filter(item => {
          const ts = Number(item.warnTimestamp) || 0
          return ts > lastConfirmed
        })

        if (newAlerts.length > 0) {
          this.alertNotificationCount = newAlerts.length
          this.latestAlertInfo = newAlerts[0]
          this.showAlertNotification = true
        }
      } catch (e) {
        // 静默失败，不干扰用户
      }
    },

    /**
     * 启动告警轮询
     */
    startAlertCheck() {
      this.stopAlertCheck()
      // 路由就绪后首次检查
      this.$router.onReady(() => {
        // 延迟 3 秒，确保登录流程完成
        setTimeout(() => {
          this.checkNewAlerts()
        }, 3000)
      })
      // 每 60 秒轮询一次
      this.alertCheckTimer = setInterval(() => {
        this.checkNewAlerts()
      }, 60000)
    },

    /**
     * 停止告警轮询
     */
    stopAlertCheck() {
      if (this.alertCheckTimer) {
        clearInterval(this.alertCheckTimer)
        this.alertCheckTimer = null
      }
    },

    /**
     * 关闭通知
     */
    handleAlertClose() {
      this.showAlertNotification = false
    },

    /**
     * 用户确认（忽略/暂不提醒/查看告警）
     * 更新 lastConfirmedTime，防止同一批告警再次弹出
     */
    handleAlertConfirmed() {
      localStorage.setItem('alert_last_check_time', String(Date.now()))
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
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #050508;
  color: #e0e0e0;
  font-size: 13px;
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

.time {
  color: #64748b;
  font-size: 12px;
  font-family: monospace;
  letter-spacing: 0.5px;
}
.user {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px 4px 10px;
  border-radius: 6px;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  user-select: none;
}
.user:hover {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.15);
  color: #f1f5f9;
}
.user-icon {
  color: #38bdf8;
  flex-shrink: 0;
}
.user-name {
  font-weight: 500;
}
.user-arrow {
  color: #475569;
  transition: transform 0.2s ease;
}
.user:hover .user-arrow {
  color: #38bdf8;
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
  border-radius: 11px;
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
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* ========== 悬浮侧边菜单 ========== */
.left-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  z-index: 10000;
  background: linear-gradient(180deg, #0b1220 0%, #070b14 100%);
  border-right: 1px solid rgba(120, 210, 255, 0.12);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 30px rgba(0, 0, 0, 0.5);
  transform: translateX(-100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.left-menu.visible {
  transform: translateX(0);
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
  padding: 14px 22px 11px;
  color: #7cecff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s ease;
}

.subsystem-title:hover {
  background: rgba(124, 236, 255, 0.03);
}

.subsystem-arrow {
  color: #475569;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.15s ease;
}

.subsystem-arrow.collapsed {
  transform: rotate(180deg);
  color: #64748b;
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
  font-size: 14px;
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

/* 🛠️ 核心补丁：让无子集的一级菜单在激活时拥有高亮视觉表现 */
.module-item.active {
  background: rgba(0, 243, 255, 0.12);
  color: #7cecff;
  border-color: rgba(124, 236, 255, 0.16);
  box-shadow: 0 0 8px rgba(0, 243, 255, 0.06);
}

/* 一级激活时内部图标的电光高亮感知 */
.module-item.active .nav-icon {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.7)) !important;
}

.module-arrow {
  margin-left: auto;
  flex-shrink: 0;
  transition:
    transform 0.2s ease,
    color 0.15s ease !important;
}

.module-arrow.expanded {
  transform: rotate(90deg) !important;
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
  padding: 11px 12px;
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
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top, #0c1529 0%, #050508 60%);
}

.menu-expand-enter-active,
.menu-expand-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    max-height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  transform-origin: top;
}

.menu-expand-enter,
.menu-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
  max-height: 0 !important;
}

.menu-expand-enter-to,
.menu-expand-leave {
  opacity: 1;
  transform: translateY(0);
  max-height: 1200px;
}

/* ===================================================================
   ⚡ 图标高亮控制
   =================================================================== */
.top-nav-btn.left-expand-btn .nav-icon,
.top-nav-btn.left-expand-btn svg {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
}

.module-item .nav-icon {
  color: #94a3b8 !important;
  transition:
    color 0.15s ease-in-out,
    filter 0.15s ease-in-out;
}

.module-item:hover .nav-icon {
  color: #06b6d4 !important;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.6));
}

.module-arrow {
  color: #475569 !important;
}

.module-arrow.expanded {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 4px rgba(56, 189, 248, 0.4));
}

.nav-item .nav-icon {
  color: #64748b !important;
  transition: all 0.15s ease-in-out;
}

.nav-item:hover .nav-icon {
  color: #cbd5e1 !important;
}

.nav-item.active .nav-icon {
  color: #38bdf8 !important;
  filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.7)) !important;
}

.collapse-btn {
  background: rgba(6, 182, 212, 0.08) !important;
  border: 1px solid rgba(6, 182, 212, 0.2) !important;
  color: #06b6d4 !important;
}

.collapse-btn:hover {
  background: #06b6d4 !important;
  color: #03060c !important;
  box-shadow: 0 0 11px rgba(6, 182, 212, 0.4) !important;
}
</style>
