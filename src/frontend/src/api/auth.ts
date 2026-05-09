import axios from 'axios';

const API = 'http://localhost:8000/api';

export interface LoginResult {
  access_token: string;
  role: string;
  username: string;
  student_id: string;
  dept: string;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const resp = await axios.post(`${API}/auth/login`, { username, password });
  return resp.data;
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearToken(): void {
  localStorage.removeItem('token');
}

export function getUserInfo(): { username: string; role: string; student_id: string; dept: string } | null {
  const stored = localStorage.getItem('user_info');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function setUserInfo(info: { username: string; role: string; student_id: string; dept: string }): void {
  localStorage.setItem('user_info', JSON.stringify(info));
}

export function clearUserInfo(): void {
  localStorage.removeItem('user_info');
}

export function authHeader(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}
