import { create } from 'zustand';

export interface WeatherData {
  city: string;
  cityEn: string;
  country: string;
  temperature: number;
  temperatureMax: number;
  temperatureMin: number;
  weather: string;
  weatherId: string;
  humidity: number;
  windDirection: string;
  windLevel: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex: string;
  airQuality: string;
  sunrise: string;
  sunset: string;
  icon: string;
  feelsLike: number;
  updateTime: string;
  aqi: number;
}

interface WeatherStore {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  location: string | null;
  fetchLocation: () => Promise<string | null>;
  fetchWeather: () => Promise<void>;
}

const defaultWeather = null;

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  location: null,

  fetchLocation: async () => {
    try {
      if ('geolocation' in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 60000,
          });
        });

        const { latitude, longitude } = position.coords;
        const city = await reverseGeocode(latitude, longitude);
        if (city) {
          set({ location: city });
          return city;
        }
      }
    } catch (err) {
      console.warn('浏览器定位失败，回退到IP定位', err instanceof Error ? err.message : err);
    }

    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data?.city) {
        set({ location: data.city });
        return data.city;
      }
      return null;
    } catch (err) {
      console.error('IP定位失败', err);
      return null;
    }
  },

  fetchWeather: async () => {
    set({ isLoading: true, error: null });
    try {
      let city = get().location;
      if (!city) {
        city = await get().fetchLocation() || '';
      }

      let url = 'https://v1.yiketianqi.com/free/day?unescape=1';
      const appid = import.meta.env.VITE_WEATHER_APPID;
      const appsecret = import.meta.env.VITE_WEATHER_APPSECRET;
      if (appid && appsecret) {
        url += `&appid=${appid}&appsecret=${appsecret}`;
      }
      if (city) {
        url += `&city=${encodeURIComponent(city)}`;
      }

      const res = await fetch(url);
      const result = await res.json();
      
      if (result && !result.errcode) {
        const d = result;
        const weather: WeatherData = {
          city: d.city || city || '未知城市',
          cityEn: d.cityEn || '',
          country: d.country || '中国',
          temperature: Number(d.tem) || 0,
          temperatureMax: Number(d.tem1) || 0,
          temperatureMin: Number(d.tem2) || 0,
          weather: d.wea || '未知',
          weatherId: d.wea_img || '',
          humidity: Number(d.humidity) || 0,
          windDirection: d.win || '未知',
          windLevel: Number(d.win_speed) || 0,
          windSpeed: Number(d.win_speed) || 0,
          pressure: Number(d.pressure) || 0,
          visibility: Number(d.visibility) || 0,
          uvIndex: d.uv_index || '未知',
          airQuality: d.air_level || '未知',
          sunrise: d.sunrise || '--:--',
          sunset: d.sunset || '--:--',
          icon: getWeatherIcon(d.wea || ''),
          feelsLike: Number(d.tem) || 0,
          updateTime: d.update_time || '',
          aqi: Number(d.air) || 0,
        };
        set({ data: weather, error: null });
      } else {
        set({ data: null, error: result?.msg || '获取天气失败' });
      }
    } catch (err) {
      console.error('天气接口调用失败', err);
      set({ data: null, error: '获取天气失败' });
    } finally {
      set({ isLoading: false });
    }
  },
}));

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=zh-CN&zoom=10&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'mobei-personal-website/1.0',
        },
      }
    );
    const data = await res.json();
    if (data?.address) {
      return data.address.city || data.address.town || data.address.county || data.address.state || null;
    }
    return null;
  } catch (err) {
    console.warn('逆地理编码失败', err);
    return null;
  }
}

function getWeatherIcon(weather: string): string {
  if (weather.includes('晴')) return 'sun';
  if (weather.includes('雨')) return 'rain';
  if (weather.includes('雪')) return 'snow';
  if (weather.includes('云') || weather.includes('阴')) return 'cloud';
  if (weather.includes('雷')) return 'thunder';
  if (weather.includes('雾') || weather.includes('霾')) return 'fog';
  return 'cloud';
}

export function getWeatherType(weather: WeatherData): 'sunny' | 'cloudy' | 'rain' | 'heavy_rain' | 'snow' | 'heavy_snow' | 'thunder' | 'fog' {
  if (weather.weather.includes('雪')) {
    if (weather.windLevel >= 6) return 'heavy_snow';
    return 'snow';
  }
  if (weather.weather.includes('雷')) return 'thunder';
  if (weather.weather.includes('雨')) {
    if (weather.aqi > 100 || weather.windLevel >= 5) return 'heavy_rain';
    return 'rain';
  }
  if (weather.weather.includes('雾') || weather.weather.includes('霾')) return 'fog';
  if (weather.weather.includes('晴')) return 'sunny';
  return 'cloudy';
}