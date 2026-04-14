<template>
  <div class="smart-collection">
    <!-- 操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">智能催收</h2>
      <div class="header-right">
        <el-button type="primary" @click="handleNewTask">
          <el-icon><Plus /></el-icon>
          新建催收任务
        </el-button>
      </div>
    </div>

    <!-- 逾期概览统计 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="item in overviewStats" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value" :style="{ color: item.color }">{{ item.value }}</div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="24"><component :is="item.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="逾期等级">
          <el-select v-model="filterForm.level" placeholder="全部等级" style="width: 140px" clearable>
            <el-option label="全部等级" value="" />
            <el-option label="轻度逾期(1-30天)" value="mild" />
            <el-option label="中度逾期(31-90天)" value="moderate" />
            <el-option label="严重逾期(91-180天)" value="severe" />
            <el-option label="特殊逾期(180天+)" value="critical" />
          </el-select>
        </el-form-item>
        <el-form-item label="催收状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" style="width: 140px" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="待催收" value="pending" />
            <el-option label="催收中" value="processing" />
            <el-option label="已承诺还款" value="promised" />
            <el-option label="已回款" value="recovered" />
            <el-option label="转法务" value="legal" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="filterForm.keyword" placeholder="搜索承租人/项目名称" style="width: 220px" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 催收任务列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>催收任务列表</span>
          <span class="table-count">共 {{ filteredList.length }} 条</span>
        </div>
      </template>

      <el-table :data="filteredList" stripe border style="width: 100%">
        <el-table-column prop="projectName" label="项目名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="lessee" label="承租人" width="120" />
        <el-table-column prop="contractAmount" label="合同金额(万)" width="120" align="right">
          <template #default="{ row }">
            <span class="amount-text">{{ row.contractAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="overdueAmount" label="逾期金额(万)" width="120" align="right">
          <template #default="{ row }">
            <span class="overdue-amount">{{ row.overdueAmount.toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="overdueDays" label="逾期天数" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getOverdueLevelType(row.overdueDays)" size="small">
              {{ row.overdueDays }}天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="逾期等级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTagType(row.level)" effect="dark" size="small">
              {{ getLevelLabel(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="催收状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="strategy" label="催收策略" min-width="140" show-overflow-tooltip />
        <el-table-column prop="handler" label="负责人" width="90" align="center" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>详情
            </el-button>
            <el-button type="warning" link size="small" @click="handleGenerateStrategy(row)">
              <el-icon><MagicStick /></el-icon>AI策略
            </el-button>
            <el-button type="success" link size="small" @click="handleAddRecord(row)">
              <el-icon><EditPen /></el-icon>记录
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 催收详情对话框 -->
    <el-dialog v-model="detailVisible" title="催收详情" width="800px" top="5vh">
      <div v-if="currentTask" class="detail-content">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="项目名称">{{ currentTask.projectName }}</el-descriptions-item>
          <el-descriptions-item label="承租人">{{ currentTask.lessee }}</el-descriptions-item>
          <el-descriptions-item label="合同金额">{{ currentTask.contractAmount }}万元</el-descriptions-item>
          <el-descriptions-item label="逾期金额">
            <span class="overdue-amount">{{ currentTask.overdueAmount }}万元</span>
          </el-descriptions-item>
          <el-descriptions-item label="逾期天数">
            <el-tag :type="getOverdueLevelType(currentTask.overdueDays)" size="small">
              {{ currentTask.overdueDays }}天
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="逾期等级">
            <el-tag :type="getLevelTagType(currentTask.level)" effect="dark" size="small">
              {{ getLevelLabel(currentTask.level) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="催收状态">
            <el-tag :type="getStatusTagType(currentTask.status)" size="small">
              {{ getStatusLabel(currentTask.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentTask.handler }}</el-descriptions-item>
        </el-descriptions>

        <!-- AI催收策略 -->
        <div class="section-title">
          <el-icon color="#FF6600"><MagicStick /></el-icon>
          <span>AI催收策略建议</span>
        </div>
        <el-card shadow="never" class="strategy-card">
          <div class="strategy-content" v-html="currentTask.aiStrategy || '暂无AI策略，请点击「AI策略」按钮生成'"></div>
        </el-card>

        <!-- 催收记录时间线 -->
        <div class="section-title">
          <el-icon color="#409EFF"><Clock /></el-icon>
          <span>催收记录</span>
        </div>
        <el-timeline v-if="currentTask.records && currentTask.records.length > 0">
          <el-timeline-item
            v-for="record in currentTask.records"
            :key="record.id"
            :timestamp="record.time"
            :color="record.color"
          >
            <div class="record-item">
              <div class="record-type">
                <el-tag size="small" :type="record.tagType">{{ record.type }}</el-tag>
              </div>
              <div class="record-text">{{ record.content }}</div>
              <div class="record-operator">操作人：{{ record.operator }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无催收记录" :image-size="60" />
      </div>
    </el-dialog>

    <!-- AI策略生成对话框 -->
    <el-dialog v-model="strategyVisible" title="AI催收策略生成" width="650px">
      <div v-if="strategyLoading" class="strategy-loading">
        <el-icon class="is-loading" :size="40" color="#FF6600"><Loading /></el-icon>
        <p>AI正在分析逾期情况，生成最优催收策略...</p>
      </div>
      <div v-else class="strategy-result">
        <el-alert title="AI策略生成完成" type="success" :closable="false" show-icon />
        <div class="strategy-detail" v-html="generatedStrategy"></div>
        <div class="strategy-actions">
          <el-button type="primary" @click="handleApplyStrategy">采纳策略</el-button>
          <el-button @click="handleRegenerateStrategy">重新生成</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加催收记录对话框 -->
    <el-dialog v-model="recordVisible" title="添加催收记录" width="500px">
      <el-form :model="recordForm" label-width="80px">
        <el-form-item label="催收方式">
          <el-select v-model="recordForm.type" placeholder="请选择催收方式" style="width: 100%">
            <el-option label="电话催收" value="电话催收" />
            <el-option label="短信催收" value="短信催收" />
            <el-option label="上门催收" value="上门催收" />
            <el-option label="律师函" value="律师函" />
            <el-option label="法务介入" value="法务介入" />
          </el-select>
        </el-form-item>
        <el-form-item label="催收结果">
          <el-select v-model="recordForm.result" placeholder="请选择催收结果" style="width: 100%">
            <el-option label="承诺还款" value="promised" />
            <el-option label="部分还款" value="partial" />
            <el-option label="拒绝还款" value="refused" />
            <el-option label="无法联系" value="unreachable" />
            <el-option label="协商中" value="negotiating" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="recordForm.content" type="textarea" :rows="4" placeholder="请输入催收详情..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRecord">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新建催收任务对话框 -->
    <el-dialog v-model="newTaskVisible" title="新建催收任务" width="600px">
      <el-form :model="newTaskForm" label-width="100px">
        <el-form-item label="关联项目">
          <el-select v-model="newTaskForm.projectName" placeholder="请选择关联项目" style="width: 100%" filterable>
            <el-option label="中联重科设备融资" value="中联重科设备融资" />
            <el-option label="格力电器产线租赁" value="格力电器产线租赁" />
            <el-option label="京东物流车辆租赁" value="京东物流车辆租赁" />
          </el-select>
        </el-form-item>
        <el-form-item label="承租人">
          <el-input v-model="newTaskForm.lessee" placeholder="请输入承租人名称" />
        </el-form-item>
        <el-form-item label="合同金额(万)">
          <el-input-number v-model="newTaskForm.contractAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="逾期金额(万)">
          <el-input-number v-model="newTaskForm.overdueAmount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="逾期天数">
          <el-input-number v-model="newTaskForm.overdueDays" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="newTaskForm.handler" placeholder="请选择负责人" style="width: 100%">
            <el-option label="张三" value="张三" />
            <el-option label="李四" value="李四" />
            <el-option label="王五" value="王五" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="newTaskVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreateTask">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Plus, Search, Refresh, View, MagicStick, EditPen, Clock, Loading,
  Bell, Money, Warning, Timer,
} from '@element-plus/icons-vue'

// ========== 概览统计 ==========
const overviewStats = [
  { title: '逾期项目数', value: '18', color: '#F56C6C', icon: markRaw(Warning) },
  { title: '逾期总额(万)', value: '3,256', color: '#E6A23C', icon: markRaw(Money) },
  { title: '催收中', value: '12', color: '#409EFF', icon: markRaw(Bell) },
  { title: '本月回款(万)', value: '856', color: '#67C23A', icon: markRaw(Timer) },
]

// ========== 筛选 ==========
const filterForm = ref({ level: '', status: '', keyword: '' })
const handleSearch = () => {}
const handleReset = () => { filterForm.value = { level: '', status: '', keyword: '' } }

// ========== Mock数据 ==========
const collectionList = ref([
  { id: 1, projectName: '华为设备融资租赁', lessee: '华为技术有限公司', contractAmount: 2800, overdueAmount: 156, overdueDays: 15, level: 'mild', status: 'processing', strategy: '电话提醒+短信催收', handler: '张三',
    aiStrategy: '<p><b>策略建议：温和提醒</b></p><p>1. 发送逾期提醒短信</p><p>2. 48小时内电话跟进</p><p>3. 了解逾期原因，协商还款计划</p>',
    records: [
      { id: 1, time: '2024-01-14 10:30', type: '电话催收', content: '已联系财务部张经理，对方表示本周五前安排付款', operator: '张三', color: '#409EFF', tagType: 'primary' },
      { id: 2, time: '2024-01-12 14:20', type: '短信催收', content: '发送逾期提醒短信至财务负责人', operator: '张三', color: '#67C23A', tagType: 'success' },
    ],
  },
  { id: 2, projectName: '小米供应链融资', lessee: '小米科技有限公司', contractAmount: 1500, overdueAmount: 89, overdueDays: 8, level: 'mild', status: 'promised', strategy: '短信提醒', handler: '李四',
    aiStrategy: '<p><b>策略建议：常规跟进</b></p><p>1. 已承诺还款，保持跟踪</p><p>2. 到期日前1天再次确认</p>',
    records: [{ id: 1, time: '2024-01-13 09:15', type: '电话催收', content: '对方承诺1月18日前还款', operator: '李四', color: '#67C23A', tagType: 'success' }],
  },
  { id: 3, projectName: '比亚迪新能源车辆租赁', lessee: '比亚迪股份有限公司', contractAmount: 3500, overdueAmount: 420, overdueDays: 45, level: 'moderate', status: 'processing', strategy: '电话催收+上门拜访', handler: '王五',
    aiStrategy: '<p><b>策略建议：加强催收</b></p><p>1. 每周2次电话催收</p><p>2. 安排上门拜访</p><p>3. 发送正式催款函</p><p>4. 评估是否需要法务介入</p>',
    records: [
      { id: 1, time: '2024-01-15 11:00', type: '上门催收', content: '拜访对方总部，与财务总监面谈，对方表示资金周转困难，申请分期还款', operator: '王五', color: '#E6A23C', tagType: 'warning' },
      { id: 2, time: '2024-01-10 15:30', type: '电话催收', content: '多次致电未接通', operator: '王五', color: '#F56C6C', tagType: 'danger' },
      { id: 3, time: '2024-01-05 09:00', type: '短信催收', content: '发送催款通知短信', operator: '王五', color: '#409EFF', tagType: 'primary' },
    ],
  },
  { id: 4, projectName: '腾讯云服务器租赁', lessee: '腾讯云计算有限公司', contractAmount: 1200, overdueAmount: 65, overdueDays: 5, level: 'mild', status: 'pending', strategy: '待分配', handler: '张三', aiStrategy: null, records: [] },
  { id: 5, projectName: '中联重科设备融资', lessee: '中联重科股份有限公司', contractAmount: 5200, overdueAmount: 890, overdueDays: 120, level: 'severe', status: 'legal', strategy: '法务介入+资产保全', handler: '李四',
    aiStrategy: '<p><b>策略建议：法务处置</b></p><p>1. 已委托律师事务所发送律师函</p><p>2. 准备诉讼材料</p><p>3. 申请财产保全</p><p>4. 同步评估抵押物处置方案</p>',
    records: [
      { id: 1, time: '2024-01-14 16:00', type: '法务介入', content: '已委托北京金杜律师事务所，准备起诉材料', operator: '李四', color: '#F56C6C', tagType: 'danger' },
      { id: 2, time: '2024-01-08 10:00', type: '律师函', content: '发送正式律师函，要求15日内还款', operator: '李四', color: '#E6A23C', tagType: 'warning' },
      { id: 3, time: '2023-12-20 14:00', type: '上门催收', content: '上门拜访，对方拒绝沟通', operator: '王五', color: '#F56C6C', tagType: 'danger' },
      { id: 4, time: '2023-12-01 09:30', type: '电话催收', content: '多次电话催收无果', operator: '李四', color: '#909399', tagType: 'info' },
    ],
  },
  { id: 6, projectName: '宁德时代电池设备融资', lessee: '宁德时代新能源科技', contractAmount: 4800, overdueAmount: 356, overdueDays: 62, level: 'moderate', status: 'processing', strategy: '电话催收+催款函', handler: '张三',
    aiStrategy: '<p><b>策略建议：持续施压</b></p><p>1. 每周电话催收</p><p>2. 发送正式催款函</p><p>3. 限期15天内还款，否则启动法务程序</p>',
    records: [{ id: 1, time: '2024-01-13 14:00', type: '电话催收', content: '联系到财务经理，对方称正在走内部审批流程', operator: '张三', color: '#409EFF', tagType: 'primary' }],
  },
  { id: 7, projectName: '阿里云数据中心设备', lessee: '阿里云计算有限公司', contractAmount: 2200, overdueAmount: 180, overdueDays: 35, level: 'moderate', status: 'promised', strategy: '协商分期还款', handler: '王五',
    aiStrategy: '<p><b>策略建议：分期方案</b></p><p>1. 已达成分期还款协议</p><p>2. 首期1月20日，末期3月20日</p><p>3. 持续跟踪每期还款情况</p>',
    records: [{ id: 1, time: '2024-01-12 11:00', type: '电话催收', content: '达成分期还款协议，分3期偿还', operator: '王五', color: '#67C23A', tagType: 'success' }],
  },
  { id: 8, projectName: '格力电器产线租赁', lessee: '珠海格力电器股份', contractAmount: 3100, overdueAmount: 100, overdueDays: 200, level: 'critical', status: 'legal', strategy: '诉讼+资产处置', handler: '李四',
    aiStrategy: '<p><b>策略建议：强制执行</b></p><p>1. 已提起诉讼</p><p>2. 申请强制执行</p><p>3. 评估抵押设备拍卖方案</p>',
    records: [
      { id: 1, time: '2024-01-10 09:00', type: '法务介入', content: '法院已受理，等待开庭', operator: '李四', color: '#F56C6C', tagType: 'danger' },
      { id: 2, time: '2023-11-15 10:00', type: '律师函', content: '发送第二次律师函', operator: '李四', color: '#E6A23C', tagType: 'warning' },
    ],
  },
])

// ========== 筛选逻辑 ==========
const filteredList = computed(() => {
  return collectionList.value.filter(item => {
    if (filterForm.value.level && item.level !== filterForm.value.level) return false
    if (filterForm.value.status && item.status !== filterForm.value.status) return false
    if (filterForm.value.keyword) {
      const kw = filterForm.value.keyword.toLowerCase()
      if (!item.projectName.toLowerCase().includes(kw) && !item.lessee.toLowerCase().includes(kw)) return false
    }
    return true
  })
})

// ========== 工具函数 ==========
const getOverdueLevelType = (days: number) => {
  if (days <= 30) return 'warning'
  if (days <= 90) return ''
  return 'danger'
}
const getLevelTagType = (level: string) => ({ mild: 'warning', moderate: '', severe: 'danger', critical: 'danger' }[level] || 'info')
const getLevelLabel = (level: string) => ({ mild: '轻度逾期', moderate: '中度逾期', severe: '严重逾期', critical: '特殊逾期' }[level] || level)
const getStatusTagType = (status: string) => ({ pending: 'info', processing: 'primary', promised: 'success', recovered: 'success', legal: 'danger' }[status] || 'info')
const getStatusLabel = (status: string) => ({ pending: '待催收', processing: '催收中', promised: '已承诺还款', recovered: '已回款', legal: '转法务' }[status] || status)

// ========== 详情对话框 ==========
const detailVisible = ref(false)
const currentTask = ref<any>(null)
const handleViewDetail = (row: any) => { currentTask.value = row; detailVisible.value = true }

// ========== AI策略生成 ==========
const strategyVisible = ref(false)
const strategyLoading = ref(false)
const generatedStrategy = ref('')
const strategyTargetTask = ref<any>(null)

const handleGenerateStrategy = (row: any) => {
  strategyTargetTask.value = row
  strategyVisible.value = true
  strategyLoading.value = true
  setTimeout(() => {
    const strategies: Record<string, string> = {
      mild: '<h4>轻度逾期催收方案</h4><p><b>风险评估：</b>低风险，客户信用良好</p><p><b>建议策略：</b></p><ol><li>发送友好提醒短信</li><li>24-48小时后电话跟进</li><li>了解逾期原因，提供便捷还款渠道</li><li>如有资金困难，可协商延期3-7天</li></ol><p><b>预计回款率：</b>95%</p>',
      moderate: '<h4>中度逾期催收方案</h4><p><b>风险评估：</b>中等风险，需加强关注</p><p><b>建议策略：</b></p><ol><li>每周至少2次电话催收</li><li>发送正式催款函</li><li>安排上门拜访</li><li>评估分期还款方案</li><li>15天内无进展则启动法务预警</li></ol><p><b>预计回款率：</b>75%</p>',
      severe: '<h4>严重逾期催收方案</h4><p><b>风险评估：</b>高风险，需立即行动</p><p><b>建议策略：</b></p><ol><li>委托律师发送律师函</li><li>启动财产保全申请</li><li>评估抵押物价值</li><li>准备诉讼材料</li><li>给予7天最后期限</li></ol><p><b>预计回款率：</b>50%</p>',
      critical: '<h4>特殊逾期催收方案</h4><p><b>风险评估：</b>极高风险</p><p><b>建议策略：</b></p><ol><li>立即提起诉讼</li><li>申请强制执行</li><li>启动抵押物拍卖</li><li>追究担保人连带责任</li><li>计提坏账准备</li></ol><p><b>预计回款率：</b>30%</p>',
    }
    generatedStrategy.value = strategies[row.level] || strategies.mild
    strategyLoading.value = false
  }, 2000)
}

const handleApplyStrategy = () => {
  if (strategyTargetTask.value) { strategyTargetTask.value.aiStrategy = generatedStrategy.value; ElMessage.success('AI策略已采纳') }
  strategyVisible.value = false
}
const handleRegenerateStrategy = () => { strategyLoading.value = true; setTimeout(() => { strategyLoading.value = false }, 1500) }

// ========== 添加催收记录 ==========
const recordVisible = ref(false)
const recordForm = ref({ type: '', result: '', content: '' })
const recordTargetTask = ref<any>(null)

const handleAddRecord = (row: any) => { recordTargetTask.value = row; recordForm.value = { type: '', result: '', content: '' }; recordVisible.value = true }

const handleSaveRecord = () => {
  if (!recordForm.value.type || !recordForm.value.content) { ElMessage.warning('请填写催收方式和备注'); return }
  if (recordTargetTask.value) {
    const colorMap: Record<string, string> = { '电话催收': '#409EFF', '短信催收': '#67C23A', '上门催收': '#E6A23C', '律师函': '#F56C6C', '法务介入': '#F56C6C' }
    const tagMap: Record<string, string> = { '电话催收': 'primary', '短信催收': 'success', '上门催收': 'warning', '律师函': 'danger', '法务介入': 'danger' }
    if (!recordTargetTask.value.records) recordTargetTask.value.records = []
    recordTargetTask.value.records.unshift({
      id: Date.now(), time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
      type: recordForm.value.type, content: recordForm.value.content, operator: '当前用户',
      color: colorMap[recordForm.value.type] || '#409EFF', tagType: tagMap[recordForm.value.type] || 'primary',
    })
    ElMessage.success('催收记录已添加')
  }
  recordVisible.value = false
}

// ========== 新建催收任务 ==========
const newTaskVisible = ref(false)
const newTaskForm = ref({ projectName: '', lessee: '', contractAmount: 0, overdueAmount: 0, overdueDays: 1, handler: '' })

const handleNewTask = () => { newTaskForm.value = { projectName: '', lessee: '', contractAmount: 0, overdueAmount: 0, overdueDays: 1, handler: '' }; newTaskVisible.value = true }

const handleCreateTask = () => {
  if (!newTaskForm.value.projectName || !newTaskForm.value.lessee) { ElMessage.warning('请填写项目名称和承租人'); return }
  const days = newTaskForm.value.overdueDays
  let level = 'mild'
  if (days > 180) level = 'critical'
  else if (days > 90) level = 'severe'
  else if (days > 30) level = 'moderate'
  collectionList.value.unshift({ id: Date.now(), ...newTaskForm.value, level, status: 'pending', strategy: '待分配', aiStrategy: null, records: [] })
  ElMessage.success('催收任务已创建')
  newTaskVisible.value = false
}
</script>

<style scoped>
.smart-collection {
  padding: 20px;
}

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

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-3px);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 26px;
  font-weight: 600;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.table-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-count {
  font-size: 13px;
  color: #999;
}

.amount-text {
  font-weight: 500;
  color: #333;
}

.overdue-amount {
  font-weight: 600;
  color: #F56C6C;
}

/* 详情对话框 */
.detail-content {
  max-height: 65vh;
  overflow-y: auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 24px 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.strategy-card {
  background-color: #fdf6ec;
  border: 1px solid #faecd8;
}

.strategy-content {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
}

.record-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.record-text {
  font-size: 14px;
  color: #666;
}

.record-operator {
  font-size: 12px;
  color: #999;
}

/* AI策略对话框 */
.strategy-loading {
  text-align: center;
  padding: 40px 0;
}

.strategy-loading p {
  margin-top: 16px;
  color: #999;
  font-size: 14px;
}

.strategy-result .strategy-detail {
  margin: 16px 0;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
}

.strategy-actions {
  text-align: right;
  margin-top: 16px;
}
</style>
