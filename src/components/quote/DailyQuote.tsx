import { Quote } from 'lucide-react';

export default function DailyQuote() {
  return (
    <div className="glass-card p-3 sm:p-4 md:p-5 lg:p-6 glow-border h-full flex flex-col justify-center">
      <div className="flex items-start gap-2.5 sm:gap-3 md:gap-4">
        <Quote className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-cyan-glow/40 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-midnight-100 leading-relaxed italic font-serif">
            人生如逆旅，我亦是行人。愿你在风雨中依然保持内心的宁静，在黑暗中依然追寻光明的方向。
          </p>
          <p className="mt-2.5 sm:mt-3 md:mt-4 lg:mt-5 text-right text-cyan-soft/70 text-xs sm:text-sm md:text-base font-script">
            —— 每日一言
          </p>
        </div>
      </div>
    </div>
  );
}
