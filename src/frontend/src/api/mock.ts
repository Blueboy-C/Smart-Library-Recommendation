import type { StudentProfile, RecommendItem, RecommendResponse, FeedbackRecord } from '../types';

const MOCK_PROFILE: StudentProfile = {
  student_id: 'S20220001',
  grade: '2023级',
  major: '计算机科学与技术',
  interest_keywords: [['机器学习', 0.12], ['Python', 0.10], ['算法', 0.08], ['深度学习', 0.07], ['数据挖掘', 0.05]],
  domain_weights: { '自动化/计算机': 0.55, '数学/物理/化学': 0.25, '电子技术/通信': 0.15, '哲学/心理学': 0.05 },
  time_preference: '均匀分布型',
  reading_depth: 28.5,
  reading_breadth: 4,
  interest_stability: 0.72,
  borrow_count: 15,
  course_count: 8,
  cross_domain_signal: true,
  analysis: { type: '跨学科融合型', strength: '中等' },
};

const MOCK_ITEMS: RecommendItem[] = [
  { item_id: 'B001', item_type: 'book', title: '机器学习实战', reason: '和你阅读偏好相似的同学也在读', score: 0.92, available: true },
  { item_id: 'B002', item_type: 'book', title: '统计学习方法', reason: '符合你在数学领域的阅读兴趣', score: 0.87, available: true },
  { item_id: 'B003', item_type: 'book', title: '深度学习', reason: '是你当前阅读方向的经典延伸', score: 0.85, available: false },
  { item_id: 'B004', item_type: 'book', title: 'Python数据科学手册', reason: '与你的技术栈高度匹配', score: 0.83, available: true },
  { item_id: 'B005', item_type: 'book', title: '计算机视觉', reason: '和你阅读偏好相似的同学也在读', score: 0.81, available: true },
  { item_id: 'C001', item_type: 'course', title: '自然语言处理', reason: '基于你的机器学习兴趣推荐', score: 0.78, available: true },
  { item_id: 'C002', item_type: 'course', title: '强化学习入门', reason: '算法方向进阶课程', score: 0.75, available: true },
  { item_id: 'C003', item_type: 'course', title: '数据可视化', reason: '与Python技能组合推荐', score: 0.72, available: false },
  { item_id: 'C004', item_type: 'course', title: '分布式系统', reason: '计算机专业核心课程', score: 0.70, available: true },
  { item_id: 'A001', item_type: 'activity', title: 'AI黑客马拉松', reason: '实践活动与你的技术栈匹配', score: 0.68, available: true },
  { item_id: 'A002', item_type: 'activity', title: '数据科学工作坊', reason: '与你的Python兴趣相关', score: 0.65, available: true },
];

const MOCK_HISTORY: FeedbackRecord[] = [
  { item_id: 'B001', title: '机器学习实战', item_type: 'book', score: 0.92, reason: '和你阅读偏好相似的同学也在读', recommended_at: '2024-03-15T10:30:00Z', feedback: 'useful' },
  { item_id: 'B004', title: 'Python数据科学手册', item_type: 'book', score: 0.88, reason: '与你的技术栈高度匹配', recommended_at: '2024-03-10T14:00:00Z', feedback: 'useful' },
  { item_id: 'C002', title: '数据库系统概念', item_type: 'course', score: 0.76, reason: '计算机专业核心课程', recommended_at: '2024-03-08T09:00:00Z', feedback: 'skip' },
  { item_id: 'B002', title: '算法导论', item_type: 'book', score: 0.85, reason: '符合你在算法领域的兴趣', recommended_at: '2024-03-05T11:20:00Z', feedback: undefined },
  { item_id: 'C001', title: '操作系统', item_type: 'course', score: 0.74, reason: '专业必修课推荐', recommended_at: '2024-03-01T16:00:00Z', feedback: 'useful' },
];

export async function getProfile(): Promise<StudentProfile> {
  await new Promise(r => setTimeout(r, 300));
  return MOCK_PROFILE;
}

export async function getRecommendations(): Promise<RecommendResponse> {
  await new Promise(r => setTimeout(r, 300));
  return { student_id: 'S20220001', items: MOCK_ITEMS };
}

export async function getHistory(): Promise<FeedbackRecord[]> {
  await new Promise(r => setTimeout(r, 300));
  return MOCK_HISTORY;
}
