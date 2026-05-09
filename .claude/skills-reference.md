# 项目Skills参考手册

当前共安装 **536个Skills**，按来源分类。

---

## Skills来源

| 来源 | 数量 | 核心内容 |
|------|------|----------|
| Superpowers | 12 | 开发工作流全流程 |
| UI UX Pro Max + CKM | 7 | UI设计、品牌、幻灯片 |
| claude-mem | 11 | 记忆、计划、知识库、探索 |
| deer-flow (bytedance) | 21 | 学术论文审查、深度研究、图表可视化、代码文档、PPT生成 |
| agents (wshobson) | 153 | Prompt工程、安全、Python全栈、Agent协调、浏览器自动化 |
| prompt-optimizer (daymade) | 53 | Prompt优化、QA专家、事实核查、评估方法论 |
| letta (letta-ai) | 39 | Letta Agent开发、AgentDB记忆/向量搜索/强化学习 |
| Claude-Flow (ruvnet/ruflo) | 230+ | Swarm集群、神经训练、向量搜索、成本管理、安全扫描、SPARC开发 |
| 其他（文档/设计） | 10 | PDF、Excel、Word、PPT、前端设计 |

## 本项目关键Skills速查

## 一、开发工作流（Superpowers套件）

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `brainstorming` | 动手前结构化头脑风暴，列出方案与风险对比 | 新功能开发前 |
| `writing-plans` | 将复杂需求拆解为5-10个可验证步骤 | 明确需求后、写代码前 |
| `make-plan` | 更详细的阶段化实现计划（含文档发现） | 复杂功能需要详细计划时 |
| `do` | 执行make-plan创建的计划，使用子Agent | 有执行计划后 |
| `executing-plans` | 按计划逐步执行，每步验证后再继续 | 有执行计划后 |
| `test-driven-development` | 强制先写测试再写实现 | 编写核心业务逻辑 |
| `systematic-debugging` | 观察→假设→测试→修复四阶段调试 | 遇到Bug时 |
| `requesting-code-review` | 5个专项Agent并行审查（安全/性能/正确性/风格/测试） | 完成功能开发后 |
| `receiving-code-review` | 接收审查反馈后的处理策略 | 收到Review反馈时 |
| `verification-before-completion` | 完工前强制检查清单 | 声称"完成"前 |
| `subagent-driven-development` | 分解任务由多个子Agent并行执行 | 任务可并行时 |
| `dispatching-parallel-agents` | 自动识别可并行任务 | 有多个独立任务时 |
| `using-git-worktrees` | 物理分支隔离，多任务并行开发 | 需要并行开发多个功能时 |
| `finishing-a-development-branch` | 开发完成后结构化合并决策 | 功能开发完毕时 |
| `babysit` | 监控PR审查周期直到可合并 | PR等待审查时 |

### 文档与数据

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `pdf` | 读取/合并/拆分PDF、OCR、表单填写 | 处理PDF文献或报告 |
| `docx` | Word文档创建/编辑/格式排版 | 输出Word格式文档 |
| `xlsx` | 电子表格读取/清洗/公式/图表 | 处理数据文件、导出报表 |
| `pptx` | PPT创建/编辑/幻灯片排版 | 制作答辩PPT |
| `ckm-slides` | HTML演示文稿（Chart.js），设计令牌驱动 | 需要精美演示文稿时 |

### 设计与前端

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `frontend-design` | 解决AI审美趋同，生成高质量前端UI | 构建前端界面时 |
| `ui-ux-pro-max` | 50+设计风格、161配色、57字体对、99 UX准则 | 需要高质量UI/UX设计时 |
| `ckm-banner-design` | 社交媒体/网页横幅设计，22种风格 | 需要横幅/海报设计 |
| `ckm-brand` | 品牌声音、视觉标识、信息框架 | 需要品牌一致性 |
| `ckm-design` | 综合设计：品牌标识、设计令牌、Logo（55风格）、图标（15风格） | 需要全面设计 |
| `ckm-design-system` | 三层设计令牌架构、CSS变量、组件规范 | 构建设计系统 |
| `ckm-ui-styling` | shadcn/ui组件、Tailwind CSS、无障碍UI | 使用shadcn/ui时 |
| `excalidraw-diagram` | 自然语言生成架构图/流程图/ER图 | 需要画系统架构图时 |

### 记忆与知识

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `mem-search` | 搜索跨会话持久记忆 | 查找之前解决的问题 |
| `how-it-works` | 解释claude-mem的工作原理 | 了解记忆系统时 |
| `knowledge-agent` | 从claude-mem观察记录构建AI知识库 | 需要专项知识总结时 |
| `timeline-report` | 生成项目完整开发历程报告 | 需要项目历史分析 |
| `claude-code-plugin-release` | 语义版本发布和自动化发布流程 | 发布插件/包时 |

### 代码探索

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `learn-codebase` | 完整读取代码库每个源文件 | 首次进入陌生项目 |
| `smart-explore` | 基于tree-sitter AST的代码结构搜索 | 需要高效定位代码结构 |
| `pathfinder` | 映射代码库为功能分组流程图，识别重复 | 重构前架构审计 |

### 元技能

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `skill-creator` | 创建自定义Skills（"元技能"） | 需要沉淀重复工作流时 |
| `writing-skills` | 编写高质量Skill定义 | 创建/修改Skill时 |
| `find-skills` | 搜索和发现新Skills | 需要新能力时 |
| `using-superpowers` | Superpowers套件使用指南 | 首次使用或查阅用法时 |
| `academic-research-writer` | 学术论文写作，IEEE标准引用 | 撰写论文相关文档 |

---

## 二、未安装（已确认不存在或不兼容）

| Skill | 原因 |
|-------|------|
| GSD (get-shit-done) | 仓库无有效SKILL.md，不被skills CLI识别 |
| LightRAG | 仓库无有效SKILL.md，不被skills CLI识别 |

---

## 三、本项目推荐工作流

### 需求分析阶段
```
/brainstorming    → 明确需求边界
/writing-plans    → 拆解为可执行计划
/make-plan        → 详细分阶段计划（大型功能）
```

### 开发阶段
```
/do                           → 执行make-plan计划
/test-driven-development      → 编写核心算法（推荐引擎、特征工程）
/frontend-design + ui-ux-pro-max → 构建Web界面
/dispatching-parallel-agents  → 前后端并行开发
/systematic-debugging         → 遇到Bug时
/smart-explore                → 快速搜索代码结构
```

### 验收阶段
```
/requesting-code-review        → 代码审查
/verification-before-completion → 完工检查
/finishing-a-development-branch → 合并决策
/babysit                       → 监控PR审查
```

### 文档输出
```
/xlsx                       → 特征数据分析报表
/pdf                        → 文献参考处理
/docx                       → 需求/设计文档
/pptx 或 /ckm-slides        → 答辩PPT
/excalidraw-diagram         → 系统架构图
/academic-research-writer   → 论文撰写
/timeline-report            → 项目开发历程报告
```
