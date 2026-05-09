# 智慧图书馆个性化学习推荐系统 — AgentTeam协作设计

---

## 1. 技术栈决策

| 层 | 技术选型 | 理由 |
|----|----------|------|
| 后端框架 | FastAPI | 异步原生支持、自动OpenAPI文档、流式输出 |
| 数据库 | SQLite → PostgreSQL | 开发期零配置，生产平滑迁移 |
| 推荐引擎 | scikit-learn + numpy + jieba | TF-IDF/余弦相似度/协同过滤成熟方案 |
| 前端 | React 18 + TypeScript + TailwindCSS | 复杂交互、类型安全、样式高效 |
| 图表库 | ECharts 5 | 雷达图/热力图/词云/散点图/折线图一站式 |
| LLM SDK | Anthropic SDK（OpenAI兼容也行） | 流式对话、推荐解释、语义检索 |
| 契约规范 | OpenAPI 3.0 | 前后端并行开发的协调基础 |

---

## 2. AgentTeam 角色

```
                   ┌──────────────────────┐
                   │   项目负责人 (PM)      │
                   │   决策 + 质量把关      │
                   └──────────┬───────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
  ┌────▼─────┐  ┌────────▼────────┐  ┌───────▼──────┐
  │ Data     │  │ Backend         │  │ Frontend     │
  │ Agent    │  │ Agent           │  │ Agent        │
  │          │  │                 │  │              │
  │ 数据清洗  │  │ FastAPI脚手架    │  │ React脚手架   │
  │ 特征工程  │  │ 数据库Schema     │  │ 学生端9页面   │
  │ 领域映射  │  │ 推荐引擎(CF+TF)  │  │ 教师端3页面   │
  │ 样本数据  │  │ LLM集成         │  │ ECharts图表   │
  │ 模型评估  │  │ 行为日志API      │  │ 流式对话组件  │
  └────┬─────┘  └────────┬────────┘  │ 行为追踪      │
       │                 │           └───────┬──────┘
       │                 │                   │
       │          ┌──────▼──────┐    ┌───────▼──────────┐
       │          │ QA Agent    │    │ Frontend Test    │
       │          │             │    │ Agent            │
       │          │ API集成测试  │    │                  │
       └──────────▶ 准确率验证   │    │ 前端功能验证      │
                  │ 性能测试    │    │ UI美观度审查      │
                  └─────────────┘    │ 页面合理性检查    │
                                     │ 跨浏览器兼容      │
                                     └──────────────────┘
```

| 角色 | 职责 | 产出物 |
|------|------|--------|
| **Data Agent** | 数据导入/清洗流程、特征工程（关键词/领域/时段/深度）、中图分类法→知识领域映射表、样本数据生成、模型训练与评估 | `data/` 模块、特征宽表、领域映射JSON、评估报告 |
| **Backend Agent** | 数据库Schema、FastAPI应用、推荐引擎（CF+TF-IDF+混合排序+行为调权）、LLM集成（推荐解释/路径规划/对话助手/语义检索/教师洞察）、行为日志采集API、OpenAPI契约 | `src/backend/`、`src/recommender/`、`src/llm/`、`openapi.yaml` |
| **Frontend Agent** | React应用脚手架、学生端所有页面（推荐/画像/历史/路径规划/对话/搜索/详情/收藏）、教师端所有页面（兴趣总览/分群视图/洞察报告）、ECharts图表、流式对话组件、行为追踪（停留/滚动/点击）、收藏/有用/跳过交互 | `src/frontend/` |
| **Frontend Test Agent** | 每个前端页面完成后的功能验证（交互流程/API对接/状态管理）、UI美观度审查（布局合理性/颜色一致性/响应式/可访问性）、跨浏览器兼容验证、用户体验报告 | 前端质量报告、Bug清单 |
| **QA Agent** | API接口正确性测试、推荐准确率验证（≥75%）、前后端联调测试、行为反馈闭环验证、性能测试（响应时间<3秒，并发100用户） | 测试报告、准确率报告、性能报告 |

---

## 3. 阶段与并行策略

```
阶段1：基础设施 (Data + Backend 串行，产出 API契约)
  ├─ Data Agent:    数据模型 → 领域映射表 → 特征工程脚本 → 样本数据(200人+2000条借阅)
  └─ Backend Agent: FastAPI脚手架 → DB Schema → OpenAPI 3.0 契约
        │
        │  OpenAPI 契约 → Frontend Agent 开始
        ▼
阶段2：核心功能 (Backend + Frontend + Frontend Test 三方并行)
  ├─ Backend Agent:      推荐引擎 → 学生端API → 行为日志API
  ├─ Frontend Agent:     学生端9页面 → ECharts图表 → 行为追踪
  └─ Frontend Test Agent: 每页面完成后即时审查
        │
        ▼
阶段3：智能增强 (Backend + Frontend 并行)
  ├─ Backend Agent:      LLM推荐解释 → 路径规划 → 对话助手 → 语义检索 → 教师洞察API
  ├─ Frontend Agent:     流式对话组件 → 教师端3页面 → 收藏/反馈交互
  └─ Frontend Test Agent: 持续审查
        │
        ▼
阶段4：验收交付 (QA Agent 主导)
  ├─ QA Agent:           集成测试 → 准确率验证(≥75%) → 性能测试 → 行为闭环验证
  └─ Frontend Test Agent: 最终UI走查 → 跨浏览器验证
```

---

## 4. 协作规则

1. **API契约先行**：阶段1结尾Backend Agent产出OpenAPI 3.0规范，Frontend Agent基于Mock Server并行开发，不相互阻塞
2. **页面即审查**：Frontend Agent每完成一个页面，Frontend Test Agent立即审查功能+美观度，问题当场修复
3. **每日集成**：每天合并一次代码，QA Agent自动跑集成测试套件
4. **决策自主**：技术细节由各Agent自行决定，PM只在跨Agent冲突和需求歧义时介入
5. **质量门槛**：提交前必须通过 `verification-before-completion` 检查，前端必须通过Frontend Test Agent审查

---

## 5. 前后端API契约（核心端点）

| 端点 | 方法 | 用途 | 负责Agent |
|------|------|------|-----------|
| `/api/student/{id}/profile` | GET | 学生画像数据 | Backend |
| `/api/student/{id}/recommendations` | GET | 个性化推荐列表 | Backend |
| `/api/student/{id}/recommendation/{rec_id}/feedback` | POST | 显性反馈（有用/跳过） | Backend |
| `/api/student/{id}/behavior` | POST | 隐性行为上报（停留/滚动/点击） | Backend |
| `/api/student/{id}/path` | POST | 学习路径规划 | Backend |
| `/api/search` | GET | 语义搜索 | Backend |
| `/api/books/{id}` | GET | 图书详情 | Backend |
| `/api/courses/{id}` | GET | 课程详情 | Backend |
| `/api/teacher/{dept}/heatmap` | GET | 教师端热力图 | Backend |
| `/api/teacher/{dept}/insight` | POST | 生成洞察报告 | Backend |
| `/api/dialogue` | SSE | 流式对话 | Backend |

---

## 6. Frontend Test Agent 审查标准

| 维度 | 检查项 | 通过标准 |
|------|--------|----------|
| 功能完整性 | 每个页面所有交互入口可用、API对接正确、状态管理无遗漏 | 所有按钮/表单/图表正常工作 |
| UI美观度 | 布局合理、颜色一致、字体层级清晰、间距统一 | 无明显视觉问题 |
| 响应式 | 桌面端/平板/移动端布局适配 | 三端布局不错乱 |
| 可访问性 | 语义化HTML、ARIA标签、键盘导航 | 基础可访问性达标 |
| 交互体验 | 加载状态、空状态、错误提示、过渡动画 | 无白屏/死链/无响应 |
| 性能 | 首屏加载<3秒、图表渲染<1秒 | 不卡顿 |

---

*文档版本：v1.0 | 编写日期：2026-05-09*
