import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { MdFormatColorText, MdFormatColorFill } from 'react-icons/md';
import { TEXT_COLORS, HIGHLIGHT_COLORS } from '@/utils/editor-helpers';

const ColorPickerDropdown = styled.div`
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

const ColorPickerMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 12px;
  z-index: 200;
  min-width: 240px;

  [data-theme='dark'] & {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
`;

const ColorPickerTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 8px;
  text-transform: uppercase;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
  margin-bottom: 8px;
`;

const ColorOption = styled.div<{ color: string; active?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${(props) => props.color};
  cursor: pointer;
  border: 2px solid ${(props) => (props.active ? 'var(--accent-color)' : 'var(--border-color)')};
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: scale(1.15);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }

  ${(props) =>
    props.active &&
    `
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: ${props.color === '#ffffff' || props.color === '#ffff00' ? '#000' : '#fff'};
      font-size: 12px;
      font-weight: bold;
    }
  `}
`;

const ColorPickerAction = styled.button`
  width: 100%;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-tertiary);
  }
`;

interface ColorPickerProps {
  type: 'text' | 'highlight';
  editor: any;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ type, editor, isOpen, onToggle, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const colors = type === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS;
  const title = type === 'text' ? '文字颜色' : '背景高亮';
  const Icon = type === 'text' ? MdFormatColorText : MdFormatColorFill;

  const currentColor =
    type === 'text' ? editor.getAttributes('textStyle').color : editor.getAttributes('highlight').color;

  const setColor = (color: string) => {
    if (type === 'text') {
      editor.chain().focus().setColor(color).run();
    } else {
      editor.chain().focus().setHighlight({ color }).run();
    }
    onClose();
  };

  const clearColor = () => {
    if (type === 'text') {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().unsetHighlight().run();
    }
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
    <ColorPickerDropdown ref={menuRef}>
      <ToolbarButton onClick={onToggle} active={type === 'highlight' && editor.isActive('highlight')} title={title}>
        <Icon />
      </ToolbarButton>
      {isOpen && (
        <ColorPickerMenu data-color-picker={type === 'text'} data-highlight-picker={type === 'highlight'}>
          <ColorPickerTitle>{title}</ColorPickerTitle>
          <ColorGrid>
            {colors.map((color) => (
              <ColorOption key={color} color={color} onClick={() => setColor(color)} active={currentColor === color} />
            ))}
          </ColorGrid>
          <ColorPickerAction onClick={clearColor}>清除{type === 'text' ? '颜色' : '高亮'}</ColorPickerAction>
        </ColorPickerMenu>
      )}
    </ColorPickerDropdown>
  );
};
