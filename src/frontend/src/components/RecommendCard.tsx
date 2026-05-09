import { useNavigate } from 'react-router-dom';
import type { RecommendItem } from '../types';

interface Props {
  item: RecommendItem;
  feedback?: 'useful' | 'skip';
  onFeedback: (itemId: string, type: 'useful' | 'skip') => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  book: { label: '图书', color: 'bg-blue-100 text-blue-700' },
  course: { label: '课程', color: 'bg-purple-100 text-purple-700' },
  activity: { label: '活动', color: 'bg-orange-100 text-orange-700' },
};

export default function RecommendCard({ item, feedback, onFeedback }: Props) {
  const navigate = useNavigate();
  const t = typeLabels[item.item_type];

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-200 cursor-pointer"
      onClick={() => navigate(`/resource/${item.item_type}/${item.item_id}`)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${t.color}`}>
              {t.label}
            </span>
            {!item.available && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-600">
                已借出
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold text-gray-900 truncate">{item.title}</h3>
          <p className="text-sm text-gray-400 italic mt-1">"{item.reason}"</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">
              {Math.round(item.score * 100)}%
            </span>
          </div>
        </div>
      </div>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onFeedback(item.item_id, 'useful')}
            disabled={feedback != null}
            className={`px-3 py-1 text-xs rounded ${
              feedback === 'useful'
                ? 'bg-green-500 text-white'
                : feedback
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 text-green-600 hover:bg-green-50'
            }`}
          >
            {feedback === 'useful' ? '✓ 已标记有用' : '有用'}
          </button>
          <button
            onClick={() => onFeedback(item.item_id, 'skip')}
            disabled={feedback != null}
            className={`px-3 py-1 text-xs rounded ${
              feedback === 'skip'
                ? 'bg-red-300 text-white'
                : feedback
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {feedback === 'skip' ? '✗ 已跳过' : '跳过'}
          </button>
        </div>
      </div>
    </div>
  );
}
