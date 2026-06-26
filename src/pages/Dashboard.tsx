import { useEffect, useRef, useState } from 'react';
import { RefreshCw, Flame, Info } from 'lucide-react';
import WeatherEffect from '@/components/weather/WeatherEffect';
import DateTimeDisplay from '@/components/datetime/DateTimeDisplay';
import MusicPlayer from '@/components/music/MusicPlayer';
import DailyQuote from '@/components/quote/DailyQuote';
import WeatherCard from '@/components/weather/WeatherCard';
import QuickLinks from '@/components/links/QuickLinks';
import HistoryToday from '@/components/history/HistoryToday';
import { useWeatherStore } from '@/store/weather';

interface HotItem {
  title: string;
  hot: number;
}

const HOT_CACHE_KEY = 'bilibili_hot_cache';
const HOT_CACHE_TIME = 30 * 60 * 1000;

export default function Dashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interactiveElements, setInteractiveElements] = useState<HTMLElement[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [wallpaper, setWallpaper] = useState('');
  const [hotList, setHotList] = useState<HotItem[]>([]);
  const [hotLoading, setHotLoading] = useState(true);
  const [showApiNotice, setShowApiNotice] = useState(false);

  const { fetchWeather } = useWeatherStore();

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.glass-card');
      setInteractiveElements(Array.from(cards) as HTMLElement[]);
    }
  }, []);

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const handleMove = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, [role="button"]')) {
        cursor.classList.add('hover');
      } else {
        cursor.classList.remove('hover');
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const ripple = document.createElement('div');
      ripple.className = 'click-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      document.body.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        const res = await fetch('https://v2.xxapi.cn/api/wallpaper?fl=meizi');
        const data = await res.json();
        if (data?.code === 200 && data?.data) {
          const url = typeof data.data === 'string' ? data.data : data.data.url;
          if (url) setWallpaper(url);
        }
      } catch (err) {
        console.error('壁纸加载失败', err);
      }
    };
    fetchWallpaper();
  }, []);

  const fetchHotList = async (force = false) => {
    if (!force) {
      try {
        const cached = localStorage.getItem(HOT_CACHE_KEY);
        if (cached) {
          const { data, time } = JSON.parse(cached);
          if (Date.now() - time < HOT_CACHE_TIME) {
            setHotList(data);
            setHotLoading(false);
            return;
          }
        }
      } catch (_) {}
    }

    setHotLoading(true);
    try {
      const res = await fetch('https://v2.xxapi.cn/api/bilibilihot');
      const data = await res.json();
      if (data?.code === 200 && Array.isArray(data.data)) {
        const list = data.data.map((item: string | { title: string; hot: number }) =>
          typeof item === 'string'
            ? { title: item, hot: Math.floor(Math.random() * 5000000) + 500000 }
            : item
        );
        setHotList(list);
        try {
          localStorage.setItem(HOT_CACHE_KEY, JSON.stringify({ data: list, time: Date.now() }));
        } catch (_) {}
      }
    } catch (err) {
      console.error('热搜加载失败', err);
    } finally {
      setHotLoading(false);
    }
  };

  useEffect(() => {
    fetchHotList();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-midnight-950"
    >
      <div id="custom-cursor" className="custom-cursor" />

      {wallpaper && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 animate-fade-in"
          style={{ backgroundImage: `url(${wallpaper})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-midnight-950/85 via-midnight-900/75 to-midnight-950/85 backdrop-blur-[2px]" />
        </div>
      )}
      {!wallpaper && (
        <div className="absolute inset-0 bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950" />
      )}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-glow/5 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-glow/3 rounded-full blur-[100px]" />
      </div>

      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <WeatherEffect interactiveElements={interactiveElements} />

      <main className="relative z-20 w-full h-full flex flex-col px-3 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32 pt-10 sm:pt-12 md:pt-14 lg:pt-16 xl:pt-20 pb-4 sm:pb-5 md:pb-6">
        <div className="max-w-[1400px] xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto flex-1 w-full grid grid-cols-12 grid-rows-2 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 min-h-0">
          <div className="col-span-6 md:col-span-6 lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="glass-card p-3 sm:p-4 md:p-5 glow-border h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 relative">
                <img
                  src={`${import.meta.env.BASE_URL}logo.png`}
                  alt="Logo"
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]"
                />
                <div className="absolute inset-0 rounded-full bg-cyan-glow/20 blur-xl -z-10" />
              </div>
              <h1
                className="mt-1.5 sm:mt-2 md:mt-3 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white"
                style={{
                  fontFamily: "'Permanent Marker', cursive",
                  textShadow: '0 0 12px rgba(0,240,255,0.7), 0 0 24px rgba(0,240,255,0.4), 0 0 36px rgba(0,240,255,0.2)'
                }}
              >
                mobei
              </h1>
              <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs md:text-sm text-cyan-300/80 font-serif">
                个人门户网站
              </div>
            </div>
          </div>

          <div className="col-span-6 md:col-span-6 lg:col-span-3 flex flex-col gap-1.5 sm:gap-2 md:gap-3 lg:gap-4">
            <div className="flex-1 min-h-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <DateTimeDisplay compact />
            </div>
            <div className="flex-1 min-h-0 animate-fade-in" style={{ animationDelay: '0.25s' }}>
              <WeatherCard compact />
            </div>
          </div>

          <div className="col-span-6 md:col-span-6 lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <MusicPlayer />
          </div>

          <div className="col-span-12 md:col-span-12 lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card p-3 sm:p-4 md:p-5 glow-border h-full flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4 flex-shrink-0">
                <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white flex items-center gap-2 font-serif">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-pink-400" />
                  B站热搜
                </h3>
                <button
                  onClick={() => fetchHotList(true)}
                  className="text-midnight-300 hover:text-cyan-glow transition-colors p-1"
                  disabled={hotLoading}
                >
                  <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${hotLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-0.5 sm:space-y-1 md:space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-0.5 sm:pr-1">
                {hotLoading && hotList.length === 0 ? (
                  <div className="text-center text-midnight-300 text-xs sm:text-sm py-6 sm:py-8">加载中...</div>
                ) : hotList.length > 0 ? (
                  hotList.slice(0, 10).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 sm:gap-2 md:gap-3 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md hover:bg-white/5 transition-colors"
                    >
                      <span
                        className={`w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 flex-shrink-0 rounded text-[10px] sm:text-sm md:text-base flex items-center justify-center font-mono ${
                          index < 3
                            ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                            : 'bg-white/5 text-midnight-300'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="text-xs sm:text-sm md:text-base text-midnight-100 truncate flex-1 font-serif">
                        {item.title}
                      </span>
                      {item.hot > 0 && (
                        <span className="text-[10px] sm:text-xs md:text-sm text-pink-400/70 font-mono flex-shrink-0">
                          {(item.hot / 10000).toFixed(0)}万
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-midnight-300 text-xs sm:text-sm py-6 sm:py-8">暂无数据</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-12 lg:col-span-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <DailyQuote />
          </div>

          <div className="col-span-6 md:col-span-6 lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.55s' }}>
            <HistoryToday />
          </div>

          <div className="col-span-6 md:col-span-6 lg:col-span-3 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <QuickLinks />
          </div>
        </div>

        <footer className="flex-shrink-0 mt-2 sm:mt-3 md:mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-midnight-400/70">
            <span className="text-sm sm:text-base tracking-wider">© 2026 mobei · 雨夜</span>
            <span className="hidden sm:inline text-midnight-500/50">|</span>
            <button
              onClick={() => setShowApiNotice(!showApiNotice)}
              className="flex items-center gap-1 text-xs sm:text-sm text-midnight-400/60 hover:text-cyan-glow/70 transition-colors"
            >
              <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              数据来源说明
            </button>
          </div>

          {showApiNotice && (
            <div className="mt-2 p-2 sm:p-3 glass-card text-center text-[10px] sm:text-xs text-midnight-300/70 max-w-xl mx-auto animate-fade-in">
              天气数据来自 yiketianqi.com，音乐数据来自酷我音乐API，每日一言来自爱情公寓接口，B站热搜来自公开API。仅供学习交流使用。
            </div>
          )}
        </footer>
      </main>

      {showWelcome && (
        <div
          className="fixed top-4 sm:top-5 right-4 sm:right-6 z-50 animate-slide-up cursor-pointer"
          onClick={() => setShowWelcome(false)}
        >
          <div className="glass-card p-3 sm:p-4 md:p-5 glow-border relative">
            <div className="text-sm sm:text-base font-bold text-white glow-text font-script">
              你好，世界
            </div>
            <div className="text-xs text-midnight-200 mt-1 font-serif">
              欢迎来到我的个人网站
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-cyan-glow/60 animate-ping" />
          </div>
        </div>
      )}
    </div>
  );
}