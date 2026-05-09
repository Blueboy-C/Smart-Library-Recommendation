import { useState, useEffect } from 'react';
import type { RecommendItem } from '../../types';
import { getRecommendations, postFeedback, getDefaultStudentId, getFeedbackStatus } from '../../api/student';
import RecommendCard from '../../components/RecommendCard';
import StateWrapper from '../../components/StateWrapper';

type TabType = 'book' | 'course' | 'activity';

const tabs: { key: TabType; label: string }[] = [
  { key: 'book', label: '图书推荐' },
  { key: 'course', label: '课程推荐' },
  { key: 'activity', label: '活动推荐' },
];

export default function Recommendations() {
  const [items, setItems] = useState<RecommendItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('book');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'useful' | 'skip'>>({});
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getRecommendations()
      .then(async (res) => {
        setItems(res.items);
        // Load existing feedback for these items from backend
        const ids = res.items.map(i => i.item_id);
        try {
          const fb = await getFeedbackStatus(getDefaultStudentId(), ids);
          setFeedbackMap(fb as Record<string, 'useful' | 'skip'>);
        } catch {
          // Non-critical: feedback history not available
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch recommendations:', err);
        setError(err instanceof Error ? err.message : '请求推荐失败');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = items.filter((item) => item.item_type === activeTab);

  const handleFeedback = (itemId: string, type: 'useful' | 'skip') => {
    postFeedback(getDefaultStudentId(), itemId, type)
      .then(() => {
        setFeedbackMap(prev => ({ ...prev, [itemId]: type }));
        setToast(type === 'useful' ? '已标记为有用 ✓' : '已跳过');
        // Remove skipped items from display immediately
        if (type === 'skip') {
          setItems(prev => prev.filter(item => item.item_id !== itemId));
        }
        setTimeout(() => setToast(null), 2000);
      })
      .catch(console.error);
  };

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">个性化推荐</h1>
        <p className="text-sm text-gray-500 mt-1">基于你的学习行为和兴趣画像，为你推荐以下内容</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'book' && (
        <StateWrapper
          loading={loading}
          error={error}
          empty={!loading && !error && filtered.length === 0}
          emptyMessage="暂无图书推荐"
          onRetry={fetchData}
        >
          <div className="grid gap-4">
            {filtered.slice(0, 10).map((item) => (
              <RecommendCard key={item.item_id} item={item} feedback={feedbackMap[item.item_id]} onFeedback={handleFeedback} />
            ))}
          </div>
        </StateWrapper>
      )}

      {activeTab === 'course' && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">课程推荐功能即将开放</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            课程推荐功能需要接入教务系统课程数据后开放
          </p>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">活动推荐功能即将开放</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            活动推荐将在学术活动数据接入后开放
          </p>
        </div>
      )}
    </div>
  );
}
