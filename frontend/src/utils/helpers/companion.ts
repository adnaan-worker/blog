/**
 * 智能陪伴系统 - 小幽灵的智能大脑
 * 收集环境信息、用户行为，提供智能化的关怀文案
 */
import {
  getOS,
  getBrowser,
  getDeviceType,
  getBatteryInfo,
  getConnectionType,
  getIPLocation,
  getWeather as envGetWeather,
} from '@/utils/helpers/environment';

// ==================== 类型定义 ====================

export interface WeatherContext {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'foggy' | 'windy' | 'stormy';
  temperature: number; // 摄氏度
  humidity: number; // 湿度百分比
  description: string; // 天气描述
  city: string;
}

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
  weather?: WeatherContext;

  // 系统相关
  system: {
    os: string;
    browser: string;
    deviceType: string;
    battery?: {
      level: number; // 0-100
      charging: boolean;
    };
    connection: string;
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
    isHovered?: boolean; // 是否悬浮在陪伴物上
  };
}

export interface CareMessage {
  text: string;
  type: 'greeting' | 'care' | 'reminder' | 'encouragement' | 'weather' | 'health' | 'holiday' | 'tech';
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
    '10-24': '程序员节',
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
 * 获取天气信息（使用 Environment 工具类）
 */
export const getWeather = async (): Promise<SmartContext['weather'] | undefined> => {
  try {
    // 先获取位置
    const location = await getIPLocation();
    if (!location.success || location.city === '未知') return undefined;

    // 获取天气
    const weatherData = await envGetWeather(location.city);
    if (!weatherData || !weatherData.data || !weatherData.data.current) return undefined;

    const current = weatherData.data.current;
    const weatherText = (current.weather || current.weatherEnglish || '').toLowerCase();

    // 解析天气状况
    let condition: WeatherContext['condition'] = 'cloudy';
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
    }

    return {
      condition,
      temperature: parseFloat(current.temp) || 20,
      humidity: parseInt(current.humidity?.replace('%', '') || '50'),
      description: current.weather || condition,
      city: location.city,
    };
  } catch (e) {
    console.error('❌ 获取天气失败:', e);
    return undefined;
  }
};

// ==================== 智能文案库 ====================

export const careMessages: CareMessage[] = [
  // ==================== 程序员特供 ====================
  {
    text: '保持冷静，继续 Debug 🐛',
    type: 'tech',
    priority: 7,
    conditions: () => Math.random() > 0.7,
  },
  {
    text: '世界上只有 10 种人，懂二进制的和不懂的 0️⃣1️⃣',
    type: 'tech',
    priority: 6,
    conditions: () => Math.random() > 0.8,
  },
  {
    text: 'Ctrl+C 和 Ctrl+V 是人类最伟大的发明...之一 📋',
    type: 'tech',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.hasTyped,
  },
  {
    text: '今天写的代码，明天看起来还是一样优雅吗？✨',
    type: 'tech',
    priority: 6,
    conditions: (ctx) => ctx.userActivity.hasTyped,
  },
  {
    text: 'Hello World! 世界因代码而不同 🌍',
    type: 'tech',
    priority: 5,
    conditions: () => true,
  },
  {
    text: '咖啡 + 代码 = 魔法 ☕✨',
    type: 'tech',
    priority: 7,
    conditions: (ctx) => ctx.time.period === 'morning' || ctx.time.period === 'afternoon',
  },

  // ==================== 时间问候 ====================
  {
    text: '早安！新的一天，新的 Commit ☀️',
    type: 'greeting',
    priority: 8,
    conditions: (ctx) => ctx.time.period === 'morning',
  },
  {
    text: '午饭时间到了，别让 CPU 过热，自己也歇歇 🍱',
    type: 'greeting',
    priority: 8,
    conditions: (ctx) => ctx.time.period === 'noon',
  },
  {
    text: '下午茶时间，来杯咖啡提提神？☕',
    type: 'greeting',
    priority: 7,
    conditions: (ctx) => ctx.time.period === 'afternoon' && ctx.time.hour >= 15,
  },
  {
    text: '天色渐晚，记得保存进度哦 💾',
    type: 'greeting',
    priority: 7,
    conditions: (ctx) => ctx.time.period === 'evening',
  },
  {
    text: '夜深了，Bug 也要睡觉了，早点休息吧 🌙',
    type: 'greeting',
    priority: 9,
    conditions: (ctx) => ctx.time.period === 'midnight',
  },
  {
    text: '凌晨四点的洛杉矶我不一定见过，但凌晨的代码库我熟...快去睡！🛌',
    type: 'greeting',
    priority: 10,
    conditions: (ctx) => ctx.time.period === 'midnight' && ctx.time.hour < 4,
  },

  // ==================== 天气关怀 ====================
  {
    text: '${ctx.weather.city}今天是个大晴天，心情也要像阳光一样灿烂 ☀️',
    type: 'weather',
    priority: 8,
    conditions: (ctx) => ctx.weather?.condition === 'sunny',
  },
  {
    text: '下雨了，最适合在屋里听雨写代码了 🌧️',
    type: 'weather',
    priority: 8,
    conditions: (ctx) => ctx.weather?.condition === 'rainy',
  },
  {
    text: '外面风好大，还是躲在屏幕前安全 🍃',
    type: 'weather',
    priority: 7,
    conditions: (ctx) => ctx.weather?.condition === 'windy',
  },
  {
    text: '现在的温度是 ${ctx.weather.temperature}°C，注意保暖哦 🧣',
    type: 'weather',
    priority: 7,
    conditions: (ctx) => !!ctx.weather && ctx.weather.temperature < 15,
  },

  // ==================== 系统提醒 ====================
  {
    text: '电量告急！快给电脑喂点电吧 🔌',
    type: 'reminder',
    priority: 9,
    conditions: (ctx) => !!ctx.system.battery && ctx.system.battery.level < 20 && !ctx.system.battery.charging,
  },
  {
    text: '正在充电中... 能量注入！⚡',
    type: 'reminder',
    priority: 5,
    conditions: (ctx) => !!ctx.system.battery && ctx.system.battery.charging === true,
  },
  {
    text: '网速有点慢？也许是信号在思考人生... 🐢',
    type: 'reminder',
    priority: 7,
    conditions: (ctx) => ctx.system.connection === 'slow' || ctx.system.connection === '3g',
  },

  // ==================== 节日 & 特殊 ====================
  {
    text: '1024 程序员节快乐！愿你的代码永无 Bug 🎉',
    type: 'holiday',
    priority: 10,
    conditions: (ctx) => !!ctx.time.holidayName && ctx.time.holidayName.includes('程序员'),
  },
  {
    text: '${ctx.time.holidayName}快乐！今天要不要给自己放个假？🎈',
    type: 'holiday',
    priority: 10,
    conditions: (ctx) => !!ctx.time.holidayName,
  },
  {
    text: '周五啦！周末在向你招手 👋',
    type: 'greeting',
    priority: 8,
    conditions: (ctx) => ctx.time.dayOfWeek === 5 && ctx.time.period === 'afternoon',
  },

  // ==================== 随机卖萌 ====================
  {
    text: '干嘛一直盯着人家看... (*/ω＼*)',
    type: 'care',
    priority: 8, // 提高优先级
    conditions: (ctx) => !!ctx.userActivity.isHovered,
  },
  {
    text: '在看什么呢？分我一点注意力嘛~ ( •̀ ω •́ )y',
    type: 'care',
    priority: 4,
    conditions: (ctx) => ctx.userActivity.idleTime > 60 * 1000,
  },
  {
    text: '这里不仅有代码，还有诗和远方 🌈',
    type: 'encouragement',
    priority: 5,
    conditions: () => true,
  },
  {
    text: '记得多喝水，你是水做的（碳基生物都是）💧',
    type: 'health',
    priority: 7,
    conditions: (ctx) => ctx.time.minute % 45 === 0,
  },
];

// ==================== 智能匹配算法 ====================

const messageHistory: string[] = [];
const MAX_HISTORY = 10; // 增加历史记录长度，避免频繁重复

/**
 * 获取智能文案
 */
export const getSmartMessage = (context: SmartContext): string => {
  // 1. 筛选可用消息
  const validMessages = careMessages.filter((msg) => {
    try {
      return msg.conditions(context);
    } catch (e) {
      return false;
    }
  });

  if (validMessages.length === 0) {
    return '正在思考人生的意义... 🤔';
  }

  // 2. 排除最近出现过的消息
  const freshMessages = validMessages.filter((msg) => !messageHistory.includes(msg.text));
  // 如果所有消息都展示过了，就放宽限制，只排除最近 3 条
  const recentHistory = messageHistory.slice(-3);
  const candidates =
    freshMessages.length > 0 ? freshMessages : validMessages.filter((msg) => !recentHistory.includes(msg.text));

  // 3. 最终兜底
  const finalCandidates = candidates.length > 0 ? candidates : validMessages;

  // 4. 加权随机
  const weightedMessages = finalCandidates.map((msg) => ({
    ...msg,
    weight: msg.priority * (0.5 + Math.random()), // 引入随机因子
  }));

  weightedMessages.sort((a, b) => b.weight - a.weight);

  // 取前 30% 或前 3 个
  const topCount = Math.max(3, Math.ceil(weightedMessages.length * 0.3));
  const topMessages = weightedMessages.slice(0, topCount);
  const selected = topMessages[Math.floor(Math.random() * topMessages.length)];

  // 5. 处理模板变量
  let text = selected.text;
  text = text.replace(/\$\{ctx\.([^}]+)\}/g, (_, path) => {
    const keys = path.split('.');
    let value: any = context;
    for (const key of keys) {
      value = value?.[key];
    }
    return value !== undefined ? value : '';
  });

  // 6. 记录历史
  messageHistory.push(selected.text);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.shift();
  }

  return text;
};

/**
 * 构建上下文
 */
export const buildSmartContext = async (userActivity: SmartContext['userActivity']): Promise<SmartContext> => {
  const now = new Date();
  const hour = now.getHours();
  const holiday = checkHoliday(now);

  // 基础上下文
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

  // 异步获取天气（如果缓存有）
  // 注意：这里我们尽量快速返回，不await慢请求，除非逻辑必须
  // 实际使用中，可以单独触发天气更新
  const weather = await getWeather();
  if (weather) {
    context.weather = weather;
  }

  return context;
};
