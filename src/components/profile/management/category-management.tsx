import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiFolder, FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
import { API } from '@/utils/api';
import type { Category } from '@/types';
import { Modal, Button, Input, Textarea, Empty, Pagination } from 'adnaan-ui';
import { formatDate } from '@/utils';
import ManagementLayout from '../common/management-layout';
import type { PaginatedApiResponse } from '@/types';
import { useModalScrollLock } from '@/hooks';

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const Card = styled(motion.div)`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--accent-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(var(--accent-rgb, 59, 130, 246), 0.1),
    rgba(var(--accent-rgb, 59, 130, 246), 0.2)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  font-size: 1.5rem;
`;

const CardInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CategoryName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CategorySlug = styled.p`
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
  font-size: 0.875rem;
  color: var(--text-secondary);

  svg {
    color: var(--accent-color);
  }
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
  width: 32px;
  height: 32px;
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

const PaginationWrapper = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
`;

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setlimit] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // 滚动锁定管理
  useModalScrollLock(isEditModalOpen);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.category.getCategories({
        page,
        limit: limit,
        search,
      });

      setCategories(response.data || []);
      setTotalItems(response.meta?.pagination?.total || 0);
      setTotalPages(response.meta?.pagination?.totalPages || 0);
    } catch (error: any) {
      adnaan.toast.error(error.message || '获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '' });
    setIsEditModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await adnaan.modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分类吗？此操作无法撤销。',
      confirmText: '删除',
      confirmVariant: 'danger',
    });

    if (confirmed) {
      try {
        await API.category.deleteCategory(id);
        adnaan.toast.success('删除成功');
        fetchCategories();
      } catch (error: any) {
        adnaan.toast.error(error.message || '删除失败');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingCategory) {
        await API.category.updateCategory(editingCategory.id, formData);
        adnaan.toast.success('更新成功');
      } else {
        await API.category.createCategory(formData);
        adnaan.toast.success('创建成功');
      }
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      adnaan.toast.error(error.message || '操作失败');
    }
  };

  return (
    <>
      <ManagementLayout
        title="分类管理"
        icon={<FiFolder />}
        searchPlaceholder="搜索分类名称..."
        searchValue={search}
        onSearchChange={setSearch}
        onAdd={handleAdd}
        onRefresh={fetchCategories}
        loading={loading}
        total={categories.length}
        emptyTitle="暂无分类"
        emptyDescription="点击右上角的添加按钮创建第一个分类"
      >
        {categories.length > 0 && (
          <>
            <CategoryGrid>
              {categories.map((category) => (
                <Card key={category.id} whileHover={{ y: -4 }} onClick={() => handleEdit(category)}>
                  <CardHeader>
                    <IconWrapper>
                      <FiFolder />
                    </IconWrapper>
                    <CardInfo>
                      <CategoryName>{category.name}</CategoryName>
                      <CategorySlug>/{category.slug}</CategorySlug>
                    </CardInfo>
                  </CardHeader>

                  {category.description && <Description>{category.description}</Description>}

                  <CardFooter>
                    <ArticleCount>
                      <FiFileText size={16} />
                      <span>{category.articleCount || 0} 篇文章</span>
                    </ArticleCount>

                    <Actions onClick={(e) => e.stopPropagation()}>
                      <IconButton onClick={() => handleEdit(category)}>
                        <FiEdit2 size={16} />
                      </IconButton>
                      <IconButton className="danger" onClick={() => handleDelete(category.id)}>
                        <FiTrash2 size={16} />
                      </IconButton>
                    </Actions>
                  </CardFooter>
                </Card>
              ))}
            </CategoryGrid>

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
        title={editingCategory ? '编辑分类' : '添加分类'}
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
          <Label>分类名称 *</Label>
          <Input
            type="text"
            placeholder="请输入分类名称"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>URL Slug *</Label>
          <Input
            type="text"
            placeholder="请输入URL slug（如：tech、life）"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>描述</Label>
          <Textarea
            placeholder="请输入分类描述（可选）"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />
        </FormGroup>
      </Modal>
    </>
  );
};

export default CategoryManagement;
