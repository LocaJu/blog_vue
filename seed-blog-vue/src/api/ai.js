import request from '@/utils/request'

// 会话列表
export function listAiChatSessions() {
  return request({
    url: '/ai/chat/sessions',
    method: 'get'
  })
}

// 会话消息历史
export function listAiChatMessages(sessionId) {
  return request({
    url: `/ai/chat/sessions/${sessionId}/messages`,
    method: 'get'
  })
}

// 发送消息（sessionId 为空会自动创建新会话）
export function aiTalk(sessionId, content) {
  return request({
    url: '/ai/chat/talk',
    method: 'post',
    data: { sessionId, content }
  })
}

