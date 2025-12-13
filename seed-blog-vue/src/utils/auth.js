import Cookies from 'js-cookie'

const TokenKey = 'user-Token'

export function getToken() {
  const token = Cookies.get(TokenKey)
  // 调试日志
  console.log('🔍 获取token:', token ? token.substring(0, 20) + '...' : 'null', 'CookieKey:', TokenKey)
  return token
}

export function setToken(token) {
  // 设置token到Cookie，设置过期时间为7天
  const result = Cookies.set(TokenKey, token, { expires: 7 })
  // 调试日志
  console.log('💾 设置token到Cookie:', token ? token.substring(0, 20) + '...' : 'null', '结果:', result)
  // 验证是否设置成功
  const verifyToken = Cookies.get(TokenKey)
  console.log('✅ 验证token设置:', verifyToken ? verifyToken.substring(0, 20) + '...' : 'null')
  return result
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
