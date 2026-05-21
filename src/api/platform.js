import request from '@/utils/request'

/**
 * 1. 分页查询平台信息
 * @param {Object} data 请求数据
 * @param {number} data.pageNum 页码
 * @param {number} data.pageSize 每页条数
 * @param {Object} data.params 查询参数
 * @param {string} [data.params.PTMC] 平台名称
 * @param {number} [data.params.PTLX] 平台类型
 */
export function getPlatformPage(data) {
  return request({
    url: 'rest/ptxx/page',
    method: 'post',
    data
  })
}

/**
 * 2. 根据平台信息标识查询平台信息
 * @param {string|number} ptxxid 平台信息标识 (PTXXID)
 */
export function getPlatformById(ptxxid) {
  return request({
    url: `rest/ptxx/${ptxxid}`,
    method: 'get'
  })
}

/**
 * 3. 返回平台类型 <值, 显示> 映射
 */
export function getPlatformTypeMap() {
  return request({
    url: 'rest/ptxxInfo/ptlxMap',
    method: 'get'
  })
}

/**
 * 4. 分页查询传感器信息
 * @param {Object} data 请求数据
 * @param {number} data.pageNum 页码
 * @param {number} data.pageSize 每页条数
 * @param {Object} data.params 查询参数
 * @param {string} [data.params.PTID] 平台ID
 * @param {string} [data.params.PTMC] 平台名称
 */
export function getSensorPage(data) {
  return request({
    url: '/rest/cgqxx/page',
    method: 'post',
    data
  })
}

/**
 * 5. 分页查询武器信息
 * @param {Object} data 请求数据
 * @param {number} data.pageNum 页码
 * @param {number} data.pageSize 每页条数
 * @param {Object} data.params 查询参数
 * @param {string} [data.params.PTID] 平台ID
 * @param {string} [data.params.PTMC] 平台名称
 * * 附武器相关字段说明（供业务开发参考）：
 * - ZYXH: 资源型号(武器型号ID)
 * - WQXHMC: 武器型号名称
 * - WQLX: 武器类型 (1.对陆, 2.对水面, 3.对水下, 4.对空)
 * - DJFW: 打击范围(千米)
 * - DJJD: 打击精度(千米)
 * - DJCGL: 打击成功率
 * - GZSL: 挂载数量
 * - JKZT: 健康状态 (0：运行; 1：未运行; 2：故障)
 * - ZYZYZT: 资源状态 (0空闲; 1占用)
 */
export function getWeaponPage(data) {
  return request({
    url: '/rest/wqxx/page',
    method: 'post',
    data
  })
}
export function getsbxxPage(data) {
  return request({
    url: '/rest/sbxx/page',
    method: 'post',
    data
  })
}
