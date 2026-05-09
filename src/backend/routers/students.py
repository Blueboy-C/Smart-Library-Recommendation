"""学生端API路由"""
from fastapi import APIRouter, HTTPException, Depends
from ..schemas import StudentProfile, RecommendResponse, BehaviorEvent, FeedbackEvent
from ..services.profile_service import build_profile
from ..services.recommender_service import get_recommendations
from ..services.behavior_service import record_behavior, get_feedback_stats
from ..auth import verify_token, get_student_id, mask_student_id

router = APIRouter(prefix="/api/student", tags=["student"])


@router.get("/{student_id}/profile")
def get_profile(student_id: str, payload: dict = Depends(verify_token)):
    # 学生只能查看自己的画像
    if payload["role"] == "student" and student_id != payload.get("student_id", ""):
        raise HTTPException(status_code=403, detail="无权查看其他学生的画像")
    profile = build_profile(student_id)
    if profile and "student_id" in profile:
        profile["student_id"] = mask_student_id(profile["student_id"])
    return profile


@router.get("/{student_id}/recommendations")
def get_recs(student_id: str, top_k: int = 20, payload: dict = Depends(verify_token)):
    if payload["role"] == "student" and student_id != payload.get("student_id", ""):
        raise HTTPException(status_code=403, detail="无权查看其他学生的推荐")
    items = get_recommendations(student_id, top_k=top_k)
    return {"student_id": mask_student_id(student_id), "items": items}


@router.post("/{student_id}/recommendation/{rec_id}/feedback")
def post_feedback(student_id: str, rec_id: str, feedback: FeedbackEvent,
                  payload: dict = Depends(verify_token)):
    # 学生只能提交自己的反馈
    token_sid = payload.get("student_id", "")
    if payload["role"] == "student" and student_id != token_sid:
        raise HTTPException(status_code=403, detail="无权替其他学生提交反馈")
    record_behavior(student_id, rec_id, feedback.feedback_type, source="recommend")
    return {"status": "ok"}


@router.post("/{student_id}/behavior")
def post_behavior(event: BehaviorEvent, payload: dict = Depends(verify_token)):
    # 学生只能记录自己的行为
    token_sid = payload.get("student_id", "")
    if payload["role"] == "student" and event.student_id != token_sid:
        raise HTTPException(status_code=403, detail="无权替其他学生记录行为")
    record_behavior(event.student_id, event.item_id, event.action_type,
                    source=event.source, stay_seconds=event.stay_seconds,
                    scroll_percent=event.scroll_percent)
    return {"status": "ok"}


@router.get("/{student_id}/history")
def get_history(student_id: str, payload: dict = Depends(verify_token)):
    """返回推荐历史（含反馈统计）"""
    if payload["role"] == "student" and student_id != payload.get("student_id", ""):
        raise HTTPException(status_code=403, detail="无权查看其他学生的历史")
    profile = build_profile(student_id)
    stats = get_feedback_stats(student_id)
    recs = get_recommendations(student_id, top_k=10)
    return {"student_id": mask_student_id(student_id), "stats": stats, "current_recommendations": recs}
