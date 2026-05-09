"""基于内容的推荐：TF-IDF + 余弦相似度"""
import jieba
import numpy as np


class BasicContentRecommender:
    """轻量版：手动实现TF-IDF + 余弦相似度"""
    def __init__(self):
        self.item_texts: dict[str, str] = {}

    def add_item(self, item_id: str, text: str):
        self.item_texts[item_id] = text

    def _compute_tf(self, text: str) -> dict[str, float]:
        words = [w for w in jieba.cut(text) if len(w.strip()) >= 2]
        counter = {}
        for w in words:
            counter[w] = counter.get(w, 0) + 1
        total = max(sum(counter.values()), 1)
        return {w: c / total for w, c in counter.items()}

    def _doc_freq(self) -> dict[str, int]:
        df = {}
        for text in self.item_texts.values():
            seen = set()
            for w in jieba.cut(text):
                w = w.strip()
                if len(w) >= 2 and w not in seen:
                    df[w] = df.get(w, 0) + 1
                    seen.add(w)
        return df

    def recommend(self, student_keywords: dict[str, float], top_k: int = 10) -> list[tuple[str, float]]:
        """计算学生关键词向量与每个物品的余弦相似度，返回 [(item_id, score), ...]"""
        df = self._doc_freq()
        n_docs = max(len(self.item_texts), 1)
        results = []
        for item_id, text in self.item_texts.items():
            item_tf = self._compute_tf(text)
            item_vec = {w: tf * np.log((n_docs + 1) / (df.get(w, 0) + 1)) for w, tf in item_tf.items()}
            student_vec = student_keywords
            keys = set(item_vec) | set(student_vec)
            if not keys:
                results.append((item_id, 0.0))
                continue
            v1 = [item_vec.get(k, 0) for k in keys]
            v2 = [student_vec.get(k, 0) for k in keys]
            dot = sum(a * b for a, b in zip(v1, v2))
            norm = (sum(a**2 for a in v1) ** 0.5) * (sum(b**2 for b in v2) ** 0.5)
            score = dot / norm if norm > 0 else 0
            results.append((item_id, score))
        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]
