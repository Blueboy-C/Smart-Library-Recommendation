import { useState } from 'react';

export default function PathPlanner() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">学习路径规划</h1>
        <p className="text-sm text-gray-500 mt-1">描述你的学习目标，我们将为你生成个性化的学习路径</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">你的学习目标</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：我想在三个月内掌握机器学习的核心算法，并能独立完成一个数据挖掘项目..."
          className="w-full h-32 px-4 py-3 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
          disabled={submitted}
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            disabled={submitted || !input.trim()}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              submitted
                ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
            }`}
          >
            {submitted ? '✓ 已提交' : '生成路径'}
          </button>
        </div>
      </div>

      {submitted && (
        <div className="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-8 text-center">
          <div className="text-4xl mb-3">🚧</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">功能开发中</h3>
          <p className="text-sm text-gray-500">
            个性化学习路径规划功能正在紧锣密鼓地开发中，敬请期待！
          </p>
        </div>
      )}
    </div>
  );
}
