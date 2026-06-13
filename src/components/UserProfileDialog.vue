<template>
  <el-dialog
    :visible="visible"
    @close="$emit('close')"
    width="400px"
    class="profile-dialog"
    :show-close="false"
    top="12vh"
    append-to-body
  >
    <!-- 自定义头部 -->
    <div slot="title" class="profile-header">
      <Icon icon="lucide:user-circle" :size="22" style="color: #38bdf8" />
      <span>个人信息</span>
    </div>

    <!-- 用户头像区 -->
    <div class="profile-avatar">
      <div class="avatar-ring">
        <span class="avatar-text">{{ avatarChar }}</span>
      </div>
      <div class="avatar-name">{{ user.name }}</div>
      <div class="avatar-role">{{ user.role }}</div>
    </div>

    <!-- 信息列表 -->
    <div class="profile-info-list">
      <div class="info-item">
        <span class="info-label">
          <Icon
            icon="lucide:hash"
            :size="13"
            style="color: #94a3b8; vertical-align: middle; margin-right: 4px"
          />
          用户编号
        </span>
        <span class="info-value">{{ user.userCode || '--' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">
          <Icon
            icon="lucide:id-card"
            :size="13"
            style="color: #94a3b8; vertical-align: middle; margin-right: 4px"
          />
          用户ID
        </span>
        <span class="info-value">{{ user.userId || '--' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">
          <Icon
            icon="lucide:smartphone"
            :size="13"
            style="color: #94a3b8; vertical-align: middle; margin-right: 4px"
          />
          手机号码
        </span>
        <span class="info-value">{{ user.mobile || '--' }}</span>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="profile-footer">
      <el-button size="mini" @click="$emit('close')">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'UserProfileDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    avatarChar() {
      const name = this.user?.name || 'U'
      return name.charAt(0).toUpperCase()
    }
  }
}
</script>

<style scoped>
.profile-dialog >>> .el-dialog {
  background: #0a1220;
  border: 1px solid #1e2d4a;
  border-radius: 8px;
  box-shadow:
    0 0 30px rgba(56, 189, 248, 0.08),
    0 8px 32px rgba(0, 0, 0, 0.5);
}
.profile-dialog >>> .el-dialog__header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #1e2d4a;
}
.profile-dialog >>> .el-dialog__body {
  padding: 0;
}
.profile-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: bold;
  color: #e2e8f0;
}

/* 头像区 */
.profile-avatar {
  padding: 24px 0 18px;
  text-align: center;
  background: rgba(56, 189, 248, 0.03);
  border-bottom: 1px solid #111b2b;
}
.avatar-ring {
  width: 64px;
  height: 64px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(56, 189, 248, 0.2),
    rgba(56, 189, 248, 0.05)
  );
  border: 2px solid rgba(56, 189, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-text {
  font-size: 26px;
  font-weight: bold;
  color: #38bdf8;
  font-family: monospace;
}
.avatar-name {
  font-size: 16px;
  font-weight: bold;
  color: #f1f5f9;
  margin-bottom: 4px;
}
.avatar-role {
  font-size: 11px;
  color: #94a3b8;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.15);
}

/* 信息列表 */
.profile-info-list {
  padding: 16px 20px;
}
.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(30, 45, 74, 0.5);
}
.info-item:last-child {
  border-bottom: none;
}
.info-label {
  font-size: 12px;
  color: #94a3b8;
}
.info-value {
  font-size: 13px;
  color: #cbd5e1;
  font-family: monospace;
}

/* 底部 */
.profile-footer {
  padding: 12px 20px 16px;
  text-align: center;
  border-top: 1px solid #111b2b;
}
.profile-footer .el-button {
  width: 100px;
}
</style>
