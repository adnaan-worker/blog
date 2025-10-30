import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { FiType } from 'react-icons/fi';
import { getCurrentCodeBlockLanguage, SUPPORTED_LANGUAGES } from '@/utils/editor-helpers';

const ToolbarButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--text-on-accent)' : 'var(--text-primary)')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LanguageMenuContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
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

const LanguageMenuTitle = styled.div`
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
`;

const LanguageMenuItem = styled.div<{ active?: boolean }>`
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--text-on-accent)' : 'var(--text-primary)')};

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
  }
`;

interface LanguageMenuProps {
  editor: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const LanguageMenu: React.FC<LanguageMenuProps> = ({ editor, isOpen, onToggle, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const currentLanguage = getCurrentCodeBlockLanguage(editor);

  const setCodeBlockLanguage = (language: string) => {
    editor.chain().focus().updateAttributes('codeBlock', { language }).run();
    onClose();
  };

  // 点击外部关闭菜单
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <ToolbarButton
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        title="选择语言"
      >
        <FiType />
      </ToolbarButton>
      {isOpen && (
        <LanguageMenuContainer data-language-menu>
          <LanguageMenuTitle>选择语言</LanguageMenuTitle>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <LanguageMenuItem
              key={lang.key}
              onClick={(e) => {
                e.stopPropagation();
                setCodeBlockLanguage(lang.key);
              }}
              active={currentLanguage === lang.key}
            >
              {lang.name}
            </LanguageMenuItem>
          ))}
        </LanguageMenuContainer>
      )}
    </div>
  );
};
