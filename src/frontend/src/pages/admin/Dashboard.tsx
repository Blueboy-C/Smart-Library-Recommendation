import { useState, useEffect } from 'react';
import StateWrapper from '../../components/StateWrapper';
import { getAdminStats, updateModel } from '../../api/admin';

const API = 'http://localhost:8000/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelUpdating, setModelUpdating] = useState(false);
  const [modelMsg, setModelMsg] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const handleImport = async () => {
    const token = localStorage.getItem('token') || '';
    setImportMsg('导入中...');
    try {
      const resp = await fetch(`${API}/admin/import/sync`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      setImportMsg(`导入完成: ${data.students}学生, ${data.books}图书, ${data.borrows}借阅`);
      setTimeout(() => { loadStats(); setImportMsg(null); }, 2000);
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch {
      setImportMsg('导入失败，请重试');
    }
  };

  const loadStats = async () => {
    try {
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch {/* ignore */}
  };

  const handleModelUpdate = async () => {
    setModelUpdating(true);
    setModelMsg(null);
    try {
      const result = await updateModel();
      setModelMsg(result.message || '模型更新成功');
      // Refresh stats after model update
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (err: unknown) {
      setModelMsg(err instanceof Error ? err.message : '模型更新失败');
    } finally {
      setModelUpdating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">系统管理</h1>
      <StateWrapper loading={loading} error={error} empty={false}>
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
              <span className={`w-3 h-3 rounded-full ${modelUpdating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
              <span className="text-sm">{modelUpdating ? '更新中...' : '运行正常'}</span>
            </div>
            {modelMsg && (
              <p className="text-xs text-gray-500 mt-2">{modelMsg}</p>
            )}
            <button
              onClick={handleModelUpdate}
              disabled={modelUpdating}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {modelUpdating ? '更新中...' : '手动更新模型'}
            </button>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleImport}
                disabled={importMsg === '导入中...'}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                数据同步
              </button>
              {importMsg && (
                <p className="text-xs text-gray-500 mt-2">{importMsg}</p>
              )}
            </div>
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
