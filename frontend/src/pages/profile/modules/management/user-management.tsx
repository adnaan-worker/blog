import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiUsers, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { API } from '@/utils/api';
import type { UserProfile } from '@/types';
import { Modal, Button, Input, Select, Empty } from 'adnaan-ui';
import { formatDate } from '@/utils';
import ManagementLayout from '../common/management-layout';
import { useModalScrollLock } from '@/hooks';

const Card = styled(motion.div)`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div<{ src?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${(props) => (props.src ? `url(${props.src})` : 'var(--accent-color)')};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--border-color);
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: var(--text-tertiary);
`;

const DetailValue = styled.span`
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const Badge = styled.span<{ variant?: 'admin' | 'user' | 'active' | 'inactive' | 'banned' }>`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.variant) {
      case 'admin':
        return `
          background: rgba(var(--accent-rgb, 59, 130, 246), 0.1);
          color: var(--accent-color);
        `;
      case 'active':
        return `
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
        `;
      case 'inactive':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: rgb(245, 158, 11);
        `;
      case 'banned':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: rgb(239, 68, 68);
        `;
      default:
        return `
          background: var(--bg-secondary);
          color: var(--text-secondary);
        `;
    }
  }}
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-color);
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

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // 滚动锁定管理
  useModalScrollLock(isEditModalOpen);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    status: 'active' as 'active' | 'inactive' | 'banned',
  });

  const limit = 12;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await API.user.getAllUsers({ page, limit: limit, search });
      setUsers(response.data || []);
      setTotal(response.meta?.pagination?.total || 0);
      setTotalPages(response.meta?.pagination?.totalPages || 0);
    } catch (error: any) {
      adnaan.toast.error(error.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      password: '',
      role: 'user',
      status: 'active',
    });
    setIsEditModalOpen(true);
  };

  const handleEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName || '',
      password: '',
      role: (user.role as 'user' | 'admin') || 'user',
      status: (user.status as 'active' | 'inactive' | 'banned') || 'active',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmed = await adnaan.confirm.delete('确定要删除这个用户吗？删除后将无法恢复。', '确认删除');

    if (confirmed) {
      try {
        await API.user.deleteUser(id);
        adnaan.toast.success('删除成功');
        fetchUsers();
      } catch (error: any) {
        adnaan.toast.error(error.message || '删除失败');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await API.user.updateUser(editingUser.id, formData);
        adnaan.toast.success('更新成功');
      } else {
        await API.user.createUser(formData);
        adnaan.toast.success('创建成功');
      }
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      adnaan.toast.error(error.message || '操作失败');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="active">正常</Badge>;
      case 'inactive':
        return <Badge variant="inactive">禁用</Badge>;
      case 'banned':
        return <Badge variant="banned">封禁</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <ManagementLayout
        title="用户管理"
        icon={<FiUsers />}
        searchPlaceholder="搜索用户名、邮箱..."
        searchValue={search}
        onSearchChange={setSearch}
        onAdd={handleAdd}
        onRefresh={fetchUsers}
        loading={loading}
        total={total}
        emptyTitle="暂无用户"
        emptyDescription='点击右上角的"添加"按钮创建第一个用户'
      >
        {users.length > 0 && (
          <>
            <UserGrid>
              {users.map((user) => (
                <Card key={user.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                  <UserHeader>
                    <Avatar src={user.avatar}>{!user.avatar && user.username.charAt(0).toUpperCase()}</Avatar>
                    <UserInfo>
                      <UserName>
                        {user.fullName || user.username}
                        {user.role === 'admin' && <Badge variant="admin">管理员</Badge>}
                      </UserName>
                      <UserEmail>{user.email}</UserEmail>
                    </UserInfo>
                  </UserHeader>

                  <UserDetails>
                    <DetailItem>
                      <DetailLabel>用户名</DetailLabel>
                      <DetailValue>{user.username}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>状态</DetailLabel>
                      <DetailValue>{getStatusBadge(user.status || 'active')}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>注册时间</DetailLabel>
                      <DetailValue>
                        {(user as any).createdAt ? formatDate((user as any).createdAt, 'YYYY-MM-DD') : '-'}
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>最后登录</DetailLabel>
                      <DetailValue>
                        {(user as any).lastLogin ? formatDate((user as any).lastLogin, 'YYYY-MM-DD') : '从未登录'}
                      </DetailValue>
                    </DetailItem>
                  </UserDetails>

                  <Actions>
                    <Button variant="ghost" size="small" onClick={() => handleEdit(user)} style={{ flex: 1 }}>
                      <FiEdit2 size={16} />
                      编辑
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(Number(user.id))}
                      style={{ flex: 1 }}
                    >
                      <FiTrash2 size={16} />
                      删除
                    </Button>
                  </Actions>
                </Card>
              ))}
            </UserGrid>

            {totalPages > 1 && (
              <Pagination>
                <Button
                  variant={page === 1 ? 'ghost' : 'outline'}
                  size="small"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  上一页
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button key={p} variant={page === p ? 'primary' : 'outline'} size="small" onClick={() => setPage(p)}>
                    {p}
                  </Button>
                ))}
                <Button
                  variant={page === totalPages ? 'ghost' : 'outline'}
                  size="small"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  下一页
                </Button>
              </Pagination>
            )}
          </>
        )}
      </ManagementLayout>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingUser ? '编辑用户' : '添加用户'}
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
          <Label>用户名 *</Label>
          <Input
            type="text"
            placeholder="请输入用户名"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>邮箱 *</Label>
          <Input
            type="email"
            placeholder="请输入邮箱"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <Label>全名</Label>
          <Input
            type="text"
            placeholder="请输入全名"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
        </FormGroup>

        {!editingUser && (
          <FormGroup>
            <Label>密码 *</Label>
            <Input
              type="password"
              placeholder="请输入密码（至少6位）"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </FormGroup>
        )}

        <FormGroup>
          <Label>角色</Label>
          <Select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
          >
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>状态</Label>
          <Select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'banned' })}
          >
            <option value="active">正常</option>
            <option value="inactive">禁用</option>
            <option value="banned">封禁</option>
          </Select>
        </FormGroup>
      </Modal>
    </>
  );
};

export default UserManagement;
