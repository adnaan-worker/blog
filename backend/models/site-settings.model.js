const { DataTypes } = require('sequelize');

module.exports = sequelize => {
  const SiteSettings = sequelize.define(
    'site_settings',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
      },
      authorName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'author_name',
      },
      authorTitle: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'author_title',
      },
      authorBio: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'author_bio',
      },
      mbti: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      occupation: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      skills: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      socialLinks: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'social_links',
      },
      quote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      quoteAuthor: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'quote_author',
      },
      githubUsername: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'github_username',
      },
      giteeUsername: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: 'gitee_username',
      },
    },
    {
      tableName: 'site_settings',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['user_id'],
        },
      ],
    }
  );

  return SiteSettings;
};
