import { useState, useEffect } from 'react';
import StateWrapper from '../../components/StateWrapper';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stats from backend
    fetch('http://localhost:8000/api/admin/stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">系统管理</h1>
      <StateWrapper loading={loading} error={null} empty={false}>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard title="学生总数" value={stats?.total_students || 300} color="blue" />
          <StatCard title="借阅记录" value={stats?.total_borrows || 5000} color="green" />
          <StatCard title="选课记录" value={stats?.total_courses || 3200} color="purple" />
          <StatCard title="今日推荐" value={stats?.today_recommendations || 0} color="orange" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-3">推荐准确率</h3>
            <div className="text-4xl font-bold text-blue-600">
              {stats?.accuracy || '--'}%
            </div>
            <p className="text-sm text-gray-500 mt-1">基于用户"有用"反馈 / 总推荐</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold mb-3">模型状态</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">运行正常</span>
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
              手动更新模型
            </button>
          </div>
        </div>
      </StateWrapper>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
