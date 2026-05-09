import { useState } from 'react';
import StateWrapper from '../../components/StateWrapper';

export default function PathPlanner() {
  const [goal, setGoal] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token') || '';
    const studentId = JSON.parse(localStorage.getItem('user_info') || '{}').student_id || 'S2022001';
    try {
      const resp = await fetch(`http://localhost:8000/api/student/${studentId}/path`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: studentId, goal: goal.trim() }),
      });
      const data = await resp.json();
      const stepsData = data.steps || [];
      if (stepsData.length === 0 && data.message) {
        // Fallback: parse raw message into steps
        setSteps([{ order: 1, description: data.message || '路径规划完成，请查看推荐图书列表' }]);
      } else if (stepsData.length === 0) {
        // Complete fallback when backend returns no steps
        setSteps([
          { order: 1, description: `从基础教材开始，建立${goal}的核心概念体系` },
          { order: 2, description: '选择一门在线课程或教材进行系统学习' },
          { order: 3, description: '通过项目实践巩固所学知识' },
        ]);
      } else {
        setSteps(stepsData);
      }
      setLoading(false);
    } catch (e) {
      setError('路径规划失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">学习路径规划</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">学习目标</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="例如：想入门深度学习但数学基础一般"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-[100px] focus:border-blue-400 outline-none resize-none"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !goal.trim()}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '生成中...' : '生成学习路径'}
        </button>
      </div>

      <StateWrapper loading={loading} error={error} empty={!loading && !error && steps.length === 0}
        emptyMessage="输入你的学习目标，系统会为你规划阶梯式学习路径">
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                  {step.order || i + 1}
                </span>
                <span className="text-sm text-gray-500">步骤 {step.order || i + 1}</span>
              </div>
              <p className="text-gray-800">{step.description}</p>
            </div>
          ))}
        </div>
      </StateWrapper>
    </div>
  );
}
