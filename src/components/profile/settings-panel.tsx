import React, { useState } from 'react';
import styled from '@emotion/styled';
import { FiSettings, FiMoon, FiSun, FiGlobe, FiBell, FiMail, FiShield, FiTrash2 } from 'react-icons/fi';
import { Button } from '@/components/ui';
import { toast } from '@/ui';
import { API, UserProfile } from '@/utils/api';
import ChangePasswordModal from './change-password-modal';

// 自定义Switch组件
const Switch = styled.label<{ checked: boolean; disabled?: boolean }>`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({ checked }) => (checked ? 'var(--accent-color)' : 'var(--border-color)')};
    transition: 0.2s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.2s;
      border-radius: 50%;
      transform: ${({ checked }) => (checked ? 'translateX(20px)' : 'translateX(0)')};
    }
  }

  &:hover .slider {
    background-color: ${({ checked }) => (checked ? 'var(--accent-color-hover)' : 'var(--bg-tertiary)')};
  }
`;

const SettingsContainer = styled.div`
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  padding: 2rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SettingsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
`;

const SettingsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const SettingsSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.div`
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.4;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ThemeButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ active }) => (active ? 'var(--accent-color)' : 'var(--border-color)')};
  border-radius: 0.375rem;
  background: ${({ active }) => (active ? 'var(--accent-color-alpha)' : 'transparent')};
  color: ${({ active }) => (active ? 'var(--accent-color)' : 'var(--text-secondary)')};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    border-color: var(--accent-color);
    background: var(--accent-color-alpha);
  }
`;

const LanguageSelector = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    border-color: var(--accent-color);
  }

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 3px var(--accent-color-alpha);
  }
`;

const DangerZone = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger-color, #ef4444);
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const DangerZoneTitle = styled.h3`
  color: var(--danger-color, #ef4444);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DangerZoneDescription = styled.p`
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const DangerButton = styled(Button)`
  background: var(--danger-color, #ef4444);
  border-color: var(--danger-color, #ef4444);
  color: white;

  &:hover {
    background: var(--danger-color-hover, #dc2626);
    border-color: var(--danger-color-hover, #dc2626);
  }
`;

interface SettingsPanelProps {
  user: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ user, onUpdateProfile }) => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState(
    user.preferences || {
      theme: 'auto' as const,
      language: 'zh-CN' as const,
      emailNotifications: true,
      pushNotifications: false,
    },
  );

  const handlePreferenceChange = async (key: keyof typeof preferences, value: any) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    setIsLoading(true);
    try {
      const response = await API.user.updatePreferences(newPreferences);
      onUpdateProfile(response.data);
      toast.success('设置已保存');
    } catch (error: any) {
      toast.error(error.message || '保存失败，请重试');
      // 恢复原设置
      setPreferences(preferences);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    handlePreferenceChange('theme', theme);

    // 立即应用主题
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  };

  const handleLanguageChange = (language: string) => {
    handlePreferenceChange('language', language as 'zh-CN' | 'en-US');
    // 这里可以添加语言切换逻辑
    toast.info('语言设置将在下次刷新后生效');
  };

  const handleNotificationChange = (type: 'email' | 'push', enabled: boolean) => {
    if (type === 'email') {
      handlePreferenceChange('emailNotifications', enabled);
    } else {
      handlePreferenceChange('pushNotifications', enabled);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const response = await API.user.exportData();
      // 创建下载链接
      const link = document.createElement('a');
      link.href = response.data.downloadUrl;
      link.download = `user-data-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('数据导出已开始');
    } catch (error: any) {
      toast.error(error.message || '导出失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const password = prompt('请输入您的密码以确认删除账户：');
    if (!password) return;

    if (confirm('删除账户后，所有数据将无法恢复。确定要继续吗？')) {
      setIsLoading(true);
      try {
        await API.user.deleteAccount(password);
        toast.success('账户已删除');
        // 跳转到首页或登录页
        window.location.href = '/';
      } catch (error: any) {
        toast.error(error.message || '删除失败，请重试');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <SettingsContainer>
        <SettingsHeader>
          <FiSettings size={24} color="var(--accent-color)" />
          <SettingsTitle>账户设置</SettingsTitle>
        </SettingsHeader>

        {/* 外观设置 */}
        <SettingsSection>
          <SectionTitle>
            <FiSun size={20} />
            外观设置
          </SectionTitle>
          <SectionDescription>自定义您的界面外观和显示偏好</SectionDescription>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>主题模式</SettingLabel>
              <SettingDescription>选择您喜欢的界面主题</SettingDescription>
            </SettingInfo>
            <SettingControl>
              <ThemeSelector>
                <ThemeButton active={preferences.theme === 'light'} onClick={() => handleThemeChange('light')}>
                  <FiSun size={16} />
                  浅色
                </ThemeButton>
                <ThemeButton active={preferences.theme === 'dark'} onClick={() => handleThemeChange('dark')}>
                  <FiMoon size={16} />
                  深色
                </ThemeButton>
                <ThemeButton active={preferences.theme === 'auto'} onClick={() => handleThemeChange('auto')}>
                  <FiGlobe size={16} />
                  跟随系统
                </ThemeButton>
              </ThemeSelector>
            </SettingControl>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>语言</SettingLabel>
              <SettingDescription>选择您偏好的语言</SettingDescription>
            </SettingInfo>
            <SettingControl>
              <LanguageSelector value={preferences.language} onChange={(e) => handleLanguageChange(e.target.value)}>
                <option value="zh-CN">简体中文</option>
                <option value="en-US">English</option>
              </LanguageSelector>
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        {/* 通知设置 */}
        <SettingsSection>
          <SectionTitle>
            <FiBell size={20} />
            通知设置
          </SectionTitle>
          <SectionDescription>管理您接收通知的方式和频率</SectionDescription>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>邮件通知</SettingLabel>
              <SettingDescription>接收重要事件的邮件通知</SettingDescription>
            </SettingInfo>
            <SettingControl>
              <Switch checked={preferences.emailNotifications || false} disabled={isLoading}>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications || false}
                  onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  disabled={isLoading}
                />
                <span className="slider" />
              </Switch>
            </SettingControl>
          </SettingItem>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>推送通知</SettingLabel>
              <SettingDescription>接收浏览器推送通知</SettingDescription>
            </SettingInfo>
            <SettingControl>
              <Switch checked={preferences.pushNotifications || false} disabled={isLoading}>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications || false}
                  onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  disabled={isLoading}
                />
                <span className="slider" />
              </Switch>
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        {/* 安全设置 */}
        <SettingsSection>
          <SectionTitle>
            <FiShield size={20} />
            安全设置
          </SectionTitle>
          <SectionDescription>管理您的账户安全设置</SectionDescription>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>修改密码</SettingLabel>
              <SettingDescription>定期更新密码以保护账户安全</SettingDescription>
            </SettingInfo>
            <SettingControl>
              <Button variant="outline" onClick={() => setIsChangePasswordOpen(true)}>
                修改密码
              </Button>
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        {/* 数据管理 */}
        <SettingsSection>
          <SectionTitle>
            <FiMail size={20} />
            数据管理
          </SectionTitle>
          <SectionDescription>管理您的个人数据和账户信息</SectionDescription>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>导出数据</SettingLabel>
              <SettingDescription>下载您的所有个人数据</SettingDescription>
            </SettingInfo>
            <SettingControl>
              <Button variant="outline" onClick={handleExportData} isLoading={isLoading}>
                导出数据
              </Button>
            </SettingControl>
          </SettingItem>
        </SettingsSection>

        {/* 危险区域 */}
        <DangerZone>
          <DangerZoneTitle>
            <FiTrash2 size={20} />
            危险操作
          </DangerZoneTitle>
          <DangerZoneDescription>这些操作不可逆，请谨慎操作</DangerZoneDescription>

          <SettingItem>
            <SettingInfo>
              <SettingLabel>删除账户</SettingLabel>
              <SettingDescription>永久删除您的账户和所有相关数据</SettingDescription>
            </SettingInfo>
            <SettingControl>
              <DangerButton onClick={handleDeleteAccount} isLoading={isLoading}>
                删除账户
              </DangerButton>
            </SettingControl>
          </SettingItem>
        </DangerZone>
      </SettingsContainer>

      {/* 修改密码模态框 */}
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setIsChangePasswordOpen(false)} />
    </>
  );
};

export default SettingsPanel;
