import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { getProfile } from '../../api/mock';
import type { StudentProfile } from '../../types';

export default function Profile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const radarRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfile().then((p) => {
      setProfile(p);
      setLoading(false);
    });
  }, []);

  // Radar chart
  useEffect(() => {
    if (!profile || !radarRef.current) return;
    const chart = echarts.init(radarRef.current);
    const domains = Object.entries(profile.domain_weights);
    chart.setOption({
      radar: {
        indicator: domains.map(([name]) => ({ name, max: 1 })),
        shape: 'circle',
        splitArea: { areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.05)'] } },
        axisLine: { lineStyle: { color: 'rgba(59,130,246,0.2)' } },
      },
      series: [{
        type: 'radar',
        data: [{ value: domains.map(([, v]) => v), name: '学科权重' }],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: { color: 'rgba(59,130,246,0.15)' },
      }],
    });
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
  }, [profile]);

  // Line chart (simulated reading rhythm)
  useEffect(() => {
    if (!lineRef.current) return;
    const chart = echarts.init(lineRef.current);
    chart.setOption({
      xAxis: {
        type: 'category',
        data: ['大一上', '大一下', '大二上', '大二下', '大三上', '大三下'],
        axisLabel: { color: '#9ca3af', fontSize: 12 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        name: '借阅册数',
        nameTextStyle: { color: '#9ca3af', fontSize: 12 },
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      series: [
        {
          name: '借阅量',
          type: 'line',
          data: [3, 5, 7, 9, 12, 8],
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#8b5cf6', width: 3 },
          itemStyle: { color: '#8b5cf6' },
          areaStyle: { color: 'rgba(139,92,246,0.1)' },
        },
      ],
      grid: { top: 20, right: 20, bottom: 30, left: 50 },
    });
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.dispose(); };
  }, []);

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
          <div ref={radarRef} className="w-full h-72" />
        </div>

        {/* Word cloud (styled tag cloud) */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">兴趣关键词</h3>
          <div className="flex flex-wrap items-center gap-3 h-72 content-center">
            {profile.interest_keywords.map(([word, weight]) => (
              <span
                key={word}
                className="inline-block rounded-full transition-all hover:scale-110 hover:shadow-md cursor-default"
                style={{
                  fontSize: `${0.75 + weight * 4}rem`,
                  fontWeight: weight > 0.08 ? 700 : 500,
                  padding: `${0.25 + weight * 1}rem ${0.5 + weight * 2}rem`,
                  backgroundColor: `rgba(59,130,246,${0.05 + weight * 0.6})`,
                  color: `rgba(30,64,175,${0.6 + weight * 0.4})`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Line chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">阅读节奏</h3>
        <div ref={lineRef} className="w-full h-64" />
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
