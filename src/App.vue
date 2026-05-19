<template>
  <div id="app">
    <!-- 登录页不需要导航 -->
    <template v-if="isLoginPage">
      <router-view />
    </template>

    <!-- 其他页面带侧边导航 -->
    <template v-else>
      <div class="app-layout">
        <!-- 顶部系统栏 -->
        <header class="system-header">
          <div class="logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">KILL CHAIN OS</span>
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
          <!-- 左侧导航 -->
          <nav class="side-nav">
            <div class="nav-section">
              <div class="nav-title">作战视图</div>
              <router-link
                v-for="item in mainMenus"
                :key="item.path"
                :to="item.path"
                class="nav-item"
                :class="{active: $route.path === item.path}"
              >
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-text">{{ item.name }}</span>
                <span v-if="item.badge" class="nav-badge">{{
                  item.badge
                }}</span>
              </router-link>
            </div>

            <div class="nav-section">
              <div class="nav-title">系统管理</div>
              <router-link
                v-for="item in sysMenus"
                :key="item.path"
                :to="item.path"
                class="nav-item"
                :class="{active: $route.path === item.path}"
              >
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-text">{{ item.name }}</span>
              </router-link>
            </div>
          </nav>

          <!-- 主内容区 -->
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
      timer: null
    }
  },

  computed: {
    isLoginPage() {
      return this.$route.path === '/login'
    },

    mainMenus() {
      return [
        {path: '/', name: '杀伤链路', icon: '🔗', badge: 'LIVE'},
        {path: '/dashboard', name: '态势 Dashboard', icon: '📊'},
        {path: '/network', name: '态势 network', icon: '📊'}
      ]
    },

    sysMenus() {
      return [{path: '/settings', name: '系统设置', icon: '⚙️'}]
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

body {
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  background: #050508;
  color: #e0e0e0;
  overflow: hidden;
}

#app {
  height: 100vh;
  width: 100vw;
}

/* 系统布局 */
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

/* 顶部系统栏 */
.system-header {
  height: 50px;
  background: rgba(10, 15, 30, 0.95);
  border-bottom: 1px solid rgba(0, 243, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  color: #00f3ff;
  text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  color: #00f3ff;
  letter-spacing: 2px;
}

.system-info {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 13px;
}

.time {
  color: #00f3ff;
  font-family: monospace;
}

.user {
  color: #888;
}

.logout-btn {
  background: rgba(255, 0, 60, 0.2);
  border: 1px solid #ff003c;
  color: #ff003c;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.logout-btn:hover {
  background: rgba(255, 0, 60, 0.3);
}

/* 主布局 */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边导航 */
.side-nav {
  width: 200px;
  background: rgba(10, 15, 30, 0.9);
  border-right: 1px solid rgba(0, 243, 255, 0.1);
  padding: 20px 0;
  overflow-y: auto;
  flex-shrink: 0;
}

.nav-section {
  margin-bottom: 30px;
}

.nav-title {
  color: #666;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 0 20px 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  color: #aaa;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.3s;
  position: relative;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(0, 243, 255, 0.05);
  color: #fff;
}

.nav-item.active {
  background: rgba(0, 243, 255, 0.1);
  color: #00f3ff;
  border-left-color: #00f3ff;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-badge {
  position: absolute;
  right: 15px;
  background: #ff003c;
  color: #fff;
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
  animation: pulse 2s infinite;
}

/* 内容区 */
.content-area {
  flex: 1;
  overflow: hidden;
  position: relative;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 243, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 243, 255, 0.5);
}
</style>
