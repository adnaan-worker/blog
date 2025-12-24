/**
 * 用户音乐路由
 * /api/user/music
 */

const express = require('express');
const router = express.Router();
const userMusicService = require('@/services/user-music.service');
const { verifyToken } = require('@/middlewares/auth.middleware');

/**
 * @swagger
 * /api/user/music:
 *   get:
 *     summary: 获取当前用户的音乐列表
 *     tags: [用户音乐]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        const musicList = await userMusicService.getUserMusicList(req.user.id);
        return res.apiSuccess(musicList, '获取音乐列表成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

/**
 * @swagger
 * /api/user/music/list:
 *   get:
 *     summary: 获取管理员配置的公共音乐列表
 *     tags: [用户音乐]
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/list', async (req, res) => {
    try {
        const musicList = await userMusicService.getAdminMusicList();
        return res.apiSuccess(musicList, '获取公共音乐列表成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

/**
 * @swagger
 * /api/user/music/preview:
 *   get:
 *     summary: 预览歌曲信息（不保存）
 *     tags: [用户音乐]
 *     parameters:
 *       - name: server
 *         in: query
 *         schema:
 *           type: string
 *           enum: [netease, tencent]
 *       - name: songId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/preview', verifyToken, async (req, res) => {
    try {
        const { server = 'netease', songId } = req.query;
        if (!songId) {
            return res.apiFail('歌曲ID不能为空');
        }
        const songInfo = await userMusicService.previewMusic(server, songId);
        return res.apiSuccess(songInfo, '获取歌曲信息成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

/**
 * @swagger
 * /api/user/music/preview-playlist:
 *   get:
 *     summary: 预览歌单
 *     tags: [用户音乐]
 *     parameters:
 *       - name: server
 *         in: query
 *         schema:
 *           type: string
 *           enum: [netease, tencent]
 *       - name: playlistId
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/preview-playlist', verifyToken, async (req, res) => {
    try {
        const { server = 'netease', playlistId } = req.query;
        if (!playlistId) {
            return res.apiFail('歌单ID不能为空');
        }
        const songs = await userMusicService.previewPlaylist(server, playlistId);
        return res.apiSuccess(songs, '获取歌单成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

/**
 * @swagger
 * /api/user/music:
 *   post:
 *     summary: 添加歌曲
 *     tags: [用户音乐]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - songId
 *             properties:
 *               server:
 *                 type: string
 *                 enum: [netease, tencent]
 *               songId:
 *                 type: string
 */
router.post('/', verifyToken, async (req, res) => {
    try {
        const music = await userMusicService.addMusic(req.user.id, req.body);
        return res.apiSuccess(music, '添加歌曲成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

/**
 * @swagger
 * /api/user/music/batch:
 *   post:
 *     summary: 批量导入歌单
 *     tags: [用户音乐]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playlistId
 *             properties:
 *               server:
 *                 type: string
 *                 enum: [netease, tencent]
 *               playlistId:
 *                 type: string
 *               songIds:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.post('/batch', verifyToken, async (req, res) => {
    try {
        const result = await userMusicService.importPlaylist(req.user.id, req.body);
        return res.apiSuccess(result, '导入歌单成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

/**
 * @swagger
 * /api/user/music/reorder:
 *   put:
 *     summary: 调整歌曲顺序
 *     tags: [用户音乐]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderedIds
 *             properties:
 *               orderedIds:
 *                 type: array
 *                 items:
 *                   type: number
 */
router.put('/reorder', verifyToken, async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return res.apiFail('orderedIds 必须是数组');
        }
        await userMusicService.reorderMusic(req.user.id, orderedIds);
        return res.apiSuccess(null, '排序更新成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

/**
 * @swagger
 * /api/user/music/{id}:
 *   delete:
 *     summary: 删除歌曲
 *     tags: [用户音乐]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 */
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await userMusicService.deleteMusic(req.user.id, req.params.id);
        return res.apiSuccess(null, '删除成功');
    } catch (error) {
        return res.apiFail(error.message);
    }
});

module.exports = router;
