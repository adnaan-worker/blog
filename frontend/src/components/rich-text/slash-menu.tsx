/**
 * 斜杠命令菜单 - 类似飞书/语雀的命令面板
 */
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import styled from '@emotion/styled';
import { Editor } from '@tiptap/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiType,
  FiList,
  FiCheckSquare,
  FiCode,
  FiMessageSquare,
  FiMinus,
  FiImage,
  FiLink,
  FiGrid,
  FiHash,
} from 'react-icons/fi';

interface CommandItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  keywords: string[];
  action: (editor: Editor) => void;
}

interface SlashMenuProps {
  editor: Editor;
  isOpen: boolean;
  position: { top: number; left: number };
  searchQuery: string;
  onSelect: (command: () => void) => void;
  onClose: () => void;
  onImageClick: () => void;
  onLinkClick: () => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  editor,
  isOpen,
  position,
  searchQuery,
  onSelect,
  onClose,
  onImageClick,
  onLinkClick,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 命令列表
  const commands: CommandItem[] = useMemo(
    () => [
      // 文本
      {
        id: 'text',
        title: '正文',
        description: '普通段落文本',
        icon: <FiType />,
        category: '基础',
        keywords: ['text', 'paragraph', '正文', '段落', 'p'],
        action: (editor) => editor.chain().focus().setParagraph().run(),
      },
      // 标题
      {
        id: 'h1',
        title: '标题 1',
        description: '大标题',
        icon: <HeadingIcon level={1} />,
        category: '标题',
        keywords: ['heading', 'h1', '标题', '大标题', '#'],
        action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        id: 'h2',
        title: '标题 2',
        description: '中标题',
        icon: <HeadingIcon level={2} />,
        category: '标题',
        keywords: ['heading', 'h2', '标题', '中标题', '##'],
        action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        id: 'h3',
        title: '标题 3',
        description: '小标题',
        icon: <HeadingIcon level={3} />,
        category: '标题',
        keywords: ['heading', 'h3', '标题', '小标题', '###'],
        action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      // 列表
      {
        id: 'bullet',
        title: '无序列表',
        description: '使用项目符号创建列表',
        icon: <FiList />,
        category: '列表',
        keywords: ['bullet', 'list', '无序', '列表', 'ul', '-'],
        action: (editor) => editor.chain().focus().toggleBulletList().run(),
      },
      {
        id: 'ordered',
        title: '有序列表',
        description: '使用数字创建列表',
        icon: <OrderedListIcon />,
        category: '列表',
        keywords: ['ordered', 'number', 'list', '有序', '列表', 'ol', '1.'],
        action: (editor) => editor.chain().focus().toggleOrderedList().run(),
      },
      {
        id: 'task',
        title: '待办列表',
        description: '创建可勾选的任务列表',
        icon: <FiCheckSquare />,
        category: '列表',
        keywords: ['task', 'todo', 'checkbox', '任务', '待办', '[]'],
        action: (editor) => editor.chain().focus().toggleTaskList().run(),
      },
      // 高级块
      {
        id: 'code',
        title: '代码块',
        description: '插入代码片段',
        icon: <FiCode />,
        category: '高级',
        keywords: ['code', 'block', '代码', '```'],
        action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: 'quote',
        title: '引用',
        description: '插入引用块',
        icon: <FiMessageSquare />,
        category: '高级',
        keywords: ['quote', 'blockquote', '引用', '>'],
        action: (editor) => editor.chain().focus().toggleBlockquote().run(),
      },
      {
        id: 'table',
        title: '表格',
        description: '插入 3x3 表格',
        icon: <FiGrid />,
        category: '高级',
        keywords: ['table', '表格'],
        action: (editor) =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      },
      {
        id: 'divider',
        title: '分割线',
        description: '插入水平分割线',
        icon: <FiMinus />,
        category: '高级',
        keywords: ['divider', 'hr', 'line', '分割线', '---'],
        action: (editor) => editor.chain().focus().setHorizontalRule().run(),
      },
      // 媒体
      {
        id: 'image',
        title: '图片',
        description: '上传或嵌入图片',
        icon: <FiImage />,
        category: '媒体',
        keywords: ['image', 'picture', '图片', 'img'],
        action: () => onImageClick(),
      },
      {
        id: 'link',
        title: '链接',
        description: '插入网页链接',
        icon: <FiLink />,
        category: '媒体',
        keywords: ['link', 'url', '链接'],
        action: () => onLinkClick(),
      },
    ],
    [onImageClick, onLinkClick],
  );

  // 过滤命令
  const filteredCommands = useMemo(() => {
    if (!searchQuery) return commands;
    const query = searchQuery.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(query)),
    );
  }, [commands, searchQuery]);

  // 按分类分组
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    const categoryOrder = ['基础', '标题', '列表', '高级', '媒体'];

    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });

    // 按顺序返回
    const ordered: Record<string, CommandItem[]> = {};
    categoryOrder.forEach((cat) => {
      if (groups[cat]) {
        ordered[cat] = groups[cat];
      }
    });
    return ordered;
  }, [filteredCommands]);

  // 重置选中
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // 滚动到选中项
  useEffect(() => {
    const item = itemRefs.current[selectedIndex];
    if (item) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 键盘导航
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  const executeCommand = useCallback(
    (cmd: CommandItem) => {
      onSelect(() => cmd.action(editor));
    },
    [editor, onSelect],
  );

  if (!isOpen) return null;

  let itemIndex = 0;

  return (
    <AnimatePresence>
      <MenuContainer
        ref={menuRef}
        style={{ top: position.top, left: position.left }}
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.15 }}
      >
        {filteredCommands.length > 0 ? (
          Object.entries(groupedCommands).map(([category, items]) => (
            <CategoryGroup key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              {items.map((cmd) => {
                const currentIndex = itemIndex++;
                return (
                  <MenuItem
                    key={cmd.id}
                    ref={(el) => {
                      itemRefs.current[currentIndex] = el;
                    }}
                    selected={currentIndex === selectedIndex}
                    onClick={() => executeCommand(cmd)}
                    onMouseEnter={() => setSelectedIndex(currentIndex)}
                  >
                    <MenuIcon>{cmd.icon}</MenuIcon>
                    <MenuContent>
                      <MenuTitle>{cmd.title}</MenuTitle>
                      <MenuDesc>{cmd.description}</MenuDesc>
                    </MenuContent>
                  </MenuItem>
                );
              })}
            </CategoryGroup>
          ))
        ) : (
          <EmptyState>
            <FiHash />
            <span>未找到 "{searchQuery}"</span>
          </EmptyState>
        )}
      </MenuContainer>
    </AnimatePresence>
  );
};

// 标题图标
const HeadingIcon: React.FC<{ level: number }> = ({ level }) => (
  <span style={{ fontWeight: 700, fontSize: 16 - level * 2 }}>H{level}</span>
);

// 有序列表图标
const OrderedListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <text x="4" y="7" fontSize="8" fill="currentColor" stroke="none">1</text>
    <text x="4" y="13" fontSize="8" fill="currentColor" stroke="none">2</text>
    <text x="4" y="19" fontSize="8" fill="currentColor" stroke="none">3</text>
  </svg>
);

// 样式
const MenuContainer = styled(motion.div)`
  position: absolute;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 100;
  padding: 8px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(var(--text-secondary-rgb), 0.2);
    border-radius: 2px;
  }

  [data-theme='dark'] & {
    background: #1a1a1a;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }
`;

const CategoryGroup = styled.div`
  &:not(:last-child) {
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }
`;

const CategoryTitle = styled.div`
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const MenuItem = styled.div<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.1s ease;
  background: ${(props) => (props.selected ? 'var(--accent-color-alpha, rgba(81, 131, 245, 0.1))' : 'transparent')};

  &:hover {
    background: var(--accent-color-alpha, rgba(81, 131, 245, 0.1));
  }
`;

const MenuIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const MenuContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const MenuTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const MenuDesc = styled.div`
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 2px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: var(--text-tertiary);
  font-size: 13px;

  svg {
    width: 24px;
    height: 24px;
    opacity: 0.5;
  }
`;

export default SlashMenu;
