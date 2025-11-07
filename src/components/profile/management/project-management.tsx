import React, { useState, useMemo, useCallback } from 'react';
import styled from '@emotion/styled';
import { AnimatePresence } from 'framer-motion';
import { FiPlus, FiCode, FiDownload, FiEye, FiStar } from 'react-icons/fi';
import { Button, Modal, Input, Textarea, RadioGroup, InfiniteScroll, Switch, ColorPicker, DatePicker } from 'adnaan-ui';
import type { RadioOption } from 'adnaan-ui';
import { API } from '@/utils/api';
import type { Project, ProjectParams } from '@/types';
import { ManagementLayout, type StatItemData, type FilterOption } from '../common/management-layout';
import RichTextEditor from '@/components/rich-text/rich-text-editor';
import GitHubSyncModal from './github-sync-modal';
import { useModalScrollLock } from '@/hooks';
import {
  ItemCard,
  ItemHeader,
  ItemTitle,
  ItemActions,
  ActionButton,
  ItemContent,
  ItemMeta,
  MetaItem,
  StatusBadge,
  TagsContainer,
  Tag,
  EmptyState,
  getMetaIcon,
  getActionIcon,
} from '../common/item-card';
import { useManagementPage } from '../common/management-hooks';

// 组件接口
interface ProjectManagementProps {
  className?: string;
}

// 统计数据接口
interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  developingProjects: number;
  totalStars: number;
  totalForks: number;
  totalViews: number;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ className }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // 滚动锁定管理
  useModalScrollLock(showEditModal || showSyncModal);

  // 使用通用管理页面Hook
  const {
    items: projects,
    isLoading,
    hasMore,
    error,
    loadMore,
    reload,
    search,
    filter,
  } = useManagementPage<Project>({
    fetchFunction: async (params: ProjectParams) => {
      const response = await API.project.getProjects(params);
      return {
        success: response.success,
        code: response.code,
        message: response.message,
        data: response.data,
        meta: {
          pagination: response.meta.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
          timestamp: response.meta.timestamp,
        },
      };
    },
    initialParams: {
      keyword: '',
      status: undefined,
      language: undefined,
    },
    limit: 10,
  });

  // 使用 useMemo 计算统计数据，避免不必要的重渲染
  const stats = useMemo<ProjectStats>(() => {
    return {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === 'active').length,
      developingProjects: projects.filter((p) => p.status === 'developing').length,
      totalStars: projects.reduce((sum, p) => sum + (p.stars || 0), 0),
      totalForks: projects.reduce((sum, p) => sum + (p.forks || 0), 0),
      totalViews: projects.reduce((sum, p) => sum + (p.viewCount || 0), 0),
    };
  }, [projects]);

  // 创建项目
  const handleCreate = () => {
    setEditingProject(null);
    setShowEditModal(true);
  };

  // 编辑项目
  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  // 删除项目
  const handleDelete = async (project: Project) => {
    const confirmed = await adnaan.modal.confirm({
      title: '确认删除',
      message: `确定要删除项目"${project.title}"吗？此操作不可恢复。`,
    });

    if (confirmed) {
      try {
        await API.project.deleteProject(project.id);
        adnaan.toast.success('删除成功');
        reload();
      } catch (error) {
        console.error('删除失败:', error);
        adnaan.toast.error('删除失败');
      }
    }
  };

  // 保存项目
  const handleSave = async (data: Partial<Project>) => {
    try {
      if (editingProject) {
        await API.project.updateProject(editingProject.id, data);
        adnaan.toast.success('更新成功');
      } else {
        await API.project.createProject(data);
        adnaan.toast.success('创建成功');
      }
      setShowEditModal(false);
      reload();
    } catch (error) {
      console.error('保存失败:', error);
      adnaan.toast.error('保存失败');
    }
  };

  // 统计数据
  const statItems: StatItemData[] = [
    {
      label: '个',
      value: stats.totalProjects,
      icon: <FiCode size={12} />,
    },
    {
      label: '个',
      value: stats.totalStars,
      icon: <FiStar size={12} />,
    },
    {
      label: '次',
      value: stats.totalViews,
      icon: <FiEye size={12} />,
    },
  ];

  // 筛选选项
  const statusOptions: FilterOption[] = [
    { key: '', label: '全部状态' },
    { key: 'active', label: '活跃' },
    { key: 'developing', label: '开发中' },
    { key: 'paused', label: '暂停' },
    { key: 'archived', label: '已归档' },
  ];

  const statusTextMap: Record<string, string> = {
    active: '活跃',
    developing: '开发中',
    paused: '暂停',
    archived: '已归档',
  };

  const statusColorMap: Record<string, string> = {
    active: '#10b981',
    developing: '#3b82f6',
    paused: '#f59e0b',
    archived: '#6b7280',
  };

  return (
    <ManagementLayout
      title="项目管理"
      icon={<FiCode />}
      stats={statItems}
      searchPlaceholder="搜索项目标题、描述..."
      searchValue={search.searchQuery}
      onSearchChange={search.setSearchQuery}
      onAdd={handleCreate}
      onRefresh={reload}
      loading={isLoading}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      filterOptions={statusOptions}
      selectedFilter={filter.selectedFilter}
      onFilterChange={filter.handleFilterChange}
      showCard={true}
      createButton={
        <>
          <Button variant="secondary" size="small" onClick={() => setShowSyncModal(true)}>
            <FiDownload size={14} />
            <span style={{ marginLeft: '0.5rem' }}>同步项目</span>
          </Button>
          <Button variant="primary" size="small" onClick={handleCreate}>
            <FiPlus size={14} />
            <span style={{ marginLeft: '0.5rem' }}>新建项目</span>
          </Button>
        </>
      }
    >
      <InfiniteScroll
        hasMore={hasMore}
        loading={isLoading}
        error={error}
        onLoadMore={loadMore}
        onRetry={reload}
        itemCount={projects.length}
        maxHeight="calc(100vh - 400px)"
        showScrollToTop={true}
      >
        {!isLoading && projects.length === 0 ? (
          <EmptyState>
            <FiCode size={48} />
            <p>暂无项目</p>
            <Button variant="primary" size="small" onClick={handleCreate} style={{ marginTop: '1rem' }}>
              <FiPlus size={14} style={{ marginRight: '0.5rem' }} />
              新建项目
            </Button>
          </EmptyState>
        ) : (
          <AnimatePresence>
            {projects.map((project, index) => (
              <ItemCard
                key={project.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.3, delay: index * 0.05 },
                  },
                }}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
              >
                <ItemHeader>
                  <ItemTitle>{project.title}</ItemTitle>
                  <ItemActions>
                    <ActionButton onClick={() => handleEdit(project)} title="编辑">
                      {getActionIcon('edit')}
                    </ActionButton>
                    <ActionButton onClick={() => handleDelete(project)} title="删除">
                      {getActionIcon('delete')}
                    </ActionButton>
                  </ItemActions>
                </ItemHeader>

                {project.description && (
                  <ItemContent>
                    <p>{project.description}</p>
                  </ItemContent>
                )}

                <ItemMeta>
                  <MetaItem>
                    <StatusBadge color={statusColorMap[project.status] || '#6b7280'}>
                      {statusTextMap[project.status] || project.status}
                    </StatusBadge>
                  </MetaItem>

                  {project.language && (
                    <MetaItem>
                      {getMetaIcon('code')}
                      {project.language}
                    </MetaItem>
                  )}

                  {project.stars > 0 && (
                    <MetaItem>
                      {getMetaIcon('star')}
                      {project.stars}
                    </MetaItem>
                  )}

                  {project.forks > 0 && (
                    <MetaItem>
                      {getMetaIcon('fork')}
                      {project.forks}
                    </MetaItem>
                  )}

                  {(project.watchers ?? 0) > 0 && (
                    <MetaItem>
                      {getMetaIcon('view')}
                      {project.watchers}
                    </MetaItem>
                  )}

                  {(project.issues ?? 0) > 0 && (
                    <MetaItem>
                      {getMetaIcon('alert')}
                      {project.issues}
                    </MetaItem>
                  )}

                  {(project.downloads ?? 0) > 0 && (
                    <MetaItem>
                      {getMetaIcon('download')}
                      {project.downloads}
                    </MetaItem>
                  )}

                  {project.viewCount > 0 && (
                    <MetaItem>
                      {getMetaIcon('view')}
                      {project.viewCount}
                    </MetaItem>
                  )}

                  {project.startedAt && (
                    <MetaItem>
                      {getMetaIcon('date')}
                      {new Date(project.startedAt).toLocaleDateString('zh-CN')}
                    </MetaItem>
                  )}
                </ItemMeta>

                {project.tags && project.tags.length > 0 && (
                  <TagsContainer>
                    {project.tags.map((tag, idx) => (
                      <Tag key={idx}>{tag}</Tag>
                    ))}
                  </TagsContainer>
                )}
              </ItemCard>
            ))}
          </AnimatePresence>
        )}
      </InfiniteScroll>

      {/* 编辑/新建项目模态框 */}
      {showEditModal && (
        <ProjectEditModal project={editingProject} onClose={() => setShowEditModal(false)} onSave={handleSave} />
      )}

      {/* GitHub 同步模态框 */}
      <GitHubSyncModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} onSyncSuccess={reload} />
    </ManagementLayout>
  );
};

// 项目编辑模态框组件
interface ProjectEditModalProps {
  project: Project | null;
  onClose: () => void;
  onSave: (data: Partial<Project>) => void;
}

const ProjectEditModal: React.FC<ProjectEditModalProps> = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: project?.title || '',
    slug: project?.slug || '',
    description: project?.description || '',
    content: project?.content || '',
    coverImage: project?.coverImage || '',
    icon: project?.icon || '',
    githubUrl: project?.githubUrl || '',
    giteeUrl: project?.giteeUrl || '',
    demoUrl: project?.demoUrl || '',
    docsUrl: project?.docsUrl || '',
    npmPackage: project?.npmPackage || '',
    language: project?.language || '',
    languageColor: project?.languageColor || '',
    status: project?.status || 'developing',
    visibility: project?.visibility || 'public',
    tags: project?.tags || [],
    techStack: project?.techStack || [],
    features: project?.features || [],
    isOpenSource: project?.isOpenSource ?? true,
    isFeatured: project?.isFeatured ?? false,
    displayOrder: project?.displayOrder || 0,
    stars: project?.stars || 0,
    forks: project?.forks || 0,
    watchers: project?.watchers || 0,
    issues: project?.issues || 0,
    downloads: project?.downloads || 0,
    startedAt: project?.startedAt || '',
    lastUpdatedAt: project?.lastUpdatedAt || '',
  });

  // 使用 useCallback 优化 onChange 函数，避免不必要的重渲染
  const handleContentChange = useCallback((content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  }, []);

  const handleSubmit = () => {
    if (!formData.title?.trim()) {
      adnaan.toast.error('请输入项目标题');
      return;
    }
    if (!formData.slug?.trim()) {
      adnaan.toast.error('请输入项目别名');
      return;
    }
    onSave(formData);
  };

  // 状态选项
  const statusOptions: RadioOption[] = [
    { label: '活跃', value: 'active' },
    { label: '开发中', value: 'developing' },
    { label: '暂停', value: 'paused' },
    { label: '已归档', value: 'archived' },
  ];

  // 可见性选项
  const visibilityOptions: RadioOption[] = [
    { label: '公开', value: 'public' },
    { label: '私密', value: 'private' },
  ];

  return (
    <Modal
      isOpen={true}
      title={project ? '编辑项目' : '新建项目'}
      onClose={onClose}
      size="large"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            保存
          </Button>
        </>
      }
    >
      <FormContainer>
        <FormGroup>
          <Label>项目标题 *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="输入项目标题"
          />
        </FormGroup>

        <FormGroup>
          <Label>项目别名 (URL) *</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="project-slug"
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            用于 SEO 友好的 URL，如：/projects/adnaan-ui
          </div>
        </FormGroup>

        <FormGroup>
          <Label>项目简介</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="简要描述项目"
            size="small"
          />
        </FormGroup>

        <FormGroup>
          <Label>项目详情</Label>
          <RichTextEditor
            content={formData.content || ''}
            onChange={handleContentChange}
            placeholder="输入项目详细介绍..."
            maxHeight="400px"
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>封面图 URL</Label>
            <Input
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              placeholder="https://..."
            />
          </FormGroup>

          <FormGroup>
            <Label>项目图标 URL</Label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="https://..."
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>编程语言</Label>
            <Input
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              placeholder="TypeScript"
            />
          </FormGroup>

          <FormGroup>
            <Label>语言颜色</Label>
            <ColorPicker
              value={formData.languageColor || '#3178c6'}
              onChange={(color: string) => setFormData({ ...formData, languageColor: color })}
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>项目状态</Label>
          <RadioGroup
            options={statusOptions}
            value={formData.status}
            onChange={(value: string | number) => setFormData({ ...formData, status: value as any })}
            direction="horizontal"
          />
        </FormGroup>

        <FormGroup>
          <Label>可见性</Label>
          <RadioGroup
            options={visibilityOptions}
            value={formData.visibility}
            onChange={(value: string | number) => setFormData({ ...formData, visibility: value as any })}
            direction="horizontal"
          />
        </FormGroup>

        <FormGroup>
          <Label>GitHub URL</Label>
          <Input
            value={formData.githubUrl}
            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
            placeholder="https://github.com/username/repo"
          />
        </FormGroup>

        <FormGroup>
          <Label>Gitee URL</Label>
          <Input
            value={formData.giteeUrl}
            onChange={(e) => setFormData({ ...formData, giteeUrl: e.target.value })}
            placeholder="https://gitee.com/username/repo"
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>演示链接</Label>
            <Input
              value={formData.demoUrl}
              onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
              placeholder="https://demo.example.com"
            />
          </FormGroup>

          <FormGroup>
            <Label>文档链接</Label>
            <Input
              value={formData.docsUrl}
              onChange={(e) => setFormData({ ...formData, docsUrl: e.target.value })}
              placeholder="https://docs.example.com"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>NPM 包名</Label>
            <Input
              value={formData.npmPackage}
              onChange={(e) => setFormData({ ...formData, npmPackage: e.target.value })}
              placeholder="package-name"
            />
          </FormGroup>

          <FormGroup>
            <Label>显示排序</Label>
            <Input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
              placeholder="0"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Stars 数量</Label>
            <Input
              type="number"
              value={formData.stars}
              onChange={(e) => setFormData({ ...formData, stars: Number(e.target.value) })}
              placeholder="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Forks 数量</Label>
            <Input
              type="number"
              value={formData.forks}
              onChange={(e) => setFormData({ ...formData, forks: Number(e.target.value) })}
              placeholder="0"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>Watchers 数量</Label>
            <Input
              type="number"
              value={formData.watchers}
              onChange={(e) => setFormData({ ...formData, watchers: Number(e.target.value) })}
              placeholder="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>Issues 数量</Label>
            <Input
              type="number"
              value={formData.issues}
              onChange={(e) => setFormData({ ...formData, issues: Number(e.target.value) })}
              placeholder="0"
            />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label>下载量</Label>
            <Input
              type="number"
              value={formData.downloads}
              onChange={(e) => setFormData({ ...formData, downloads: Number(e.target.value) })}
              placeholder="0"
            />
          </FormGroup>

          <FormGroup>
            <Label>最后更新时间</Label>
            <DatePicker
              value={
                formData.lastUpdatedAt
                  ? formData.lastUpdatedAt.slice(0, 16) // 转换为 datetime-local 格式 YYYY-MM-DDTHH:mm
                  : ''
              }
              onChange={(e) => setFormData({ ...formData, lastUpdatedAt: e.target.value })}
              mode="datetime"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>项目开始日期</Label>
          <DatePicker
            value={formData.startedAt || ''}
            onChange={(e) => setFormData({ ...formData, startedAt: e.target.value })}
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>开源项目</Label>
            <Switch
              checked={formData.isOpenSource ?? true}
              onChange={(checked: boolean) => setFormData({ ...formData, isOpenSource: checked })}
              label="是否为开源项目"
            />
          </FormGroup>

          <FormGroup>
            <Label>精选项目</Label>
            <Switch
              checked={formData.isFeatured ?? false}
              onChange={(checked: boolean) => setFormData({ ...formData, isFeatured: checked })}
              label="是否为精选项目"
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label>标签（用逗号分隔）</Label>
          <Input
            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="React, UI, TypeScript"
          />
        </FormGroup>

        <FormGroup>
          <Label>技术栈（用逗号分隔）</Label>
          <Input
            value={Array.isArray(formData.techStack) ? formData.techStack.join(', ') : ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                techStack: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="React 19, TypeScript, Vite"
          />
        </FormGroup>

        <FormGroup>
          <Label>项目特性（用逗号分隔）</Label>
          <Textarea
            value={Array.isArray(formData.features) ? formData.features.join(', ') : ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                features: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              })
            }
            placeholder="精美设计, TypeScript 支持, 响应式设计"
            size="small"
          />
        </FormGroup>
      </FormContainer>
    </Modal>
  );
};

// 样式组件
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
  padding: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
`;

export default ProjectManagement;
