"""教师端API端点"""
from fastapi import APIRouter
from ..schemas import InsightRequest
from ..services.profile_service import build_profile
from ...llm.client import get_llm_client
from ...llm.prompts import TEACHER_INSIGHT

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


@router.get("/{dept}/heatmap")
def get_heatmap(dept: str = "", grade: str = ""):
    """返回知识领域热力图数据（所有学生的领域分布聚合）"""
    from ..database import SessionLocal
    from ..models import Student, BorrowRecord
    from collections import Counter
    from ...data.domain_mapping import clc_to_domain

    db = SessionLocal()
    try:
        query = db.query(Student)
        if dept:
            query = query.filter(Student.major.like(f'%{dept}%'))
        if grade:
            query = query.filter(Student.grade == grade)
        students = query.all()

        heatmap = []
        for s in students[:100]:  # 限制100人以控制响应大小
            borrows = db.query(BorrowRecord).filter(BorrowRecord.student_id == s.student_id).all()
            domain_counts = Counter()
            for b in borrows:
                domain_counts[clc_to_domain(b.clc_number)] += 1
            for domain, count in domain_counts.items():
                heatmap.append({"domain": domain, "count": count, "grade": s.grade, "major": s.major})
        return {"data": heatmap}
    finally:
        db.close()


@router.get("/{dept}/clusters")
def get_clusters(dept: str = "", grade: str = ""):
    """返回学生行为分群数据（简化版：按阅读深度和广度分群）"""
    from ..database import SessionLocal
    from ..models import Student, BorrowRecord
    from ...data.domain_mapping import clc_to_domain

    db = SessionLocal()
    try:
        query = db.query(Student)
        if dept:
            query = query.filter(Student.major.like(f'%{dept}%'))
        if grade:
            query = query.filter(Student.grade == grade)
        students = query.all()

        clusters = {"deep_readers": [], "broad_explorers": [], "exam_driven": [], "dormant": []}
        for s in students[:50]:
            borrows = db.query(BorrowRecord).filter(BorrowRecord.student_id == s.student_id).all()
            count = len(borrows)
            days = [b.return_date and (b.return_date - b.borrow_date).days or 0 for b in borrows]
            avg_days = sum(days) / len(days) if days else 0
            domains = len({clc_to_domain(b.clc_number) for b in borrows})

            if count == 0:
                clusters["dormant"].append({"student_id": s.student_id, "grade": s.grade, "major": s.major})
            elif avg_days > 20:
                clusters["deep_readers"].append({"student_id": s.student_id, "grade": s.grade, "major": s.major, "avg_days": round(avg_days, 1)})
            elif domains >= 3:
                clusters["broad_explorers"].append({"student_id": s.student_id, "grade": s.grade, "major": s.major, "domains": domains})
            else:
                clusters["exam_driven"].append({"student_id": s.student_id, "grade": s.grade, "major": s.major})
        return {"clusters": {k: len(v) for k, v in clusters.items()}, "details": clusters}
    finally:
        db.close()


@router.post("/{dept}/insight")
async def generate_insight(dept: str = "", request: InsightRequest = InsightRequest()):
    """生成教师洞察报告"""
    from ..database import SessionLocal
    from ..models import BorrowRecord
    from collections import Counter
    from ...data.domain_mapping import clc_to_domain

    db = SessionLocal()
    try:
        borrows = db.query(BorrowRecord).all()
        domain_counts = Counter()
        for b in borrows:
            domain_counts[clc_to_domain(b.clc_number)] += 1
        total = sum(domain_counts.values()) or 1
        summary = "\n".join([f"{d}: {c}次借阅(占比{c/total:.1%})" for d, c in domain_counts.most_common(5)])

        client = get_llm_client()
        prompt = TEACHER_INSIGHT.format(data_summary=f"总借阅次数：{total}次\n领域分布：\n{summary}")
        response = await client.chat(prompt)
        return {"insight": response, "raw_data": {"total_borrows": total, "top_domains": domain_counts.most_common(5)}}
    finally:
        db.close()
