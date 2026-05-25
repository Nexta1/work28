import request from '@/utils/request'

/**
 * ====================================================================
 * 体系运营管理子系统 - 任务需求分解 统一 API 接口文件（全 8 个分类表模块）
 * ====================================================================
 */

/* ====================================================================
 * 二级模块：作战任务
 * ==================================================================== */

/**
 * @description 作战任务 - 分页查询
 * @param {Object} data 请求体参数
 */
export function taskGetPage(data) {
  return request({
    url: '/rest/zzrwxx/page',
    method: 'post',
    data
  })
}

/**
 * @description 作战任务 - 新增
 * @param {Object} data 请求体参数
 */
export function taskAdd(data) {
  return request({
    url: '/rest/zzrwxx',
    method: 'post',
    data
  })
}

/**
 * @description 作战任务 - 删除
 * @param {String|Number} ZZRWID 路径参数
 */
export function taskDelete(ZZRWID) {
  return request({
    url: `/rest/zzrwxx/${ZZRWID}`,
    method: 'delete'
  })
}

/**
 * @description 作战任务 - 查询
 * @param {String|Number} ZZRWID 路径参数
 */
export function taskGetDetail(ZZRWID) {
  return request({
    url: `/rest/zzrwxx/${ZZRWID}`,
    method: 'get'
  })
}

/**
 * @description 作战任务 - 获得任务类型列表
 */
export function getTaskTypeList(params) {
  return request({
    url: '/rest/zzrwxx/rwlbMap',
    method: 'get',
    params
  })
}

/* ====================================================================
 * 二级模块：编成编组
 * ==================================================================== */

/**
 * @description 编成编组 - 分页查询
 */
export function orgGetPage(data) {
  return request({
    url: '/rest/zzrwpt/page',
    method: 'post',
    data
  })
}

/**
 * @description 编成编组 - 查询某个作战任务的编成编组
 */
export function getOrganizationByTaskId(ZZRWID) {
  return request({
    url: `/rest/zzrwpt/rpts/${ZZRWID}`,
    method: 'get'
  })
}

/**
 * @description 编成编组 - 查询所有编成编组树
 */
export function getOrganizationTree(params) {
  return request({
    url: '/rest/zzrwpt/findAllTrees',
    method: 'get',
    params
  })
}

/**
 * @description 编成编组 - 查找作战编成
 */
export function getOrganizationDetail(ZZRWPTID) {
  return request({
    url: `/rest/zzrwpt/${ZZRWPTID}`,
    method: 'get'
  })
}

/**
 * @description 编成编组 - 查询加入作战群组的作战平台列表
 */
export function getJoinedPlatformList(zzrwid) {
  return request({
    url: `/rest/zzrwpt/enjoyedqz/${zzrwid}`,
    method: 'get'
  })
}

/**
 * @description 编成编组 - 查询没有加入作战群组的作战平台列表
 */
export function getUnjoinedPlatformList(zzrwid) {
  return request({
    url: `/rest/zzrwpt/unenjoyedqz/${zzrwid}`,
    method: 'get'
  })
}

/* ====================================================================
 * 二级模块：作战线路
 * ==================================================================== */

/**
 * @description 作战线路 - 分页查询作战线路
 */
export function getRoutePage(data) {
  return request({
    url: '/rest/routeInfo/page',
    method: 'post',
    data
  })
}

/**
 * @description 作战线路 - 查询作战路线
 */
export function getRouteDetail(routeId) {
  return request({
    url: `/rest/routeInfo/${routeId}`,
    method: 'get'
  })
}

/**
 * @description 作战线路 - 查询作战任务的作战线路，包含转向点列表
 */
export function getRouteWithPointsByTaskId(ZZRWID) {
  return request({
    url: `/rest/routeInfo/zzrwid/${ZZRWID}`,
    method: 'get'
  })
}

/* ====================================================================
 * 二级模块：作战区域
 * ==================================================================== */

/**
 * @description 作战区域 - 分页查询
 */
export function areaGetPage(data) {
  return request({
    url: '/rest/zzqy/page',
    method: 'post',
    data
  })
}

/**
 * @description 作战区域 - 查询作战区域
 */
export function getAreaDetail(zzqyId) {
  return request({
    url: `/rest/zzqy/${zzqyId}`,
    method: 'get'
  })
}

/* ====================================================================
 * 二级模块：杀伤链任务
 * ==================================================================== */

/**
 * @description 杀伤链任务 - 分页查询
 */
export function killChainGetPage(data) {
  return request({
    url: '/rest/sslrw/page',
    method: 'post',
    data
  })
}

/**
 * @description 杀伤链任务 - 查询杀伤链任务
 */
export function getKillChainDetail(SSLRWID) {
  return request({
    url: `/rest/sslrw/${SSLRWID}`,
    method: 'get'
  })
}

/**
 * @description 杀伤链任务 - 查询作战任务ID的杀伤链任务列表
 */
export function getKillChainListByTaskId(zzrwid) {
  return request({
    url: `/rest/sslrw/sslrws/${zzrwid}`,
    method: 'get'
  })
}

/* ====================================================================
 * 二级模块：目标信息
 * ==================================================================== */

/**
 * @description 目标信息 - 分页查询
 */
export function targetGetPage(data) {
  return request({
    url: '/rest/mbxx/page',
    method: 'post',
    data
  })
}

/**
 * @description 目标信息 - 查询作战区域(目标详情)
 */
export function getTargetDetail(MBID) {
  return request({
    url: `/rest/mbxx/mbid/${MBID}`,
    method: 'get'
  })
}

/* ====================================================================
 * 二级模块：任务群组
 * ==================================================================== */

/**
 * @description 任务群组 - 分页查询
 */
export function groupGetPage(data) {
  return request({
    url: '/rest/zzrwqz/page',
    method: 'post',
    data
  })
}

/**
 * @description 任务群组 - 新增
 */
export function groupAdd(data) {
  return request({
    url: '/rest/zzrwqz',
    method: 'post',
    data
  })
}

/**
 * @description 任务群组 - 修改
 */
export function groupUpdate(data) {
  return request({
    url: '/rest/zzrwqz',
    method: 'put',
    data
  })
}

/**
 * @description 任务群组 - 删除
 */
export function groupDelete(zzrwqzId) {
  return request({
    url: `/rest/zzrwqz/${zzrwqzId}`,
    method: 'delete'
  })
}

/**
 * @description 任务群组 - 查询
 */
export function groupGetDetail(zzrwqzId) {
  return request({
    url: `/rest/zzrwqz/${zzrwqzId}`,
    method: 'get'
  })
}

/**
 * @description 任务群组 - 查询所有
 */
export function groupGetAll(params) {
  return request({
    url: '/rest/zzrwqz/zzrwqzs',
    method: 'get',
    params
  })
}

/* ====================================================================
 * 二级模块：任务网络需求
 * ==================================================================== */

/**
 * @description 任务网络需求 - 分页查询
 */
export function networkGetPage(data) {
  return request({
    url: '/rest/zzrwwl/page',
    method: 'post',
    data
  })
}

/**
 * @description 任务网络需求 - 新增
 */
export function networkAdd(data) {
  return request({
    url: '/rest/zzrwwl/',
    method: 'post',
    data
  })
}

/**
 * @description 任务网络需求 - 修改
 */
export function networkUpdate(data) {
  return request({
    url: '/rest/zzrwwl/',
    method: 'put',
    data
  })
}

/**
 * @description 任务网络需求 - 删除
 */
export function networkDelete(ZZRWWLID) {
  return request({
    url: `/rest/zzrwwl/${ZZRWWLID}`,
    method: 'delete'
  })
}

/**
 * @description 任务网络需求 - 查询
 */
export function networkGetDetail(ZZRWWLID) {
  return request({
    url: `/rest/zzrwwl/${ZZRWWLID}`,
    method: 'get'
  })
}

/**
 * @description 任务网络需求 - 查询任务网络树
 */
export function getNetworkTreeByTaskId(zzrwid) {
  return request({
    url: `/rest/zzrwwl/findTree/${zzrwid}`,
    method: 'get'
  })
}

/**
 * @description 任务网络需求 - 查询网络类型<值显示>映射
 */
export function getNetworkTypeMap(params) {
  return request({
    url: '/rest/zzrwwl/wllxMap',
    method: 'get',
    params
  })
}
