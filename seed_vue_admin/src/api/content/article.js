import request from '@/utils/request'

// 查询文章列表
export function listArticle(query) {
  console.log('listArticle 调用，参数:', query);
  return request({
    url: '/content/article/list?pageNum=' + (query.pageNum || 1) + '&pageSize=' + (query.pageSize || 10),
    method: 'post',
    data: query,
    headers: {
      repeatSubmit: false // 禁用防重复提交，允许频繁搜索
    }
  })
}

// 查询文章详细
export function getArticle(id) {
  return request({
    url: '/content/article/' + id,
    method: 'get'
  })
}

// 新增文章
export function addArticle(data) {
  return request({
    url: '/content/article',
    method: 'post',
    data: data
  })
}

// 修改文章
export function updateArticle(data) {
  return request({
    url: '/content/article',
    method: 'put',
    data: data
  })
}

// 删除文章
export function delArticle(id) {
  return request({
    url: '/content/article/' + id,
    method: 'delete'
  })
}

