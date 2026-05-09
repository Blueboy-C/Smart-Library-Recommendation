import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ChatWidget from './ChatWidget';

const studentNavItems = [
  { path: '/', label: '首页推荐', icon: '🏠' },
  { path: '/profile', label: '我的画像', icon: '👤' },
  { path: '/history', label: '推荐历史', icon: '📋' },
  { path: '/path-planner', label: '学习路径', icon: '🗺️' },
  { path: '/search', label: '语义搜索', icon: '🔍' },
];

const teacherNavItems = [
  { path: '/teacher/overview', label: '兴趣总览', icon: '📊' },
  { path: '/teacher/clusters', label: '学生分群', icon: '👥' },
  { path: '/teacher/insight', label: '洞察报告', icon: '📝' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold text-gray-800 text-lg">智慧图书馆</span>
        <MobileUserIcon />
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-14 flex items-center px-6 border-b border-gray-100">
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              智慧图书馆
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {/* Student section */}
            <div className="px-4 py-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">学生端</span>
            </div>
            {studentNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Teacher section */}
            <div className="px-4 py-1.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">教师看板</span>
            </div>
            {teacherNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-100 p-4">
            <UserInfo />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

function MobileUserIcon() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.username || '未登录';
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
      {displayName.charAt(0).toUpperCase()}
    </div>
  );
}

function UserInfo() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.username || '未登录';
  const displayId = user?.student_id || user?.dept || user?.role || '';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-800">{displayName}</div>
          <div className="text-xs text-gray-400">{displayId}</div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        title="退出登录"
      >
        退出
      </button>
    </div>
  );
}
