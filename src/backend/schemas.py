"""Pydantic 数据模型（API 请求/响应）"""
from pydantic import BaseModel
from datetime import datetime


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
    borrow_count: int = 0
    course_count: int = 0
    cross_domain_signal: bool = False


class RecommendItem(BaseModel):
    item_id: str
    item_type: str
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
    action_type: str
    source: str = "recommend"
    stay_seconds: float = 0
    scroll_percent: float = 0


class FeedbackEvent(BaseModel):
    student_id: str
    item_id: str
    feedback_type: str


class PathPlanRequest(BaseModel):
    student_id: str
    goal: str


class PathPlanResponse(BaseModel):
    steps: list[dict]


class SearchQuery(BaseModel):
    query: str
    student_id: str = ""


class InsightRequest(BaseModel):
    dept: str = ""
    grade: str = ""
