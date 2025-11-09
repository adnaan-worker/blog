/**
 * 访客信息工具类
 * 用于解析和收集访客信息（IP、User-Agent、地理位置等）
 */

const UAParser = require('ua-parser-js');
const proxyService = require('../services/proxy.service');
const { logger } = require('./logger');

/**
 * 获取客户端IP地址
 * @param {Object} req - Express请求对象
 * @returns {string} IP地址
 */
const getClientIP = req => {
  // 尝试从不同的请求头获取真实IP
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] || // Cloudflare
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    req.ip ||
    '0.0.0.0';

  // 移除IPv6前缀（如果是IPv4映射地址）
  return ip.replace(/^::ffff:/, '');
};

/**
 * 解析User-Agent信息
 * @param {string} userAgent - User-Agent字符串
 * @returns {Object} 解析后的信息
 */
const parseUserAgent = userAgent => {
  if (!userAgent) {
    return {
      browser: 'Unknown',
      browserVersion: '',
      os: 'Unknown',
      osVersion: '',
      device: 'Unknown',
    };
  }

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: result.browser.name || 'Unknown',
    browserVersion: result.browser.version || '',
    os: result.os.name || 'Unknown',
    osVersion: result.os.version || '',
    device: result.device.type || 'Desktop',
    engine: result.engine.name || 'Unknown',
  };
};

/**
 * 获取地理位置信息（基于IP）
 * 使用统一的代理服务，避免重复实现
 * @param {string} ip - IP地址
 * @returns {Promise<string>} 地理位置信息
 */
const getLocationFromIP = async ip => {
  // 检查是否是本地IP
  if (
    ip === '127.0.0.1' ||
    ip === 'localhost' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.')
  ) {
    return '本地';
  }

  try {
    // 使用统一的代理服务
    const location = await proxyService.getIPLocation(ip);

    if (location.success) {
      return location.location || '未知';
    }

    return '未知';
  } catch (error) {
    logger.error('获取地理位置失败:', error);
    return '未知';
  }
};

/**
 * 收集完整的访客信息
 * @param {Object} req - Express请求对象
 * @returns {Promise<Object>} 访客信息对象
 */
const collectVisitorInfo = async req => {
  const ip = getClientIP(req);
  const userAgent = req.get('User-Agent') || '';
  const parsed = parseUserAgent(userAgent);

  // 异步获取地理位置（可能会稍慢）
  let location = '未知';
  try {
    location = await getLocationFromIP(ip);
  } catch (error) {
    logger.error('获取地理位置失败:', error);
  }

  return {
    ip,
    userAgent,
    location,
    browser: `${parsed.browser}${parsed.browserVersion ? ' ' + parsed.browserVersion : ''}`,
    os: `${parsed.os}${parsed.osVersion ? ' ' + parsed.osVersion : ''}`,
    device:
      parsed.device === 'mobile' ? 'Mobile' : parsed.device === 'tablet' ? 'Tablet' : 'Desktop',
  };
};

/**
 * 同步收集访客信息（不包含地理位置）
 * 用于不需要等待地理位置解析的场景
 * @param {Object} req - Express请求对象
 * @returns {Object} 访客信息对象（不含location）
 */
const collectVisitorInfoSync = req => {
  const ip = getClientIP(req);
  const userAgent = req.get('User-Agent') || '';
  const parsed = parseUserAgent(userAgent);

  return {
    ip,
    userAgent,
    browser: `${parsed.browser}${parsed.browserVersion ? ' ' + parsed.browserVersion : ''}`,
    os: `${parsed.os}${parsed.osVersion ? ' ' + parsed.osVersion : ''}`,
    device:
      parsed.device === 'mobile' ? 'Mobile' : parsed.device === 'tablet' ? 'Tablet' : 'Desktop',
  };
};

module.exports = {
  getClientIP,
  parseUserAgent,
  getLocationFromIP,
  collectVisitorInfo,
  collectVisitorInfoSync,
};
