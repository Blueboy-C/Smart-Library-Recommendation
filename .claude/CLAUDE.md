# 智慧图书馆个性化学习推荐系统

## 项目概述
基于AI的高校个性化学习推荐平台。融合图书馆借阅数据与教务选课成绩数据，通过协同过滤与内容推荐算法实现个性化推荐，集成LLM提供智能推荐解释、学习路径规划、对话助手等功能。

## 技术方向
- 后端: Python (待定框架 FastAPI/Flask)
- 前端: Web端 (待定 React/Vue)
- 推荐引擎: User-Based CF + TF-IDF + Cosine Similarity
- LLM集成: 推荐解释、学习路径规划、对话助手、语义检索
- 数据库: 待定 (PostgreSQL/MySQL)

## 项目规范
- 遵循PEP8 Python编码规范
- 使用Git进行版本控制
- 优先使用Edit工具修改已有文件，避免创建新文件
- 代码中不加多余注释，仅在非显而易见的逻辑处添加简短说明
- 不引入超出当前任务范围的抽象和重构
- 不要创建README或文档文件，除非明确要求

## AgentTeam 角色定义

| 角色 | 职责 | 产出 |
|------|------|------|
| **Data Agent** | 数据清洗/导入、特征工程、领域映射表、样本数据、模型评估 | data/ 模块 |
| **Backend Agent** | FastAPI、数据库Schema、推荐引擎、LLM集成、行为日志API | src/backend/ |
| **Frontend Agent** | React应用、ECharts图表、流式对话、行为追踪、收藏功能 | src/frontend/ |
| **Frontend Test Agent** | 前端功能验证、UI美观度审查、页面合理性检查、跨浏览器兼容 | 前端质量报告 |
| **QA Agent** | API测试、推荐准确率验证、前后端联调、性能测试 | 测试报告 |

## 协作规则
- API契约（OpenAPI 3.0）先行，Backend产出后Frontend基于Mock并行开发
- Frontend Test Agent 在每个前端页面完成后立即审查
- 每日集成，由QA Agent自动跑集成测试
- 提交前通过 verification-before-completion 检查
