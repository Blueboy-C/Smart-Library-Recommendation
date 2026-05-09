"""混合推荐策略：CF + Content + 行为反馈调权"""
import hashlib
from collections import defaultdict


def _item_variance(item_id: str, student_id: str = "") -> float:
    """Deterministic hash-based per-item variance to replace random noise.
    Produces stable scores across refreshes for the same student-item pair."""
    h = hashlib.md5(f"{item_id}:{student_id}".encode()).hexdigest()
    return (int(h[:4], 16) / 65535 - 0.5) * 0.1  # -0.05 to +0.05


class HybridRecommender:
    def __init__(self, alpha: float = 0.5):
        self.alpha = alpha  # CF权重
        self.behavior_history: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))

    def record_behavior(self, student_id: str, item_id: str, action_type: str,
                        stay_seconds: float = 0, scroll_percent: float = 0):
        self.behavior_history[student_id][item_id].append({
            "action": action_type, "stay_seconds": stay_seconds, "scroll_percent": scroll_percent
        })

    def _compute_behavior_bonus(self, student_id: str) -> float:
        weights = {"bookmark": 20, "stay_gt_60": 10, "revisit": 8,
                   "stay_20_60": 5, "stay_5_20": 2, "stay_lt_5": 0, "bounce": -5,
                   "useful": 10, "skip": -8}
        bonus = 0
        for item_id, actions in self.behavior_history.get(student_id, {}).items():
            for a in actions:
                act = a["action"]
                if act == "bookmark":
                    bonus += weights["bookmark"]
                elif act == "stay" and a["stay_seconds"] > 60 and a["scroll_percent"] > 80:
                    bonus += weights["stay_gt_60"]
                elif act == "revisit":
                    bonus += weights["revisit"]
                elif act == "stay" and a["stay_seconds"] >= 20:
                    bonus += weights["stay_20_60"]
                elif act == "stay" and a["stay_seconds"] >= 5:
                    bonus += weights["stay_5_20"]
                elif act == "bounce":
                    bonus += weights["bounce"]
                elif act == "useful":
                    bonus += weights["useful"]
                elif act == "skip":
                    bonus += weights["skip"]
        return bonus / 100.0

    def merge(self, cf_results: list[tuple[str, float]],
              content_results: list[tuple[str, float]],
              student_id: str = "", top_k: int = 20) -> list[tuple[str, float, str]]:
        """混合CF和Content推荐结果，返回 [(item_id, score, source), ...]"""
        max_cf = max(s for _, s in cf_results) if cf_results else 1
        max_ct = max(s for _, s in content_results) if content_results else 1
        scores: dict[str, float] = {}
        sources: dict[str, str] = {}
        for item_id, score in cf_results:
            scores[item_id] = self.alpha * (score / max_cf)
            sources[item_id] = "cf"
        for item_id, score in content_results:
            norm_score = (1 - self.alpha) * (score / max_ct)
            scores[item_id] = max(scores.get(item_id, 0), norm_score)
            if item_id not in sources:
                sources[item_id] = "content"
        behavior_bonus = self._compute_behavior_bonus(student_id) if student_id else 0
        # Spread scores to create diversity: stretch from [0,1] to [0.1,0.9]
        final = []
        for iid, sc in scores.items():
            raw = 0.7 * sc + 0.3 * behavior_bonus
            # Stretch distribution to avoid score clustering
            spread = 0.2 + 0.6 * raw
            # Add deterministic hash-based variance (stable per student-item pair)
            variance = _item_variance(iid, student_id)
            final_score = round(min(max(spread + variance, 0.1), 0.99), 3)
            final.append((iid, final_score, sources[iid]))
        final.sort(key=lambda x: x[1], reverse=True)
        return final[:top_k]
