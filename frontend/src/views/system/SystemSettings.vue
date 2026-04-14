<template>
  <div class="system-settings">
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <el-tabs v-model="activeTab" type="border-card" class="settings-tabs">
      <!-- 基本设置 -->
      <el-tab-pane label="基本设置" name="basic">
        <el-form :model="basicForm" label-width="120px" class="settings-form">
          <h3 class="section-title">平台信息</h3>
          <el-form-item label="平台名称">
            <el-input v-model="basicForm.platformName" style="width: 400px" />
          </el-form-item>
          <el-form-item label="平台Logo">
            <div class="logo-upload">
              <el-avatar :size="64" src="/assets/logo.jpg" shape="square" />
              <el-button size="small" style="margin-left: 16px">更换Logo</el-button>
            </div>
          </el-form-item>
          <el-form-item label="公司名称">
            <el-input v-model="basicForm.companyName" style="width: 400px" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="basicForm.contactPhone" style="width: 400px" />
          </el-form-item>
          <el-form-item label="联系邮箱">
            <el-input v-model="basicForm.contactEmail" style="width: 400px" />
          </el-form-item>

          <h3 class="section-title">业务参数</h3>
          <el-form-item label="默认利率(%)">
            <el-input-number v-model="basicForm.defaultRate" :min="0" :max="100" :precision="2" :step="0.1" />
          </el-form-item>
          <el-form-item label="最大租赁期限">
            <el-input-number v-model="basicForm.maxLeaseTerm" :min="1" :max="120" />
            <span class="form-tip">个月</span>
          </el-form-item>
          <el-form-item label="逾期预警天数">
            <el-input-number v-model="basicForm.overdueWarningDays" :min="1" :max="90" />
            <span class="form-tip">天</span>
          </el-form-item>
          <el-form-item label="合同编号前缀">
            <el-input v-model="basicForm.contractPrefix" style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveBasic">保存设置</el-button>
            <el-button @click="handleResetBasic">恢复默认</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 安全设置 -->
      <el-tab-pane label="安全设置" name="security">
        <el-form :model="securityForm" label-width="140px" class="settings-form">
          <h3 class="section-title">密码策略</h3>
          <el-form-item label="最小密码长度">
            <el-input-number v-model="securityForm.minPasswordLength" :min="6" :max="32" />
            <span class="form-tip">位</span>
          </el-form-item>
          <el-form-item label="密码复杂度">
            <el-checkbox-group v-model="securityForm.passwordComplexity">
              <el-checkbox label="uppercase">大写字母</el-checkbox>
              <el-checkbox label="lowercase">小写字母</el-checkbox>
              <el-checkbox label="number">数字</el-checkbox>
              <el-checkbox label="special">特殊字符</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="密码有效期">
            <el-input-number v-model="securityForm.passwordExpireDays" :min="0" :max="365" />
            <span class="form-tip">天（0表示永不过期）</span>
          </el-form-item>

          <h3 class="section-title">登录安全</h3>
          <el-form-item label="登录失败锁定">
            <el-switch v-model="securityForm.loginLockEnabled" />
          </el-form-item>
          <el-form-item label="最大失败次数" v-if="securityForm.loginLockEnabled">
            <el-input-number v-model="securityForm.maxLoginAttempts" :min="3" :max="10" />
            <span class="form-tip">次</span>
          </el-form-item>
          <el-form-item label="锁定时长" v-if="securityForm.loginLockEnabled">
            <el-input-number v-model="securityForm.lockDuration" :min="5" :max="1440" />
            <span class="form-tip">分钟</span>
          </el-form-item>
          <el-form-item label="会话超时">
            <el-input-number v-model="securityForm.sessionTimeout" :min="5" :max="480" />
            <span class="form-tip">分钟</span>
          </el-form-item>
          <el-form-item label="双因素认证">
            <el-switch v-model="securityForm.twoFactorEnabled" />
            <span class="form-tip" v-if="securityForm.twoFactorEnabled">已启用，登录时需验证手机验证码</span>
          </el-form-item>
          <el-form-item label="IP白名单">
            <el-switch v-model="securityForm.ipWhitelistEnabled" />
          </el-form-item>
          <el-form-item v-if="securityForm.ipWhitelistEnabled" label="允许的IP">
            <el-input v-model="securityForm.ipWhitelist" type="textarea" :rows="3" style="width: 400px" placeholder="每行一个IP地址或CIDR" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveSecurity">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 通知设置 -->
      <el-tab-pane label="通知设置" name="notification">
        <el-form :model="notifyForm" label-width="140px" class="settings-form">
          <h3 class="section-title">通知渠道</h3>
          <el-form-item label="站内通知">
            <el-switch v-model="notifyForm.inAppEnabled" />
          </el-form-item>
          <el-form-item label="邮件通知">
            <el-switch v-model="notifyForm.emailEnabled" />
          </el-form-item>
          <el-form-item v-if="notifyForm.emailEnabled" label="SMTP服务器">
            <el-input v-model="notifyForm.smtpHost" style="width: 300px" placeholder="smtp.example.com" />
          </el-form-item>
          <el-form-item v-if="notifyForm.emailEnabled" label="SMTP端口">
            <el-input-number v-model="notifyForm.smtpPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item v-if="notifyForm.emailEnabled" label="发件人邮箱">
            <el-input v-model="notifyForm.senderEmail" style="width: 300px" placeholder="noreply@rongzhitong.com" />
          </el-form-item>
          <el-form-item label="短信通知">
            <el-switch v-model="notifyForm.smsEnabled" />
          </el-form-item>

          <h3 class="section-title">通知事件</h3>
          <el-table :data="notifyEvents" stripe border style="width: 700px">
            <el-table-column prop="event" label="事件" width="200" />
            <el-table-column label="站内" width="80" align="center">
              <template #default="{ row }">
                <el-checkbox v-model="row.inApp" />
              </template>
            </el-table-column>
            <el-table-column label="邮件" width="80" align="center">
              <template #default="{ row }">
                <el-checkbox v-model="row.email" :disabled="!notifyForm.emailEnabled" />
              </template>
            </el-table-column>
            <el-table-column label="短信" width="80" align="center">
              <template #default="{ row }">
                <el-checkbox v-model="row.sms" :disabled="!notifyForm.smsEnabled" />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
          <el-form-item style="margin-top: 20px">
            <el-button type="primary" @click="handleSaveNotify">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- AI模型配置 -->
      <el-tab-pane label="AI模型配置" name="ai">
        <el-form :model="aiForm" label-width="140px" class="settings-form">
          <h3 class="section-title">模型服务</h3>
          <el-form-item label="AI服务提供商">
            <el-select v-model="aiForm.provider" style="width: 300px">
              <el-option label="OpenAI (GPT-4)" value="openai" />
              <el-option label="百度文心一言" value="baidu" />
              <el-option label="阿里通义千问" value="alibaba" />
              <el-option label="本地部署模型" value="local" />
            </el-select>
          </el-form-item>
          <el-form-item label="API地址">
            <el-input v-model="aiForm.apiUrl" style="width: 400px" placeholder="https://api.openai.com/v1" />
          </el-form-item>
          <el-form-item label="API密钥">
            <el-input v-model="aiForm.apiKey" type="password" show-password style="width: 400px" placeholder="sk-..." />
          </el-form-item>
          <el-form-item label="连接测试">
            <el-button :type="aiTestStatus === 'success' ? 'success' : 'primary'" :loading="aiTestLoading" @click="handleTestAI">
              {{ aiTestLoading ? '测试中...' : aiTestStatus === 'success' ? '连接正常' : '测试连接' }}
            </el-button>
          </el-form-item>

          <h3 class="section-title">模块配置</h3>
          <el-table :data="aiModules" stripe border style="width: 700px">
            <el-table-column prop="module" label="AI模块" width="140" />
            <el-table-column prop="model" label="使用模型" width="160">
              <template #default="{ row }">
                <el-select v-model="row.model" size="small">
                  <el-option label="GPT-4" value="gpt-4" />
                  <el-option label="GPT-3.5" value="gpt-3.5" />
                  <el-option label="文心4.0" value="ernie-4" />
                  <el-option label="通义千问" value="qwen" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="启用" width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>

          <el-form-item style="margin-top: 20px">
            <el-button type="primary" @click="handleSaveAI">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <div class="log-filter">
          <el-date-picker v-model="logDateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 300px" />
          <el-select v-model="logType" placeholder="操作类型" style="width: 140px; margin-left: 12px" clearable>
            <el-option label="全部" value="" />
            <el-option label="登录" value="login" />
            <el-option label="数据操作" value="data" />
            <el-option label="系统配置" value="config" />
            <el-option label="权限变更" value="permission" />
          </el-select>
          <el-button type="primary" style="margin-left: 12px" @click="handleSearchLog">查询</el-button>
        </div>

        <el-table :data="logList" stripe border style="width: 100%; margin-top: 16px">
          <el-table-column prop="time" label="时间" width="170" />
          <el-table-column prop="user" label="操作人" width="110" />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getLogTagType(row.type)" size="small">{{ row.typeLabel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="ip" label="IP地址" width="140" />
          <el-table-column prop="action" label="操作内容" min-width="250" show-overflow-tooltip />
          <el-table-column prop="result" label="结果" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.success ? 'success' : 'danger'" size="small">{{ row.success ? '成功' : '失败' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('basic')

// ========== 基本设置 ==========
const basicForm = ref({
  platformName: '融智通智能租赁管理平台',
  companyName: '融智通科技有限公司',
  contactPhone: '400-888-9999',
  contactEmail: 'support@rongzhitong.com',
  defaultRate: 6.5,
  maxLeaseTerm: 60,
  overdueWarningDays: 7,
  contractPrefix: 'RZT',
})

const handleSaveBasic = () => ElMessage.success('基本设置已保存')
const handleResetBasic = () => {
  basicForm.value = { platformName: '融智通智能租赁管理平台', companyName: '融智通科技有限公司', contactPhone: '400-888-9999', contactEmail: 'support@rongzhitong.com', defaultRate: 6.5, maxLeaseTerm: 60, overdueWarningDays: 7, contractPrefix: 'RZT' }
  ElMessage.success('已恢复默认设置')
}

// ========== 安全设置 ==========
const securityForm = ref({
  minPasswordLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'number'],
  passwordExpireDays: 90,
  loginLockEnabled: true,
  maxLoginAttempts: 5,
  lockDuration: 30,
  sessionTimeout: 120,
  twoFactorEnabled: false,
  ipWhitelistEnabled: false,
  ipWhitelist: '',
})

const handleSaveSecurity = () => ElMessage.success('安全设置已保存')

// ========== 通知设置 ==========
const notifyForm = ref({
  inAppEnabled: true,
  emailEnabled: true,
  smtpHost: 'smtp.rongzhitong.com',
  smtpPort: 465,
  senderEmail: 'noreply@rongzhitong.com',
  smsEnabled: false,
})

const notifyEvents = ref([
  { event: '项目状态变更', inApp: true, email: true, sms: false, description: '项目审批通过、驳回等状态变化时通知' },
  { event: '合同到期提醒', inApp: true, email: true, sms: true, description: '合同到期前30/15/7天提醒' },
  { event: '逾期预警', inApp: true, email: true, sms: true, description: '客户逾期还款时通知催收人员' },
  { event: '审批待办', inApp: true, email: true, sms: false, description: '有新的审批任务需要处理' },
  { event: '系统异常', inApp: true, email: true, sms: false, description: 'AI服务异常、系统错误等' },
  { event: '用户登录异常', inApp: true, email: false, sms: false, description: '异地登录、频繁失败等异常行为' },
])

const handleSaveNotify = () => ElMessage.success('通知设置已保存')

// ========== AI模型配置 ==========
const aiForm = ref({
  provider: 'openai',
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
})

const aiTestLoading = ref(false)
const aiTestStatus = ref('')

const handleTestAI = () => {
  aiTestLoading.value = true
  aiTestStatus.value = ''
  setTimeout(() => {
    aiTestLoading.value = false
    aiTestStatus.value = 'success'
    ElMessage.success('AI服务连接正常')
  }, 2000)
}

const aiModules = ref([
  { module: '清单识别', model: 'gpt-4', enabled: true, description: '识别资产清单中的设备信息' },
  { module: '发票查重', model: 'gpt-3.5', enabled: true, description: '检测重复发票和异常数据' },
  { module: '合同审核', model: 'gpt-4', enabled: true, description: '审核合同条款，识别风险点' },
  { module: '尽调报告', model: 'gpt-4', enabled: true, description: '生成企业尽职调查报告' },
  { module: '智能问答', model: 'gpt-4', enabled: true, description: '基于知识库的智能问答服务' },
  { module: '智能催收', model: 'gpt-3.5', enabled: true, description: '生成催收策略和话术建议' },
])

const handleSaveAI = () => ElMessage.success('AI模型配置已保存')

// ========== 操作日志 ==========
const logDateRange = ref(null)
const logType = ref('')
const handleSearchLog = () => ElMessage.info('查询日志...')

const getLogTagType = (type: string) => ({ login: 'primary', data: 'success', config: 'warning', permission: 'danger' }[type] || 'info')

const logList = ref([
  { time: '2024-01-15 11:30:22', user: '系统管理员', type: 'config', typeLabel: '系统配置', ip: '192.168.1.100', action: '修改AI模型配置：切换清单识别模型为GPT-4', success: true },
  { time: '2024-01-15 10:15:08', user: '张三', type: 'data', typeLabel: '数据操作', ip: '192.168.1.101', action: '创建新项目：华为设备融资租赁项目', success: true },
  { time: '2024-01-15 09:30:45', user: '系统管理员', type: 'login', typeLabel: '登录', ip: '192.168.1.100', action: '用户登录系统', success: true },
  { time: '2024-01-15 09:28:12', user: 'unknown', type: 'login', typeLabel: '登录', ip: '10.0.0.55', action: '尝试登录（用户名：test）', success: false },
  { time: '2024-01-14 17:20:33', user: '李四', type: 'data', typeLabel: '数据操作', ip: '192.168.1.102', action: '上传合同文件：小米供应链融资合同.pdf', success: true },
  { time: '2024-01-14 16:45:10', user: '系统管理员', type: 'permission', typeLabel: '权限变更', ip: '192.168.1.100', action: '修改角色权限：业务经理 - 新增合同审核权限', success: true },
  { time: '2024-01-14 15:00:28', user: '王五', type: 'data', typeLabel: '数据操作', ip: '192.168.1.103', action: '发起尽调报告：比亚迪新能源车辆租赁项目', success: true },
  { time: '2024-01-14 14:30:55', user: '赵六', type: 'data', typeLabel: '数据操作', ip: '192.168.1.104', action: '批量导入发票数据（共128条）', success: true },
  { time: '2024-01-14 11:20:18', user: '系统管理员', type: 'config', typeLabel: '系统配置', ip: '192.168.1.100', action: '修改安全策略：启用登录失败锁定（5次/30分钟）', success: true },
  { time: '2024-01-14 09:05:42', user: '孙七', type: 'login', typeLabel: '登录', ip: '192.168.1.105', action: '用户登录系统', success: true },
])
</script>

<style scoped>
.system-settings { padding: 20px; }
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

.settings-tabs { border-radius: 8px; }
.settings-form { max-width: 800px; padding: 10px 0; }

.section-title { font-size: 16px; color: #333; font-weight: 600; margin: 24px 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #f0f0f0; }
.section-title:first-child { margin-top: 8px; }

.form-tip { margin-left: 8px; font-size: 13px; color: #999; }

.logo-upload { display: flex; align-items: center; }

.log-filter { display: flex; align-items: center; flex-wrap: wrap; }
</style>
