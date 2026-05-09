import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const MOCK_BOOKS: Record<string, any> = {
  'B001': { title: '机器学习实战', author: 'Peter Harrington', publisher: '人民邮电出版社', year: 2013, clc: 'TP181', summary: '通过实际案例讲解机器学习算法应用，涵盖分类、回归、聚类等核心算法。', total: 5, available: 2, location: '图书馆3层A区' },
  'B002': { title: '统计学习方法', author: '李航', publisher: '清华大学出版社', year: 2019, clc: 'TP181', summary: '系统介绍统计学习方法的基本理论和算法实现。', total: 3, available: 1, location: '图书馆3层A区' },
  'B003': { title: '深度学习', author: 'Ian Goodfellow', publisher: '人民邮电出版社', year: 2017, clc: 'TP181', summary: '深度学习领域的奠基之作，系统介绍神经网络和深度学习方法。', total: 4, available: 0, location: '图书馆3层B区' },
};

export default function ResourceDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'useful' | 'skip' | null>(null);

  const book = MOCK_BOOKS[id || 'B001'] || MOCK_BOOKS['B001'];

  useEffect(() => {
    const handleLeave = () => {
      const staySeconds = (Date.now() - startTime) / 1000;
      console.log(`[Behavior] stay=${staySeconds.toFixed(1)}s on ${type}/${id}`);
    };
    window.addEventListener('beforeunload', handleLeave);
    return () => {
      handleLeave();
      window.removeEventListener('beforeunload', handleLeave);
    };
  }, [startTime, type, id]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">← 返回</button>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <div className="flex gap-6 text-gray-600">
          <span>作者：{book.author}</span>
          <span>出版社：{book.publisher}</span>
          <span>出版年：{book.year}</span>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="bg-blue-100 px-2 py-1 rounded">分类号：{book.clc}</span>
          <span className={book.available > 0 ? 'bg-green-100 px-2 py-1 rounded text-green-700' : 'bg-red-100 px-2 py-1 rounded text-red-700'}>
            {book.available > 0 ? `在馆 ${book.available}/${book.total} 本` : '已全部借出（可预约）'}
          </span>
          <span>馆藏位置：{book.location}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">内容简介</h3>
          <p className="text-gray-700">{book.summary}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          <p className="text-sm text-blue-800">📖 推荐理由：和你阅读偏好相似的同学也在读这本书，且在你的"自动化/计算机"知识领域内</p>
        </div>
        <div className="flex gap-3 pt-4">
          <button className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">收藏</button>
          {book.available === 0 && <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">预约</button>}
          {feedback !== 'useful' && <button onClick={() => setFeedback('useful')} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">有用 ✓</button>}
          {feedback !== 'skip' && <button onClick={() => setFeedback('skip')} className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">跳过 ✗</button>}
        </div>
      </div>
    </div>
  );
}
