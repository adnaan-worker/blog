/**
 * 代理控制器
 * 处理外部 API 代理请求
 */

const proxyService = require('../services/proxy.service');
const { asyncHandler } = require('../utils/response');
const { logger } = require('../utils/logger');
const { getClientIP } = require('../utils/visitor-info');

class ProxyController {
  /**
   * 获取 IP 地理位置
   * GET /api/proxy/ip-location
   * GET /api/proxy/ip-location/:ip
   */
  getIPLocation = asyncHandler(async (req, res) => {
    try {
      // 如果提供了 IP 参数，使用该 IP；否则使用请求者的 IP
      const targetIP = req.params.ip || req.query.ip || getClientIP(req);

      const location = await proxyService.getIPLocation(targetIP);

      return res.apiSuccess(location, '获取IP位置成功');
    } catch (error) {
      logger.error('获取IP位置失败:', error);
      return res.apiServerError('获取IP位置失败', { error: error.message });
    }
  });

  /**
   * 获取天气信息
   * GET /api/proxy/weather
   * GET /api/proxy/weather/:city
   */
  getWeather = asyncHandler(async (req, res) => {
    try {
      let city = req.params.city || req.query.city || '北京';

      if (req.params.city === '本地' || req.query.city === '本地') {
        city = '苏州';
      }

      const format = req.query.format || 'json';

      const weather = await proxyService.getWeather(city, format);

      return res.apiSuccess(weather, '获取天气成功');
    } catch (error) {
      logger.error('获取天气失败:', error);
      return res.apiServerError('获取天气失败', { error: error.message });
    }
  });

  /**
   * 获取音乐播放 URL
   * GET /api/proxy/music
   */
  getMusicUrl = asyncHandler(async (req, res) => {
    try {
      const { server = 'tencent', id } = req.query;

      if (!id) {
        return res.apiBadRequest('歌曲ID不能为空');
      }

      const musicData = await proxyService.getMusicUrl(server, id);

      return res.apiSuccess(musicData, '获取音乐URL成功');
    } catch (error) {
      logger.error('获取音乐URL失败:', error);
      return res.apiServerError('获取音乐URL失败', { error: error.message });
    }
  });

  /**
   * 清除代理缓存
   * POST /api/proxy/cache/clear
   */
  clearCache = asyncHandler(async (req, res) => {
    try {
      const { type = 'all' } = req.body;

      const result = await proxyService.clearCache(type);

      return res.apiSuccess(result, `清除${type}缓存成功`);
    } catch (error) {
      logger.error('清除缓存失败:', error);
      return res.apiServerError('清除缓存失败', { error: error.message });
    }
  });
}

module.exports = new ProxyController();
