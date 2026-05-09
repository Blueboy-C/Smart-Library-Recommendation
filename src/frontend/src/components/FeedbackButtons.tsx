import { useState } from 'react';

interface Props {
  itemId: string;
  onFeedback: (itemId: string, type: 'useful' | 'skip') => void;
}

export default function FeedbackButtons({ itemId, onFeedback }: Props) {
  const [feedback, setFeedback] = useState<'useful' | 'skip' | null>(null);

  const handleClick = (type: 'useful' | 'skip') => {
    if (feedback) return;
    setFeedback(type);
    onFeedback(itemId, type);
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <button
        onClick={() => handleClick('useful')}
        disabled={!!feedback}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          feedback === 'useful'
            ? 'bg-green-100 text-green-700 border border-green-200'
            : feedback
            ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 cursor-pointer'
        }`}
      >
        <span>✓</span>
        <span>有用</span>
      </button>
      <button
        onClick={() => handleClick('skip')}
        disabled={!!feedback}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          feedback === 'skip'
            ? 'bg-gray-200 text-gray-600 border border-gray-300'
            : feedback
            ? 'bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed'
            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 hover:text-gray-600 hover:border-gray-300 cursor-pointer'
        }`}
      >
        <span>✗</span>
        <span>跳过</span>
      </button>
    </div>
  );
}
