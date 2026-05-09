"""冷启动推荐策略"""
from collections import Counter


def popular_by_major(major: str, all_borrows: list, top_k: int = 20) -> list[str]:
    """同专业热门借阅"""
    from ..data.domain_mapping import clc_to_domain
    major_borrows = [b for b in all_borrows if hasattr(b, 'major') and b.major == major]
    counter = Counter(b.book_id for b in major_borrows)
    return [item for item, _ in counter.most_common(top_k)]


def popular_by_grade(grade: str, all_borrows: list, top_k: int = 20) -> list[str]:
    """同年级热门借阅"""
    counter = Counter(b.book_id for b in all_borrows if hasattr(b, 'grade') and b.grade == grade)
    return [item for item, _ in counter.most_common(top_k)]


def new_book_recommend(new_book_id: str, book_text: str, student_features: list) -> list[str]:
    """新书上架：基于内容匹配推给潜在感兴趣的学生"""
    from .content_based import BasicContentRecommender
    r = BasicContentRecommender()
    r.add_item(new_book_id, book_text)
    interested = []
    for sf in student_features:
        results = r.recommend(sf.interest_keywords, top_k=1)
        if results and results[0][1] > 0.3:
            interested.append(sf.student_id)
    return interested[:50]
