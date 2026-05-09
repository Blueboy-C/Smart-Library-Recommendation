"""User-Based协同过滤推荐"""
from collections import defaultdict


class UserBasedCF:
    def __init__(self, k_neighbors: int = 20):
        self.k = k_neighbors
        self.student_features: dict[str, dict[str, float]] = {}
        self.student_borrows: dict[str, set[str]] = {}

    def add_student(self, student_id: str, domain_weights: dict[str, float], borrowed_items: set[str]):
        self.student_features[student_id] = domain_weights
        self.student_borrows[student_id] = borrowed_items

    def _compute_similarity(self, s1: str, s2: str) -> float:
        f1 = self.student_features.get(s1, {})
        f2 = self.student_features.get(s2, {})
        keys = set(f1) | set(f2)
        if not keys:
            return 0
        v1 = [f1.get(k, 0) for k in keys]
        v2 = [f2.get(k, 0) for k in keys]
        dot = sum(a * b for a, b in zip(v1, v2))
        norm = (sum(a**2 for a in v1) ** 0.5) * (sum(b**2 for b in v2) ** 0.5)
        return dot / norm if norm > 0 else 0

    def recommend(self, student_id: str, top_k: int = 20,
                  exclude: set[str] | None = None) -> list[tuple[str, float]]:
        if student_id not in self.student_features:
            return []
        exclude = exclude or set()
        similarities = [(other, self._compute_similarity(student_id, other))
                        for other in self.student_features if other != student_id]
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_neighbors = similarities[:self.k]
        item_scores: dict[str, float] = defaultdict(float)
        item_counts: dict[str, int] = defaultdict(int)
        for neighbor, sim in top_neighbors:
            if sim <= 0:
                continue
            for item in self.student_borrows.get(neighbor, set()):
                if item in exclude:
                    continue
                item_scores[item] += sim
                item_counts[item] += 1
        scored = [(item, item_scores[item] / item_counts[item]) for item in item_scores]
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]
