import request from '@/utils/request'

/**
 * 数据链保障需求分析 API
 * 接口文档：智能页面接口说明20260608.xlsx
 */

/**
 * 1. 分页显示作战编成
 * POST /rest/zzrwpt/page
 * @param {Object} data - {pageNum, pageSize, params: {ZZRWID}}
 */
export function getFormationPage(data) {
  return request({
    url: '/rest/zzrwpt/page',
    method: 'post',
    data
  })
}

/**
 * 2. 分页查询作战线路转向点
 * POST /rest/routePoint/page
 * @param {Object} data - {pageNum, pageSize, params: {ZZRWID}}
 */
export function getRoutePointPage(data) {
  return request({
    url: '/rest/routePoint/page',
    method: 'post',
    data
  })
}

/**
 * 3. 分页查询作战区域转向点
 * POST /rest/zzqywzd/page
 * @param {Object} data - {pageNum, pageSize, params: {ZZRWID}}
 */
export function getAreaPointPage(data) {
  return request({
    url: '/rest/zzqywzd/page',
    method: 'post',
    data
  })
}

/**
 * 4. 作战单元信息交互拓扑
 * GET /rest/zzrwxx/topology/{zzrwid}
 * @param {Number} zzrwid - 作战任务ID
 */
export function getTopology(zzrwid) {
  return request({
    url: `/rest/zzrwxx/topology/${zzrwid}`,
    method: 'get'
  })
}

/**
 * 5. 任务节点平台数量分布
 * GET /rest/zzrwxx/{ZZRWID}
 * @param {Number} ZZRWID - 作战任务ID
 */
export function getTaskNodeDistribution(ZZRWID) {
  return request({
    url: `/rest/zzrwxx/${ZZRWID}`,
    method: 'get'
  })
}

/**
 * 6. 查询作战任务任务网络列表
 * GET /rest/zzrwwl/ZZRWID/{ZZRWWLID}
 * @param {Number} ZZRWWLID - 作战任务网络ID
 */
export function getTaskNetworkList(ZZRWWLID) {
  return request({
    url: `/rest/zzrwwl/ZZRWID/${ZZRWWLID}`,
    method: 'get'
  })
}

/**
 * 7. 任务规划推导过程拓扑演化图
 * GET /rest/zzrwxx/derivationProcess/{zzrwid}
 * @param {Number} zzrwid - 作战任务ID
 *
 * 响应结构：
 *   code: 0 成功
 *   data: string (JSON字符串，需二次 JSON.parse())
 *     data 解析后结构：
 *       figure: { suptitle, suptitleFontSize, layout, figsize }
 *       stages: Array<{
 *         index, title, titleFontSize, graphType,
 *         nodes: [{ id, label, color, borderColor, size, fontSize, fontWeight, clusterId?, taskType? }],
 *         edges: [{ source, target, color, width, arrowSize, arrow }],
 *         positions: { [nodeId]: { x, y } }
 *       }>
 *   message: string
 *
 * 注意事项：
 * - data 字段为 JSON 字符串，前端需执行 JSON.parse(res.data) 二次解析
 * - positions 为归一化坐标 [-1, 1]，渲染时需映射到实际画布尺寸
 * - stages 共 5 项，按演化顺序排列
 * - 前 3 阶段 graphType=undirected（无向图），后 2 阶段 graphType=directed（有向图）
 * - clusterId 仅第 2 阶段存在，taskType 仅第 5 阶段存在
 */
export function getDerivationProcess(zzrwid) {
  return request({
    url: `/rest/zzrwxx/derivationProcess/${zzrwid}`,
    method: 'get'
  })
}

/**
 * ============================================
 * 装备维护 — 测试方案维护
 * 接口文档：04_装备维护测试20260625.xlsx
 * ============================================
 */

/**
 * 分页查询测试方案
 * POST /rest/testPlan/page
 * @param {Object} data — {pageNum, pageSize, params: {planName?}}
 */
export function getTestPlanPage(data) {
  return request({
    url: '/rest/testPlan/page',
    method: 'post',
    data
  })
}

/**
 * 新增测试方案
 * POST /rest/testPlan
 * @param {Object} data — {planName, createTime}
 */
export function addTestPlan(data) {
  return request({
    url: '/rest/testPlan',
    method: 'post',
    data
  })
}

/**
 * 修改测试方案
 * PUT /rest/testPlan
 * @param {Object} data — {testPlanId, planName, createTime}
 */
export function updateTestPlan(data) {
  return request({
    url: '/rest/testPlan',
    method: 'put',
    data
  })
}

/**
 * 删除测试方案
 * DELETE /rest/testPlan/{id}
 * @param {Number|String} id — 测试方案ID
 */
export function deleteTestPlan(id) {
  return request({
    url: `/rest/testPlan/${id}`,
    method: 'delete'
  })
}

/**
 * 查询所有测试方案
 * GET /rest/testPlan/testPlans
 */
export function getAllTestPlans() {
  return request({
    url: '/rest/testPlan/testPlans',
    method: 'get'
  })
}

/**
 * ============================================
 * 装备维护 — 测试设备维护
 * ============================================
 */

/**
 * 分页查询测试设备
 * POST /rest/testComponent/page
 * @param {Object} data — {pageNum, pageSize, params: {planName?}}
 */
export function getTestComponentPage(data) {
  return request({
    url: '/rest/testComponent/page',
    method: 'post',
    data
  })
}

/**
 * 新增测试设备关联
 * POST /rest/testComponent
 * @param {Object} data — {testPlanId, SBID}
 */
export function addTestComponent(data) {
  return request({
    url: '/rest/testComponent',
    method: 'post',
    data
  })
}

/**
 * 修改测试设备关联
 * PUT /rest/testComponent
 * @param {Object} data — {testComponentId, testPlanId, SBID}
 */
export function updateTestComponent(data) {
  return request({
    url: '/rest/testComponent',
    method: 'put',
    data
  })
}

/**
 * 删除测试设备关联
 * DELETE /rest/testComponent/{id}
 * @param {Number|String} id — 测试设备ID
 */
export function deleteTestComponent(id) {
  return request({
    url: `/rest/testComponent/${id}`,
    method: 'delete'
  })
}

/**
 * 查询所有测试设备关联
 * GET /rest/testComponent/testComponents
 */
export function getAllTestComponents() {
  return request({
    url: '/rest/testComponent/testComponents',
    method: 'get'
  })
}
