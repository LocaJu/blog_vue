<template>
  <div>
    <sg-navbar></sg-navbar>
    <div class="container">
      <el-row :gutter="20">
        <el-col :sm="24" :md="7" style="margin-bottom: 20px;">
          <el-card class="ai-card" shadow="hover">
            <div class="ai-side-header">
              <span class="ai-side-title">我的会话</span>
              <el-button type="primary" size="mini" @click="newSession">新建</el-button>
            </div>
            <div class="ai-session-list" v-loading="loadingSessions">
              <div
                v-for="s in sessions"
                :key="s.id"
                class="ai-session-item"
                :class="{ active: s.id === currentSessionId }"
                @click="selectSession(s)"
              >
                <div class="ai-session-title">{{ s.title || ('会话 #' + s.id) }}</div>
                <div class="ai-session-time" v-if="s.lastMessageTime">{{ formatTime(s.lastMessageTime) }}</div>
              </div>
              <div v-if="!sessions || sessions.length === 0" class="ai-empty">
                暂无会话，点击“新建”开始聊天
              </div>
            </div>
          </el-card>
        </el-col>

        <el-col :sm="24" :md="17">
          <el-card class="ai-card" shadow="hover">
            <div class="ai-chat-header">
              <div class="ai-chat-title">AI 机器人（DeepSeek）</div>
              <div class="ai-chat-sub">支持多轮对话，历史自动保存</div>
            </div>

            <div class="ai-messages" ref="msgBox" v-loading="loadingMessages">
              <div v-if="!messages || messages.length === 0" class="ai-empty">
                输入一句话开始对话（会自动创建会话并保存历史）
              </div>
              <div v-for="m in messages" :key="m.id || (m.role + '-' + m.createTime + '-' + m.content)">
                <div class="ai-msg" :class="m.role">
                  <div class="ai-msg-role">{{ m.role === 'assistant' ? '机器人' : '我' }}</div>
                  <div class="ai-msg-bubble">{{ m.content }}</div>
                </div>
              </div>
            </div>

            <div class="ai-input">
              <el-input
                type="textarea"
                :rows="3"
                placeholder="请输入内容，Enter 发送（Shift+Enter 换行）"
                v-model="input"
                :disabled="sending"
                @keydown.native="onKeydown"
              />
              <div class="ai-input-actions">
                <el-button type="primary" :loading="sending" @click="send">发送</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import header from '../components/header.vue'
import { listAiChatSessions, listAiChatMessages, aiTalk } from '../api/ai'

export default {
  name: 'AiChat',
  components: {
    'sg-navbar': header
  },
  data() {
    return {
      sessions: [],
      currentSessionId: null,
      messages: [],
      input: '',
      loadingSessions: false,
      loadingMessages: false,
      sending: false
    }
  },
  created() {
    this.fetchSessions()
  },
  methods: {
    formatTime(t) {
      try {
        const d = new Date(t)
        const pad = n => (n < 10 ? '0' + n : '' + n)
        return (
          d.getFullYear() +
          '-' +
          pad(d.getMonth() + 1) +
          '-' +
          pad(d.getDate()) +
          ' ' +
          pad(d.getHours()) +
          ':' +
          pad(d.getMinutes())
        )
      } catch (e) {
        return ''
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const box = this.$refs.msgBox
        if (box && box.scrollHeight != null) {
          box.scrollTop = box.scrollHeight
        }
      })
    },
    async fetchSessions() {
      this.loadingSessions = true
      try {
        const list = await listAiChatSessions()
        this.sessions = list || []
        if (!this.currentSessionId && this.sessions.length > 0) {
          this.selectSession(this.sessions[0])
        }
      } finally {
        this.loadingSessions = false
      }
    },
    async selectSession(s) {
      if (!s || !s.id) return
      this.currentSessionId = s.id
      await this.fetchMessages(s.id)
    },
    async fetchMessages(sessionId) {
      this.loadingMessages = true
      try {
        const list = await listAiChatMessages(sessionId)
        this.messages = list || []
        this.scrollToBottom()
      } finally {
        this.loadingMessages = false
      }
    },
    newSession() {
      this.currentSessionId = null
      this.messages = []
      this.input = ''
    },
    onKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        this.send()
      }
    },
    async send() {
      const content = (this.input || '').trim()
      if (!content) {
        this.$message.warning('请输入内容')
        return
      }
      if (this.sending) return

      this.sending = true
      try {
        const resp = await aiTalk(this.currentSessionId, content)
        if (resp && resp.sessionId) {
          const createdNew = !this.currentSessionId
          this.currentSessionId = resp.sessionId
          if (createdNew) {
            await this.fetchSessions()
          }
        }
        if (resp && resp.userMessage) this.messages.push(resp.userMessage)
        if (resp && resp.assistantMessage) this.messages.push(resp.assistantMessage)
        this.input = ''
        this.scrollToBottom()
      } finally {
        this.sending = false
      }
    }
  }
}
</script>

<style scoped>
.ai-card {
  border-radius: 10px;
}
.ai-side-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ai-side-title {
  font-weight: 700;
}
.ai-session-list {
  max-height: 520px;
  overflow: auto;
}
.ai-session-item {
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 10px;
  background: #fff;
}
.ai-session-item:hover {
  background: rgba(100, 96, 158, 0.08);
}
.ai-session-item.active {
  border-color: rgba(100, 96, 158, 0.5);
  background: rgba(100, 96, 158, 0.12);
}
.ai-session-title {
  font-size: 13px;
  color: #333;
  line-height: 18px;
}
.ai-session-time {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
}
.ai-chat-header {
  margin-bottom: 10px;
}
.ai-chat-title {
  font-size: 16px;
  font-weight: 800;
  color: #333;
}
.ai-chat-sub {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.ai-messages {
  height: 520px;
  overflow: auto;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  background: #fafafa;
}
.ai-msg {
  margin-bottom: 12px;
}
.ai-msg-role {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}
.ai-msg-bubble {
  display: inline-block;
  max-width: 100%;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 10px 12px;
  border-radius: 10px;
  line-height: 20px;
}
.ai-msg.user {
  text-align: right;
}
.ai-msg.user .ai-msg-bubble {
  background: rgba(100, 96, 158, 0.16);
}
.ai-msg.assistant .ai-msg-bubble {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.ai-input {
  margin-top: 12px;
}
.ai-input-actions {
  margin-top: 8px;
  text-align: right;
}
.ai-empty {
  padding: 16px;
  color: #999;
  text-align: center;
}
</style>

