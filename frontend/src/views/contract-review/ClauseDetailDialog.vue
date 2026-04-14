<template>
  <el-dialog
    v-model="visible"
    title="条款详情"
    width="680px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="clause-detail" v-if="clause">
      <!-- 条款位置 & 风险等级 -->
      <div class="detail-header">
        <div class="clause-location">
          <el-icon><Location /></el-icon>
          <span>{{ clause.location }}</span>
        </div>
        <el-tag :type="getRiskTagType(clause.riskLevel)" size="large">
          {{ getRiskLevelText(clause.riskLevel) }}
        </el-tag>
      </div>

      <!-- 原文内容 -->
      <div class="detail-section">
        <h4 class="section-title">
          <el-icon><Document /></el-icon>
          原文内容
        </h4>
        <div class="clause-content">
          {{ clause.originalText }}
        </div>
      </div>

      <!-- 风险分析 -->
      <div class="detail-section">
        <h4 class="section-title risk-title">
          <el-icon><Warning /></el-icon>
          风险分析
        </h4>
        <div class="risk-analysis">
          {{ clause.riskAnalysis }}
        </div>
      </div>

      <!-- 修改建议 -->
      <div class="detail-section">
        <h4 class="section-title suggestion-title">
          <el-icon><EditPen /></el-icon>
          修改建议
        </h4>
        <div class="suggestion-content">
          {{ clause.suggestion }}
        </div>
      </div>

      <!-- 参考依据 -->
      <div class="detail-section">
        <h4 class="section-title reference-title">
          <el-icon><Reading /></el-icon>
          参考依据
        </h4>
        <div class="reference-list">
          <div
            v-for="(ref, index) in clause.references"
            :key="index"
            class="reference-item"
          >
            <el-icon><Link /></el-icon>
            <span>{{ ref }}</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button type="primary" @click="handleAdopt" class="adopt-btn">
          <el-icon><Select /></el-icon>
          采纳建议
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Location,
  Document,
  Warning,
  EditPen,
  Reading,
  Link,
  Select,
} from '@element-plus/icons-vue'

// 条款接口
export interface ClauseDetail {
  id: string
  name: string
  location: string
  riskLevel: 'high' | 'medium' | 'low'
  originalText: string
  riskAnalysis: string
  suggestion: string
  references: string[]
}

const props = defineProps<{
  modelValue: boolean
  clause: ClauseDetail | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'adopt', clause: ClauseDetail): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleAdopt = () => {
  if (props.clause) {
    emit('adopt', props.clause)
    ElMessage.success('已采纳修改建议')
    emit('update:modelValue', false)
  }
}

// 获取风险等级文本
const getRiskLevelText = (level: string) => {
  const levelMap: Record<string, string> = {
    high: '高风险',
    medium: '中风险',
    low: '低风险',
  }
  return levelMap[level] || level
}

// 获取风险等级Tag类型
const getRiskTagType = (level: string) => {
  const typeMap: Record<string, any> = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  }
  return typeMap[level] || 'info'
}
</script>

<style scoped>
.clause-detail {
  padding: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.clause-location {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.detail-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.risk-title {
  color: #e6a23c;
}

.suggestion-title {
  color: #FF6600;
}

.reference-title {
  color: #409eff;
}

.clause-content {
  background-color: #f5f7fa;
  border-left: 4px solid #dcdfe6;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.risk-analysis {
  background-color: #fdf6ec;
  border-left: 4px solid #e6a23c;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.8;
  color: #666;
}

.suggestion-content {
  background-color: #fff3e6;
  border-left: 4px solid #FF6600;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.reference-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reference-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  background-color: #ecf5ff;
  border-radius: 4px;
  font-size: 13px;
  color: #409eff;
  line-height: 1.6;
}

.reference-item .el-icon {
  margin-top: 3px;
  flex-shrink: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.adopt-btn {
  background-color: #FF6600;
  border-color: #FF6600;
}

.adopt-btn:hover {
  background-color: #ff7a1f;
  border-color: #ff7a1f;
}

:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 18px;
}
</style>
