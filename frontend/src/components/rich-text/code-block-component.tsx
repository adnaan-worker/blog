import React, { useState, useEffect, useRef } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import styled from '@emotion/styled';
import { FiType, FiCopy, FiCheck } from 'react-icons/fi';
import { SUPPORTED_LANGUAGES } from '@/utils/editor/helpers';
import { useClipboard, useClickOutside } from '@/hooks';
import adnaan from 'adnaan-ui';

const CodeBlockWrapper = styled(NodeViewWrapper)`
  position: relative;
  margin: 1.5rem 0;

  &:hover .code-block-toolbar {
    opacity: 1;
    pointer-events: all;
  }

  &.ProseMirror-selectednode .code-block-toolbar {
    opacity: 1;
    pointer-events: all;
  }
`;

const CodeBlockToolbar = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 10;
`;

const ToolbarButton = styled.button<{ isOpen?: boolean; isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-code, monospace);
  text-transform: uppercase;
  font-weight: 600;

  &:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color);
    color: var(--accent-color);
  }

  ${(props) =>
    props.isOpen &&
    `
    background: var(--accent-color);
    border-color: var(--accent-color);
    color: white;
  `}

  ${(props) =>
    props.isActive &&
    `
    background: #10b981;
    border-color: #10b981;
    color: white;
  `}

  svg {
    font-size: 12px;
  }
`;

const LanguageDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 200;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(var(--text-secondary-rgb, 107, 114, 126), 0.5);
  }

  [data-theme='dark'] & {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
`;

const LanguageDropdownTitle = styled.div`
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
  letter-spacing: 0.5px;
`;

const LanguageMenuItem = styled.div<{ active?: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 13px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-primary)')};

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  }

  &:first-of-type {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-of-type {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }
`;

const StyledPre = styled.pre`
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  margin: 0;
  padding: 1rem !important;
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  position: relative;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-primary);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;

    &:hover {
      background: var(--text-tertiary);
    }
  }

  /* 深色模式 */
  [data-theme='dark'] & {
    background: #1e1e1e !important;
    border-color: #3e3e3e;
  }
`;

interface CodeBlockComponentProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  extension: any;
}

export const CodeBlockComponent: React.FC<CodeBlockComponentProps> = ({ node, updateAttributes, extension }) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const currentLanguage = node.attrs.language || 'text';

  const { copy, copied } = useClipboard({
    timeout: 2000,
    onSuccess: () => {
      adnaan.toast.success('代码已复制到剪贴板');
    },
  });

  // 点击外部关闭菜单
  useClickOutside(menuRef, () => setShowLanguageMenu(false), showLanguageMenu);

  const handleLanguageChange = (language: string) => {
    updateAttributes({ language });
    setShowLanguageMenu(false);
  };

  const handleCopy = () => {
    if (preRef.current) {
      const codeElement = preRef.current.querySelector('code');
      if (codeElement) {
        copy(codeElement.textContent || '');
      }
    }
  };

  return (
    <CodeBlockWrapper>
      <CodeBlockToolbar className="code-block-toolbar">
        <ToolbarButton
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          isActive={copied}
          title={copied ? '已复制' : '复制代码'}
        >
          {copied ? <FiCheck /> : <FiCopy />}
          {copied ? '已复制' : '复制'}
        </ToolbarButton>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <ToolbarButton
            isOpen={showLanguageMenu}
            onClick={(e) => {
              e.stopPropagation();
              setShowLanguageMenu(!showLanguageMenu);
            }}
          >
            <FiType />
            {currentLanguage}
          </ToolbarButton>
          {showLanguageMenu && (
            <LanguageDropdown>
              <LanguageDropdownTitle>选择语言</LanguageDropdownTitle>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <LanguageMenuItem
                  key={lang.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageChange(lang.key);
                  }}
                  active={currentLanguage === lang.key}
                >
                  {lang.name}
                </LanguageMenuItem>
              ))}
            </LanguageDropdown>
          )}
        </div>
      </CodeBlockToolbar>
      <StyledPre ref={preRef}>
        <NodeViewContent as="code" />
      </StyledPre>
    </CodeBlockWrapper>
  );
};
