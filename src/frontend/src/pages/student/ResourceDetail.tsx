import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getBookDetail, getRelatedBooks } from '../../api/student';

interface BookData {
  book_id: string;
  title: string;
  author: string;
  publisher: string;
  publish_year: number;
  clc_number: string;
  summary: string;
  total_copies: number;
  available_copies: number;
}

export default function ResourceDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<'useful' | 'skip' | null>(null);
  const [book, setBook] = useState<BookData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getBookDetail(id)
      .then((data: BookData) => {
        if (!data || !data.book_id) throw new Error('图书不存在');
        setBook(data);
      })
      .catch((err: Error) => {
        console.error('Failed to fetch book:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch related books
  useEffect(() => {
    if (!id) return;
    getRelatedBooks(id)
      .then(setRelated)
      .catch(() => {});
  }, [id]);

  // Track stay duration
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

  // ── Loading skeleton ──────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
          &larr; 返回
        </button>
        <div className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="flex gap-6">
            <div className="h-5 bg-gray-200 rounded w-24" />
            <div className="h-5 bg-gray-200 rounded w-32" />
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex gap-4">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-6 bg-gray-200 rounded w-28" />
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="h-5 bg-gray-200 rounded w-16 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-1" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────
  if (error || !book) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">
          &larr; 返回
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">加载失败</h2>
          <p className="text-red-600 mb-4">{error || '无法获取图书信息'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  // ── Normal render ─────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline mb-4">&larr; 返回</button>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <div className="flex gap-6 text-gray-600 flex-wrap">
          <span>作者：{book.author}</span>
          <span>出版社：{book.publisher}</span>
          <span>出版年：{book.publish_year}</span>
        </div>
        <div className="flex gap-4 text-sm flex-wrap">
          <span className="bg-blue-100 px-2 py-1 rounded">分类号：{book.clc_number}</span>
          <span
            className={
              book.available_copies > 0
                ? 'bg-green-100 px-2 py-1 rounded text-green-700'
                : 'bg-red-100 px-2 py-1 rounded text-red-700'
            }
          >
            {book.available_copies > 0
              ? `在馆 ${book.available_copies}/${book.total_copies} 本`
              : '已全部借出（可预约）'}
          </span>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">内容简介</h3>
          <p className="text-gray-700">{book.summary}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
          <p className="text-sm text-blue-800">
            &#x1F4D6; 推荐理由：和你阅读偏好相似的同学也在读这本书，且在你的"自动化/计算机"知识领域内
          </p>
        </div>
        <div className="flex gap-3 pt-4 flex-wrap">
          <button className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">收藏</button>
          {book.available_copies === 0 && (
            <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">预约</button>
          )}
          {feedback !== 'useful' && (
            <button
              onClick={() => setFeedback('useful')}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              有用 &#x2713;
            </button>
          )}
          {feedback !== 'skip' && (
            <button
              onClick={() => setFeedback('skip')}
              className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              跳过 &#x2717;
            </button>
          )}
        </div>

        {/* Related books */}
        {related.length > 0 && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-semibold text-gray-700 mb-3">📚 借了这本书的人也借了</h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map((r: any) => (
                <Link key={r.book_id} to={`/resource/book/${r.book_id}`}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.author} · {r.borrow_count}人借阅</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
