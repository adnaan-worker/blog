import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiDownload, FiTrash2, FiAlertTriangle, FiShield } from 'react-icons/fi';
import { Button, Input } from 'adnaan-ui';
import { API } from '@/utils/api';
import { storage } from '@/utils';

// 样式组件 - 适配玻璃拟态风格
const Container = styled.div`
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const Header = styled.div`
  padding: 0 0 1.5rem 0;
  border-bottom: 1px solid rgba(var(--border-rgb), 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.02em;

  svg {
    color: var(--accent-color);
    filter: drop-shadow(0 0 5px rgba(var(--accent-rgb), 0.4));
  }
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1.5rem;
  background: rgba(var(--bg-tertiary-rgb), 0.2);
  border-radius: 20px;
  border: 1px solid rgba(var(--border-rgb), 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(var(--bg-tertiary-rgb), 0.3);
    border-color: rgba(var(--border-rgb), 0.2);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SectionIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.2) 0%, rgba(var(--accent-rgb), 0.05) 100%);
  color: var(--accent-color);
  box-shadow: 0 4px 12px rgba(var(--accent-rgb), 0.15);
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const WarningBox = styled.div`
  padding: 1rem;
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #f57c00;

  svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
`;

const DangerBox = styled(WarningBox)`
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
  color: var(--error-color);
`;

// 组件接口
interface SecuritySettingsProps {
  className?: string;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ className }) => {
  const navigate = useNavigate();
  const userInfo = storage.local.get<any>('userInfo');
  const username = userInfo?.username || userInfo?.email || '';

  // 修改密码状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // 删除账户状态
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 导出数据状态
  const [isExporting, setIsExporting] = useState(false);

  // 修改密码
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      adnaan.toast.error('请填写所有密码字段');
      return;
    }

    if (newPassword !== confirmPassword) {
      adnaan.toast.error('新密码与确认密码不一致');
      return;
    }

    if (newPassword.length < 8) {
      adnaan.toast.error('新密码至少需要8个字符');
      return;
    }

    if (newPassword === currentPassword) {
      adnaan.toast.error('新密码不能与当前密码相同');
      return;
    }

    try {
      setIsChangingPassword(true);
      await API.user.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      adnaan.toast.success('密码修改成功，请重新登录');

      // 清空输入
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // 3秒后跳转到登录页
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      adnaan.toast.error(error.message || '密码修改失败');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // 导出数据
  const handleExportData = async () => {
    const confirmed = await adnaan.confirm.confirm(
      '导出数据',
      '确定要导出您的所有数据吗？\n导出的数据将包含您的文章、手记、评论等所有内容。',
    );

    if (!confirmed) return;

    try {
      setIsExporting(true);
      const response = await API.user.exportData();

      // 下载数据文件
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      adnaan.toast.success('数据导出成功');
    } catch (error: any) {
      adnaan.toast.error(error.message || '数据导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  // 删除账户
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      adnaan.toast.error('请输入密码确认删除');
      return;
    }

    const confirmed = await adnaan.confirm.delete(
      '确定要永久删除您的账户吗？\n\n此操作不可撤销，您的所有数据将被永久删除！',
      '⚠️ 危险操作',
    );

    if (!confirmed) return;

    // 二次确认
    const doubleConfirmed = await adnaan.confirm.delete('真的要删除账户吗？\n\n删除后将无法恢复！', '最后确认');

    if (!doubleConfirmed) return;

    try {
      setIsDeleting(true);
      await API.user.deleteAccount({ password: deletePassword });

      adnaan.toast.success('账户已删除');

      // 跳转到首页
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      adnaan.toast.error(error.message || '账户删除失败');
      setDeletePassword('');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Container className={className}>
      <Header>
        <Title>
          <FiShield size={20} />
          账户安全设置
        </Title>
      </Header>

      <Content>
        {/* 修改密码 */}
        <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <SectionHeader>
            <SectionIcon>
              <FiLock />
            </SectionIcon>
            <div>
              <SectionTitle>修改密码</SectionTitle>
              <SectionDescription>定期更换密码可以保护您的账户安全</SectionDescription>
            </div>
          </SectionHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleChangePassword();
            }}
          >
            <input
              type="text"
              name="username"
              value={username}
              autoComplete="username"
              readOnly
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
              tabIndex={-1}
              aria-hidden="true"
            />
            <FormGroup>
              <Label>当前密码</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="请输入当前密码"
                autoComplete="current-password"
              />
            </FormGroup>

            <FormGroup>
              <Label>新密码</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码（至少8个字符）"
                autoComplete="new-password"
              />
            </FormGroup>

            <FormGroup>
              <Label>确认新密码</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                autoComplete="new-password"
              />
            </FormGroup>

            <ButtonGroup>
              <Button type="submit" variant="primary" isLoading={isChangingPassword} leftIcon={<FiLock size={16} />}>
                修改密码
              </Button>
            </ButtonGroup>
          </form>
        </Section>

        {/* 数据导出 */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <SectionHeader>
            <SectionIcon>
              <FiDownload />
            </SectionIcon>
            <div>
              <SectionTitle>导出数据</SectionTitle>
              <SectionDescription>下载您的所有数据副本（JSON格式）</SectionDescription>
            </div>
          </SectionHeader>

          <WarningBox>
            <FiAlertTriangle size={18} />
            <div>导出的数据包含您的个人信息、文章、手记、评论等内容。 请妥善保管导出的数据文件，避免泄露。</div>
          </WarningBox>

          <ButtonGroup>
            <Button variant="secondary" onClick={handleExportData} isLoading={isExporting}>
              <FiDownload size={16} />
              导出我的数据
            </Button>
          </ButtonGroup>
        </Section>

        {/* 删除账户 */}
        <Section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SectionHeader>
            <SectionIcon style={{ color: 'var(--error-color)', background: 'rgba(244, 67, 54, 0.1)' }}>
              <FiTrash2 />
            </SectionIcon>
            <div>
              <SectionTitle style={{ color: 'var(--error-color)' }}>删除账户</SectionTitle>
              <SectionDescription>永久删除您的账户和所有数据</SectionDescription>
            </div>
          </SectionHeader>

          <DangerBox>
            <FiAlertTriangle size={18} />
            <div>
              <strong>警告：此操作不可撤销！</strong>
              <br />
              删除账户后，您的所有文章、手记、评论、收藏等数据将被永久删除，且无法恢复。 建议在删除前先导出数据备份。
            </div>
          </DangerBox>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDeleteAccount();
            }}
          >
            <input
              type="text"
              name="username"
              value={username}
              autoComplete="username"
              readOnly
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
              tabIndex={-1}
              aria-hidden="true"
            />
            <FormGroup>
              <Label style={{ color: 'var(--error-color)' }}>输入密码确认删除</Label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="请输入您的密码"
                autoComplete="current-password"
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                type="submit"
                variant="danger"
                isLoading={isDeleting}
                disabled={!deletePassword}
                leftIcon={<FiTrash2 size={16} />}
              >
                永久删除账户
              </Button>
            </ButtonGroup>
          </form>
        </Section>
      </Content>
    </Container>
  );
};

export default SecuritySettings;
