import { useState, useEffect } from 'react';
import { getProfile } from '../../api/student';
import type { StudentProfile } from '../../types';
import RadarChart from '../../components/RadarChart';
import WordCloud from '../../components/WordCloud';
import LineChart from '../../components/LineChart';

export default function Profile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  const lineData = [
    { semester: '大一上', count: 3 },
    { semester: '大一下', count: 5 },
    { semester: '大二上', count: 7 },
    { semester: '大二下', count: 9 },
    { semester: '大三上', count: 12 },
    { semester: '大三下', count: 8 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
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
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🔄</span>
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
    </div>
  );
}
