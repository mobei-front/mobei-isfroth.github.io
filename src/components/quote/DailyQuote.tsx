import { Quote, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DailyQuote() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://v2.xxapi.cn/api/aiqinggongyu');
      const data = await res.json();
      if (data?.code === 200 && data?.data) {
        const text = data.data;
        if (typeof text === 'string') {
          const parts = text.split('——');
          if (parts.length === 2) {
            setQuote(parts[0].trim());
            setAuthor(parts[1].trim());
          } else {
            setQuote(text);
            setAuthor('爱情公寓');
          }
        } else {
          setQuote('人生没有彩排，每一天都是现场直播。');
          setAuthor('爱情公寓');
        }
      } else {
        setQuote('最好的朋友就在身边，最爱的人就在对面。');
        setAuthor('爱情公寓');
      }
    } catch (err) {
      console.error('爱情公寓接口调用失败', err);
      setQuote('人生如逆旅，我亦是行人。愿你在风雨中依然保持内心的宁静。');
      setAuthor('每日一言');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuote();
  }, []);

  return (
    <div className="glass-card p-3 sm:p-4 md:p-5 lg:p-6 glow-border h-full flex flex-col justify-center">
      <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
        <Quote className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-cyan-glow/40 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {isLoading ? (
            <div className="text-midnight-300 text-sm py-4">加载中...</div>
          ) : (
            <>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-midnight-100 leading-relaxed italic font-serif">
                {quote}
              </p>
              <p className="mt-2.5 sm:mt-3 md:mt-4 lg:mt-5 text-right text-cyan-soft/70 text-xs sm:text-sm md:text-base font-script">
                —— {author}
              </p>
            </>
          )}
        </div>
        <button
          onClick={fetchQuote}
          className="p-1.5 sm:p-2 text-midnight-400 hover:text-cyan-glow transition-colors flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}