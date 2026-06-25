import { useEffect, useState } from 'react';
import { BookOpen, RefreshCw } from 'lucide-react';

interface HistoryEvent {
  year: string;
  month: string;
  day: string;
  event: string;
}

export default function HistoryToday() {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // 拉取历史上的今天
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://v2.xxapi.cn/api/history');
      const data = await res.json();
      if (data?.code === 200 && Array.isArray(data.data)) {
        const parsed = data.data.map((item: string) => {
          const match = item.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(.+)$/);
          if (match) {
            return {
              year: match[1],
              month: match[2],
              day: match[3],
              event: match[4],
            };
          }
          return { year: '', month: '', day: '', event: item };
        });
        setEvents(parsed);
      }
    } catch (err) {
      console.error('历史事件加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div className="glass-card p-2.5 sm:p-3 md:p-4 glow-border h-full flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3 flex-shrink-0">
        <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-white flex items-center gap-1.5 sm:gap-2 font-serif">
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-amber-400" />
          历史上的今天
          <span className="text-midnight-300 text-[9px] sm:text-[10px] md:text-xs ml-0.5">{dateStr}</span>
        </h3>
        <button
          onClick={fetchHistory}
          className="text-midnight-300 hover:text-cyan-glow transition-colors p-0.5 sm:p-1"
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5 overflow-y-auto flex-1 min-h-0">
        {loading ? (
          <div className="text-center text-midnight-300 text-[10px] sm:text-xs md:text-sm py-4 sm:py-6">加载中...</div>
        ) : events.length > 0 ? (
          events.slice(0, 6).map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-md hover:bg-white/5 transition-colors"
            >
              <span className="text-[9px] sm:text-[10px] md:text-xs text-amber-400 font-mono flex-shrink-0 pt-0.5">
                {item.year}
              </span>
              <span className="text-[10px] sm:text-xs md:text-sm text-midnight-100 truncate flex-1 font-serif">
                {item.event}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-midnight-300 text-[10px] sm:text-xs md:text-sm py-4 sm:py-6">暂无数据</div>
        )}
      </div>
    </div>
  );
}
