"""用户行为日志服务"""
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import BehaviorLog


def record_behavior(student_id: str, item_id: str, action_type: str,
                    source: str = "recommend", stay_seconds: float = 0,
                    scroll_percent: float = 0):
    db = SessionLocal()
    try:
        log = BehaviorLog(student_id=student_id, item_id=item_id,
                         action_type=action_type, timestamp=datetime.utcnow(),
                         source=source, stay_seconds=stay_seconds,
                         scroll_percent=scroll_percent)
        db.add(log)
        db.commit()
    finally:
        db.close()


def get_feedback_stats(student_id: str) -> dict:
    db = SessionLocal()
    try:
        logs = db.query(BehaviorLog).filter(BehaviorLog.student_id == student_id).all()
        total = len(logs)
        useful = sum(1 for l in logs if l.action_type == "useful")
        skipped = sum(1 for l in logs if l.action_type == "skip")
        return {"total_feedback": total, "useful": useful, "skipped": skipped,
                "adoption_rate": round(useful / total * 100, 1) if total > 0 else 0}
    finally:
        db.close()
