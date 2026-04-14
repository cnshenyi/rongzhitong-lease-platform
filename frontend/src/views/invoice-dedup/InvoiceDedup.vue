<template>
  <div class="invoice-dedup">
    <div class="page-header">
      <h2 class="page-title">发票查重</h2>
    </div>

    <!-- 关联项目选择器 -->
    <el-card class="project-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>关联项目</span>
          <el-tag type="warning" size="small">必选</el-tag>
        </div>
      </template>
      <el-select
        v-model="selectedProject"
        placeholder="请选择关联项目"
        size="large"
        style="width: 100%"
        filterable
      >
        <el-option
          v-for="project in projectList"
          :key="project.id"
          :label="project.name"
          :value="project.id"
        />
      </el-select>
    </el-card>

    <!-- 文件上传区域 -->
    <el-card class="upload-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>上传发票</span>
        </div>
      </template>

      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        :auto-upload="false"
        :multiple="true"
        :limit="50"
        :accept="acceptedFormats"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将发票文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持格式：JPG / PNG / PDF，单文件不超过20MB，单次最多50张
          </div>
        </template>
      </el-upload>

      <div class="upload-actions" v-if="fileList.length > 0">
        <el-button type="primary" @click="handleStartProcess" :loading="processing" :disabled="!selectedProject">
          <el-icon><CircleCheck /></el-icon>
          开始验真查重
        </el-button>
        <el-button @click="handleClearFiles">
          <el-icon><Delete /></el-icon>
          清空文件
        </el-button>
        <span class="file-count">已选择 {{ fileList.length }} 个文件</span>
      </div>
    </el-card>

    <!-- 处理进度条 -->
    <el-card class="progress-card" shadow="never" v-if="showProgress">
      <template #header>
        <div class="card-header">
          <span>处理进度</span>
          <el-tag :type="progressStatus === 'success' ? 'success' : 'warning'" size="small">
            {{ progressStatusText }}
          </el-tag>
        </div>
      </template>
      <el-progress
        :percentage="progressPercent"
        :status="progressStatus"
        :stroke-width="20"
        striped
        striped-flow
        :duration="10"
      />
      <div class="progress-stages">
        <div
          class="stage-item"
          v-for="(stage, index) in progressStages"
          :key="index"
          :class="{ active: stage.active, done: stage.done }"
        >
          <el-icon v-if="stage.done"><CircleCheckFilled /></el-icon>
          <el-icon v-else-if="stage.active"><Loading /></el-icon>
          <el-icon v-else><Clock /></el-icon>
          <span>{{ stage.label }}</span>
        </div>
      </div>
    </el-card>

    <!-- 验真结果汇总 -->
    <el-row :gutter="20" class="summary-row" v-if="showResults">
      <el-col :span="12">
        <el-card class="summary-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>验真结果汇总</span>
              <el-icon><CircleCheck /></el-icon>
            </div>
          </template>
          <div class="stat-grid">
            <div class="stat-item stat-success">
              <div class="stat-number">{{ verifyStats.normal }}</div>
              <div class="stat-label">正常</div>
            </div>
            <div class="stat-item stat-warning">
              <div class="stat-number">{{ verifyStats.void }}</div>
              <div class="stat-label">作废</div>
            </div>
            <div class="stat-item stat-danger">
              <div class="stat-number">{{ verifyStats.redRush }}</div>
              <div class="stat-label">红冲</div>
            </div>
            <div class="stat-item stat-info">
              <div class="stat-number">{{ verifyStats.notFound }}</div>
              <div class="stat-label">查无</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="summary-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>查重结果汇总</span>
              <el-icon><Warning /></el-icon>
            </div>
          </template>
          <div class="stat-grid">
            <div class="stat-item stat-success">
              <div class="stat-number">{{ dedupStats.noRisk }}</div>
              <div class="stat-label">无风险</div>
            </div>
            <div class="stat-item stat-info">
              <div class="stat-number">{{ dedupStats.lowRisk }}</div>
              <div class="stat-label">低风险</div>
            </div>
            <div class="stat-item stat-warning">
              <div class="stat-number">{{ dedupStats.midRisk }}</div>
              <div class="stat-label">中风险</div>
            </div>
            <div class="stat-item stat-danger">
              <div class="stat-number">{{ dedupStats.highRisk }}</div>
              <div class="stat-label">高风险</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 发票明细表格 -->
    <el-card class="table-card" shadow="never" v-if="showResults">
      <template #header>
        <div class="card-header">
          <span>发票明细</span>
          <span class="table-count">共 {{ invoiceList.length }} 条</span>
        </div>
      </template>

      <el-table :data="invoiceList" stripe border style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="invoiceNo" label="发票号码" min-width="160">
          <template #default="{ row }">
            <span class="invoice-no">{{ row.invoiceNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额(元)" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ row.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 }) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="verifyStatus" label="验真状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getVerifyTagType(row.verifyStatus)" size="small">
              {{ row.verifyStatusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dedupStatus" label="查重状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getDedupTagType(row.dedupStatus)" size="small">
              {{ row.dedupStatusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="compareStatus" label="比对状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getCompareTagType(row.compareStatus)" size="small">
              {{ row.compareStatusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row.id)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 底部按钮 -->
    <div class="bottom-actions" v-if="showResults">
      <el-button type="default" size="large" @click="handleExportReport">
        <el-icon><Download /></el-icon>
        导出报告
      </el-button>
      <el-button type="primary" size="large" @click="handleConfirm">
        <el-icon><CircleCheck /></el-icon>
        确认
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, UploadUserFile, UploadProps, UploadInstance } from 'element-plus'
import {
  UploadFilled,
  CircleCheck,
  CircleCheckFilled,
  Delete,
  View,
  Download,
  Warning,
  Loading,
  Clock,
} from '@element-plus/icons-vue'

const router = useRouter()

// 接受的文件格式
const acceptedFormats = '.jpg,.jpeg,.png,.pdf'

// 文件列表
const fileList = ref<UploadUserFile[]>([])
const uploadRef = ref<UploadInstance>()
const processing = ref(false)
const showProgress = ref(false)
const showResults = ref(false)
const progressPercent = ref(0)
const progressStatus = ref<'' | 'success' | 'warning' | 'exception'>('')
const progressStatusText = ref('处理中...')

// 关联项目
const selectedProject = ref('')

// 项目列表Mock
const projectList = ref([
  { id: 'P001', name: '人民医院医疗设备租赁项目' },
  { id: 'P002', name: '科技园区办公设备租赁' },
  { id: 'P003', name: '智能制造产线租赁项目' },
  { id: 'P004', name: '城市公交新能源车辆租赁' },
  { id: 'P005', name: '数据中心服务器租赁项目' },
])

// 进度阶段
const progressStages = ref([
  { label: 'OCR识别', active: false, done: false },
  { label: '信息提取', active: false, done: false },
  { label: '验真查验', active: false, done: false },
  { label: '跨项目查重', active: false, done: false },
  { label: '清单比对', active: false, done: false },
])

// 验真结果统计
const verifyStats = reactive({
  normal: 6,
  void: 1,
  redRush: 1,
  notFound: 2,
})

// 查重结果统计
const dedupStats = reactive({
  noRisk: 5,
  lowRisk: 2,
  midRisk: 2,
  highRisk: 1,
})

// 发票接口
interface InvoiceRecord {
  id: string
  invoiceNo: string
  amount: number
  verifyStatus: 'normal' | 'void' | 'redRush' | 'notFound'
  verifyStatusText: string
  dedupStatus: 'noRisk' | 'lowRisk' | 'midRisk' | 'highRisk'
  dedupStatusText: string
  compareStatus: 'match' | 'mismatch' | 'partial'
  compareStatusText: string
}

// Mock发票数据
const invoiceList = ref<InvoiceRecord[]>([
  {
    id: 'INV001',
    invoiceNo: '032002100311-24891037',
    amount: 128500.00,
    verifyStatus: 'normal',
    verifyStatusText: '正常',
    dedupStatus: 'noRisk',
    dedupStatusText: '无风险',
    compareStatus: 'match',
    compareStatusText: '一致',
  },
  {
    id: 'INV002',
    invoiceNo: '032002100311-24891038',
    amount: 56800.50,
    verifyStatus: 'normal',
    verifyStatusText: '正常',
    dedupStatus: 'noRisk',
    dedupStatusText: '无风险',
    compareStatus: 'match',
    compareStatusText: '一致',
  },
  {
    id: 'INV003',
    invoiceNo: '032002100311-24891039',
    amount: 234000.00,
    verifyStatus: 'normal',
    verifyStatusText: '正常',
    dedupStatus: 'lowRisk',
    dedupStatusText: '低风险',
    compareStatus: 'match',
    compareStatusText: '一致',
  },
  {
    id: 'INV004',
    invoiceNo: '032002100311-24891040',
    amount: 89200.00,
    verifyStatus: 'void',
    verifyStatusText: '作废',
    dedupStatus: 'midRisk',
    dedupStatusText: '中风险',
    compareStatus: 'mismatch',
    compareStatusText: '不一致',
  },
  {
    id: 'INV005',
    invoiceNo: '032002100311-24891041',
    amount: 445600.00,
    verifyStatus: 'normal',
    verifyStatusText: '正常',
    dedupStatus: 'highRisk',
    dedupStatusText: '高风险',
    compareStatus: 'partial',
    compareStatusText: '部分一致',
  },
  {
    id: 'INV006',
    invoiceNo: '032002100311-24891042',
    amount: 17350.00,
    verifyStatus: 'redRush',
    verifyStatusText: '红冲',
    dedupStatus: 'midRisk',
    dedupStatusText: '中风险',
    compareStatus: 'mismatch',
    compareStatusText: '不一致',
  },
  {
    id: 'INV007',
    invoiceNo: '032002100311-24891043',
    amount: 362000.00,
    verifyStatus: 'normal',
    verifyStatusText: '正常',
    dedupStatus: 'noRisk',
    dedupStatusText: '无风险',
    compareStatus: 'match',
    compareStatusText: '一致',
  },
  {
    id: 'INV008',
    invoiceNo: '032002100311-24891044',
    amount: 78900.00,
    verifyStatus: 'notFound',
    verifyStatusText: '查无',
    dedupStatus: 'lowRisk',
    dedupStatusText: '低风险',
    compareStatus: 'partial',
    compareStatusText: '部分一致',
  },
  {
    id: 'INV009',
    invoiceNo: '032002100311-24891045',
    amount: 195000.00,
    verifyStatus: 'normal',
    verifyStatusText: '正常',
    dedupStatus: 'noRisk',
    dedupStatusText: '无风险',
    compareStatus: 'match',
    compareStatusText: '一致',
  },
  {
    id: 'INV010',
    invoiceNo: '032002100311-24891046',
    amount: 52400.00,
    verifyStatus: 'notFound',
    verifyStatusText: '查无',
    dedupStatus: 'noRisk',
    dedupStatusText: '无风险',
    compareStatus: 'match',
    compareStatusText: '一致',
  },
])

// 文件变化处理
const handleFileChange: UploadProps['onChange'] = (_uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
}

// 超出文件数量限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning('最多只能上传50个文件')
}

// 清空文件
const handleClearFiles = () => {
  fileList.value = []
  uploadRef.value?.clearFiles()
}

// 模拟进度推进
const simulateProgress = () => {
  const stages = progressStages.value
  let currentStage = 0
  const stagePercents = [20, 40, 60, 80, 100]

  const timer = setInterval(() => {
    if (currentStage < stages.length) {
      // 标记当前阶段为活动
      stages.forEach((s, i) => {
        s.active = i === currentStage
        s.done = i < currentStage
      })

      progressPercent.value = stagePercents[currentStage]
      currentStage++
    } else {
      // 完成所有阶段
      stages.forEach(s => {
        s.active = false
        s.done = true
      })
      progressPercent.value = 100
      progressStatus.value = 'success'
      progressStatusText.value = '处理完成'
      processing.value = false
      showResults.value = true
      clearInterval(timer)
    }
  }, 800)
}

// 开始处理
const handleStartProcess = () => {
  if (!selectedProject.value) {
    ElMessage.warning('请先选择关联项目')
    return
  }
  if (fileList.value.length === 0) {
    ElMessage.warning('请先上传发票文件')
    return
  }

  processing.value = true
  showProgress.value = true
  showResults.value = false
  progressPercent.value = 0
  progressStatus.value = ''
  progressStatusText.value = '处理中...'
  progressStages.value.forEach(s => {
    s.active = false
    s.done = false
  })

  simulateProgress()
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

// 获取比对状态Tag类型
const getCompareTagType = (status: string) => {
  const typeMap: Record<string, any> = {
    match: 'success',
    mismatch: 'danger',
    partial: 'warning',
  }
  return typeMap[status] || 'info'
}

// 查看详情
const handleViewDetail = (id: string) => {
  router.push(`/invoice-dedup/${id}`)
}

// 导出报告
const handleExportReport = () => {
  ElMessage.success('报告导出中，请稍候...')
}

// 确认
const handleConfirm = () => {
  ElMessage.success('发票验真查重结果已确认')
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
}

.invoice-dedup {
  padding: 20px;
}

.project-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.upload-card {
  margin-bottom: 20px;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload) {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  transition: all 0.3s;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #FF6600;
}

.el-icon--upload {
  font-size: 67px;
  color: #c0c4cc;
  margin: 40px 0 16px;
}

.el-upload__text {
  font-size: 14px;
  color: #606266;
}

.el-upload__text em {
  color: #FF6600;
  font-style: normal;
}

.el-upload__tip {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
  line-height: 1.6;
  text-align: center;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-count {
  color: #999;
  font-size: 13px;
  margin-left: 8px;
}

.progress-card {
  margin-bottom: 20px;
}

.progress-stages {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: 0 10px;
}

.stage-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #999;
  transition: all 0.3s;
}

.stage-item.active {
  color: #FF6600;
  font-weight: 600;
}

.stage-item.done {
  color: #67c23a;
}

.summary-row {
  margin-bottom: 20px;
}

.summary-card {
  height: 100%;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  text-align: center;
}

.stat-item {
  padding: 16px 8px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
}

.stat-success .stat-number {
  color: #67c23a;
}

.stat-warning .stat-number {
  color: #e6a23c;
}

.stat-danger .stat-number {
  color: #f56c6c;
}

.stat-info .stat-number {
  color: #409eff;
}

.table-card {
  margin-bottom: 24px;
}

.table-count {
  font-size: 13px;
  font-weight: 400;
  color: #999;
}

.invoice-no {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #333;
}

.amount-text {
  font-weight: 600;
  color: #333;
}

.bottom-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 0;
}

:deep(.el-button--primary:not(.is-link)) {
  background-color: #FF6600;
  border-color: #FF6600;
}

:deep(.el-button--primary:not(.is-link):hover) {
  background-color: #ff7a1f;
  border-color: #ff7a1f;
}

:deep(.el-button--primary:not(.is-link):active) {
  background-color: #e65c00;
  border-color: #e65c00;
}

:deep(.el-button.is-link.el-button--primary) {
  background-color: transparent;
  border-color: transparent;
}

:deep(.el-progress-bar__inner) {
  background-color: #FF6600;
}

:deep(.el-progress.is-success .el-progress-bar__inner) {
  background-color: #67c23a;
}
</style>
