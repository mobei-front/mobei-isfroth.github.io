import { Cloud, Sun, Wind, Droplets, CloudRain, Snowflake, CloudLightning, CloudFog, Eye, Gauge, Sunrise, Sunset, ThermometerSun, Activity, CloudOff, RefreshCw } from 'lucide-react';
import { useWeatherStore } from '@/store/weather';

interface Props {
  compact?: boolean;
}

function getWeatherIcon(weather: string) {
  if (weather.includes('晴')) return Sun;
  if (weather.includes('雨')) return CloudRain;
  if (weather.includes('雪')) return Snowflake;
  if (weather.includes('雷')) return CloudLightning;
  if (weather.includes('雾') || weather.includes('霾')) return CloudFog;
  return Cloud;
}

function getAqiLevel(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: '优', color: 'text-green-400' };
  if (aqi <= 100) return { label: '良', color: 'text-yellow-400' };
  if (aqi <= 150) return { label: '轻度污染', color: 'text-orange-400' };
  if (aqi <= 200) return { label: '中度污染', color: 'text-red-400' };
  if (aqi <= 300) return { label: '重度污染', color: 'text-purple-400' };
  return { label: '严重污染', color: 'text-red-600' };
}

export default function WeatherCard({ compact }: Props) {
  const { data, isLoading, error, fetchWeather } = useWeatherStore();
  const weather = data;

  if (isLoading) {
    return (
      <div className="glass-card p-4 glow-border h-full flex flex-col justify-center">
        <div className="text-center text-midnight-300 text-sm">定位中...</div>
      </div>
    );
  }

  if (!weather) {
    if (compact) {
      return (
        <div className="glass-card p-2.5 sm:p-3 md:p-4 glow-border h-full flex flex-col justify-center">
          <div className="text-center">
            <CloudOff className="w-5 h-5 sm:w-6 sm:h-6 text-midnight-400 mx-auto mb-1.5" />
            <div className="text-midnight-400 text-[10px] sm:text-xs">未获取到天气信息</div>
            <button
              onClick={() => fetchWeather()}
              className="mt-2 flex items-center justify-center gap-1 mx-auto text-[10px] sm:text-xs text-cyan-glow/70 hover:text-cyan-glow transition-colors"
            >
              <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              重试
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="glass-card p-4 sm:p-5 lg:p-6 glow-border h-full flex flex-col items-center justify-center">
        <CloudOff className="w-12 h-12 sm:w-14 sm:h-14 text-midnight-500 mb-3" />
        <div className="text-midnight-300 text-sm sm:text-base font-serif">未获取到天气信息</div>
        {error && <div className="text-midnight-500 text-xs mt-1">{error}</div>}
        <button
          onClick={() => fetchWeather()}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-cyan-glow/10 border border-cyan-glow/30 rounded-lg text-cyan-glow text-xs sm:text-sm hover:bg-cyan-glow/20 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          重新获取
        </button>
      </div>
    );
  }

  const Icon = getWeatherIcon(weather.weather);
  const aqiInfo = getAqiLevel(weather.aqi);

  if (compact) {
    return (
      <div className="glass-card p-2.5 sm:p-3 md:p-4 glow-border h-full flex flex-col justify-center">
        <div className="text-center">
          <div className="text-midnight-300 text-[9px] sm:text-[10px] md:text-xs">{weather.city}</div>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3 mt-0.5 sm:mt-1">
            <div className="text-cyan-glow animate-float relative">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              {weather.weather.includes('晴') && (
                <Sun className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 absolute -top-0.5 -right-0.5 text-yellow-400/70" />
              )}
            </div>
            <div className="flex items-end gap-0.5 sm:gap-1">
              <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white">{weather.temperature}</span>
              <span className="text-[10px] sm:text-xs md:text-sm text-midnight-200 mb-0.5 sm:mb-1">°C</span>
            </div>
          </div>
          <div className="mt-0.5 sm:mt-1 text-cyan-soft text-[10px] sm:text-xs md:text-sm">{weather.weather}</div>

          <div className="flex justify-around mt-1.5 sm:mt-2 md:mt-3 text-[9px] sm:text-[10px] md:text-xs">
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 text-midnight-200">
              <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-cyan-glow/60" />
              <span>湿度 {weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-1.5 text-midnight-200">
              <Wind className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-cyan-glow/60" />
              <span>{weather.windDirection} {weather.windLevel}级</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 sm:p-5 lg:p-6 glow-border h-full flex flex-col">
      <div className="text-center flex-shrink-0">
        <div className="flex items-center justify-center gap-2">
          <span className="text-midnight-200 text-[10px] sm:text-xs">{weather.city}</span>
          <span className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded ${aqiInfo.color} bg-white/5`}>
            {weather.airQuality}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2">
          <div className="text-cyan-glow animate-float relative">
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
            {weather.weather.includes('晴') && (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 absolute -top-0.5 -right-0.5 text-yellow-400/70" />
            )}
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl sm:text-4xl lg:text-5xl font-light text-white">{weather.temperature}</span>
            <span className="text-lg sm:text-xl text-midnight-200 mb-1">°C</span>
          </div>
        </div>
        <div className="mt-1 text-cyan-soft text-xs sm:text-sm">{weather.weather}</div>
        <div className="mt-0.5 text-midnight-400 text-[10px]">
          最高 {weather.temperatureMax}° / 最低 {weather.temperatureMin}°
        </div>
      </div>

      <div className="cyber-line my-2 sm:my-3 flex-shrink-0" />

      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs flex-1 content-start">
        <div className="flex items-center gap-1.5 text-midnight-200">
          <Droplets className="w-3.5 h-3.5 text-cyan-glow/60 flex-shrink-0" />
          <span>湿度 {weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-midnight-200">
          <Wind className="w-3.5 h-3.5 text-cyan-glow/60 flex-shrink-0" />
          <span>{weather.windDirection} {weather.windLevel}级</span>
        </div>
        <div className="flex items-center gap-1.5 text-midnight-200">
          <ThermometerSun className="w-3.5 h-3.5 text-orange-400/60 flex-shrink-0" />
          <span>体感 {weather.feelsLike}°</span>
        </div>
        <div className="flex items-center gap-1.5 text-midnight-200">
          <Activity className={`w-3.5 h-3.5 flex-shrink-0 ${aqiInfo.color}`} />
          <span>空气 {weather.aqi} {aqiInfo.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-midnight-200">
          <Eye className="w-3.5 h-3.5 text-blue-400/60 flex-shrink-0" />
          <span>能见度 {weather.visibility}km</span>
        </div>
        <div className="flex items-center gap-1.5 text-midnight-200">
          <Gauge className="w-3.5 h-3.5 text-purple-400/60 flex-shrink-0" />
          <span>气压 {weather.pressure}hPa</span>
        </div>
        <div className="flex items-center gap-1.5 text-midnight-200">
          <Sunrise className="w-3.5 h-3.5 text-yellow-400/60 flex-shrink-0" />
          <span>日出 {weather.sunrise}</span>
        </div>
        <div className="flex items-center gap-1.5 text-midnight-200">
          <Sunset className="w-3.5 h-3.5 text-orange-400/60 flex-shrink-0" />
          <span>日落 {weather.sunset}</span>
        </div>
      </div>
    </div>
  );
}