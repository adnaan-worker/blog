import React, { useMemo } from 'react';
import styled from '@emotion/styled';
import { FiType, FiList, FiFileText, FiCode, FiMessageSquare, FiMinus, FiImage, FiLink } from 'react-icons/fi';
import { removeSlashCommand } from '@/utils/editor/helpers';

const CommandMenuContainer = styled.div`
  position: absolute;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 150;

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

const CommandMenuTitle = styled.div`
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  border-bottom: 1px solid var(--border-color);
`;

const CommandMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--bg-secondary);
  }
`;

const CommandIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-secondary);
  border-radius: 6px;
  color: var(--primary-color);
  font-size: 16px;
`;

const CommandContent = styled.div`
  flex: 1;
`;

const CommandTitle = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
`;

const CommandDescription = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
`;

const NoResults = styled.div`
  padding: 24px 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
`;

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: any) => void;
}

interface CommandMenuProps {
  editor: any;
  position: { top: number; left: number };
  searchQuery: string;
  onCommandSelect: () => void;
  onImageClick: () => void;
  onLinkClick: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  editor,
  position,
  searchQuery,
  onCommandSelect,
  onImageClick,
  onLinkClick,
}) => {
  // 命令列表
  const commands: CommandItem[] = useMemo(
    () => [
      {
        title: '标题 2',
        description: '中标题',
        icon: <FiType />,
        command: (editor) => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '标题 3',
        description: '小标题',
        icon: <FiType />,
        command: (editor) => {
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '标题 4',
        description: '四级标题',
        icon: <FiType />,
        command: (editor) => {
          editor.chain().focus().toggleHeading({ level: 4 }).run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '标题 5',
        description: '五级标题',
        icon: <FiType />,
        command: (editor) => {
          editor.chain().focus().toggleHeading({ level: 5 }).run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '标题 6',
        description: '六级标题',
        icon: <FiType />,
        command: (editor) => {
          editor.chain().focus().toggleHeading({ level: 6 }).run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '无序列表',
        description: '创建无序列表',
        icon: <FiList />,
        command: (editor) => {
          editor.chain().focus().toggleBulletList().run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '有序列表',
        description: '创建有序列表',
        icon: <FiFileText />,
        command: (editor) => {
          editor.chain().focus().toggleOrderedList().run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '代码块',
        description: '插入代码块',
        icon: <FiCode />,
        command: (editor) => {
          editor.chain().focus().toggleCodeBlock().run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '引用',
        description: '插入引用块',
        icon: <FiMessageSquare />,
        command: (editor) => {
          editor.chain().focus().toggleBlockquote().run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '分割线',
        description: '插入分割线',
        icon: <FiMinus />,
        command: (editor) => {
          editor.chain().focus().setHorizontalRule().run();
          removeSlashCommand(editor);
        },
      },
      {
        title: '图片',
        description: '插入图片',
        icon: <FiImage />,
        command: (editor) => {
          removeSlashCommand(editor);
          onImageClick();
        },
      },
      {
        title: '链接',
        description: '插入链接',
        icon: <FiLink />,
        command: (editor) => {
          removeSlashCommand(editor);
          onLinkClick();
        },
      },
    ],
    [onImageClick, onLinkClick],
  );

  // 过滤命令
  const filteredCommands = useMemo(
    () =>
      commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cmd.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [commands, searchQuery],
  );

  const handleCommandClick = (command: CommandItem) => {
    command.command(editor);
    onCommandSelect();
  };

  return (
    <CommandMenuContainer
      data-command-menu
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <CommandMenuTitle>插入内容</CommandMenuTitle>
      {filteredCommands.length > 0 ? (
        filteredCommands.map((cmd, index) => (
          <CommandMenuItem key={index} onClick={() => handleCommandClick(cmd)}>
            <CommandIcon>{cmd.icon}</CommandIcon>
            <CommandContent>
              <CommandTitle>{cmd.title}</CommandTitle>
              <CommandDescription>{cmd.description}</CommandDescription>
            </CommandContent>
          </CommandMenuItem>
        ))
      ) : (
        <NoResults>未找到匹配的命令</NoResults>
      )}
    </CommandMenuContainer>
  );
};
