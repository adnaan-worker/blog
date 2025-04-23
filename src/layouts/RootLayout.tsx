import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingToolbar from '../components/FloatingToolbar';
import { ThemeProvider } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

// 定义页面主体样式
const MainContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease;
  position: relative;
  overflow: visible;
  max-width: 100%;
  width: 100%;
`;

// 内容区域样式
const Content = styled(motion.main)`
  flex: 1;
  width: 100%;
  max-width: var(--max-width);
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
    staggerChildren: 0.05
  }
};

/**
 * 根布局组件，提供应用程序的基本结构
 * 包括主题切换、页面过渡和滚动状态监听
 */
const RootLayout = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();

  // 组件挂载处理
  useEffect(() => {
    setMounted(true);
  }, []);

  // 路由切换时滚动到页面顶部并显示加载动画
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

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
    <ThemeProvider>
      <MainContainer>
        {/* 加载指示器 */}
        {isLoading && (
          <LoadingIndicator
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* 头部导航 */}
        <Header scrolled={isScrolled} />
        
        {/* 主内容区域 - 带动画过渡 */}
        <AnimatePresence mode="wait">
          <Content
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Outlet />
          </Content>
        </AnimatePresence>
        
        {/* 页脚 */}
        <Footer />
        
        {/* 悬浮工具栏 */}
        <FloatingToolbar scrollPosition={scrollPosition} />
      </MainContainer>
    </ThemeProvider>
  );
};

export default RootLayout;