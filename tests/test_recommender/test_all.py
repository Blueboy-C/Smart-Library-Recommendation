import sys
sys.path.insert(0, "src")
from src.recommender.content_based import BasicContentRecommender
from src.recommender.collaborative import UserBasedCF
from src.recommender.hybrid import HybridRecommender


def test_content_recommender():
    r = BasicContentRecommender()
    r.add_item("B001", "Python编程入门教程 适合零基础学习")
    r.add_item("B002", "深度学习神经网络 TensorFlow实战")
    r.add_item("B003", "机器学习算法 监督学习 无监督学习")
    result = r.recommend({"python": 0.5, "编程": 0.8, "入门": 0.3}, 2)
    assert len(result) == 2
    assert result[0][0] == "B001"  # B001最匹配Python+编程
    print(f"Content results: {result}")


def test_collaborative():
    cf = UserBasedCF(k_neighbors=5)
    cf.add_student("S1", {"计算机": 0.8, "数学": 0.2}, {"B001", "B003"})
    cf.add_student("S2", {"计算机": 0.7, "物理": 0.3}, {"B001", "B002"})
    cf.add_student("S3", {"文学": 0.9, "历史": 0.1}, {"B004"})
    result = cf.recommend("S1", top_k=3)
    assert len(result) > 0
    print(f"CF results: {result}")


def test_hybrid():
    h = HybridRecommender(alpha=0.6)
    h.record_behavior("S1", "B001", "bookmark")
    h.record_behavior("S1", "B002", "stay", stay_seconds=65, scroll_percent=90)
    cf_r = [("B001", 0.8), ("B002", 0.5)]
    ct_r = [("B003", 0.9), ("B001", 0.4)]
    result = h.merge(cf_r, ct_r, student_id="S1", top_k=5)
    assert len(result) > 0
    print(f"Hybrid results: {result}")


if __name__ == "__main__":
    test_content_recommender()
    test_collaborative()
    test_hybrid()
    print("All recommender tests passed!")
