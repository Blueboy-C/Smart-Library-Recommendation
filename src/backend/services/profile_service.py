"""学生画像构建服务"""
import datetime
from pathlib import Path
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Student as StudentORM, BorrowRecord as BorrowRecordORM, CourseRecord as CourseRecordORM
from data.feature_engineering import extract_student_features, compute_course_domains, cross_analysis
from data.importers import import_book_meta
from data.models import StudentFeature, BorrowRecord as BorrowRecordData, CourseRecord as CourseRecordData


# Resolve paths relative to project root (4 levels up from this file: services/backend/src/project_root)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
_DATA_PROCESSED = _PROJECT_ROOT / "data" / "processed"

_book_cache: dict[str, any] = {}

def _load_books() -> dict[str, any]:
    global _book_cache
    if not _book_cache:
        books = import_book_meta(str(_DATA_PROCESSED / "books_meta.csv"))
        _book_cache = {b.book_id: b for b in books}
    return _book_cache


def build_profile(student_id: str) -> dict:
    """构建完整学生画像"""
    db = SessionLocal()
    try:
        student = db.query(StudentORM).filter(StudentORM.student_id == student_id).first()
        if not student:
            return {}

        borrow_records = db.query(BorrowRecordORM).filter(BorrowRecordORM.student_id == student_id).all()
        course_records = db.query(CourseRecordORM).filter(CourseRecordORM.student_id == student_id).all()

        # Convert ORM models to data-layer dataclass models
        borrow_models = [
            BorrowRecordData(
                student_id=b.student_id, book_id=b.book_id, book_title=b.book_title,
                clc_number=b.clc_number, author="", publisher="",
                borrow_date=b.borrow_date if isinstance(b.borrow_date, datetime.date) else b.borrow_date,
                return_date=b.return_date if isinstance(b.return_date, datetime.date) else b.return_date,
                renew_count=b.renew_count,
            )
            for b in borrow_records
        ]
        course_models = [
            CourseRecordData(
                student_id=c.student_id, course_id=c.course_id, course_name=c.course_name,
                course_type=c.course_type, college=c.college, score=c.score, semester=c.semester,
            )
            for c in course_records
        ]

        books = _load_books()
        feature = extract_student_features(student_id, borrow_models, course_models, books)
        inclass = compute_course_domains(course_models)
        analysis = cross_analysis(inclass, feature.domain_weights)

        return {
            "student_id": student_id,
            "grade": student.grade,
            "major": student.major,
            "interest_keywords": sorted(feature.interest_keywords.items(), key=lambda x: x[1], reverse=True)[:20],
            "domain_weights": feature.domain_weights,
            "time_preference": feature.time_preference,
            "reading_depth": feature.reading_depth,
            "reading_breadth": feature.reading_breadth,
            "interest_stability": feature.interest_stability,
            "borrow_count": len(borrow_records),
            "course_count": len(course_records),
            "cross_domain_signal": analysis["type"] in ("migrating", "spontaneous_interest"),
            "analysis": analysis,
        }
    finally:
        db.close()
