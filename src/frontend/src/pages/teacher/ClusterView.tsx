import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import StateWrapper from '../../components/StateWrapper';

const CLUSTER_META: Record<string, { name: string; desc: string; icon: string; color: string }> = {
  deep_readers: { name: '课外深度阅读型', desc: '借阅量大、借阅时长长的学生', icon: '📚', color: '#3b82f6' },
  broad_explorers: { name: '跨领域探索型', desc: '借阅领域跨度大的学生', icon: '🔍', color: '#8b5cf6' },
  exam_driven: { name: '课内考试驱动型', desc: '仅在考试周借书的学生', icon: '📝', color: '#f59e0b' },
  dormant: { name: '无借阅休眠型', desc: '借书记录为零的学生', icon: '💤', color: '#9ca3af' },
};

const trendOption = {
  title: { text: '分群趋势变化', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis' as const },
  legend: { data: ['深度阅读型', '跨领域探索型', '考试驱动型', '休眠型'], bottom: 0 },
  xAxis: { type: 'category' as const, data: ['2024秋', '2025春', '2025秋', '2026春'] },
  yAxis: { type: 'value' as const },
  series: [
    { name: '深度阅读型', type: 'line' as const, data: [8, 10, 12, 15], smooth: true },
    { name: '跨领域探索型', type: 'line' as const, data: [20, 25, 30, 35], smooth: true },
    { name: '考试驱动型', type: 'line' as const, data: [35, 32, 28, 25], smooth: true },
    { name: '休眠型', type: 'line' as const, data: [37, 33, 30, 25], smooth: true },
  ],
};

export default function ClusterView() {
  const barRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clusterCounts, setClusterCounts] = useState<Record<string, number>>({});

  const fetchData = () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token') || '';
    const dept = JSON.parse(localStorage.getItem('user_info') || '{}').dept || '计算机';

    fetch(`http://localhost:8000/api/teacher/${encodeURIComponent(dept)}/clusters`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => {
        setClusterCounts(d.clusters || {});
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || '加载分群数据失败');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clusterKeys = Object.keys(clusterCounts).length > 0
    ? Object.keys(clusterCounts)
    : ['deep_readers', 'broad_explorers', 'exam_driven', 'dormant'];
  const totalStudents = clusterKeys.reduce((sum, k) => sum + (clusterCounts[k] || 0), 0);

  useEffect(() => {
    if (!barRef.current || loading || totalStudents === 0) return;
    const chart = echarts.init(barRef.current);
    chart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: { name: string; value: number }[]) => {
          const p = params[0];
          return `${p.name}: ${p.value} 人`;
        },
      },
      grid: { top: 20, right: 30, bottom: 50, left: 100 },
      xAxis: {
        type: 'value',
        name: '学生人数',
        nameTextStyle: { color: '#9ca3af', fontSize: 12 },
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      yAxis: {
        type: 'category',
        data: clusterKeys.map((k) => (CLUSTER_META[k]?.name || k)),
        axisLabel: { color: '#6b7280', fontSize: 12, fontWeight: 500 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [
        {
          type: 'bar',
          data: clusterKeys.map((k) => ({
            value: clusterCounts[k] || 0,
            itemStyle: {
              color: CLUSTER_META[k]?.color || '#3b82f6',
              borderRadius: [0, 6, 6, 0],
            },
          })),
          barWidth: 28,
          label: {
            show: true,
            position: 'right',
            formatter: (params: { value: number }) => `${params.value} 人`,
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
          },
        },
      ],
    });
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [loading, clusterCounts]);

  return (
    <StateWrapper
      loading={loading}
      error={error}
      empty={false}
      onRetry={fetchData}
    >
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">学生分群</h1>
          <p className="text-sm text-gray-500 mt-1">基于阅读行为将学生分为 {clusterKeys.length} 个群体，共 {totalStudents} 人</p>
        </div>

        {/* Cluster cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {clusterKeys.map((key) => {
            const meta = CLUSTER_META[key] || { name: key, desc: '', icon: '📊', color: '#6b7280' };
            const count = clusterCounts[key] || 0;
            const pct = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(0) : '0';
            return (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{meta.name}</h3>
                    <p className="text-xs text-gray-400">{pct}% 占比</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold" style={{ color: meta.color }}>
                    {count}
                  </span>
                  <span className="text-sm text-gray-400">人</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">{meta.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">分群规模对比</h3>
          <div ref={barRef} className="w-full h-72" />
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">分群趋势变化</h3>
          <ReactECharts option={trendOption} style={{ height: 300 }} />
        </div>
      </div>
    </StateWrapper>
  );
}
