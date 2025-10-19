import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import Header from './header';
import Footer from './footer';
import FloatingToolbar from './floating-toolbar';
import GhostWidget from './ghost-widget';
import { AnimatePresence, motion } from 'framer-motion';
import PageLoading from '@/components/common/page-loading';
import { useSystemTheme } from '@/hooks/useSystemTheme';

// 定义页面主体样式
const MainContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
  position: relative;
`;

// 内容区域样式
const Content = styled(motion.main)`
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  overflow: visible;
  margin-top: var(--header-height);

  @media (max-width: 768px) {
    padding: 1.5rem 1.25rem;
  }
`;

// 加载指示器样式
const LoadingIndicator = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent-color);
  z-index: 1000;
`;

// 页面过渡动画配置
const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as any },
};

/**
 * 根布局组件，提供应用程序的基本结构
 * 包括页面过渡和滚动状态监听
 */
const RootLayout = () => {
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();

  // 加载指示器状态
  const [showLoader, setShowLoader] = useState(false);
  const previousPathRef = useRef(location.pathname);
  const loaderTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 监听系统主题变化（自动在 auto 模式下启用）
  useSystemTheme();

  // 组件挂载处理
  useEffect(() => {
    setMounted(true);
  }, []);

  // 路由变化时的加载指示器
  useEffect(() => {
    // 检查路径是否变化
    const isPathChanged = previousPathRef.current !== location.pathname;

    if (!isPathChanged) return;

    // 清除之前的定时器
    if (loaderTimerRef.current) {
      clearTimeout(loaderTimerRef.current);
      loaderTimerRef.current = null;
    }

    // 显示加载器
    setShowLoader(true);

    // 最小显示时间 500ms
    loaderTimerRef.current = setTimeout(() => {
      setShowLoader(false);
      loaderTimerRef.current = null;
    }, 500);

    // 更新路径引用
    previousPathRef.current = location.pathname;

    // 清理函数
    return () => {
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
        loaderTimerRef.current = null;
      }
    };
  }, [location.pathname]);

  // 设置滚动监听
  useEffect(() => {
    // 定义滚动处理函数
    const handleScroll = () => {
      const currentScrollPosition = window.scrollY;
      setScrollPosition(currentScrollPosition);

      const newScrolledState = currentScrollPosition > 5;
      setIsScrolled(newScrolledState);
    };

    // 初始检查
    handleScroll();

    // 添加事件监听，使用passive优化性能
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // 空依赖数组，只在挂载时执行

  // 等待组件挂载完成
  if (!mounted) return null;

  return (
    <MainContainer>
      {/* 加载指示器 */}
      <AnimatePresence>
        {showLoader && (
          <>
            <LoadingIndicator
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
            />
            <PageLoading />
          </>
        )}
      </AnimatePresence>

      {/* 头部导航 */}
      <Header scrolled={isScrolled} />

      {/* 主内容区域 - 带动画过渡 */}
      <AnimatePresence mode="wait">
        <Content key={location.pathname} {...pageTransition}>
          <Outlet />
        </Content>
      </AnimatePresence>

      {/* 页脚 */}
      <Footer />

      {/* 悬浮工具栏 */}
      <FloatingToolbar scrollPosition={scrollPosition} />

      {/* 幽灵小部件 */}
      <GhostWidget />
    </MainContainer>
  );
};

export default RootLayout;
