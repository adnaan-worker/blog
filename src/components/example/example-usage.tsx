import React, { useEffect, useState } from 'react';
import { API, http, debounce, storage } from '@/utils';

// 文章列表项类型
interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  createTime: string;
}

// 用户信息类型
interface UserInfo {
  id: number;
  username: string;
  avatar: string;
}

const ExampleUsage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 使用封装好的API获取文章列表
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await API.article.getArticles({ page: 1, pageSize: 10 });
      if (response.success) {
        setArticles(response.data);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('获取文章列表失败');
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // 使用封装好的http实例发送自定义请求
  const fetchUserInfo = async () => {
    try {
      const response = await http.get<UserInfo>('/user/info');
      if (response.success) {
        setUserInfo(response.data);
        // 使用封装好的storage存储用户信息
        storage.local.set('userInfo', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // 使用防抖函数处理搜索
  const handleSearch = debounce((keyword: string) => {
    console.log('Searching for:', keyword);
    // 实际项目中可以在这里调用搜索API
  }, 500);

  // 模拟登录请求
  const handleLogin = async () => {
    try {
      const response = await API.user.login({
        username: 'admin',
        password: '123456',
      });

      if (response.success) {
        // 存储token
        storage.local.set('token', response.data.token);
        // 获取用户信息
        fetchUserInfo();
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('登录失败');
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    // 从缓存中获取用户信息
    const cachedUserInfo = storage.local.get<UserInfo>('userInfo');
    if (cachedUserInfo) {
      setUserInfo(cachedUserInfo);
    }

    // 获取文章列表
    fetchArticles();
  }, []);

  return (
    <div className="example-container">
      <h1>API工具示例</h1>

      {/* 用户信息 */}
      <div className="user-info">
        {userInfo ? (
          <div>
            <h2>欢迎, {userInfo.username}</h2>
            <img src={userInfo.avatar} alt="avatar" />
          </div>
        ) : (
          <button onClick={handleLogin}>登录</button>
        )}
      </div>

      {/* 搜索框 */}
      <div className="search-box">
        <input type="text" placeholder="搜索文章..." onChange={(e) => handleSearch(e.target.value)} />
      </div>

      {/* 错误信息 */}
      {error && <div className="error-message">{error}</div>}

      {/* 文章列表 */}
      <div className="article-list">
        <h2>文章列表</h2>
        {loading ? (
          <div>加载中...</div>
        ) : (
          <ul>
            {articles.map((article) => (
              <li key={article.id}>
                <h3>{article.title}</h3>
                <p>作者: {article.author}</p>
                <p>{article.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExampleUsage;
