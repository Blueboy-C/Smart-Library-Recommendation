import ReactECharts from 'echarts-for-react';

interface Props { data: { name: string; value: number }[]; }

export default function RadarChart({ data }: Props) {
  const option = {
    radar: { indicator: data.map(d => ({ name: d.name, max: 1 })), shape: 'polygon', center: ['50%', '50%'], radius: '70%' },
    series: [{ type: 'radar', data: [{ value: data.map(d => d.value), name: '领域分布', areaStyle: { color: 'rgba(59,130,246,0.2)' }, lineStyle: { color: '#3b82f6' } }] }],
  };
  return <ReactECharts option={option} style={{ height: 320 }} />;
}
