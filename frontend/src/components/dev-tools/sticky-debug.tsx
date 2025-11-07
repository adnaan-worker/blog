import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from '@emotion/styled';

// 调试面板样式
const DebugPanel = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  max-height: 500px;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.9);
  color: #0f0;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-y: auto;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(81, 131, 245, 0.5);
    border-radius: 3px;
  }
`;

const DebugHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #5183f5;
`;

const DebugTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  color: #5183f5;
  font-weight: bold;
`;

const CloseButton = styled.button`
  background: #f44336;
  border: none;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s;

  &:hover {
    background: #d32f2f;
    transform: scale(1.1);
  }
`;

const Section = styled.div`
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  border-left: 3px solid #5183f5;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  color: #ffc107;
  margin-bottom: 0.5rem;
  font-size: 13px;
`;

const InfoRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: 0.25rem 0;
  color: ${(props) => (props.highlight ? '#4caf50' : '#0f0')};
  font-size: 11px;

  .label {
    color: #aaa;
  }

  .value {
    font-weight: bold;
    color: inherit;
  }
`;

const StatusBadge = styled.span<{ status: 'success' | 'error' | 'warning' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: bold;
  background: ${(props) => (props.status === 'success' ? '#4caf50' : props.status === 'error' ? '#f44336' : '#ff9800')};
  color: white;
`;

const IssueItem = styled.div`
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(244, 67, 54, 0.1);
  border-left: 3px solid #f44336;
  border-radius: 3px;
`;

const IssueTag = styled.div`
  color: #ff9800;
  font-weight: bold;
  margin-bottom: 0.25rem;
  font-size: 11px;
`;

const IssueDetail = styled.div`
  color: #f44336;
  font-size: 10px;
  margin-left: 0.5rem;
`;

interface StickyDebugInfo {
  sidebar: {
    position: string;
    top: string;
    display: string;
    alignSelf: string;
    transform: string;
  };
  rect: {
    top: string;
    expectedTop: number;
    isSticky: boolean;
  };
  scroll: string;
  problematicParents: Array<{
    tag: string;
    class: string;
    issues: string[];
  }>;
}

interface StickyDebuggerProps {
  sidebarSelector?: string;
  show?: boolean; // 外部控制显示状态
  onClose?: () => void; // 关闭回调
}

export const StickyDebugger: React.FC<StickyDebuggerProps> = ({
  sidebarSelector = '[class*="ArticleSidebar"]',
  show: externalShow,
  onClose,
}) => {
  const [debugInfo, setDebugInfo] = useState<StickyDebugInfo | null>(null);
  const [error, setError] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // 只在开发环境启用
  const isDevelopment = import.meta.env.DEV;

  // 使用外部控制的显示状态，如果没有提供则使用内部状态
  const [internalShow, setInternalShow] = useState(false);
  const show = externalShow !== undefined ? externalShow : internalShow;

  const checkSticky = useCallback(() => {
    try {
      const sidebar = document.querySelector(sidebarSelector);
      if (!sidebar) {
        setError('找不到侧边栏元素');
        return;
      }

      setError('');
      const sidebarStyle = window.getComputedStyle(sidebar);
      const rect = sidebar.getBoundingClientRect();

      // 检查所有父元素
      const problematicParents: Array<{
        tag: string;
        class: string;
        issues: string[];
      }> = [];
      let element: HTMLElement | null = sidebar as HTMLElement;

      while (element?.parentElement) {
        element = element.parentElement;
        const style = window.getComputedStyle(element);
        const issues: string[] = [];

        if (style.transform !== 'none') {
          issues.push(`❌ transform: ${style.transform.substring(0, 30)}...`);
        }
        if (style.overflow === 'hidden' || style.overflow === 'clip') {
          issues.push(`❌ overflow: ${style.overflow}`);
        }
        if (style.overflowY === 'hidden' || style.overflowY === 'clip') {
          issues.push(`❌ overflow-y: ${style.overflowY}`);
        }
        if (style.contain?.includes('paint') || style.contain?.includes('layout')) {
          issues.push(`❌ contain: ${style.contain}`);
        }

        if (issues.length > 0) {
          problematicParents.push({
            tag: element.tagName,
            class: element.className.substring(0, 40),
            issues,
          });
        }

        if (problematicParents.length > 8) break;
      }

      setDebugInfo({
        sidebar: {
          position: sidebarStyle.position,
          top: sidebarStyle.top,
          display: sidebarStyle.display,
          alignSelf: sidebarStyle.alignSelf,
          transform: sidebarStyle.transform,
        },
        rect: {
          top: rect.top.toFixed(2),
          expectedTop: 20, // 现在是相对于PageWrapper
          isSticky: Math.abs(rect.top - 20) < 5 && window.scrollY > 200,
        },
        scroll: window.scrollY.toFixed(0),
        problematicParents,
      });
    } catch (err) {
      setError(`错误: ${err}`);
    }
  }, [sidebarSelector]);

  // 键盘快捷键 Alt+S 切换显示（仅在非受控模式下）
  useEffect(() => {
    if (!isDevelopment || externalShow !== undefined) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        setInternalShow((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevelopment, externalShow]);

  // 只在显示时才启动监听
  useEffect(() => {
    if (!show || !isDevelopment) return;

    checkSticky();
    intervalRef.current = setInterval(checkSticky, 500);
    window.addEventListener('scroll', checkSticky, { passive: true });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener('scroll', checkSticky);
    };
  }, [checkSticky, show, isDevelopment]);

  // 非开发环境不显示
  if (!isDevelopment) return null;

  // 开发环境但未激活时不显示任何提示
  if (!show) return null;

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalShow(false);
    }
  };

  return (
    <DebugPanel>
      <DebugHeader>
        <DebugTitle>Sticky 调试器 (按Alt+S开关)</DebugTitle>
        <CloseButton onClick={handleClose}>×</CloseButton>
      </DebugHeader>

      {error && (
        <Section>
          <StatusBadge status="error">错误</StatusBadge>
          <div style={{ color: '#f44336', marginTop: '0.5rem', fontSize: '11px' }}>{error}</div>
        </Section>
      )}

      {debugInfo && (
        <>
          <Section>
            <SectionTitle>侧边栏样式</SectionTitle>
            <InfoRow highlight={debugInfo.sidebar.position === 'sticky'}>
              <span className="label">position:</span>
              <span className="value">{debugInfo.sidebar.position}</span>
            </InfoRow>
            <InfoRow>
              <span className="label">top:</span>
              <span className="value">{debugInfo.sidebar.top}</span>
            </InfoRow>
            <InfoRow>
              <span className="label">transform:</span>
              <span className="value">{debugInfo.sidebar.transform}</span>
            </InfoRow>
            <InfoRow>
              <span className="label">alignSelf:</span>
              <span className="value">{debugInfo.sidebar.alignSelf}</span>
            </InfoRow>
          </Section>

          <Section>
            <SectionTitle>位置状态</SectionTitle>
            <InfoRow>
              <span className="label">当前Top:</span>
              <span className="value">{debugInfo.rect.top}px</span>
            </InfoRow>
            <InfoRow>
              <span className="label">期望Top:</span>
              <span className="value">{debugInfo.rect.expectedTop}px</span>
            </InfoRow>
            <InfoRow>
              <span className="label">滚动位置:</span>
              <span className="value">{debugInfo.scroll}px</span>
            </InfoRow>
            <InfoRow highlight={debugInfo.rect.isSticky}>
              <span className="label">是否吸顶:</span>
              <StatusBadge status={debugInfo.rect.isSticky ? 'success' : 'error'}>
                {debugInfo.rect.isSticky ? '✓ 是' : '✗ 否'}
              </StatusBadge>
            </InfoRow>
          </Section>

          {debugInfo.problematicParents.length > 0 ? (
            <Section>
              <SectionTitle>⚠️ 问题父元素</SectionTitle>
              {debugInfo.problematicParents.map((parent, i) => (
                <IssueItem key={i}>
                  <IssueTag>
                    {parent.tag}.{parent.class}
                  </IssueTag>
                  {parent.issues.map((issue, j) => (
                    <IssueDetail key={j}>{issue}</IssueDetail>
                  ))}
                </IssueItem>
              ))}
            </Section>
          ) : (
            <Section>
              <StatusBadge status="success">✓ 未发现CSS问题</StatusBadge>
            </Section>
          )}
        </>
      )}
    </DebugPanel>
  );
};

/**
 * Sticky 调试工具 Hook
 * 用法：const { showStickyDebug, toggleStickyDebug } = useStickyDebug();
 *
 * 快捷键：Alt+S 切换显示/隐藏
 *
 * 注意：只在开发环境生效
 */
export const useStickyDebug = () => {
  const [showStickyDebug, setShowStickyDebug] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  const toggleStickyDebug = useCallback(() => {
    if (isDevelopment) {
      setShowStickyDebug((prev) => !prev);
    }
  }, [isDevelopment]);

  // 键盘快捷键监听
  useEffect(() => {
    if (!isDevelopment) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        toggleStickyDebug();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevelopment, toggleStickyDebug]);

  return {
    showStickyDebug,
    setShowStickyDebug,
    toggleStickyDebug,
    isDevelopment,
  };
};

export default StickyDebugger;
