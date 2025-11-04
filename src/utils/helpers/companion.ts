/**
 * 智能陪伴系统 - 小幽灵的智能大脑
 * 收集环境信息、用户行为，提供智能化的关怀文案
 */
import { API } from '@/utils/api';
import {
  getOS as envGetOS,
  getBrowser as envGetBrowser,
  getDeviceType as envGetDeviceType,
  getBatteryInfo as envGetBatteryInfo,
  getConnectionType as envGetConnectionType,
  getIPLocation as envGetIPLocation,
} from '@/utils/helpers/environment';

// ==================== 类型定义 ====================

export interface SmartContext {
  // 时间相关
  time: {
    hour: number; // 当前小时 (0-23)
    minute: number;
    period: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'midnight'; // 时段
    dayOfWeek: number; // 星期几 (0-6)
    isWeekend: boolean;
    isHoliday: boolean;
    holidayName?: string;
  };

  // 天气相关
  weather?: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'windy' | 'stormy';
    temperature: number; // 摄氏度
    humidity: number; // 湿度百分比
    description: string; // 天气描述
  };

  // 系统相关
  system: {
    os: 'Windows' | 'Mac' | 'Linux' | 'iOS' | 'Android' | 'Unknown';
    browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge' | 'Other';
    deviceType: 'mobile' | 'tablet' | 'desktop';
    battery?: {
      level: number; // 0-100
      charging: boolean;
    };
    connection: 'wifi' | '4g' | '3g' | 'slow' | 'offline';
  };

  // 用户行为
  userActivity: {
    isActive: boolean; // 是否活跃
    idleTime: number; // 空闲时间（毫秒）
    scrollCount: number; // 滚动次数
    readingTime: number; // 阅读时间（毫秒）
    lastInteraction: number; // 最后交互时间戳
    currentPage: 'home' | 'article' | 'notes' | 'project' | 'profile' | 'other';
    hasTyped: boolean; // 是否有输入行为
  };

  // 地理位置
  location?: {
    city: string;
    country: string;
    timezone: string;
    latitude: number;
    longitude: number;
  };
}

export interface CareMessage {
  text: string;
  type: 'greeting' | 'care' | 'reminder' | 'encouragement' | 'weather' | 'health' | 'holiday';
  priority: number; // 1-10，数字越大优先级越高
  conditions: (context: SmartContext) => boolean;
}

// ==================== 环境信息收集 ====================

/**
 * 获取当前时段
 */
export const getTimePeriod = (hour: number): SmartContext['time']['period'] => {
  if (hour >= 4 && hour < 6) return 'dawn'; // 凌晨 4-6点
  if (hour >= 6 && hour < 11) return 'morning'; // 早晨 6-11点
  if (hour >= 11 && hour < 13) return 'noon'; // 中午 11-13点
  if (hour >= 13 && hour < 17) return 'afternoon'; // 下午 13-17点
  if (hour >= 17 && hour < 19) return 'evening'; // 傍晚 17-19点
  if (hour >= 19 && hour < 23) return 'night'; // 晚上 19-23点
  return 'midnight'; // 深夜 23-4点
};

/**
 * 检测是否为节假日
 */
export const checkHoliday = (date: Date): { isHoliday: boolean; holidayName?: string } => {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const holidays: Record<string, string> = {
    '1-1': '元旦',
    '2-14': '情人节',
    '3-8': '妇女节',
    '4-1': '愚人节',
    '5-1': '劳动节',
    '5-4': '青年节',
    '6-1': '儿童节',
    '7-1': '建党节',
    '8-1': '建军节',
    '9-10': '教师节',
    '10-1': '国庆节',
    '12-24': '平安夜',
    '12-25': '圣诞节',
  };

  const key = `${month}-${day}`;
  if (holidays[key]) {
    return { isHoliday: true, holidayName: holidays[key] };
  }

  return { isHoliday: false };
};

/**
 * 获取操作系统（使用统一环境工具类）
 */
export const getOS = (): SmartContext['system']['os'] => {
  return envGetOS();
};

/**
 * 获取浏览器（使用统一环境工具类）
 */
export const getBrowser = (): SmartContext['system']['browser'] => {
  return envGetBrowser();
};

/**
 * 获取设备类型（使用统一环境工具类）
 */
export const getDeviceType = (): SmartContext['system']['deviceType'] => {
  return envGetDeviceType();
};

/**
 * 获取电池信息（使用统一环境工具类）
 */
export const getBatteryInfo = async (): Promise<SmartContext['system']['battery'] | undefined> => {
  return await envGetBatteryInfo();
};

/**
 * 获取网络连接状态（使用统一环境工具类）
 */
export const getConnectionType = (): SmartContext['system']['connection'] => {
  return envGetConnectionType();
};

/**
 * 通过IP获取地理位置（使用后端代理）
 */
export const getLocationByIP = async (): Promise<SmartContext['location'] | undefined> => {
  try {
    const location = await envGetIPLocation();

    if (location.success) {
      return {
        city: location.city,
        country: location.country,
        timezone: location.timezone,
        latitude: location.latitude,
        longitude: location.longitude,
      };
    }
  } catch (e) {
    console.error('❌ IP定位失败:', e);
  }

  return undefined;
};

/**
 * 获取地理位置（使用IP定位）
 */
export const getLocation = async (): Promise<SmartContext['location'] | undefined> => {
  return await getLocationByIP();
};

/**
 * 获取天气信息（使用后端代理服务）
 * 通过后端代理解决 CORS 跨域问题
 */
export const getWeather = async (location?: SmartContext['location']): Promise<SmartContext['weather'] | undefined> => {
  if (!location) return undefined;

  try {
    // 使用封装的 API 调用代理服务
    const result = await API.proxy.getWeather(location.city, 'json');

    // 解析后端代理返回的数据结构
    const data = result.data || result;

    // 解析山河天气API返回的数据
    if (data && data.code === 1 && data.data && data.data.current) {
      const current = data.data.current;

      // 解析天气状况
      let condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'windy' | 'stormy' = 'cloudy';

      const weatherText = (current.weather || current.weatherEnglish || '').toLowerCase();

      // 根据天气描述判断天气类型
      if (weatherText.includes('晴') || weatherText.includes('sunny') || weatherText.includes('clear')) {
        condition = 'sunny';
      } else if (weatherText.includes('雨') || weatherText.includes('rain') || weatherText.includes('drizzle')) {
        condition = 'rainy';
      } else if (weatherText.includes('雪') || weatherText.includes('snow')) {
        condition = 'snowy';
      } else if (weatherText.includes('雾') || weatherText.includes('fog') || weatherText.includes('mist')) {
        condition = 'foggy';
      } else if (weatherText.includes('风') || weatherText.includes('wind')) {
        condition = 'windy';
      } else if (weatherText.includes('暴') || weatherText.includes('storm') || weatherText.includes('thunder')) {
        condition = 'stormy';
      } else if (weatherText.includes('云') || weatherText.includes('cloud') || weatherText.includes('overcast')) {
        condition = 'cloudy';
      }

      // 获取温度
      const temperature = parseInt(current.temp) || 20;

      // 获取湿度（转换为数字，去掉%）
      const humidity = parseInt(current.humidity?.replace('%', '')) || 50;

      // 获取天气描述
      const description = current.weather || condition;

      const weather = {
        condition,
        temperature,
        humidity,
        description,
      };

      return weather;
    }
  } catch (e) {
    console.error('❌ 天气API调用失败:', e);
  }

  return undefined;
};

// ==================== 智能文案库 ====================

/**
 * 优美的关怀文案库
 */
export const careMessages: CareMessage[] = [
  // ==================== 时间问候 ====================
  {
    text: '晨曦微露，愿你今日如诗如画，心有所向 🌅',
    type: 'greeting',
    priority: 8,
    conditions: (ctx) => ctx.time.period === 'dawn',
  },
  {
    text: '清晨好呀！新的一天，让我们用代码书写优雅 ☕',
    type: 'greeting',
    priority: 6,
    conditions: (ctx) => ctx.time.period === 'morning' && ctx.time.hour < 9,
  },
  {
    text: '美好的早晨！记得享用早餐，元气满满开启新一天 🥐',
    type: 'greeting',
    priority: 6,
    conditions: (ctx) => ctx.time.period === 'morning' && ctx.time.hour >= 9,
  },
  {
    text: '午间时光，劳逸结合才是高效的秘诀哦 🌤️',
    type: 'greeting',
    priority: 6,
    conditions: (ctx) => ctx.time.period === 'noon',
  },
  {
    text: '下午好~让我陪你度过这段静谧的时光 📚',
    type: 'greeting',
    priority: 5,
    conditions: (ctx) => ctx.time.period === 'afternoon',
  },
  {
    text: '夕阳无限好，不过黄昏近。该歇歇了~ 🌇',
    type: 'greeting',
    priority: 6,
    conditions: (ctx) => ctx.time.period === 'evening',
  },
  {
    text: '夜幕降临，愿繁星陪你入眠，梦境如诗 🌙',
    type: 'greeting',
    priority: 7,
    conditions: (ctx) => ctx.time.period === 'night',
  },
  {
    text: '深夜了，早点休息吧，明天的阳光在等你 💫',
    type: 'greeting',
    priority: 9,
    conditions: (ctx) => ctx.time.period === 'midnight' && ctx.time.hour >= 23,
  },
  {
    text: '凌晨时分，夜深人静...要不要休息一下？🌌',
    type: 'greeting',
    priority: 10,
    conditions: (ctx) => ctx.time.period === 'midnight' && ctx.time.hour < 3,
  },

  // ==================== 天气关怀 ====================
  {
    text: '今天阳光正好，心情也要明媚起来~ ☀️',
    type: 'weather',
    priority: 7,
    conditions: (ctx) => ctx.weather?.condition === 'sunny',
  },
  {
    text: '天空飘来朵朵白云，像你思绪般自由 ☁️',
    type: 'weather',
    priority: 6,
    conditions: (ctx) => ctx.weather?.condition === 'cloudy',
  },
  {
    text: '雨声淅沥，窗外的世界别有一番诗意 🌧️',
    type: 'weather',
    priority: 7,
    conditions: (ctx) => ctx.weather?.condition === 'rainy',
  },
  {
    text: '雪花纷飞，愿你温暖如初，心中有光 ❄️',
    type: 'weather',
    priority: 8,
    conditions: (ctx) => ctx.weather?.condition === 'snowy',
  },
  {
    text: '雾霭朦胧，就像编程时偶遇的bug，拨云见日总会来~ 🌫️',
    type: 'weather',
    priority: 6,
    conditions: (ctx) => ctx.weather?.condition === 'foggy',
  },
  {
    text: '微风轻拂，带走疲惫，留下清爽 🍃',
    type: 'weather',
    priority: 6,
    conditions: (ctx) => ctx.weather?.condition === 'windy',
  },
  {
    text: '风雨交加的日子，让我陪着你好吗？⛈️',
    type: 'weather',
    priority: 8,
    conditions: (ctx) => ctx.weather?.condition === 'stormy',
  },
  {
    text: '今日温度较极端，记得适时增减衣物哦~ 🧥',
    type: 'weather',
    priority: 7,
    conditions: (ctx) => !!ctx.weather && (ctx.weather.temperature < 10 || ctx.weather.temperature > 30),
  },

  // ==================== 系统提醒 ====================
  {
    text: '电量有点低了，要不要充个电？🔋',
    type: 'reminder',
    priority: 9,
    conditions: (ctx) => !!ctx.system.battery && ctx.system.battery.level < 20 && !ctx.system.battery.charging,
  },
  {
    text: '充电中...让代码和能量一起充盈吧~ ⚡',
    type: 'reminder',
    priority: 5,
    conditions: (ctx) => !!ctx.system.battery && ctx.system.battery.charging === true,
  },
  {
    text: '网络似乎不太稳定，就像人生的起伏~ 📶',
    type: 'reminder',
    priority: 7,
    conditions: (ctx) => ctx.system.connection === 'slow' || ctx.system.connection === '3g',
  },
  {
    text: '离线了？没关系，静下来思考也很美好 📴',
    type: 'reminder',
    priority: 8,
    conditions: (ctx) => ctx.system.connection === 'offline',
  },

  // ==================== 用户行为关怀 ====================
  {
    text: '已经阅读很久了，要不要休息一下眼睛？👀',
    type: 'health',
    priority: 8,
    conditions: (ctx) => ctx.userActivity.readingTime > 30 * 60 * 1000, // 超过30分钟
  },
  {
    text: '久坐伤身，站起来走走，伸个懒腰吧~ 🤸',
    type: 'health',
    priority: 9,
    conditions: (ctx) => ctx.userActivity.idleTime > 45 * 60 * 1000, // 超过45分钟没活动
  },
  {
    text: '滚动了很多次，是在寻找灵感吗？✨',
    type: 'care',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.scrollCount > 100,
  },
  {
    text: '敲击键盘的声音，是代码世界最美的乐章~ ⌨️',
    type: 'encouragement',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.hasTyped,
  },
  {
    text: '探索文章的你，像是在知识的海洋遨游 🌊',
    type: 'care',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.currentPage === 'article',
  },
  {
    text: '手记承载着思想的轨迹，每一笔都弥足珍贵 📝',
    type: 'care',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.currentPage === 'notes',
  },
  {
    text: '项目之路虽崎岖，但每一步都通向更好的未来 🚀',
    type: 'encouragement',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.currentPage === 'project',
  },
  {
    text: '感觉到你的专注，这种状态真好~ 🎯',
    type: 'care',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.readingTime > 5 * 60 * 1000 && ctx.userActivity.isActive,
  },
  {
    text: '在首页闲逛？随便看看也是一种放松呀 🏠',
    type: 'care',
    priority: 5,
    conditions: (ctx) => ctx.userActivity.currentPage === 'home',
  },
  {
    text: '个人主页里藏着你的足迹和故事 👤',
    type: 'care',
    priority: 5,
    conditions: (ctx) => ctx.userActivity.currentPage === 'profile',
  },

  // ==================== 节日祝福 ====================
  {
    text: '节日快乐！愿你节日愉快，代码bug全消~ 🎉',
    type: 'holiday',
    priority: 10,
    conditions: (ctx) => ctx.time.isHoliday && !!ctx.time.holidayName,
  },
  {
    text: '周末啦！放松心情，让灵魂放个假~ 🎈',
    type: 'greeting',
    priority: 7,
    conditions: (ctx) => ctx.time.isWeekend && ctx.time.period === 'morning',
  },
  {
    text: '周末的夜晚，愿你拥有美梦和星辰 🌠',
    type: 'greeting',
    priority: 7,
    conditions: (ctx) => ctx.time.isWeekend && ctx.time.period === 'night',
  },

  // ==================== 励志鼓励 ====================
  {
    text: '每一行代码，都是对美好世界的编织 💻',
    type: 'encouragement',
    priority: 6,
    conditions: () => true,
  },
  {
    text: '你的坚持，终将美好 🌟',
    type: 'encouragement',
    priority: 7,
    conditions: () => true,
  },
  {
    text: '保持热爱，奔赴山海 🏔️',
    type: 'encouragement',
    priority: 6,
    conditions: () => true,
  },
  {
    text: '慢一点没关系，重要的是一直在前进 🚶',
    type: 'encouragement',
    priority: 6,
    conditions: () => true,
  },
  {
    text: '代码如诗，bug如画，都是成长的痕迹~ 🎨',
    type: 'encouragement',
    priority: 7,
    conditions: () => true,
  },
  {
    text: '你的努力，时光会看见，岁月会铭记 ⏳',
    type: 'encouragement',
    priority: 6,
    conditions: () => true,
  },
  {
    text: '像星辰一样，在暗夜中也要发光 ✨',
    type: 'encouragement',
    priority: 7,
    conditions: (ctx) => ctx.time.period === 'midnight' || ctx.time.period === 'night',
  },
  {
    text: '温柔而坚定，是最美的力量 💪',
    type: 'encouragement',
    priority: 6,
    conditions: () => true,
  },
  {
    text: '每一次尝试，都是勇气的证明 🎯',
    type: 'encouragement',
    priority: 6,
    conditions: () => true,
  },
  {
    text: '世界因你的创造而更加精彩 🌈',
    type: 'encouragement',
    priority: 6,
    conditions: () => true,
  },

  // ==================== 健康提醒 ====================
  {
    text: '记得多喝水，代码写得再美，身体也要保养~ 💧',
    type: 'health',
    priority: 7,
    conditions: (ctx) => ctx.time.minute % 30 === 0, // 每半小时提醒
  },
  {
    text: '深呼吸，放松一下，焦虑只会遮蔽思路 🧘',
    type: 'health',
    priority: 7,
    conditions: (ctx) => ctx.userActivity.readingTime > 60 * 60 * 1000,
  },
  {
    text: '眼睛累了吧？远眺窗外，让视线去旅行~ 👓',
    type: 'health',
    priority: 8,
    conditions: (ctx) => ctx.userActivity.readingTime > 40 * 60 * 1000,
  },
];

// ==================== 智能匹配算法 ====================

// 消息历史记录（避免重复显示）
const messageHistory: string[] = [];
const MAX_HISTORY = 5; // 记住最近5条消息

/**
 * 根据当前上下文智能选择最合适的关怀文案
 * 优化：增加随机性和多样性，避免消息重复
 */
export const getSmartMessage = (context: SmartContext): string => {
  // 筛选符合条件的文案
  const validMessages = careMessages.filter((msg) => {
    try {
      return msg.conditions(context);
    } catch (e) {
      return false;
    }
  });

  if (validMessages.length === 0) {
    return '我在这里，一直陪着你~ 💙';
  }

  // 过滤掉最近显示过的消息（避免重复）
  const freshMessages = validMessages.filter((msg) => !messageHistory.includes(msg.text));
  const candidateMessages = freshMessages.length > 0 ? freshMessages : validMessages;

  // 🎲 增强随机性：使用加权随机选择，而不是只选前3个
  // 优先级越高，被选中的概率越大，但低优先级也有机会
  const weightedMessages = candidateMessages.map((msg) => ({
    ...msg,
    // 权重 = 优先级 * 随机因子（0.5-1.5）
    // 这样即使优先级低的消息也有机会被选中
    weight: msg.priority * (0.5 + Math.random()),
  }));

  // 按权重排序
  weightedMessages.sort((a, b) => b.weight - a.weight);

  // 从前30%的消息中随机选择（增加多样性）
  const topCount = Math.max(3, Math.ceil(weightedMessages.length * 0.3));
  const topMessages = weightedMessages.slice(0, topCount);
  const selected = topMessages[Math.floor(Math.random() * topMessages.length)];

  // 记录到历史
  messageHistory.push(selected.text);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift(); // 移除最旧的记录
  }

  // 替换模板变量
  let text = selected.text;
  text = text.replace(/\$\{ctx\.([^}]+)\}/g, (match, path) => {
    const value = path.split('.').reduce((obj: any, key: string) => obj?.[key], context);
    return value !== undefined ? value : match;
  });

  return text;
};

/**
 * 构建智能上下文
 */
export const buildSmartContext = async (userActivity: SmartContext['userActivity']): Promise<SmartContext> => {
  const now = new Date();
  const hour = now.getHours();
  const holiday = checkHoliday(now);

  const context: SmartContext = {
    time: {
      hour,
      minute: now.getMinutes(),
      period: getTimePeriod(hour),
      dayOfWeek: now.getDay(),
      isWeekend: now.getDay() === 0 || now.getDay() === 6,
      isHoliday: holiday.isHoliday,
      holidayName: holiday.holidayName,
    },
    system: {
      os: getOS(),
      browser: getBrowser(),
      deviceType: getDeviceType(),
      battery: await getBatteryInfo(),
      connection: getConnectionType(),
    },
    userActivity,
  };

  // 异步获取地理位置和天气（不阻塞）
  getLocation().then(async (location) => {
    if (location) {
      context.location = location;
      context.weather = await getWeather(location);
    }
  });

  return context;
};
