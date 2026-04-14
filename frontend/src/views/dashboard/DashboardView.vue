<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <h2>欢迎使用融智通租赁平台</h2>
      <p>AI 驱动的融资租赁业务数字化工具</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="item in stats" :key="item.title">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">{{ item.title }}</div>
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-trend" :class="item.trend > 0 ? 'trend-up' : 'trend-down'">
                <el-icon><component :is="item.trend > 0 ? CaretTop : CaretBottom" /></el-icon>
                {{ Math.abs(item.trend) }}%
              </div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <el-icon :size="28"><component :is="item.icon" /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第一行图表：业务趋势 + 项目状态分布 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="16">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>业务趋势</span>
              <el-radio-group v-model="trendPeriod" size="small">
                <el-radio-button label="week">近7天</el-radio-button>
                <el-radio-button label="month">近30天</el-radio-button>
                <el-radio-button label="quarter">近3月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart class="chart" :option="trendChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>项目状态分布</span>
          </template>
          <v-chart class="chart" :option="projectStatusOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行图表：行业分布 + 风险等级分布 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>行业分布</span>
          </template>
          <v-chart class="chart" :option="industryChartOption" autoresize />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>风险等级分布</span>
          </template>
          <v-chart class="chart" :option="riskChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行图表：合同金额分布（全宽） -->
    <el-row :gutter="20" class="charts-row">
      <el-col :span="24">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <span>合同金额分布</span>
          </template>
          <v-chart class="chart chart-short" :option="amountChartOption" autoresize />
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card shadow="hover" class="quick-access-card">
      <template #header>
        <span>快捷入口</span>
      </template>
      <el-row :gutter="16">
        <el-col :span="4" v-for="module in quickModules" :key="module.title">
          <div class="quick-module" @click="navigateTo(module.path)">
            <div class="quick-icon" :style="{ backgroundColor: module.color }">
              <el-icon :size="32"><component :is="module.icon" /></el-icon>
            </div>
            <div class="quick-title">{{ module.title }}</div>
            <div class="quick-count">{{ module.count }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近动态 -->
    <el-card shadow="hover" class="activity-card">
      <template #header>
        <div class="card-header">
          <span>最近动态</span>
          <el-link type="primary" :underline="false" @click="navigateTo('/projects')">查看全部</el-link>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="activity in recentActivities"
          :key="activity.id"
          :timestamp="activity.time"
          :color="activity.color"
        >
          <div class="activity-content">
            <el-icon :size="16" :color="activity.color"><component :is="activity.icon" /></el-icon>
            <span class="activity-text">{{ activity.text }}</span>
            <el-tag v-if="activity.tag" size="small" :type="activity.tagType">{{ activity.tag }}</el-tag>
          </div>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import {
  Folder,
  Money,
  DataLine,
  Bell,
  CaretTop,
  CaretBottom,
  Tickets,
  Files,
  Document,
  ChatDotRound,
  CircleCheck,
  Warning,
  Clock,
} from '@element-plus/icons-vue'

use([
  CanvasRenderer,
  LineChart,
  PieChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const router = useRouter()

// ========== 统计数据 ==========
const stats = [
  { title: '项目总数', value: '128', trend: 12.5, color: '#FF6600', icon: markRaw(Folder) },
  { title: '合同总额', value: '¥8,560万', trend: 8.3, color: '#409EFF', icon: markRaw(Money) },
  { title: '本月处理', value: '342', trend: 15.7, color: '#67C23A', icon: markRaw(DataLine) },
  { title: '待办任务', value: '23', trend: -5.2, color: '#E6A23C', icon: markRaw(Bell) },
]

// ========== 业务趋势 ==========
const trendPeriod = ref('week')

const trendChartOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { data: ['项目数', '合同额(万)', '处理量'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    axisLine: { lineStyle: { color: '#ddd' } },
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: '#ddd' } },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  series: [
    {
      name: '项目数', type: 'line', smooth: true,
      data: [12, 18, 15, 22, 28, 20, 25],
      itemStyle: { color: '#FF6600' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(255, 102, 0, 0.3)' },
            { offset: 1, color: 'rgba(255, 102, 0, 0.05)' },
          ],
        },
      },
    },
    {
      name: '合同额(万)', type: 'line', smooth: true,
      data: [320, 450, 380, 520, 680, 550, 620],
      itemStyle: { color: '#409EFF' },
    },
    {
      name: '处理量', type: 'line', smooth: true,
      data: [35, 48, 42, 58, 72, 55, 68],
      itemStyle: { color: '#67C23A' },
    },
  ],
}))

// ========== 项目状态分布 ==========
const projectStatusOption = {
  tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
  series: [
    {
      type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: [
        { value: 42, name: '审批中', itemStyle: { color: '#E6A23C' } },
        { value: 35, name: '执行中', itemStyle: { color: '#409EFF' } },
        { value: 28, name: '已完结', itemStyle: { color: '#67C23A' } },
        { value: 15, name: '待提交', itemStyle: { color: '#909399' } },
        { value: 8, name: '已终止', itemStyle: { color: '#F56C6C' } },
      ],
    },
  ],
}

// ========== 行业分布 ==========
const industryChartOption = {
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '6%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: '#ddd' } },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
  },
  yAxis: {
    type: 'category',
    data: ['医疗健康', '新能源', '交通物流', '电子信息', '智能制造', '基础设施'],
    axisLine: { lineStyle: { color: '#ddd' } },
    axisLabel: { color: '#666' },
  },
  series: [
    {
      type: 'bar', barWidth: 18,
      data: [
        { value: 12, itemStyle: { color: '#67C23A' } },
        { value: 18, itemStyle: { color: '#409EFF' } },
        { value: 22, itemStyle: { color: '#E6A23C' } },
        { value: 25, itemStyle: { color: '#FF6600' } },
        { value: 30, itemStyle: { color: '#F56C6C' } },
        { value: 21, itemStyle: { color: '#909399' } },
      ],
      label: { show: true, position: 'right', formatter: '{c}个', color: '#666', fontSize: 12 },
      itemStyle: {
        borderRadius: [0, 4, 4, 0],
      },
    },
  ],
}

// ========== 风险等级分布 ==========
const riskChartOption = {
  tooltip: { trigger: 'item', formatter: '{b}: {c}个 ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { fontSize: 12 } },
  series: [
    {
      type: 'pie', radius: ['40%', '70%'], center: ['40%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: [
        { value: 68, name: '低风险', itemStyle: { color: '#67C23A' } },
        { value: 38, name: '中风险', itemStyle: { color: '#E6A23C' } },
        { value: 15, name: '高风险', itemStyle: { color: '#F56C6C' } },
        { value: 7, name: '极高风险', itemStyle: { color: '#C0392B' } },
      ],
    },
  ],
}

// ========== 合同金额分布 ==========
const amountChartOption = {
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params: any) => {
      const p = params[0]
      return p.name + '<br/>' + p.seriesName + ': ' + p.value + '个项目'
    },
  },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category',
    data: ['100万以下', '100-500万', '500-1000万', '1000-3000万', '3000-5000万', '5000万-1亿', '1亿以上'],
    axisLine: { lineStyle: { color: '#ddd' } },
    axisLabel: { color: '#666', fontSize: 12 },
  },
  yAxis: {
    type: 'value',
    name: '项目数',
    axisLine: { lineStyle: { color: '#ddd' } },
    splitLine: { lineStyle: { color: '#f0f0f0' } },
    axisLabel: { color: '#999' },
    nameTextStyle: { color: '#999' },
  },
  series: [
    {
      name: '项目数量', type: 'bar', barWidth: 40,
      data: [
        { value: 15, itemStyle: { color: '#67C23A' } },
        { value: 32, itemStyle: { color: '#409EFF' } },
        { value: 28, itemStyle: { color: '#FF6600' } },
        { value: 22, itemStyle: { color: '#E6A23C' } },
        { value: 16, itemStyle: { color: '#F56C6C' } },
        { value: 10, itemStyle: { color: '#C0392B' } },
        { value: 5, itemStyle: { color: '#8E44AD' } },
      ],
      label: { show: true, position: 'top', formatter: '{c}', color: '#666', fontSize: 12 },
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    },
  ],
}

// ========== 快捷入口 ==========
const quickModules = [
  { title: '租赁方案', icon: markRaw(Money), color: '#FF6600', count: '156次', path: '/lease-calculator' },
  { title: '清单识别', icon: markRaw(Tickets), color: '#409EFF', count: '132次', path: '/asset-recognition' },
  { title: '发票查重', icon: markRaw(Files), color: '#67C23A', count: '98次', path: '/invoice-dedup' },
  { title: '合同审核', icon: markRaw(Document), color: '#E6A23C', count: '87次', path: '/contract-review' },
  { title: '尽调报告', icon: markRaw(DataLine), color: '#F56C6C', count: '65次', path: '/due-diligence' },
  { title: '智能问答', icon: markRaw(ChatDotRound), color: '#909399', count: '54次', path: '/ai-assistant' },
]

// ========== 最近动态 ==========
const recentActivities = [
  { id: 1, time: '2024-01-15 14:32', text: '项目「华为设备融资租赁」完成合同审核', icon: markRaw(CircleCheck), color: '#67C23A', tag: '合同审核', tagType: 'success' },
  { id: 2, time: '2024-01-15 13:18', text: '项目「小米供应链融资」生成尽调报告', icon: markRaw(Document), color: '#409EFF', tag: '尽调报告', tagType: 'primary' },
  { id: 3, time: '2024-01-15 11:45', text: '发票查重发现3张重复发票', icon: markRaw(Warning), color: '#E6A23C', tag: '发票查重', tagType: 'warning' },
  { id: 4, time: '2024-01-15 10:22', text: '项目「比亚迪新能源车辆租赁」完成清单识别', icon: markRaw(Tickets), color: '#409EFF', tag: '清单识别', tagType: 'primary' },
  { id: 5, time: '2024-01-15 09:15', text: '新增项目「宁德时代电池设备融资」', icon: markRaw(Folder), color: '#FF6600', tag: '项目管理', tagType: '' },
  { id: 6, time: '2024-01-14 16:50', text: '项目「腾讯云服务器租赁」计算租赁方案', icon: markRaw(Money), color: '#FF6600', tag: '租赁方案', tagType: '' },
  { id: 7, time: '2024-01-14 15:30', text: '用户在智能问答中咨询融资租赁政策', icon: markRaw(ChatDotRound), color: '#909399', tag: '智能问答', tagType: 'info' },
  { id: 8, time: '2024-01-14 14:12', text: '项目「阿里云数据中心设备」待审核', icon: markRaw(Clock), color: '#909399', tag: '待处理', tagType: 'info' },
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-section h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.welcome-section p {
  font-size: 14px;
  color: #999;
  margin: 0;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
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
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

/* 图表区域 */
.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  border-radius: 8px;
}

.chart-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  height: 320px;
  width: 100%;
}

.chart-short {
  height: 260px;
}

/* 快捷入口 */
.quick-access-card {
  border-radius: 8px;
  margin-bottom: 20px;
}

.quick-module {
  text-align: center;
  padding: 20px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-module:hover {
  background-color: #f5f7fa;
  transform: translateY(-4px);
}

.quick-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 12px;
  transition: transform 0.3s;
}

.quick-module:hover .quick-icon {
  transform: scale(1.1);
}

.quick-title {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.quick-count {
  font-size: 12px;
  color: #999;
}

/* 最近动态 */
.activity-card {
  border-radius: 8px;
}

.activity-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-text {
  flex: 1;
  font-size: 14px;
  color: #666;
}

:deep(.el-timeline-item__timestamp) {
  color: #999;
  font-size: 12px;
}
</style>
