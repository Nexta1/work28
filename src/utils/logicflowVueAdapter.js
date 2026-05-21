async runSyncWorkflow() {
  try {
    const resXX = await getSslxxPage({ RWMC: this.currentTaskName });
    this.xxList = resXX.data.data.list || [];
    if (this.xxList.length === 0) return;

    // 找到当前选中的杀伤链对象
    const activeItem = this.xxList.find(i => i.KILLCHAIN_ID === this.currentKillChainId) || this.xxList[0];
    this.currentKillChainId = activeItem.KILLCHAIN_ID;

    // --- 核心修复：多维度变更检测 ---
    // 组合一个指纹标识：包含 群组、阶段、状态
    // 只要这三者有一个变了，就必须重绘泳道
    const resQZ = await getSslqzPage({ KILLCHAIN_ID: this.currentKillChainId });
    const groups = resQZ.data.data.list || [];
    const firstGroup = groups[0] || {};
    
    const currentFingerprint = `${firstGroup.QZZRW}_${activeItem.KILLCHAIN_EXECUTEPHASE}_${activeItem.KILLCHAIN_STATE}`;

    if (this.lastFingerprint === currentFingerprint) {
      // 完全没变化，跳过昂贵的 DOM/SVG 重绘
      return;
    }
    
    // 更新指纹标识
    this.lastFingerprint = currentFingerprint;
    this.currentGroupName = firstGroup.QZZRW || '';

    // 执行渲染
    await this.loadMembersAndRender(this.currentGroupName, activeItem);

  } catch (e) {
    console.error('Sync Error:', e);
  }
}