import ReactECharts from 'echarts-for-react';

interface Props { data: { semester: string; count: number }[]; }

export default function LineChart({ data }: Props) {
  const option = {
    xAxis: { type: 'category' as const, data: data.map(d => d.semester) },
    yAxis: { type: 'value' as const },
    series: [{ data: data.map(d => d.count), type: 'line', smooth: true, lineStyle: { color: '#3b82f6' }, areaStyle: { color: 'rgba(59,130,246,0.1)' } }],
    tooltip: { trigger: 'axis' as const },
  };
  return <ReactECharts option={option} style={{ height: 250 }} />;
}
