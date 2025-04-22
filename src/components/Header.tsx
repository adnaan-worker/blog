import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { css, Global } from '@emotion/react';

// 定义Header组件的props接口
interface HeaderProps {
  scrolled?: boolean;
}

// 使用motion组件增强
const MotionNav = motion.nav;
const MotionDiv = motion.div;

// 添加全局CSS样式，不依赖组件样式
const headerStyles = css`
  /* 通用样式 */
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    height: 60px;
    transition: all 0.3s cubic-bezier(.4,0,.2,1);
    border-radius: 0 0 24px 24px;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(32px);
    box-shadow: 0 6px 32px 0 rgba(81,131,245,0.10);
  }
  
  /* 暗色主题通用样式 */
  [data-theme='dark'] .header {
    background: rgba(18,18,18,0.85);
    box-shadow: 0 6px 32px 0 rgba(81,131,245,0.18);
  }
  
  /* 滚动状态样式 */
  .header.scrolled {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(20px);
    box-shadow: 0 6px 20px 0 rgba(81,131,245,0.08);
  }
  
  /* 暗色主题滚动状态 */
  [data-theme='dark'] .header.scrolled {
    background: rgba(18,18,18,0.92);
    backdrop-filter: blur(20px);
    box-shadow: 0 6px 20px 0 rgba(81,131,245,0.14);
  }
  
  /* 导航卡片样式 */
  .nav-card {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 28px;
    padding: 0.3rem 1.25rem;
    height: 44px;
    transition: all 0.3s cubic-bezier(.4,0,.2,1);
    position: relative;
    z-index: 60;
    
    /* 默认状态 */
    background: rgba(255,255,255,0.98);
    box-shadow: 0 8px 24px 0 rgba(81,131,245,0.08);
    border: 1px solid rgba(0,0,0,0.04);
    backdrop-filter: blur(16px);
  }
  
  /* 导航卡片暗色主题 */
  [data-theme='dark'] .nav-card {
    background: rgba(30,30,30,0.98);
    box-shadow: 0 8px 24px 0 rgba(81,131,245,0.12);
    border: 1px solid rgba(255,255,255,0.08);
  }
  
  /* 滚动状态导航卡片 */
  .header.scrolled .nav-card {
    background: transparent;
    box-shadow: none;
    border: none;
    backdrop-filter: none;
  }
  
  /* 暗色主题滚动状态导航卡片 */
  [data-theme='dark'] .header.scrolled .nav-card {
    background: transparent;
    box-shadow: none;
    border: none;
    backdrop-filter: none;
  }
  
  @media (max-width: 768px) {
    .nav-card {
      display: none;
    }
  }
`;

// 基础样式组件，不包含任何状态相关样式
const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.7rem;
  height: 60px;
  
  a {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    color: var(--text-primary);
    height: 60px;
  }
  
  img {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid transparent;
    transition: border-color 0.3s ease, transform 0.3s ease;
  }
  
  &:hover img {
    border-color: var(--accent-color);
    transform: scale(1.05);
  }
`;

// 动态导航栏
const Nav = styled(MotionNav)<{ isOpen: boolean }>`
  height: 100%;
  display: flex;
  align-items: center;
  gap: 0.05rem;
  position: relative;
  z-index: 10;
  
  @media (max-width: 768px) {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    bottom: 0;
    flex-direction: column;
    justify-content: flex-start;
    padding-top: 2.5rem;
    background-color: var(--bg-primary);
    z-index: 91;
    border-radius: 0 0 24px 24px;
    gap: 1.6rem;
    pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  }
`;

// 导航链接
const NavLink = styled(Link)<{ active: string }>`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 1.2rem;
  margin: 0 0.1rem;
  font-weight: ${({ active }) => (active === "true" ? "600" : "500")};
  color: ${({ active }) => (active === "true" ? "var(--text-primary)" : "var(--text-secondary)")};
  text-decoration: none;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  border-radius: 10px;
  background: transparent;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: ${({ active }) => (active === "true" ? "2rem" : "0")};
    height: 2px;
    background-color: var(--accent-color);
    transform: translateX(-50%);
    transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: ${({ active }) => (active === "true" ? "1" : "0")};
    border-radius: 3px;
  }

  &:hover {
    color: var(--text-primary);
    position: relative;
    z-index: 1;
    
    .bg-effect {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 140%;
      height: 100%;
      background: radial-gradient(
        ellipse 70% 100% at 50% 50%,
        rgba(81, 131, 245, 0.25) 0%,
        rgba(81, 131, 245, 0.16) 30%,
        rgba(81, 131, 245, 0.08) 60%,
        rgba(81, 131, 245, 0) 100%
      );
      z-index: -1;
      border-radius: 10px;
    }
  }
  
  &:active {
    background: rgba(81,131,245,0.15);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.5rem;
    width: 85%;
    justify-content: center;
    
    &::after {
      bottom: -4px;
    }
    
    &:hover::before {
      width: 110%;
      border-radius: 12px;
    }
  }
`;

const ThemeToggle = styled(motion.button)`
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  margin-left: 0.2rem;
  
  &:hover {
    background-color: rgba(81, 131, 245, 0.08);
    color: var(--accent-color);
  }
`;

const MenuButton = styled(motion.button)`
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  font-size: 1.5rem;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// 首先声明下拉菜单组件
const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  transform-origin: top center;
  width: 150px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  padding: 0.35rem;
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
  margin-top: 0;
  
  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 0;
    width: 100%;
    height: 8px;
    background: transparent;
  }
  
  [data-theme='dark'] & {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

// 下拉菜单容器
const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
  height: 100%;
  display: flex;
  align-items: center;
  z-index: 20;
  
  &:hover ${DropdownMenu}, ${DropdownMenu}:hover {
    opacity: 1;
    transform: translateX(-50%) scale(1);
    pointer-events: auto;
    transition-delay: 0.1s;
  }
`;

// 下拉菜单按钮
const DropdownButton = styled(motion.button)<{ active?: string }>`
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 1.2rem;
  margin: 0 0.1rem;
  font-weight: ${({ active }) => (active === "true" ? "600" : "500")};
  color: ${({ active }) => active === "true" ? 'var(--text-primary)' : 'var(--text-secondary)'};
  cursor: pointer;
  font-size: 0.9rem;
  letter-spacing: 0.3px;
  background: transparent;
  border: none;
  border-radius: 10px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  
  &::before {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 100%;
    height: 8px;
    background: transparent;
    opacity: 0;
    pointer-events: none;
    z-index: 51;
  }
  
  &:hover::before {
    opacity: 1;
    pointer-events: auto;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    width: ${({ active }) => (active === "true" ? "2rem" : "0")};
    height: 2px;
    background-color: var(--accent-color);
    transform: translateX(-50%);
    transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: ${({ active }) => (active === "true" ? "1" : "0")};
    border-radius: 3px;
  }
  
  &:hover {
    color: var(--text-primary);
    position: relative;
    z-index: 1;
    
    .bg-effect {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 140%;
      height: 100%;
      background: radial-gradient(
        ellipse 70% 100% at 50% 50%,
        rgba(81, 131, 245, 0.25) 0%,
        rgba(81, 131, 245, 0.16) 30%,
        rgba(81, 131, 245, 0.08) 60%,
        rgba(81, 131, 245, 0) 100%
      );
      z-index: -1;
      border-radius: 10px;
    }
  }
  
  &:active {
    background: rgba(81,131,245,0.15);
  }
`;

// 下拉菜单项
const DropdownItem = styled(motion(Link))`
  display: block;
  padding: 0.6rem 0.8rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 400;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
  border-radius: 6px;
  margin: 0.15rem 0;
  
  &:hover {
    background: rgba(81,131,245,0.08);
    color: var(--accent-color);
    box-shadow: inset 0 0 0 1px rgba(81,131,245,0.2);
  }
`;

// 头像样式
const Avatar = styled(motion.div)`
  position: relative;
  margin-left: 1rem;
  display: flex;
  align-items: center;
  height: 60px;
  
  img {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    cursor: pointer;
    border: 2px solid transparent;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }
  
  &:hover img {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 4px rgba(81, 131, 245, 0.08);
    transform: scale(1.05);
  }
`;

// 移动端菜单样式
const MobileNavOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 90;
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

// 移动端菜单容器
const MobileNav = styled(MotionNav)<{ isOpen: boolean }>`
  position: fixed;
  top: var(--header-height);
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 2.5rem;
  background-color: var(--bg-primary);
  z-index: 91;
  border-radius: 0 0 24px 24px;
  gap: 1.6rem;
  overflow-y: auto;
  align-items: center;
  
  a {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    width: 85%;
    justify-content: center;
    border-radius: 12px;
    position: relative;
    
    &::after {
      bottom: -6px;
      height: 3px;
      width: 0;
    }
    
    &:hover {
      position: relative;
      z-index: 1;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 110%;
        height: 100%;
        background: radial-gradient(
          ellipse 70% 100% at 50% 50%,
          rgba(81, 131, 245, 0.25) 0%,
          rgba(81, 131, 245, 0.16) 30%,
          rgba(81, 131, 245, 0.08) 60%,
          rgba(81, 131, 245, 0) 100%
        );
        z-index: -1;
        border-radius: 12px;
      }
    }
    
    &[active="true"]::after {
      width: 30%;
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

// 移动端菜单动画变体
const mobileNavVariants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

/**
 * Header组件 - 使用原生CSS变量和类名控制动态样式
 */
const Header = ({ scrolled = false }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const headerRef = useRef<HTMLDivElement>(null);

  // 不再需要监听滚动，直接使用传入的scrolled属性
  // 只在组件挂载时执行一次console.log，用于调试
  useEffect(() => {
    console.log('Header组件已挂载, scrolled状态:', scrolled);
  }, []);

  // 当scrolled属性变化时执行
  useEffect(() => {
    const header = document.querySelector('.header');
    if (!header) {
      console.error('未找到.header元素');
      return;
    }

    // 直接根据props添加/移除类名
    if (scrolled) {
      header.classList.add('scrolled');
      console.log('添加scrolled类 - 来自父组件的状态');
    } else {
      header.classList.remove('scrolled');
      console.log('移除scrolled类 - 来自父组件的状态');
    }
  }, [scrolled]);

  // 检测当前路径是否属于某一类别
  const isWenGaoActive = location.pathname.startsWith('/category') || location.pathname.startsWith('/notes') || location.pathname.startsWith('/timeline') || location.pathname.startsWith('/thoughts');
  const isMoreActive = location.pathname === '/about' || location.pathname === '/history' || location.pathname === '/projects' || location.pathname === '/design' || location.pathname === '/code';

  // 关闭移动端菜单
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // 移动端菜单打开时禁止滚动
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* 添加全局CSS样式 */}
      <Global styles={headerStyles} />
      
      {/* 使用class而不是styled-components动态属性 */}
      <div className={`header ${scrolled ? 'scrolled' : ''}`} ref={headerRef}>
        <HeaderContent>
          {/* 左侧Logo */}
          <Logo>
            <Link to="/">
              <img src="https://foruda.gitee.com/avatar/1715931924378943527/5352827_adnaan_1715931924.png!avatar200" alt="Logo" />
              <span>adnaan</span>
            </Link>
          </Logo>
          
          {/* 中间导航栏 - 使用原生CSS类名 */}
          <MotionDiv
            className="nav-card"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Nav isOpen={isMenuOpen}>
              <NavLink to="/" active={location.pathname === '/' ? "true" : "false"}>
                首页
                <span className="bg-effect"></span>
              </NavLink>
              
              <DropdownContainer>
                <DropdownButton 
                  active={isWenGaoActive ? "true" : "false"}
                  whileTap={{ scale: 0.97 }}
                >
                  文稿
                  <span className="bg-effect"></span>
                </DropdownButton>
                
                <DropdownMenu>
                  <DropdownItem to="/category" whileHover={{ x: 2 }}>分类</DropdownItem>
                  <DropdownItem to="/notes" whileHover={{ x: 2 }}>笔记</DropdownItem>
                  <DropdownItem to="/timeline" whileHover={{ x: 2 }}>时光</DropdownItem>
                  <DropdownItem to="/thoughts" whileHover={{ x: 2 }}>思考</DropdownItem>
                </DropdownMenu>
              </DropdownContainer>
              
              <NavLink to="/notes" active={location.pathname === '/notes' ? "true" : "false"}>
                手记
                <span className="bg-effect"></span>
              </NavLink>
              <NavLink to="/timeline" active={location.pathname === '/timeline' ? "true" : "false"}>
                时光
                <span className="bg-effect"></span>
              </NavLink>
              <NavLink to="/thoughts" active={location.pathname === '/thoughts' ? "true" : "false"}>
                思考
                <span className="bg-effect"></span>
              </NavLink>
              
              <DropdownContainer>
                <DropdownButton 
                  active={isMoreActive ? "true" : "false"}
                  whileTap={{ scale: 0.97 }}
                >
                  更多
                  <span className="bg-effect"></span>
                </DropdownButton>
                
                <DropdownMenu>
                  <DropdownItem to="/about" whileHover={{ x: 2 }}>关于</DropdownItem>
                  <DropdownItem to="/history" whileHover={{ x: 2 }}>经历</DropdownItem>
                  <DropdownItem to="/projects" whileHover={{ x: 2 }}>技术</DropdownItem>
                  <DropdownItem to="/design" whileHover={{ x: 2 }}>设计交互学</DropdownItem>
                  <DropdownItem to="/code" whileHover={{ x: 2 }}>开发者字体</DropdownItem>
                </DropdownMenu>
              </DropdownContainer>
            </Nav>
          </MotionDiv>
          
          {/* 右侧主题切换和头像 */}
          <div style={{display:'flex',alignItems:'center',height:'60px'}}>
            <ThemeToggle 
              onClick={toggleTheme} 
              aria-label="切换主题"
              whileHover={{ rotate: 15, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </ThemeToggle>
            
            <Avatar
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src="https://foruda.gitee.com/avatar/1715931924378943527/5352827_adnaan_1715931924.png!avatar200" alt="用户头像" />
            </Avatar>
          </div>
          
          {/* 移动端菜单按钮 */}
          <MenuButton 
            onClick={toggleMenu}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </MenuButton>
          
          {/* 移动端导航菜单 - 使用背景遮罩 */}
          <AnimatePresence>
            {isMenuOpen && (
              <MobileNavOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
              />
            )}
          </AnimatePresence>
          
          {/* 移动端导航菜单 */}
          <AnimatePresence>
            {isMenuOpen && (
              <MobileNav 
                isOpen={isMenuOpen}
                initial="closed"
                animate="open"
                exit="closed"
                variants={mobileNavVariants}
              >
                <NavLink to="/" active={location.pathname === '/' ? "true" : "false"}>
                  首页
                  <span className="bg-effect"></span>
                </NavLink>
                <NavLink to="/category" active={location.pathname.startsWith('/category') ? "true" : "false"}>
                  分类
                  <span className="bg-effect"></span>
                </NavLink>
                <NavLink to="/notes" active={location.pathname === '/notes' ? "true" : "false"}>
                  笔记
                  <span className="bg-effect"></span>
                </NavLink>
                <NavLink to="/timeline" active={location.pathname === '/timeline' ? "true" : "false"}>
                  时光
                  <span className="bg-effect"></span>
                </NavLink>
                <NavLink to="/thoughts" active={location.pathname === '/thoughts' ? "true" : "false"}>
                  思考
                  <span className="bg-effect"></span>
                </NavLink>
                <NavLink to="/about" active={location.pathname === '/about' ? "true" : "false"}>
                  关于
                  <span className="bg-effect"></span>
                </NavLink>
                <NavLink to="/projects" active={location.pathname === '/projects' ? "true" : "false"}>
                  项目
                  <span className="bg-effect"></span>
                </NavLink>
                <NavLink to="/code" active={location.pathname === '/code' ? "true" : "false"}>
                  开发者字体
                  <span className="bg-effect"></span>
                </NavLink>
              </MobileNav>
            )}
          </AnimatePresence>
        </HeaderContent>
      </div>
    </>
  );
};

export default Header;