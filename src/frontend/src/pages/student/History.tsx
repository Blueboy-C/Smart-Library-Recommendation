import { useState, useEffect } from 'react';
import type { FeedbackRecord } from '../../types';
import { getHistory } from '../../api/student';

type FilterType = 'all' | 'book' | 'course' | 'activity';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'book', label: '图书' },
  { key: 'course', label: '课程' },
  { key: 'activity', label: '活动' },
];

const typeLabels: Record<string, string> = {
  book: '图书',
  course: '课程',
  activity: '活动',
};

export default function History() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then((data) => {
      // Transform API response: map current_recommendations -> FeedbackRecord[]
      const mapped: FeedbackRecord[] = (data.current_recommendations || []).map(
        (item) => ({
          item_id: item.item_id,
          title: item.title,
          item_type: item.item_type as 'book' | 'course' | 'activity',
          score: item.score,
          reason: item.reason,
          recommended_at: new Date().toISOString(),
          feedback: undefined,
        }),
      );
      setRecords(mapped);
      setLoading(false);
    });
  }, []);

  const filtered = filter === 'all' ? records : records.filter((r) => r.item_type === filter);

  const totalFeedback = records.length;
  const usefulCount = records.filter((r) => r.feedback === 'useful').length;
  const adoptionRate = totalFeedback > 0 ? Math.round((usefulCount / totalFeedback) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">推荐历史</h1>
        <p className="text-sm text-gray-500 mt-1">查看过往推荐记录和你的反馈</p>
      </div>

      {/* Stats bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-8">
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalFeedback}</div>
            <div className="text-xs text-gray-400 mt-1">总推荐</div>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div>
            <div className="text-2xl font-bold text-green-600">{usefulCount}</div>
            <div className="text-xs text-gray-400 mt-1">有用</div>
          </div>
          <div className="w-px h-10 bg-gray-100" />
          <div>
            <div className="text-2xl font-bold text-blue-600">{adoptionRate}%</div>
            <div className="text-xs text-gray-400 mt-1">采纳率</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">暂无推荐记录</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => new Date(b.recommended_at).getTime() - new Date(a.recommended_at).getTime()).map((record) => (
            <div
              key={record.item_id + record.recommended_at}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium shrink-0 ${
                    record.item_type === 'book' ? 'bg-blue-100 text-blue-700' :
                    record.item_type === 'course' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {typeLabels[record.item_type]}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">{record.title}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(record.recommended_at).toLocaleDateString('zh-CN')}
                  </span>
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    record.feedback === 'useful'
                      ? 'bg-green-50 text-green-600'
                      : record.feedback === 'skip'
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gray-50 text-gray-300'
                  }`}>
                    {record.feedback === 'useful' ? '✓' : record.feedback === 'skip' ? '✗' : '—'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
