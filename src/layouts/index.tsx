import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import styled from '@emotion/styled';
import Header from './header';
import Footer from './footer';
import FloatingToolbar from './floating-toolbar';
import Live2DModel from './live2d-model';
import { AnimatePresence, motion } from 'framer-motion';
import PageLoading from '@/components/common/page-loading';

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
  const [isPending, startTransition] = useTransition();

  // 用于控制加载指示器的完整显示
  const [showLoader, setShowLoader] = useState(false);
  const loaderAnimationCompleted = useRef(false);
  const loaderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 创建一个ref来存储上一次的路径
  const previousPathRef = useRef(location.pathname);

  // 组件挂载处理
  useEffect(() => {
    setMounted(true);
    // 初始化上一次路径
    previousPathRef.current = location.pathname;

    // 初始化时强制触发一次加载指示器，无论当前路径
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, [location.pathname]);

  // 处理加载动画的完整显示
  useEffect(() => {
    // 当实际加载状态变化或路由变化时
    if (isPending || isLoading) {
      // 强制显示加载指示器
      setShowLoader(true);
      loaderAnimationCompleted.current = false;

      // 清除之前的超时
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
        loaderTimeoutRef.current = null;
      }
    } else {
      // 加载完成时，等待动画完成后隐藏
      if (!loaderAnimationCompleted.current) {
        loaderTimeoutRef.current = setTimeout(() => {
          setShowLoader(false);
        }, 500);
      }
    }

    return () => {
      if (loaderTimeoutRef.current) {
        clearTimeout(loaderTimeoutRef.current);
      }
    };
  }, [isPending, isLoading, location.pathname]);

  // 确保路由变化时总是触发加载指示器
  useEffect(() => {
    // 直接设置加载状态，不依赖于isPathChanged
    setShowLoader(true);
    loaderAnimationCompleted.current = false;

    // 设置一个最小显示时间
    const minDisplayTimer = setTimeout(() => {
      if (!isLoading && !isPending) {
        loaderAnimationCompleted.current = true;
        setShowLoader(false);
      }
    }, 500);

    return () => clearTimeout(minDisplayTimer);
  }, [isLoading, isPending, location.pathname]);

  // 路由切换时处理加载状态
  useEffect(() => {
    // 检查路径是否变化
    const isPathChanged = previousPathRef.current !== location.pathname;

    if (isPathChanged) {
      // 设置加载状态
      setIsLoading(true);

      // 最小加载时间
      const minLoadingTime = 800;
      const loadingStartTime = Date.now();

      // 使用 React 18 并发特性处理加载
      startTransition(() => {
        const loadResources = async () => {
          try {
            await Promise.all([
              new Promise<void>((resolve) => {
                if (document.readyState === 'complete') {
                  resolve();
                } else {
                  window.addEventListener('load', () => resolve(), { once: true });
                }
              }),
            ]);
          } finally {
            const elapsedTime = Date.now() - loadingStartTime;
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

            setTimeout(() => {
              setIsLoading(false);
            }, remainingTime);
          }
        };

        loadResources();
      });
    }

    // 更新路径引用
    previousPathRef.current = location.pathname;
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
              // 确保动画完成后，如果加载已结束则隐藏指示器
              if (!isPending && !isLoading) {
                setShowLoader(false);
              }
            }}
          />
        )}
      </AnimatePresence>
      {showLoader && <PageLoading></PageLoading>}
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
  );
};

export default RootLayout;
