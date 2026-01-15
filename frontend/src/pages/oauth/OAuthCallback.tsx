import { useOAuthCallback } from '@/hooks/useOAuth';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';
import { SEO } from '@/components/common';

/**
 * OAuth 回调页面
 * 处理第三方登录/绑定后的回调
 */
export default function OAuthCallback() {
  const { status, message } = useOAuthCallback();

  return (
    <>
      <SEO title="登录中" description="正在处理第三方登录" />
      <Container>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AnimatePresence mode="wait">
            {status === 'processing' && (
              <Content key="processing">
                <SpinnerWrapper>
                  <OuterRing
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  <InnerRing
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                  <CenterDot
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </SpinnerWrapper>
                <Title>正在处理...</Title>
                <Message>请稍候，正在完成认证</Message>
              </Content>
            )}

            {status === 'success' && (
              <Content
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <IconWrapper $success>
                  <FiCheck size={32} />
                </IconWrapper>
                <Title>认证成功</Title>
                <Message>{message}</Message>
                <Hint>正在跳转...</Hint>
              </Content>
            )}

            {status === 'error' && (
              <Content
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <IconWrapper $success={false}>
                  <FiX size={32} />
                </IconWrapper>
                <Title>认证失败</Title>
                <Message>{message}</Message>
                <ActionButton onClick={() => (window.location.href = '/')}>
                  返回首页
                </ActionButton>
              </Content>
            )}
          </AnimatePresence>
        </Card>
      </Container>
    </>
  );
}

const Container = styled.div`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background: var(--card-bg);
  border-radius: 16px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  min-width: 320px;
`;

const Content = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SpinnerWrapper = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  margin-bottom: 24px;
`;

const OuterRing = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: var(--accent-color);
  border-right-color: var(--accent-color);
`;

const InnerRing = styled(motion.div)`
  position: absolute;
  top: 15%;
  left: 15%;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  border: 2px solid transparent;
  border-bottom-color: rgba(var(--accent-rgb), 0.5);
  border-left-color: rgba(var(--accent-rgb), 0.5);
`;

const CenterDot = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-color);
  box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.6);
`;

const IconWrapper = styled.div<{ $success: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${(props) => (props.$success ? '#10b981' : '#ef4444')};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const Message = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 16px;
`;

const Hint = styled.p`
  color: var(--text-tertiary);
  font-size: 0.85rem;
`;

const ActionButton = styled.button`
  padding: 10px 24px;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
