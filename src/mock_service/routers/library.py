"""Library system API routes - simulates an ILS (Integrated Library System)."""

from fastapi import APIRouter, Query, HTTPException
from ..data_store import (
    get_all_books,
    get_book,
    get_borrow_records,
)

router = APIRouter(prefix="/api/library", tags=["library"])


@router.get("/books")
def list_books(keyword: str = Query(None, description="Search keyword in title/author/summary")):
    """Return all books, optionally filtered by keyword."""
    books = get_all_books()
    if keyword:
        kw = keyword.lower()
        books = [
            b for b in books
            if kw in b["title"].lower()
            or kw in b["author"].lower()
            or kw in b["summary"].lower()
        ]
    return {
        "total": len(books),
        "items": books,
    }


@router.get("/books/{book_id}")
def get_book_detail(book_id: str):
    """Return details for a single book."""
    book = get_book(book_id)
    if not book:
        raise HTTPException(status_code=404, detail=f"Book {book_id} not found")
    return book


@router.get("/borrow-records")
def list_borrow_records(
    student_id: str = Query(None, description="Filter by student ID"),
    start: str = Query(None, alias="start", description="Start date (YYYY-MM-DD)"),
    end: str = Query(None, alias="end", description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, ge=1, le=5000, description="Max records to return"),
):
    """Return borrow records with optional filters."""
    records = get_borrow_records(student_id=student_id, start_date=start, end_date=end)
    # Sort by borrow date descending
    records = sorted(records, key=lambda r: r["borrow_date"], reverse=True)
    return {
        "total": len(records),
        "items": records[:limit],
    }


@router.get("/borrow-records/{record_id}")
def get_borrow_record_detail(record_id: int):
    """Return a single borrow record by its ID."""
    all_records = get_borrow_records()
    for r in all_records:
        if r["id"] == record_id:
            return r
    raise HTTPException(status_code=404, detail=f"Borrow record {record_id} not found")
