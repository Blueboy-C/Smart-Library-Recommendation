import { useState, useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import HeatMap from '../../components/HeatMap';
import ScatterChart from '../../components/ScatterChart';
import StateWrapper from '../../components/StateWrapper';

const MOCK_HEATMAP = [
  { domain: '自动化/计算机', count: 145, grade: '2022级', major: '计算机科学与技术' },
  { domain: '自动化/计算机', count: 132, grade: '2023级', major: '软件工程' },
  { domain: '数学/物理/化学', count: 89, grade: '2022级', major: '计算机科学与技术' },
  { domain: '电子技术/通信', count: 76, grade: '2023级', major: '电子信息工程' },
  { domain: '哲学/心理学', count: 45, grade: '2022级', major: '软件工程' },
  { domain: '自动化/计算机', count: 98, grade: '2024级', major: '人工智能' },
  { domain: '数学/物理/化学', count: 67, grade: '2023级', major: '数学与应用数学' },
  { domain: '文化/教育/体育', count: 34, grade: '2023级', major: '计算机科学与技术' },
];

const MOCK_GAP = [
  { domain: '自动化/计算机', demand: 145, supply: 89 },
  { domain: '数学/物理/化学', demand: 89, supply: 120 },
  { domain: '电子技术/通信', demand: 76, supply: 55 },
  { domain: '哲学/心理学', demand: 45, supply: 30 },
  { domain: '文化/教育/体育', demand: 34, supply: 62 },
];

const deviationData = {
  domains: ['自动化/计算机', '数学/物理', '电子/通信', '文学', '哲学/心理'],
  inclass: [120, 85, 70, 30, 25],
  outclass: [145, 60, 55, 45, 35],
};

const deviationOption = {
  title: { text: '课内外偏离度', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'axis' as const },
  legend: { data: ['课内选课', '课外借阅'], bottom: 0 },
  xAxis: { type: 'category' as const, data: deviationData.domains },
  yAxis: { type: 'value' as const },
  series: [
    { name: '课内选课', type: 'bar' as const, data: deviationData.inclass, itemStyle: { color: '#3b82f6' } },
    { name: '课外借阅', type: 'bar' as const, data: deviationData.outclass, itemStyle: { color: '#f59e0b' } },
  ],
};

const GRADES = ['全部', '2022级', '2023级', '2024级'];
const DEPARTMENTS = ['全部', '计算机科学与技术', '软件工程', '电子信息工程', '人工智能', '数学与应用数学'];

export default function InterestOverview() {
  const [grade, setGrade] = useState('全部');
  const [department, setDepartment] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate data fetch
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredHeat = MOCK_HEATMAP.filter(
    (d) => (grade === '全部' || d.grade === grade) && (department === '全部' || d.major === department)
  );

  // Aggregate domain counts for bar chart
  const domainTotals: Record<string, number> = {};
  for (const d of MOCK_HEATMAP) {
    domainTotals[d.domain] = (domainTotals[d.domain] || 0) + d.count;
  }
  const topDomains = Object.entries(domainTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Bar chart
  useEffect(() => {
    if (!barRef.current || loading) return;
    const chart = echarts.init(barRef.current);
    chart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { top: 20, right: 20, bottom: 60, left: 50 },
      xAxis: {
        type: 'category',
        data: topDomains.map(([d]) => d),
        axisLabel: { color: '#6b7280', fontSize: 11, interval: 0, rotate: 20 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
      },
      yAxis: {
        type: 'value',
        name: '借阅量',
        nameTextStyle: { color: '#9ca3af', fontSize: 12 },
        axisLabel: { color: '#9ca3af' },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
      },
      series: [
        {
          type: 'bar',
          data: topDomains.map(([, v]) => v),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#93c5fd' },
            ]),
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2563eb' },
                { offset: 1, color: '#60a5fa' },
              ]),
            },
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

  return (
    <StateWrapper
      loading={loading}
      error={error}
      empty={false}
      onRetry={() => {
        setLoading(true);
        setError(null);
        setTimeout(() => setLoading(false), 600);
      }}
    >
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">兴趣总览</h1>
          <p className="text-sm text-gray-500 mt-1">学生阅读兴趣的宏观视图与资源供需分析</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 font-medium">年级:</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500 font-medium">院系:</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Heatmap + Top Domains */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1 lg:w-[60%] bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">学科-年级热力图</h3>
            <div className="h-80">
              <HeatMap data={filteredHeat} />
            </div>
          </div>
          <div className="flex-1 lg:w-[40%] bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">TOP 10 学科领域</h3>
            <div className="h-80">
              <div ref={barRef} className="w-full h-full" />
            </div>
          </div>
        </div>

        {/* Scatter chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">资源供需缺口分析</h3>
          <p className="text-xs text-gray-400 mb-4">红色虚线为供给=需求基准线，点越靠左上方表示供给相对充足，越靠右下方表示资源紧缺</p>
          <div className="h-80">
            <ScatterChart data={MOCK_GAP} />
          </div>
        </div>

        {/* Deviation chart */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">课内外偏离度</h3>
          <ReactECharts option={deviationOption} style={{ height: 300 }} />
        </div>
      </div>
    </StateWrapper>
  );
}
