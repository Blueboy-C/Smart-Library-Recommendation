import { useRef, useEffect, useState } from 'react';
import * as echarts from 'echarts';
import StateWrapper from '../../components/StateWrapper';

const MOCK_CLUSTERS: Record<string, { count: number; desc: string; icon: string }> = {
  deep_readers: { count: 12, desc: '深度阅读者 — 专注特定领域，阅读周期长，借阅频率稳定，偏好专业深度书籍', icon: '📚' },
  broad_explorers: { count: 35, desc: '广博探索者 — 跨学科涉猎广泛，借阅种类丰富，兴趣广度大但深度相对较浅', icon: '🌐' },
  exam_driven: { count: 28, desc: '应试导向型 — 阅读集中与课程/考证相关，有明显的季节性规律，考前借阅量激增', icon: '🎯' },
  dormant: { count: 25, desc: '休眠型 — 借阅频率低，活跃度不足，可能需要阅读引导或兴趣激发', icon: '💤' },
};

const CLUSTER_KEYS = ['deep_readers', 'broad_explorers', 'exam_driven', 'dormant'];

const CLUSTER_LABELS: Record<string, string> = {
  deep_readers: '深度阅读者',
  broad_explorers: '广博探索者',
  exam_driven: '应试导向型',
  dormant: '休眠型',
};

const CLUSTER_COLORS: Record<string, string> = {
  deep_readers: '#3b82f6',
  broad_explorers: '#8b5cf6',
  exam_driven: '#f59e0b',
  dormant: '#9ca3af',
};

export default function ClusterView() {
  const barRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!barRef.current || loading) return;
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
        data: CLUSTER_KEYS.map((k) => CLUSTER_LABELS[k]),
        axisLabel: { color: '#6b7280', fontSize: 12, fontWeight: 500 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      series: [
        {
          type: 'bar',
          data: CLUSTER_KEYS.map((k) => ({
            value: MOCK_CLUSTERS[k].count,
            itemStyle: {
              color: CLUSTER_COLORS[k],
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
  }, [loading]);

  const totalStudents = CLUSTER_KEYS.reduce((sum, k) => sum + MOCK_CLUSTERS[k].count, 0);

  return (
    <StateWrapper
      loading={loading}
      error={error}
      empty={false}
      onRetry={() => {
        setLoading(true);
        setError(null);
        setTimeout(() => setLoading(false), 500);
      }}
    >
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">学生分群</h1>
          <p className="text-sm text-gray-500 mt-1">基于阅读行为将学生分为 {CLUSTER_KEYS.length} 个群体，共 {totalStudents} 人</p>
        </div>

        {/* Cluster cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {CLUSTER_KEYS.map((key) => {
            const cluster = MOCK_CLUSTERS[key];
            const pct = ((cluster.count / totalStudents) * 100).toFixed(0);
            return (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{cluster.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{CLUSTER_LABELS[key]}</h3>
                    <p className="text-xs text-gray-400">{pct}% 占比</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold" style={{ color: CLUSTER_COLORS[key] }}>
                    {cluster.count}
                  </span>
                  <span className="text-sm text-gray-400">人</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: CLUSTER_COLORS[key],
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">{cluster.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">分群规模对比</h3>
          <div ref={barRef} className="w-full h-72" />
        </div>
      </div>
    </StateWrapper>
  );
}
