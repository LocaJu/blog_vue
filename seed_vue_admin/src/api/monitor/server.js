import request from '@/utils/request'

// 获取服务信息
export function getServer() {
  return request({
    url: '/monitor/server',
    method: 'get'
  })
}
// 获取服务信息
export function getAppointServer(query) {
  return request({
    url: '/monitor/server/getAppointServer',
    method: 'get',
    params: query
  })
}
// 获取首页图表信息
export function getChartInfo() {
  return request({
    url: '/monitor/server/getAllInfo',
    method: 'get'
  })
}
// 获取系统涉及的服务器ip地址（admin 和 执行器）
export function getRegistryList() {
  return request({
    url: '/monitor/server/getRegistryList',
    method: 'get'
  })
}