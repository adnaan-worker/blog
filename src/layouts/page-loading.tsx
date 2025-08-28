import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import pageLoadingGif from '@/assets/images/page-loading.gif';

// 加载容器样式
const LoadingContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

// 加载文字
const LoadingText = styled(motion.p)`
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  max-width: 300px;
  line-height: 1.5;
`;

// 随机加载文案
const loadingMessages = [
  '正在加载精彩内容...',
  '马上就好...',
  '正在准备精彩内容...',
  '请稍候片刻...',
  '内容马上呈现...',
  '正在努力加载中...',
  '精彩内容即将呈现...',
  '请耐心等待一下...',
];

/**
 * 内容加载组件
 * 简约大气的加载动画，带有随机温馨提示
 */
const ContentLoading = () => {
  // 随机选择一条加载文案
  const [message, setMessage] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    setMessage(loadingMessages[randomIndex]);
  }, []);

  return (
    <LoadingContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <img
        src={pageLoadingGif}
        alt="加载中..."
        style={{
          width: '100px',
          objectFit: 'contain',
          // borderRadius: '10px',
          // boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
          marginBottom: '20px',
        }}
      />
      <LoadingText
        initial={{ opacity: 0.5, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {message}
      </LoadingText>
    </LoadingContainer>
  );
};

export default ContentLoading;
