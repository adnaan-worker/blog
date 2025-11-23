/**
 * 通用管理页面组件
 * 统一处理：手记、文章、评论、收藏、点赞、用户、分类、标签等
 */
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Button, Modal, Input, Select, Textarea, ColorPicker } from 'adnaan-ui';
import { FiEdit3, FiTrash2, FiEye, FiHeart, FiCalendar, FiMessageSquare, FiFolder } from 'react-icons/fi';
import { API, formatDate } from '@/utils';
import { RichTextParser } from '@/utils/editor/parser';
import { FadeScrollContainer } from '@/components/common';
import { useVirtualScroll } from '@/hooks/useVirtualScroll';
import { useModalScrollLock } from '@/hooks';
import type { UserProfile, Category, Tag } from '@/types';
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
    fetchFn: (params: any) => API.note.getMyNotes(params),
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
    fetchFn: (params: any) => API.article.getMyArticles(params),
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

export const CommonPage: React.FC<CommonPageProps> = ({ type }) => {
  const navigate = useNavigate();
  const config = PAGE_CONFIG[type];

  // 使用 useRef 来稳定 config 引用，避免不必要的重新创建
  const configRef = React.useRef(config);

  // 追踪是否已经加载过数据
  const [hasLoaded, setHasLoaded] = React.useState(false);

  React.useEffect(() => {
    configRef.current = config;
  }, [config]);

  // API 响应适配器 - 统一不同 API 的返回格式
  // 关键：不依赖 config，使用 configRef
  const fetchData = useCallback(
    async (params: any) => {
      const currentConfig = configRef.current;

      console.log(`[CommonPage ${type}] 🔄 Fetching with params:`, params);

      try {
        const response = await currentConfig.fetchFn(params);

        console.log(`[CommonPage ${type}] ✅ API Response:`, response);

        // 适配不同的 API 返回格式
        let data = response.data;
        let pagination = response.meta?.pagination;

        // 如果 data 是数组，直接使用
        if (Array.isArray(data)) {
          console.log(`[CommonPage ${type}] 📦 Data is array, length:`, data.length);
        }
        // 如果 data 包含 data 属性（嵌套结构）
        else if (data && Array.isArray(data.data)) {
          console.log(`[CommonPage ${type}] 📦 Data is nested, extracting...`);
          pagination = data.pagination || data.meta?.pagination;
          data = data.data;
        }
        // 如果 data 包含 items 属性
        else if (data && Array.isArray(data.items)) {
          console.log(`[CommonPage ${type}] 📦 Data has items property, extracting...`);
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
          console.log(`[CommonPage ${type}] 📄 Generated default pagination:`, pagination);
        } else {
          console.log(`[CommonPage ${type}] 📄 Using API pagination:`, pagination);
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

        console.log(`[CommonPage ${type}] ✨ Final result:`, {
          dataLength: data.length,
          pagination,
          hasMore: params.page < pagination.totalPages,
        });

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

  const { items, isLoading, hasMore, error, loadMore, reload, search, totalItems } = useManagementPage({
    fetchFunction: fetchData,
    initialParams: {},
    limit: 10,
  });

  // 是否支持在当前列表中直接创建新内容
  const supportsCreate =
    type === 'notes' || type === 'articles' || type === 'users' || type === 'categories' || type === 'tags';

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

  // 滚动锁定（任意一个 Modal 打开时锁定）
  useModalScrollLock(isUserModalOpen || isCategoryModalOpen || isTagModalOpen);

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

  // 渲染单个项目（具体内容），外层容器和 key 由虚拟列表容器负责
  const renderItem = (item: any) => {
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
            {(config.getEditUrl || type === 'users' || type === 'categories' || type === 'tags') && (
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
        showFilters={false}
        onToggleFilters={() => {}}
        onAdd={handleAdd}
        createButton={supportsCreate ? undefined : <></>}
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
