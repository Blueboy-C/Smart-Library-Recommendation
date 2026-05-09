"""Academic administration system API routes."""

from fastapi import APIRouter, Query, HTTPException
from ..data_store import (
    get_all_students,
    get_student,
    get_course_catalog,
    get_course_records,
)

router = APIRouter(prefix="/api/academic", tags=["academic"])


@router.get("/students")
def list_students(
    grade: int = Query(None, description="Filter by grade (e.g. 2022)"),
    major: str = Query(None, description="Filter by major name"),
):
    """Return all students, optionally filtered by grade and/or major."""
    students = get_all_students()
    if grade is not None:
        students = [s for s in students if s["grade"] == grade]
    if major:
        students = [s for s in students if s["major"] == major]
    return {
        "total": len(students),
        "items": students,
    }


@router.get("/students/{student_id}")
def get_student_info(student_id: str):
    """Return detailed info for a single student."""
    student = get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
    return student


@router.get("/courses")
def list_courses(
    college: str = Query(None, description="Filter by college"),
    type: str = Query(None, alias="type", description="Filter by type (必修/选修)"),
):
    """Return course catalog, optionally filtered."""
    courses = get_course_catalog()
    if college:
        courses = [c for c in courses if c["college"] == college]
    if type:
        courses = [c for c in courses if c["type"] == type]
    return {
        "total": len(courses),
        "items": courses,
    }


@router.get("/course-records")
def list_course_records(
    student_id: str = Query(None, description="Filter by student ID"),
):
    """Return course enrollment and grade records."""
    records = get_course_records(student_id=student_id)
    if not records:
        return {"total": 0, "items": []}
    # Compute summary stats per student
    if student_id:
        scores = [r["score"] for r in records]
        avg_score = round(sum(scores) / len(scores), 1) if scores else 0
        total_credits = sum(r["credits"] for r in records if r["pass_status"] == "及格")
        return {
            "total": len(records),
            "average_score": avg_score,
            "total_credits_earned": total_credits,
            "items": records,
        }
    return {
        "total": len(records),
        "items": records,
    }
