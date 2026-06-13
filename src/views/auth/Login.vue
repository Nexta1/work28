<template>
  <div class="login-page">
    <div class="cyber-grid"></div>

    <div class="login-box">
      <div class="login-header">
        <div class="logo-large">
          <Icon icon="mdi:shield-check" :size="52" color="#00f3ff" />
        </div>
        <h1>体系运控分系统</h1>
        <p>SYSTEM CONTROL PLATFORM</p>
      </div>

      <el-alert
        v-if="errorMsg"
        :title="errorMsg"
        type="error"
        show-icon
        :closable="true"
        @close="errorMsg = ''"
        style="margin-bottom: 16px"
      />

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>
            <Icon
              icon="mdi:account-outline"
              :size="14"
              color="#00f3ff"
              style="vertical-align: middle; margin-right: 4px"
            />
            登录账号
          </label>
          <el-input
            v-model="form.userCode"
            placeholder="请输入登录账号"
            autocomplete="username"
            size="small"
          />
        </div>

        <div class="form-group">
          <label>
            <Icon
              icon="mdi:lock-outline"
              :size="14"
              color="#00f3ff"
              style="vertical-align: middle; margin-right: 4px"
            />
            登录密码
          </label>
          <el-input
            v-model="form.userPassword"
            type="password"
            placeholder="请输入密码"
            autocomplete="current-password"
            size="small"
            show-password
          />
        </div>

        <button type="submit" class="login-btn" :disabled="loading">
          <span v-if="loading">
            <Icon
              icon="mdi:loading"
              :size="16"
              class="spin-icon"
              style="vertical-align: middle; margin-right: 6px"
            />
          </span>
          <span v-else>
            <Icon
              icon="mdi:login"
              :size="16"
              style="vertical-align: middle; margin-right: 6px"
            />
          </span>
          {{ loading ? '验证中...' : '进入系统' }}
        </button>
      </form>

      <div class="login-footer">
        <p>
          <Icon
            icon="mdi:security"
            :size="12"
            style="vertical-align: middle; margin-right: 4px"
          />
          系统版本 v2.6.4 | 军事机密 严禁外泄
        </p>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="decoration-circle c1"></div>
    <div class="decoration-circle c2"></div>
    <div class="decoration-circle c3"></div>

    <!-- 角落粒子 -->
    <div class="corner-tl"></div>
    <div class="corner-br"></div>
  </div>
</template>

<script>
export default {
  name: 'Login',

  data() {
    return {
      form: {
        userCode: '',
        userPassword: ''
      },
      loading: false,
      errorMsg: ''
    }
  },

  methods: {
    async handleLogin() {
      this.loading = true
      this.errorMsg = ''

      try {
        await this.$store.dispatch('login', {
          userCode: this.form.userCode,
          userPassword: this.form.userPassword
        })
        this.$router.push('/')
      } catch (e) {
        this.errorMsg = e.message || '登录失败，请检查账号密码'
      } finally {
        this.loading = false
      }
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
  background-image:
    linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
}

.login-box {
  background: linear-gradient(
    135deg,
    rgba(10, 15, 30, 0.97),
    rgba(5, 8, 18, 0.97)
  );
  border: 1px solid rgba(0, 243, 255, 0.25);
  border-radius: 8px;
  padding: 44px 40px 36px;
  width: 400px;
  position: relative;
  z-index: 10;
  box-shadow:
    0 0 60px rgba(0, 243, 255, 0.06),
    inset 0 1px 0 rgba(0, 243, 255, 0.06);
}

.login-box::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 243, 255, 0.5),
    transparent
  );
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-large {
  margin-bottom: 14px;
  display: flex;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

.login-header h1 {
  color: #e2e8f0;
  font-size: 22px;
  letter-spacing: 4px;
  margin-bottom: 6px;
  font-weight: 600;
}

.login-header p {
  color: #4b5563;
  font-size: 11px;
  letter-spacing: 3px;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.form-group input {
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(0, 243, 255, 0.15);
  border-radius: 4px;
  color: #e2e8f0;
  padding: 12px 14px;
  font-size: 14px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: rgba(0, 243, 255, 0.5);
  box-shadow: 0 0 12px rgba(0, 243, 255, 0.1);
  background: rgba(0, 0, 0, 0.5);
}

.form-group input::placeholder {
  color: #94a3b8;
}

.login-btn {
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(0, 243, 255, 0.15),
    rgba(0, 243, 255, 0.08)
  );
  border: 1px solid rgba(0, 243, 255, 0.35);
  border-radius: 4px;
  color: #00f3ff;
  padding: 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  letter-spacing: 3px;
  font-weight: 500;
  margin-top: 8px;
}

.login-btn:hover:not(:disabled) {
  background: rgba(0, 243, 255, 0.25);
  box-shadow: 0 0 24px rgba(0, 243, 255, 0.15);
  border-color: rgba(0, 243, 255, 0.6);
}

.login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-footer {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
  text-align: center;
}

.login-footer p {
  color: #334155;
  font-size: 11px;
  letter-spacing: 0.5px;
}

/* 装饰圆圈 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(0, 243, 255, 0.08);
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
  border-color: rgba(56, 189, 248, 0.06);
  animation: pulse 4s ease-in-out infinite;
}

.corner-tl {
  position: absolute;
  top: 0;
  left: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle at 0 0,
    rgba(0, 243, 255, 0.04),
    transparent 70%
  );
  pointer-events: none;
}

.corner-br {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle at 100% 100%,
    rgba(56, 189, 248, 0.04),
    transparent 70%
  );
  pointer-events: none;
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

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
