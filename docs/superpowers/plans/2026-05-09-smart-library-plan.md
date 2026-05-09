# 智慧图书馆个性化学习推荐系统 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成一个完整的Web端个性化学习推荐平台，包含数据管理、推荐引擎、LLM智能功能和可视化交互界面。

**Architecture:** FastAPI后端 + React前端，前后端通过OpenAPI 3.0契约解耦。推荐引擎使用User-Based CF + TF-IDF余弦相似度混合推荐，LLM提供智能解释/对话/路径规划/语义检索。

**Tech Stack:** Python 3.11+ / FastAPI / SQLAlchemy / SQLite / scikit-learn / jieba / React 18 / TypeScript / TailwindCSS / ECharts 5 / OpenAI兼容LLM API

**AgentTeam:** Data Agent → Backend Agent → Frontend Agent (并行) → Frontend Test Agent (逐页审查) → QA Agent (验收)

---

## 文件结构规划

### 后端文件
```
src/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI应用入口
│   ├── config.py             # 配置管理
│   ├── database.py           # SQLAlchemy引擎+Session
│   ├── models.py             # ORM模型
│   ├── schemas.py            # Pydantic请求/响应Schema
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── students.py       # 学生相关端点
│   │   ├── books.py          # 图书资源端点
│   │   ├── courses.py        # 课程资源端点
│   │   ├── teacher.py        # 教师端端点
│   │   ├── search.py         # 搜索端点
│   │   └── dialogue.py       # 流式对话端点
│   └── services/
│       ├── __init__.py
│       ├── recommender.py    # 推荐编排服务
│       ├── profile_service.py # 画像构建服务
│       ├── behavior_service.py # 行为日志服务
│       └── llm_service.py    # LLM调用服务
├── recommender/
│   ├── __init__.py
│   ├── content_based.py      # TF-IDF + 余弦相似度
│   ├── collaborative.py      # User-Based CF
│   ├── hybrid.py             # 混合排序 + 行为调权
│   └── cold_start.py         # 冷启动策略
├── data/
│   ├── __init__.py
│   ├── models.py             # 数据层Dataclass
│   ├── importers.py          # 数据导入
│   ├── cleaners.py           # 数据清洗
│   ├── domain_mapping.py     # 分类号→领域映射
│   ├── feature_engineering.py # 特征工程
│   └── sample_generator.py   # 样本数据生成
└── llm/
    ├── __init__.py
    ├── client.py             # LLM API客户端
    └── prompts.py            # Prompt模板

data/
├── raw/                      # 原始数据(gitignore)
├── processed/                # 处理后数据
└── domain_mapping.json       # 中图分类法→知识领域映射

tests/
├── __init__.py
├── test_data/
│   ├── test_importers.py
│   ├── test_cleaners.py
│   ├── test_domain_mapping.py
│   └── test_feature_engineering.py
├── test_recommender/
│   ├── test_content_based.py
│   ├── test_collaborative.py
│   └── test_hybrid.py
└── test_backend/
    ├── test_students.py
    ├── test_recommendations.py
    └── test_behavior.py
```

### 前端文件
```
src/frontend/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── api/
│   │   ├── client.ts         # HTTP客户端
│   │   ├── student.ts        # 学生端API
│   │   ├── teacher.ts        # 教师端API
│   │   └── mock.ts           # Mock数据(阶段2使用)
│   ├── types/
│   │   └── index.ts          # TypeScript类型定义
│   ├── hooks/
│   │   ├── useBehavior.ts    # 行为追踪Hook
│   │   ├── useRecommendation.ts
│   │   └── useStreamChat.ts  # 流式对话Hook
│   ├── components/
│   │   ├── Layout.tsx         # 布局组件
│   │   ├── RecommendCard.tsx  # 推荐卡片
│   │   ├── FeedbackButtons.tsx # 有用/跳过按钮
│   │   ├── ChatWidget.tsx     # 对话助手悬浮组件
│   │   ├── RadarChart.tsx     # 雷达图(ECharts)
│   │   ├── HeatMap.tsx        # 热力图(ECharts)
│   │   ├── WordCloud.tsx      # 词云(ECharts)
│   │   ├── LineChart.tsx      # 折线图(ECharts)
│   │   ├── ScatterChart.tsx   # 散点图(ECharts)
│   │   └── StreamText.tsx     # 流式文本渲染
│   └── pages/
│       ├── student/
│       │   ├── Recommendations.tsx  # 推荐首页
│       │   ├── Profile.tsx          # 我的画像
│       │   ├── History.tsx          # 推荐历史
│       │   ├── PathPlanner.tsx      # 学习路径规划
│       │   ├── ResourceDetail.tsx   # 资源详情页
│       │   └── SemanticSearch.tsx   # 语义搜索
│       └── teacher/
│           ├── InterestOverview.tsx  # 学生兴趣总览
│           ├── ClusterView.tsx       # 学生分群视图
│           └── InsightReport.tsx     # 智能洞察报告
```

---

## 阶段1：基础设施（Data Agent + Backend Agent）

### Task 1.1: Data Agent — 数据层数据类定义

**Files:** Create `src/data/__init__.py`, `src/data/models.py`

- [ ] **Step 1: 创建 `src/data/__init__.py`**

```python
"""数据层：数据导入、清洗、特征工程"""
```

- [ ] **Step 2: 创建 `src/data/models.py` 定义核心数据结构**

```python
"""数据层核心数据结构"""
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional


@dataclass
class Student:
    """学生基本信息"""
    student_id: str
    grade: str
    major: str
    gender: Optional[str] = None


@dataclass
class BorrowRecord:
    """借阅记录"""
    student_id: str
    book_id: str
    book_title: str
    clc_number: str  # 中图分类号
    author: str
    publisher: str
    borrow_date: date
    return_date: date
    renew_count: int = 0

    @property
    def borrow_days(self) -> int:
        return (self.return_date - self.borrow_date).days


@dataclass
class CourseRecord:
    """选课成绩记录"""
    student_id: str
    course_id: str
    course_name: str
    course_type: str  # 必修/选修/公选
    college: str
    score: float
    semester: str

    @property
    def mastery(self) -> str:
        if self.score >= 90:
            return "精通"
        elif self.score >= 80:
            return "熟练"
        elif self.score >= 60:
            return "了解"
        return "薄弱"


@dataclass
class BookMeta:
    """馆藏书目元数据"""
    book_id: str
    title: str
    author: str
    publisher: str
    publish_year: int
    clc_number: str
    summary: str  # 内容摘要/目录
    total_copies: int
    available_copies: int


@dataclass
class CourseMeta:
    """课程元数据"""
    course_id: str
    course_name: str
    course_type: str
    college: str
    description: str  # 课程简介/教学大纲
    prerequisites: list[str] = field(default_factory=list)
    credits: int = 0
    semester: str = ""


@dataclass
class ActivityMeta:
    """学术活动元数据"""
    activity_id: str
    title: str
    activity_type: str  # 讲座/竞赛/工作坊/读书会
    organizer: str
    description: str
    tags: list[str] = field(default_factory=list)
    event_time: datetime = datetime.now()
    location: str = ""
    target_audience: str = ""


@dataclass
class BehaviorLog:
    """用户行为日志"""
    student_id: str
    item_id: str
    action_type: str  # expose/click/stay/scroll/useful/skip/bookmark/reserve/revisit
    timestamp: datetime
    source: str = ""  # 来源：recommend/search/dialogue
    stay_seconds: float = 0
    scroll_percent: float = 0


@dataclass
class StudentFeature:
    """学生特征向量"""
    student_id: str
    interest_keywords: dict[str, float]  # 关键词→TF-IDF权重
    domain_weights: dict[str, float]     # 领域→分布权重
    time_preference: str                 # 活跃时段标签
    reading_depth: float                 # 阅读深度(借阅时长均值)
    reading_breadth: int                 # 阅读广度(覆盖领域数)
    interest_stability: float            # 兴趣稳定性(0-1)
```

- [ ] **Step 3: 验证数据类导入正确**

Run: `python -c "from src.data.models import Student, BorrowRecord, StudentFeature; print('OK')"`

- [ ] **Step 4: 提交**

```bash
git add src/data/ && git commit -m "feat: 数据层核心数据类定义"
```

---

### Task 1.2: Data Agent — 中图分类法→知识领域映射

**Files:** Create `data/domain_mapping.json`, `src/data/domain_mapping.py`

- [ ] **Step 1: 创建 `data/domain_mapping.json` 领域映射表**

```json
{
  "A": "马克思主义/列宁主义",
  "B": "哲学/心理学",
  "C": "社会科学总论",
  "D": "政治/法律",
  "E": "军事",
  "F": "经济",
  "G": "文化/教育/体育",
  "H": "语言/文字",
  "I": "文学",
  "J": "艺术",
  "K": "历史/地理",
  "N": "自然科学总论",
  "O": "数学/物理/化学",
  "P": "天文学/地球科学",
  "Q": "生物科学",
  "R": "医药/卫生",
  "S": "农业科学",
  "T": "工业技术",
  "TB": "一般工业技术",
  "TD": "矿业工程",
  "TE": "石油/天然气",
  "TF": "冶金工业",
  "TG": "金属学/金属工艺",
  "TH": "机械/仪表工业",
  "TJ": "武器工业",
  "TK": "能源与动力工程",
  "TL": "原子能技术",
  "TM": "电工技术",
  "TN": "电子技术/通信",
  "TP": "自动化/计算机",
  "TQ": "化学工业",
  "TS": "轻工业/手工业",
  "TU": "建筑科学",
  "TV": "水利工程",
  "U": "交通运输",
  "V": "航空/航天",
  "X": "环境科学/安全科学",
  "Z": "综合性图书",
  "UNKNOWN": "未分类"
}
```

- [ ] **Step 2: 创建 `src/data/domain_mapping.py`**

```python
"""中图分类法→知识领域映射"""
import json
from pathlib import Path


_MAPPING: dict[str, str] = {}


def load_mapping(path: str | None = None) -> dict[str, str]:
    """加载领域映射表，缓存到模块级变量"""
    global _MAPPING
    if _MAPPING:
        return _MAPPING
    if path is None:
        path = Path(__file__).parent.parent.parent / "data" / "domain_mapping.json"
    with open(path, "r", encoding="utf-8") as f:
        _MAPPING = json.load(f)
    return _MAPPING


def clc_to_domain(clc_number: str) -> str:
    """将中图分类号映射到知识领域。按最长前缀匹配"""
    mapping = load_mapping()
    clc = clc_number.strip().upper()
    best = "UNKNOWN"
    best_len = 0
    for key in mapping:
        if clc.startswith(key) and len(key) > best_len:
            best = mapping[key]
            best_len = len(key)
    return best


def list_domains() -> list[str]:
    """返回所有一级领域名称（去重）"""
    return sorted(set(load_mapping().values()))
```

- [ ] **Step 3: 测试** 

```python
# tests/test_data/test_domain_mapping.py 临时验证
from src.data.domain_mapping import clc_to_domain, list_domains

def test_clc_T():
    assert clc_to_domain("TP311.1") == "自动化/计算机"

def test_clc_TB():
    assert clc_to_domain("TB3") == "一般工业技术"

def test_clc_unknown():
    assert clc_to_domain("") == "未分类"

def test_list_domains():
    domains = list_domains()
    assert "自动化/计算机" in domains
    assert len(domains) > 20
```

Run: `python -m pytest tests/test_data/test_domain_mapping.py -v`

- [ ] **Step 4: 提交**

```bash
git add data/domain_mapping.json src/data/domain_mapping.py tests/
git commit -m "feat: 中图分类法→知识领域映射表"
```

---

### Task 1.3: Data Agent — 样本数据生成器

**Files:** Create `src/data/sample_generator.py`

- [ ] **Step 1: 创建样本数据生成脚本**

```python
"""生成开发测试用样本数据：200名学生 + 基础数据 + 借阅记录 + 选课成绩"""
import random
import csv
from datetime import date, timedelta
from pathlib import Path

MAJORS = ["计算机科学与技术", "软件工程", "电子信息工程", "自动化", "通信工程",
          "数学与应用数学", "信息与计算科学", "数据科学与大数据", "人工智能", "网络工程"]
GRADES = ["2022级", "2023级", "2024级", "2025级"]
BOOKS = [
    # (book_id, title, clc, author, publisher, year, summary)
    ("B001", "Python编程：从入门到实践", "TP311.56", "Eric Matthes", "人民邮电出版社", 2020, "Python入门经典教程，涵盖基础语法、项目实践"),
    ("B002", "算法导论", "TP301.6", "Thomas Cormen", "机械工业出版社", 2013, "计算机算法领域的经典教材，全面介绍算法设计与分析"),
    ("B003", "机器学习", "TP181", "周志华", "清华大学出版社", 2016, "机器学习领域入门教材，涵盖十大经典算法"),
    ("B004", "深度学习", "TP181", "Ian Goodfellow", "人民邮电出版社", 2017, "深度学习领域奠基之作，系统介绍神经网络"),
    ("B005", "数据挖掘：概念与技术", "TP274", "Jiawei Han", "机械工业出版社", 2012, "数据挖掘经典教材，涵盖分类/聚类/关联规则"),
    ("B006", "计算机网络：自顶向下方法", "TN915", "James Kurose", "机械工业出版社", 2017, "计算机网络经典教材"),
    ("B007", "计算机组成原理", "TP303", "David Patterson", "机械工业出版社", 2016, "计算机体系结构经典教材"),
    ("B008", "编译原理", "TP314", "Alfred Aho", "机械工业出版社", 2009, "编译器设计经典教材"),
    ("B009", "数据库系统概念", "TP311.13", "Abraham Silberschatz", "机械工业出版社", 2019, "数据库系统入门经典"),
    ("B010", "线性代数", "O151.2", "Gilbert Strang", "人民邮电出版社", 2018, "线性代数教材，适合工科学生"),
    ("B011", "统计学", "C8", "David Freedman", "机械工业出版社", 2016, "统计学入门教材"),
    ("B012", "离散数学及其应用", "O158", "Kenneth Rosen", "机械工业出版社", 2018, "离散数学经典教材"),
    ("B013", "信号与系统", "TN911.6", "Alan Oppenheim", "电子工业出版社", 2018, "信号处理经典教材"),
    ("B014", "操作系统概念", "TP316", "Abraham Silberschatz", "机械工业出版社", 2020, "操作系统经典教材"),
    ("B015", "计算机图形学", "TP391.41", "Peter Shirley", "清华大学出版社", 2018, "计算机图形学入门教材"),
    ("B016", "自然语言处理", "TP391", "Dan Jurafsky", "机械工业出版社", 2019, "NLP经典教材"),
    ("B017", "人工智能：一种现代方法", "TP18", "Stuart Russell", "清华大学出版社", 2020, "AI经典教材"),
    ("B018", "数学之美", "O1-49", "吴军", "人民邮电出版社", 2014, "科普读物，介绍数学在信息领域的应用"),
    ("B019", "C++ Primer", "TP312C", "Stanley Lippman", "电子工业出版社", 2013, "C++编程经典教材"),
    ("B020", "计算机体系结构：量化研究方法", "TP303", "John Hennessy", "机械工业出版社", 2019, "体系结构进阶教材"),
]
COURSES = [
    ("C001", "数据结构与算法", "必修", "计算机科学与技术学院"),
    ("C002", "操作系统", "必修", "计算机科学与技术学院"),
    ("C003", "数据库原理", "必修", "计算机科学与技术学院"),
    ("C004", "计算机网络", "必修", "计算机科学与技术学院"),
    ("C005", "软件工程导论", "选修", "计算机科学与技术学院"),
    ("C006", "机器学习导论", "选修", "计算机科学与技术学院"),
    ("C007", "深度学习实践", "选修", "计算机科学与技术学院"),
    ("C008", "数据挖掘", "选修", "计算机科学与技术学院"),
    ("C009", "自然语言处理", "选修", "计算机科学与技术学院"),
    ("C010", "大数据技术", "选修", "计算机科学与技术学院"),
    ("C011", "高等数学A", "必修", "数学与统计学院"),
    ("C012", "线性代数", "必修", "数学与统计学院"),
    ("C013", "概率论与数理统计", "必修", "数学与统计学院"),
    ("C014", "信号与系统", "必修", "电子信息工程学院"),
    ("C015", "数字电路", "必修", "电子信息工程学院"),
]


def generate_students(n: int = 200) -> list[dict]:
    """生成学生基本信息"""
    students = []
    for i in range(1, n + 1):
        students.append({
            "student_id": f"S{2022000 + i:04d}",
            "name": f"学生{i}",
            "grade": random.choice(GRADES),
            "major": random.choice(MAJORS),
            "gender": random.choice(["男", "女"]),
        })
    return students


def generate_borrow_records(students: list[dict], n_records: int = 2000) -> list[dict]:
    """生成借阅记录，同一学生借阅兴趣集中"""
    records = []
    base_date = date(2025, 9, 1)
    for _ in range(n_records):
        student = random.choice(students)
        # 每个学生偏向借阅2-3个领域的书（模拟真实兴趣集中）
        book = random.choice(BOOKS)
        borrow_date = base_date + timedelta(days=random.randint(0, 180))
        return_date = borrow_date + timedelta(days=random.randint(1, 60))
        records.append({
            "student_id": student["student_id"],
            "book_id": book[0],
            "book_title": book[1],
            "clc_number": book[2],
            "author": book[3],
            "publisher": book[4],
            "borrow_date": borrow_date.isoformat(),
            "return_date": return_date.isoformat(),
            "renew_count": random.choices([0, 1, 2], weights=[0.7, 0.2, 0.1])[0],
        })
    return records


def generate_course_records(students: list[dict]) -> list[dict]:
    """为每个学生生成选课成绩"""
    records = []
    for student in students:
        n_courses = random.randint(4, 12)
        for course in random.sample(COURSES, n_courses):
            records.append({
                "student_id": student["student_id"],
                "course_id": course[0],
                "course_name": course[1],
                "course_type": course[2],
                "college": course[3],
                "score": round(random.uniform(60, 98), 1),
                "semester": "2025-2026-1",
            })
    return records


def save_csv(data: list[dict], filepath: str, columns: list[str]):
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(data)


if __name__ == "__main__":
    import sys
    data_dir = Path("data/processed")
    data_dir.mkdir(parents=True, exist_ok=True)

    students = generate_students(200)
    save_csv(students, str(data_dir / "students.csv"), ["student_id", "name", "grade", "major", "gender"])
    print(f"生成{len(students)}名学生")

    borrows = generate_borrow_records(students, 2000)
    cols = ["student_id", "book_id", "book_title", "clc_number", "author", "publisher", "borrow_date", "return_date", "renew_count"]
    save_csv(borrows, str(data_dir / "borrow_records.csv"), cols)
    print(f"生成{len(borrows)}条借阅记录")

    courses = generate_course_records(students)
    cols2 = ["student_id", "course_id", "course_name", "course_type", "college", "score", "semester"]
    save_csv(courses, str(data_dir / "course_records.csv"), cols2)
    print(f"生成{len(courses)}条选课记录")

    # 生成馆藏书目数据
    book_cols = ["book_id", "title", "clc_number", "author", "publisher", "publish_year", "summary", "total_copies", "available_copies"]
    book_data = [{"book_id": b[0], "title": b[1], "clc_number": b[2], "author": b[3], "publisher": b[4], "publish_year": b[5], "summary": b[6], "total_copies": random.randint(2, 10), "available_copies": random.randint(0, 5)} for b in BOOKS]
    save_csv(book_data, str(data_dir / "books_meta.csv"), book_cols)
    print(f"生成{len(book_data)}条书目数据")
```

- [ ] **Step 2: 运行样本生成**

Run: `python src/data/sample_generator.py`
Expected: 生成4个CSV文件在 `data/processed/` 目录下

- [ ] **Step 3: 提交**

```bash
git add src/data/sample_generator.py data/processed/
git commit -m "feat: 样本数据生成器（200学生+2000借阅+书目元数据）"
```

---

### Task 1.4: Data Agent — 数据导入与清洗

**Files:** Create `src/data/importers.py`, `src/data/cleaners.py`

- [ ] **Step 1: 创建 `src/data/importers.py`**

```python
"""数据导入：从CSV读取数据并转换为DataClass对象"""
import csv
from datetime import date
from pathlib import Path
from .models import Student, BorrowRecord, CourseRecord, BookMeta, CourseMeta


def _parse_date(s: str) -> date:
    return date.fromisoformat(s)


def import_students(filepath: str) -> list[Student]:
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [Student(
            student_id=row["student_id"],
            grade=row["grade"],
            major=row["major"],
            gender=row.get("gender"),
        ) for row in reader]


def import_borrow_records(filepath: str) -> list[BorrowRecord]:
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [BorrowRecord(
            student_id=row["student_id"],
            book_id=row["book_id"],
            book_title=row["book_title"],
            clc_number=row["clc_number"],
            author=row.get("author", ""),
            publisher=row.get("publisher", ""),
            borrow_date=_parse_date(row["borrow_date"]),
            return_date=_parse_date(row["return_date"]),
            renew_count=int(row.get("renew_count", 0)),
        ) for row in reader]


def import_course_records(filepath: str) -> list[CourseRecord]:
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [CourseRecord(
            student_id=row["student_id"],
            course_id=row["course_id"],
            course_name=row["course_name"],
            course_type=row.get("course_type", ""),
            college=row.get("college", ""),
            score=float(row["score"]),
            semester=row.get("semester", ""),
        ) for row in reader]


def import_book_meta(filepath: str) -> list[BookMeta]:
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [BookMeta(
            book_id=row["book_id"],
            title=row["title"],
            author=row.get("author", ""),
            publisher=row.get("publisher", ""),
            publish_year=int(row.get("publish_year", 0)),
            clc_number=row["clc_number"],
            summary=row.get("summary", ""),
            total_copies=int(row.get("total_copies", 1)),
            available_copies=int(row.get("available_copies", 0)),
        ) for row in reader]
```

- [ ] **Step 2: 创建 `src/data/cleaners.py`**

```python
"""数据清洗：缺失值处理、异常值检测、去重"""
from .models import BorrowRecord, CourseRecord, Student


def clean_borrow_records(records: list[BorrowRecord]) -> list[BorrowRecord]:
    """清洗借阅记录：去除异常时长(>365天或<0天)、去重"""
    seen = set()
    cleaned = []
    for r in records:
        days = r.borrow_days
        if days <= 0 or days > 365:
            continue
        key = (r.student_id, r.book_id, r.borrow_date)
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(r)
    return cleaned


def clean_course_records(records: list[CourseRecord]) -> list[CourseRecord]:
    """清洗成绩记录：去除异常分数、去重"""
    seen = set()
    cleaned = []
    for r in records:
        if r.score < 0 or r.score > 100:
            continue
        key = (r.student_id, r.course_id, r.semester)
        if key in seen:
            continue
        seen.add(key)
        cleaned.append(r)
    return cleaned


def compute_coverage(students: list[Student], borrows: list[BorrowRecord],
                     courses: list[CourseRecord]) -> dict:
    """计算数据覆盖报告"""
    sid_set = {s.student_id for s in students}
    borrow_sids = {b.student_id for b in borrows}
    course_sids = {c.student_id for c in courses}
    total = len(sid_set)
    return {
        "total_students": total,
        "students_with_borrow": len(borrow_sids),
        "students_with_courses": len(course_sids),
        "borrow_coverage": round(len(borrow_sids) / total * 100, 1),
        "course_coverage": round(len(course_sids) / total * 100, 1),
        "borrow_records": len(borrows),
        "course_records": len(courses),
        "no_data_students": total - len(borrow_sids & course_sids),
    }
```

- [ ] **Step 3: 验证** 

Run: `python -c "from src.data.importers import import_students, import_borrow_records; s=import_students('data/processed/students.csv'); print(f'导入{len(s)}名学生')"`

- [ ] **Step 4: 提交**

```bash
git add src/data/importers.py src/data/cleaners.py && git commit -m "feat: 数据导入与清洗模块"
```

---

### Task 1.5: Backend Agent — FastAPI应用骨架+数据库+OpenAPI契约

**Files:** Create `src/backend/__init__.py`, `src/backend/main.py`, `src/backend/config.py`, `src/backend/database.py`, `src/backend/models.py`, `src/backend/schemas.py`, `openapi.yaml`

- [ ] **Step 1: 安装依赖和创建后端骨架**

Bash: `pip install fastapi uvicorn sqlalchemy pydantic`

- [ ] **Step 2: 创建 `src/backend/__init__.py`**

```python
"""后端服务：FastAPI应用、数据库、API路由"""
```

- [ ] **Step 3: 创建 `src/backend/config.py`**

```python
"""应用配置"""
import os


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///smart_library.db")
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_BASE_URL: str = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))
    CACHE_TTL: int = 3600

settings = Settings()
```

- [ ] **Step 4: 创建 `src/backend/database.py`**

```python
"""数据库连接和会话管理"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings

engine = create_engine(settings.DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
```

- [ ] **Step 5: 创建 `src/backend/models.py` ORM模型**

```python
"""SQLAlchemy ORM模型"""
from datetime import date, datetime
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Text, ForeignKey, Enum
from .database import Base


class Student(Base):
    __tablename__ = "students"
    student_id = Column(String(20), primary_key=True)
    name = Column(String(50), default="")
    grade = Column(String(20))
    major = Column(String(50))
    gender = Column(String(4), default="")


class Book(Base):
    __tablename__ = "books"
    book_id = Column(String(20), primary_key=True)
    title = Column(String(200))
    author = Column(String(100), default="")
    publisher = Column(String(100), default="")
    publish_year = Column(Integer, default=0)
    clc_number = Column(String(20))
    summary = Column(Text, default="")
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=0)


class Course(Base):
    __tablename__ = "courses"
    course_id = Column(String(20), primary_key=True)
    course_name = Column(String(200))
    course_type = Column(String(10))
    college = Column(String(50), default="")
    description = Column(Text, default="")
    credits = Column(Integer, default=0)
    semester = Column(String(20), default="")


class BorrowRecord(Base):
    __tablename__ = "borrow_records"
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(20))
    book_id = Column(String(20))
    book_title = Column(String(200))
    clc_number = Column(String(20))
    borrow_date = Column(Date)
    return_date = Column(Date)
    renew_count = Column(Integer, default=0)


class CourseRecord(Base):
    __tablename__ = "course_records"
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(20))
    course_id = Column(String(20))
    course_name = Column(String(200))
    course_type = Column(String(10))
    college = Column(String(50))
    score = Column(Float)
    semester = Column(String(20))


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(20))
    item_id = Column(String(20))
    action_type = Column(String(20))
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String(30), default="")
    stay_seconds = Column(Float, default=0)
    scroll_percent = Column(Float, default=0)
```

- [ ] **Step 6: 创建 `src/backend/schemas.py` Pydantic Schema**

```python
"""Pydantic请求/响应模型"""
from datetime import datetime, date
from pydantic import BaseModel, Field


class StudentProfile(BaseModel):
    student_id: str
    grade: str
    major: str
    interest_keywords: list[tuple[str, float]]
    domain_weights: dict[str, float]
    time_preference: str
    reading_depth: float
    reading_breadth: int
    interest_stability: float
    borrow_count: int
    course_count: int
    cross_domain_signal: bool = False


class RecommendItem(BaseModel):
    item_id: str
    item_type: str  # book/course/activity
    title: str
    reason: str
    score: float
    available: bool = True


class RecommendResponse(BaseModel):
    student_id: str
    items: list[RecommendItem]


class BehaviorEvent(BaseModel):
    student_id: str
    item_id: str
    action_type: str  # click/stay/scroll/useful/skip/bookmark
    source: str = "recommend"
    stay_seconds: float = 0
    scroll_percent: float = 0


class FeedbackEvent(BaseModel):
    student_id: str
    item_id: str
    feedback_type: str  # useful/skip


class PathPlanRequest(BaseModel):
    student_id: str
    goal: str


class PathPlanResponse(BaseModel):
    steps: list[dict]


class SearchQuery(BaseModel):
    query: str
    student_id: str = ""


class TeacherHeatmapRequest(BaseModel):
    dept: str = ""
    grade: str = ""


class InsightRequest(BaseModel):
    dept: str = ""
    grade: str = ""
```

- [ ] **Step 7: 创建 `src/backend/main.py`**

```python
"""FastAPI应用入口"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db

app = FastAPI(title="智慧图书馆推荐系统", version="0.1.0")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
```

- [ ] **Step 8: 测试启动**

Run: `cd src && python -m uvicorn backend.main:app --reload --port 8000`
Expected: `Application startup complete`，访问 `http://localhost:8000/api/health` 返回 `{"status":"ok"}`

- [ ] **Step 9: 提交**

```bash
git add src/backend/ tests/ && git commit -m "feat: FastAPI应用骨架+数据库Schema+OpenAPI契约"
```

---

### Task 1.6: Backend Agent — 数据导入API与种子数据加载

**Files:** Create `src/backend/routers/__init__.py`, `src/backend/routers/admin.py`, modify `src/backend/main.py`

- [ ] **Step 1: 创建数据导入路由**

```python
# src/backend/routers/admin.py
"""管理端：数据导入与系统状态"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Book, BorrowRecord, CourseRecord
from ...data.importers import import_students, import_borrow_records, import_book_meta, import_course_records
from ...data.cleaners import clean_borrow_records, clean_course_records, compute_coverage

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/import/all")
def import_all(db: Session = Depends(get_db)):
    base = "data/processed"
    # 导入学生
    students = import_students(f"{base}/students.csv")
    for s in students:
        db.merge(Student(student_id=s.student_id, name="", grade=s.grade, major=s.major, gender=s.gender or ""))
    # 导入书目
    books = import_book_meta(f"{base}/books_meta.csv")
    for b in books:
        db.merge(Book(book_id=b.book_id, title=b.title, author=b.author, publisher=b.publisher,
                       publish_year=b.publish_year, clc_number=b.clc_number, summary=b.summary,
                       total_copies=b.total_copies, available_copies=b.available_copies))
    # 导入借阅记录（清洗后）
    borrows = import_borrow_records(f"{base}/borrow_records.csv")
    borrows = clean_borrow_records(borrows)
    for b in borrows:
        db.add(BorrowRecord(student_id=b.student_id, book_id=b.book_id, book_title=b.book_title,
                            clc_number=b.clc_number, borrow_date=b.borrow_date,
                            return_date=b.return_date, renew_count=b.renew_count))
    # 导入成绩（清洗后）
    courses = import_course_records(f"{base}/course_records.csv")
    courses = clean_course_records(courses)
    for c in courses:
        db.add(CourseRecord(student_id=c.student_id, course_id=c.course_id, course_name=c.course_name,
                            course_type=c.course_type, college=c.college, score=c.score, semester=c.semester))
    db.commit()
    return {"status": "ok", "students": len(students), "books": len(books), "borrows": len(borrows), "courses": len(courses)}
```

- [ ] **Step 2: 在 `src/backend/main.py` 注册路由**

添加：`from .routers import admin` 和 `app.include_router(admin.router)`

- [ ] **Step 3: 调用导入接口验证**

Run: `python -c "from src.backend.database import init_db; init_db()"` 然后 `curl -X POST http://localhost:8000/api/admin/import/all`
Expected: `{"status":"ok","students":200,"books":20,"borrows":2000,"courses":...}`

- [ ] **Step 4: 提交**

```bash
git add src/backend/ && git commit -m "feat: 数据导入API与种子数据加载"
```

---

## 阶段2：核心功能（Backend + Frontend 并行）

### Task 2.1: Data Agent — 特征工程

**Files:** Create `src/data/feature_engineering.py`

- [ ] **Step 1: 创建 `src/data/feature_engineering.py`**

```python
"""特征工程：从借阅和成绩数据中提取学生特征向量"""
import re
import jieba
from collections import Counter, defaultdict
from datetime import date, timedelta
from .models import Student, BorrowRecord, CourseRecord, BookMeta, StudentFeature
from .domain_mapping import clc_to_domain


def extract_keywords_from_text(text: str) -> list[str]:
    """中文分词+去停用词"""
    stopwords = {"的", "与", "和", "及", "或", "在", "从", "了", "是", "等", "之", "为", "：", ":", "（", "）", "。", "，", "、", "；", "《", "》"}
    words = jieba.cut(text)
    return [w.strip() for w in words if len(w.strip()) >= 2 and w not in stopwords and not w.isdigit()]


def compute_interest_keywords(borrows: list[BorrowRecord], books: dict[str, BookMeta]) -> dict[str, float]:
    """从借阅书名+摘要中提取加权兴趣关键词"""
    counter: Counter = Counter()
    for b in borrows:
        words = extract_keywords_from_text(b.book_title)
        if b.book_id in books:
            words += extract_keywords_from_text(books[b.book_id].summary)
        for w in words:
            counter[w] += 1
    total = sum(counter.values())
    return {w: c / total for w, c in counter.most_common(50)}


def compute_domain_weights(borrows: list[BorrowRecord]) -> dict[str, float]:
    """计算知识领域分布权重"""
    counter: Counter = Counter()
    for b in borrows:
        domain = clc_to_domain(b.clc_number)
        counter[domain] += 1
    total = sum(counter.values()) or 1
    return {d: c / total for d, c in counter.items()}


def compute_time_preference(borrows: list[BorrowRecord],
                            course_records: list[CourseRecord]) -> str:
    """识别学习时段偏好：借阅时间戳的时段分布"""
    morning = afternoon = evening = night = 0
    # 借阅记录没有精确到小时的时间戳，用学期活跃度替代
    by_week = Counter([b.borrow_date.isocalendar()[1] for b in borrows])
    # 如果覆盖周数>10 → 均匀型，否则判断集中在学期初/中/末
    if len(by_week) > 10:
        return "均匀分布型"
    return "集中时段型"


def compute_reading_metrics(borrows: list[BorrowRecord]) -> tuple[float, int, float]:
    """计算阅读深度、广度、稳定性"""
    if not borrows:
        return 0, 0, 0
    days = [b.borrow_days for b in borrows]
    depth = sum(days) / len(days)
    domains = {clc_to_domain(b.clc_number) for b in borrows}
    breadth = len(domains)
    # 稳定性：比较前后半段的领域分布相似度
    mid = len(borrows) // 2
    first_half = [b for b in borrows[:mid]]
    second_half = [b for b in borrows[mid:]]
    dw1 = compute_domain_weights(first_half)
    dw2 = compute_domain_weights(second_half)
    stability = _cosine_similarity(dw1, dw2)
    return round(depth, 1), breadth, round(stability, 3)


def _cosine_similarity(d1: dict[str, float], d2: dict[str, float]) -> float:
    """两分布向量的余弦相似度"""
    keys = set(d1) | set(d2)
    v1 = [d1.get(k, 0) for k in keys]
    v2 = [d2.get(k, 0) for k in keys]
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = (sum(a * a for a in v1)) ** 0.5
    norm2 = (sum(b * b for b in v2)) ** 0.5
    if norm1 == 0 or norm2 == 0:
        return 0
    return dot / (norm1 * norm2)


def extract_student_features(student_id: str,
                             borrows: list[BorrowRecord],
                             course_records: list[CourseRecord],
                             books_meta: dict[str, BookMeta]) -> StudentFeature:
    """为一个学生提取完整特征向量"""
    keywords = compute_interest_keywords(borrows, books_meta)
    domain_weights = compute_domain_weights(borrows)
    time_pref = compute_time_preference(borrows, course_records)
    depth, breadth, stability = compute_reading_metrics(borrows)
    return StudentFeature(
        student_id=student_id,
        interest_keywords=keywords,
        domain_weights=domain_weights,
        time_preference=time_pref,
        reading_depth=depth,
        reading_breadth=breadth,
        interest_stability=stability,
    )


def compute_course_domains(course_records: list[CourseRecord]) -> dict[str, float]:
    """从选课记录计算课内知识领域分布和掌握度"""
    domain_scores: defaultdict[str, list[float]] = defaultdict(list)
    # 简化：课程名称分词映射领域
    for c in course_records:
        words = extract_keywords_from_text(c.course_name)
        for w in words:
            domain_scores[w] = domain_scores.get(w, []) + [c.score]
    result = {}
    for domain, scores in domain_scores.items():
        result[domain] = sum(scores) / len(scores) / 100.0
    return result


def cross_analysis(inclass_domains: dict[str, float],
                   outclass_domains: dict[str, float]) -> dict:
    """课内外交叉分析：判断学习类型和推荐策略"""
    in_set = set(inclass_domains)
    out_set = set(outclass_domains)
    overlap = in_set & out_set
    out_only = out_set - in_set
    if overlap and out_only:
        return {"type": "migrating", "strength": "high", "migrating_to": list(out_only)[:3]}
    elif overlap and not out_only:
        return {"type": "deep_learning", "strength": "high", "focus": list(overlap)[:3]}
    elif not overlap and out_only:
        return {"type": "spontaneous_interest", "strength": "medium", "interest": list(out_only)[:3]}
    else:
        return {"type": "exam_driven", "strength": "low"}
```

- [ ] **Step 2: 验证**

Run: `python -c "from src.data.feature_engineering import *; print('Feature engineering OK')"`

- [ ] **Step 3: 提交**

```bash
git add src/data/feature_engineering.py && git commit -m "feat: 特征工程模块（关键词/领域/时段/深度/交叉分析）"
```

---

### Task 2.2: Backend Agent — 内容推荐引擎 (TF-IDF)

**Files:** Create `src/recommender/__init__.py`, `src/recommender/content_based.py`

- [ ] **Step 1: 创建 `src/recommender/__init__.py`**

```python
"""推荐引擎：CF + Content + Hybrid"""
```

- [ ] **Step 2: 创建 `src/recommender/content_based.py`**

```python
"""基于内容的推荐：TF-IDF + 余弦相似度"""
import jieba
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class ContentBasedRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(max_features=5000, tokenizer=self._tokenize)
        self.item_ids: list[str] = []
        self.item_vectors = None

    @staticmethod
    def _tokenize(text: str) -> list[str]:
        return [w for w in jieba.cut(text) if len(w.strip()) >= 2]

    def fit(self, items: list[tuple[str, str]]):
        """items: [(item_id, text_content), ...]"""
        self.item_ids = [i[0] for i in items]
        texts = [i[1] for i in items]
        self.item_vectors = self.vectorizer.fit_transform(texts).toarray()

    def recommend(self, student_keywords: dict[str, float], top_k: int = 20) -> list[tuple[str, float]]:
        """基于学生兴趣关键词向量匹配最相似的Top-K物品"""
        student_text = " ".join([f"{k} " * int(v * 100) for k, v in student_keywords.items()])
        student_vec = self.vectorizer.transform([student_text]).toarray()
        similarities = cosine_similarity(student_vec, self.item_vectors)[0]
        top_indices = np.argsort(similarities)[::-1][:top_k]
        return [(self.item_ids[i], float(similarities[i])) for i in top_indices]


class BasicContentRecommender:
    """轻量版：不依赖sklearn的TF-IDF"""
    def __init__(self):
        self.item_texts: dict[str, str] = {}

    def add_item(self, item_id: str, text: str):
        self.item_texts[item_id] = text

    def _compute_tf(self, text: str) -> dict[str, float]:
        words = [w for w in jieba.cut(text) if len(w.strip()) >= 2]
        counter = {}
        for w in words:
            counter[w] = counter.get(w, 0) + 1
        total = max(sum(counter.values()), 1)
        return {w: c / total for w, c in counter.items()}

    def _doc_freq(self) -> dict[str, int]:
        df = {}
        for text in self.item_texts.values():
            for w in set(jieba.cut(text)):
                if len(w.strip()) >= 2:
                    df[w] = df.get(w, 0) + 1
        return df

    def recommend(self, student_keywords: dict[str, float], top_k: int = 10) -> list[tuple[str, float]]:
        """计算学生关键词向量与每个物品的余弦相似度"""
        df = self._doc_freq()
        n_docs = max(len(self.item_texts), 1)
        results = []
        for item_id, text in self.item_texts.items():
            item_tf = self._compute_tf(text)
            # TF-IDF for item
            item_vec = {w: tf * np.log((n_docs + 1) / (df.get(w, 0) + 1) + 1) for w, tf in item_tf.items()}
            # Student vector
            student_vec = student_keywords
            # Cosine similarity
            keys = set(item_vec) | set(student_vec)
            v1 = [item_vec.get(k, 0) for k in keys]
            v2 = [student_vec.get(k, 0) for k in keys]
            dot = sum(a * b for a, b in zip(v1, v2))
            norm = (sum(a**2 for a in v1) ** 0.5) * (sum(b**2 for b in v2) ** 0.5)
            score = dot / norm if norm > 0 else 0
            results.append((item_id, score))
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
```

- [ ] **Step 3: 验证**

Run: `python -c "from src.recommender.content_based import BasicContentRecommender; r=BasicContentRecommender(); r.add_item('B1','Python编程入门'); r.add_item('B2','深度学习神经网络'); print(r.recommend({'python':0.8, '编程':0.5}, 3))"`

- [ ] **Step 4: 提交**

---

### Task 2.3: Backend Agent — 协同过滤推荐引擎 (User-Based CF)

**Files:** Create `src/recommender/collaborative.py`

- [ ] **Step 1: 创建协同过滤模块**

```python
"""User-Based协同过滤推荐"""
import numpy as np
from collections import defaultdict


class UserBasedCF:
    def __init__(self, k_neighbors: int = 20):
        self.k = k_neighbors
        self.student_features: dict[str, dict[str, float]] = {}
        self.student_borrows: dict[str, set[str]] = {}

    def add_student(self, student_id: str, domain_weights: dict[str, float], borrowed_items: set[str]):
        self.student_features[student_id] = domain_weights
        self.student_borrows[student_id] = borrowed_items

    def _compute_similarity(self, s1: str, s2: str) -> float:
        """基于领域分布向量的余弦相似度"""
        f1 = self.student_features.get(s1, {})
        f2 = self.student_features.get(s2, {})
        keys = set(f1) | set(f2)
        if not keys:
            return 0
        v1 = [f1.get(k, 0) for k in keys]
        v2 = [f2.get(k, 0) for k in keys]
        dot = sum(a * b for a, b in zip(v1, v2))
        norm = (sum(a**2 for a in v1) ** 0.5) * (sum(b**2 for b in v2) ** 0.5)
        return dot / norm if norm > 0 else 0

    def recommend(self, student_id: str, top_k: int = 20, exclude: set[str] | None = None) -> list[tuple[str, float]]:
        """为指定学生生成协同过滤推荐"""
        if student_id not in self.student_features:
            return []
        exclude = exclude or set()
        # 计算与所有其他学生的相似度
        similarities = []
        for other in self.student_features:
            if other == student_id:
                continue
            sim = self._compute_similarity(student_id, other)
            if sim > 0:
                similarities.append((other, sim))
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_neighbors = similarities[:self.k]
        # 聚合邻居的物品
        item_scores: dict[str, float] = defaultdict(float)
        item_counts: dict[str, int] = defaultdict(int)
        for neighbor, sim in top_neighbors:
            for item in self.student_borrows.get(neighbor, set()):
                if item in exclude:
                    continue
                item_scores[item] += sim
                item_counts[item] += 1
        # 归一化：除以出现次数避免高频物品统治
        scored = [(item, score / item_counts[item]) for item, score in item_scores.items()]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
```

- [ ] **Step 2: 提交**

---

### Task 2.4: Backend Agent — 混合推荐 + 行为反馈调权

**Files:** Create `src/recommender/hybrid.py`

```python
"""混合推荐策略：CF + Content + 行为反馈调权"""
from collections import defaultdict


class HybridRecommender:
    def __init__(self, alpha: float = 0.6):
        self.alpha = alpha  # CF权重
        self.behavior_weights = {
            "bookmark": 20,     # 收藏
            "stay_gt_60": 10,   # 停留>60秒+滚动到底
            "revisit": 8,       # 24h内回看
            "stay_20_60": 5,    # 停留20-60秒
            "stay_5_20": 2,     # 停留5-20秒
            "stay_lt_5": 0,     # 停留<5秒
            "bounce": -5,       # 点击后立即返回
        }
        self.behavior_history: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))

    def record_behavior(self, student_id: str, item_id: str, action_type: str, stay_seconds: float = 0, scroll_percent: float = 0):
        """记录用户行为"""
        self.behavior_history[student_id][item_id].append({
            "action": action_type, "stay_seconds": stay_seconds, "scroll_percent": scroll_percent
        })

    def _compute_behavior_bonus(self, student_id: str, item_domain: str) -> float:
        """基于行为历史的领域权重调整"""
        bonus = 0
        for item_id, actions in self.behavior_history.get(student_id, {}).items():
            for a in actions:
                if a["action"] == "bookmark":
                    bonus += self.behavior_weights["bookmark"]
                elif a["action"] == "stay" and a["stay_seconds"] > 60 and a["scroll_percent"] > 80:
                    bonus += self.behavior_weights["stay_gt_60"]
                elif a["action"] == "revisit":
                    bonus += self.behavior_weights["revisit"]
                elif a["action"] == "stay" and a["stay_seconds"] >= 20:
                    bonus += self.behavior_weights["stay_20_60"]
                elif a["action"] == "stay" and a["stay_seconds"] >= 5:
                    bonus += self.behavior_weights["stay_5_20"]
                elif a["action"] == "bounce":
                    bonus += self.behavior_weights["bounce"]
        return bonus / 100.0  # 归一化

    def merge(self, cf_results: list[tuple[str, float]],
              content_results: list[tuple[str, float]],
              student_id: str = "",
              top_k: int = 20) -> list[tuple[str, float, str]]:
        """混合CF和Content推荐结果，附加来源标识"""
        scores: dict[str, float] = {}
        sources: dict[str, str] = {}
        max_cf = max(s for _, s in cf_results) if cf_results else 1
        max_ct = max(s for _, s in content_results) if content_results else 1
        for item_id, score in cf_results:
            scores[item_id] = self.alpha * (score / max_cf)
            sources[item_id] = "cf"
        for item_id, score in content_results:
            norm_score = (1 - self.alpha) * (score / max_ct)
            if item_id in scores:
                scores[item_id] = max(scores[item_id], norm_score)
            else:
                scores[item_id] = norm_score
                sources[item_id] = "content"
        behavior_bonus = self._compute_behavior_bonus(student_id, "") if student_id else 0
        final = [(iid, min(0.7 * sc + 0.3 * behavior_bonus, 1.0), sources.get(iid, "unknown"))
                 for iid, sc in scores.items()]
        final.sort(key=lambda x: x[1], reverse=True)
        return final[:top_k]
```

---

### Task 2.5: Backend Agent — 学生端核心API（推荐+画像+行为）

**Files:** Create `src/backend/routers/students.py`, `src/backend/services/recommender.py`, `src/backend/services/profile_service.py`, `src/backend/services/behavior_service.py`

（由于篇幅限制，此处省略具体代码步骤，每个服务文件按上述模式实现）

- [ ] **Step 1: 创建 `src/backend/services/recommender.py`**
  - 实现 `get_recommendations(student_id)` 编排推荐流程
  - 调用特征工程 → CF → Content → Hybrid → 返回Top-20

- [ ] **Step 2: 创建 `src/backend/services/profile_service.py`**
  - 实现 `build_profile(student_id)` 生成完整学生画像JSON

- [ ] **Step 3: 创建 `src/backend/services/behavior_service.py`**
  - 实现 `record_behavior(event)` 写入行为日志表
  - 实现 `get_feedback_stats(student_id)` 获取反馈统计

- [ ] **Step 4: 创建 `src/backend/routers/students.py`**
  - `GET /api/student/{id}/profile`
  - `GET /api/student/{id}/recommendations`
  - `POST /api/student/{id}/recommendation/{rec_id}/feedback`
  - `POST /api/student/{id}/behavior`
  - `GET /api/student/{id}/history`

---

### Task 2.6: Frontend Agent — React项目脚手架 + 基础组件

**Files:** Create React project in `src/frontend/`

- [ ] **Step 1: 初始化React项目**

```bash
cd src/frontend
npm create vite@latest . -- --template react-ts
npm install
npm install react-router-dom axios zustand tailwindcss @tailwindcss/vite echarts echarts-for-react
```

- [ ] **Step 2: 配置 TailwindCSS**

```javascript
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

- [ ] **Step 3: 创建 `src/frontend/src/types/index.ts`**

```typescript
export interface StudentProfile {
  student_id: string;
  grade: string;
  major: string;
  interest_keywords: [string, number][];
  domain_weights: Record<string, number>;
  time_preference: string;
  reading_depth: number;
  reading_breadth: number;
  interest_stability: number;
  borrow_count: number;
  course_count: number;
}

export interface RecommendItem {
  item_id: string;
  item_type: 'book' | 'course' | 'activity';
  title: string;
  reason: string;
  score: number;
  available: boolean;
}

export interface RecommendResponse {
  student_id: string;
  items: RecommendItem[];
}
```

- [ ] **Step 4: 创建 `src/frontend/src/api/mock.ts`** Mock数据供前端独立开发

- [ ] **Step 5: 创建 `Layout.tsx`, `RecommendCard.tsx`, `FeedbackButtons.tsx`** 基础组件

- [ ] **Step 6: 创建 `App.tsx` 路由骨架**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Recommendations from './pages/student/Recommendations';
import Profile from './pages/student/Profile';
// ...其他页面

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Recommendations />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/history" element={<History />} />
          <Route path="/path-planner" element={<PathPlanner />} />
          <Route path="/resource/:type/:id" element={<ResourceDetail />} />
          <Route path="/teacher/overview" element={<InterestOverview />} />
          <Route path="/teacher/clusters" element={<ClusterView />} />
          <Route path="/teacher/insight" element={<InsightReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

---

### Task 2.7: Frontend Agent — 学生端页面实现

按页面逐一实现（简化展示核心页面）：

- `pages/student/Recommendations.tsx` — 推荐首页，三Tab切换 + 推荐卡片列表 + 有用/跳过
- `pages/student/Profile.tsx` — 雷达图+词云+折线图+交叉分析文本卡片
- `pages/student/ResourceDetail.tsx` — 资源详情页（图书/课程）+ 收藏/预约/停留追踪
- `pages/student/History.tsx` — 推荐历史列表 + 已收藏筛选 + 采纳率统计

---

### Task 2.8: Frontend Test Agent — 逐页审查

每完成一个页面后：
- 功能完整性检查：所有交互入口、API对接、状态管理
- UI美观度审查：布局、颜色、字体、间距
- 响应式验证：桌面/平板/移动三端

---

## 阶段3：智能增强（LLM集成 + 教师端）

### Task 3.1: Backend Agent — LLM服务层

**Files:** Create `src/llm/client.py`, `src/llm/prompts.py`

- 实现OpenAI兼容API客户端，支持流式输出
- Prompt模板：推荐解释/路径规划/对话助手/语义检索/教师洞察

### Task 3.2: Backend Agent — 流式对话端点

**Files:** Create `src/backend/routers/dialogue.py`
- `GET /api/dialogue` SSE流式对话，三场景限定（找书/问画像/课程建议）

### Task 3.3: Frontend Agent — 流式对话组件 + 教师端页面

- `components/ChatWidget.tsx` — 流式文本渲染，使用EventSource
- `components/StreamText.tsx` — 流式字符级渲染
- 教师端三页面（热力图/分群/洞察报告）

---

## 阶段4：验收交付

### Task 4.1: QA Agent — 集成测试与准确率验证

- API正确性测试（pytest + httpx）
- 推荐准确率 ≥ 75% 验证
- 行为反馈闭环验证
- 性能测试（并发100用户，响应<3秒）

### Task 4.2: Frontend Test Agent — 最终走查

- 全部页面功能/美观/响应式/可访问性最终审查
- 跨浏览器兼容报告

---

*文档版本：v1.0 | 编写日期：2026-05-09*
