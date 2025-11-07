/**
 * 环境信息工具类
 * 统一封装获取 IP、地理位置、天气等信息
 * 所有外部 API 调用都通过后端代理
 */

import { API } from '@/utils/api';

// ==================== 类型定义 ====================

export interface LocationInfo {
  success: boolean;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  location: string; // 格式化的位置文本，如："中国 · 四川 · 成都"
}

export interface WeatherInfo {
  code: number;
  text?: string; // 新接口返回的是 text 而不是 message
  data?: {
    city?: string;
    cityEnglish?: string;
    temp?: string; // 最高温度
    tempn?: string; // 最低温度
    weather?: string; // 天气描述
    wind?: string; // 风向（新接口中是 wind，不是 windDirection）
    windSpeed?: string; // 风速
    time?: string;
    current: {
      city?: string;
      cityEnglish?: string;
      temp: string; // 当前温度，如 "15.2"
      weather: string; // 天气描述，如 "多云"
      weatherEnglish: string; // 英文描述，如 "Cloudy"
      humidity: string; // 湿度，如 "100%"
      wind?: string; // 风向
      windSpeed: string; // 风速，如 "1级"
      visibility?: string;
      fahrenheit?: string;
      air?: string;
      air_pm25?: string;
      date?: string;
      time?: string;
      image?: string;
    };
    living?: Array<{
      name: string;
      index: string;
      tips: string;
    }>;
    warning?: Record<string, any>;
  };
  message?: string; // 保留向后兼容
}

// ==================== 缓存管理 ====================

class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private TTL = {
    IP_LOCATION: 3600000, // 1 小时
    WEATHER: 1800000, // 30 分钟
  };

  set(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
    });
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new CacheManager();

// ==================== IP 和地理位置 ====================

/**
 * 获取当前用户的 IP 地理位置（通过后端代理）
 * @param forceRefresh 是否强制刷新缓存
 * @returns Promise<LocationInfo>
 */
export const getIPLocation = async (forceRefresh = false): Promise<LocationInfo> => {
  const cacheKey = 'ip_location';

  // 检查缓存
  if (!forceRefresh) {
    const cached = cache.get<LocationInfo>(cacheKey);
    if (cached) {
      console.log('✅ IP定位缓存命中');
      return cached;
    }
  }

  try {
    // 通过后端代理获取 IP 位置
    const response = await API.proxy.getIPLocation();

    if (response.success && response.data) {
      const location = response.data;

      // 存入缓存
      cache.set(cacheKey, location, cache['TTL'].IP_LOCATION);

      console.log('✅ IP定位成功:', location.location);
      return location;
    }

    throw new Error('IP定位失败');
  } catch (error) {
    console.error('❌ IP定位失败:', error);

    // 返回默认值
    return {
      success: false,
      city: '未知',
      region: '',
      country: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Shanghai',
      location: '未知',
    };
  }
};

/**
 * 获取指定 IP 的地理位置
 * @param ip IP 地址
 * @returns Promise<LocationInfo>
 */
export const getLocationByIP = async (ip: string): Promise<LocationInfo> => {
  const cacheKey = `ip_location_${ip}`;

  // 检查缓存
  const cached = cache.get<LocationInfo>(cacheKey);
  if (cached) {
    console.log(`✅ IP定位缓存命中: ${ip}`);
    return cached;
  }

  try {
    const response = await API.proxy.getIPLocation(ip);

    if (response.success && response.data) {
      const location = response.data;
      cache.set(cacheKey, location, cache['TTL'].IP_LOCATION);
      return location;
    }

    throw new Error('IP定位失败');
  } catch (error) {
    console.error(`❌ IP定位失败 (${ip}):`, error);

    return {
      success: false,
      city: '未知',
      region: '',
      country: '',
      latitude: 0,
      longitude: 0,
      timezone: 'Asia/Shanghai',
      location: '未知',
    };
  }
};

// ==================== 天气信息 ====================

/**
 * 获取天气信息（通过后端代理）
 * @param city 城市名称
 * @param forceRefresh 是否强制刷新缓存
 * @returns Promise<WeatherInfo>
 */
export const getWeather = async (city: string, forceRefresh = false): Promise<WeatherInfo> => {
  const cacheKey = `weather_${city}`;

  // 检查缓存
  if (!forceRefresh) {
    const cached = cache.get<WeatherInfo>(cacheKey);
    if (cached) {
      console.log(`✅ 天气缓存命中: ${city}`);
      return cached;
    }
  }

  try {
    // 通过后端代理获取天气
    const response = await API.proxy.getWeather(city, 'json');

    if (response.success && response.data) {
      const weather = response.data;

      // 检查新接口返回的 code 是否为成功状态（code === 1 表示成功）
      if (weather.code !== undefined && weather.code !== 1) {
        console.warn(`⚠️ 天气API返回错误: ${weather.text || weather.message || '未知错误'}`);
        // 返回错误格式的数据，但保持 WeatherInfo 类型
        return {
          code: weather.code || 0,
          text: weather.text || weather.message || '获取天气失败',
          message: weather.message || weather.text,
        };
      }

      // 存入缓存
      cache.set(cacheKey, weather, cache['TTL'].WEATHER);

      console.log(`✅ 获取天气成功: ${city}`);
      return weather;
    }

    throw new Error('获取天气失败：响应数据为空');
  } catch (error) {
    console.error(`❌ 获取天气失败 (${city}):`, error);

    // 返回默认天气数据而不是抛出异常（与后端行为一致）
    return {
      code: 0,
      text: '获取天气失败',
      message: '获取天气失败',
      data: {
        city: city,
        temp: '--',
        tempn: '--',
        weather: '未知',
        wind: '--',
        windSpeed: '--',
        time: '',
        current: {
          temp: '--',
          weather: '未知',
          weatherEnglish: 'Unknown',
          humidity: '--',
          windSpeed: '--',
          wind: '--',
        },
      },
    };
  }
};

// ==================== 设备信息 ====================

/**
 * 获取操作系统
 */
export const getOS = (): 'Windows' | 'Mac' | 'Linux' | 'iOS' | 'Android' | 'Unknown' => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'Windows';
  if (userAgent.includes('mac')) return 'Mac';
  if (userAgent.includes('linux')) return 'Linux';
  if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
  if (userAgent.includes('android')) return 'Android';
  return 'Unknown';
};

/**
 * 获取浏览器
 */
export const getBrowser = (): 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other' => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome') && !userAgent.includes('edge')) return 'Chrome';
  if (userAgent.includes('firefox')) return 'Firefox';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari';
  if (userAgent.includes('edge')) return 'Edge';
  return 'Other';
};

/**
 * 获取设备类型
 */
export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

/**
 * 获取电池信息
 */
export const getBatteryInfo = async (): Promise<{ level: number; charging: boolean } | undefined> => {
  try {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
      };
    }
  } catch (e) {
    // 浏览器不支持
  }
  return undefined;
};

/**
 * 获取网络连接状态
 */
export const getConnectionType = (): 'wifi' | '4g' | '3g' | 'slow' | 'offline' => {
  if (!navigator.onLine) return 'offline';

  const connection =
    (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

  if (connection) {
    const type = connection.effectiveType;
    if (type === '4g') return '4g';
    if (type === '3g') return '3g';
    if (type === '2g' || type === 'slow-2g') return 'slow';
  }

  return 'wifi';
};

// ==================== 工具函数 ====================

/**
 * 清除所有缓存
 */
export const clearCache = (): void => {
  cache.clear();
  console.log('✅ 环境信息缓存已清除');
};

/**
 * 预加载环境信息（提前获取并缓存）
 */
export const preloadEnvironmentInfo = async (): Promise<void> => {
  try {
    // 并行获取 IP 位置
    const location = await getIPLocation();

    // 如果获取到位置，再获取天气
    if (location.success && location.city !== '未知') {
      await getWeather(location.city);
    }

    console.log('✅ 环境信息预加载完成');
  } catch (error) {
    console.warn('⚠️ 环境信息预加载失败:', error);
  }
};

// ==================== 导出 ====================

export default {
  // IP 和地理位置
  getIPLocation,
  getLocationByIP,

  // 天气
  getWeather,

  // 设备信息
  getOS,
  getBrowser,
  getDeviceType,
  getBatteryInfo,
  getConnectionType,

  // 工具
  clearCache,
  preloadEnvironmentInfo,
};
