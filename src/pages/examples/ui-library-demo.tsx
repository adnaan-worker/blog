import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FiCode, FiZap, FiStar, FiHeart, FiMessageCircle, FiEye, FiGift } from 'react-icons/fi';

// 导入UI组件库的多种方式示例
import { toast, alert, confirm, tooltip } from '@/ui'; // 方式1：具名导入
import UI from '@/ui'; // 方式2：默认导入
// 方式3：全局使用（无需导入）- window.UI 或 window.Toast 等

// 页面容器
const PageContainer = styled.div`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
  min-height: 100vh;
`;

// 首屏英雄区域
const HeroSection = styled(motion.div)`
  position: relative;
  padding: 4rem 0 2rem;
  text-align: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 200px;
    height: 200px;
    background: radial-gradient(circle, var(--accent-color-alpha) 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.6;
    z-index: -1;
    filter: blur(20px);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 10%;
    right: 20%;
    width: 150px;
    height: 150px;
    background: radial-gradient(circle, rgba(var(--gradient-to), 0.08) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
    filter: blur(15px);
  }
`;

// 页面渐变背景
const PageHeadGradient = styled.div`
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 400px;
  width: 100%;
  background: linear-gradient(to right, rgb(var(--gradient-from) / 0.2) 0%, rgb(var(--gradient-to) / 0.2) 100%);
  mask-image: linear-gradient(#000, #ffffff00 70%);
  z-index: -1;
`;

// 主标题
const HeroTitle = styled(motion.h1)`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

// 副标题
const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

// 特性网格
const FeatureGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 4rem;
`;

// 特性卡片
const FeatureCard = styled(motion.div)`
  text-align: center;
  padding: 1.5rem 1rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-color-alpha);
  }
`;

// 特性图标
const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  background: var(--accent-color-alpha);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  font-size: 1.2rem;
`;

// 组件示例容器
const DemoContainer = styled.div`
  margin-bottom: 4rem;
`;

// 组件section
const ComponentSection = styled(motion.div)`
  background: var(--bg-primary);
  border-radius: var(--radius-large);
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

// section标题
const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);

  &::before {
    content: '';
    width: 4px;
    height: 1.5rem;
    background: var(--accent-color);
    border-radius: 2px;
  }
`;

// section描述
const SectionDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

// 代码块容器
const CodeBlockContainer = styled.div`
  background: var(--bg-tertiary);
  border-radius: var(--radius-medium);
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-color), var(--accent-color-hover));
  }
`;

// 代码块
const CodeBlock = styled.pre`
  font-family: var(--font-code);
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  overflow-x: auto;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

// 按钮组
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;

  @media (max-width: 640px) {
    gap: 0.75rem;
  }
`;

// 样式化按钮
const StyledButton = styled(motion.button)<{ variant?: 'primary' | 'success' | 'error' | 'warning' | 'info' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: var(--radius-small);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;

  ${({ variant = 'primary' }) => {
    const styles = {
      primary: `
        background: var(--accent-color);
        color: white;
        &:hover {
          background: var(--accent-color-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--accent-color-alpha);
        }
      `,
      success: `
        background: #10b981;
        color: white;
        &:hover {
          background: #059669;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      `,
      error: `
        background: #ef4444;
        color: white;
        &:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `,
      warning: `
        background: #f59e0b;
        color: white;
        &:hover {
          background: #d97706;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
      `,
      info: `
        background: #3b82f6;
        color: white;
        &:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `,
    };
    return styles[variant];
  }}

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

// 使用方式总结网格
const UsageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

// 使用方式卡片
const UsageCard = styled(motion.div)`
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-medium);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent-color-alpha);
  }

  h4 {
    color: var(--text-primary);
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  code {
    background: var(--bg-tertiary);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: var(--font-code);
    font-size: 0.8rem;
    color: var(--accent-color);
    display: block;
    margin: 0.5rem 0;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }
`;

const UILibraryDemo: React.FC = () => {
  // 动画变体
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] },
    },
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // Toast示例
  const handleToastExamples = () => {
    toast.success('这是成功消息！');
    setTimeout(() => UI.toast.error('这是错误消息！'), 500);
    setTimeout(() => window.UI.toast.info('这是信息消息！'), 1000);
    setTimeout(() => (window as any).Toast.warning('这是警告消息！'), 1500);
  };

  // Alert示例
  const handleAlertExamples = () => {
    alert.success('这是成功Alert！', '成功');
    setTimeout(() => UI.alert.error('这是错误Alert！', '错误'), 500);
    setTimeout(() => window.UI.alert.info('这是信息Alert！', '信息'), 1000);
  };

  // Confirm示例
  const handleConfirmExamples = async () => {
    const result1 = await confirm({
      title: '确认操作',
      message: '您确定要执行此操作吗？',
      confirmText: '确定',
      cancelText: '取消',
    });

    if (result1) {
      toast.success('您选择了确定');
    } else {
      toast.info('您选择了取消');
    }
  };

  // Tooltip示例
  const handleTooltipExample = (event: React.MouseEvent<HTMLButtonElement>) => {
    tooltip.show(event.currentTarget, '这是一个提示信息', { placement: 'top', duration: 3000 });
  };

  return (
    <PageContainer>
      <PageHeadGradient />

      <HeroSection initial="hidden" animate="visible" variants={fadeInUpVariants}>
        <HeroTitle variants={fadeInUpVariants}>🎨 UI组件库使用指南</HeroTitle>
        <HeroSubtitle variants={fadeInUpVariants}>
          一个灵活而强大的UI组件库，支持多种导入方式，让你的开发更加高效。
        </HeroSubtitle>

        <FeatureGrid variants={staggerVariants} initial="hidden" animate="visible">
          <FeatureCard variants={fadeInUpVariants}>
            <FeatureIcon>
              <FiCode />
            </FeatureIcon>
            <h4>4种导入方式</h4>
            <p>支持具名、默认、全局和简写导入</p>
          </FeatureCard>
          <FeatureCard variants={fadeInUpVariants}>
            <FeatureIcon>
              <FiZap />
            </FeatureIcon>
            <h4>简单易用</h4>
            <p>无需复杂配置，开箱即用</p>
          </FeatureCard>
          <FeatureCard variants={fadeInUpVariants}>
            <FeatureIcon>
              <FiStar />
            </FeatureIcon>
            <h4>类型安全</h4>
            <p>完全的TypeScript支持</p>
          </FeatureCard>
          <FeatureCard variants={fadeInUpVariants}>
            <FeatureIcon>
              <FiHeart />
            </FeatureIcon>
            <h4>现代设计</h4>
            <p>符合现代UI设计趋势</p>
          </FeatureCard>
        </FeatureGrid>
      </HeroSection>

      <DemoContainer>
        <ComponentSection initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUpVariants}>
          <SectionTitle>
            <FiMessageCircle /> Toast 轻提示
          </SectionTitle>
          <SectionDescription>轻量级的消息提示，自动消失，不会阻塞用户操作。</SectionDescription>

          <CodeBlockContainer>
            <CodeBlock>
              {`// 方式1：具名导入
import { toast } from '@/ui';
toast.success('成功消息');

// 方式2：默认导入
import UI from '@/ui';
UI.toast.error('错误消息');

// 方式3：全局使用（无需导入）
window.UI.toast.info('信息消息');
Toast.warning('警告消息'); // 简写`}
            </CodeBlock>
          </CodeBlockContainer>

          <ButtonGroup>
            <StyledButton
              variant="success"
              onClick={() => toast.success('成功提示！')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiStar /> 成功Toast
            </StyledButton>
            <StyledButton
              variant="error"
              onClick={() => UI.toast.error('错误提示！')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiZap /> 错误Toast
            </StyledButton>
            <StyledButton
              variant="info"
              onClick={() => window.UI.toast.info('信息提示！')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiEye /> 信息Toast（全局）
            </StyledButton>
            <StyledButton
              variant="warning"
              onClick={() => (window as any).Toast.warning('警告提示！')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiGift /> 警告Toast（简写）
            </StyledButton>
            <StyledButton
              variant="primary"
              onClick={handleToastExamples}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiZap /> 连续示例
            </StyledButton>
          </ButtonGroup>
        </ComponentSection>

        <ComponentSection initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUpVariants}>
          <SectionTitle>
            <FiHeart /> 使用方式总结
          </SectionTitle>
          <SectionDescription>灵活的导入方式，适应不同的开发场景和个人偏好。</SectionDescription>

          <UsageGrid>
            <UsageCard variants={fadeInUpVariants}>
              <h4>
                <FiCode /> 方式1：具名导入
              </h4>
              <code>import {`{ toast }`} from '@/ui'</code>
              <p>适合：明确知道要使用哪些组件的情况</p>
            </UsageCard>

            <UsageCard variants={fadeInUpVariants}>
              <h4>
                <FiZap /> 方式2：默认导入
              </h4>
              <code>import UI from '@/ui'</code>
              <p>适合：需要使用多个UI组件的情况</p>
            </UsageCard>

            <UsageCard variants={fadeInUpVariants}>
              <h4>
                <FiEye /> 方式3：全局使用
              </h4>
              <code>window.UI.toast.success()</code>
              <p>适合：在非React代码中使用</p>
            </UsageCard>

            <UsageCard variants={fadeInUpVariants}>
              <h4>
                <FiGift /> 方式4：全局简写
              </h4>
              <code>Toast.success()</code>
              <p>适合：频繁使用的场景</p>
            </UsageCard>
          </UsageGrid>
        </ComponentSection>

        <ComponentSection initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUpVariants}>
          <SectionTitle>📦 安装和初始化</SectionTitle>
          <SectionDescription>只需要在应用入口文件中初始化一次，即可在整个应用中使用。</SectionDescription>

          <CodeBlockContainer>
            <CodeBlock>
              {`// 在 main.tsx 中初始化
import UI from '@/ui';

// 安装UI组件库到全局
UI.install(); // 或 UI.init()

// 之后就可以在任何地方使用
window.UI.toast.success('全局可用！');
Toast.success('简写形式！');

// 也可以继续使用导入方式
import { toast } from '@/ui';
toast.success('导入使用！');`}
            </CodeBlock>
          </CodeBlockContainer>
        </ComponentSection>
      </DemoContainer>
    </PageContainer>
  );
};

export default UILibraryDemo;
