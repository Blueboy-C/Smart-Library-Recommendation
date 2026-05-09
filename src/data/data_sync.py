"""从外部数据源同步数据到主系统"""
import requests
from backend.database import SessionLocal, init_db
from backend.models import Student, Book, BorrowRecord, CourseRecord


EXTERNAL_API = "http://localhost:8001/api"


def _clc(b: dict) -> str:
    """Handle both clc_number and classification field names."""
    return b.get("clc_number") or b.get("classification") or ""


def sync_students():
    resp = requests.get(f"{EXTERNAL_API}/academic/students")
    students = resp.json()["items"]
    db = SessionLocal()
    for s in students:
        db.merge(Student(
            student_id=s["student_id"],
            name=s.get("name", ""),
            grade=str(s.get("grade", "")),
            major=s.get("major", ""),
            gender=s.get("gender", ""),
        ))
    db.commit()
    db.close()
    return len(students)


def sync_books():
    resp = requests.get(f"{EXTERNAL_API}/library/books")
    books = resp.json()["items"]
    db = SessionLocal()
    for b in books:
        db.merge(Book(
            book_id=b["book_id"],
            title=b["title"],
            author=b.get("author", ""),
            publisher=b.get("publisher", ""),
            publish_year=b.get("publish_year", 0),
            clc_number=_clc(b),
            summary=b.get("summary", ""),
            total_copies=b.get("total_copies", 5),
            available_copies=b.get("available_copies", 3),
        ))
    db.commit()
    db.close()
    return len(books)


def sync_borrow_records():
    resp = requests.get(f"{EXTERNAL_API}/library/borrow-records?limit=5000")
    records = resp.json()["items"]
    db = SessionLocal()
    count = 0
    for r in records:
        from datetime import date
        return_date_str = r.get("return_date")
        return_date = date.fromisoformat(return_date_str) if return_date_str else date.today()
        clc = _clc(r)
        db.add(BorrowRecord(
            student_id=r["student_id"],
            book_id=r["book_id"],
            book_title=r.get("book_title", ""),
            clc_number=clc,
            borrow_date=date.fromisoformat(r["borrow_date"]),
            return_date=return_date,
            renew_count=r.get("renewal_count") or r.get("renew_count", 0),
        ))
        count += 1
    db.commit()
    db.close()
    return count


def sync_course_records():
    resp = requests.get(f"{EXTERNAL_API}/academic/course-records?limit=10000")
    records = resp.json()["items"]
    db = SessionLocal()
    count = 0
    for r in records:
        db.add(CourseRecord(
            student_id=r["student_id"],
            course_id=r["course_id"],
            course_name=r.get("course_name", ""),
            course_type=r.get("course_type") or r.get("type", ""),
            college=r.get("college", ""),
            score=r.get("score", 0),
            semester=r.get("semester", ""),
        ))
        count += 1
    db.commit()
    db.close()
    return count


def sync_all():
    init_db()
    s = sync_students()
    b = sync_books()
    br = sync_borrow_records()
    cr = sync_course_records()
    return {"students": s, "books": b, "borrows": br, "courses": cr}
