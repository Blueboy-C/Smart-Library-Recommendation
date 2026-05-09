import { useState, useEffect, useRef } from 'react';

const MOCK_RESULTS = [
  { id: '1', title: '机器学习', type: '图书', desc: 'Tom Mitchell 经典教材，涵盖决策树、神经网络等核心内容', score: 0.95 },
  { id: '2', title: '机器学习实战', type: '图书', desc: '基于Python的机器学习实践指南', score: 0.88 },
  { id: '3', title: '自然语言处理', type: '课程', desc: '深入讲解NLP中的机器学习方法', score: 0.82 },
  { id: '4', title: '统计学习方法', type: '图书', desc: '李航著，系统介绍统计学习核心方法', score: 0.76 },
];

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof MOCK_RESULTS>([]);
  const [showResults, setShowResults] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    timerRef.current = setTimeout(() => {
      setResults(
        MOCK_RESULTS.filter((r) => r.title.includes(query) || r.desc.includes(query))
      );
      setShowResults(true);
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">语义搜索</h1>
        <p className="text-sm text-gray-500 mt-1">通过自然语言描述，智能搜索你需要的图书、课程和活动</p>
      </div>

      {/* Search input */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索图书、课程... 例如：我想找机器学习的入门书"
            className="w-full pl-12 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Results */}
      {showResults && (
        <div className="mt-4 space-y-3">
          {results.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400">未找到相关结果</p>
            </div>
          ) : (
            results.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{r.title}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                        {r.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{r.desc}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 ml-4">
                    <span className="text-xs font-bold text-blue-600">{Math.round(r.score * 100)}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
