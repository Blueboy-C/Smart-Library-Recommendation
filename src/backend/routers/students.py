"""学生端API路由"""
from fastapi import APIRouter
from ..schemas import StudentProfile, RecommendResponse, BehaviorEvent, FeedbackEvent
from ..services.profile_service import build_profile
from ..services.recommender_service import get_recommendations
from ..services.behavior_service import record_behavior, get_feedback_stats

router = APIRouter(prefix="/api/student", tags=["student"])


@router.get("/{student_id}/profile")
def get_profile(student_id: str):
    return build_profile(student_id)


@router.get("/{student_id}/recommendations")
def get_recs(student_id: str, top_k: int = 20):
    items = get_recommendations(student_id, top_k=top_k)
    return {"student_id": student_id, "items": items}


@router.post("/{student_id}/recommendation/{rec_id}/feedback")
def post_feedback(student_id: str, rec_id: str, feedback: FeedbackEvent):
    record_behavior(student_id, rec_id, feedback.feedback_type, source="recommend")
    return {"status": "ok"}


@router.post("/{student_id}/behavior")
def post_behavior(event: BehaviorEvent):
    record_behavior(event.student_id, event.item_id, event.action_type,
                    source=event.source, stay_seconds=event.stay_seconds,
                    scroll_percent=event.scroll_percent)
    return {"status": "ok"}


@router.get("/{student_id}/history")
def get_history(student_id: str):
    """返回推荐历史（含反馈统计）"""
    profile = build_profile(student_id)
    stats = get_feedback_stats(student_id)
    recs = get_recommendations(student_id, top_k=10)
    return {"student_id": student_id, "stats": stats, "current_recommendations": recs}
