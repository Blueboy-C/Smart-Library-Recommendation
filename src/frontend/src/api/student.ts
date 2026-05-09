import axios from 'axios';
import type { StudentProfile, RecommendItem, FeedbackStats } from '../types';
import { authHeader } from './auth';
import { useAuthStore } from '../stores/authStore';

const API = 'http://localhost:8000/api';

export function getDefaultStudentId(): string {
  const store = useAuthStore.getState();
  if (store.user?.student_id) {
    return store.user.student_id;
  }
  return 'S2022001';
}

export async function getProfile(studentId?: string): Promise<StudentProfile> {
  const sid = studentId || getDefaultStudentId();
  const resp = await axios.get(`${API}/student/${sid}/profile`, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function getRecommendations(
  studentId?: string,
  topK = 20,
): Promise<{ student_id: string; items: RecommendItem[] }> {
  const sid = studentId || getDefaultStudentId();
  const resp = await axios.get(`${API}/student/${sid}/recommendations`, {
    params: { top_k: topK },
    headers: authHeader(),
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
  await axios.post(
    `${API}/student/${studentId}/behavior`,
    {
      student_id: studentId,
      item_id: itemId,
      action_type: actionType,
      source: 'recommend',
      stay_seconds: staySeconds,
      scroll_percent: scrollPercent,
    },
    { headers: authHeader() },
  );
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
    { headers: authHeader() },
  );
}

export async function getHistory(
  studentId?: string,
): Promise<{
  stats: FeedbackStats;
  current_recommendations: RecommendItem[];
}> {
  const sid = studentId || getDefaultStudentId();
  const resp = await axios.get(`${API}/student/${sid}/history`, {
    headers: authHeader(),
  });
  return resp.data;
}

export async function searchBooks(query: string) {
  const resp = await axios.get(`${API}/search`, {
    params: { q: query },
    headers: authHeader(),
  });
  return resp.data.results || [];
}
