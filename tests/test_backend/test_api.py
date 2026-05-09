"""后端API集成测试"""
import pytest
import requests
import time

BASE = "http://localhost:8000/api"

def test_health():
    resp = requests.get(f"{BASE}/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"

def test_import_data():
    resp = requests.post(f"{BASE}/admin/import/all")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["students"] > 0
    print(f"Import: {data}")

def test_student_profile():
    resp = requests.get(f"{BASE}/student/S2022001/profile")
    assert resp.status_code == 200
    data = resp.json()
    assert "interest_keywords" in data
    assert "domain_weights" in data
    print(f"Profile: keywords={len(data.get('interest_keywords',[]))}, domains={data.get('domain_weights',{})}")

def test_recommendations():
    resp = requests.get(f"{BASE}/student/S2022001/recommendations?top_k=10")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert len(data["items"]) > 0
    print(f"Recommendations: {len(data['items'])} items")
    for item in data["items"][:3]:
        print(f"  - {item['title']} (score={item['score']}, source={item.get('reason','')})")

def test_behavior_logging():
    resp = requests.post(f"{BASE}/student/S2022001/behavior", json={
        "student_id": "S2022001", "item_id": "B001",
        "action_type": "bookmark", "source": "test"
    })
    assert resp.status_code == 200

def test_feedback():
    resp = requests.post(f"{BASE}/student/S2022001/recommendation/B001/feedback", json={
        "student_id": "S2022001", "item_id": "B001", "feedback_type": "useful"
    })
    assert resp.status_code == 200

def test_search():
    resp = requests.get(f"{BASE}/search?q=机器学习")
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    print(f"Search: {len(data['results'])} results")

def test_teacher_heatmap():
    resp = requests.get(f"{BASE}/teacher/default/heatmap")
    assert resp.status_code == 200

def test_teacher_clusters():
    resp = requests.get(f"{BASE}/teacher/default/clusters")
    assert resp.status_code == 200

if __name__ == "__main__":
    # Run all tests
    for name, func in list(globals().items()):
        if name.startswith("test_"):
            print(f"\n--- {name} ---")
            func()
    print("\n[OK] All API tests passed!")
