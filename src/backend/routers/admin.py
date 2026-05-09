"""管理端：数据导入与系统状态"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Book, BorrowRecord, CourseRecord

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
