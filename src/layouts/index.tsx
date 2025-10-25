import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, Suspense, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';
import Header from './header';
import Footer from './footer';
import FloatingToolbar from './floating-toolbar';
import GhostWidget from './ghost-widget';
import { AnimatePresence, motion } from 'framer-motion';
import { useSystemTheme } from '@/hooks/useSystemTheme';
import PageLoading from '@/components/common/page-loading';
import { setupHttpConfig } from '@/utils/http-config';
import { useAutoConnect } from '@/hooks/useSocket';
import { AppDispatch } from '@/store';
import { API, SiteSettings } from '@/utils/api';

// 创建网站设置Context
const SiteSettingsContext = createContext<{
  siteSettings: SiteSettings | null;
  loading: boolean;
}>({
  siteSettings: null,
  loading: true,
});

// 导出Hook供子组件使用
export const useSiteSettings = () => useContext(SiteSettingsContext);

// 定义页面主体样式
const MainContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
`;

// 内容区域样式 - 完全移除动画，确保DOM立即可见
const Content = styled.main`
  flex: 1;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  overflow: visible;
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height)); /* 确保内容区域始终占据剩余视口高度 */

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

// Suspense 加载占位符 - 确保有最小高度占位
const SuspenseFallback = styled.div`
  min-height: calc(100vh - var(--header-height));
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * 根布局组件，提供应用程序的基本结构
 * 包括页面过渡和滚动状态监听
 */
const RootLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // ✅ 获取 Redux dispatch

  // 网站设置状态
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [siteSettingsLoading, setSiteSettingsLoading] = useState(true);

  // 加载指示器状态
  const [showLoader, setShowLoader] = useState(false);
  const [showPageLoading, setShowPageLoading] = useState(false);
  const previousPathRef = useRef(location.pathname);
  const loaderTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoadRef = useRef(true); // 标记是否是首次加载

  // 监听系统主题变化（自动在 auto 模式下启用）
  useSystemTheme();

  // 自动连接Socket.IO（用于在线人数统计等实时功能）
  useAutoConnect(true);

  // 配置HTTP未授权回调（传入 dispatch 以便清除 Redux 状态）
  useEffect(() => {
    setupHttpConfig(navigate, dispatch);
  }, [navigate, dispatch]);

  // 加载网站设置
  const loadSiteSettings = async () => {
    try {
      setSiteSettingsLoading(true);
      const response = await API.siteSettings.getSiteSettings();
      setSiteSettings(response.data);
    } catch (error) {
      console.error('加载网站设置失败:', error);
      setSiteSettings(null);
    } finally {
      setSiteSettingsLoading(false);
    }
  };

  // 初始化时加载网站设置
  useEffect(() => {
    loadSiteSettings();
  }, []);

  // 标记首次加载完成
  useEffect(() => {
    const timer = setTimeout(() => {
      isFirstLoadRef.current = false;
    }, 500);
    return () => clearTimeout(timer);
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

    // 只有在非首次加载时才显示loading
    if (!isFirstLoadRef.current) {
      // 显示顶部进度条和页面loading
      setShowLoader(true);
      setShowPageLoading(true);

      // 延迟隐藏loading，确保页面已经渲染
      loaderTimerRef.current = setTimeout(() => {
        setShowLoader(false);
        setShowPageLoading(false);
        loaderTimerRef.current = null;
      }, 300);
    }

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

  return (
    <SiteSettingsContext.Provider value={{ siteSettings, loading: siteSettingsLoading }}>
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

        {/* 主内容区域 - 确保有占位内容 */}
        <Suspense
          fallback={
            <Content>
              <SuspenseFallback />
            </Content>
          }
        >
          <Content key={location.pathname}>
            <Outlet />
          </Content>
        </Suspense>

        {/* 页面切换时的全屏loading */}
        {showPageLoading && createPortal(<PageLoading fullScreen variant="pulse" />, document.body)}

        {/* 页脚 */}
        <Footer />

        {/* 悬浮工具栏 */}
        <FloatingToolbar scrollPosition={scrollPosition} />

        {/* 幽灵小部件 */}
        <GhostWidget />
      </MainContainer>
    </SiteSettingsContext.Provider>
  );
};

export default RootLayout;
