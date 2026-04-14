<template>
  <div class="due-diligence-create">
    <!-- 步骤条 -->
    <el-card class="steps-card" shadow="never">
      <el-steps :active="currentStep" align-center finish-status="success">
        <el-step title="基本信息" />
        <el-step title="资料收集" />
        <el-step title="AI分析" />
        <el-step title="报告生成" />
      </el-steps>
    </el-card>

    <!-- 步骤内容 -->
    <el-card class="content-card" shadow="never">
      <!-- 步骤1: 基本信息 -->
      <div v-show="currentStep === 0" class="step-content">
        <el-form
          ref="basicFormRef"
          :model="basicForm"
          :rules="basicRules"
          label-width="120px"
          class="basic-form"
        >
          <el-form-item label="项目名称" prop="projectName">
            <el-select v-model="basicForm.projectName" placeholder="请选择项目" style="width: 100%">
              <el-option label="医疗设备租赁项目A" value="医疗设备租赁项目A" />
              <el-option label="工程机械租赁项目B" value="工程机械租赁项目B" />
              <el-option label="IT设备租赁项目C" value="IT设备租赁项目C" />
              <el-option label="办公设备租赁项目D" value="办公设备租赁项目D" />
              <el-option label="运输车辆租赁项目E" value="运输车辆租赁项目E" />
            </el-select>
          </el-form-item>

          <el-form-item label="承租人" prop="lessee">
            <el-input
              v-model="basicForm.lessee"
              placeholder="请输入承租人名称"
              maxlength="100"
            />
          </el-form-item>

          <el-form-item label="报告类型" prop="reportType">
            <el-radio-group v-model="basicForm.reportType">
              <el-radio label="标准尽调">标准尽调</el-radio>
              <el-radio label="简化尽调">简化尽调</el-radio>
              <el-radio label="深度尽调">深度尽调</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="报告模板" prop="template">
            <el-select v-model="basicForm.template" placeholder="请选择报告模板" style="width: 100%">
              <el-option label="通用模板" value="通用模板" />
              <el-option label="医疗设备模板" value="医疗设备模板" />
              <el-option label="工程机械模板" value="工程机械模板" />
              <el-option label="IT设备模板" value="IT设备模板" />
            </el-select>
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              v-model="basicForm.remark"
              type="textarea"
              :rows="4"
              placeholder="请输入备注信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2: 资料收集 -->
      <div v-show="currentStep === 1" class="step-content">
        <div class="upload-section">
          <!-- 文件分类标签 -->
          <el-tabs v-model="activeCategory" class="category-tabs">
            <el-tab-pane label="财务报表" name="financial" />
            <el-tab-pane label="营业执照" name="license" />
            <el-tab-pane label="合同文件" name="contract" />
            <el-tab-pane label="其他" name="other" />
          </el-tabs>

          <!-- 上传区域 -->
          <el-upload
            class="upload-area"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :file-list="getCategoryFileList()"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持格式：PDF、Word、Excel、图片，单文件不超过50MB
              </div>
            </template>
          </el-upload>

          <!-- 已上传文件列表 -->
          <div class="uploaded-files" v-if="getCategoryFileList().length > 0">
            <h3 class="files-title">已上传文件</h3>
            <div class="file-list">
              <div
                v-for="file in getCategoryFileList()"
                :key="file.uid"
                class="file-item"
              >
                <el-icon class="file-icon"><document /></el-icon>
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.size) }}</div>
                </div>
                <el-progress
                  v-if="file.status === 'uploading'"
                  :percentage="file.percentage || 0"
                  class="file-progress"
                />
                <el-button
                  link
                  type="danger"
                  @click="handleRemoveFile(file)"
                  class="remove-btn"
                >
                  <el-icon><delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- AI自动收集开关 -->
          <div class="auto-collect-section">
            <el-switch
              v-model="autoCollectEnabled"
              active-text="启用AI自动收集"
              inactive-text=""
            />
            <div class="collect-description">
              开启后，AI将自动从公开渠道收集企业工商、财务、征信等信息
            </div>
          </div>
        </div>
      </div>

      <!-- 步骤3: AI分析 -->
      <div v-show="currentStep === 2" class="step-content">
        <div class="analysis-section">
          <div
            v-for="task in analysisTasks"
            :key="task.id"
            class="analysis-card"
          >
            <div class="card-header">
              <el-icon class="task-icon" :class="getTaskIconClass(task.status)">
                <component :is="getTaskIcon(task.status)" />
              </el-icon>
              <div class="task-info">
                <h3 class="task-title">{{ task.title }}</h3>
                <p class="task-status">{{ getTaskStatusText(task.status) }}</p>
              </div>
            </div>
            <el-progress
              :percentage="task.progress"
              :status="getProgressStatus(task.status)"
              :stroke-width="8"
            />
          </div>
        </div>
      </div>

      <!-- 步骤4: 报告生成 -->
      <div v-show="currentStep === 3" class="step-content">
        <div class="success-section">
          <el-icon class="success-icon"><circle-check /></el-icon>
          <h2 class="success-title">尽调报告生成成功！</h2>
          <p class="success-description">
            AI已完成尽职调查报告的撰写，您可以查看报告详情或返回列表
          </p>

          <!-- 报告预览卡片 -->
          <div class="report-preview">
            <div class="preview-item">
              <span class="preview-label">项目名称：</span>
              <span class="preview-value">{{ basicForm.projectName }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">报告类型：</span>
              <span class="preview-value">{{ basicForm.reportType }}</span>
            </div>
            <div class="preview-item">
              <span class="preview-label">创建时间：</span>
              <span class="preview-value">{{ currentTime }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="success-actions">
            <el-button @click="handleBackToList">返回列表</el-button>
            <el-button type="primary" @click="handleViewReport">
              查看报告
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 底部导航栏 -->
    <div class="footer-nav" v-if="currentStep < 3">
      <el-button @click="handleCancel">取消</el-button>
      <div class="nav-buttons">
        <el-button
          v-if="currentStep > 0"
          @click="handlePrevStep"
        >
          上一步
        </el-button>
        <el-button
          v-if="currentStep < 3"
          type="primary"
          @click="handleNextStep"
          :loading="processing"
        >
          {{ currentStep === 2 ? '开始分析' : '下一步' }}
        </el-button>
      </div>
    </div>

    <div class="footer-nav" v-else>
      <el-button @click="handleBackToList">返回列表</el-button>
      <el-button type="primary" @click="handleViewReport">完成</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance, FormRules, UploadUserFile, UploadProps } from 'element-plus'
import {
  UploadFilled,
  Document,
  Delete,
  CircleCheck,
  Loading,
  SuccessFilled,
  WarningFilled,
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 编辑模式
const isEditMode = ref(false)
const editId = ref('')

// 当前步骤
const currentStep = ref(0)
const processing = ref(false)

// 生成的报告ID
const generatedReportId = ref('')

// 基本信息表单
interface BasicForm {
  projectName: string
  lessee: string
  reportType: string
  template: string
  remark: string
}

const basicFormRef = ref<FormInstance>()
const basicForm = reactive<BasicForm>({
  projectName: '',
  lessee: '',
  reportType: '标准尽调',
  template: '通用模板',
  remark: '',
})

// 表单验证规则
const basicRules: FormRules = {
  projectName: [
    { required: true, message: '请选择项目名称', trigger: 'change' },
  ],
  lessee: [
    { required: true, message: '请输入承租人名称', trigger: 'blur' },
  ],
  reportType: [
    { required: true, message: '请选择报告类型', trigger: 'change' },
  ],
  template: [
    { required: true, message: '请选择报告模板', trigger: 'change' },
  ],
}

// 文件上传
interface FileItem extends UploadUserFile {
  category?: string
  percentage?: number
}

const activeCategory = ref('financial')
const fileList = ref<FileItem[]>([])
const autoCollectEnabled = ref(false)

// 文件变化处理
const handleFileChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
  const newFile = uploadFile as FileItem
  newFile.category = activeCategory.value
  newFile.status = 'success'
  fileList.value = uploadFiles as FileItem[]
}

// 获取当前分类的文件列表
const getCategoryFileList = () => {
  return fileList.value.filter(file => file.category === activeCategory.value)
}

// 格式化文件大小
const formatFileSize = (size: number | undefined) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  return `${fileSize.toFixed(2)} ${units[index]}`
}

// 删除文件
const handleRemoveFile = (file: FileItem) => {
  const index = fileList.value.findIndex(f => f.uid === file.uid)
  if (index > -1) {
    fileList.value.splice(index, 1)
  }
}

// AI分析任务
interface AnalysisTask {
  id: number
  title: string
  progress: number
  status: 'waiting' | 'running' | 'success' | 'error'
}

const analysisTasks = ref<AnalysisTask[]>([
  {
    id: 1,
    title: '财务分析',
    progress: 0,
    status: 'waiting',
  },
  {
    id: 2,
    title: '风险评估',
    progress: 0,
    status: 'waiting',
  },
  {
    id: 3,
    title: '行业对比',
    progress: 0,
    status: 'waiting',
  },
  {
    id: 4,
    title: '信用评级',
    progress: 0,
    status: 'waiting',
  },
])

// 获取任务状态文本
const getTaskStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    waiting: '等待中...',
    running: '分析中...',
    success: '已完成',
    error: '分析失败',
  }
  return statusMap[status] || status
}

// 获取进度条状态
const getProgressStatus = (status: string) => {
  if (status === 'success') return 'success'
  if (status === 'error') return 'exception'
  return undefined
}

// 获取任务图标
const getTaskIcon = (status: string) => {
  if (status === 'running') return Loading
  if (status === 'success') return SuccessFilled
  if (status === 'error') return WarningFilled
  return Document
}

// 获取任务图标类名
const getTaskIconClass = (status: string) => {
  return `icon-${status}`
}

// 开始AI分析
const startAnalysis = () => {
  let currentTaskIndex = 0

  const runTask = () => {
    if (currentTaskIndex >= analysisTasks.value.length) {
      processing.value = false
      setTimeout(() => {
        currentStep.value = 3
      }, 500)
      return
    }

    const task = analysisTasks.value[currentTaskIndex]
    task.status = 'running'
    task.progress = 0

    const interval = setInterval(() => {
      task.progress += 10
      if (task.progress >= 100) {
        clearInterval(interval)
        task.status = 'success'
        currentTaskIndex++
        setTimeout(runTask, 300)
      }
    }, 200)
  }

  runTask()
}

// 当前时间
const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

// 上一步
const handlePrevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const handleNextStep = async () => {
  if (currentStep.value === 0) {
    // 验证基本信息
    if (!basicFormRef.value) return
    try {
      await basicFormRef.value.validate()
      currentStep.value = 1
    } catch (error) {
      ElMessage.warning('请完善基本信息')
    }
  } else if (currentStep.value === 1) {
    // 验证资料收集
    if (fileList.value.length === 0 && !autoCollectEnabled.value) {
      ElMessage.warning('请至少上传一个文件或启用AI自动收集')
      return
    }
    currentStep.value = 2
    // 自动开始分析
    setTimeout(() => {
      processing.value = true
      startAnalysis()
    }, 500)
  } else if (currentStep.value === 2) {
    // 开始AI分析
    processing.value = true
    startAnalysis()
  }
}

// 取消
const handleCancel = () => {
  router.push('/due-diligence')
}

// 查看报告
const handleViewReport = () => {
  const reportId = isEditMode.value ? editId.value : generatedReportId.value
  router.push(`/due-diligence/${reportId}`)
}

// 返回列表
const handleBackToList = () => {
  router.push('/due-diligence')
}

// Mock数据 — 编辑模式预填
const mockEditData: Record<string, { projectName: string; lessee: string; reportType: string; template: string; remark: string }> = {
  DD006: { projectName: '工程机械租赁项目B', lessee: '深圳市大疆创新科技有限公司', reportType: '标准尽调', template: '工程机械模板', remark: '大疆创新售后回租项目' },
  DD010: { projectName: '工程机械租赁项目B', lessee: '小米科技有限责任公司', reportType: '深度尽调', template: '通用模板', remark: '小米科技售后回租项目' },
  DD002: { projectName: '工程机械租赁项目B', lessee: '华为技术有限公司', reportType: '标准尽调', template: '工程机械模板', remark: '华为售后回租项目' },
  DD008: { projectName: '办公设备租赁项目D', lessee: '美的集团股份有限公司', reportType: '简化尽调', template: '通用模板', remark: '美的办公设备租赁' },
}

onMounted(() => {
  const mode = route.query.mode as string
  const id = route.query.id as string
  if (mode === 'edit' && id) {
    isEditMode.value = true
    editId.value = id
    // 预填表单数据
    const data = mockEditData[id]
    if (data) {
      basicForm.projectName = data.projectName
      basicForm.lessee = data.lessee
      basicForm.reportType = data.reportType
      basicForm.template = data.template
      basicForm.remark = data.remark
    }
  }
  // 生成新报告ID
  generatedReportId.value = `DD${String(Date.now()).slice(-3)}`
})
</script>

<style scoped>
.due-diligence-create {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.steps-card {
  margin-bottom: 20px;
  padding: 30px 20px;
}

.content-card {
  margin-bottom: 80px;
  min-height: 500px;
}

.step-content {
  padding: 40px 20px;
}

/* 基本信息表单 */
.basic-form {
  max-width: 700px;
  margin: 0 auto;
}

/* 资料收集 */
.upload-section {
  max-width: 900px;
  margin: 0 auto;
}

.category-tabs {
  margin-bottom: 30px;
}

.upload-area {
  margin-bottom: 30px;
}

.upload-area :deep(.el-upload-dragger) {
  padding: 60px 20px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  transition: all 0.3s;
}

.upload-area :deep(.el-upload-dragger:hover) {
  border-color: #FF6600;
}

.el-icon--upload {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.uploaded-files {
  margin-bottom: 30px;
}

.files-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.file-list {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  transition: background-color 0.3s;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background-color: #f5f7fa;
}

.file-icon {
  font-size: 24px;
  color: #409eff;
  margin-right: 12px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.file-size {
  font-size: 12px;
  color: #909399;
}

.file-progress {
  width: 200px;
  margin-right: 12px;
}

.remove-btn {
  font-size: 18px;
}

.auto-collect-section {
  padding: 24px;
  background-color: #f5f7fa;
  border-radius: 8px;
  text-align: center;
}

.collect-description {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
}

/* AI分析 */
.analysis-section {
  max-width: 800px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.analysis-card {
  padding: 24px;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.analysis-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.task-icon {
  font-size: 32px;
  margin-right: 12px;
}

.task-icon.icon-waiting {
  color: #909399;
}

.task-icon.icon-running {
  color: #FF6600;
  animation: rotate 1s linear infinite;
}

.task-icon.icon-success {
  color: #67c23a;
}

.task-icon.icon-error {
  color: #f56c6c;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.task-status {
  font-size: 13px;
  color: #666;
  margin: 0;
}

/* 报告生成成功 */
.success-section {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.success-icon {
  font-size: 80px;
  color: #67c23a;
  margin-bottom: 24px;
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.success-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 32px 0;
}

.report-preview {
  padding: 24px;
  background-color: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 32px;
  text-align: left;
}

.preview-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
}

.preview-item:last-child {
  border-bottom: none;
}

.preview-label {
  font-size: 14px;
  color: #666;
  width: 100px;
}

.preview-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.success-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 底部导航栏 */
.footer-nav {
  position: fixed;
  bottom: 0;
  left: 200px;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-buttons {
  display: flex;
  gap: 12px;
}

/* Hermès Orange 主题色 */
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

:deep(.el-step__title.is-finish),
:deep(.el-step__title.is-process) {
  color: #FF6600;
}

:deep(.el-step__head.is-finish .el-step__line) {
  background-color: #FF6600;
}

:deep(.el-step__head.is-finish .el-step__icon) {
  border-color: #FF6600;
  color: #FF6600;
}

:deep(.el-step__head.is-process .el-step__icon) {
  background-color: #FF6600;
  border-color: #FF6600;
}

:deep(.el-progress__text) {
  font-size: 12px !important;
}

:deep(.el-progress-bar__outer) {
  background-color: #e4e7ed;
}

:deep(.el-progress-bar__inner) {
  background-color: #FF6600;
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #FF6600;
  border-color: #FF6600;
}

:deep(.el-tabs__active-bar) {
  background-color: #FF6600;
}

:deep(.el-tabs__item.is-active) {
  color: #FF6600;
}

:deep(.el-tabs__item:hover) {
  color: #FF6600;
}
</style>
