/**
 * 同步成就脚本
 * 为所有用户补上之前没有统计到的成就记录
 *
 * 使用方法：
 * node scripts/sync-achievements.js
 */

const db = require('../models');
const { Achievement, UserAchievement, User } = db;
const achievementHelper = require('../utils/achievement');

async function syncAchievements() {
  try {
    console.log('开始同步成就...');

    console.log('\n检查重复记录...');
    const duplicates = await db.sequelize.query(
      `SELECT user_id, achievement_id, COUNT(*) as count
       FROM user_achievements
       GROUP BY user_id, achievement_id
       HAVING count > 1`,
      { type: db.sequelize.QueryTypes.SELECT }
    );

    if (duplicates.length > 0) {
      console.log(`发现 ${duplicates.length} 组重复记录，正在清理...`);
      await db.sequelize.query(
        `DELETE ua1 FROM user_achievements ua1
         INNER JOIN user_achievements ua2
         WHERE ua1.user_id = ua2.user_id 
           AND ua1.achievement_id = ua2.achievement_id
           AND ua1.id > ua2.id`,
        { type: db.sequelize.QueryTypes.DELETE }
      );
      console.log('重复记录已清理完成');
    } else {
      console.log('未发现重复记录');
    }

    const allAchievements = await Achievement.findAll({
      where: { isActive: true },
      order: [['id', 'ASC']],
    });

    console.log(`\n找到 ${allAchievements.length} 个活跃成就`);

    const allUsers = await User.findAll({
      attributes: ['id', 'createdAt'],
    });

    console.log(`找到 ${allUsers.length} 个用户`);

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const user of allUsers) {
      console.log(`\n处理用户 ${user.id}...`);

      const stats = await achievementHelper.getUserStatsForAchievements(user.id);

      for (const achievement of allAchievements) {
        const criteria = achievement.criteria || {};
        const target = criteria.target || 1;
        const currentProgress = achievementHelper.calculateProgressFromStats(criteria.type, stats);
        const shouldUnlock = currentProgress >= target;

        try {
          const [userAchievement, created] = await UserAchievement.findOrCreate({
            where: {
              userId: user.id,
              achievementId: achievement.id,
            },
            defaults: {
              userId: user.id,
              achievementId: achievement.id,
              unlocked: shouldUnlock,
              unlockedAt: shouldUnlock ? new Date() : null,
              progress: {
                current: currentProgress,
                target: target,
              },
            },
          });

          const needsUpdate =
            userAchievement.progress?.current !== currentProgress ||
            userAchievement.progress?.target !== target ||
            (shouldUnlock && !userAchievement.unlocked);

          if (needsUpdate) {
            await userAchievement.update({
              progress: {
                current: currentProgress,
                target: target,
              },
              unlocked: shouldUnlock,
              unlockedAt:
                shouldUnlock && !userAchievement.unlockedAt
                  ? new Date()
                  : userAchievement.unlockedAt,
            });

            if (created) {
              totalCreated++;
              console.log(
                `  ✓ 创建成就 ${achievement.name}: ${currentProgress}/${target} ${shouldUnlock ? '(已解锁)' : ''}`
              );
            } else {
              totalUpdated++;
              console.log(
                `  ↻ 更新成就 ${achievement.name}: ${currentProgress}/${target} ${shouldUnlock ? '(已解锁)' : ''}`
              );
            }
          } else if (created) {
            totalCreated++;
            console.log(
              `  ✓ 创建成就 ${achievement.name}: ${currentProgress}/${target} ${shouldUnlock ? '(已解锁)' : ''}`
            );
          } else {
            totalSkipped++;
          }
        } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError') {
            console.log(`  ⚠ 成就 ${achievement.name} 已存在，跳过创建`);
            const existing = await UserAchievement.findOne({
              where: {
                userId: user.id,
                achievementId: achievement.id,
              },
            });
            if (existing) {
              const needsUpdate =
                existing.progress?.current !== currentProgress ||
                existing.progress?.target !== target ||
                (shouldUnlock && !existing.unlocked);
              if (needsUpdate) {
                await existing.update({
                  progress: {
                    current: currentProgress,
                    target: target,
                  },
                  unlocked: shouldUnlock,
                  unlockedAt:
                    shouldUnlock && !existing.unlockedAt ? new Date() : existing.unlockedAt,
                });
                totalUpdated++;
                console.log(
                  `  ↻ 更新成就 ${achievement.name}: ${currentProgress}/${target} ${shouldUnlock ? '(已解锁)' : ''}`
                );
              }
            }
          } else {
            console.error(`  ✗ 处理成就 ${achievement.name} 失败:`, error.message);
            throw error;
          }
        }
      }

      await achievementHelper.checkArticleAchievements(user.id);
      await achievementHelper.checkNoteAchievements(user.id);
      await achievementHelper.checkCommentAchievements(user.id);
    }

    console.log(`\n同步完成！`);
    console.log(`创建了 ${totalCreated} 条成就记录`);
    console.log(`更新了 ${totalUpdated} 条成就记录`);
    console.log(`跳过了 ${totalSkipped} 条无需更新的记录`);
  } catch (error) {
    console.error('同步成就失败:', error);
    throw error;
  } finally {
    await db.sequelize.close();
  }
}

// 执行同步
syncAchievements()
  .then(() => {
    console.log('脚本执行成功');
    process.exit(0);
  })
  .catch(error => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });
