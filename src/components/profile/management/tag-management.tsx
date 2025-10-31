import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiTag, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { API } from '@/utils/api';
import type { Tag } from '@/types';
import { Modal, Button, Input, Textarea, Pagination } from 'adnaan-ui';
import ManagementLayout from '../common/management-layout';

const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const Card = styled(motion.div)<{ color?: string }>`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) => props.color || 'var(--accent-color)'};
  }

  &:hover {
    border-color: ${(props) => props.color || 'var(--accent-color)'};
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

const TagIcon = styled.div<{ color?: string }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${(props) => props.color || 'var(--accent-color)'}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.color || 'var(--accent-color)'};
`;

const TagName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TagSlug = styled.p`
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: 0 0 0.75rem 0;
  font-family: 'Consolas', 'Monaco', monospace;
`;

const Description = styled.p`
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
`;

const ArticleCount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--text-secondary);
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
    border-color: var(--accent-color);
    color: var(--accent-color);
  }

  &.danger:hover {
    border-color: rgb(239, 68, 68);
    color: rgb(239, 68, 68);
  }
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

const ColorPicker = styled.input`
  width: 100%;
  height: 42px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  padding: 4px;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 6px;
  }
`;

const PaginationWrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`;

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setlimit] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    color: '#3B82F6',
    description: '',
  });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await API.tag.getTags({
        page,
        limit: limit,
        search,
      });

      setTags(response.data || []);
      setTotalItems(response.meta?.pagination?.total || 0);
      setTotalPages(response.meta?.pagination?.totalPages || 0);
    } catch (error: any) {
      adnaan.toast.error(error.message || '获取标签列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [page, search]);

  const handleAdd = () => {
    setEditingTag(null);
    setFormData({ name: '', slug: '', color: '#3B82F6', description: '' });
    setIsEditModalOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || '#3B82F6',
      description: tag.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await adnaan.modal.confirm({
      title: '确认删除',
      content: '确定要删除这个标签吗？此操作无法撤销。',
      confirmText: '删除',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      try {
        await API.tag.deleteTag(id);
        adnaan.toast.success('删除成功');
        fetchTags();
      } catch (error: any) {
        adnaan.toast.error(error.message || '删除失败');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingTag) {
        await API.tag.updateTag(editingTag.id, formData);
        adnaan.toast.success('更新成功');
      } else {
        await API.tag.createTag(formData);
        adnaan.toast.success('创建成功');
      }
      setIsEditModalOpen(false);
      fetchTags();
    } catch (error: any) {
      adnaan.toast.error(error.message || '操作失败');
    }
  };

  return (
    <>
      <ManagementLayout
        title="标签管理"
        icon={<FiTag />}
        searchPlaceholder="搜索标签名称..."
        searchValue={search}
        onSearchChange={setSearch}
        onAdd={handleAdd}
        onRefresh={fetchTags}
        loading={loading}
        total={tags.length}
        emptyTitle="暂无标签"
        emptyDescription="点击右上角的添加按钮创建第一个标签"
      >
        {tags.length > 0 && (
          <>
            <TagGrid>
              {tags.map((tag) => (
                <Card key={tag.id} color={tag.color} whileHover={{ y: -4 }} onClick={() => handleEdit(tag)}>
                  <CardHeader>
                    <TagIcon color={tag.color}>
                      <FiTag size={18} />
                    </TagIcon>
                    <TagName>{tag.name}</TagName>
                  </CardHeader>

                  <TagSlug>#{tag.slug}</TagSlug>
                  <Description>{tag.description || '暂无描述'}</Description>

                  <CardFooter>
                    <ArticleCount>
                      <FiFileText size={14} />
                      <span>{tag.articleCount || 0} 篇</span>
                    </ArticleCount>

                    <Actions onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={() => handleEdit(tag)}>
                        <FiEdit2 size={14} />
                      </IconButton>
                      <IconButton className="danger" onClick={() => handleDelete(tag.id)}>
                        <FiTrash2 size={14} />
                      </IconButton>
                    </Actions>
                  </CardFooter>
                </Card>
              ))}
            </TagGrid>

            {totalPages > 1 && (
              <PaginationWrapper>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={limit}
                  totalItems={totalItems}
                  onPageChange={setPage}
                  onPageSizeChange={setlimit}
                />
              </PaginationWrapper>
            )}
          </>
        )}
      </ManagementLayout>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingTag ? '编辑标签' : '添加标签'}
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              取消
            </Button>
            <Button variant="primary" onClick={handleSave}>
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
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>URL Slug *</Label>
          <Input
            type="text"
            placeholder="请输入URL slug（如：react、vue）"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>标签颜色</Label>
          <ColorPicker
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>描述</Label>
          <Textarea
            placeholder="请输入标签描述（可选）"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </FormGroup>
      </Modal>
    </>
  );
};

export default TagManagement;
