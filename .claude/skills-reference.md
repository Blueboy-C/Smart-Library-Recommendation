# 项目Skills参考手册

本项目开发过程建议使用以下Claude Code Skills提升开发效率和质量。已安装22个Skills，按使用场景分类。

---

## 一、已安装Skills（22个）

### 开发工作流（Superpowers套件）

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `brainstorming` | 动手前结构化头脑风暴，列出方案与风险对比 | 新功能开发前 |
| `writing-plans` | 将复杂需求拆解为5-10个可验证步骤 | 明确需求后、写代码前 |
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

### 文档与数据

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `pdf` | 读取/合并/拆分PDF、OCR、表单填写 | 处理PDF文献或报告 |
| `docx` | Word文档创建/编辑/格式排版 | 输出Word格式文档 |
| `xlsx` | 电子表格读取/清洗/公式/图表 | 处理数据文件、导出报表 |
| `pptx` | PPT创建/编辑/幻灯片排版 | 制作答辩PPT |

### 设计与工具

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `frontend-design` | 解决AI审美趋同，生成高质量前端UI | 构建前端界面时 |
| `excalidraw-diagram` | 自然语言生成架构图/流程图/ER图 | 需要画系统架构图时 |
| `academic-research-writer` | 学术论文写作，IEEE标准引用 | 撰写论文相关文档 |

### 元技能

| Skill | 用途 | 触发时机 |
|-------|------|----------|
| `skill-creator` | 创建自定义Skills（"元技能"） | 需要沉淀重复工作流时 |
| `writing-skills` | 编写高质量Skill定义 | 创建/修改Skill时 |
| `find-skills` | 搜索和发现新Skills | 需要新能力时 |
| `using-superpowers` | Superpowers套件使用指南 | 首次使用或查阅用法时 |

---

## 二、推荐补充安装（当前网络不可达）

以下Skills因GitHub网络不可达暂未安装，建议网络恢复后安装：

| Skill | 安装命令 | 用途 |
|-------|----------|------|
| **UI UX Pro Max** | `npx skills add nextlevelbuilder/ui-ux-pro-max-skill -g -y` | 67+设计风格、96+配色方案，提升前端UI质量 |
| **claude-mem** | `npx skills add https://github.com/thedotmack/claude-mem -g -y` | 长期记忆系统，跨会话保留项目上下文 |
| **GSD** | `npx skills add https://github.com/gsd-build/get-shit-done -g -y` | 轻量级任务执行+上下文工程 |
| **LightRAG** | `npx skills add https://github.com/hkuds/lightrag -g -y` | 轻量级RAG框架，适合私有知识库检索 |

安装后运行 `/plugin list` 验证。

---

## 三、本项目推荐工作流

### 需求分析阶段
```
/brainstorming  → 明确需求边界
/writing-plans  → 拆解为可执行计划
```

### 开发阶段
```
/writing-plans         → 制定实现计划
/test-driven-development → 编写核心算法（推荐引擎、特征工程）
/frontend-design       → 构建Web界面（学生端/教师端）
/dispatching-parallel-agents → 前后端并行开发
/systematic-debugging  → 遇到Bug时
```

### 验收阶段
```
/requesting-code-review     → 代码审查
/verification-before-completion → 完工检查
/finishing-a-development-branch → 合并决策
```

### 文档输出
```
/xlsx      → 特征数据分析报表
/pdf       → 文献参考处理
/docx      → 需求文档/设计文档最终版
/pptx      → 答辩PPT
/excalidraw-diagram → 系统架构图
/academic-research-writer → 论文撰写
```
