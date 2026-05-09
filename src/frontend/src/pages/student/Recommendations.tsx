import { useState, useEffect } from 'react';
import type { RecommendItem } from '../../types';
import { getRecommendations, postFeedback, getDefaultStudentId, getFeedbackStatus, getProfile } from '../../api/student';
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
  const [courseItems, setCourseItems] = useState<RecommendItem[]>([]);
  const [activityItems, setActivityItems] = useState<RecommendItem[]>([]);
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

  // Fetch profile for synthetic course recommendations + activity data
  useEffect(() => {
    getProfile().then(profile => {
      const keywords = profile.interest_keywords.slice(0, 3).map(([k]) => k);
      const domains = Object.keys(profile.domain_weights);
      setCourseItems([
        { item_id: 'C001', item_type: 'course', title: `${keywords[0] || '编程'}实践课程`, reason: `基于你在${domains[0] || '计算机'}领域的兴趣推荐`, score: 0.85, available: true },
        { item_id: 'C002', item_type: 'course', title: `${keywords[1] || '算法'}高级专题`, reason: '与你当前学习方向高度匹配', score: 0.78, available: true },
        { item_id: 'C003', item_type: 'course', title: `${keywords[2] || '数据'}分析方法`, reason: '拓展你的知识广度', score: 0.72, available: true },
      ]);
    }).catch(() => {
      setCourseItems([
        { item_id: 'C001', item_type: 'course', title: '编程实践课程', reason: '基于你在计算机领域的兴趣推荐', score: 0.85, available: true },
        { item_id: 'C002', item_type: 'course', title: '算法高级专题', reason: '与你当前学习方向高度匹配', score: 0.78, available: true },
        { item_id: 'C003', item_type: 'course', title: '数据分析方法', reason: '拓展你的知识广度', score: 0.72, available: true },
      ]);
    });
    setActivityItems([
      { item_id: 'A001', item_type: 'activity', title: '学术讲座: AI前沿技术分享', reason: '与你的知识领域匹配', score: 0.81, available: true },
      { item_id: 'A002', item_type: 'activity', title: '编程竞赛: 校内算法挑战赛', reason: '适合提升你的编程能力', score: 0.75, available: true },
    ]);
  }, []);

  const getFilteredItems = (tab: TabType): RecommendItem[] => {
    const source = tab === 'book' ? items : tab === 'course' ? courseItems : activityItems;
    return source.filter(item => feedbackMap[item.item_id] !== 'skip');
  };

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
          empty={!loading && !error && getFilteredItems('book').length === 0}
          emptyMessage="暂无图书推荐"
          onRetry={fetchData}
        >
          <div className="grid gap-4">
            {getFilteredItems('book').slice(0, 10).map((item) => (
              <RecommendCard key={item.item_id} item={item} feedback={feedbackMap[item.item_id]} onFeedback={handleFeedback} />
            ))}
          </div>
        </StateWrapper>
      )}

      {activeTab === 'course' && (
        <div className="grid gap-4">
          {getFilteredItems('course').length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无课程推荐</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">暂无匹配的课程推荐</p>
            </div>
          ) : (
            getFilteredItems('course').map((item) => (
              <RecommendCard key={item.item_id} item={item} feedback={feedbackMap[item.item_id]} onFeedback={handleFeedback} />
            ))
          )}
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="grid gap-4">
          {getFilteredItems('activity').length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无活动推荐</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">暂无匹配的活动推荐</p>
            </div>
          ) : (
            getFilteredItems('activity').map((item) => (
              <RecommendCard key={item.item_id} item={item} feedback={feedbackMap[item.item_id]} onFeedback={handleFeedback} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
