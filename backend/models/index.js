const { sequelize, Sequelize } = require('../config/db.config.js');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// 导入模型
db.User = require('./user.model.js')(sequelize, Sequelize);
db.Post = require('./post.model.js')(sequelize, Sequelize);
db.Comment = require('./comment.model.js')(sequelize, Sequelize);
db.Tag = require('./tag.model.js')(sequelize, Sequelize);
db.Categroup = require('./categroup.model.js')(sequelize, Sequelize);

// AI相关模型
db.AIChat = require('./ai-chat.model.js')(sequelize, Sequelize);
db.AITask = require('./ai-task.model.js')(sequelize, Sequelize);
db.AIQuota = require('./ai-quota.model.js')(sequelize, Sequelize);

// 个人中心相关模型
db.UserActivity = require('./user-activity.model.js')(sequelize, Sequelize);
db.UserAchievement = require('./user-achievement.model.js')(sequelize, Sequelize);
db.Achievement = require('./achievement.model.js')(sequelize, Sequelize);

// 手记相关模型
db.Note = require('./note.model.js')(sequelize, Sequelize);
db.NoteLike = require('./note-like.model.js')(sequelize, Sequelize);

// 文章点赞和收藏模型
db.PostLike = require('./post-like.model.js')(sequelize, Sequelize);
db.PostBookmark = require('./post-bookmark.model.js')(sequelize, Sequelize);

// 网站设置模型
db.SiteSettings = require('./site-settings.model.js')(sequelize, Sequelize);

// 项目模型
db.Project = require('./project.model.js')(sequelize, Sequelize);

// 定义模型之间的关系
// 用户与文章的关系：一对多
db.User.hasMany(db.Post, { as: 'posts', foreignKey: 'userId' });
db.Post.belongsTo(db.User, { as: 'author', foreignKey: 'userId' });

// 文章与评论的关系：一对多（基于通用 targetType/targetId）
// 仅当 targetType = 'post' 时建立关联
db.Post.hasMany(db.Comment, {
  as: 'comments',
  foreignKey: 'targetId',
  scope: { targetType: 'post' },
  constraints: false,
});
db.Comment.belongsTo(db.Post, {
  as: 'post',
  foreignKey: 'targetId',
  constraints: false,
});

// 用户与评论的关系：一对多
db.User.hasMany(db.Comment, { as: 'comments', foreignKey: 'userId' });
db.Comment.belongsTo(db.User, { as: 'author', foreignKey: 'userId' });

// 评论的自关联：评论回复功能
db.Comment.hasMany(db.Comment, { as: 'replies', foreignKey: 'parentId' });
db.Comment.belongsTo(db.Comment, { as: 'parent', foreignKey: 'parentId' });

// 文章与标签的关系：多对多
db.Post.belongsToMany(db.Tag, {
  through: 'post_tags',
  as: 'tags',
  foreignKey: 'post_id',
  otherKey: 'tag_id',
});
db.Tag.belongsToMany(db.Post, {
  through: 'post_tags',
  as: 'posts',
  foreignKey: 'tag_id',
  otherKey: 'post_id',
});

// 文章与分类的关系：多对一
db.Categroup.hasMany(db.Post, { as: 'posts', foreignKey: 'typeId' });
db.Post.belongsTo(db.Categroup, { as: 'category', foreignKey: 'typeId' });

// AI相关关系
// 用户与AI聊天记录的关系：一对多
db.User.hasMany(db.AIChat, { as: 'aiChats', foreignKey: 'userId' });
db.AIChat.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 用户与AI任务的关系：一对多
db.User.hasMany(db.AITask, { as: 'aiTasks', foreignKey: 'userId' });
db.AITask.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 用户与AI配额的关系：一对一
db.User.hasOne(db.AIQuota, { as: 'aiQuota', foreignKey: 'userId' });
db.AIQuota.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 个人中心相关关系
// 用户与用户活动的关系：一对多
db.User.hasMany(db.UserActivity, { as: 'activities', foreignKey: 'userId' });
db.UserActivity.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 用户与用户成就的关系：一对多
db.User.hasMany(db.UserAchievement, {
  as: 'achievements',
  foreignKey: 'userId',
});
db.UserAchievement.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 成就与用户成就的关系：一对多
db.Achievement.hasMany(db.UserAchievement, {
  as: 'userAchievements',
  foreignKey: 'achievementId',
});
db.UserAchievement.belongsTo(db.Achievement, {
  as: 'achievement',
  foreignKey: 'achievementId',
});

// 手记相关关系
// 用户与手记的关系：一对多
db.User.hasMany(db.Note, { as: 'notes', foreignKey: 'userId' });
db.Note.belongsTo(db.User, { as: 'author', foreignKey: 'userId' });

// 手记与点赞的关系：一对多
db.Note.hasMany(db.NoteLike, { as: 'likes', foreignKey: 'noteId' });
db.NoteLike.belongsTo(db.Note, { as: 'note', foreignKey: 'noteId' });

// 用户与手记点赞的关系：一对多
db.User.hasMany(db.NoteLike, { as: 'noteLikes', foreignKey: 'userId' });
db.NoteLike.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 用户与网站设置的关系：一对一
db.User.hasOne(db.SiteSettings, { as: 'siteSettings', foreignKey: 'userId' });
db.SiteSettings.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 文章点赞和收藏关系
// 文章与点赞的关系：一对多
db.Post.hasMany(db.PostLike, { as: 'likes', foreignKey: 'postId' });
db.PostLike.belongsTo(db.Post, { as: 'post', foreignKey: 'postId' });

// 用户与文章点赞的关系：一对多
db.User.hasMany(db.PostLike, { as: 'postLikes', foreignKey: 'userId' });
db.PostLike.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 文章与收藏的关系：一对多
db.Post.hasMany(db.PostBookmark, { as: 'bookmarks', foreignKey: 'postId' });
db.PostBookmark.belongsTo(db.Post, { as: 'post', foreignKey: 'postId' });

// 用户与文章收藏的关系：一对多
db.User.hasMany(db.PostBookmark, { as: 'postBookmarks', foreignKey: 'userId' });
db.PostBookmark.belongsTo(db.User, { as: 'user', foreignKey: 'userId' });

// 项目相关关系
// 用户与项目的关系：一对多
db.User.hasMany(db.Project, { as: 'projects', foreignKey: 'authorId' });
db.Project.belongsTo(db.User, { as: 'author', foreignKey: 'authorId' });

module.exports = db;
