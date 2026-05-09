"""数据导入：从CSV读取数据并转换为DataClass对象"""
import csv
from datetime import date
from pathlib import Path
from .models import Student, BorrowRecord, CourseRecord, BookMeta, CourseMeta


def _parse_date(s: str) -> date:
    return date.fromisoformat(s)


def import_students(filepath: str | Path) -> list[Student]:
    """导入学生基本信息CSV"""
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [Student(
            student_id=row["student_id"],
            grade=row["grade"],
            major=row["major"],
            gender=row.get("gender"),
        ) for row in reader]


def import_borrow_records(filepath: str | Path) -> list[BorrowRecord]:
    """导入借阅记录CSV"""
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


def import_course_records(filepath: str | Path) -> list[CourseRecord]:
    """导入选课成绩记录CSV"""
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


def import_book_meta(filepath: str | Path) -> list[BookMeta]:
    """导入馆藏书目元数据CSV"""
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
