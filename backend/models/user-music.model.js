const { DataTypes } = require('sequelize');

module.exports = sequelize => {
    const UserMusic = sequelize.define(
        'UserMusic',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                comment: '主键id',
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                field: 'user_id',
                comment: '用户ID',
            },
            songId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'song_id',
                comment: '歌曲ID(来自平台)',
            },
            server: {
                type: DataTypes.ENUM('netease', 'tencent'),
                allowNull: false,
                defaultValue: 'netease',
                comment: '音乐平台',
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
                comment: '歌曲标题',
            },
            artist: {
                type: DataTypes.STRING(255),
                allowNull: true,
                comment: '歌手',
            },
            url: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: '播放URL',
            },
            pic: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: '封面URL',
            },
            lrc: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: '歌词URL',
            },
            sortOrder: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                field: 'sort_order',
                comment: '排序顺序',
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'created_at',
                comment: '创建时间',
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
                field: 'updated_at',
                comment: '更新时间',
            },
        },
        {
            tableName: 'user_music',
            timestamps: true,
            comment: '用户音乐表',
            indexes: [
                {
                    name: 'uk_user_song',
                    fields: ['user_id', 'song_id', 'server'],
                    unique: true,
                },
                {
                    name: 'idx_user_id',
                    fields: ['user_id'],
                },
                {
                    name: 'idx_sort_order',
                    fields: ['user_id', 'sort_order'],
                },
            ],
        }
    );

    return UserMusic;
};
