import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, Suspense } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import Header from './header';
import Footer from './footer';
import FloatingToolbar from './floating-toolbar';
import GhostWidget from './ghost-widget';
import { AnimatePresence, motion } from 'framer-motion';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import PageLoading from '@/components/common/page-loading';

// 定义页面主体样式
const MainContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  position: relative;
`;

// 内容区域样式 - 移除 motion，使用纯 CSS 过渡
const Content = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  overflow: visible;
  margin-top: var(--header-height);

  /* 简单的淡入淡出，不阻塞渲染 */
  animation: fade-in 0.2s ease-out;

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

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
  box-shadow: 0 0 10px var(--accent-color);
`;

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

  // 路由变化时的加载指示器 - 优化逻辑
  useEffect(() => {
    // 检查路径是否变化
    const isPathChanged = previousPathRef.current !== location.pathname;

    if (!isPathChanged) return;

    // 清除之前的定时器
    if (loaderTimerRef.current) {
      clearTimeout(loaderTimerRef.current);
      loaderTimerRef.current = null;
    }

    // 显示加载器（顶部进度条，不显示全屏loading）
    setShowLoader(true);

    // 更快的过渡时间 300ms
    loaderTimerRef.current = setTimeout(() => {
      setShowLoader(false);
      loaderTimerRef.current = null;
    }, 300);

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
      {/* 简洁的顶部加载进度条 */}
      <AnimatePresence>
        {showLoader && (
          <LoadingIndicator
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: 'easeOut',
            }}
          />
        )}
      </AnimatePresence>

      {/* 头部导航 */}
      <Header scrolled={isScrolled} />

      {/* 主内容区域 - 移除复杂动画，使用纯CSS淡入 */}
      <Suspense fallback={createPortal(<PageLoading fullScreen />, document.body)}>
        <Content key={location.pathname}>
          <Outlet />
        </Content>
      </Suspense>

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
