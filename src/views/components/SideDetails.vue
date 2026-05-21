<template>
  <div class="side-panel-wrapper">
    <!-- 遮罩层：点击面板外区域关闭 -->
    <div v-if="visible" class="panel-mask" @click="$emit('close')"></div>

    <transition name="panel-slide">
      <div v-if="visible" class="list-panel">
        <!-- 头部 -->
        <div class="panel-header" :style="{borderLeftColor: themeColor}">
          <div class="title-area">
            <span class="main-title">阶段平台概览</span>
            <span class="sub-count">共 {{ listData.length }} 个平台</span>
          </div>
          <i class="el-icon-close close-icon" @click="$emit('close')"></i>
        </div>

        <!-- 列表区域 -->
        <div class="panel-body">
          <div
            v-for="pt in listData"
            :key="pt.PTID"
            class="pt-list-item"
            @click="$emit('select', pt.ptDetail)"
          >
            <!-- 状态指示条 -->
            <div
              class="status-bar"
              :style="{backgroundColor: themeColor}"
            ></div>

            <div class="item-main">
              <div class="pt-name">{{ pt.killchain_Group_Member_PltName }}</div>
              <div class="pt-info">
                <span
                  ><i class="el-icon-cpu"></i> 传感器:
                  {{ pt.ptDetail.cgqxxs ? pt.ptDetail.cgqxxs.length : 0 }}</span
                >
                <span class="split">|</span>
                <span
                  ><i class="el-icon-aim"></i> 武器:
                  {{ pt.ptDetail.wqxxs ? pt.ptDetail.wqxxs.length : 0 }}</span
                >
                <span class="split">|</span>
                <span
                  ><i class="el-icon-aim"></i> 设备:
                  {{ pt.ptDetail.sbxxs ? pt.ptDetail.sbxxs.length : 0 }}</span
                >
              </div>
            </div>

            <i class="el-icon-arrow-right arrow"></i>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    visible: Boolean,
    listData: Array,
    themeColor: String
  },
  watch: {
    listData(n) {
      console.log(n)
    }
  }
}
</script>

<style scoped>
.list-panel {
  position: absolute;
  left: 0;
  top: 0;
  width: 320px;
  height: 100%;
  background: rgba(13, 25, 41, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 20px 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(59, 130, 246, 0.2);
}

.panel-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

.panel-header {
  padding: 20px;
  background: linear-gradient(
    90deg,
    rgba(59, 130, 246, 0.1) 0%,
    transparent 100%
  );
  border-left: 4px solid #3b82f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-title {
  display: block;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
}
.sub-count {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}
.close-icon {
  color: #94a3b8;
  cursor: pointer;
  font-size: 20px;
}
.close-icon:hover {
  color: #fff;
}

.panel-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
}

/* 列表项样式 - 保持与弹窗风格一致 */
.pt-list-item {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  margin-bottom: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.pt-list-item:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.4);
  transform: translateX(4px);
}

.status-bar {
  position: absolute;
  left: 0;
  top: 15%;
  height: 70%;
  width: 3px;
  border-radius: 0 2px 2px 0;
}

.item-main {
  flex: 1;
  padding-left: 8px;
}
.pt-name {
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
}
.pt-info {
  font-size: 11px;
  color: #64748b;
  display: flex;
  gap: 10px;
}
.split {
  opacity: 0.3;
}
.arrow {
  color: #475569;
  font-size: 14px;
}

/* 动画效果 */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-slide-enter,
.panel-slide-leave-to {
  transform: translateX(-100%);
}
</style>
