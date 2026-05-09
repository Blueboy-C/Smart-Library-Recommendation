import { useState, useEffect } from 'react';
import { getProfile } from '../../api/student';
import type { StudentProfile } from '../../types';
import RadarChart from '../../components/RadarChart';
import WordCloud from '../../components/WordCloud';
import LineChart from '../../components/LineChart';
import StateWrapper from '../../components/StateWrapper';

export default function Profile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crossDomain, setCrossDomain] = useState<string | null>(null);
  const [loadingCross, setLoadingCross] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    getProfile()
      .then((p) => {
        setProfile(p);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err.message : '请求画像失败');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch cross-domain suggestions
  useEffect(() => {
    if (!profile || loading) return;
    setLoadingCross(true);
    const keywords = profile.interest_keywords.slice(0, 5).map(([k]) => k).join('、');
    fetch(`http://localhost:8000/api/dialogue?message=根据学生的兴趣关键词：${keywords}，知识领域分布：${JSON.stringify(profile.domain_weights).slice(0,100)}，请用一句话（不超过50字）建议一个意想不到但可能有兴趣的跨领域阅读方向。`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(async (res) => {
        const reader = res.body?.getReader();
        if (!reader) return;
        let text = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += new TextDecoder().decode(value).replace(/^data: /gm, '').replace(/\[DONE\]/g, '');
        }
        setCrossDomain(text.trim() || '跨界联想暂时不可用');
      })
      .catch(() => setCrossDomain('跨界联想暂时不可用'))
      .finally(() => setLoadingCross(false));
  }, [profile?.student_id]);

  const lineData = [
    { semester: '大一上', count: 3 },
    { semester: '大一下', count: 5 },
    { semester: '大二上', count: 7 },
    { semester: '大二下', count: 9 },
    { semester: '大三上', count: 12 },
    { semester: '大三下', count: 8 },
  ];

  return (
    <StateWrapper
      loading={loading}
      error={error}
      empty={!loading && !error && !profile}
      emptyMessage="暂无画像数据"
      onRetry={fetchData}
    >
      {profile && (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">我的画像</h1>
            <p className="text-sm text-gray-500 mt-1">基于你的学习行为数据构建的个性化学习画像</p>
          </div>

          {/* Basic info card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex flex-wrap items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                {profile.major.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{profile.student_id}</h2>
                <p className="text-sm text-gray-500">{profile.grade} | {profile.major}</p>
              </div>
              <div className="flex gap-6 ml-auto">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{profile.borrow_count}</div>
                  <div className="text-xs text-gray-400">借阅总数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">{profile.course_count}</div>
                  <div className="text-xs text-gray-400">课程数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{Math.round(profile.interest_stability * 100)}%</div>
                  <div className="text-xs text-gray-400">兴趣稳定度</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Radar chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">学科领域权重</h3>
              <RadarChart data={Object.entries(profile.domain_weights).map(([name, value]) => ({ name, value }))} />
            </div>

            {/* Word cloud (styled tag cloud) */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-4">兴趣关键词</h3>
              <WordCloud words={profile.interest_keywords} />
            </div>
          </div>

          {/* Line chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">阅读节奏</h3>
            <LineChart data={lineData} />
          </div>

          {/* Cross-interest analysis card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">&#x1F504;</span>
              <h3 className="text-base font-semibold text-gray-900">跨学科兴趣分析</h3>
            </div>
            {profile.analysis ? (
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                  {profile.analysis.type}
                </span>
                <span className="text-sm text-gray-500">交叉强度: {profile.analysis.strength}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${profile.cross_domain_signal ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                  {profile.cross_domain_signal ? '已检测到跨领域学习行为' : '暂未检测到跨领域行为'}
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">暂无分析数据</p>
            )}
          </div>

          {/* Cross-domain LLM discovery */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-purple-700 mb-2">🔮 跨界兴趣发现</h3>
            {loadingCross ? (
              <p className="text-purple-400 text-sm">正在分析你的兴趣图谱...</p>
            ) : (
              <p className="text-purple-800 text-sm leading-relaxed">{crossDomain || '点击生成跨领域阅读建议'}</p>
            )}
          </div>
        </div>
      )}
    </StateWrapper>
  );
}
