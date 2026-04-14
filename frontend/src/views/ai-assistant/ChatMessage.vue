<template>
  <div :class="['chat-message', msg.role]">
    <div class="avatar">
      <el-avatar :size="36" :style="avatarStyle">
        {{ msg.role === 'assistant' ? 'AI' : '我' }}
      </el-avatar>
    </div>
    <div class="bubble-wrap">
      <div class="bubble" v-html="renderedContent"></div>
      <!-- 引用来源 -->
      <div class="sources" v-if="msg.role === 'assistant' && msg.sources?.length">
        <div class="sources-title"><el-icon><Collection /></el-icon> 引用来源：</div>
        <div class="source-item" v-for="(src, i) in msg.sources" :key="i">
          [{{ i + 1 }}] {{ src.docName }}，{{ src.location }}
        </div>
      </div>
      <!-- 操作按钮 -->
      <div class="actions" v-if="msg.role === 'assistant'">
        <el-button link size="small" @click="$emit('feedback', msg.id, 'up')">
          <el-icon><svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M2 20h2V8H2v12zm22-11a2 2 0 0 0-2-2h-6.31l.95-4.57.03-.32a1.49 1.49 0 0 0-.44-1.06L15.17 0 7.59 7.59C7.22 7.95 7 8.45 7 9v10a2 2 0 0 0 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg></el-icon>
          有帮助
        </el-button>
        <el-button link size="small" @click="$emit('feedback', msg.id, 'down')">
          <el-icon><svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M22 4h-2v12h2V4zM2.17 11.12c-.11.25-.17.52-.17.8v2a2 2 0 0 0 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L10.83 23l7.58-7.59A1.98 1.98 0 0 0 19 14V4a2 2 0 0 0-2-2H8c-.83 0-1.54.5-1.84 1.22l-3.02 7.05-.09.23.12-.38z"/></svg></el-icon>
          没帮助
        </el-button>
        <el-button link size="small" @click="$emit('copy', msg.content)">
          <el-icon><DocumentCopy /></el-icon> 复制
        </el-button>
        <el-button link size="small" @click="$emit('favorite', msg.id)">
          <el-icon><Star /></el-icon> 收藏
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DocumentCopy, Star, Collection } from '@element-plus/icons-vue'

export interface ChatMsg {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: { docName: string; location: string }[]
  timestamp: string
}

const props = defineProps<{ msg: ChatMsg }>()
defineEmits<{
  feedback: [id: string, type: 'up' | 'down']
  copy: [content: string]
  favorite: [id: string]
}>()

const avatarStyle = computed(() =>
  props.msg.role === 'assistant'
    ? { background: '#FF6600', color: '#fff' }
    : { background: '#e8f0fe', color: '#333' }
)

const renderedContent = computed(() => {
  return props.msg.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
})
</script>

<style scoped>
.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 85%;
}
.chat-message.user {
  flex-direction: row-reverse;
  margin-left: auto;
}
.bubble-wrap {
  flex: 1;
  min-width: 0;
}
.bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.user .bubble {
  background: #FF6600;
  color: #fff;
  border-top-right-radius: 2px;
}
.assistant .bubble {
  background: #f5f5f5;
  color: #333;
  border-top-left-radius: 2px;
}
.sources {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef7f0;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
}
.sources-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #FF6600;
  display: flex;
  align-items: center;
  gap: 4px;
}
.source-item {
  margin-left: 8px;
  line-height: 1.8;
}
.actions {
  margin-top: 6px;
  display: flex;
  gap: 4px;
}
.actions .el-button {
  color: #999;
  font-size: 12px;
}
.actions .el-button:hover {
  color: #FF6600;
}
</style>
