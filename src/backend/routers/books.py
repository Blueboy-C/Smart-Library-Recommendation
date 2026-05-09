"""图书资源端点"""
from fastapi import APIRouter
from ..database import SessionLocal
from ..models import Book

router = APIRouter(prefix="/api/books", tags=["books"])

@router.get("/{book_id}")
def get_book(book_id: str):
    db = SessionLocal()
    book = db.query(Book).filter(Book.book_id == book_id).first()
    db.close()
    if not book:
        return {}
    return {
        "book_id": book.book_id, "title": book.title, "author": book.author,
        "publisher": book.publisher, "publish_year": book.publish_year,
        "clc_number": book.clc_number, "summary": book.summary,
        "total_copies": book.total_copies, "available_copies": book.available_copies,
    }
