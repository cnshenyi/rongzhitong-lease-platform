# 融智通 - API接口设计文档

## 一、总体说明

### 1.1 接口规范
- 协议：HTTPS
- 风格：RESTful
- 数据格式：JSON
- 认证：JWT Bearer Token
- API版本：v1（URL前缀 `/api/v1`）

### 1.2 统一响应格式

```json
// 成功
{
    "code": 200,
    "message": "success",
    "data": { ... }
}

// 分页
{
    "code": 200,
    "message": "success",
    "data": {
        "items": [...],
        "total": 100,
        "page": 1,
        "page_size": 20,
        "total_pages": 5
    }
}

// 错误
{
    "code": 400,
    "message": "参数错误：融资金额不能为空",
    "data": null,
    "errors": [
        {"field": "amount", "message": "不能为空"}
    ]
}
```

### 1.3 错误码定义

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未认证（Token无效/过期） |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（重复） |
| 422 | 业务逻辑错误 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

### 1.4 认证机制

```
登录获取Token:
POST /api/v1/auth/login

请求头携带Token:
Authorization: Bearer <token>

Token有效期: 24小时
刷新Token: POST /api/v1/auth/refresh
```

---

## 二、认证与用户接口

### 2.1 认证接口

```
POST   /api/v1/auth/login          登录
POST   /api/v1/auth/logout         登出
POST   /api/v1/auth/refresh        刷新Token
POST   /api/v1/auth/password       修改密码
```

#### POST /api/v1/auth/login
```
请求：
{
    "username": "admin",
    "password": "123456"
}

响应：
{
    "code": 200,
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIs...",
        "expires_in": 86400,
        "user": {
            "id": "uuid",
            "username": "admin",
            "real_name": "张三",
            "role": "admin",
            "tenant_id": "uuid"
        }
    }
}
```

### 2.2 用户管理接口

```
GET    /api/v1/users               用户列表
POST   /api/v1/users               创建用户
GET    /api/v1/users/:id           用户详情
PUT    /api/v1/users/:id           更新用户
DELETE /api/v1/users/:id           删除用户
GET    /api/v1/users/me            当前用户信息
PUT    /api/v1/users/me            更新个人信息
```

#### GET /api/v1/users
```
查询参数：
  page       - 页码（默认1）
  page_size  - 每页数量（默认20，最大100）
  role       - 角色筛选
  status     - 状态筛选
  keyword    - 搜索关键词（用户名/姓名/手机号）

响应：
{
    "code": 200,
    "data": {
        "items": [
            {
                "id": "uuid",
                "username": "zhangsan",
                "real_name": "张三",
                "phone": "13800138000",
                "email": "zhangsan@example.com",
                "role": "user",
                "department": "业务部",
                "status": "active",
                "last_login_at": "2026-04-14T15:30:00Z",
                "created_at": "2026-01-01T00:00:00Z"
            }
        ],
        "total": 50,
        "page": 1,
        "page_size": 20
    }
}
```

---

## 三、项目管理接口

```
GET    /api/v1/projects             项目列表
POST   /api/v1/projects             创建项目
GET    /api/v1/projects/:id         项目详情
PUT    /api/v1/projects/:id         更新项目
DELETE /api/v1/projects/:id         删除项目
PUT    /api/v1/projects/:id/status  更新项目状态
GET    /api/v1/projects/:id/stats   项目统计数据
```

#### POST /api/v1/projects
```
请求：
{
    "project_name": "XX医院设备融资租赁项目",
    "customer_name": "XX医院",
    "customer_credit_code": "91310000XXXXXXXXXX",
    "customer_contact": "李院长",
    "customer_phone": "13800138000",
    "project_type": "direct_lease",
    "amount": 5000000,
    "term_months": 36,
    "annual_rate": 8.0
}

响应：
{
    "code": 200,
    "data": {
        "id": "uuid",
        "project_no": "PRJ-2026-0001",
        "project_name": "XX医院设备融资租赁项目",
        "status": "draft",
        "stage": "application",
        "created_at": "2026-04-14T16:00:00Z"
    }
}
```

---

## 四、清单识别接口

```
POST   /api/v1/asset-lists                    创建清单（上传文件）
GET    /api/v1/asset-lists                    清单列表
GET    /api/v1/asset-lists/:id                清单详情
DELETE /api/v1/asset-lists/:id                删除清单
POST   /api/v1/asset-lists/:id/recognize      开始OCR识别
GET    /api/v1/asset-lists/:id/status          识别状态
GET    /api/v1/asset-lists/:id/items           清单明细列表
PUT    /api/v1/asset-lists/:id/items/:itemId   修改清单明细
POST   /api/v1/asset-lists/:id/confirm         确认清单
POST   /api/v1/asset-lists/:id/export          导出清单
```

#### POST /api/v1/asset-lists
```
请求（multipart/form-data）：
  project_id: "uuid"
  list_name: "XX医院设备清单"
  files: [file1.pdf, file2.jpg, ...]

响应：
{
    "code": 200,
    "data": {
        "id": "uuid",
        "list_name": "XX医院设备清单",
        "file_count": 3,
        "status": "uploaded",
        "created_at": "2026-04-14T16:00:00Z"
    }
}
```

#### POST /api/v1/asset-lists/:id/recognize
```
请求：（无需body）

响应：
{
    "code": 200,
    "data": {
        "id": "uuid",
        "status": "recognizing",
        "estimated_time_seconds": 30,
        "message": "OCR识别已开始，预计30秒完成"
    }
}
```

#### GET /api/v1/asset-lists/:id/status
```
响应：
{
    "code": 200,
    "data": {
        "id": "uuid",
        "status": "pending_review",
        "progress": 100,
        "total_items": 45,
        "total_quantity": 120,
        "total_amount": 5000000.00,
        "recognize_duration_ms": 12500,
        "items_preview": [
            {
                "name": "迈瑞DC-70彩超",
                "quantity": 2,
                "unit_price": 350000,
                "total_price": 700000,
                "confidence": 98.5
            }
        ]
    }
}
```

---

## 五、发票查重验真接口

```
POST   /api/v1/invoices                       上传发票（批量）
GET    /api/v1/invoices                       发票列表
GET    /api/v1/invoices/:id                   发票详情
DELETE /api/v1/invoices/:id                   删除发票
POST   /api/v1/invoices/verify                批量验真
GET    /api/v1/invoices/:id/verify-result     单张验真结果
POST   /api/v1/invoices/dedup                 批量查重
GET    /api/v1/invoices/:id/dedup-result      单张查重结果
POST   /api/v1/invoices/compare               发票与清单比对
POST   /api/v1/invoices/export-report         导出查重验真报告
```

#### POST /api/v1/invoices
```
请求（multipart/form-data）：
  project_id: "uuid"
  files: [invoice1.jpg, invoice2.pdf, ...]

响应：
{
    "code": 200,
    "data": {
        "uploaded_count": 10,
        "invoices": [
            {
                "id": "uuid",
                "file_name": "invoice1.jpg",
                "ocr_status": "pending"
            }
        ],
        "message": "10张发票上传成功，开始OCR识别"
    }
}
```

#### POST /api/v1/invoices/verify
```
请求：
{
    "invoice_ids": ["uuid1", "uuid2", "uuid3"]
}

响应：
{
    "code": 200,
    "data": {
        "task_id": "uuid",
        "total": 3,
        "estimated_time_seconds": 15,
        "message": "验真任务已提交"
    }
}
```

#### GET /api/v1/invoices/:id/dedup-result
```
响应：
{
    "code": 200,
    "data": {
        "invoice_id": "uuid",
        "dedup_status": "risk_high",
        "matches": [
            {
                "matched_invoice_id": "uuid",
                "project_name": "YY诊所融资项目",
                "match_type": "exact",
                "risk_level": "high",
                "invoice_code": "3100221130",
                "invoice_no": "04153288",
                "total_amount": 48290.59,
                "uploaded_at": "2026-02-20T10:00:00Z"
            }
        ]
    }
}
```

---

## 六、尽调报告接口

```
POST   /api/v1/dd-reports                     创建尽调报告
GET    /api/v1/dd-reports                     报告列表
GET    /api/v1/dd-reports/:id                 报告详情
PUT    /api/v1/dd-reports/:id                 更新报告
DELETE /api/v1/dd-reports/:id                 删除报告
POST   /api/v1/dd-reports/:id/collect         启动信息采集
GET    /api/v1/dd-reports/:id/collect-status   采集状态
POST   /api/v1/dd-reports/:id/attachments     上传附件
POST   /api/v1/dd-reports/:id/analyze          财务分析
POST   /api/v1/dd-reports/:id/generate         AI生成报告
GET    /api/v1/dd-reports/:id/content          获取报告内容
PUT    /api/v1/dd-reports/:id/content          编辑报告内容
POST   /api/v1/dd-reports/:id/export           导出报告
PUT    /api/v1/dd-reports/:id/review           审核报告
```

#### POST /api/v1/dd-reports/:id/generate
```
请求：
{
    "template": "standard",
    "sections": ["all"]
}

响应：
{
    "code": 200,
    "data": {
        "task_id": "uuid",
        "status": "generating",
        "estimated_time_seconds": 120,
        "message": "AI正在生成尽调报告，预计2分钟"
    }
}
```

#### GET /api/v1/dd-reports/:id/content
```
响应：
{
    "code": 200,
    "data": {
        "id": "uuid",
        "status": "reviewing",
        "risk_score": 72.5,
        "risk_level": "medium",
        "sections": [
            {
                "title": "一、项目基本信息",
                "subsections": [
                    {
                        "title": "1.1 项目概况",
                        "content": "本项目为XX医院申请的医疗设备融资租赁项目...",
                        "editable": true
                    }
                ]
            }
        ],
        "financial_indicators": {
            "asset_liability_ratio": 45.2,
            "current_ratio": 2.1,
            "net_profit_margin": 8.5,
            "roe": 12.3
        }
    }
}
```

---

## 七、合同审核接口

```
POST   /api/v1/contracts                      上传合同
GET    /api/v1/contracts                      合同列表
GET    /api/v1/contracts/:id                  合同详情
DELETE /api/v1/contracts/:id                  删除合同
POST   /api/v1/contracts/:id/review            开始审核
GET    /api/v1/contracts/:id/review-result     审核结果
GET    /api/v1/contracts/:id/review-items      审核明细
POST   /api/v1/contracts/:id/annotate          添加批注
POST   /api/v1/contracts/compare               版本对比
POST   /api/v1/contracts/:id/export-report     导出审核报告

GET    /api/v1/contract-templates              模板列表
POST   /api/v1/contract-templates              创建模板
PUT    /api/v1/contract-templates/:id          更新模板
DELETE /api/v1/contract-templates/:id          删除模板
```

#### POST /api/v1/contracts/:id/review
```
请求：
{
    "template_id": "uuid"
}

响应：
{
    "code": 200,
    "data": {
        "task_id": "uuid",
        "status": "reviewing",
        "estimated_time_seconds": 60,
        "message": "AI正在审核合同，预计1分钟"
    }
}
```

#### GET /api/v1/contracts/:id/review-result
```
响应：
{
    "code": 200,
    "data": {
        "contract_id": "uuid",
        "review_score": 75,
        "risk_level": "medium",
        "summary": {
            "total_clauses": 20,
            "passed": 15,
            "risk": 3,
            "missing": 2
        },
        "high_risk_items": [
            {
                "clause_name": "违约责任",
                "risk_level": "high",
                "description": "违约金仅3%，过低",
                "suggestion": "建议提高至10-20%",
                "original_text": "乙方逾期支付租金的，应按逾期金额的3%..."
            }
        ],
        "missing_clauses": [
            "保险条款",
            "提前终止条款"
        ]
    }
}
```

---

## 八、租赁方案计算接口

```
POST   /api/v1/lease-plans                    创建/计算方案
GET    /api/v1/lease-plans                    方案列表
GET    /api/v1/lease-plans/:id                方案详情
PUT    /api/v1/lease-plans/:id                更新方案
DELETE /api/v1/lease-plans/:id                删除方案
POST   /api/v1/lease-plans/calculate           试算（不保存）
POST   /api/v1/lease-plans/compare             方案对比
POST   /api/v1/lease-plans/:id/export-excel    导出Excel
POST   /api/v1/lease-plans/:id/export-pdf      导出报价单PDF
POST   /api/v1/lease-plans/:id/prepayment      提前还款测算
```

#### POST /api/v1/lease-plans/calculate
```
请求：
{
    "principal": 5000000,
    "annual_rate": 8.0,
    "term_months": 36,
    "payment_type": "equal_payment",
    "payment_freq": "monthly",
    "start_date": "2026-05-01",
    "deposit_rate": 10,
    "advisory_fee_rate": 1,
    "residual_value": 1,
    "grace_period": 0
}

响应：
{
    "code": 200,
    "data": {
        "period_payment": 156688.58,
        "total_payment": 5640788.88,
        "total_interest": 640788.88,
        "nominal_irr": 8.0,
        "effective_irr": 9.52,
        "deposit_amount": 500000,
        "advisory_fee": 50000,
        "schedule": [
            {
                "period": 1,
                "due_date": "2026-05-01",
                "payment": 156688.58,
                "principal": 123355.25,
                "interest": 33333.33,
                "remaining": 4876644.75
            },
            {
                "period": 2,
                "due_date": "2026-06-01",
                "payment": 156688.58,
                "principal": 124177.62,
                "interest": 32510.96,
                "remaining": 4752467.13
            }
        ]
    }
}
```

#### POST /api/v1/lease-plans/compare
```
请求：
{
    "plans": [
        {
            "name": "方案A",
            "principal": 5000000,
            "annual_rate": 8.0,
            "term_months": 36,
            "payment_type": "equal_payment"
        },
        {
            "name": "方案B",
            "principal": 5000000,
            "annual_rate": 7.0,
            "term_months": 24,
            "payment_type": "equal_principal"
        }
    ]
}

响应：
{
    "code": 200,
    "data": {
        "comparison": [
            {
                "name": "方案A",
                "period_payment": 156688.58,
                "total_interest": 640788.88,
                "effective_irr": 9.52
            },
            {
                "name": "方案B",
                "first_period_payment": 237847.22,
                "total_interest": 437500.00,
                "effective_irr": 8.75
            }
        ],
        "ai_analysis": "方案B总利息更低，但月供压力更大..."
    }
}
```

---

## 九、智能问答接口

```
POST   /api/v1/chat/conversations              创建对话
GET    /api/v1/chat/conversations              对话列表
DELETE /api/v1/chat/conversations/:id          删除对话
POST   /api/v1/chat/conversations/:id/messages 发送消息
GET    /api/v1/chat/conversations/:id/messages 对话历史
POST   /api/v1/chat/messages/:id/feedback      消息反馈

GET    /api/v1/knowledge/documents             知识文档列表
POST   /api/v1/knowledge/documents             上传知识文档
DELETE /api/v1/knowledge/documents/:id         删除文档
GET    /api/v1/knowledge/documents/:id/chunks  文档分段列表
GET    /api/v1/knowledge/stats                 知识库统计
```

#### POST /api/v1/chat/conversations/:id/messages
```
请求：
{
    "content": "融资租赁和经营租赁有什么区别？"
}

响应（流式SSE）：
event: message_start
data: {"message_id": "uuid"}

event: content_delta
data: {"text": "融资租赁和经营租赁的主要区别如下："}

event: content_delta
data: {"text": "\n\n1. **风险与报酬转移**..."}

event: references
data: {"refs": [{"doc_name": "企业会计准则第21号", "page": 5}]}

event: message_end
data: {"tokens_used": 856, "response_time_ms": 2340}
```

---

## 十、文件上传通用接口

```
POST   /api/v1/files/upload        通用文件上传
GET    /api/v1/files/:id           获取文件信息
GET    /api/v1/files/:id/download  下载文件
DELETE /api/v1/files/:id           删除文件
```

#### POST /api/v1/files/upload
```
请求（multipart/form-data）：
  file: <binary>
  category: "invoice" / "contract" / "attachment" / "other"

响应：
{
    "code": 200,
    "data": {
        "id": "uuid",
        "file_name": "发票001.jpg",
        "file_type": "image/jpeg",
        "file_size": 1024000,
        "file_url": "/files/uuid/发票001.jpg",
        "file_hash": "sha256:abc123..."
    }
}
```

---

## 十一、系统管理接口

```
GET    /api/v1/system/stats            系统统计概览
GET    /api/v1/system/logs             操作日志
GET    /api/v1/system/health           健康检查
GET    /api/v1/tenant/info             租户信息
PUT    /api/v1/tenant/settings         租户设置

GET    /api/v1/dashboard               仪表盘数据
```

#### GET /api/v1/dashboard
```
响应：
{
    "code": 200,
    "data": {
        "projects": {
            "total": 120,
            "active": 35,
            "this_month": 8
        },
        "invoices": {
            "total_verified": 3500,
            "risk_found": 23,
            "this_month": 420
        },
        "reports": {
            "total_generated": 85,
            "this_month": 12
        },
        "contracts": {
            "total_reviewed": 92,
            "avg_score": 78.5,
            "this_month": 10
        },
        "recent_activities": [
            {
                "type": "invoice_risk",
                "message": "发现1张高风险发票",
                "time": "2026-04-14T16:30:00Z"
            }
        ]
    }
}
```

---

## 十二、WebSocket接口

```
用于实时推送任务进度

连接：ws://host/ws?token=<jwt_token>

消息格式：
{
    "type": "task_progress",
    "task_id": "uuid",
    "module": "ocr_recognition",
    "progress": 65,
    "message": "正在识别第13/20页..."
}

{
    "type": "task_complete",
    "task_id": "uuid",
    "module": "invoice_verify",
    "result": { ... }
}

{
    "type": "alert",
    "level": "warning",
    "message": "发现高风险发票！",
    "target_url": "/invoices/uuid"
}
```

---

**文档版本**：v1.0
**创建日期**：2026-04-14
