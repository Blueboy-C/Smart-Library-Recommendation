from src.data.importers import import_students, import_borrow_records, import_course_records, import_book_meta
from src.data.feature_engineering import extract_student_features, compute_interest_keywords, compute_domain_weights, cross_analysis
from src.data.cleaners import clean_borrow_records


def test_extract_features_for_real_data():
    borrows = clean_borrow_records(import_borrow_records("data/processed/borrow_records.csv"))
    courses = import_course_records("data/processed/course_records.csv")
    books = {b.book_id: b for b in import_book_meta("data/processed/books_meta.csv")}

    sid = borrows[0].student_id
    student_borrows = [b for b in borrows if b.student_id == sid]
    student_courses = [c for c in courses if c.student_id == sid]

    feature = extract_student_features(sid, student_borrows, student_courses, books)
    assert feature.student_id == sid
    assert len(feature.interest_keywords) > 0
    assert len(feature.domain_weights) > 0
    print(f"Student {sid}: depth={feature.reading_depth}, breadth={feature.reading_breadth}")
    print(f"Top keywords: {list(feature.interest_keywords.keys())[:5]}")
    print(f"Domains: {feature.domain_weights}")
