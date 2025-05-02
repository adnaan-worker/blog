import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styled from '@emotion/styled';
import { FiUser, FiLock, FiMail, FiBell, FiGlobe, FiCheck, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi';
import { PageContainer } from '@/components/blog/BlogComponents';

// 定义样式组件
const SettingsContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  gap: 2rem;
  padding: 1rem 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  width: 250px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Content = styled.div`
  flex: 1;
`;

const NavCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;
`;

const NavItem = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 1rem 1.25rem;
  background: ${(props) => (props.active ? 'var(--accent-color-alpha)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--text-primary)')};
  border: none;
  text-align: left;
  font-size: 0.95rem;
  font-weight: ${(props) => (props.active ? '600' : '500')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color-alpha)' : 'var(--bg-tertiary)')};
  }

  svg {
    margin-right: 0.75rem;
  }
`;

const SettingsCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
    color: var(--accent-color);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-weight: 500;
`;

const HelpText = styled.p`
  font-size: 0.85rem;
  color: var(--text-tertiary);
  margin-top: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px var(--accent-color-alpha);
  }
`;

const PasswordInput = styled.div`
  position: relative;

  input {
    padding-right: 2.5rem;
  }

  button {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;

    &:hover {
      color: var(--text-primary);
    }
  }
`;

const SwitchContainer = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Switch = styled.div`
  position: relative;
  width: 44px;
  height: 24px;
  background: ${(props) => (props.theme === 'active' ? 'var(--accent-color)' : 'var(--bg-tertiary)')};
  border-radius: 12px;
  margin-right: 0.75rem;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    top: 3px;
    left: ${(props) => (props.theme === 'active' ? '23px' : '3px')};
    transition: all 0.3s ease;
  }
`;

const SwitchLabel = styled.span`
  font-size: 0.95rem;
  color: var(--text-primary);
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${(props) => (props.primary ? 'var(--accent-color)' : 'var(--bg-tertiary)')};
  color: ${(props) => (props.primary ? 'white' : 'var(--text-primary)')};
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.primary ? 'var(--accent-color-dark)' : 'var(--bg-tertiary-dark)')};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--success-color-alpha);
  color: var(--success-color);
  border-radius: 8px;
  margin-bottom: 1.5rem;

  svg {
    margin-right: 0.5rem;
  }
`;

// 分隔线
const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1.5rem 0;
`;

// 页面动画
const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

// 定义设置页面类型
type SettingsPage = '个人资料' | '安全设置' | '通知设置' | '语言与地区';

const Settings: React.FC = () => {
  // 状态管理
  const [activePage, setActivePage] = useState<SettingsPage>('个人资料');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [siteNotifications, setSiteNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // 表单提交处理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 模拟提交
    setTimeout(() => {
      setUpdateSuccess(true);

      // 3秒后隐藏成功消息
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    }, 500);
  };

  // 渲染不同的设置页面
  const renderSettingsContent = () => {
    switch (activePage) {
      case '个人资料':
        return (
          <>
            {updateSuccess && (
              <SuccessMessage>
                <FiCheck size={16} /> 您的个人资料已成功更新
              </SuccessMessage>
            )}

            <SettingsCard>
              <CardTitle>
                <FiUser size={20} /> 个人资料
              </CardTitle>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="username">用户名</Label>
                  <Input type="text" id="username" defaultValue="adnaan" />
                  <HelpText>此用户名将用于您的个人页面地址</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="display_name">显示名称</Label>
                  <Input type="text" id="display_name" defaultValue="Adnaan" />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input type="email" id="email" defaultValue="example@example.com" />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="bio">个人简介</Label>
                  <Input
                    as="textarea"
                    id="bio"
                    defaultValue="全栈开发者，热爱编程和技术分享。"
                    style={{ height: '100px', resize: 'vertical' }}
                  />
                </FormGroup>

                <Divider />

                <FormGroup>
                  <Label htmlFor="website">个人网站</Label>
                  <Input type="url" id="website" defaultValue="https://adnaan.dev" placeholder="https://" />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="location">所在地</Label>
                  <Input type="text" id="location" defaultValue="北京, 中国" />
                </FormGroup>

                <ButtonGroup>
                  <Button>取消</Button>
                  <Button primary type="submit">
                    保存更改
                  </Button>
                </ButtonGroup>
              </form>
            </SettingsCard>
          </>
        );

      case '安全设置':
        return (
          <>
            {updateSuccess && (
              <SuccessMessage>
                <FiCheck size={16} /> 您的安全设置已成功更新
              </SuccessMessage>
            )}

            <SettingsCard>
              <CardTitle>
                <FiLock size={20} /> 修改密码
              </CardTitle>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="current_password">当前密码</Label>
                  <PasswordInput>
                    <Input type={showPassword ? 'text' : 'password'} id="current_password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </PasswordInput>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="new_password">新密码</Label>
                  <PasswordInput>
                    <Input type={showNewPassword ? 'text' : 'password'} id="new_password" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </PasswordInput>
                  <HelpText>密码长度至少为8个字符，包含字母和数字</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="confirm_password">确认新密码</Label>
                  <PasswordInput>
                    <Input type={showNewPassword ? 'text' : 'password'} id="confirm_password" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                      {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </PasswordInput>
                </FormGroup>

                <ButtonGroup>
                  <Button>取消</Button>
                  <Button primary type="submit">
                    更新密码
                  </Button>
                </ButtonGroup>
              </form>
            </SettingsCard>

            <SettingsCard>
              <CardTitle>
                <FiMail size={20} /> 电子邮箱验证
              </CardTitle>

              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                您的电子邮箱 (example@example.com) 已验证。
              </p>

              <Button>更换电子邮箱</Button>
            </SettingsCard>
          </>
        );

      case '通知设置':
        return (
          <>
            {updateSuccess && (
              <SuccessMessage>
                <FiCheck size={16} /> 您的通知设置已成功更新
              </SuccessMessage>
            )}

            <SettingsCard>
              <CardTitle>
                <FiBell size={20} /> 通知设置
              </CardTitle>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <SwitchContainer>
                    <Switch theme={emailNotifications ? 'active' : 'inactive'}>
                      <input
                        type="checkbox"
                        style={{ opacity: 0, position: 'absolute' }}
                        checked={emailNotifications}
                        onChange={() => setEmailNotifications(!emailNotifications)}
                      />
                    </Switch>
                    <SwitchLabel>电子邮件通知</SwitchLabel>
                  </SwitchContainer>
                  <HelpText>接收有关账户活动和内容更新的电子邮件</HelpText>
                </FormGroup>

                <FormGroup>
                  <SwitchContainer>
                    <Switch theme={siteNotifications ? 'active' : 'inactive'}>
                      <input
                        type="checkbox"
                        style={{ opacity: 0, position: 'absolute' }}
                        checked={siteNotifications}
                        onChange={() => setSiteNotifications(!siteNotifications)}
                      />
                    </Switch>
                    <SwitchLabel>站内通知</SwitchLabel>
                  </SwitchContainer>
                  <HelpText>在网站上接收通知</HelpText>
                </FormGroup>

                <FormGroup>
                  <SwitchContainer>
                    <Switch theme={messageNotifications ? 'active' : 'inactive'}>
                      <input
                        type="checkbox"
                        style={{ opacity: 0, position: 'absolute' }}
                        checked={messageNotifications}
                        onChange={() => setMessageNotifications(!messageNotifications)}
                      />
                    </Switch>
                    <SwitchLabel>消息通知</SwitchLabel>
                  </SwitchContainer>
                  <HelpText>接收有关新消息的通知</HelpText>
                </FormGroup>

                <ButtonGroup>
                  <Button>重置为默认</Button>
                  <Button primary type="submit">
                    保存设置
                  </Button>
                </ButtonGroup>
              </form>
            </SettingsCard>
          </>
        );

      case '语言与地区':
        return (
          <>
            {updateSuccess && (
              <SuccessMessage>
                <FiCheck size={16} /> 您的语言与地区设置已成功更新
              </SuccessMessage>
            )}

            <SettingsCard>
              <CardTitle>
                <FiGlobe size={20} /> 语言与地区设置
              </CardTitle>

              <form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="language">语言</Label>
                  <Input as="select" id="language" defaultValue="zh-CN">
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English (US)</option>
                    <option value="ja-JP">日本語</option>
                    <option value="ko-KR">한국어</option>
                  </Input>
                  <HelpText>选择您偏好的界面语言</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="timezone">时区</Label>
                  <Input as="select" id="timezone" defaultValue="Asia/Shanghai">
                    <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                    <option value="America/New_York">东部标准时间 (UTC-5)</option>
                    <option value="Europe/London">格林威治标准时间 (UTC+0)</option>
                    <option value="Asia/Tokyo">日本标准时间 (UTC+9)</option>
                  </Input>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="date_format">日期格式</Label>
                  <Input as="select" id="date_format" defaultValue="YYYY-MM-DD">
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  </Input>
                </FormGroup>

                <ButtonGroup>
                  <Button>重置为默认</Button>
                  <Button primary type="submit">
                    保存设置
                  </Button>
                </ButtonGroup>
              </form>
            </SettingsCard>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      <motion.div variants={pageVariants} initial="initial" animate="animate">
        <SettingsContainer>
          <Sidebar>
            <NavCard>
              <NavItem active={activePage === '个人资料'} onClick={() => setActivePage('个人资料')}>
                <FiUser size={18} /> 个人资料
              </NavItem>
              <NavItem active={activePage === '安全设置'} onClick={() => setActivePage('安全设置')}>
                <FiLock size={18} /> 安全设置
              </NavItem>
              <NavItem active={activePage === '通知设置'} onClick={() => setActivePage('通知设置')}>
                <FiBell size={18} /> 通知设置
              </NavItem>
              <NavItem active={activePage === '语言与地区'} onClick={() => setActivePage('语言与地区')}>
                <FiGlobe size={18} /> 语言与地区
              </NavItem>
            </NavCard>
          </Sidebar>

          <Content>{renderSettingsContent()}</Content>
        </SettingsContainer>
      </motion.div>
    </PageContainer>
  );
};

export default Settings;
