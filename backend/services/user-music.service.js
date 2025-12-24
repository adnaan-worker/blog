/**
 * 用户音乐服务
 * 处理用户音乐列表的 CRUD 操作
 */

const db = require('@/models');
const proxyService = require('./proxy.service');
const { logger } = require('@/utils/logger');

class UserMusicService {
    /**
     * 获取用户的音乐列表
     * @param {number} userId - 用户ID
     * @returns {Promise<Array>} 音乐列表
     */
    async getUserMusicList(userId) {
        try {
            const musicList = await db.UserMusic.findAll({
                where: { userId },
                order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']],
            });

            return musicList;
        } catch (error) {
            logger.error('获取用户音乐列表失败:', error);
            throw error;
        }
    }

    /**
     * 获取管理员的音乐列表（公共访问）
     * @returns {Promise<Array>} 音乐列表
     */
    async getAdminMusicList() {
        try {
            // 查找管理员用户
            const admin = await db.User.findOne({
                where: { role: 'admin' },
                attributes: ['id'],
            });

            if (!admin) {
                return [];
            }

            return this.getUserMusicList(admin.id);
        } catch (error) {
            logger.error('获取管理员音乐列表失败:', error);
            throw error;
        }
    }

    /**
     * 添加歌曲到用户列表
     * @param {number} userId - 用户ID
     * @param {object} data - { server, songId }
     * @returns {Promise<Object>} 添加的歌曲
     */
    async addMusic(userId, data) {
        try {
            const { server = 'netease', songId } = data;

            // 检查是否已存在
            const existing = await db.UserMusic.findOne({
                where: { userId, songId, server },
            });

            if (existing) {
                throw new Error('该歌曲已在您的列表中');
            }

            // 从代理获取歌曲信息
            const songInfo = await proxyService.getMusicInfo(server, songId);

            // 获取当前最大排序值
            const maxOrder = await db.UserMusic.max('sortOrder', {
                where: { userId },
            }) || 0;

            // 创建记录
            const music = await db.UserMusic.create({
                userId,
                songId: songInfo.songId,
                server,
                title: songInfo.name,
                artist: songInfo.artist,
                url: songInfo.url,
                pic: songInfo.pic,
                lrc: songInfo.lrc,
                sortOrder: maxOrder + 1,
            });

            logger.info(`✅ 用户 ${userId} 添加歌曲: ${songInfo.name}`);
            return music;
        } catch (error) {
            logger.error('添加歌曲失败:', error);
            throw error;
        }
    }

    /**
     * 批量导入歌单中的歌曲
     * @param {number} userId - 用户ID
     * @param {object} data - { server, playlistId, songIds? }
     * @returns {Promise<Object>} { added, skipped, failed }
     */
    async importPlaylist(userId, data) {
        try {
            const { server = 'netease', playlistId, songIds } = data;

            // 获取歌单歌曲
            let songs = await proxyService.getPlaylistSongs(server, playlistId);

            // 如果指定了部分歌曲ID，只导入选中的
            if (songIds && Array.isArray(songIds) && songIds.length > 0) {
                songs = songs.filter(s => songIds.includes(s.songId));
            }

            // 获取用户已有的歌曲
            const existingList = await db.UserMusic.findAll({
                where: { userId, server },
                attributes: ['songId'],
            });
            const existingSongIds = new Set(existingList.map(m => m.songId));

            // 获取当前最大排序值
            let maxOrder = await db.UserMusic.max('sortOrder', {
                where: { userId },
            }) || 0;

            const results = { added: 0, skipped: 0, failed: 0 };

            for (const song of songs) {
                try {
                    if (existingSongIds.has(song.songId)) {
                        results.skipped++;
                        continue;
                    }

                    await db.UserMusic.create({
                        userId,
                        songId: song.songId,
                        server,
                        title: song.name,
                        artist: song.artist,
                        url: song.url,
                        pic: song.pic,
                        lrc: song.lrc,
                        sortOrder: ++maxOrder,
                    });

                    results.added++;
                } catch (err) {
                    results.failed++;
                    logger.warn(`导入歌曲失败: ${song.name}`, err.message);
                }
            }

            logger.info(`✅ 用户 ${userId} 导入歌单完成: 添加 ${results.added}, 跳过 ${results.skipped}, 失败 ${results.failed}`);
            return results;
        } catch (error) {
            logger.error('导入歌单失败:', error);
            throw error;
        }
    }

    /**
     * 删除歌曲
     * @param {number} userId - 用户ID
     * @param {number} id - 记录ID
     */
    async deleteMusic(userId, id) {
        try {
            const music = await db.UserMusic.findOne({
                where: { id, userId },
            });

            if (!music) {
                throw new Error('歌曲不存在');
            }

            await music.destroy();
            logger.info(`✅ 用户 ${userId} 删除歌曲: ${music.title}`);
            return true;
        } catch (error) {
            logger.error('删除歌曲失败:', error);
            throw error;
        }
    }

    /**
     * 更新歌曲排序
     * @param {number} userId - 用户ID
     * @param {Array<number>} orderedIds - 排序后的ID列表
     */
    async reorderMusic(userId, orderedIds) {
        try {
            const updates = orderedIds.map((id, index) =>
                db.UserMusic.update(
                    { sortOrder: index + 1 },
                    { where: { id, userId } }
                )
            );

            await Promise.all(updates);
            logger.info(`✅ 用户 ${userId} 更新歌曲排序`);
            return true;
        } catch (error) {
            logger.error('更新排序失败:', error);
            throw error;
        }
    }

    /**
     * 预览歌曲信息（不保存）
     * @param {string} server - 平台
     * @param {string} songId - 歌曲ID
     */
    async previewMusic(server, songId) {
        try {
            const songInfo = await proxyService.getMusicInfo(server, songId);
            return songInfo;
        } catch (error) {
            logger.error('预览歌曲失败:', error);
            throw error;
        }
    }

    /**
     * 预览歌单
     * @param {string} server - 平台
     * @param {string} playlistId - 歌单ID
     */
    async previewPlaylist(server, playlistId) {
        try {
            const songs = await proxyService.getPlaylistSongs(server, playlistId);
            return songs;
        } catch (error) {
            logger.error('预览歌单失败:', error);
            throw error;
        }
    }
}

module.exports = new UserMusicService();
module.exports.UserMusicService = UserMusicService;
