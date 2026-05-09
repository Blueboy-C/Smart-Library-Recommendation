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
    interest_keywords: dict[str, float] = field(default_factory=dict)  # 关键词→TF-IDF权重
    domain_weights: dict[str, float] = field(default_factory=dict)     # 领域→分布权重
    time_preference: str = ""                 # 活跃时段标签
    reading_depth: float = 0.0                # 阅读深度(借阅时长均值)
    reading_breadth: int = 0                  # 阅读广度(覆盖领域数)
    interest_stability: float = 0.0           # 兴趣稳定性(0-1)
