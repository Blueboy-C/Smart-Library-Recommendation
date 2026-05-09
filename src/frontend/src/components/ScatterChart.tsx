import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

interface ScatterData {
  domain: string;
  demand: number;
  supply: number;
}

interface Props {
  data: ScatterData[];
}

const DOMAIN_COLORS: Record<string, string> = {
  '自动化/计算机': '#3b82f6',
  '数学/物理/化学': '#8b5cf6',
  '电子技术/通信': '#f59e0b',
  '哲学/心理学': '#ef4444',
  '文化/教育/体育': '#10b981',
};

export default function ScatterChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = echarts.init(chartRef.current);

    const maxVal = Math.max(...data.map((d) => Math.max(d.demand, d.supply))) + 20;

    const scatterData = data.map((d) => ({
      value: [d.demand, d.supply],
      name: d.domain,
    }));

    chart.setOption({
      tooltip: {
        formatter: (params: { name: string; value: [number, number] }) => {
          return `<strong>${params.name}</strong><br/>学生需求: ${params.value[0]}<br/>馆藏供给: ${params.value[1]}`;
        },
      },
      grid: {
        top: 30,
        right: 30,
        bottom: 50,
        left: 60,
      },
      xAxis: {
        type: 'value',
        name: '学生需求 (人数)',
        nameTextStyle: { color: '#9ca3af', fontSize: 12 },
        axisLabel: { color: '#9ca3af' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        min: 0,
        max: maxVal,
      },
      yAxis: {
        type: 'value',
        name: '馆藏供给 (册数)',
        nameTextStyle: { color: '#9ca3af', fontSize: 12 },
        axisLabel: { color: '#9ca3af' },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        splitLine: { lineStyle: { color: '#f3f4f6' } },
        min: 0,
        max: maxVal,
      },
      series: [
        {
          type: 'scatter',
          data: scatterData,
          symbolSize: (value: [number, number]) => {
            const total = value[0] + value[1];
            return 12 + total * 0.08;
          },
          itemStyle: {
            color: (params: { name: string }) => {
              return DOMAIN_COLORS[params.name] || '#3b82f6';
            },
            borderColor: '#fff',
            borderWidth: 1,
            shadowBlur: 5,
            shadowColor: 'rgba(0,0,0,0.1)',
          },
          label: {
            show: true,
            formatter: (params: { name: string }) => params.name,
            position: 'top',
            fontSize: 11,
            color: '#6b7280',
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowColor: 'rgba(0,0,0,0.3)',
            },
          },
        },
        // Reference line y=x
        {
          type: 'line',
          data: [
            [0, 0],
            [maxVal, maxVal],
          ],
          symbol: 'none',
          lineStyle: {
            color: '#ef4444',
            type: 'dashed',
            width: 2,
          },
          label: {
            show: true,
            formatter: '供给=需求',
            position: 'end',
            fontSize: 11,
            color: '#ef4444',
          },
          silent: true,
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
