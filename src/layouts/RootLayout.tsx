import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { css, Global } from '@emotion/react';
import styled from '@emotion/styled';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ThemeProvider } from '../context/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

const globalStyles = css`
  :root {
    --bg-primary: #ffffff;
    --bg-secondary: #f7f9fb;
    --text-primary: #252525;
    --text-secondary: #606060;
    --accent-color: #5183f5;
    --border-color: rgba(0, 0, 0, 0.06);
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
    --font-code: 'OperatorMonoSSmLig Nerd Font', 'Cascadia Code PL', 'FantasqueSansMono Nerd Font', 'operator mono', 'JetBrainsMono', 'Fira code Retina', 'Fira code', 'Consolas', 'Monaco', 'Hannotate SC', monospace, -apple-system;
    --max-width: 1120px;
    --header-height: 60px;
    --card-shadow: 0 8px 30px rgba(81, 131, 245, 0.08);
    --transition-normal: all 0.25s cubic-bezier(.4,0,.2,1);
  }

  /* 自定义滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(81, 131, 245, 0.2);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(81, 131, 245, 0.6);
  }
  
  /* 火狐浏览器滚动条 */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(81, 131, 245, 0.2) transparent;
  }
  
  /* 深色模式滚动条 */
  [data-theme='dark'] ::-webkit-scrollbar-thumb {
    background: rgba(81, 131, 245, 0.3);
  }
  
  [data-theme='dark'] ::-webkit-scrollbar-thumb:hover {
    background: rgba(81, 131, 245, 0.7);
  }
  
  [data-theme='dark'] * {
    scrollbar-color: rgba(81, 131, 245, 0.3) transparent;
  }
  
  /*3D卡片 */
  .card-container {
    perspective: 1000px;
  }
  
  .card-face {
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  .card-back {
    transform: rotateY(180deg);
  }

  [data-theme='dark'] {
    --bg-primary: #121212;
    --bg-secondary: #181818;
    --text-primary: #f0f0f0;
    --text-secondary: #a0a0a0;
    --accent-color: #5183f5;
    --border-color: rgba(255, 255, 255, 0.08);
    --card-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  }

  .theme-transition {
    transition: color 0.3s ease, 
                background-color 0.3s ease, 
                border-color 0.3s ease, 
                box-shadow 0.3s ease;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    scrollbar-width: thin;
    scrollbar-color: rgba(81, 131, 245, 0.2) transparent;
  }

  html,
  body {
    font-family: var(--font-sans);
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 15px;
    line-height: 1.6;
    font-weight: 400;
    scroll-behavior: smooth;
    letter-spacing: -0.01em;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  code, pre, .code {
    font-family: var(--font-code);
  }

  body {
    position: relative;
    height: auto;
  }

  #root {
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  a {
    color: var(--accent-color);
    text-decoration: none;
    transition: var(--transition-normal);
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  
  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: var(--font-sans);
    font-size: 0.95rem;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.3;
    margin-bottom: 1rem;
    color: var(--text-primary);
    letter-spacing: -0.01em;
  }
  
  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  h2 {
    font-size: 1.75rem;
    letter-spacing: -0.02em;
  }
  
  h3 {
    font-size: 1.35rem;
  }
  
  p {
    line-height: 1.7;
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }
  
  ::selection {
    background: rgba(81, 131, 245, 0.2);
    color: var(--accent-color);
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: rgba(81, 131, 245, 0.2);
    border-radius: 10px;
    transition: all 0.3s ease;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: rgba(81, 131, 245, 0.6);
  }
  
  [data-theme='dark'] ::-webkit-scrollbar-thumb {
    background: rgba(81, 131, 245, 0.3);
  }
  
  [data-theme='dark'] ::-webkit-scrollbar-thumb:hover {
    background: rgba(81, 131, 245, 0.7);
  }
  
  [data-theme='dark'] * {
    scrollbar-color: rgba(81, 131, 245, 0.3) transparent;
  }
  
  .page-transition-enter {
    opacity: 0;
    transform: translateY(10px);
  }
  
  .page-transition-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 0.3s, transform 0.3s;
  }
  
  .page-transition-exit {
    opacity: 1;
    transform: translateY(0);
  }
  
  .page-transition-exit-active {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s, transform 0.3s;
  }
`;

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

const LoadingIndicator = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: var(--accent-color);
  z-index: 1000;
`;

const RootLayout = () => {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // 基础功能：组件挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 导航变化时的加载状态
  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 滚动监听 - 优化防抖处理
  useEffect(() => {
    let timeoutId: number | null = null;
    
    function onScroll() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      // 添加10ms防抖，减少状态更新频率
      timeoutId = window.setTimeout(() => {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const newScrolledState = scrollPosition > 5;
        
        // 只有状态变化时才更新
        if (isScrolled !== newScrolledState) {
          setIsScrolled(newScrolledState);
          console.log(`滚动状态变化: ${newScrolledState}, 位置: ${scrollPosition}px`);
        }
      }, 10);
    }
    
    // 初始检查
    onScroll();
    
    // 添加事件监听，使用passive优化性能
    window.addEventListener('scroll', onScroll, { passive: true });
    
    // 清理函数
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [isScrolled]);

  if (!mounted) return null;

  return (
    <>
    {/* 添加全局滚动条样式 */}
    <Global styles={globalStyles} />
    <ThemeProvider>
      <Global styles={globalStyles} />
      <MainContainer>
        {isLoading && (
          <LoadingIndicator
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        )}
        <Header scrolled={isScrolled} />
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
        <Footer />
      </MainContainer>
    </ThemeProvider>
    </>
  );
};

export default RootLayout;