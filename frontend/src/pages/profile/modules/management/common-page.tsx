/**
 * 通用管理页面组件
 * 统一处理：手记、文章、评论、收藏、点赞、用户、分类、标签等
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Button, Modal, Input, Select, Textarea, ColorPicker, Switch } from 'adnaan-ui';
import {
  FiEdit3,
  FiTrash2,
  FiEye,
  FiHeart,
  FiCalendar,
  FiMessageSquare,
  FiFolder,
  FiCheck,
  FiAlertTriangle,
} from 'react-icons/fi';
import { API, formatDate } from '@/utils';
import { RichTextParser } from '@/utils/editor/parser';
import { FadeScrollContainer } from '@/components/common';
import { RichTextEditor } from '@/components/rich-text';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { useModalScrollLock } from '@/hooks';
import type { UserProfile, Category, Tag, Project } from '@/types';
import { ManagementLayout } from '../common/management-layout';
import {
  ItemCard,
  ItemHeader,
  ItemTitle,
  ItemActions,
  ActionButton,
  ItemContent,
  ItemMeta,
  MetaItem,
} from '../common/item-card';
import { useManagementPage } from '../common/management-hooks';
import GithubSyncModal from './github-sync-modal';

// 页面类型定义
type PageType =
  | 'notes'
  | 'articles'
  | 'comments'
  | 'bookmarks'
  | 'likes'
  | 'users'
  | 'categories'
  | 'tags'
  | 'projects';

// 页面配置接口
interface PageConfig {
  title: string;
  emptyText: string;
  searchPlaceholder: string;
  fetchFn: (params: any) => Promise<any>;
  deleteFn?: (id: number) => Promise<any>;
  getEditUrl?: (id: number) => string;
  getViewUrl?: (id: number) => string;
  customRender?: (item: any, actions: any) => React.ReactNode;
}

// 页面配置
const PAGE_CONFIG: Record<PageType, PageConfig> = {
  notes: {
    title: '手记管理',
    emptyText: '还没有创建任何手记',
    searchPlaceholder: '搜索手记...',
    fetchFn: (params: any) => {
      const { status, keyword, ...rest } = params || {};

      // 将通用的 keyword 映射为后端使用的 search
      const apiParams: any = {
        ...rest,
        search: keyword,
      };

      // 使用 status 作为私密性筛选键：public/private
      if (status === 'public') {
        apiParams.isPrivate = false;
      } else if (status === 'private') {
        apiParams.isPrivate = true;
      }

      return API.note.getMyNotes(apiParams);
    },
    deleteFn: (id: number) => API.note.deleteNote(id),
    // 编辑器通过查询参数 ?id= 识别当前手记
    getEditUrl: (id: number) => `/editor/note?id=${id}`,
    // 详情页路由：/notes/:id
    getViewUrl: (id: number) => `/notes/${id}`,
  },
  articles: {
    title: '文章管理',
    emptyText: '还没有创建任何文章',
    searchPlaceholder: '搜索文章...',
    fetchFn: (params: any) => {
      const { status, keyword, ...rest } = params || {};

      const apiParams: any = {
        ...rest,
        // 将通用的 keyword 映射为后端使用的 search
        search: keyword,
      };

      // status 直接映射为后端的数值状态（仅管理员生效）：0=草稿 1=已发布 2=已归档
      if (status !== undefined && status !== '') {
        const parsed = parseInt(status, 10);
        if (!Number.isNaN(parsed)) {
          apiParams.status = parsed;
        }
      }

      return API.article.getMyArticles(apiParams);
    },
    deleteFn: (id: number) => API.article.deleteArticle(id),
    // 编辑器通过查询参数 ?id= 识别当前文章
    getEditUrl: (id: number) => `/editor/article?id=${id}`,
    // 详情页路由：/blog/:id
    getViewUrl: (id: number) => `/blog/${id}`,
  },
  comments: {
    title: '评论管理',
    emptyText: '还没有任何评论',
    searchPlaceholder: '搜索评论...',
    fetchFn: (params: any) => API.comment.getUserComments(params),
    deleteFn: (id: number) => API.comment.deleteComment(id),
  },
  bookmarks: {
    title: '收藏管理',
    emptyText: '还没有收藏任何内容',
    searchPlaceholder: '搜索收藏...',
    fetchFn: (params: any) => API.article.getMyArticles({ ...params, bookmarked: true }),
    // 收藏的数据本质是文章列表，这里提供查看文章详情的入口
    getViewUrl: (id: number) => `/blog/${id}`,
  },
  likes: {
    title: '点赞管理',
    emptyText: '还没有点赞任何内容',
    searchPlaceholder: '搜索点赞...',
    fetchFn: (params: any) => API.article.getMyArticles({ ...params, liked: true }),
    // 点赞列表同样对应文章，提供查看详情
    getViewUrl: (id: number) => `/blog/${id}`,
  },
  // 用户、分类、标签管理 - 使用真实后端接口
  users: {
    title: '用户管理',
    emptyText: '暂无用户',
    searchPlaceholder: '搜索用户名、邮箱...',
    fetchFn: (params: any) =>
      API.user.getAllUsers({
        ...params,
        search: params.keyword,
      }),
    deleteFn: (id: number) => API.user.deleteUser(id),
  },
  categories: {
    title: '分类管理',
    emptyText: '暂无分类',
    searchPlaceholder: '搜索分类...',
    fetchFn: (params: any) =>
      API.category.getCategories({
        ...params,
        search: params.keyword,
      }),
    deleteFn: (id: number) => API.category.deleteCategory(id),
  },
  tags: {
    title: '标签管理',
    emptyText: '暂无标签',
    searchPlaceholder: '搜索标签...',
    fetchFn: (params: any) =>
      API.tag.getTags({
        ...params,
        search: params.keyword,
      }),
    deleteFn: (id: number) => API.tag.deleteTag(id),
  },
  projects: {
    title: '项目管理',
    emptyText: '暂无项目',
    searchPlaceholder: '搜索项目名称、描述...',
    fetchFn: (params: any) =>
      API.project.getProjects({
        ...params,
        keyword: params.keyword,
        includePrivate: true,
      }),
    deleteFn: (id: number) => API.project.deleteProject(id),
    getViewUrl: (id: number) => `/projects/${id}`,
  },
};

interface CommonPageProps {
  type: PageType;
  // 初始状态筛选（例如从仪表盘待办跳转到“待审核评论”）
  initialStatusFilter?: string;
}

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
  gap: 1rem;
`;

// 列表滚动容器，配合虚拟滚动使用
const ScrollWrapper = styled.div`
  max-height: 640px;
  overflow-y: auto;
  overflow-x: hidden;
  -ms-overflow-style: none;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

// 移动端卡片样式
const MobileCard = styled.div`
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1rem;
  border: 1px solid var(--border-color);
  margin-bottom: 0.75rem;
  position: relative;
  transition: all 0.2s ease;

  &:active {
    background: var(--bg-secondary);
    transform: scale(0.98);
  }
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const MobileCardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MobileCardContent = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MobileCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--border-color);
  padding-top: 0.75rem;
`;

const MobileMeta = styled.div`
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-tertiary);

  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const MobileActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const CommonPage: React.FC<CommonPageProps> = ({ type, initialStatusFilter }) => {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[type];

  // 使用 useRef 来稳定 config 引用，避免不必要的重新创建
  const configRef = React.useRef(config);

  // 追踪是否已经加载过数据
  const [hasLoaded, setHasLoaded] = React.useState(false);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // API 响应适配器 - 统一不同 API 的返回格式
  // 关键：不依赖 config，使用 configRef
  const fetchData = useCallback(
    async (params: any) => {
      const currentConfig = configRef.current;

      try {
        const response = await currentConfig.fetchFn(params);

        // 适配不同的 API 返回格式
        let data = response.data;
        let pagination = response.meta?.pagination;

        // 如果 data 是数组，直接使用
        if (Array.isArray(data)) {
          // do nothing extra
        }
        // 如果 data 包含 data 属性（嵌套结构）
        else if (data && Array.isArray(data.data)) {
          pagination = data.pagination || data.meta?.pagination;
          data = data.data;
        }
        // 如果 data 包含 items 属性
        else if (data && Array.isArray(data.items)) {
          pagination = data.pagination || data.meta?.pagination;
          data = data.items;
        }

        // 确保 pagination 有默认值
        if (!pagination) {
          pagination = {
            total: data.length,
            page: params.page || 1,
            limit: params.limit || 10,
            totalPages: Math.ceil(data.length / (params.limit || 10)),
          };
        }

        const result = {
          success: true,
          code: 200,
          message: 'success',
          data,
          meta: {
            pagination,
            timestamp: new Date().toISOString(),
          },
        };

        // 标记已经加载过数据
        setHasLoaded(true);

        return result;
      } catch (error) {
        console.error(`[CommonPage ${type}] ❌ Error:`, error);
        setHasLoaded(true); // 即使失败也标记为已加载
        throw error;
      }
    },
    [type],
  ); // 只依赖 type，不依赖 config

  const initialParams = React.useMemo(
    () =>
      type === 'comments' && initialStatusFilter
        ? ({ status: initialStatusFilter } as { status: string })
        : ({} as { status?: string }),
    [type, initialStatusFilter],
  );

  const { items, isLoading, hasMore, error, loadMore, reload, search, totalItems, filter } = useManagementPage({
    fetchFunction: fetchData,
    initialParams,
    limit: 10,
  });

  // 是否支持在当前列表中直接创建新内容
  const supportsCreate =
    type === 'notes' || type === 'articles' || type === 'users' || type === 'categories' || type === 'tags';

  // 是否启用筛选条
  // 评论：按状态筛选（approved/pending/spam）
  // 项目：按项目状态筛选（active/developing/paused/archived）
  // 手记：按公开/私密筛选
  // 文章：按发布状态筛选（草稿/已发布/已归档，仅管理员生效）
  const enableFilters = type === 'comments' || type === 'projects' || type === 'notes' || type === 'articles';

  // 筛选条展开状态：如果带初始筛选（如待审核评论），默认展开
  const [isFilterOpen, setIsFilterOpen] = React.useState(type === 'comments' && !!initialStatusFilter);

  // 不同类型的筛选选项
  const filterOptions = React.useMemo(() => {
    if (type === 'comments') {
      return [
        { key: 'approved', label: '已通过' },
        { key: 'pending', label: '待审核' },
        { key: 'spam', label: '垃圾/屏蔽' },
      ];
    }

    if (type === 'projects') {
      return [
        { key: 'active', label: '活跃' },
        { key: 'developing', label: '开发中' },
        { key: 'paused', label: '暂停' },
        { key: 'archived', label: '已归档' },
      ];
    }

    if (type === 'notes') {
      return [
        { key: 'public', label: '公开' },
        { key: 'private', label: '私密' },
      ];
    }

    if (type === 'articles') {
      return [
        { key: '0', label: '草稿' },
        { key: '1', label: '已发布' },
        { key: '2', label: '已归档' },
      ];
    }

    return [] as Array<{ key: string; label: string }>;
  }, [type]);

  // ========== 用户 / 分类 / 标签 编辑状态管理 ==========

  // 用户
  const [isUserModalOpen, setIsUserModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<UserProfile | null>(null);
  const [userForm, setUserForm] = React.useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'banned',
  });

  // 分类
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = React.useState({
    name: '',
    slug: '',
    description: '',
  });

  // 标签
  const [isTagModalOpen, setIsTagModalOpen] = React.useState(false);
  const [editingTag, setEditingTag] = React.useState<Tag | null>(null);
  const [tagForm, setTagForm] = React.useState({
    name: '',
    slug: '',
    color: '#3B82F6',
    description: '',
  });

  // 项目编辑
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [projectForm, setProjectForm] = React.useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    status: 'developing' as Project['status'],
    visibility: 'public' as Project['visibility'],
    language: '',
    tags: '',
    techStack: '',
    githubUrl: '',
    giteeUrl: '',
    demoUrl: '',
    docsUrl: '',
    npmPackage: '',
    isFeatured: false,
    isOpenSource: true,
  });

  // Git 项目同步弹窗
  const [isSyncModalOpen, setIsSyncModalOpen] = React.useState(false);

  // 滚动锁定（任意一个 Modal 打开时锁定）
  useModalScrollLock(isUserModalOpen || isCategoryModalOpen || isTagModalOpen || isProjectModalOpen || isSyncModalOpen);

  // 虚拟滚动相关
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const {
    visibleItems,
    visibleRange,
    topSpacer,
    bottomSpacer,
    handleScroll: handleVirtualScroll,
    recordItemHeight,
  } = useVirtualScroll<any>({
    items,
    threshold: 30,
    estimatedHeight: 120,
    overscan: 8,
  });

  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    // 虚拟滚动计算
    handleVirtualScroll(scrollTop, clientHeight);

    // 距离底部 200px 时触发加载更多
    if (!isLoading && hasMore && scrollTop + clientHeight >= scrollHeight - 200) {
      loadMore();
    }
  }, [handleVirtualScroll, isLoading, hasMore, loadMore]);

  // 顶部「添加」按钮行为
  const handleAdd = React.useCallback(() => {
    if (type === 'notes') {
      navigate('/editor/note');
      return;
    }
    if (type === 'articles') {
      navigate('/editor/article');
      return;
    }

    if (type === 'users') {
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        fullName: '',
        password: '',
        role: 'user',
        status: 'active',
      });
      setIsUserModalOpen(true);
      return;
    }

    if (type === 'categories') {
      setEditingCategory(null);
      setCategoryForm({ name: '', slug: '', description: '' });
      setIsCategoryModalOpen(true);
      return;
    }

    if (type === 'tags') {
      setEditingTag(null);
      setTagForm({ name: '', slug: '', color: '#3B82F6', description: '' });
      setIsTagModalOpen(true);
      return;
    }

    if (type === 'projects') {
      setIsSyncModalOpen(true);
    }
  }, [navigate, type]);

  // 列表项编辑行为：notes/articles 走路由，其余使用弹窗
  const handleEditItem = React.useCallback(
    (item: any) => {
      if (type === 'notes') {
        navigate(`/editor/note?id=${item.id}`);
        return;
      }
      if (type === 'articles') {
        navigate(`/editor/article?id=${item.id}`);
        return;
      }

      if (type === 'users') {
        const user = item as UserProfile;
        setEditingUser(user);
        setUserForm({
          username: user.username,
          email: user.email,
          fullName: user.fullName || '',
          password: '',
          role: (user.role as 'user' | 'admin') || 'user',
          status: (user.status as 'active' | 'inactive' | 'banned') || 'active',
        });
        setIsUserModalOpen(true);
        return;
      }

      if (type === 'categories') {
        const category = item as Category;
        setEditingCategory(category);
        setCategoryForm({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
        });
        setIsCategoryModalOpen(true);
        return;
      }

      if (type === 'tags') {
        const tag = item as Tag;
        setEditingTag(tag);
        setTagForm({
          name: tag.name,
          slug: tag.slug,
          color: tag.color || '#3B82F6',
          description: tag.description || '',
        });
        setIsTagModalOpen(true);
        return;
      }

      if (type === 'projects') {
        const project = item as Project;
        setEditingProject(project);
        setProjectForm({
          title: project.title,
          slug: project.slug,
          description: project.description || '',
          content: project.content || '',
          status: project.status,
          visibility: project.visibility,
          language: project.language || '',
          tags: (project.tags || []).join(', '),
          techStack: (project.techStack || []).join(', '),
          githubUrl: project.githubUrl || '',
          giteeUrl: project.giteeUrl || '',
          demoUrl: project.demoUrl || '',
          docsUrl: project.docsUrl || '',
          npmPackage: project.npmPackage || '',
          isFeatured: project.isFeatured,
          isOpenSource: project.isOpenSource,
        });
        setIsProjectModalOpen(true);
        return;
      }
    },
    [navigate, type],
  );

  // 保存用户
  const handleSaveUser = React.useCallback(async () => {
    try {
      if (editingUser) {
        await API.user.updateUser(editingUser.id, userForm);
        adnaan.toast.success('更新成功');
      } else {
        await API.user.createUser(userForm);
        adnaan.toast.success('创建成功');
      }
      setIsUserModalOpen(false);
      reload();
    } catch (error: any) {
      adnaan.toast.error(error.message || '操作失败');
    }
  }, [editingUser, userForm, reload]);

  // 保存分类
  const handleSaveCategory = React.useCallback(async () => {
    try {
      if (editingCategory) {
        await API.category.updateCategory(editingCategory.id, categoryForm);
        adnaan.toast.success('更新成功');
      } else {
        await API.category.createCategory(categoryForm);
        adnaan.toast.success('创建成功');
      }
      setIsCategoryModalOpen(false);
      reload();
    } catch (error: any) {
      adnaan.toast.error(error.message || '操作失败');
    }
  }, [editingCategory, categoryForm, reload]);

  // 保存标签
  const handleSaveTag = React.useCallback(async () => {
    try {
      if (editingTag) {
        await API.tag.updateTag(editingTag.id, tagForm);
        adnaan.toast.success('更新成功');
      } else {
        await API.tag.createTag(tagForm);
        adnaan.toast.success('创建成功');
      }
      setIsTagModalOpen(false);
      reload();
    } catch (error: any) {
      adnaan.toast.error(error.message || '操作失败');
    }
  }, [editingTag, tagForm, reload]);

  // 保存项目（新增/编辑）
  const handleSaveProject = React.useCallback(async () => {
    try {
      const payload: Partial<Project> = {
        title: projectForm.title.trim(),
        slug: projectForm.slug.trim(),
        description: projectForm.description?.trim() || undefined,
        content: projectForm.content?.trim() || undefined,
        status: projectForm.status,
        visibility: projectForm.visibility,
        language: projectForm.language?.trim() || undefined,
        tags: projectForm.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        techStack: projectForm.techStack
          .split(',')
          .map((tech) => tech.trim())
          .filter(Boolean),
        githubUrl: projectForm.githubUrl?.trim() || undefined,
        giteeUrl: projectForm.giteeUrl?.trim() || undefined,
        demoUrl: projectForm.demoUrl?.trim() || undefined,
        docsUrl: projectForm.docsUrl?.trim() || undefined,
        npmPackage: projectForm.npmPackage?.trim() || undefined,
        isFeatured: projectForm.isFeatured,
        isOpenSource: projectForm.isOpenSource,
      };

      if (!payload.title || !payload.slug) {
        adnaan.toast.error('请填写项目标题和 slug');
        return;
      }

      if (editingProject) {
        await API.project.updateProject(editingProject.id, payload);
        adnaan.toast.success('项目更新成功');
      } else {
        await API.project.createProject(payload);
        adnaan.toast.success('项目创建成功');
      }

      setIsProjectModalOpen(false);
      reload();
    } catch (error: any) {
      adnaan.toast.error(error.message || '操作失败');
    }
  }, [editingProject, projectForm, reload]);

  // 删除操作
  const handleDelete = async (id: number, title: string) => {
    if (!config.deleteFn) return;

    const confirmed = await adnaan.confirm.delete(`确定要删除"${title}"吗？`, '删除确认');

    if (!confirmed) return;

    try {
      await config.deleteFn(id);
      adnaan.toast.success('删除成功');
      reload();
    } catch (error: any) {
      adnaan.toast.error(error.message || '删除失败');
    }
  };

  // 渲染移动端单个项目
  const renderMobileItem = (item: any) => {
    const title = item.title || item.name || item.username || '无标题';
    const content = item.content ? RichTextParser.extractText(item.content).slice(0, 100) : item.description || '';

    return (
      <MobileCard onClick={() => (config.getViewUrl ? window.open(config.getViewUrl(item.id), '_blank') : undefined)}>
        <MobileCardHeader>
          <MobileCardTitle>{title}</MobileCardTitle>
          {/* 状态标签可以放在这里 */}
        </MobileCardHeader>

        {content && <MobileCardContent>{content}</MobileCardContent>}

        <MobileCardFooter>
          <MobileMeta>
            <span>{formatDate(item.createdAt).split(' ')[0]}</span>
            {item.viewCount !== undefined && <span>{item.viewCount} 阅</span>}
            {item.likeCount !== undefined && <span>{item.likeCount} 赞</span>}
          </MobileMeta>

          <MobileActions onClick={(e) => e.stopPropagation()}>
            {(config.getEditUrl ||
              type === 'users' ||
              type === 'categories' ||
              type === 'tags' ||
              type === 'projects') && (
              <ActionButton onClick={() => handleEditItem(item)} title="编辑" style={{ width: 32, height: 32 }}>
                <FiEdit3 size={14} />
              </ActionButton>
            )}
            {config.deleteFn && (
              <ActionButton
                onClick={() => handleDelete(item.id, title)}
                title="删除"
                style={{ width: 32, height: 32, color: 'var(--error-color)' }}
              >
                <FiTrash2 size={14} />
              </ActionButton>
            )}
          </MobileActions>
        </MobileCardFooter>
      </MobileCard>
    );
  };

  // 渲染单个项目（具体内容），外层容器和 key 由虚拟列表容器负责
  const renderItem = (item: any) => {
    if (isMobile) {
      return renderMobileItem(item);
    }

    // 评论管理：支持审核操作（通过 / 标记垃圾）
    if (type === 'comments') {
      const status: 'approved' | 'pending' | 'spam' = item.status || 'pending';
      const statusText = status === 'approved' ? '已通过' : status === 'spam' ? '垃圾/屏蔽' : '待审核';
      const targetLabel = item.targetType === 'note' ? '手记' : item.targetType === 'project' ? '项目' : '文章';
      const targetTitle = item.targetTitle;

      const handleOpenTarget = () => {
        if (item.targetType === 'post') {
          navigate(`/blog/${item.targetId}`);
        } else if (item.targetType === 'note') {
          navigate(`/notes/${item.targetId}`);
        } else if (item.targetType === 'project') {
          navigate(`/projects/${item.targetId}`);
        }
      };

      const handleChangeStatus = async (newStatus: 'approved' | 'pending' | 'spam') => {
        try {
          await API.comment.updateCommentStatus(item.id, newStatus);
          adnaan.toast.success('评论状态更新成功');
          reload();
        } catch (error: any) {
          adnaan.toast.error(error.message || '更新评论状态失败');
        }
      };

      const content = item.content ? RichTextParser.extractText(item.content).slice(0, 150) : '';
      const authorName = item.author?.username || item.guestName || '访客';

      return (
        <ItemCard>
          <ItemHeader>
            <ItemTitle onClick={handleOpenTarget}>
              {authorName} 在{targetLabel}《{targetTitle}》的评论
            </ItemTitle>
            <ItemActions>
              {status === 'pending' && (
                <ActionButton onClick={() => handleChangeStatus('approved')} title="通过">
                  <FiCheck />
                </ActionButton>
              )}
              {status !== 'spam' && (
                <ActionButton onClick={() => handleChangeStatus('spam')} title="标记垃圾">
                  <FiAlertTriangle />
                </ActionButton>
              )}
              {config.deleteFn && (
                <ActionButton onClick={() => handleDelete(item.id, '评论')} title="删除">
                  <FiTrash2 />
                </ActionButton>
              )}
            </ItemActions>
          </ItemHeader>

          {content && <ItemContent>{content}</ItemContent>}

          <ItemMeta>
            <MetaItem>
              <FiCalendar />
              <span>{formatDate(item.createdAt)}</span>
            </MetaItem>
            <MetaItem>
              <FiMessageSquare />
              <span>状态：{statusText}</span>
            </MetaItem>
          </ItemMeta>
        </ItemCard>
      );
    }

    const title = item.title || item.name || item.username || '无标题';
    const content = item.content ? RichTextParser.extractText(item.content).slice(0, 150) : '';

    return (
      <ItemCard>
        <ItemHeader>
          <ItemTitle>{title}</ItemTitle>
          <ItemActions>
            {config.getViewUrl && (
              <ActionButton onClick={() => window.open(config.getViewUrl!(item.id), '_blank')} title="查看">
                <FiEye />
              </ActionButton>
            )}
            {(config.getEditUrl ||
              type === 'users' ||
              type === 'categories' ||
              type === 'tags' ||
              type === 'projects') && (
              <ActionButton onClick={() => handleEditItem(item)} title="编辑">
                <FiEdit3 />
              </ActionButton>
            )}
            {config.deleteFn && (
              <ActionButton onClick={() => handleDelete(item.id, title)} title="删除">
                <FiTrash2 />
              </ActionButton>
            )}
          </ItemActions>
        </ItemHeader>

        {content && <ItemContent>{content}</ItemContent>}

        <ItemMeta>
          <MetaItem>
            <FiCalendar />
            <span>{formatDate(item.createdAt)}</span>
          </MetaItem>
          {item.viewCount !== undefined && (
            <MetaItem>
              <FiEye />
              <span>{item.viewCount} 次浏览</span>
            </MetaItem>
          )}
          {item.likeCount !== undefined && (
            <MetaItem>
              <FiHeart />
              <span>{item.likeCount} 次点赞</span>
            </MetaItem>
          )}
          {item.commentCount !== undefined && (
            <MetaItem>
              <FiMessageSquare />
              <span>{item.commentCount} 条评论</span>
            </MetaItem>
          )}
        </ItemMeta>
      </ItemCard>
    );
  };

  return (
    <>
      <ManagementLayout
        title={config.title}
        icon={<FiFolder />}
        searchPlaceholder={config.searchPlaceholder}
        searchValue={search.searchQuery}
        onSearchChange={search.setSearchQuery}
        loading={isLoading}
        total={totalItems}
        showFilters={enableFilters && isFilterOpen}
        onToggleFilters={enableFilters ? () => setIsFilterOpen((prev) => !prev) : undefined}
        filterOptions={enableFilters ? filterOptions : []}
        selectedFilter={enableFilters ? filter.selectedFilter : ''}
        onFilterChange={enableFilters ? filter.handleFilterChange : undefined}
        onAdd={handleAdd}
        createButton={
          type === 'projects' ? (
            <Button variant="primary" size="small" onClick={() => setIsSyncModalOpen(true)}>
              同步 Git 项目
            </Button>
          ) : supportsCreate ? undefined : (
            <></>
          )
        }
        onRefresh={reload}
      >
        {error ? (
          <EmptyContainer>
            <div>加载失败: {error.message}</div>
            <Button variant="secondary" onClick={reload}>
              重试
            </Button>
          </EmptyContainer>
        ) : !hasLoaded ? (
          <EmptyContainer>
            <div>加载中...</div>
          </EmptyContainer>
        ) : items.length === 0 ? (
          <EmptyContainer>
            <div>{config.emptyText}</div>
          </EmptyContainer>
        ) : (
          <FadeScrollContainer dependencies={[items.length, isLoading]}>
            <ScrollWrapper ref={scrollRef} onScroll={handleScroll}>
              <ListContainer>
                {topSpacer > 0 && <div style={{ height: topSpacer }} />}

                {visibleItems.map((item, index) => {
                  const actualIndex = visibleRange.start + index;
                  const key = item.id ?? actualIndex;

                  return (
                    <div
                      key={key}
                      ref={(el) => {
                        if (el) {
                          recordItemHeight(key, el.getBoundingClientRect().height);
                        }
                      }}
                    >
                      {renderItem(item)}
                    </div>
                  );
                })}

                {bottomSpacer > 0 && <div style={{ height: bottomSpacer }} />}

                {hasMore && (
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Button variant="secondary" onClick={loadMore} disabled={isLoading}>
                      {isLoading ? '加载中...' : '加载更多'}
                    </Button>
                  </div>
                )}
              </ListContainer>
            </ScrollWrapper>
          </FadeScrollContainer>
        )}
      </ManagementLayout>

      {type === 'users' && (
        <Modal
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          title={editingUser ? '编辑用户' : '添加用户'}
          size="medium"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsUserModalOpen(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                保存
              </Button>
            </>
          }
        >
          <FormGroup>
            <Label>用户名 *</Label>
            <Input
              type="text"
              placeholder="请输入用户名"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>邮箱 *</Label>
            <Input
              type="email"
              placeholder="请输入邮箱"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>全名</Label>
            <Input
              type="text"
              placeholder="请输入全名"
              value={userForm.fullName}
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
            />
          </FormGroup>

          {!editingUser && (
            <FormGroup>
              <Label>密码 *</Label>
              <Input
                type="password"
                placeholder="请输入密码（至少6位）"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>角色</Label>
            <Select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as 'user' | 'admin' })}
            >
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>状态</Label>
            <Select
              value={userForm.status}
              onChange={(e) => setUserForm({ ...userForm, status: e.target.value as 'active' | 'inactive' | 'banned' })}
            >
              <option value="active">正常</option>
              <option value="inactive">禁用</option>
              <option value="banned">封禁</option>
            </Select>
          </FormGroup>
        </Modal>
      )}

      {type === 'projects' && (
        <>
          <Modal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
            title={editingProject ? '编辑项目' : '添加项目'}
            size="large"
            footer={
              <>
                <Button variant="secondary" onClick={() => setIsProjectModalOpen(false)}>
                  取消
                </Button>
                <Button variant="primary" onClick={handleSaveProject}>
                  保存
                </Button>
              </>
            }
          >
            <FormGroup>
              <Label>项目名称 *</Label>
              <Input
                type="text"
                placeholder="请输入项目名称"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>Slug *</Label>
              <Input
                type="text"
                placeholder="URL 标识（例如 my-project）"
                value={projectForm.slug}
                onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>简介</Label>
              <Textarea
                placeholder="简单介绍这个项目的定位和目标"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                size="small"
              />
            </FormGroup>

            <FormGroup>
              <Label>项目内容</Label>
              <div style={{ borderRadius: 12, overflow: 'hidden' }}>
                <RichTextEditor
                  content={projectForm.content}
                  onChange={(html) => setProjectForm({ ...projectForm, content: html })}
                  maxHeight="420px"
                  placeholder="在这里编写项目的详细介绍、特性说明等富文本内容..."
                />
              </div>
            </FormGroup>

            <FormGroup>
              <Label>状态 & 可见性</Label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Select
                  value={projectForm.status}
                  onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value as Project['status'] })}
                >
                  <option value="active">活跃</option>
                  <option value="developing">开发中</option>
                  <option value="paused">暂停</option>
                  <option value="archived">已归档</option>
                </Select>

                <Select
                  value={projectForm.visibility}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      visibility: e.target.value as Project['visibility'],
                    })
                  }
                >
                  <option value="public">公开</option>
                  <option value="private">私有</option>
                </Select>
              </div>
            </FormGroup>

            <FormGroup>
              <Label>主要语言</Label>
              <Input
                type="text"
                placeholder="例如：TypeScript"
                value={projectForm.language}
                onChange={(e) => setProjectForm({ ...projectForm, language: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>标签（逗号分隔）</Label>
              <Input
                type="text"
                placeholder="例如：blog, personal, open-source"
                value={projectForm.tags}
                onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>技术栈（逗号分隔）</Label>
              <Input
                type="text"
                placeholder="例如：React, Node.js, MySQL"
                value={projectForm.techStack}
                onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>链接</Label>
              <Input
                type="text"
                placeholder="GitHub 仓库地址"
                value={projectForm.githubUrl}
                onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                style={{ marginBottom: '0.5rem' }}
              />
              <Input
                type="text"
                placeholder="Gitee 仓库地址（可选）"
                value={projectForm.giteeUrl}
                onChange={(e) => setProjectForm({ ...projectForm, giteeUrl: e.target.value })}
                style={{ marginBottom: '0.5rem' }}
              />
              <Input
                type="text"
                placeholder="在线演示地址（可选）"
                value={projectForm.demoUrl}
                onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })}
                style={{ marginBottom: '0.5rem' }}
              />
              <Input
                type="text"
                placeholder="文档地址（可选）"
                value={projectForm.docsUrl}
                onChange={(e) => setProjectForm({ ...projectForm, docsUrl: e.target.value })}
                style={{ marginBottom: '0.5rem' }}
              />
              <Input
                type="text"
                placeholder="NPM 包名（可选）"
                value={projectForm.npmPackage}
                onChange={(e) => setProjectForm({ ...projectForm, npmPackage: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>展示设置</Label>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Switch
                    checked={projectForm.isFeatured}
                    onChange={(checked) => setProjectForm({ ...projectForm, isFeatured: checked })}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>精选项目</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Switch
                    checked={projectForm.isOpenSource}
                    onChange={(checked) => setProjectForm({ ...projectForm, isOpenSource: checked })}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>开源项目</span>
                </div>
              </div>
            </FormGroup>
          </Modal>

          <GithubSyncModal
            isOpen={isSyncModalOpen}
            onClose={() => setIsSyncModalOpen(false)}
            onSyncSuccess={() => {
              setIsSyncModalOpen(false);
              reload();
            }}
          />
        </>
      )}

      {type === 'categories' && (
        <Modal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          title={editingCategory ? '编辑分类' : '添加分类'}
          size="medium"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsCategoryModalOpen(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSaveCategory}>
                保存
              </Button>
            </>
          }
        >
          <FormGroup>
            <Label>分类名称 *</Label>
            <Input
              type="text"
              placeholder="请输入分类名称"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>URL Slug *</Label>
            <Input
              type="text"
              placeholder="请输入URL slug（如：tech、life）"
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>描述</Label>
            <Textarea
              placeholder="请输入分类描述（可选）"
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              size="small"
            />
          </FormGroup>
        </Modal>
      )}

      {type === 'tags' && (
        <Modal
          isOpen={isTagModalOpen}
          onClose={() => setIsTagModalOpen(false)}
          title={editingTag ? '编辑标签' : '添加标签'}
          size="medium"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsTagModalOpen(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSaveTag}>
                保存
              </Button>
            </>
          }
        >
          <FormGroup>
            <Label>标签名称 *</Label>
            <Input
              type="text"
              placeholder="请输入标签名称"
              value={tagForm.name}
              onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>URL Slug *</Label>
            <Input
              type="text"
              placeholder="请输入URL slug（如：react、vue）"
              value={tagForm.slug}
              onChange={(e) => setTagForm({ ...tagForm, slug: e.target.value })}
            />
          </FormGroup>

          <FormGroup>
            <Label>标签颜色</Label>
            <ColorPicker value={tagForm.color} onChange={(color) => setTagForm({ ...tagForm, color })} />
          </FormGroup>

          <FormGroup>
            <Label>描述</Label>
            <Textarea
              placeholder="请输入标签描述（可选）"
              value={tagForm.description}
              onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
              size="small"
            />
          </FormGroup>
        </Modal>
      )}
    </>
  );
};

export default CommonPage;
