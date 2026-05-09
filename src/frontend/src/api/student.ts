import axios from 'axios';
import type { StudentProfile, RecommendItem, FeedbackStats } from '../types';

const API = 'http://localhost:8000/api';
// 默认学生ID（后续可加登录切换）
const DEFAULT_STUDENT = 'S2022001';

export async function getProfile(studentId = DEFAULT_STUDENT): Promise<StudentProfile> {
  const resp = await axios.get(`${API}/student/${studentId}/profile`);
  return resp.data;
}

export async function getRecommendations(
  studentId = DEFAULT_STUDENT,
  topK = 20,
): Promise<{ student_id: string; items: RecommendItem[] }> {
  const resp = await axios.get(`${API}/student/${studentId}/recommendations`, {
    params: { top_k: topK },
  });
  return resp.data;
}

export async function postBehavior(
  studentId: string,
  itemId: string,
  actionType: string,
  staySeconds = 0,
  scrollPercent = 0,
) {
  await axios.post(`${API}/student/${studentId}/behavior`, {
    student_id: studentId,
    item_id: itemId,
    action_type: actionType,
    source: 'recommend',
    stay_seconds: staySeconds,
    scroll_percent: scrollPercent,
  });
}

export async function postFeedback(
  studentId: string,
  itemId: string,
  feedbackType: 'useful' | 'skip',
) {
  await axios.post(
    `${API}/student/${studentId}/recommendation/${itemId}/feedback`,
    {
      student_id: studentId,
      item_id: itemId,
      feedback_type: feedbackType,
    },
  );
}

export async function getHistory(
  studentId = DEFAULT_STUDENT,
): Promise<{
  stats: FeedbackStats;
  current_recommendations: RecommendItem[];
}> {
  const resp = await axios.get(`${API}/student/${studentId}/history`);
  return resp.data;
}

export async function searchBooks(query: string) {
  const resp = await axios.get(`${API}/search`, { params: { q: query } });
  return resp.data.results || [];
}
