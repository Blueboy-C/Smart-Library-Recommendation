import { useState, useEffect, useRef } from 'react';
import { searchBooks } from '../../api/student';

interface SearchResult {
  item_id: string;
  title: string;
  author: string;
  score: number;
  available: boolean;
  clc_number: string;
}

export default function SemanticSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchBooks(query);
        setResults(data);
        setShowResults(true);
      } catch (err) {
        console.error('Search failed:', err);
        setError(err instanceof Error ? err.message : '搜索请求失败');
        setResults([]);
        setShowResults(true);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const hasSearched = showResults && !loading;

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
      <div className="mt-4 space-y-3">
        {!showResults && !query.trim() && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-gray-300 text-5xl mb-4">&#128269;</div>
            <p className="text-gray-500">输入关键词搜索图书</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-500 text-5xl mb-4">&#9888;</div>
            <p className="text-red-600 mb-2">搜索失败</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
          </div>
        )}

        {hasSearched && !error && results.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <div className="text-gray-300 text-5xl mb-4">&#128270;</div>
            <p className="text-gray-500">未找到相关图书</p>
            <p className="text-gray-400 text-sm mt-2">请尝试其他关键词</p>
          </div>
        )}

        {hasSearched && !error && results.length > 0 && (
          results.map((r) => (
            <div
              key={r.item_id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{r.title}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                      图书
                    </span>
                    {!r.available && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">
                        已借出
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{r.author}</p>
                  {r.clc_number && (
                    <p className="text-xs text-gray-400 mt-1">分类号: {r.clc_number}</p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 ml-4">
                  <span className="text-xs font-bold text-blue-600">{Math.round(r.score * 100)}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
