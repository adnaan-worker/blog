import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiGithub, FiCode, FiStar, FiGitBranch, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { SiGitee } from 'react-icons/si';
import { Button, Modal, Input, Tabs } from 'adnaan-ui';
import { API } from '@/utils/api';
import type { Project } from '@/types';

// 统一仓库接口
interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  issues: number;
  created_at: string;
  updated_at: string;
  homepage?: string;
  topics?: string[];
}

// GitHub API 响应接口
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  homepage?: string;
  topics?: string[];
}

// Gitee API 响应接口
interface GiteeRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  homepage?: string;
}

type Platform = 'github' | 'gitee';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess: () => void;
}

const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose, onSyncSuccess }) => {
  // Modal 内部管理自己的状态，避免父组件状态影响
  const [platform, setPlatform] = useState<Platform>('github');
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<RepoInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // 转换 GitHub 仓库数据
  const convertGitHubRepo = (repo: GitHubRepo): RepoInfo => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    issues: repo.open_issues_count,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    homepage: repo.homepage,
    topics: repo.topics,
  });

  // 转换 Gitee 仓库数据
  const convertGiteeRepo = (repo: GiteeRepo): RepoInfo => ({
    id: repo.id,
    name: repo.name,
    full_name: repo.full_name,
    description: repo.description,
    html_url: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    watchers: repo.watchers_count,
    issues: repo.open_issues_count,
    created_at: repo.created_at,
    updated_at: repo.updated_at,
    homepage: repo.homepage,
  });

  // ✅ 使用 ref 存储 AbortController，支持取消请求
  const fetchControllerRef = useRef<AbortController | null>(null);

  // 获取仓库列表（✅ 支持 AbortController 取消）
  const handleFetchRepos = useCallback(async () => {
    if (!username.trim()) {
      adnaan.toast.error(`请输入 ${platform === 'github' ? 'GitHub' : 'Gitee'} 用户名`);
      return;
    }

    // ✅ 取消之前的请求
    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }

    // ✅ 创建新的 AbortController
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    try {
      setLoading(true);
      let repoList: RepoInfo[] = [];

      if (platform === 'github') {
        const response = await fetch(
          `https://api.github.com/users/${username.trim()}/repos?sort=updated&per_page=100`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('用户不存在');
          }
          throw new Error('获取仓库失败');
        }

        const githubRepos: GitHubRepo[] = await response.json();
        repoList = githubRepos.map(convertGitHubRepo);
      } else {
        // Gitee API
        const response = await fetch(
          `https://gitee.com/api/v5/users/${username.trim()}/repos?sort=updated&per_page=100`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('用户不存在');
          }
          throw new Error('获取仓库失败');
        }

        const giteeRepos: GiteeRepo[] = await response.json();
        repoList = giteeRepos.map(convertGiteeRepo);
      }

      setRepos(repoList);
      adnaan.toast.success(`成功获取 ${repoList.length} 个仓库`);
    } catch (error: any) {
      // ✅ 忽略 AbortError
      if (error.name === 'AbortError') {
        console.log('请求已取消');
        return;
      }
      console.error(`获取 ${platform} 仓库失败:`, error);
      adnaan.toast.error(error.message || '获取仓库失败');
      setRepos([]);
    } finally {
      setLoading(false);
      fetchControllerRef.current = null;
    }
  }, [username, platform]);

  // ✅ 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
    };
  }, []);

  // 同步单个仓库
  const handleSyncRepo = useCallback(
    async (repo: RepoInfo) => {
      try {
        const projectData: Partial<Project> = {
          title: repo.name,
          slug: repo.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          description: repo.description || '',
          ...(platform === 'github' ? { githubUrl: repo.html_url } : { giteeUrl: repo.html_url }),
          demoUrl: repo.homepage || undefined,
          language: repo.language || 'Other',
          stars: repo.stars,
          forks: repo.forks,
          watchers: repo.watchers,
          issues: repo.issues,
          tags: repo.topics || [],
          status: 'active',
          isOpenSource: true,
          startedAt: repo.created_at,
          lastUpdatedAt: repo.updated_at,
        };

        await API.project.createProject(projectData);
        adnaan.toast.success(`项目 ${repo.name} 同步成功`);
        onSyncSuccess();
        handleClose();
      } catch (error: any) {
        console.error('同步项目失败:', error);
        adnaan.toast.error(error.message || '同步项目失败');
      }
    },
    [platform, onSyncSuccess],
  );

  // 关闭弹窗并重置状态
  const handleClose = useCallback(() => {
    setUsername('');
    setRepos([]);
    setLoading(false);
    onClose();
  }, [onClose]);

  // 处理回车键
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !loading && username.trim()) {
        handleFetchRepos();
      }
    },
    [loading, username, handleFetchRepos],
  );

  if (!isOpen) return null;

  const platformConfig = {
    github: {
      icon: <FiGithub size={20} />,
      title: 'GitHub',
      description: '输入您的 GitHub 用户名，我们将自动获取您的公开仓库列表，方便快速同步项目信息。',
      placeholder: '例如: octocat',
      color: '#24292e',
    },
    gitee: {
      icon: <SiGitee size={20} />,
      title: 'Gitee',
      description: '输入您的 Gitee 用户名，我们将自动获取您的公开仓库列表，方便快速同步项目信息。',
      placeholder: '例如: gitee_user',
      color: '#c71d23',
    },
  };

  const currentConfig = platformConfig[platform];

  return (
    <Modal isOpen={isOpen} title="同步 Git 项目" onClose={handleClose} size="large">
      <SyncContainer>
        <PlatformTabs>
          <Button
            variant={platform === 'github' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => {
              setPlatform('github');
              setUsername('');
              setRepos([]);
            }}
            style={{ flex: 1 }}
          >
            <FiGithub size={16} />
            <span>GitHub</span>
          </Button>
          <Button
            variant={platform === 'gitee' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => {
              setPlatform('gitee');
              setUsername('');
              setRepos([]);
            }}
            style={{ flex: 1 }}
          >
            <SiGitee size={16} />
            <span>Gitee</span>
          </Button>
        </PlatformTabs>

        <SyncDescription>
          {currentConfig.icon}
          <span>{currentConfig.description}</span>
        </SyncDescription>

        <SyncInputGroup>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={currentConfig.placeholder}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus
          />
          <Button variant="primary" onClick={handleFetchRepos} disabled={loading || !username.trim()}>
            {loading ? (
              <>
                <FiRefreshCw size={14} className="spin-icon" />
                <span style={{ marginLeft: '0.5rem' }}>获取中...</span>
              </>
            ) : (
              <>
                <FiDownload size={14} />
                <span style={{ marginLeft: '0.5rem' }}>获取仓库</span>
              </>
            )}
          </Button>
        </SyncInputGroup>

        {repos.length > 0 && (
          <>
            <RepoListHeader>
              找到 <strong>{repos.length}</strong> 个仓库，点击同步按钮导入项目
            </RepoListHeader>
            <RepoList>
              {repos.map((repo) => (
                <RepoItem key={repo.id}>
                  <RepoInfo>
                    <RepoTitle>
                      {platform === 'github' ? <FiGithub /> : <SiGitee />}
                      {repo.name}
                    </RepoTitle>
                    {repo.description && <RepoDescription>{repo.description}</RepoDescription>}
                    <RepoMeta>
                      {repo.language && (
                        <RepoMetaItem>
                          <FiCode /> {repo.language}
                        </RepoMetaItem>
                      )}
                      <RepoMetaItem>
                        <FiStar /> {repo.stars}
                      </RepoMetaItem>
                      <RepoMetaItem>
                        <FiGitBranch /> {repo.forks}
                      </RepoMetaItem>
                    </RepoMeta>
                  </RepoInfo>
                  <RepoActions>
                    <Button variant="primary" size="small" onClick={() => handleSyncRepo(repo)}>
                      <FiDownload size={14} />
                      <span style={{ marginLeft: '0.3rem' }}>同步</span>
                    </Button>
                  </RepoActions>
                </RepoItem>
              ))}
            </RepoList>
          </>
        )}

        {!loading && repos.length === 0 && username.trim() && (
          <EmptyState>
            {platform === 'github' ? <FiGithub size={48} /> : <SiGitee size={48} />}
            <p>未找到公开仓库</p>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
              请确认用户名是否正确，或该用户暂无公开仓库
            </span>
          </EmptyState>
        )}

        {!loading && !username && repos.length === 0 && (
          <EmptyStateInitial>
            {platform === 'github' ? (
              <FiGithub size={64} style={{ opacity: 0.3 }} />
            ) : (
              <SiGitee size={64} style={{ opacity: 0.3 }} />
            )}
            <p>输入 {currentConfig.title} 用户名开始同步</p>
          </EmptyStateInitial>
        )}
      </SyncContainer>

      <GlobalStyle />
    </Modal>
  );
};

// 全局样式组件
const GlobalStyle = () => (
  <style>{`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin-icon {
      animation: spin 1s linear infinite;
    }
  `}</style>
);

// 样式组件
const SyncContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PlatformTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
`;

const SyncDescription = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(var(--accent-rgb), 0.05);
  border: 1px solid rgba(var(--accent-rgb), 0.1);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;

  svg {
    flex-shrink: 0;
    color: var(--accent-color);
    margin-top: 0.1rem;
  }

  span {
    flex: 1;
  }
`;

const SyncInputGroup = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const RepoListHeader = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);

  strong {
    color: var(--accent-color);
    font-weight: 600;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: var(--text-tertiary);
  text-align: center;

  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  p {
    font-size: 1rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin: 0 0 0.5rem 0;
  }
`;

const EmptyStateInitial = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: var(--text-tertiary);
  text-align: center;

  svg {
    margin-bottom: 1rem;
  }

  p {
    font-size: 0.95rem;
    margin: 0;
  }
`;

const RepoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 60vh;
  overflow-y: auto;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
  }
`;

const RepoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-secondary);
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color);
    background: var(--bg-primary);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const RepoInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
`;

const RepoTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  word-break: break-all;

  svg {
    flex-shrink: 0;
    color: var(--accent-color);
  }
`;

const RepoDescription = styled.div`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RepoMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const RepoMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);

  svg {
    font-size: 0.85rem;
  }
`;

const RepoActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
`;

export default GitHubSyncModal;
