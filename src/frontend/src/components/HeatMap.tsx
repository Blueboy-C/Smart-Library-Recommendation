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
    if (!chartRef.current || data.length === 0) return;

    const chart = echarts.init(chartRef.current);

    // Extract unique domains and grades, preserving order
    const domains = [...new Set(data.map((d) => d.domain))];
    const grades = [...new Set(data.map((d) => d.grade))];

    // Build heatmap data: [gradeIndex, domainIndex, count]
    const heatData = data.map((d) => {
      const gradeIdx = grades.indexOf(d.grade);
      const domainIdx = domains.indexOf(d.domain);
      return [domainIdx, gradeIdx, d.count] as [number, number, number];
    });

    chart.setOption({
      tooltip: {
        position: 'top',
        formatter: (params: { value: [number, number, number] }) => {
          const [, , count] = params.value;
          return `借阅量: ${count}`;
        },
      },
      grid: {
        top: 20,
        right: 60,
        bottom: 40,
        left: 100,
      },
      xAxis: {
        type: 'category',
        data: domains,
        axisLabel: {
          color: '#6b7280',
          fontSize: 11,
          interval: 0,
          rotate: domains.length > 4 ? 25 : 0,
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
        max: Math.max(...data.map((d) => d.count)),
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
            show: true,
            color: '#1f2937',
            fontSize: 12,
            fontWeight: 500,
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

  return <div ref={chartRef} className="w-full h-full min-h-[300px]" />;
}
