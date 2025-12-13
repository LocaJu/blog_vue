import axios from 'axios'
import { Notification, MessageBox, Message } from 'element-ui'
import router from '@/router'
import store from '../store'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 是否显示重新登录弹窗（防止重复弹出）
let isRelogin = { show: false }


// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: store.state.baseURL,
  // 超时
  timeout: 10000
})
// request拦截器
service.interceptors.request.use(config => {
  // 确保headers对象存在
  if (!config.headers) {
    config.headers = {}
  }
  
  // 先保存isToken标志（因为后面可能会修改headers）
  const isToken = config.headers.isToken !== false
  // 移除isToken标志，避免发送到服务器
  if (config.headers.isToken !== undefined) {
    delete config.headers.isToken
  }
  
  // get请求映射params参数（先处理，避免影响headers）
  if (config.method === 'get' && config.params) {
    let url = config.url + '?'
    for (const propName of Object.keys(config.params)) {
      const value = config.params[propName]
      var part = encodeURIComponent(propName) + '='
      if (value !== null && typeof (value) !== 'undefined') {
        if (typeof value === 'object') {
          for (const key of Object.keys(value)) {
            if (value[key] !== null && typeof (value[key]) !== 'undefined') {
              const params = propName + '[' + key + ']'
              const subPart = encodeURIComponent(params) + '='
              url += subPart + encodeURIComponent(value[key]) + '&'
            }
          }
        } else {
          url += part + encodeURIComponent(value) + '&'
        }
      }
    }
    url = url.slice(0, -1)
    config.params = {}
    config.url = url
  }
  
  // 获取token
  const token = getToken()
  
  // 如果需要token且有token，则添加到请求头（最后添加，确保不被覆盖）
  if (isToken && token) {
    config.headers['token'] = token // 让每个请求携带自定义token 请根据实际情况自行修改
    // 调试日志
    console.log('✅ 添加token到请求头:', config.url, 'token:', token.substring(0, 20) + '...', '完整headers:', JSON.stringify(config.headers))
  } else if (isToken && !token) {
    // 调试日志：需要token但没有token的情况
    console.warn('⚠️ 需要token但未找到token:', config.url, 'isToken:', isToken, '完整headers:', JSON.stringify(config.headers))
  } else {
    // 调试日志：不需要token的情况
    console.log('ℹ️ 不需要token:', config.url, 'isToken:', isToken, '完整headers:', JSON.stringify(config.headers))
  }
  
  return config
}, error => {
  console.log(error)
  Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(res => {
  // 未设置状态码则默认成功状态
  const code = res.data.code || 200
  // 获取错误信息
  const msg = errorCode[code] || res.data.msg || errorCode['default']
  if (code === 401) {
    // 如果当前在登录页面，不弹出提示，直接返回错误
    if (router.currentRoute.path === '/Login' || router.currentRoute.path.startsWith('/Login')) {
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
    }
    // 防止重复弹出登录提示
    if (!isRelogin.show) {
      isRelogin.show = true
      MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }
      ).then(() => {
        isRelogin.show = false
        localStorage.setItem('logUrl', router.currentRoute.fullPath);
        router.push({
          path: '/Login?login=1'
        });
      }).catch(() => {
        isRelogin.show = false
      })
    }
    return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
  } else if (code === 500) {
    Message({
      message: msg,
      type: 'error'
    })
    return Promise.reject(new Error(msg))
  } else if (code !== 200) {
    Notification.error({
      title: msg
    })
    return Promise.reject('error')
  } else {
    // 把字符串total 转换成 数字 total
    if (res.data.data && res.data.data.total) {
      res.data.data.total = parseInt(res.data.data.total)
    }
    return res.data.data
  }
},
  error => {
    console.log('err' + error)
    // 处理HTTP状态码401（未授权）
    if (error.response && error.response.status === 401) {
      // 检查是否是业务code 401
      if (error.response.data && error.response.data.code === 401) {
        // 如果当前在登录页面，不弹出提示
        if (router.currentRoute.path === '/Login' || router.currentRoute.path.startsWith('/Login')) {
          return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
        }
        // 防止重复弹出登录提示
        if (!isRelogin.show) {
          isRelogin.show = true
          MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
          ).then(() => {
            isRelogin.show = false
            localStorage.setItem('logUrl', router.currentRoute.fullPath);
            router.push({
              path: '/Login?login=1'
            });
          }).catch(() => {
            isRelogin.show = false
          })
        }
        return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
      } else {
        // HTTP 401但没有业务code，可能是token无效
        // 如果当前在登录页面，不弹出提示
        if (router.currentRoute.path === '/Login' || router.currentRoute.path.startsWith('/Login')) {
          return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
        }
        // 防止重复弹出登录提示
        if (!isRelogin.show) {
          isRelogin.show = true
          MessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
          ).then(() => {
            isRelogin.show = false
            localStorage.setItem('logUrl', router.currentRoute.fullPath);
            router.push({
              path: '/Login?login=1'
            });
          }).catch(() => {
            isRelogin.show = false
          })
        }
        return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
      }
    }
    let { message } = error
    if (message === 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      const statusCode = message.substr(message.length - 3)
      // 如果是401，已经在上面处理了
      if (statusCode === '401') {
        return Promise.reject('无效的会话，或者会话已过期，请重新登录。')
      }
      message = '系统接口' + statusCode + '异常'
    }
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service