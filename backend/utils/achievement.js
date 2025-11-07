const { UserAchievement, Achievement, Post, Comment, Note, User } = require('../models');
const { logger } = require('./logger');
const activityHelper = require('./activity');

/**
 * 成就管理工具类
 * 用于检查和解锁用户成就，以及计算成就进度
 */
class AchievementHelper {
  /**
   * 计算成就进度
   * @param {string} type - 成就类型
   * @param {number} userId - 用户ID
   * @param {Date} userCreatedAt - 用户创建时间
   * @returns {Promise<number>} 当前进度值
   */
  async calculateProgress(type, userId, userCreatedAt = null) {
    switch (type) {
      case 'article_count':
        return await Post.count({
          where: { userId, status: 1, auditStatus: 1 },
        });

      case 'like_count':
        return (
          (await Post.sum('likeCount', {
            where: { userId, status: 1, auditStatus: 1 },
          })) || 0
        );

      case 'view_count':
        return (
          (await Post.sum('viewCount', {
            where: { userId, status: 1, auditStatus: 1 },
          })) || 0
        );

      case 'comment_count':
        return await Comment.count({
          where: { userId, status: 'approved' },
        });

      case 'note_count':
        return await Note.count({
          where: { userId, isPrivate: 0 },
        });

      case 'registration_days':
        if (userCreatedAt) {
          const joinDate = new Date(userCreatedAt);
          const now = new Date();
          const diffTime = Math.abs(now - joinDate);
          return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;

      case 'follower_count':
        return 0;

      default:
        return 0;
    }
  }

  /**
   * 批量计算用户统计数据（用于成就进度计算）
   * @param {number} userId - 用户ID
   * @returns {Promise<Object>} 统计数据
   */
  async getUserStatsForAchievements(userId) {
    const [articleCount, totalLikes, totalViews, commentCount, noteCount, user] = await Promise.all(
      [
        Post.count({ where: { userId, status: 1, auditStatus: 1 } }),
        Post.sum('likeCount', { where: { userId, status: 1, auditStatus: 1 } }).then(
          sum => sum || 0
        ),
        Post.sum('viewCount', { where: { userId, status: 1, auditStatus: 1 } }).then(
          sum => sum || 0
        ),
        Comment.count({ where: { userId, status: 'approved' } }),
        Note.count({ where: { userId, isPrivate: 0 } }),
        User.findByPk(userId, { attributes: ['createdAt'] }),
      ]
    );

    return {
      articleCount,
      totalLikes,
      totalViews,
      commentCount,
      noteCount,
      userCreatedAt: user?.createdAt,
    };
  }

  /**
   * 根据统计数据计算成就进度
   * @param {string} type - 成就类型
   * @param {Object} stats - 统计数据
   * @returns {number} 当前进度值
   */
  calculateProgressFromStats(type, stats) {
    switch (type) {
      case 'article_count':
        return stats.articleCount || 0;
      case 'like_count':
        return stats.totalLikes || 0;
      case 'view_count':
        return stats.totalViews || 0;
      case 'comment_count':
        return stats.commentCount || 0;
      case 'note_count':
        return stats.noteCount || 0;
      case 'registration_days':
        if (stats.userCreatedAt) {
          const joinDate = new Date(stats.userCreatedAt);
          const now = new Date();
          const diffTime = Math.abs(now - joinDate);
          return Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
        return 0;
      case 'follower_count':
        return 0;
      default:
        return 0;
    }
  }

  /**
   * 检查并解锁成就
   * @param {number} userId - 用户ID
   * @param {string} type - 成就类型
   * @param {number} currentValue - 当前值
   */
  async checkAndUnlock(userId, type, currentValue) {
    try {
      const achievements = await Achievement.findAll({
        where: { isActive: true },
      });

      for (const achievement of achievements) {
        const criteria = achievement.criteria;

        if (criteria.type !== type) continue;

        const [userAchievement, created] = await UserAchievement.findOrCreate({
          where: {
            userId,
            achievementId: achievement.id,
          },
          defaults: {
            userId,
            achievementId: achievement.id,
            unlocked: false,
            unlockedAt: null,
            progress: {
              current: currentValue,
              target: criteria.target,
            },
          },
        });

        if (userAchievement.unlocked) {
          if (userAchievement.progress?.current !== currentValue) {
            await userAchievement.update({
              progress: {
                current: currentValue,
                target: criteria.target,
              },
            });
          }
          continue;
        }

        const shouldUnlock = currentValue >= criteria.target;

        if (shouldUnlock) {
          await userAchievement.update({
            unlocked: true,
            unlockedAt: new Date(),
            progress: {
              current: currentValue,
              target: criteria.target,
            },
          });

          logger.info(`用户 ${userId} 解锁成就: ${achievement.name}`);

          await activityHelper.record(userId, 'achievement_unlocked', {
            title: `解锁成就「${achievement.name}」`,
            description: achievement.description,
            link: '/user/profile?tab=achievements',
            metadata: {
              achievementId: achievement.id,
              achievementName: achievement.name,
              rarity: achievement.rarity,
              points: achievement.points,
            },
          });
        } else {
          await userAchievement.update({
            progress: {
              current: currentValue,
              target: criteria.target,
            },
          });
        }
      }
    } catch (error) {
      logger.error('检查成就失败:', error);
    }
  }

  async checkArticleAchievements(userId) {
    try {
      const stats = await this.getUserStatsForAchievements(userId);
      await this.checkAndUnlock(userId, 'article_count', stats.articleCount);
      await this.checkAndUnlock(userId, 'like_count', stats.totalLikes);
      await this.checkAndUnlock(userId, 'view_count', stats.totalViews);
    } catch (error) {
      logger.error('检查文章成就失败:', error);
    }
  }

  async checkNoteAchievements(userId) {
    try {
      const noteCount = await this.calculateProgress('note_count', userId);
      await this.checkAndUnlock(userId, 'note_count', noteCount);
    } catch (error) {
      logger.error('检查手记成就失败:', error);
    }
  }

  async checkCommentAchievements(userId) {
    try {
      const commentCount = await this.calculateProgress('comment_count', userId);
      await this.checkAndUnlock(userId, 'comment_count', commentCount);
    } catch (error) {
      logger.error('检查评论成就失败:', error);
    }
  }
}

module.exports = new AchievementHelper();
