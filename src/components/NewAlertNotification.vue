<template>
  <transition name="alert-fade">
    <div v-if="visible" class="new-alert-overlay" @click.self="handleIgnore">
      <div class="new-alert-dialog">
        <!-- 顶部装饰条 -->
        <div class="alert-top-bar">
          <Icon icon="lucide:bell-ring" :size="18" />
          <span>新告警通知</span>
        </div>

        <!-- 告警概览 -->
        <div class="alert-summary">
          <div class="alert-count-wrapper">
            <span class="alert-count-num">{{ alertCount }}</span>
            <span class="alert-count-label">条新告警</span>
          </div>
          <div class="alert-desc" v-if="latestAlert">
            <Icon
              icon="lucide:alert-triangle"
              :size="14"
              style="color: #f43f5e; flex-shrink: 0"
            />
            <span class="alert-desc-text">{{
              latestAlert.warnContent ||
              latestAlert.faultName ||
              '系统检测到新告警'
            }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="alert-actions">
          <el-button
            type="danger"
            icon="el-icon-view"
            @click="handleGoToAlarm"
            class="action-btn action-primary"
          >
            查看告警
          </el-button>

          <el-button plain @click="handleIgnore" class="action-btn">
            忽略
          </el-button>

          <el-dropdown trigger="click" @command="handleSnooze" placement="top">
            <el-button plain class="action-btn">
              暂不提醒
              <i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="30min">
                <Icon
                  icon="lucide:clock"
                  :size="14"
                  style="vertical-align: middle; margin-right: 4px"
                />
                30分钟内不提醒
              </el-dropdown-item>
              <el-dropdown-item command="1hour">
                <Icon
                  icon="lucide:clock"
                  :size="14"
                  style="vertical-align: middle; margin-right: 4px"
                />
                1小时内不提醒
              </el-dropdown-item>
              <el-dropdown-item command="today">
                <Icon
                  icon="lucide:calendar"
                  :size="14"
                  style="vertical-align: middle; margin-right: 4px"
                />
                今天不提醒
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>

        <!-- 关闭按钮 -->
        <button class="alert-close-btn" @click="handleIgnore">
          <Icon icon="lucide:x" :size="16" />
        </button>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'NewAlertNotification',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    alertCount: {
      type: Number,
      default: 0
    },
    latestAlert: {
      type: Object,
      default: null
    }
  },
  methods: {
    handleGoToAlarm() {
      this.$emit('goto-alarm')
      this.$emit('close')
      this.$router.push('/alarm-monitoring')
    },
    handleIgnore() {
      // 本次忽略，记录当前时间戳（30秒内不再弹相同告警）
      localStorage.setItem('alert_ignore_until', String(Date.now()))
      this.$emit('ignore')
      this.$emit('close')
    },
    handleSnooze(command) {
      let expireTime = 0
      const now = Date.now()
      switch (command) {
        case '30min':
          expireTime = now + 30 * 60 * 1000
          break
        case '1hour':
          expireTime = now + 60 * 60 * 1000
          break
        case 'today': {
          // 今天结束时间
          const endOfDay = new Date()
          endOfDay.setHours(23, 59, 59, 999)
          expireTime = endOfDay.getTime()
          break
        }
      }
      localStorage.setItem('alert_snooze_until', String(expireTime))
      this.$emit('snooze')
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.new-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
}

.new-alert-dialog {
  position: relative;
  width: 420px;
  background: #0a1220;
  border: 1px solid #1e2d4a;
  border-radius: 8px;
  box-shadow:
    0 0 30px rgba(244, 63, 94, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.alert-top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: linear-gradient(90deg, rgba(244, 63, 94, 0.15), transparent);
  border-bottom: 1px solid #1e2d4a;
  font-size: 14px;
  font-weight: bold;
  color: #f43f5e;
}

.alert-summary {
  padding: 20px 18px 14px;
  text-align: center;
}

.alert-count-wrapper {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 6px;
  margin-bottom: 12px;
}

.alert-count-num {
  font-size: 42px;
  font-weight: bold;
  font-family: monospace;
  color: #f43f5e;
  line-height: 1;
}

.alert-count-label {
  font-size: 14px;
  color: #94a3b8;
}

.alert-desc {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(244, 63, 94, 0.06);
  border: 1px solid rgba(244, 63, 94, 0.15);
  border-radius: 6px;
  text-align: left;
}

.alert-desc-text {
  font-size: 12px;
  color: #cbd5e1;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.alert-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 18px 18px;
}

.action-btn {
  font-size: 12px !important;
  border-radius: 4px !important;
}

.action-primary {
  font-weight: bold;
}

.alert-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.alert-close-btn:hover {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

/* 过渡动画 */
.alert-fade-enter-active {
  transition: all 0.3s ease;
}
.alert-fade-leave-active {
  transition: all 0.2s ease;
}
.alert-fade-enter,
.alert-fade-leave-to {
  opacity: 0;
}
.alert-fade-enter .new-alert-dialog,
.alert-fade-leave-to .new-alert-dialog {
  transform: translateY(-20px);
}
</style>
