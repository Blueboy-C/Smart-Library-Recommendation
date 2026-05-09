import React from 'react';

interface Props {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  onRetry?: () => void;
}

export default function StateWrapper({ loading, error, empty, emptyMessage, children, onRetry }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-red-500 text-5xl mb-4">&#9888;</div>
        <p className="text-red-600 mb-2">加载失败</p>
        <p className="text-gray-500 text-sm mb-4">{error}</p>
        {onRetry && <button onClick={onRetry} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">重试</button>}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-gray-300 text-5xl mb-4">&#128189;</div>
        <p className="text-gray-500">{emptyMessage || '暂无数据'}</p>
      </div>
    );
  }
  return <>{children}</>;
}
