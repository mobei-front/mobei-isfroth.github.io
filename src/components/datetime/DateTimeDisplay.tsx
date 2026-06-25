import { useEffect, useState } from 'react';

// 计算北京时间
function getBeijingTime(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

// 补零
function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

interface Props {
  compact?: boolean;
}

export default function DateTimeDisplay({ compact }: Props) {
  const [time, setTime] = useState<Date>(getBeijingTime());

  // 每秒更新
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getBeijingTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = padZero(time.getHours());
  const minutes = padZero(time.getMinutes());
  const seconds = padZero(time.getSeconds());
  const year = time.getFullYear();
  const month = padZero(time.getMonth() + 1);
  const day = padZero(time.getDate());
  const weekDay = weekDays[time.getDay()];

  if (compact) {
    return (
      <div className="glass-card p-2.5 sm:p-3 md:p-4 glow-border h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="font-mono text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-cyan-glow glow-text tracking-wider">
            {hours}:{minutes}
            <span className="text-xs sm:text-sm md:text-base opacity-60">:{seconds}</span>
          </div>
          <div className="mt-0.5 sm:mt-1 text-midnight-100 text-[10px] sm:text-xs md:text-sm font-light font-serif">
            {month}月{day}日 · {weekDay}
          </div>
          <div className="mt-0.5 text-cyan-soft/60 text-[9px] sm:text-[10px] md:text-xs">
            北京时间
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-5 lg:p-6 glow-border h-full flex flex-col justify-center">
      <div className="text-center">
        <div className="font-mono text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-cyan-glow glow-text tracking-wider">
          {hours}:{minutes}
          <span className="text-xl sm:text-2xl lg:text-3xl opacity-60">:{seconds}</span>
        </div>
        <div className="mt-2 sm:mt-3 text-midnight-100 text-xs sm:text-sm lg:text-base font-light tracking-wide font-serif">
          {year}年{month}月{day}日 · {weekDay}
        </div>
        <div className="mt-1 text-cyan-soft/60 text-[10px] sm:text-xs">
          北京时间
        </div>
      </div>
    </div>
  );
}
