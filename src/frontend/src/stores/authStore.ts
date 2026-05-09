import { create } from 'zustand';
import { getToken, getUserInfo, clearToken, clearUserInfo, setToken, setUserInfo, login as apiLogin } from '../api/auth';

interface UserInfo {
  username: string;
  role: string;
  student_id: string;
  dept: string;
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  user: getUserInfo(),
  isAuthenticated: !!getToken(),

  init: () => {
    const token = getToken();
    const user = getUserInfo();
    set({ token, user, isAuthenticated: !!token });
  },

  login: async (username: string, password: string) => {
    const result = await apiLogin(username, password);
    setToken(result.access_token);
    setUserInfo({
      username: result.username,
      role: result.role,
      student_id: result.student_id,
      dept: result.dept,
    });
    set({
      token: result.access_token,
      user: {
        username: result.username,
        role: result.role,
        student_id: result.student_id,
        dept: result.dept,
      },
      isAuthenticated: true,
    });
  },

  logout: () => {
    clearToken();
    clearUserInfo();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
