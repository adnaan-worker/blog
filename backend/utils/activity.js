const { UserActivity } = require('../models');
const { logger } = require('./logger');

/**
 * 活动记录工具类
 * 用于记录用户的各种活动
 */
class ActivityHelper {
  /**
   * 记录用户活动
   * @param {number} userId - 用户ID
   * @param {string} type - 活动类型
   * @param {Object} data - 活动数据
   * @param {string} data.title - 活动标题
   * @param {string} data.description - 活动描述
   * @param {string} data.link - 相关链接
   * @param {Object} data.metadata - 额外元数据
   * @param {number} data.priority - 优先级 (0-10, 默认5)
   */
  async record(userId, type, data) {
    try {
      await UserActivity.create({
        userId,
        type,
        title: data.title,
        description: data.description || '',
        link: data.link || null,
        metadata: data.metadata || {},
        priority: data.priority || 5,
      });

      logger.info(`记录用户活动: ${userId} - ${type}`);
    } catch (error) {
      logger.error('记录活动失败:', error);
    }
  }

  /**
   * 记录文章创建活动
   * @param {number} userId - 用户ID
   * @param {Object} post - 文章对象
   */
  async recordPostCreated(userId, post) {
    await this.record(userId, 'post_created', {
      title: post.title, // 只存储标题，前端会格式化展示
      description: '', // 文章不需要描述，前端会显示标题
      link: `/blog/${post.id}`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
        categoryId: post.typeId,
      },
      priority: 7,
    });
  }

  /**
   * 记录文章更新活动
   * @param {number} userId - 用户ID
   * @param {Object} post - 文章对象
   */
  async recordPostUpdated(userId, post) {
    await this.record(userId, 'post_updated', {
      title: post.title,
      description: '',
      link: `/blog/${post.id}`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
      },
      priority: 4,
    });
  }

  /**
   * 记录文章删除活动
   * @param {number} userId - 用户ID
   * @param {Object} post - 文章对象
   */
  async recordPostDeleted(userId, post) {
    await this.record(userId, 'post_deleted', {
      title: post.title || '已删除的文章',
      description: '',
      link: null,
      metadata: {
        postId: post.id,
        postTitle: post.title,
      },
      priority: 2,
    });
  }

  /**
   * 记录手记创建活动
   * @param {number} userId - 用户ID
   * @param {Object} note - 手记对象
   */
  async recordNoteCreated(userId, note) {
    await this.record(userId, 'note_created', {
      title: note.title || '', // 手记标题（如果有）
      description: note.content || '', // 手记内容，用于气泡显示
      link: `/notes/${note.id}`,
      metadata: {
        noteId: note.id,
        mood: note.mood,
      },
      priority: 6,
    });
  }

  /**
   * 记录评论创建活动
   * @param {number} userId - 用户ID
   * @param {Object} comment - 评论对象
   * @param {Object} post - 文章对象
   */
  async recordCommentCreated(userId, comment, post, postAuthorUsername) {
    await this.record(userId, 'comment_created', {
      title: post.title, // 文章标题，用于显示"在 xxx 中评论"
      description: comment.content || '', // 评论内容，用于气泡显示
      link: `/blog/${post.id}#comment-${comment.id}`,
      metadata: {
        postId: post.id,
        commentId: comment.id,
        postAuthorId: post.userId,
        postAuthorUsername: postAuthorUsername || undefined,
        postTitle: post.title,
      },
      priority: 6,
    });
  }

  /**
   * 记录点赞活动
   * @param {number} userId - 用户ID
   * @param {string} targetType - 目标类型 (post/note)
   * @param {Object} target - 目标对象
   */
  async recordLike(userId, targetType, target) {
    const link = targetType === 'post' ? `/blog/${target.id}` : `/notes/${target.id}`;

    await this.record(userId, `${targetType}_liked`, {
      title: target.title || '已删除的内容',
      description: '',
      link,
      metadata: {
        [`${targetType}Id`]: target.id,
        [`${targetType}Title`]: target.title,
      },
      priority: 3,
    });
  }

  /**
   * 记录收藏活动
   * @param {number} userId - 用户ID
   * @param {Object} post - 文章对象
   */
  async recordBookmark(userId, post) {
    await this.record(userId, 'post_bookmarked', {
      title: post.title,
      description: '',
      link: `/blog/${post.id}`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
        authorId: post.userId,
      },
      priority: 3,
    });
  }

  /**
   * 记录取消收藏活动
   * @param {number} userId - 用户ID
   * @param {Object} post - 文章对象
   */
  async recordUnbookmark(userId, post) {
    await this.record(userId, 'post_unbookmarked', {
      title: post.title,
      description: '',
      link: `/blog/${post.id}`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
      },
      priority: 2,
    });
  }

  /**
   * 记录手记更新活动
   * @param {number} userId - 用户ID
   * @param {Object} note - 手记对象
   */
  async recordNoteUpdated(userId, note) {
    await this.record(userId, 'note_updated', {
      title: note.title || '',
      description: note.content || '', // 更新后的内容
      link: `/notes/${note.id}`,
      metadata: {
        noteId: note.id,
        mood: note.mood,
      },
      priority: 3,
    });
  }

  /**
   * 记录手记删除活动
   * @param {number} userId - 用户ID
   * @param {Object} note - 手记对象
   */
  async recordNoteDeleted(userId, note) {
    await this.record(userId, 'note_deleted', {
      title: note.title || '已删除的手记',
      description: '',
      link: null,
      metadata: {
        noteId: note.id,
      },
      priority: 2,
    });
  }

  /**
   * 记录取消点赞活动
   * @param {number} userId - 用户ID
   * @param {string} targetType - 目标类型 (post/note)
   * @param {Object} target - 目标对象
   */
  async recordUnlike(userId, targetType, target) {
    const link = targetType === 'post' ? `/blog/${target.id}` : `/notes/${target.id}`;

    await this.record(userId, `${targetType}_unliked`, {
      title: target.title || '已删除的内容',
      description: '',
      link,
      metadata: {
        [`${targetType}Id`]: target.id,
        [`${targetType}Title`]: target.title,
      },
      priority: 2,
    });
  }

  /**
   * 记录收到点赞通知 (通知作者)
   * @param {number} authorId - 作者ID
   * @param {number} userId - 点赞用户ID
   * @param {string} targetType - 目标类型
   * @param {Object} target - 目标对象
   * @param {Object} user - 点赞用户信息
   */
  async recordLikeReceived(authorId, userId, targetType, target, user) {
    // 不要给自己发通知
    if (authorId === userId) return;

    const link = targetType === 'post' ? `/blog/${target.id}` : `/notes/${target.id}`;

    await this.record(authorId, 'like_received', {
      title: target.title || '已删除的内容',
      description: '',
      link,
      metadata: {
        [`${targetType}Id`]: target.id,
        [`${targetType}Title`]: target.title,
        userId,
        username: user?.username || '某人',
        targetType,
      },
      priority: 7,
    });
  }

  /**
   * 记录收到收藏通知 (通知作者)
   * @param {number} authorId - 作者ID
   * @param {number} userId - 收藏用户ID
   * @param {Object} post - 文章对象
   * @param {Object} user - 收藏用户信息
   */
  async recordBookmarkReceived(authorId, userId, post, user) {
    // 不要给自己发通知
    if (authorId === userId) return;

    await this.record(authorId, 'bookmark_received', {
      title: post.title,
      description: '',
      link: `/blog/${post.id}`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
        userId,
        username: user?.username || '某人',
      },
      priority: 6,
    });
  }

  /**
   * 记录收到评论通知 (通知作者)
   * @param {number} authorId - 作者ID
   * @param {number} userId - 评论用户ID
   * @param {Object} comment - 评论对象
   * @param {Object} post - 文章对象
   * @param {Object} user - 评论用户信息
   */
  async recordCommentReceived(authorId, userId, comment, post, user) {
    // 不要给自己发通知
    if (authorId === userId) return;

    await this.record(authorId, 'comment_received', {
      title: post.title,
      description: comment.content || '', // 评论内容，用于气泡显示
      link: `/blog/${post.id}#comment-${comment.id}`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
        commentId: comment.id,
        userId,
        username: user?.username || '某人',
      },
      priority: 8,
    });
  }

  /**
   * 记录文章审核通过
   * @param {number} userId - 用户ID
   * @param {Object} post - 文章对象
   */
  async recordPostApproved(userId, post) {
    await this.record(userId, 'post_approved', {
      title: post.title,
      description: '',
      link: `/blog/${post.id}`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
      },
      priority: 9,
    });
  }

  /**
   * 记录文章审核驳回
   * @param {number} userId - 用户ID
   * @param {Object} post - 文章对象
   * @param {string} reason - 驳回原因
   */
  async recordPostRejected(userId, post, reason) {
    await this.record(userId, 'post_rejected', {
      title: post.title,
      description: reason || '内容不符合规范', // 驳回原因
      link: `/blog/${post.id}/edit`,
      metadata: {
        postId: post.id,
        postTitle: post.title,
        reason,
      },
      priority: 10,
    });
  }
}

module.exports = new ActivityHelper();
