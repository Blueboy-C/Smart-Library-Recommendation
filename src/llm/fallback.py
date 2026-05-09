"""LLM降级方案：模板化文案（LLM不可用时使用）"""

def fallback_recommendation_reason(student_major: str, book_title: str, source: str) -> str:
    if source == "cf":
        return f"和你阅读偏好相似的同学也在读《{book_title}》"
    return f"《{book_title}》与你在{student_major}领域的学习方向相符"


def fallback_learning_path(goal: str) -> list[dict]:
    return [
        {"order": 1, "description": f"从基础教材开始，建立{goal}的核心概念体系"},
        {"order": 2, "description": "选择一门在线课程或教材进行系统学习"},
        {"order": 3, "description": "通过项目实践巩固所学知识"},
    ]


def fallback_dialogue_response(message: str) -> str:
    """简单的关键词匹配回复"""
    if "书" in message or "推荐" in message:
        return "建议你在首页查看个性化推荐列表，系统已根据你的阅读偏好为你筛选了合适的图书。"
    if "画像" in message or "兴趣" in message:
        return '你可以在"我的画像"页面查看系统对你的学习兴趣分析，包括知识领域分布、兴趣关键词和学习节奏。'
    if "课程" in message:
        return "选课建议需要结合你的专业培养方案和兴趣方向，建议查看课程推荐Tab获取个性化推荐。"
    return "我可以帮你找书、分析你的阅读兴趣、或推荐课程。请告诉我你具体想了解什么？"


def fallback_teacher_insight() -> str:
    return "本月学生阅读活跃度良好。如需详细的AI洞察报告，请确保LLM服务可用后重试。"
