"""数据清洗：缺失值处理、异常值检测、去重"""
from .models import BorrowRecord, CourseRecord, Student


def clean_borrow_records(records: list[BorrowRecord]) -> list[BorrowRecord]:
    """清洗借阅记录：去除异常时长(>365天或<=0天)、去重"""
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
        "no_data_students": total - len(borrow_sids | course_sids),
    }
