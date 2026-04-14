<template>
  <div class="ai-assistant">
    <!-- 左侧：历史会话 -->
    <div class="sidebar">
      <el-button type="primary" class="new-chat-btn" @click="newChat">
        <el-icon><Plus /></el-icon> 新建对话
      </el-button>
      <div class="history-list">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          :class="['history-item', { active: conv.id === currentConvId }]"
          @click="switchConv(conv.id)"
        >
          <el-icon><ChatDotRound /></el-icon>
          <span class="title">{{ conv.title }}</span>
          <el-icon class="del-icon" @click.stop="deleteConv(conv.id)"><Delete /></el-icon>
        </div>
      </div>
    </div>

    <!-- 右侧：聊天区 -->
    <div class="chat-area">
      <!-- 欢迎页 -->
      <div v-if="!messages.length" class="welcome">
        <div class="welcome-icon"><el-icon><ChatRound /></el-icon></div>
        <h2>融智通智能问答助手</h2>
        <p>基于RAG技术，为您提供融资租赁领域的专业解答</p>
        <div class="quick-questions">
          <div class="qq-title"><el-icon><Opportunity /></el-icon> 试试这些问题：</div>
          <div class="qq-grid">
            <div
              v-for="(q, i) in quickQuestions"
              :key="i"
              class="qq-card"
              @click="sendQuestion(q)"
            >
              {{ q }}
            </div>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="messages" ref="messagesRef">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :msg="msg"
          @feedback="handleFeedback"
          @copy="handleCopy"
          @favorite="handleFavorite"
        />
        <!-- 加载中 -->
        <div v-if="loading" class="typing">
          <el-avatar :size="36" style="background:#FF6600;color:#fff">AI</el-avatar>
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- 输入框 -->
      <ChatInput ref="chatInputRef" :loading="loading" @send="sendQuestion" @upload="handleUpload" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { Plus, ChatDotRound, Delete, ChatRound, Opportunity } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'
import type { ChatMsg } from './ChatMessage.vue'

// --- Mock 数据 ---
const quickQuestions = [
  '融资租赁和经营租赁有什么区别？',
  '直租和回租的会计处理有何不同？',
  '融资租赁合同审核要点有哪些？',
  '如何计算租赁内含利率IRR？',
  '融资租赁的税务处理规定是什么？',
  '租赁物残值评估方法有哪些？',
]

const mockAnswers: Record<string, { content: string; sources: ChatMsg['sources'] }> = {
  '融资租赁和经营租赁有什么区别？': {
    content: '融资租赁和经营租赁的主要区别如下：\n\n**1. 风险与报酬转移**\n融资租赁：与资产所有权相关的风险和报酬实质上全部转移给承租人\n经营租赁：风险和报酬仍由出租人承担\n\n**2. 会计处理**\n融资租赁：承租人确认使用权资产和租赁负债\n经营租赁：承租人在新准则下也需确认使用权资产（短期和低价值除外）\n\n**3. 租赁期限**\n融资租赁：通常覆盖资产大部分使用寿命\n经营租赁：租赁期较短，远低于资产使用寿命',
    sources: [
      { docName: '企业会计准则第21号——租赁', location: '第二章 第5-8条' },
      { docName: '融资租赁业务操作手册', location: '第三节 租赁分类' },
    ],
  },
  default: {
    content: '这是一个很好的问题。根据融资租赁相关法规和行业实践，我为您整理了以下要点：\n\n**核心要点：**\n该问题涉及融资租赁业务的关键环节，需要综合考虑法律法规、会计准则和行业惯例。\n\n**建议：**\n建议您参考最新的《融资租赁公司监督管理暂行办法》以及相关会计准则的具体规定，结合实际业务场景进行判断。如需进一步了解，可以上传相关文档，我会为您做更精准的分析。',
    sources: [
      { docName: '融资租赁公司监督管理暂行办法', location: '第三章' },
    ],
  },
}

// --- 状态 ---
interface Conversation { id: string; title: string }

const conversations = ref<Conversation[]>([
  { id: '1', title: '融资租赁基础知识咨询' },
  { id: '2', title: '合同审核要点讨论' },
])
const currentConvId = ref('1')
const messages = ref<ChatMsg[]>([])
const loading = ref(false)
const messagesRef = ref<HTMLElement>()
const chatInputRef = ref()

function newChat() {
  const id = Date.now().toString()
  conversations.value.unshift({ id, title: '新对话' })
  currentConvId.value = id
  messages.value = []
}

function switchConv(id: string) {
  currentConvId.value = id
  messages.value = []
}

function deleteConv(id: string) {
  conversations.value = conversations.value.filter(c => c.id !== id)
  if (currentConvId.value === id) {
    currentConvId.value = conversations.value[0]?.id || ''
    messages.value = []
  }
}

async function sendQuestion(text: string) {
  // 用户消息
  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    content: text,
    timestamp: new Date().toLocaleTimeString(),
  })
  // 更新会话标题
  const conv = conversations.value.find(c => c.id === currentConvId.value)
  if (conv && (conv.title === '新对话' || messages.value.length <= 1)) {
    conv.title = text.slice(0, 20)
  }
  await scrollToBottom()

  // 模拟AI回复
  loading.value = true
  await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
  const answer = mockAnswers[text] || mockAnswers['default']
  messages.value.push({
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: answer.content,
    sources: answer.sources,
    timestamp: new Date().toLocaleTimeString(),
  })
  loading.value = false
  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function handleFeedback(id: string, type: 'up' | 'down') {
  ElMessage.success(type === 'up' ? '感谢您的反馈！' : '我们会继续改进')
}
function handleCopy(content: string) {
  navigator.clipboard?.writeText(content.replace(/<[^>]+>/g, ''))
  ElMessage.success('已复制到剪贴板')
}
function handleFavorite(id: string) {
  ElMessage.success('已收藏该回答')
}
function handleUpload() {
  ElMessage.info('文档上传功能开发中...')
}

onMounted(() => chatInputRef.value?.focus())
</script>

<style scoped>
.ai-assistant {
  display: flex;
  height: 100%;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 左侧栏 */
.sidebar {
  width: 260px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  padding: 16px;
}
.new-chat-btn {
  width: 100%;
  background: #FF6600;
  border-color: #FF6600;
  border-radius: 8px;
  margin-bottom: 16px;
}
.new-chat-btn:hover {
  background: #e55c00;
  border-color: #e55c00;
}
.history-list {
  flex: 1;
  overflow-y: auto;
}
.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
}
.history-item:hover {
  background: #fff;
}
.history-item.active {
  background: #fff5ef;
  color: #FF6600;
}
.history-item .title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.history-item .del-icon {
  opacity: 0;
  font-size: 14px;
  color: #ccc;
  transition: all 0.2s;
}
.history-item:hover .del-icon {
  opacity: 1;
}
.history-item .del-icon:hover {
  color: #f56c6c;
}

/* 右侧聊天区 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* 欢迎页 */
.welcome {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.welcome-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #FF6600;
}
.welcome h2 {
  color: #333;
  margin-bottom: 8px;
  font-size: 22px;
}
.welcome p {
  color: #999;
  font-size: 14px;
  margin-bottom: 32px;
}
.qq-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.qq-title .el-icon {
  color: #FF6600;
  font-size: 16px;
}
.qq-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 600px;
}
.qq-card {
  padding: 14px 18px;
  background: #fef7f0;
  border: 1px solid #ffe0c2;
  border-radius: 10px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}
.qq-card:hover {
  background: #FF6600;
  color: #fff;
  border-color: #FF6600;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
}

/* 消息列表 */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 20px;
}

/* 打字动画 */
.typing {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.typing-dots {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 12px;
}
.typing-dots span {
  width: 8px;
  height: 8px;
  background: #FF6600;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}
.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}
</style>
