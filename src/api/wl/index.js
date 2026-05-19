import request from '@/utils/request'

export function findTree(ZZRWWLID) {
  return request({
    url: `rest/zzrwwl/findTree/${ZZRWWLID}`,
    method: 'get'
  })
}
