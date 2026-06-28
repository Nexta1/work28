<template>
  <div class="not-found-page">
    <div class="cyber-grid"></div>

    <div class="not-found-content">
      <div class="error-code">
        <span class="digit" v-for="(d, i) in '404'" :key="i">{{ d }}</span>
      </div>

      <div class="divider-line">
        <span class="line-glow"></span>
      </div>

      <div class="error-info">
        <h2 class="error-title">页面未找到</h2>
        <p class="error-desc">
          <Icon icon="lucide:alert-triangle" :size="14" color="#f59e0b" />
          您访问的页面不存在或已被移除
        </p>
        <p class="error-hint">
          <Icon icon="lucide:map-pin" :size="14" color="#38bdf8" />
          请检查地址是否正确，或返回首页重新操作
        </p>
      </div>

      <div class="action-bar">
        <button class="btn-primary" @click="goHome">
          <Icon icon="lucide:compass" :size="16" />
          返回首页
        </button>
        <button class="btn-secondary" @click="goBack">
          <Icon icon="lucide:chevron-left" :size="16" />
          返回上一页
        </button>
      </div>

      <div class="status-bar">
        <span class="status-dot"></span>
        <span>STATUS_404 — PAGE_NOT_FOUND</span>
      </div>
    </div>

    <!-- 装饰元素 -->
    <div class="decoration-circle c1"></div>
    <div class="decoration-circle c2"></div>
    <div class="decoration-circle c3"></div>

    <!-- 角落扫描线 -->
    <div class="corner-tl"></div>
    <div class="corner-tr"></div>
    <div class="corner-bl"></div>
    <div class="corner-br"></div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  methods: {
    goHome() {
      this.$router.push('/')
    },
    goBack() {
      this.$router.back()
    }
  }
}
</script>

<style scoped lang="scss">
.not-found-page {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #03060c;
  overflow: hidden;
}

/* 网格背景 */
.cyber-grid {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.4;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 39px,
      rgba(0, 180, 255, 0.03) 39px,
      rgba(0, 180, 255, 0.03) 40px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 39px,
      rgba(0, 180, 255, 0.03) 39px,
      rgba(0, 180, 255, 0.03) 40px
    );
}

.not-found-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 60px 40px;
  background: rgba(12, 20, 36, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(12px);
  box-shadow:
    0 0 40px rgba(56, 189, 248, 0.05),
    inset 0 0 60px rgba(0, 0, 0, 0.3);
  min-width: 420px;
  max-width: 520px;
}

/* 404 大数字 */
.error-code {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  .digit {
    font-size: 120px;
    font-weight: 900;
    line-height: 1;
    font-family: 'Courier New', monospace;
    background: linear-gradient(180deg, #38bdf8 0%, #06b6d4 40%, #0891b2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: none;
    filter: drop-shadow(0 0 30px rgba(56, 189, 248, 0.3));
    animation: digitPulse 3s ease-in-out infinite;
    letter-spacing: 4px;
  }
}

@keyframes digitPulse {
  0%,
  100% {
    filter: drop-shadow(0 0 30px rgba(56, 189, 248, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 50px rgba(56, 189, 248, 0.5));
  }
}

/* 分隔线 */
.divider-line {
  width: 180px;
  height: 2px;
  margin: 8px auto 24px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(56, 189, 248, 0.5),
    transparent
  );
  position: relative;

  .line-glow {
    display: block;
    width: 60px;
    height: 2px;
    margin: 0 auto;
    background: #38bdf8;
    box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
    animation: glowMove 3s ease-in-out infinite;
  }
}

@keyframes glowMove {
  0%,
  100% {
    transform: translateX(-60px);
    opacity: 0.3;
  }
  50% {
    transform: translateX(60px);
    opacity: 1;
  }
}

/* 信息区域 */
.error-info {
  margin-bottom: 32px;

  .error-title {
    font-size: 28px;
    font-weight: 600;
    color: #e2e8f0;
    margin: 0 0 16px;
    letter-spacing: 2px;
  }

  .error-desc,
  .error-hint {
    font-size: 14px;
    color: #94a3b8;
    margin: 6px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
}

/* 操作按钮 */
.action-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;

  .btn-primary,
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.25s ease;
    border: 1px solid;
    font-family: inherit;
  }

  .btn-primary {
    background: linear-gradient(
      135deg,
      rgba(56, 189, 248, 0.2),
      rgba(6, 182, 212, 0.15)
    );
    border-color: rgba(56, 189, 248, 0.4);
    color: #38bdf8;

    &:hover {
      background: linear-gradient(
        135deg,
        rgba(56, 189, 248, 0.35),
        rgba(6, 182, 212, 0.25)
      );
      border-color: rgba(56, 189, 248, 0.7);
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .btn-secondary {
    background: transparent;
    border-color: rgba(148, 163, 184, 0.3);
    color: #94a3b8;

    &:hover {
      border-color: rgba(148, 163, 184, 0.6);
      color: #cbd5e1;
      background: rgba(148, 163, 184, 0.08);
    }
  }
}

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: #475569;
  letter-spacing: 1px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f43f5e;
    box-shadow: 0 0 8px rgba(244, 63, 94, 0.6);
    animation: dotBlink 1.5s ease-in-out infinite;
  }
}

@keyframes dotBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* 装饰圆 */
.decoration-circle {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.12;

  &.c1 {
    width: 400px;
    height: 400px;
    top: -100px;
    right: -100px;
    background: radial-gradient(circle, #38bdf8, transparent 70%);
    animation: floatGlow 8s ease-in-out infinite;
  }

  &.c2 {
    width: 300px;
    height: 300px;
    bottom: -80px;
    left: -80px;
    background: radial-gradient(circle, #06b6d4, transparent 70%);
    animation: floatGlow 10s ease-in-out infinite reverse;
  }

  &.c3 {
    width: 200px;
    height: 200px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: radial-gradient(
      circle,
      rgba(56, 189, 248, 0.5),
      transparent 70%
    );
    animation: floatGlow 6s ease-in-out infinite;
  }
}

@keyframes floatGlow {
  0%,
  100% {
    opacity: 0.08;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.18;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

.c1 {
  animation: floatC1 8s ease-in-out infinite;
}
.c2 {
  animation: floatC2 10s ease-in-out infinite reverse;
}

@keyframes floatC1 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-30px, 20px);
  }
}

@keyframes floatC2 {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(30px, -20px);
  }
}

/* 四角装饰 */
.corner-tl,
.corner-tr,
.corner-bl,
.corner-br {
  position: fixed;
  width: 30px;
  height: 30px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.3;
}

.corner-tl {
  top: 20px;
  left: 20px;
  border-top: 1px solid rgba(56, 189, 248, 0.4);
  border-left: 1px solid rgba(56, 189, 248, 0.4);
}

.corner-tr {
  top: 20px;
  right: 20px;
  border-top: 1px solid rgba(56, 189, 248, 0.4);
  border-right: 1px solid rgba(56, 189, 248, 0.4);
}

.corner-bl {
  bottom: 20px;
  left: 20px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.4);
  border-left: 1px solid rgba(56, 189, 248, 0.4);
}

.corner-br {
  bottom: 20px;
  right: 20px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.4);
  border-right: 1px solid rgba(56, 189, 248, 0.4);
}
</style>
