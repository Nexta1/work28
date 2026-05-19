import request from '@/utils/request'

export function findTree(ZZRWWLID) {
  return request({
    url: `rest/zzrwwl/findTree/${ZZRWWLID}`,
    method: 'get'
  })
}
export function wlzt(data) {
  return request({
    url: `rest/wlzt/page`,
    method: 'post',
    data
  })
}
export function xxlltj(data) {
  return request({
    url: `rest/xxlltj/page`,
    method: 'post',
    data
  })
}
