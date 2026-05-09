"""图书资源端点"""
from fastapi import APIRouter
from ..database import SessionLocal
from ..models import Book, BorrowRecord

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


@router.get("/{book_id}/related")
def get_related_books(book_id: str, limit: int = 5):
    """返回借了这本书的人也借了的关联图书"""
    db = SessionLocal()
    try:
        # Find students who borrowed this book
        borrower_ids = set(
            r.student_id for r in
            db.query(BorrowRecord).filter(BorrowRecord.book_id == book_id).all()
        )
        if not borrower_ids:
            return {"related": []}
        # Find other books those students borrowed
        from collections import Counter
        related_counter = Counter()
        for sid in borrower_ids:
            other_books = db.query(BorrowRecord).filter(
                BorrowRecord.student_id == sid,
                BorrowRecord.book_id != book_id
            ).all()
            for b in other_books:
                related_counter[b.book_id] += 1
        # Get top related book details
        related = []
        for bid, count in related_counter.most_common(limit):
            book = db.query(Book).filter(Book.book_id == bid).first()
            if book:
                related.append({
                    "book_id": book.book_id, "title": book.title,
                    "author": book.author, "borrow_count": count,
                })
        return {"related": related}
    finally:
        db.close()
