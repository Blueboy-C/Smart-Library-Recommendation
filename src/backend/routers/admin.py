"""管理端：数据导入与系统状态"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Book, BorrowRecord, CourseRecord, BehaviorLog
from ..auth import verify_token
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.post("/import/all")
def import_all(db: Session = Depends(get_db)):
    from pathlib import Path
    from data.importers import (
        import_students,
        import_borrow_records,
        import_book_meta,
        import_course_records,
    )
    from data.cleaners import clean_borrow_records, clean_course_records

    base = str(Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed")
    students = import_students(f"{base}/students.csv")
    for s in students:
        db.merge(
            Student(
                student_id=s.student_id,
                name="",
                grade=s.grade,
                major=s.major,
                gender=s.gender or "",
            )
        )

    books = import_book_meta(f"{base}/books_meta.csv")
    for b in books:
        db.merge(
            Book(
                **{k: v for k, v in b.__dict__.items() if k != "available_copies"}
            )
        )

    borrows = clean_borrow_records(
        import_borrow_records(f"{base}/borrow_records.csv")
    )
    for b in borrows:
        db.add(
            BorrowRecord(
                student_id=b.student_id,
                book_id=b.book_id,
                book_title=b.book_title,
                clc_number=b.clc_number,
                borrow_date=b.borrow_date,
                return_date=b.return_date,
                renew_count=b.renew_count,
            )
        )

    courses = clean_course_records(
        import_course_records(f"{base}/course_records.csv")
    )
    for c in courses:
        db.add(
            CourseRecord(
                student_id=c.student_id,
                course_id=c.course_id,
                course_name=c.course_name,
                course_type=c.course_type,
                college=c.college,
                score=c.score,
                semester=c.semester,
            )
        )

    db.commit()
    return {
        "status": "ok",
        "students": len(students),
        "books": len(books),
        "borrows": len(borrows),
        "courses": len(courses),
    }


@router.post("/import/sync")
def sync_from_external():
    """从外部数据源同步数据"""
    from data.data_sync import sync_all
    result = sync_all()
    return {"status": "ok", **result}


@router.get("/stats")
def get_admin_stats(payload: dict = Depends(verify_token)):
    """管理端统计数据"""
    if payload["role"] not in ("admin", "teacher"):
        raise HTTPException(status_code=403, detail="需要管理员权限")

    from ..database import SessionLocal

    db = SessionLocal()
    try:
        total_students = db.query(Student).count()
        total_borrows = db.query(BorrowRecord).count()
        total_courses = db.query(CourseRecord).count()
        total_books = db.query(Book).count()

        # Today's metrics
        today = datetime.utcnow().date()
        today_start = datetime(today.year, today.month, today.day)
        today_behaviors = db.query(BehaviorLog).filter(
            BehaviorLog.timestamp >= today_start
        ).count()

        # Accuracy calculation: useful / (useful + skip) from behavior logs
        useful_count = db.query(BehaviorLog).filter(
            BehaviorLog.action_type == "useful"
        ).count()
        skip_count = db.query(BehaviorLog).filter(
            BehaviorLog.action_type == "skip"
        ).count()
        total_feedback = useful_count + skip_count
        accuracy = round(useful_count / total_feedback * 100, 1) if total_feedback > 0 else 0

        return {
            "total_students": total_students,
            "total_borrows": total_borrows,
            "total_courses": total_courses,
            "total_books": total_books,
            "today_recommendations": today_behaviors,
            "useful_count": useful_count,
            "skip_count": skip_count,
            "accuracy": accuracy,
            "model_status": "running",
            "last_update": str(today),
        }
    finally:
        db.close()


@router.post("/model/update")
def trigger_model_update(payload: dict = Depends(verify_token)):
    """触发模型全量更新"""
    if payload["role"] != "admin":
        raise HTTPException(status_code=403, detail="需要管理员权限")

    # Re-sync data from external source
    from data.data_sync import sync_all
    result = sync_all()

    # Log the update
    import logging
    logger = logging.getLogger("smart_library")
    logger.info(f"Model update triggered by {payload.get('sub')}: {result}")

    return {"status": "ok", "message": "模型已更新", "result": result}
