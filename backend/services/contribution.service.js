/**
 * 贡献统计服务
 * 获取 GitHub 和 Gitee 的提交数据
 */

const axios = require('axios');
const { logger } = require('../utils/logger');
const redisManager = require('../utils/redis');

class ContributionService {
  /**
   * 获取 GitHub 用户的贡献数据
   * @param {string} username - GitHub 用户名
   * @returns {Promise<Object>} 月度贡献统计
   */
  async getGitHubContributions(username) {
    try {
      // 检查是否配置了 GitHub Token
      const hasToken = !!process.env.GITHUB_TOKEN;

      if (!hasToken) {
        logger.warn('未配置 GITHUB_TOKEN，将使用 Gitee 数据或跳过 GitHub 统计');
        return {};
      }

      // 使用 GitHub GraphQL API 获取贡献数据
      const query = `
        query($username: String!) {
          user(login: $username) {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
              }
            }
          }
        }
      `;

      const response = await axios.post(
        'https://api.github.com/graphql',
        {
          query,
          variables: { username },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data.errors) {
        logger.error('GitHub GraphQL 错误:', response.data.errors);
        return {};
      }

      const weeks =
        response.data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
      return this.processContributionData(weeks, 'github');
    } catch (error) {
      logger.warn(`获取 GitHub 贡献数据失败: ${error.message}`);
      return {};
    }
  }

  /**
   * 获取 Gitee 用户的每日贡献数据
   * @param {string} username - Gitee 用户名
   * @returns {Promise<Array>} 每日贡献数据数组 [{ date, count }]
   */
  async getGiteeContributions(username) {
    try {
      logger.info(`开始获取 Gitee 用户 ${username} 的贡献数据`);

      // ✅ 直接访问用户主页获取贡献数据
      const url = `https://gitee.com/${username}`;
      logger.info(`访问用户主页: ${url}`);

      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      const html = response.data;

      // 使用正则表达式提取每日贡献数据
      // Gitee 主页格式: <div class='box xxx' data-content='N个贡献：YYYY-MM-DD' date='YYYYMMDD'></div>
      const regex = /data-content=['"](\d+)个贡献[：:](\d{4}-\d{2}-\d{2})['"]/g;
      let match;
      const dailyContributions = [];
      let totalContributions = 0;

      while ((match = regex.exec(html)) !== null) {
        const count = parseInt(match[1], 10);
        const date = match[2]; // YYYY-MM-DD

        dailyContributions.push({
          date: date,
          count: count,
        });

        if (count > 0) {
          totalContributions += count;
        }
      }

      logger.info(
        `Gitee 数据获取成功: ${dailyContributions.length} 天, 总贡献 ${totalContributions} 次`
      );

      return dailyContributions;
    } catch (error) {
      logger.warn(`获取 Gitee 贡献数据失败: ${error.message}`);
      return [];
    }
  }

  /**
   * 处理 GitHub 贡献数据，按月份聚合
   * @param {Array} weeks - GitHub 周数据
   * @param {string} source - 数据来源
   * @returns {Object} 月度统计
   */
  processContributionData(weeks, source) {
    const monthlyStats = {};

    weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        const date = new Date(day.date);
        const monthKey = `${date.getFullYear()}.${String(date.getMonth() + 1)}`;

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = 0;
        }
        monthlyStats[monthKey] += day.contributionCount;
      });
    });

    return monthlyStats;
  }

  /**
   * 合并 GitHub 和 Gitee 的每日贡献数据
   * @param {Object} githubData - GitHub 数据
   * @param {Array} giteeData - Gitee 每日数据 [{ date, count }]
   * @returns {Array} 合并后的每日数据
   */
  mergeContributions(githubData, giteeData) {
    // 目前只使用 Gitee 数据（GitHub 需要 Token）
    return giteeData || [];
  }

  /**
   * 获取最近 5 个月的贡献数据
   * @param {string} githubUsername - GitHub 用户名
   * @param {string} giteeUsername - Gitee 用户名
   * @returns {Promise<Array>} 每日贡献数据数组 [{ date, count }]
   */
  async getRecentContributions(githubUsername, giteeUsername) {
    try {
      // 检查 Redis 缓存（15分钟）
      const cacheKey = `contributions:${githubUsername}:${giteeUsername}`;

      // 使用 redisManager 封装的 get 方法（自动处理 JSON 解析）
      if (await redisManager.isReady()) {
        try {
          const cached = await redisManager.get(cacheKey);
          if (cached) {
            logger.info('从缓存获取贡献数据');
            return cached; // redisManager.get 已自动解析 JSON
          }
        } catch (cacheError) {
          logger.warn('读取缓存失败:', cacheError.message);
        }
      }

      const hasGitHubToken = !!process.env.GITHUB_TOKEN;
      logger.info(
        `开始获取贡献数据 - GitHub: ${hasGitHubToken ? githubUsername || '未配置' : '未配置Token'}, Gitee: ${giteeUsername || '未配置'}`
      );

      // 并行获取 GitHub 和 Gitee 数据
      const tasks = [];

      // 只有配置了 GitHub Token 才获取 GitHub 数据
      if (hasGitHubToken && githubUsername) {
        tasks.push(this.getGitHubContributions(githubUsername));
      } else {
        tasks.push(Promise.resolve({}));
      }

      // 获取 Gitee 数据
      if (giteeUsername) {
        tasks.push(this.getGiteeContributions(giteeUsername));
      } else {
        tasks.push(Promise.resolve({}));
      }

      const [githubData, giteeData] = await Promise.allSettled(tasks);

      // 提取成功的数据
      const githubResult = githubData.status === 'fulfilled' ? githubData.value : {};
      const giteeResult = giteeData.status === 'fulfilled' ? giteeData.value : {};

      // 合并数据
      const mergedData = this.mergeContributions(githubResult, giteeResult);

      // 生成最近 5 个月的连续数据
      const chartData = this.generateChartData(mergedData);

      logger.info(`成功生成贡献数据，共 ${chartData.length} 天`);

      // 缓存结果（15分钟，900秒）
      if (await redisManager.isReady()) {
        try {
          // 使用 redisManager 封装的 set 方法（自动处理 JSON 序列化和过期时间）
          await redisManager.set(cacheKey, chartData, 900);
        } catch (cacheError) {
          logger.warn('写入缓存失败:', cacheError.message);
        }
      }

      return chartData;
    } catch (error) {
      logger.error('获取贡献数据失败:', error);
      // 返回空数据而不是抛出错误
      return this.generateChartData({});
    }
  }

  /**
   * 生成图表数据（最近5个月，填充缺失日期）
   * @param {Array} mergedData - 原始每日数据 [{ date, count }]
   * @returns {Array} 连续的每日数据 [{ date, count }]
   */
  generateChartData(mergedData) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentDate = now.getDate();

    // 计算起始月份（往前推4个月，共5个月）
    let startMonth = currentMonth - 4;
    let startYear = currentYear;
    if (startMonth < 0) {
      startMonth += 12;
      startYear -= 1;
    }

    // 生成日期字符串（避免时区问题）
    const startDateStr = `${startYear}-${String(startMonth + 1).padStart(2, '0')}-01`;
    const endDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDate).padStart(2, '0')}`;

    logger.info(`生成图表数据 - 日期范围: ${startDateStr} ~ ${endDateStr}`);

    // 过滤并转换为 Map
    const dataMap = new Map();
    if (Array.isArray(mergedData)) {
      mergedData.forEach(item => {
        if (item.date >= startDateStr && item.date <= endDateStr) {
          dataMap.set(item.date, item.count);
        }
      });
    }

    // 生成连续的每日数据（填充缺失日期）
    const continuousData = [];
    const iterDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(currentYear, currentMonth, currentDate);

    while (iterDate <= endDate) {
      const dateStr = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}-${String(iterDate.getDate()).padStart(2, '0')}`;
      const count = dataMap.get(dateStr) || 0;

      continuousData.push({ date: dateStr, count });
      iterDate.setDate(iterDate.getDate() + 1);
    }

    const totalContributions = continuousData.reduce((sum, item) => sum + item.count, 0);
    const daysWithContributions = continuousData.filter(item => item.count > 0).length;

    logger.info(
      `图表数据: ${continuousData.length} 天, 有贡献 ${daysWithContributions} 天, 总计 ${totalContributions} 次贡献`
    );

    return continuousData;
  }
}

module.exports = new ContributionService();
