<template>
  <div class="invoice-detail">
    <!-- 顶部导航 -->
    <div class="detail-header">
      <el-button @click="handleBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="detail-title">发票详情 - {{ invoiceData.invoiceNo }}</h2>
    </div>

    <!-- 主内容区 -->
    <el-row :gutter="20">
      <!-- 左侧：发票图片预览 -->
      <el-col :span="8">
        <el-card class="preview-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>发票图片</span>
            </div>
          </template>
          <div class="image-preview">
            <el-icon class="preview-icon"><Picture /></el-icon>
            <p class="preview-text">发票图片预览</p>
            <p class="preview-hint">{{ invoiceData.invoiceNo }}</p>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：详细信息 -->
      <el-col :span="16">
        <!-- 识别结果 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>识别结果</span>
              <el-tag type="success" size="small">
                <el-icon><CircleCheck /></el-icon>
                识别成功
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="发票代码">
              <span class="mono-text">{{ invoiceData.invoiceCode }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="发票号码">
              <span class="mono-text">{{ invoiceData.invoiceNo }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="开票日期">
              {{ invoiceData.invoiceDate }}
            </el-descriptions-item>
            <el-descriptions-item label="校验码">
              <span class="mono-text">{{ invoiceData.checkCode }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="购买方名称" :span="2">
              {{ invoiceData.buyerName }}
            </el-descriptions-item>
            <el-descriptions-item label="购买方税号" :span="2">
              <span class="mono-text">{{ invoiceData.buyerTaxNo }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="销售方名称" :span="2">
              {{ invoiceData.sellerName }}
            </el-descriptions-item>
            <el-descriptions-item label="销售方税号" :span="2">
              <span class="mono-text">{{ invoiceData.sellerTaxNo }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="金额">
              <span class="amount-text">¥{{ invoiceData.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="税额">
              <span class="amount-text">¥{{ invoiceData.taxAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="价税合计" :span="2">
              <span class="total-amount">¥{{ invoiceData.totalAmount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 验真结果 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>验真结果</span>
              <el-tag :type="getVerifyTagType(invoiceData.verifyStatus)" size="small">
                {{ invoiceData.verifyStatusText }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="验真状态">
              <el-tag :type="getVerifyTagType(invoiceData.verifyStatus)">
                {{ invoiceData.verifyStatusText }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="查验时间">
              {{ invoiceData.verifyTime }}
            </el-descriptions-item>
            <el-descriptions-item label="查验来源" :span="2">
              国家税务总局全国增值税发票查验平台
            </el-descriptions-item>
            <el-descriptions-item label="验真说明" :span="2">
              <span :class="getVerifyTextClass(invoiceData.verifyStatus)">
                {{ invoiceData.verifyDesc }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 查重结果 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>查重结果</span>
              <el-tag :type="getDedupTagType(invoiceData.dedupStatus)" size="small">
                {{ invoiceData.dedupStatusText }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="风险等级">
              <el-tag :type="getDedupTagType(invoiceData.dedupStatus)" size="large">
                <el-icon><Warning /></el-icon>
                {{ invoiceData.dedupStatusText }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="重复项目">
              <div v-if="invoiceData.duplicateProjects.length > 0" class="duplicate-list">
                <div
                  v-for="(project, index) in invoiceData.duplicateProjects"
                  :key="index"
                  class="duplicate-item"
                >
                  <el-tag type="danger" size="small" effect="plain">
                    <el-icon><Warning /></el-icon>
                    重复
                  </el-tag>
                  <span class="project-name">{{ project.name }}</span>
                  <span class="project-date">{{ project.date }}</span>
                </div>
              </div>
              <span v-else class="no-duplicate">未发现重复使用</span>
            </el-descriptions-item>
            <el-descriptions-item label="查重说明">
              <span :class="getDedupTextClass(invoiceData.dedupStatus)">
                {{ invoiceData.dedupDesc }}
              </span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 清单比对结果 -->
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>清单比对结果</span>
              <el-tag :type="getCompareTagType(invoiceData.compareStatus)" size="small">
                {{ invoiceData.compareStatusText }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="比对状态">
              <el-tag :type="getCompareTagType(invoiceData.compareStatus)">
                {{ invoiceData.compareStatusText }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="匹配度">
              <el-progress
                :percentage="invoiceData.matchRate"
                :color="getMatchRateColor(invoiceData.matchRate)"
                :stroke-width="12"
              />
            </el-descriptions-item>
            <el-descriptions-item label="关联清单" :span="2">
              {{ invoiceData.relatedList || '未关联' }}
            </el-descriptions-item>
            <el-descriptions-item label="比对说明" :span="2">
              {{ invoiceData.compareDesc }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部操作按钮 -->
    <div class="detail-actions">
      <el-button size="large" @click="handleBack">
        <el-icon><Close /></el-icon>
        关闭
      </el-button>
      <el-button type="primary" size="large" @click="handleDownload">
        <el-icon><Download /></el-icon>
        下载发票
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Picture,
  CircleCheck,
  Warning,
  Close,
  Download,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 发票详情接口
interface InvoiceDetail {
  id: string
  invoiceCode: string
  invoiceNo: string
  invoiceDate: string
  checkCode: string
  buyerName: string
  buyerTaxNo: string
  sellerName: string
  sellerTaxNo: string
  amount: number
  taxAmount: number
  totalAmount: number
  verifyStatus: 'normal' | 'void' | 'redRush' | 'notFound'
  verifyStatusText: string
  verifyTime: string
  verifyDesc: string
  dedupStatus: 'noRisk' | 'lowRisk' | 'midRisk' | 'highRisk'
  dedupStatusText: string
  dedupDesc: string
  duplicateProjects: Array<{ name: string; date: string }>
  compareStatus: 'match' | 'mismatch' | 'partial'
  compareStatusText: string
  matchRate: number
  relatedList: string
  compareDesc: string
}

// Mock发票详情数据
const invoiceData = ref<InvoiceDetail>({
  id: route.params.id as string,
  invoiceCode: '032002100311',
  invoiceNo: '032002100311-24891041',
  invoiceDate: '2024-03-15',
  checkCode: '20240315123456789012',
  buyerName: '深圳市科技创新有限公司',
  buyerTaxNo: '91440300MA5DXXXX1X',
  sellerName: '华为技术有限公司',
  sellerTaxNo: '914403001922447XXX',
  amount: 445600.00,
  taxAmount: 57928.00,
  totalAmount: 503528.00,
  verifyStatus: 'normal',
  verifyStatusText: '正常',
  verifyTime: '2024-04-14 22:15:33',
  verifyDesc: '该发票已在税务系统查验，状态正常，可以使用。',
  dedupStatus: 'highRisk',
  dedupStatusText: '高风险',
  dedupDesc: '该发票在多个项目中重复使用，存在高风险，建议立即核查。',
  duplicateProjects: [
    { name: '人民医院医疗设备租赁项目', date: '2024-03-20' },
    { name: '科技园区办公设备租赁', date: '2024-03-25' },
  ],
  compareStatus: 'partial',
  compareStatusText: '部分一致',
  matchRate: 75,
  relatedList: '医疗设备清单_2024Q1',
  compareDesc: '发票金额与清单总额基本一致，但部分设备型号存在差异。',
})

// 返回
const handleBack = () => {
  router.back()
}

// 获取验真状态Tag类型
const getVerifyTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    normal: 'success',
    void: 'warning',
    redRush: 'danger',
    notFound: 'info',
  }
  return typeMap[status] || 'info'
}

// 获取验真文本样式
const getVerifyTextClass = (status: string) => {
  const classMap: Record<string, string> = {
    normal: 'text-success',
    void: 'text-warning',
    redRush: 'text-danger',
    notFound: 'text-info',
  }
  return classMap[status] || ''
}

// 获取查重状态Tag类型
const getDedupTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    noRisk: 'success',
    lowRisk: 'info',
    midRisk: 'warning',
    highRisk: 'danger',
  }
  return typeMap[status] || 'info'
}

// 获取查重文本样式
const getDedupTextClass = (status: string) => {
  const classMap: Record<string, string> = {
    noRisk: 'text-success',
    lowRisk: 'text-info',
    midRisk: 'text-warning',
    highRisk: 'text-danger',
  }
  return classMap[status] || ''
}

// 获取比对状态Tag类型
const getCompareTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    match: 'success',
    mismatch: 'danger',
    partial: 'warning',
  }
  return typeMap[status] || 'info'
}

// 获取匹配度颜色
const getMatchRateColor = (rate: number) => {
  if (rate >= 90) return '#67c23a'
  if (rate >= 70) return '#e6a23c'
  return '#f56c6c'
}

// 下载发票
const handleDownload = () => {
  ElMessage.success('发票下载中，请稍候...')
}
</script>

<style scoped>
.invoice-detail {
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.detail-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.preview-card {
  position: sticky;
  top: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.image-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
  border-radius: 8px;
  padding: 40px 20px;
}

.preview-icon {
  font-size: 80px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.preview-text {
  font-size: 16px;
  color: #666;
  margin: 0 0 8px 0;
}

.preview-hint {
  font-size: 12px;
  color: #999;
  font-family: 'Courier New', Courier, monospace;
  margin: 0;
}

.info-card {
  margin-bottom: 20px;
}

.mono-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #333;
}

.amount-text {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.total-amount {
  font-weight: 700;
  color: #FF6600;
  font-size: 18px;
}

.text-success {
  color: #67c23a;
}

.text-warning {
  color: #e6a23c;
}

.text-danger {
  color: #f56c6c;
}

.text-info {
  color: #409eff;
}

.duplicate-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.duplicate-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #fef0f0;
  border-radius: 6px;
  border-left: 3px solid #f56c6c;
}

.project-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.project-date {
  font-size: 12px;
  color: #999;
}

.no-duplicate {
  color: #67c23a;
  font-weight: 500;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
  margin-top: 20px;
  border-top: 1px solid #e8e8e8;
}

:deep(.el-button--primary) {
  background-color: #FF6600;
  border-color: #FF6600;
}

:deep(.el-button--primary:hover) {
  background-color: #ff7a1f;
  border-color: #ff7a1f;
}

:deep(.el-button--primary:active) {
  background-color: #e65c00;
  border-color: #e65c00;
}

:deep(.el-descriptions__label) {
  font-weight: 600;
  background-color: #fafafa;
}

:deep(.el-progress-bar__inner) {
  transition: all 0.4s ease;
}
</style>
