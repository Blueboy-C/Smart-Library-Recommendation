"""特征工程：从借阅和成绩数据中提取学生特征向量"""
import jieba
from collections import Counter, defaultdict
from .models import BorrowRecord, CourseRecord, BookMeta, StudentFeature
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
    total = sum(counter.values()) or 1
    return {w: c / total for w, c in counter.most_common(50)}


def compute_domain_weights(borrows: list[BorrowRecord]) -> dict[str, float]:
    """计算知识领域分布权重"""
    counter: Counter = Counter()
    for b in borrows:
        domain = clc_to_domain(b.clc_number)
        counter[domain] += 1
    total = sum(counter.values()) or 1
    return {d: c / total for d, c in counter.items()}


def compute_time_preference(borrows: list[BorrowRecord]) -> str:
    """识别学习时段偏好"""
    from collections import Counter as Ctr
    by_week = Ctr([b.borrow_date.isocalendar()[1] for b in borrows])
    return "均匀分布型" if len(by_week) > 10 else "集中时段型"


def compute_reading_metrics(borrows: list[BorrowRecord]) -> tuple[float, int, float]:
    """计算阅读深度、广度、稳定性。返回 (depth, breadth, stability)"""
    if not borrows:
        return 0, 0, 0
    days = [b.borrow_days for b in borrows]
    depth = sum(days) / len(days)
    domains = {clc_to_domain(b.clc_number) for b in borrows}
    breadth = len(domains)
    mid = len(borrows) // 2
    first = borrows[:mid] if mid > 0 else borrows
    second = borrows[mid:] if mid > 0 else borrows
    dw1 = compute_domain_weights(first)
    dw2 = compute_domain_weights(second)
    stability = _cosine_similarity(dw1, dw2)
    return round(depth, 1), breadth, round(stability, 3)


def _cosine_similarity(d1: dict[str, float], d2: dict[str, float]) -> float:
    keys = set(d1) | set(d2)
    v1 = [d1.get(k, 0) for k in keys]
    v2 = [d2.get(k, 0) for k in keys]
    dot = sum(a * b for a, b in zip(v1, v2))
    norm1 = (sum(a**2 for a in v1)) ** 0.5
    norm2 = (sum(b**2 for b in v2)) ** 0.5
    return dot / (norm1 * norm2) if norm1 > 0 and norm2 > 0 else 0


def extract_student_features(student_id: str, borrows: list[BorrowRecord],
                             course_records: list[CourseRecord],
                             books_meta: dict[str, BookMeta]) -> StudentFeature:
    """为一个学生提取完整特征向量"""
    keywords = compute_interest_keywords(borrows, books_meta)
    domain_weights = compute_domain_weights(borrows)
    time_pref = compute_time_preference(borrows)
    depth, breadth, stability = compute_reading_metrics(borrows)
    return StudentFeature(student_id=student_id, interest_keywords=keywords,
                         domain_weights=domain_weights, time_preference=time_pref,
                         reading_depth=depth, reading_breadth=breadth, interest_stability=stability)


def compute_course_domains(course_records: list[CourseRecord]) -> dict[str, float]:
    """从选课记录计算课内知识领域分布和掌握度"""
    from collections import defaultdict
    domain_scores = defaultdict(list)
    for c in course_records:
        words = extract_keywords_from_text(c.course_name)
        for w in words:
            domain_scores[w].append(c.score)
    return {d: sum(s) / len(s) / 100.0 for d, s in domain_scores.items() if s}


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
    return {"type": "exam_driven", "strength": "low"}
