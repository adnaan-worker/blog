import React, { useState, useEffect, useCallback, ReactElement } from 'react';
import styled from '@emotion/styled';

// 调试工具容器
const DebugContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  width: 300px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 8px;
  font-size: 12px;
  z-index: 9999;
  max-height: 400px;
  overflow-y: auto;
`;

const DebugItem = styled.div`
  margin-bottom: 5px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
`;

const DebugTitle = styled.div`
  font-weight: bold;
  color: #5183f5;
  margin-bottom: 5px;
`;

// 视口指示器
const ViewportIndicator = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  height: 2px;
  background-color: red;
  z-index: 9998;
  pointer-events: none;
`;

export interface HeadingInfo {
  id: string;
  text: string;
  top: number;
  isVisible: boolean;
}

export interface ViewportInfo {
  scrollY: number;
  viewportTop: number;
  viewportBottom: number;
  headings: HeadingInfo[];
  activeEl: string | null;
}

export interface DebugToolProps {
  viewportInfo: ViewportInfo;
  readingProgress: number;
  toggleDebugInfo: () => void;
}

// 调试工具组件
export const DebugTool = ({ 
  viewportInfo, 
  readingProgress
}: DebugToolProps): ReactElement => {
  return (
    <React.Fragment>
      <DebugContainer>
        <DebugTitle>调试工具 (按Alt+D开关)</DebugTitle>
        <DebugItem>滚动位置: {viewportInfo.scrollY}px</DebugItem>
        <DebugItem>观察区域: {viewportInfo.viewportTop}px → {viewportInfo.viewportBottom}px</DebugItem>
        <DebugItem>阅读进度: {readingProgress}%</DebugItem>
        <DebugItem>
          当前活动标题: <span style={{color: '#ffcc00'}}>{viewportInfo.activeEl || '无'}</span>
        </DebugItem>
        <DebugTitle>标题位置:</DebugTitle>
        {viewportInfo.headings.map(h => (
          <DebugItem key={h.id} style={{color: h.isVisible ? '#4ade80' : 'inherit'}}>
            {h.text.substring(0, 20)}{h.text.length > 20 ? '...' : ''}: {h.top.toFixed(0)}px 
            {h.id === viewportInfo.activeEl && ' ✓'}
          </DebugItem>
        ))}
      </DebugContainer>
      <ViewportIndicator style={{top: `${viewportInfo.viewportTop}px`}} />
    </React.Fragment>
  );
};

// 初始视口信息
export const initialViewportInfo: ViewportInfo = {
  scrollY: 0,
  viewportTop: 0,
  viewportBottom: 0,
  headings: [],
  activeEl: null
};

// 调试工具钩子
export const useDebugTool = () => {
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(initialViewportInfo);
  
  // 切换调试工具显示
  const toggleDebugInfo = useCallback(() => {
    setShowDebugInfo(prev => !prev);
  }, []);
  
  // 键盘快捷键监听 (Alt+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'd') {
        toggleDebugInfo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDebugInfo]);
  
  return {
    showDebugInfo,
    setShowDebugInfo,
    viewportInfo,
    setViewportInfo,
    toggleDebugInfo
  };
};

// 导出命名空间
const debugTools = {
  DebugTool,
  useDebugTool,
  initialViewportInfo
};

export default debugTools; 