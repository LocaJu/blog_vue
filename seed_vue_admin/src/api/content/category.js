import request from '@/utils/request'

// 查询所有分类列表（用于下拉选择）
export function listAllCategory() {
  return request({
    url: '/content/category/listAllCategory',
    method: 'get'
  })
}

// 查询分类列表（分页）
export function listCategory(query) {
  return request({
    url: '/content/category/list',
    method: 'get',
    params: query
  })
}

// 查询分类详细
export function getCategory(id) {
  return request({
    url: '/content/category/' + id,
    method: 'get'
  })
}

// 新增分类
export function addCategory(data) {
  return request({
    url: '/content/category',
    method: 'post',
    data: data
  })
}

// 修改分类
export function updateCategory(data) {
  return request({
    url: '/content/category',
    method: 'put',
    data: data
  })
}

// 删除分类
export function delCategory(id) {
  return request({
    url: '/content/category/' + id,
    method: 'delete'
  })
}

