import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

interface HeatMapData {
  domain: string;
  count: number;
  grade: string;
  major: string;
}

interface Props {
  data: HeatMapData[];
}

export default function HeatMap({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);

    if (data.length === 0) {
      chart.setOption({});
      return;
    }

    // Extract unique domains and grades, preserving order
    const domains = [...new Set(data.map((d) => d.domain))];
    const grades = [...new Set(data.map((d) => d.grade))];

    // Build heatmap data: [domainIndex, gradeIndex, count]
    const heatData = data.map((d) => {
      const gradeIdx = grades.indexOf(d.grade);
      const domainIdx = domains.indexOf(d.domain);
      return [domainIdx, gradeIdx, d.count] as [number, number, number];
    });

    const maxLabelSize = domains.length > 8 ? 8 : domains.length > 5 ? 10 : 12;
    const showLabels = domains.length <= 10;

    chart.setOption({
      tooltip: {
        position: 'top',
        formatter: (params: { value: [number, number, number] }) => {
          const [di, gi, count] = params.value;
          return `${domains[di]} × ${grades[gi]}<br/>借阅量: <b>${count}</b>`;
        },
      },
      grid: {
        top: 20,
        right: 60,
        bottom: 60,
        left: 100,
      },
      xAxis: {
        type: 'category',
        data: domains,
        axisLabel: {
          color: '#6b7280',
          fontSize: 10,
          interval: 0,
          rotate: domains.length > 4 ? 30 : 0,
          overflow: 'truncate',
          width: domains.length > 8 ? 50 : undefined,
        },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitArea: { show: true, areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.05)'] } },
      },
      yAxis: {
        type: 'category',
        data: grades,
        axisLabel: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitArea: { show: true, areaStyle: { color: ['rgba(59,130,246,0.02)', 'rgba(59,130,246,0.05)'] } },
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map((d) => d.count), 1),
        calculable: true,
        orient: 'vertical',
        right: 0,
        top: 20,
        bottom: 40,
        inRange: {
          color: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7', '#0369a1'],
        },
        textStyle: { color: '#6b7280', fontSize: 11 },
      },
      series: [
        {
          type: 'heatmap',
          data: heatData,
          label: {
            show: showLabels,
            color: '#ffffff',
            fontSize: maxLabelSize,
            fontWeight: 600,
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowBlur: 1,
            formatter: (params: { value: [number, number, number] }) => {
              return params.value[2] > 0 ? String(params.value[2]) : '';
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.2)',
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
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-gray-50 rounded-lg">
        <span className="text-4xl mb-3">📊</span>
        <p className="text-gray-400 text-sm">暂无热力图数据</p>
        <p className="text-gray-300 text-xs mt-1">请检查筛选条件或确认数据已导入</p>
      </div>
    );
  }

  return <div ref={chartRef} className="w-full h-full min-h-[300px]" />;
}
