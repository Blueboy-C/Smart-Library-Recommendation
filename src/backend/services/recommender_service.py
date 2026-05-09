"""推荐编排服务"""
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Student as StudentORM, BorrowRecord, Book
from .profile_service import build_profile, _load_books
from recommender.content_based import BasicContentRecommender
from recommender.collaborative import UserBasedCF
from recommender.hybrid import HybridRecommender


def get_recommendations(student_id: str, top_k: int = 20, item_type: str = "book") -> list[dict]:
    """为学生生成个性化推荐"""
    db = SessionLocal()
    try:
        student = db.query(StudentORM).filter(StudentORM.student_id == student_id).first()
        if not student:
            return []

        profile = build_profile(student_id)
        if not profile:
            return []

        # Content-based: build item index
        content_rec = BasicContentRecommender()
        books = db.query(Book).all()
        for book in books:
            content_rec.add_item(book.book_id, f"{book.title} {book.summary}")

        ct_results = content_rec.recommend(dict(profile["interest_keywords"]), top_k=top_k * 2)

        # Collaborative: build student-item matrix
        cf = UserBasedCF(k_neighbors=20)
        all_students = db.query(StudentORM).all()
        for s in all_students:
            borrows = db.query(BorrowRecord).filter(BorrowRecord.student_id == s.student_id).all()
            from data.domain_mapping import clc_to_domain
            from collections import Counter
            domain_counter = Counter()
            for b in borrows:
                domain_counter[clc_to_domain(b.clc_number)] += 1
            total = sum(domain_counter.values()) or 1
            domain_weights = {d: c / total for d, c in domain_counter.items()}
            borrowed_items = {b.book_id for b in borrows}
            cf.add_student(s.student_id, domain_weights, borrowed_items)

        borrowed = {b.book_id for b in db.query(BorrowRecord).filter(BorrowRecord.student_id == student_id).all()}
        cf_results = cf.recommend(student_id, top_k=top_k * 2, exclude=borrowed)

        # Hybrid merge
        hybrid = HybridRecommender(alpha=0.6)
        merged = hybrid.merge(cf_results, ct_results, student_id=student_id, top_k=top_k)

        result = []
        book_map = {b.book_id: b for b in books}
        for item_id, score, source in merged:
            book = book_map.get(item_id)
            if book:
                result.append({
                    "item_id": item_id,
                    "item_type": "book",
                    "title": book.title,
                    "reason": _generate_reason(source, profile, book),
                    "score": round(score, 3),
                    "available": book.available_copies > 0,
                })
        return result
    finally:
        db.close()


def _generate_reason(source: str, profile: dict, book) -> str:
    from llm.fallback import fallback_recommendation_reason
    return fallback_recommendation_reason(profile.get("major", ""), book.title, source)
