<template>
  <div class="knowledge-base">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.bg }">
            <el-icon :size="24" :color="stat.color"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="searchText"
          placeholder="搜索文档名称..."
          prefix-icon="Search"
          clearable
          style="width: 260px"
        />
        <el-select v-model="filterCategory" placeholder="全部分类" clearable style="width: 150px">
          <el-option
            v-for="cat in categories"
            :key="cat.value"
            :label="cat.label"
            :value="cat.value"
          />
        </el-select>
        <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 120px">
          <el-option label="已完成" value="completed" />
          <el-option label="处理中" value="processing" />
          <el-option label="失败" value="failed" />
        </el-select>
      </div>
      <el-button type="primary" @click="showUpload = true">
        <el-icon><Upload /></el-icon> 上传文档
      </el-button>
    </div>

    <!-- 文档列表 -->
    <el-table :data="filteredDocs" stripe style="width: 100%">
      <el-table-column prop="name" label="文档名称" min-width="220">
        <template #default="{ row }">
          <div class="doc-name">
            <el-icon class="doc-icon" :color="getDocIconColor(row.type)"><component :is="getDocIcon(row.type)" /></el-icon>
            {{ row.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="分类" width="120">
        <template #default="{ row }">
          <el-tag :type="getCategoryTagType(row.category)" size="small" effect="plain">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="100" />
      <el-table-column prop="chunks" label="切片数" width="90" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'completed' ? 'success' : row.status === 'processing' ? 'warning' : 'danger'"
            size="small"
          >
            {{ row.status === 'completed' ? '已完成' : row.status === 'processing' ? '处理中' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="uploadTime" label="上传时间" width="170" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="viewDoc(row)">查看</el-button>
          <el-button link type="primary" size="small" @click="reparse(row)">重新解析</el-button>
          <el-button link type="danger" size="small" @click="deleteDoc(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="10"
        :total="totalDocs"
        layout="total, prev, pager, next"
        background
      />
    </div>

    <!-- 上传弹窗 -->
    <el-dialog v-model="showUpload" title="上传文档" width="520px" :close-on-click-modal="false">
      <el-form label-width="80px">
        <el-form-item label="文档分类">
          <el-select v-model="uploadCategory" placeholder="请选择分类" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.value"
              :label="cat.label"
              :value="cat.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept=".pdf,.doc,.docx,.txt,.md"
            multiple
          >
            <el-icon class="el-icon--upload" style="font-size:48px;color:#FF6600"><Upload /></el-icon>
            <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
            <template #tip>
              <div class="el-upload__tip">支持 PDF、Word、TXT、Markdown，单文件不超过 50MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUpload = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload" style="background:#FF6600;border-color:#FF6600">
          开始上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { Upload, Document, Coin, CircleCheckFilled, TrendCharts, Notebook, DocumentCopy, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const categories = [
  { label: '法律法规', value: 'law' },
  { label: '监管政策', value: 'regulation' },
  { label: '行业知识', value: 'industry' },
  { label: '会计税务', value: 'accounting' },
  { label: '公司制度', value: 'policy' },
  { label: '操作手册', value: 'manual' },
  { label: '案例库', value: 'cases' },
  { label: 'FAQ', value: 'faq' },
]

const stats = [
  { icon: markRaw(Document), label: '文档总数', value: 128, bg: '#fff5ef', color: '#FF6600' },
  { icon: markRaw(Coin), label: '知识切片', value: '12,456', bg: '#f0f5ff', color: '#409EFF' },
  { icon: markRaw(CircleCheckFilled), label: '已处理', value: 125, bg: '#f0fff4', color: '#67C23A' },
  { icon: markRaw(TrendCharts), label: '本周新增', value: 8, bg: '#fef5f5', color: '#F56C6C' },
]

// Mock 文档数据
const mockDocs = ref([
  { id: '1', name: '融资租赁公司监督管理暂行办法.pdf', type: 'pdf', category: 'regulation', size: '2.3 MB', chunks: 86, status: 'completed', uploadTime: '2025-04-10 14:30' },
  { id: '2', name: '企业会计准则第21号——租赁.pdf', type: 'pdf', category: 'accounting', size: '1.8 MB', chunks: 64, status: 'completed', uploadTime: '2025-04-09 10:15' },
  { id: '3', name: '融资租赁合同模板（直租）.docx', type: 'docx', category: 'manual', size: '456 KB', chunks: 32, status: 'completed', uploadTime: '2025-04-08 09:20' },
  { id: '4', name: '融资租赁税务处理实操指南.pdf', type: 'pdf', category: 'accounting', size: '3.1 MB', chunks: 0, status: 'processing', uploadTime: '2025-04-12 16:45' },
  { id: '5', name: '行业尽调报告案例汇编.pdf', type: 'pdf', category: 'cases', size: '8.5 MB', chunks: 215, status: 'completed', uploadTime: '2025-04-07 11:30' },
  { id: '6', name: '常见问题解答手册.md', type: 'md', category: 'faq', size: '128 KB', chunks: 42, status: 'completed', uploadTime: '2025-04-06 15:00' },
  { id: '7', name: '金融租赁公司管理办法.pdf', type: 'pdf', category: 'law', size: '1.2 MB', chunks: 0, status: 'failed', uploadTime: '2025-04-11 08:50' },
  { id: '8', name: '公司内部风控制度V3.docx', type: 'docx', category: 'policy', size: '890 KB', chunks: 56, status: 'completed', uploadTime: '2025-04-05 14:20' },
])

const searchText = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const showUpload = ref(false)
const uploadCategory = ref('')

const filteredDocs = computed(() => {
  return mockDocs.value.filter(d => {
    if (searchText.value && !d.name.includes(searchText.value)) return false
    if (filterCategory.value && d.category !== filterCategory.value) return false
    if (filterStatus.value && d.status !== filterStatus.value) return false
    return true
  })
})

const totalDocs = computed(() => filteredDocs.value.length)

function getDocIcon(type: string) {
  const icons: Record<string, any> = { pdf: Document, docx: Notebook, doc: Notebook, txt: DocumentCopy, md: EditPen }
  return icons[type] || Document
}

function getDocIconColor(type: string) {
  const colors: Record<string, string> = { pdf: '#E74C3C', docx: '#2980B9', doc: '#2980B9', txt: '#666', md: '#FF6600' }
  return colors[type] || '#666'
}

function getCategoryLabel(val: string) {
  return categories.find(c => c.value === val)?.label || val
}

function getCategoryTagType(val: string): '' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, '' | 'success' | 'warning' | 'danger' | 'info'> = {
    law: 'danger', regulation: 'warning', industry: '', accounting: 'success',
    policy: 'info', manual: '', cases: 'warning', faq: 'info',
  }
  return map[val] || ''
}

function viewDoc(row: any) {
  ElMessage.info(`查看文档：${row.name}`)
}

function reparse(row: any) {
  ElMessage.success(`已重新提交解析：${row.name}`)
  row.status = 'processing'
  row.chunks = 0
}

function deleteDoc(row: any) {
  ElMessageBox.confirm(`确定删除文档「${row.name}」？`, '确认删除', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    mockDocs.value = mockDocs.value.filter(d => d.id !== row.id)
    ElMessage.success('已删除')
  }).catch(() => {})
}

function handleFileChange() {}

function confirmUpload() {
  if (!uploadCategory.value) {
    ElMessage.warning('请选择文档分类')
    return
  }
  ElMessage.success('文档上传成功，正在解析中...')
  showUpload.value = false
}
</script>

<style scoped>
.knowledge-base {
  padding: 20px;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #333;
}
.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

/* 操作栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar-left {
  display: flex;
  gap: 12px;
}
.toolbar :deep(.el-button--primary:not(.is-link)) {
  background: #FF6600;
  border-color: #FF6600;
}

/* 文档名 */
.doc-name {
  display: flex;
  align-items: center;
  gap: 8px;
}
.doc-icon {
  font-size: 18px;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.pagination :deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #FF6600;
}

/* 操作链接按钮样式 */
:deep(.el-button--primary.is-link) {
  color: #FF6600;
}
:deep(.el-button--primary.is-link:hover) {
  color: #e55c00;
}
</style>
