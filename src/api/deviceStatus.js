import request from '@/utils/request'

/**
 * 查询所有设备信息
 * GET /rest/sbxx/sbxxs
 */
export function getDeviceList() {
  return request({
    url: '/rest/sbxx/sbxxs',
    method: 'get'
  })
}

/**
 * 设备异常诊断信息（最新）
 * GET /rest/deviceDetect/latest/{SBID}
 * @param {number} sbid - 设备ID
 */
export function getDeviceLatestDetect(sbid) {
  return request({
    url: `/rest/deviceDetect/latest/${sbid}`,
    method: 'get'
  })
}

/**
 * 设备最近10分钟诊断信息
 * GET /rest/deviceDetect/tenMiniutes/{SBID}
 * @param {number} sbid - 设备ID
 */
export function getDeviceTenMinutes(sbid) {
  return request({
    url: `/rest/deviceDetect/tenMiniutes/${sbid}`,
    method: 'get'
  })
}

/**
 * 预测设备状态信息
 * GET /rest/deviceDetect/predict/{SBID}
 * @param {number} sbid - 设备ID
 */
export function getDevicePredict(sbid) {
  return request({
    url: `/rest/deviceDetect/predict/${sbid}`,
    method: 'get'
  })
}
