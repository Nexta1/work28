<template>
  <div class="login-page">
    <div class="cyber-grid"></div>

    <div class="login-box">
      <div class="login-header">
        <div class="logo-large">⚡</div>
        <h1>KILL CHAIN OS</h1>
        <p>杀伤链路构建系统</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>用户名</label>
          <input
            type="text"
            v-model="form.username"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="form-group">
          <label>密码</label>
          <input
            type="password"
            v-model="form.password"
            placeholder="请输入密码"
            required
          />
        </div>

        <div class="form-options">
          <label class="remember">
            <input type="checkbox" v-model="form.remember" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot">忘记密码?</a>
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '进入系统' }}
        </button>
      </form>

      <div class="login-footer">
        <p>系统版本 v2.6.4 | 军事机密 严禁外泄</p>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="decoration-circle c1"></div>
    <div class="decoration-circle c2"></div>
    <div class="decoration-circle c3"></div>
  </div>
</template>

<script>
export default {
  name: 'Login',

  data() {
    return {
      form: {
        username: '',
        password: '',
        remember: false
      },
      loading: false
    }
  },

  methods: {
    handleLogin() {
      this.loading = true

      // 模拟登录（实际项目中替换为真实API）
      setTimeout(() => {
        localStorage.setItem('token', 'mock-token-' + Date.now())
        localStorage.setItem(
          'userInfo',
          JSON.stringify({
            name: this.form.username || '指挥员',
            role: '高级指挥官',
            id: 'CMD-001'
          })
        )

        this.$router.push('/')
        this.loading = false
      }, 1000)
    }
  }
}
</script>

<style scoped>
.login-page {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050508;
  position: relative;
  overflow: hidden;
}

.cyber-grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
      rgba(0, 243, 255, 0.03) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.login-box {
  background: rgba(10, 15, 30, 0.95);
  border: 1px solid rgba(0, 243, 255, 0.3);
  border-radius: 8px;
  padding: 40px;
  width: 400px;
  position: relative;
  z-index: 10;
  box-shadow: 0 0 40px rgba(0, 243, 255, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo-large {
  font-size: 48px;
  margin-bottom: 10px;
  animation: pulse 2s infinite;
}

.login-header h1 {
  color: #00f3ff;
  font-size: 20px;
  letter-spacing: 3px;
  margin-bottom: 5px;
}

.login-header p {
  color: #666;
  font-size: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #888;
  font-size: 12px;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group input {
  width: 100%;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 243, 255, 0.2);
  color: #fff;
  padding: 12px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #00f3ff;
  box-shadow: 0 0 10px rgba(0, 243, 255, 0.2);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 12px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #888;
  cursor: pointer;
}

.remember input {
  accent-color: #00f3ff;
}

.forgot {
  color: #00f3ff;
  text-decoration: none;
}

.forgot:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 243, 255, 0.2),
    rgba(0, 243, 255, 0.1)
  );
  border: 1px solid #00f3ff;
  color: #00f3ff;
  padding: 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.login-btn:hover:not(:disabled) {
  background: rgba(0, 243, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 243, 255, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.login-footer p {
  color: #444;
  font-size: 11px;
}

/* 装饰圆圈 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(0, 243, 255, 0.1);
  pointer-events: none;
}

.c1 {
  width: 600px;
  height: 600px;
  top: -200px;
  right: -200px;
  animation: rotate 30s linear infinite;
}

.c2 {
  width: 400px;
  height: 400px;
  bottom: -100px;
  left: -100px;
  animation: rotate 20s linear infinite reverse;
}

.c3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-color: rgba(255, 0, 60, 0.1);
  animation: pulse 4s ease-in-out infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}
</style>
