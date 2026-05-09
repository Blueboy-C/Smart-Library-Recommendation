import { useState } from 'react';
import StateWrapper from '../../components/StateWrapper';

export default function InsightReport() {
  const [generating, setGenerating] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setInsight(null);
    setError(null);
    setRawData(null);

    const token = localStorage.getItem('token') || '';
    const dept = JSON.parse(localStorage.getItem('user_info') || '{}').dept || '计算机';

    try {
      const resp = await fetch(`http://localhost:8000/api/teacher/${encodeURIComponent(dept)}/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dept, grade: '' }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setInsight(data.insight || '洞察报告生成完成。请查看下方数据摘要了解学生阅读概况。');
      setRawData(data.raw_data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成报告失败');
    } finally {
      setGenerating(false);
    }
  };

  const topDomains = rawData?.top_domains || [];

  return (
    <StateWrapper
      loading={false}
      error={null}
      empty={false}
    >
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">洞察报告</h1>
          <p className="text-sm text-gray-500 mt-1">基于学生阅读行为数据生成月度洞察报告</p>
        </div>

        {/* Generate button */}
        <div className="mb-6">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                正在生成报告...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                生成月度洞察
              </>
            )}
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-center">
            <div className="text-red-500 text-4xl mb-3">&#9888;</div>
            <p className="text-red-700 font-medium mb-2">生成失败</p>
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              重新生成
            </button>
          </div>
        )}

        {/* Insight report card */}
        {insight && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">&#x1F4CA;</span>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">阅读洞察报告</h2>
                <p className="text-xs text-gray-400">生成时间: {new Date().toLocaleString('zh-CN')}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100/50">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{insight}</p>
            </div>
          </div>
        )}

        {/* Toggle raw data */}
        {rawData && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
              >
                {showRaw ? '收起' : '展开'}原始数据
                <svg
                  className={`w-4 h-4 transition-transform ${showRaw ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {showRaw && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 overflow-x-auto">
                <h3 className="text-base font-semibold text-gray-900 mb-4">数据概览</h3>
                <p className="text-sm text-gray-500 mb-3">总借阅量: {rawData.total_borrows}</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-gray-400 font-medium">领域</th>
                      <th className="text-right py-3 px-2 text-gray-400 font-medium">借阅次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDomains.map(([domain, count]: [string, number]) => (
                      <tr key={domain} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-2 text-gray-800 font-medium">{domain}</td>
                        <td className="py-3 px-2 text-right text-gray-700">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </StateWrapper>
  );
}
