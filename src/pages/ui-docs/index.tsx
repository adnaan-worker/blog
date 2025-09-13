import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import {
  FiCode,
  FiZap,
  FiStar,
  FiHeart,
  FiMessageCircle,
  FiEye,
  FiGift,
  FiUser,
  FiMail,
  FiLock,
  FiSearch,
  FiSettings,
  FiInfo,
  FiCheckCircle,
  FiAlertTriangle,
  FiEdit3,
  FiSquare,
  FiClipboard,
  FiBookOpen,
  FiHome,
  FiArrowRight,
  FiPlay,
  FiRefreshCw,
} from 'react-icons/fi';

// 使用 @/ui 的导入方式
import { toast, alert, confirm, modal, tooltip } from '@/ui';
import { Button, Input } from '@/components/ui';

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  min-height: 100vh;
  background: var(--bg-primary);
`;

// 文档头部
const DocumentHeader = styled.div`
  text-align: center;
  padding: 3rem 0 2rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 3rem;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-radius: 16px;
  margin-top: 1rem;
`;

const DocumentTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const DocumentSubtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
`;

const QuickStartBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid var(--accent-color);
`;

// 导航栏
const Navigation = styled.nav`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  position: sticky;
  top: 1rem;
  z-index: 100;
`;

const NavList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
  justify-content: center;
`;

const NavItem = styled.li`
  a {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    text-decoration: none;
    color: var(--text-secondary);
    transition: all 0.2s ease;
    font-size: 0.9rem;

    &:hover {
      background: var(--bg-tertiary);
      color: var(--accent-color);
      transform: translateY(-1px);
    }
  }
`;

// 章节容器
const Section = styled.section`
  margin-bottom: 4rem;
  scroll-margin-top: 5rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border-color);
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const SectionDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
`;

// 组件卡片
const ComponentCard = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), #8b5cf6);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const ComponentHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ComponentTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const ComponentBadge = styled.span`
  background: var(--accent-color-alpha);
  color: var(--accent-color);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid var(--accent-color);
`;

const ComponentDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
`;

// 示例区域
const ExampleSection = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color);
`;

const ExampleTitle = styled.h4`
  margin: 0 0 1rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExampleGrid = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;

  &.two-columns {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }

  &.three-columns {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

const ExampleItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// 代码块
const CodeBlock = styled.pre`
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--text-secondary);
  overflow-x: auto;
  border: 1px solid var(--border-color);
  position: relative;

  &::before {
    content: 'JavaScript';
    position: absolute;
    top: 0.5rem;
    right: 0.75rem;
    font-size: 0.7rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`;

const InlineCode = styled.code`
  background: var(--bg-tertiary);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--accent-color);
`;

// 实用工具
const UtilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const UtilityCard = styled.div`
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);

  h4 {
    margin: 0 0 0.75rem;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    margin: 0 0 1rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
  }
`;

const UILibraryDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  // 动画变体
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  };

  // 示例函数
  const handleToastExamples = () => {
    toast.success('成功消息');
    setTimeout(() => toast.error('错误消息'), 500);
    setTimeout(() => toast.warning('警告消息'), 1000);
    setTimeout(() => toast.info('信息消息'), 1500);
  };

  const handleAlertExamples = async () => {
    alert.info('这是一个信息提示', '提示');
    setTimeout(() => alert.success('操作成功完成！', '成功'), 1000);
  };

  const handleConfirmExample = async () => {
    const result = await confirm({
      title: '确认删除',
      message: '您确定要删除这个项目吗？此操作无法撤销。',
      confirmText: '删除',
      cancelText: '取消',
    });

    if (result) {
      toast.success('项目已删除');
    } else {
      toast.info('操作已取消');
    }
  };

  const handleModalExamples = () => {
    modal.show(
      <div style={{ padding: '1rem 0' }}>
        <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
          这是通过{' '}
          <code style={{ background: 'var(--bg-tertiary)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            modal.show()
          </code>{' '}
          调用的模态框。
        </p>
        <Input placeholder="在模态框中输入内容" />
      </div>,
      { title: '函数式调用示例', size: 'medium' },
    );
  };

  const handleTooltipExample = (event: React.MouseEvent<HTMLButtonElement>) => {
    tooltip.show(event.currentTarget, '这是一个提示信息', { placement: 'top', duration: 3000 });
  };

  const handleInputValidation = (value: string) => {
    setInputValue(value);
    if (value.length < 3) {
      setInputError('内容至少需要3个字符');
    } else {
      setInputError('');
    }
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PageContainer>
      <DocumentHeader>
        <DocumentTitle>
          <FiBookOpen />
          UI组件库使用文档
          <QuickStartBadge>
            <FiPlay size={14} />
            完整指南
          </QuickStartBadge>
        </DocumentTitle>
        <DocumentSubtitle>
          基于现代React的UI组件系统，提供完整的类型支持、主题系统和无障碍访问功能。 支持多种导入方式，适配各种使用场景。
        </DocumentSubtitle>
      </DocumentHeader>

      <Navigation>
        <NavList>
          <NavItem>
            <a
              href="#installation"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('installation');
              }}
            >
              <FiHome size={16} />
              快速开始
            </a>
          </NavItem>
          <NavItem>
            <a
              href="#toast"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('toast');
              }}
            >
              <FiMessageCircle size={16} />
              Toast
            </a>
          </NavItem>
          <NavItem>
            <a
              href="#alert"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('alert');
              }}
            >
              <FiInfo size={16} />
              Alert
            </a>
          </NavItem>
          <NavItem>
            <a
              href="#confirm"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('confirm');
              }}
            >
              <FiCheckCircle size={16} />
              Confirm
            </a>
          </NavItem>
          <NavItem>
            <a
              href="#modal"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('modal');
              }}
            >
              <FiSquare size={16} />
              Modal
            </a>
          </NavItem>
          <NavItem>
            <a
              href="#tooltip"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('tooltip');
              }}
            >
              <FiEye size={16} />
              Tooltip
            </a>
          </NavItem>
          <NavItem>
            <a
              href="#button"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('button');
              }}
            >
              <FiZap size={16} />
              Button
            </a>
          </NavItem>
          <NavItem>
            <a
              href="#input"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('input');
              }}
            >
              <FiEdit3 size={16} />
              Input
            </a>
          </NavItem>
        </NavList>
      </Navigation>

      {/* 快速开始 */}
      <Section id="installation">
        <SectionHeader>
          <SectionTitle>
            <FiHome />
            快速开始
          </SectionTitle>
          <SectionDescription>了解如何在项目中集成和使用UI组件库</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiCode />
              安装和初始化
              <ComponentBadge>必需</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>在应用程序入口文件中初始化UI组件库，启用全局访问功能。</ComponentDescription>
          </ComponentHeader>

          <CodeBlock>
            {`// 在 main.tsx 中初始化
import UI from '@/ui';

// 初始化UI组件库（启用全局访问）
UI.install(); // 或 UI.init()

// 之后可以在任何地方使用
window.UI.toast.success('全局可用！');
Toast.success('简写形式！');`}
          </CodeBlock>

          <ExampleSection>
            <ExampleTitle>
              <FiGift />
              导入方式
            </ExampleTitle>
            <UtilityGrid>
              <UtilityCard>
                <h4>
                  <FiCode />
                  方式1：具名导入
                </h4>
                <p>适合明确知道要使用哪些组件的情况</p>
                <InlineCode>import {`{ toast, alert }`} from '@/ui'</InlineCode>
              </UtilityCard>
              <UtilityCard>
                <h4>
                  <FiZap />
                  方式2：默认导入
                </h4>
                <p>适合需要使用多个UI组件的情况</p>
                <InlineCode>import UI from '@/ui'</InlineCode>
              </UtilityCard>
              <UtilityCard>
                <h4>
                  <FiEye />
                  方式3：全局使用
                </h4>
                <p>适合在非React代码中使用</p>
                <InlineCode>window.UI.toast.success()</InlineCode>
              </UtilityCard>
              <UtilityCard>
                <h4>
                  <FiGift />
                  方式4：全局简写
                </h4>
                <p>适合频繁使用的场景</p>
                <InlineCode>Toast.success()</InlineCode>
              </UtilityCard>
            </UtilityGrid>
          </ExampleSection>
        </ComponentCard>
      </Section>

      {/* Toast 组件 */}
      <Section id="toast">
        <SectionHeader>
          <SectionTitle>
            <FiMessageCircle />
            Toast 轻提示
          </SectionTitle>
          <SectionDescription>轻量级的消息提示，自动消失，不会阻塞用户操作</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiMessageCircle />
              基础用法
              <ComponentBadge>toast</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>支持成功、错误、警告、信息四种类型，可自定义持续时间和标题。</ComponentDescription>
          </ComponentHeader>

          <ExampleSection>
            <ExampleTitle>
              <FiPlay />
              实时演示
            </ExampleTitle>
            <ExampleGrid className="two-columns">
              <ExampleItem>
                <Button variant="success" onClick={() => toast.success('操作成功完成')}>
                  <FiCheckCircle />
                  成功提示
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="danger" onClick={() => toast.error('操作失败，请重试')}>
                  <FiAlertTriangle />
                  错误提示
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="warning" onClick={() => toast.warning('请注意检查输入')}>
                  <FiInfo />
                  警告提示
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="info" onClick={() => toast.info('新功能已上线')}>
                  <FiMessageCircle />
                  信息提示
                </Button>
              </ExampleItem>
            </ExampleGrid>
            <Button onClick={handleToastExamples} variant="primary">
              <FiRefreshCw />
              连续演示
            </Button>
          </ExampleSection>

          <CodeBlock>
            {`// 基础用法
import { toast } from '@/ui';

toast.success('操作成功');
toast.error('操作失败');
toast.warning('警告信息');
toast.info('提示信息');

// 带标题和自定义持续时间
toast.success('数据保存成功', '成功', 3000);

// 全局调用方式
window.UI.toast.success('全局调用');
Toast.success('简写方式');`}
          </CodeBlock>
        </ComponentCard>
      </Section>

      {/* Alert 组件 */}
      <Section id="alert">
        <SectionHeader>
          <SectionTitle>
            <FiInfo />
            Alert 警告提示
          </SectionTitle>
          <SectionDescription>用于显示重要的提示信息，需要用户主动关闭</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiInfo />
              Alert 使用方法
              <ComponentBadge>alert</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>适用于需要用户关注的重要信息，支持标题、图标和手动关闭。</ComponentDescription>
          </ComponentHeader>

          <ExampleSection>
            <ExampleTitle>
              <FiPlay />
              实时演示
            </ExampleTitle>
            <ExampleGrid className="two-columns">
              <ExampleItem>
                <Button onClick={() => alert.success('用户注册成功', '成功')}>成功Alert</Button>
              </ExampleItem>
              <ExampleItem>
                <Button onClick={() => alert.error('网络连接失败', '错误')}>错误Alert</Button>
              </ExampleItem>
              <ExampleItem>
                <Button onClick={() => alert.warning('磁盘空间不足', '警告')}>警告Alert</Button>
              </ExampleItem>
              <ExampleItem>
                <Button onClick={handleAlertExamples}>连续Alert</Button>
              </ExampleItem>
            </ExampleGrid>
          </ExampleSection>

          <CodeBlock>
            {`// Alert 用法
import { alert } from '@/ui';

alert.success('操作成功', '成功');
alert.error('操作失败', '错误');
alert.warning('注意事项', '警告');
alert.info('温馨提示', '提示');

// 不带标题
alert.success('简单提示');

// 全局调用
window.UI.alert.success('全局调用', '成功');`}
          </CodeBlock>
        </ComponentCard>
      </Section>

      {/* Confirm 组件 */}
      <Section id="confirm">
        <SectionHeader>
          <SectionTitle>
            <FiCheckCircle />
            Confirm 确认对话框
          </SectionTitle>
          <SectionDescription>用于重要操作的二次确认，返回Promise以便处理用户选择</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiCheckCircle />
              确认对话框
              <ComponentBadge>confirm</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>适用于删除、提交等重要操作的确认，支持自定义按钮文本和样式。</ComponentDescription>
          </ComponentHeader>

          <ExampleSection>
            <ExampleTitle>
              <FiPlay />
              实时演示
            </ExampleTitle>
            <ExampleGrid className="two-columns">
              <ExampleItem>
                <Button onClick={handleConfirmExample} variant="danger">
                  <FiAlertTriangle />
                  删除确认
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button
                  onClick={async () => {
                    const result = await confirm({
                      title: '提交确认',
                      message: '确定要提交表单吗？',
                      confirmText: '提交',
                      cancelText: '取消',
                    });
                    toast.info(result ? '已提交' : '已取消');
                  }}
                >
                  <FiCheckCircle />
                  提交确认
                </Button>
              </ExampleItem>
            </ExampleGrid>
          </ExampleSection>

          <CodeBlock>
            {`// Confirm 用法
import { confirm, toast } from '@/ui';

const handleDelete = async () => {
  const result = await confirm({
    title: '确认删除',
    message: '此操作无法撤销，确定要删除吗？',
    confirmText: '删除',
    cancelText: '取消'
  });
  
  if (result) {
    // 用户点击了确认
    toast.success('删除成功');
  } else {
    // 用户点击了取消
    toast.info('操作已取消');
  }
};

// 全局调用
const result = await window.UI.confirm({
  title: '确认操作',
  message: '确定要继续吗？'
});`}
          </CodeBlock>
        </ComponentCard>
      </Section>

      {/* Modal 组件 */}
      <Section id="modal">
        <SectionHeader>
          <SectionTitle>
            <FiSquare />
            Modal 模态框
          </SectionTitle>
          <SectionDescription>强大的模态框组件，支持多种尺寸、键盘导航和无障碍访问</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiSquare />
              模态框组件
              <ComponentBadge>modal</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>
              支持函数式调用、多种尺寸、确认对话框等功能，具备完整的键盘导航和焦点管理。
            </ComponentDescription>
          </ComponentHeader>

          <ExampleSection>
            <ExampleTitle>
              <FiPlay />
              实时演示
            </ExampleTitle>
            <ExampleGrid className="three-columns">
              <ExampleItem>
                <Button onClick={() => modal.show('这是一个简单的模态框内容', { title: '简单模态框' })}>
                  基础模态框
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button onClick={handleModalExamples}>
                  <FiEdit3 />
                  带表单模态框
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button
                  onClick={async () => {
                    const result = await modal.confirm({
                      title: '模态框确认',
                      message: '这是通过modal.confirm()调用的确认对话框',
                      confirmText: '确定',
                      cancelText: '取消',
                    });
                    toast.info(result ? '已确认' : '已取消');
                  }}
                >
                  <FiCheckCircle />
                  模态框确认
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button onClick={() => modal.info('这是信息模态框的内容', '信息')}>信息模态框</Button>
              </ExampleItem>
              <ExampleItem>
                <Button onClick={() => modal.success('操作成功完成！', '成功')}>成功模态框</Button>
              </ExampleItem>
              <ExampleItem>
                <Button onClick={() => modal.warning('请注意相关事项', '警告')}>警告模态框</Button>
              </ExampleItem>
            </ExampleGrid>
          </ExampleSection>

          <CodeBlock>
            {`// Modal 用法
import { modal } from '@/ui';

// 基础模态框
modal.show('内容', { title: '标题', size: 'medium' });

// 确认模态框
const result = await modal.confirm({
  title: '确认操作',
  message: '确定要执行此操作吗？',
  confirmText: '确定',
  cancelText: '取消'
});

// 信息类型模态框
modal.info('信息内容', '信息标题');
modal.success('成功信息', '成功');
modal.warning('警告信息', '警告');
modal.error('错误信息', '错误');

// 全局调用
window.UI.modal.show('全局模态框');`}
          </CodeBlock>
        </ComponentCard>
      </Section>

      {/* Tooltip 组件 */}
      <Section id="tooltip">
        <SectionHeader>
          <SectionTitle>
            <FiEye />
            Tooltip 工具提示
          </SectionTitle>
          <SectionDescription>轻量级的提示工具，在元素悬停或点击时显示补充信息</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiEye />
              工具提示
              <ComponentBadge>tooltip</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>支持多个位置、自定义样式和持续时间，适用于提供额外的操作说明。</ComponentDescription>
          </ComponentHeader>

          <ExampleSection>
            <ExampleTitle>
              <FiPlay />
              实时演示
            </ExampleTitle>
            <ExampleGrid className="two-columns">
              <ExampleItem>
                <Button onClick={handleTooltipExample}>
                  <FiInfo />
                  显示提示
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button
                  onMouseEnter={(e) => tooltip.show(e.currentTarget, '鼠标悬停显示', { placement: 'bottom' })}
                  onMouseLeave={() => tooltip.hide()}
                >
                  <FiEye />
                  悬停提示
                </Button>
              </ExampleItem>
            </ExampleGrid>
          </ExampleSection>

          <CodeBlock>
            {`// Tooltip 用法
import { tooltip } from '@/ui';

// 基础用法
const handleClick = (event) => {
  tooltip.show(event.target, '提示内容', {
    placement: 'top', // top, bottom, left, right
    duration: 3000    // 持续时间(ms)
  });
};

// 隐藏提示
tooltip.hide();

// 鼠标悬停显示
const handleMouseEnter = (event) => {
  tooltip.show(event.target, '悬停提示');
};

const handleMouseLeave = () => {
  tooltip.hide();
};

// 全局调用
window.UI.tooltip.show(element, '全局提示');`}
          </CodeBlock>
        </ComponentCard>
      </Section>

      {/* Button 组件 */}
      <Section id="button">
        <SectionHeader>
          <SectionTitle>
            <FiZap />
            Button 按钮组件
          </SectionTitle>
          <SectionDescription>功能完整的按钮组件，支持多种样式、状态和交互效果</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiZap />
              按钮组件
              <ComponentBadge>Button</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>支持8种变体、3种尺寸、加载状态、图标、禁用状态等完整功能。</ComponentDescription>
          </ComponentHeader>

          <ExampleSection>
            <ExampleTitle>
              <FiPlay />
              变体演示
            </ExampleTitle>
            <ExampleGrid className="three-columns">
              <ExampleItem>
                <Button variant="primary" onClick={() => toast.success('Primary按钮')}>
                  Primary
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="secondary">Secondary</Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="success">Success</Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="danger">Danger</Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="warning">Warning</Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="info">Info</Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="ghost">Ghost</Button>
              </ExampleItem>
              <ExampleItem>
                <Button variant="outline">Outline</Button>
              </ExampleItem>
            </ExampleGrid>

            <ExampleTitle>
              <FiSettings />
              尺寸和状态
            </ExampleTitle>
            <ExampleGrid className="three-columns">
              <ExampleItem>
                <Button size="small" leftIcon={<FiUser />}>
                  Small
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button size="medium" rightIcon={<FiArrowRight />}>
                  Medium
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button size="large">Large</Button>
              </ExampleItem>
              <ExampleItem>
                <Button isLoading variant="primary">
                  Loading
                </Button>
              </ExampleItem>
              <ExampleItem>
                <Button disabled>Disabled</Button>
              </ExampleItem>
              <ExampleItem>
                <Button fullWidth variant="primary">
                  Full Width
                </Button>
              </ExampleItem>
            </ExampleGrid>
          </ExampleSection>

          <CodeBlock>
            {`// Button 用法
import { Button } from '@/components/ui';

// 基础用法
<Button variant="primary" onClick={handleClick}>
  点击按钮
</Button>

// 带图标
<Button leftIcon={<Icon />} variant="success">
  保存
</Button>

<Button rightIcon={<ArrowIcon />}>
  下一步
</Button>

// 加载状态
<Button isLoading variant="primary">
  提交中...
</Button>

// 不同尺寸
<Button size="small">小按钮</Button>
<Button size="medium">中等按钮</Button>
<Button size="large">大按钮</Button>

// 全宽按钮
<Button fullWidth variant="primary">
  全宽按钮
</Button>`}
          </CodeBlock>
        </ComponentCard>
      </Section>

      {/* Input 组件 */}
      <Section id="input">
        <SectionHeader>
          <SectionTitle>
            <FiEdit3 />
            Input 输入框组件
          </SectionTitle>
          <SectionDescription>功能完整的输入框组件，支持验证、图标、多种样式和状态</SectionDescription>
        </SectionHeader>

        <ComponentCard initial="hidden" animate="visible" variants={fadeInUpVariants}>
          <ComponentHeader>
            <ComponentTitle>
              <FiEdit3 />
              输入框组件
              <ComponentBadge>Input</ComponentBadge>
            </ComponentTitle>
            <ComponentDescription>
              支持4种变体、3种尺寸、标签、帮助文本、错误提示、图标、密码显示切换等功能。
            </ComponentDescription>
          </ComponentHeader>

          <ExampleSection>
            <ExampleTitle>
              <FiPlay />
              基础演示
            </ExampleTitle>
            <ExampleGrid>
              <ExampleItem>
                <Input label="用户名" placeholder="请输入用户名" leftIcon={<FiUser />} isRequired />
              </ExampleItem>
              <ExampleItem>
                <Input
                  type="email"
                  label="邮箱地址"
                  placeholder="example@email.com"
                  leftIcon={<FiMail />}
                  helperText="我们不会分享您的邮箱地址"
                />
              </ExampleItem>
              <ExampleItem>
                <Input type="password" label="密码" placeholder="请输入密码" leftIcon={<FiLock />} isRequired />
              </ExampleItem>
              <ExampleItem>
                <Input
                  label="验证示例"
                  placeholder="输入内容进行验证"
                  value={inputValue}
                  onChange={(e) => handleInputValidation(e.target.value)}
                  errorMessage={inputError}
                  isInvalid={!!inputError}
                  helperText="最少需要3个字符"
                />
              </ExampleItem>
            </ExampleGrid>

            <ExampleTitle>
              <FiSettings />
              变体演示
            </ExampleTitle>
            <ExampleGrid>
              <ExampleItem>
                <Input variant="default" placeholder="Default 变体" leftIcon={<FiUser />} />
              </ExampleItem>
              <ExampleItem>
                <Input variant="filled" placeholder="Filled 变体" leftIcon={<FiSearch />} />
              </ExampleItem>
              <ExampleItem>
                <Input variant="bordered" placeholder="Bordered 变体" rightElement={<FiSettings />} />
              </ExampleItem>
              <ExampleItem>
                <Input variant="flushed" placeholder="Flushed 变体" />
              </ExampleItem>
            </ExampleGrid>
          </ExampleSection>

          <CodeBlock>
            {`// Input 用法
import { Input } from '@/components/ui';

// 基础用法
<Input
  label="用户名"
  placeholder="请输入用户名"
  leftIcon={<UserIcon />}
  isRequired
/>

// 带验证的输入框
<Input
  label="邮箱"
  type="email"
  errorMessage={errors.email}
  isInvalid={!!errors.email}
  helperText="请输入有效的邮箱地址"
/>

// 密码输入框（自动支持显示/隐藏）
<Input
  type="password"
  label="密码"
  placeholder="请输入密码"
/>

// 不同变体
<Input variant="filled" placeholder="填充样式" />
<Input variant="bordered" placeholder="边框样式" />
<Input variant="flushed" placeholder="下划线样式" />

// 不同尺寸
<Input size="small" placeholder="小尺寸" />
<Input size="medium" placeholder="中等尺寸" />
<Input size="large" placeholder="大尺寸" />`}
          </CodeBlock>
        </ComponentCard>
      </Section>

      {/* 最佳实践 */}
      <Section id="best-practices">
        <SectionHeader>
          <SectionTitle>
            <FiStar />
            最佳实践
          </SectionTitle>
          <SectionDescription>推荐的使用方式和注意事项</SectionDescription>
        </SectionHeader>

        <UtilityGrid>
          <UtilityCard>
            <h4>
              <FiCode />
              导入建议
            </h4>
            <p>优先使用具名导入，避免不必要的代码包含</p>
            <InlineCode>import {`{ toast, Button }`} from '@/ui'</InlineCode>
          </UtilityCard>

          <UtilityCard>
            <h4>
              <FiZap />
              性能优化
            </h4>
            <p>Toast和Alert会自动管理实例，无需手动清理</p>
            <InlineCode>toast.success() // 自动管理</InlineCode>
          </UtilityCard>

          <UtilityCard>
            <h4>
              <FiSettings />
              主题适配
            </h4>
            <p>所有组件自动适配明暗主题，使用CSS变量</p>
            <InlineCode>var(--text-primary)</InlineCode>
          </UtilityCard>

          <UtilityCard>
            <h4>
              <FiHeart />
              无障碍访问
            </h4>
            <p>组件内置ARIA支持和键盘导航</p>
            <InlineCode>aria-label, role, tabindex</InlineCode>
          </UtilityCard>

          <UtilityCard>
            <h4>
              <FiClipboard />
              类型安全
            </h4>
            <p>完整的TypeScript类型定义和提示</p>
            <InlineCode>ButtonProps, InputProps</InlineCode>
          </UtilityCard>

          <UtilityCard>
            <h4>
              <FiRefreshCw />
              状态管理
            </h4>
            <p>使用受控组件模式，便于状态管理</p>
            <InlineCode>value + onChange</InlineCode>
          </UtilityCard>
        </UtilityGrid>
      </Section>
    </PageContainer>
  );
};

export default UILibraryDemo;
