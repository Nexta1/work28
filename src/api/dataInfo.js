import request from '@/utils/request'
export function tableDataPaged(data) {
  return request({
    url: `/rest/dataInfo/tableDataPaged`,
    method: 'post',
    data
  })
}
export function page(data) {
  return request({
    url: `/rest/dataInfo/page`,
    method: 'post',
    data
  })
}
export function manual(data) {
  return request({
    url: `/rest/dataInfo/manual`,
    method: 'post',
    data
  })
}
export function auto(data) {
  return request({
    url: `/rest/dataInfo/auto`,
    method: 'post',
    data
  })
}
