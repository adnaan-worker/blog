import { Outlet, useLocation, useNavigationType } from 'react-router-dom';
import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import styled from '@emotion/styled';
import Header from './header';
import Footer from './footer';
import FloatingToolbar from './floating-toolbar';
import Live2DModel from './live2d-model';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from '@/components/ui/Toast';
import ToastListener from '@/components/ui/ToastListener';

// 定义页面主体样式
const MainContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
  position: relative;
  // overflow: hidden;
  width: 100%;
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
  transition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
    staggerChildren: 0.05,
  },
};

/**
 * 根布局组件，提供应用程序的基本结构
 * 包括页面过渡和滚动状态监听
 */
const RootLayout = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();
  const navigationType = useNavigationType();
  const [isPending, startTransition] = useTransition();

  // 用于控制加载指示器的完整显示
  const [showLoader, setShowLoader] = useState(false);
  const loaderAnimationCompleted = useRef(false);
  const loaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 组件挂载处理
  useEffect(() => {
    setMounted(true);
  }, []);

  // 处理加载动画的完整显示
  useEffect(() => {
    // 当实际加载状态变化时
    if (isPending || isLoading) {
      setShowLoader(true);
      loaderAnimationCompleted.current = false;

      // 清除之前的超时
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
        loaderTimeoutRef.current = null;
      }
    } else {
      // 当加载完成时，不要立即隐藏加载器，等待动画完成
      if (!loaderAnimationCompleted.current) {
        loaderTimeoutRef.current = setTimeout(() => {
          setShowLoader(false);
        }, 500); // 确保加载动画有足够时间完成
      }
    }

    return () => {
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
      }
    };
  }, [isPending, isLoading]);

  // 路由切换时处理加载状态
  useEffect(() => {
    // 页面导航开始时设置加载状态
    setIsLoading(true);

    // 使用React 18的并发特性处理加载状态
    startTransition(() => {
      // 模拟资源加载完成
      const loadResources = async () => {
        try {
          // 预加载当前路由所需的资源
          await Promise.all([
            // 这里可以添加实际需要预加载的资源，如图片、数据等
            new Promise<void>((resolve) => {
              // 监听页面加载完成事件
              if (document.readyState === 'complete') {
                resolve();
              } else {
                window.addEventListener('load', () => resolve(), { once: true });
              }
            }),
          ]);
        } finally {
          // 无论加载成功还是失败，都结束加载状态
          setIsLoading(false);
        }
      };

      loadResources();
    });

    // 滚动到页面顶部
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);

  // 创建防抖的滚动监听函数
  const handleScroll = useCallback(() => {
    const currentScrollPosition = window.scrollY;
    setScrollPosition(currentScrollPosition);

    const newScrolledState = currentScrollPosition > 5;
    // 只有状态变化时才更新
    if (isScrolled !== newScrolledState) {
      setIsScrolled(newScrolledState);
    }
  }, [isScrolled]);

  // 设置滚动监听
  useEffect(() => {
    // 初始检查
    handleScroll();

    // 添加事件监听，使用passive优化性能
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // 等待组件挂载完成
  if (!mounted) return null;

  return (
    <ToastProvider>
      <ToastListener />
      <MainContainer>
        {/* 加载指示器 - 使用showLoader状态 */}
        <AnimatePresence>
          {showLoader && (
            <LoadingIndicator
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
              onAnimationComplete={() => {
                loaderAnimationCompleted.current = true;
                if (!isPending && !isLoading) {
                  setShowLoader(false);
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* 头部导航 */}
        <Header scrolled={isScrolled} />

        {/* 主内容区域 - 带动画过渡 */}
        <AnimatePresence mode="wait">
          <Content key={location.pathname} initial="initial" animate="animate" exit="exit" variants={pageTransition}>
            <Outlet />
          </Content>
        </AnimatePresence>

        {/* 页脚 */}
        <Footer />

        {/* 悬浮工具栏 */}
        <FloatingToolbar scrollPosition={scrollPosition} />

        {/* Live2D模型 */}
        <Live2DModel />
      </MainContainer>
    </ToastProvider>
  );
};

export default RootLayout;
