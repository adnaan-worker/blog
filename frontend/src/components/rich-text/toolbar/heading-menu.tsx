import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { FiType } from 'react-icons/fi';

const HeadingDropdown = styled.div`
  position: relative;
`;

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

const HeadingMenuContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  z-index: 200;
  min-width: 160px;

  [data-theme='dark'] & {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
`;

const HeadingItem = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;

  &:hover {
    background: var(--bg-secondary);
  }
`;

interface HeadingMenuProps {
  editor: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const HeadingMenu: React.FC<HeadingMenuProps> = ({ editor, isOpen, onToggle, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor.chain().focus().toggleHeading({ level }).run();
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
    <HeadingDropdown ref={menuRef}>
      <ToolbarButton onClick={onToggle} title="标题">
        <FiType />
      </ToolbarButton>
      {isOpen && (
        <HeadingMenuContainer data-heading-menu>
          <HeadingItem onClick={() => setHeading(2)}>
            <h2 style={{ margin: 0, fontSize: '1.3em' }}>标题 2</h2>
          </HeadingItem>
          <HeadingItem onClick={() => setHeading(3)}>
            <h3 style={{ margin: 0, fontSize: '1.1em' }}>标题 3</h3>
          </HeadingItem>
          <HeadingItem onClick={() => setHeading(4)}>
            <h4 style={{ margin: 0, fontSize: '1em' }}>标题 4</h4>
          </HeadingItem>
          <HeadingItem onClick={() => setHeading(5)}>
            <h5 style={{ margin: 0, fontSize: '0.9em' }}>标题 5</h5>
          </HeadingItem>
          <HeadingItem onClick={() => setHeading(6)}>
            <h6 style={{ margin: 0, fontSize: '0.8em' }}>标题 6</h6>
          </HeadingItem>
          <HeadingItem onClick={() => editor.chain().focus().setParagraph().run()}>正文</HeadingItem>
        </HeadingMenuContainer>
      )}
    </HeadingDropdown>
  );
};
