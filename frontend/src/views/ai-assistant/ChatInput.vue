<template>
  <div class="chat-input">
    <div class="input-row">
      <el-input
        ref="inputRef"
        v-model="inputText"
        type="textarea"
        :rows="1"
        :autosize="{ minRows: 1, maxRows: 4 }"
        placeholder="请输入您的问题..."
        resize="none"
        @keydown.enter.exact.prevent="handleSend"
      />
      <el-tooltip content="上传文档" placement="top">
        <el-button class="icon-btn" circle @click="$emit('upload')">
          <el-icon><Paperclip /></el-icon>
        </el-button>
      </el-tooltip>
      <el-button
        class="send-btn"
        type="primary"
        circle
        :disabled="!inputText.trim() || loading"
        @click="handleSend"
      >
        <el-icon v-if="!loading"><Promotion /></el-icon>
        <el-icon v-else class="is-loading"><Loading /></el-icon>
      </el-button>
    </div>
    <div class="hint">按 Enter 发送，Shift + Enter 换行</div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Paperclip, Promotion, Loading } from '@element-plus/icons-vue'

defineProps<{ loading?: boolean }>()
const emit = defineEmits<{
  send: [text: string]
  upload: []
}>()

const inputText = ref('')
const inputRef = ref()

function handleSend() {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
  nextTick(() => inputRef.value?.focus())
}

function focus() {
  inputRef.value?.focus()
}

defineExpose({ focus })
</script>

<style scoped>
.chat-input {
  padding: 16px 20px;
  border-top: 1px solid #eee;
  background: #fff;
}
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.input-row :deep(.el-textarea__inner) {
  border-radius: 20px;
  padding: 10px 16px;
  font-size: 14px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.input-row :deep(.el-textarea__inner:focus) {
  box-shadow: 0 1px 6px rgba(255, 102, 0, 0.2);
}
.icon-btn {
  color: #999;
  border: none;
  background: transparent;
}
.icon-btn:hover {
  color: #FF6600;
  background: #fff5ef;
}
.send-btn {
  background: #FF6600;
  border-color: #FF6600;
  flex-shrink: 0;
}
.send-btn:hover:not(:disabled) {
  background: #e55c00;
  border-color: #e55c00;
}
.send-btn:disabled {
  background: #ffc999;
  border-color: #ffc999;
}
.hint {
  text-align: center;
  font-size: 11px;
  color: #bbb;
  margin-top: 6px;
}
</style>
