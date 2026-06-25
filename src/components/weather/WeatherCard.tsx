import { Cloud, Sun, Wind, Droplets } from 'lucide-react';

interface Props {
  compact?: boolean;
}

export default function WeatherCard({ compact }: Props) {
  if (compact) {
    return (
      <div className="glass-card p-2.5 sm:p-3 md:p-4 glow-border h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="text-cyan-glow animate-float relative">
              <Cloud className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              <Sun className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 absolute -top-0.5 -right-0.5 text-yellow-400/70" />
            </div>
            <div className="flex items-end gap-0.5 sm:gap-1">
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white">24</span>
              <span className="text-[10px] sm:text-xs md:text-sm text-midnight-200 mb-0.5 sm:mb-1">°C</span>
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 text-cyan-soft text-[10px] sm:text-xs md:text-sm">多云转晴</div>

          <div className="flex justify-around mt-1.5 sm:mt-2 md:mt-3 text-[9px] sm:text-[10px] md:text-xs">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 text-midnight-200">
              <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-cyan-glow/60" />
              <span>湿度 65%</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 text-midnight-200">
              <Wind className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-cyan-glow/60" />
              <span>风速 12km/h</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-5 lg:p-6 glow-border h-full flex flex-col justify-center">
      <div className="text-center">
        <div className="text-midnight-200 text-[10px] sm:text-xs">北京</div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="text-cyan-glow animate-float relative">
            <Cloud className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 absolute -top-0.5 -right-0.5 text-yellow-400/70" />
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-white">24</span>
            <span className="text-lg sm:text-xl text-midnight-200 mb-1">°C</span>
          </div>
        </div>
        <div className="mt-1 text-cyan-soft text-xs sm:text-sm">多云转晴</div>

        <div className="cyber-line my-2 sm:my-3" />

        <div className="flex justify-around text-[10px] sm:text-xs">
          <div className="flex items-center gap-1.5 text-midnight-200">
            <Droplets className="w-3.5 h-3.5 text-cyan-glow/60" />
            <span>湿度 65%</span>
          </div>
          <div className="flex items-center gap-1.5 text-midnight-200">
            <Wind className="w-3.5 h-3.5 text-cyan-glow/60" />
            <span>风速 12km/h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
