<template>
  <div class="equipment-maintenance-container">
    <div class="page-header">
      <h1>{{ $route.meta.title }}</h1>
    </div>
    <div class="content-placeholder">
      <p>{{ $route.meta.title }} - 装备维护测试模块</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EquipmentMaintenance'
}
</script>

<style scoped>
.equipment-maintenance-container {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 243, 255, 0.1);
}

.page-header h1 {
  color: #f4f7fb;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 1px;
}

.content-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: rgba(0, 243, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 243, 255, 0.1);
}

.content-placeholder p {
  color: #8a98ad;
  font-size: 16px;
}
</style>
