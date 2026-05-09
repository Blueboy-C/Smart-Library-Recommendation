import { useState, useEffect } from 'react';
import type { RecommendItem } from '../../types';
import { getRecommendations } from '../../api/student';
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

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getRecommendations()
      .then((res) => {
        setItems(res.items);
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
    console.log(`Feedback: ${itemId} -> ${type}`);
  };

  return (
    <div>
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
      <StateWrapper
        loading={loading}
        error={error}
        empty={!loading && !error && filtered.length === 0}
        emptyMessage={`暂无${activeTab === 'book' ? '图书' : activeTab === 'course' ? '课程' : '活动'}推荐`}
        onRetry={fetchData}
      >
        <div className="grid gap-4">
          {filtered.slice(0, 10).map((item) => (
            <RecommendCard key={item.item_id} item={item} onFeedback={handleFeedback} />
          ))}
        </div>
      </StateWrapper>
    </div>
  );
}
