import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import 'highlight.js/styles/github.css'; // 添加语法高亮样式
import styled from '@emotion/styled';
import '@/styles/rich-text.css';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiCode,
  FiLink,
  FiImage,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiType,
  FiFileText,
  FiMinus,
  FiMinus as FiStrikethrough,
  FiMessageSquare,
} from 'react-icons/fi';

// 创建 lowlight 实例，支持更多语言
const lowlight = createLowlight(common);

// 编辑器配置
const extensions = [
  StarterKit.configure({
    codeBlock: false,
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    blockquote: {},
    bulletList: {},
    orderedList: {},
    listItem: {},
    hardBreak: {},
    horizontalRule: {},
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'javascript',
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return '标题';
      }
      return '输入 / 唤起命令菜单，或直接开始输入...';
    },
  }),
  Image.configure({
    allowBase64: true,
    inline: true,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      target: '_blank',
      rel: 'noopener noreferrer',
    },
  }),
  Underline,
  Strike,
];

interface ModernEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: any) => void;
}

const ModernEditor: React.FC<ModernEditorProps> = ({ content, onChange, placeholder }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const [commandMenuPosition, setCommandMenuPosition] = useState({ top: 0, left: 0 });
  const [commandSearch, setCommandSearch] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions,
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'ProseMirror rich-text-content',
        style: 'padding: 2rem 3rem; min-height: 400px;',
      },
      handleKeyDown: (view, event) => {
        // 检测输入 /
        if (event.key === '/') {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          // 获取光标位置
          const coords = view.coordsAtPos($from.pos);
          setCommandMenuPosition({
            top: coords.top - (editorRef.current?.getBoundingClientRect().top || 0) + 30,
            left: coords.left - (editorRef.current?.getBoundingClientRect().left || 0),
          });
          setCommandSearch('');
          setShowCommandMenu(true);
          return false;
        }

        // ESC 关闭命令菜单
        if (event.key === 'Escape' && showCommandMenu) {
          setShowCommandMenu(false);
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // 检测是否在输入命令
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);

      if (showCommandMenu && !textBefore.endsWith('/')) {
        const commandText = textBefore.split('/').pop() || '';
        setCommandSearch(commandText);
      }
    },
  });

  // 同步外部内容变化
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      // 确保内容被正确解析
      const trimmedContent = content.trim();
      if (trimmedContent && trimmedContent !== '<p></p>') {
        editor.commands.setContent(trimmedContent, false);
      }
    }
  }, [content, editor]);

  // 点击外部关闭命令菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCommandMenu) {
        setShowCommandMenu(false);
      }
      if (showLanguageMenu) {
        setShowLanguageMenu(false);
      }
    };

    if (showCommandMenu || showLanguageMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCommandMenu, showLanguageMenu]);

  // 命令列表
  const commands: CommandItem[] = [
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
        setShowImageInput(true);
      },
    },
    {
      title: '链接',
      description: '插入链接',
      icon: <FiLink />,
      command: (editor) => {
        removeSlashCommand(editor);
        setShowLinkInput(true);
      },
    },
  ];

  // 删除斜杠命令文本
  const removeSlashCommand = (editor: any) => {
    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;
    const textBefore = $from.parent.textContent.substring(0, $from.parentOffset);
    const slashPos = textBefore.lastIndexOf('/');

    if (slashPos !== -1) {
      const from = $from.pos - (textBefore.length - slashPos);
      const to = $from.pos;
      editor.chain().focus().deleteRange({ from, to }).run();
    }

    setShowCommandMenu(false);
  };

  // 过滤命令
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(commandSearch.toLowerCase()) ||
      cmd.description.toLowerCase().includes(commandSearch.toLowerCase()),
  );

  // 工具栏按钮操作
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleStrike = () => editor?.chain().focus().toggleStrike().run();
  const toggleCode = () => editor?.chain().focus().toggleCode().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor?.chain().focus().toggleBlockquote().run();
  const toggleCodeBlock = () => editor?.chain().focus().toggleCodeBlock().run();

  const setCodeBlockLanguage = (language: string) => {
    // 使用 CodeBlockLowlight 的正确方法设置语言
    editor?.chain().focus().updateAttributes('codeBlock', { language }).run();
    setShowLanguageMenu(false);
  };

  const setAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    editor?.chain().focus().setTextAlign(align).run();
  };

  const setHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    editor?.chain().focus().toggleHeading({ level }).run();
    setShowHeadingMenu(false);
  };

  const insertLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  }, [editor, imageUrl]);

  if (!editor) {
    return null;
  }

  return (
    <EditorWrapper ref={editorRef}>
      {/* 浮动工具栏 */}
      <FloatingToolbar>
        <ToolbarGroup>
          <ToolbarButton onClick={toggleBold} active={editor.isActive('bold')} title="加粗 (Ctrl+B)">
            <FiBold />
          </ToolbarButton>
          <ToolbarButton onClick={toggleItalic} active={editor.isActive('italic')} title="斜体 (Ctrl+I)">
            <FiItalic />
          </ToolbarButton>
          <ToolbarButton onClick={toggleUnderline} active={editor.isActive('underline')} title="下划线 (Ctrl+U)">
            <FiUnderline />
          </ToolbarButton>
          <ToolbarButton onClick={toggleStrike} active={editor.isActive('strike')} title="删除线">
            <FiStrikethrough />
          </ToolbarButton>
          <ToolbarButton onClick={toggleCode} active={editor.isActive('code')} title="行内代码">
            <FiCode />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <HeadingDropdown>
            <ToolbarButton onClick={() => setShowHeadingMenu(!showHeadingMenu)} title="标题">
              <FiType />
            </ToolbarButton>
            {showHeadingMenu && (
              <HeadingMenu>
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
              </HeadingMenu>
            )}
          </HeadingDropdown>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarButton onClick={toggleBulletList} active={editor.isActive('bulletList')} title="无序列表">
            <FiList />
          </ToolbarButton>
          <ToolbarButton onClick={toggleOrderedList} active={editor.isActive('orderedList')} title="有序列表">
            <FiFileText />
          </ToolbarButton>
          <ToolbarButton onClick={toggleBlockquote} active={editor.isActive('blockquote')} title="引用块">
            <FiMessageSquare />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => setAlignment('left')}
            active={editor.isActive({ textAlign: 'left' })}
            title="左对齐"
          >
            <FiAlignLeft />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setAlignment('center')}
            active={editor.isActive({ textAlign: 'center' })}
            title="居中对齐"
          >
            <FiAlignCenter />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setAlignment('right')}
            active={editor.isActive({ textAlign: 'right' })}
            title="右对齐"
          >
            <FiAlignRight />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setAlignment('justify')}
            active={editor.isActive({ textAlign: 'justify' })}
            title="两端对齐"
          >
            <FiAlignJustify />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive('link')}
            title="插入链接"
          >
            <FiLink />
          </ToolbarButton>
          <ToolbarButton onClick={() => setShowImageInput(!showImageInput)} title="插入图片">
            <FiImage />
          </ToolbarButton>
          <ToolbarButton onClick={toggleCodeBlock} active={editor.isActive('codeBlock')} title="代码块">
            <FiCode />
          </ToolbarButton>

          {/* 语言选择按钮 - 只在代码块中显示 */}
          {editor.isActive('codeBlock') && (
            <ToolbarButton
              onClick={(e) => {
                e.stopPropagation(); // 阻止事件冒泡
                setShowLanguageMenu(!showLanguageMenu);
              }}
              title="选择语言"
            >
              <FiType />
            </ToolbarButton>
          )}

          {/* 语言选择菜单 */}
          {showLanguageMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 9999,
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto',
                marginTop: '4px',
              }}
            >
              <div
                style={{
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                选择语言
              </div>
              {[
                { key: 'javascript', name: 'JavaScript' },
                { key: 'typescript', name: 'TypeScript' },
                { key: 'python', name: 'Python' },
                { key: 'java', name: 'Java' },
                { key: 'cpp', name: 'C++' },
                { key: 'csharp', name: 'C#' },
                { key: 'html', name: 'HTML' },
                { key: 'css', name: 'CSS' },
                { key: 'json', name: 'JSON' },
                { key: 'sql', name: 'SQL' },
                { key: 'bash', name: 'Bash' },
                { key: 'markdown', name: 'Markdown' },
                { key: 'text', name: '纯文本' },
              ].map((lang) => (
                <button
                  key={lang.key}
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止事件冒泡
                    setCodeBlockLanguage(lang.key);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </ToolbarGroup>
      </FloatingToolbar>

      {/* 链接输入框 */}
      {showLinkInput && (
        <InputPanel>
          <input
            type="url"
            placeholder="输入链接地址 (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                insertLink();
              } else if (e.key === 'Escape') {
                setShowLinkInput(false);
              }
            }}
            autoFocus
          />
          <button onClick={insertLink}>插入</button>
          <button onClick={() => setShowLinkInput(false)}>取消</button>
        </InputPanel>
      )}

      {/* 图片输入框 */}
      {showImageInput && (
        <InputPanel>
          <input
            type="url"
            placeholder="输入图片地址 (https://...)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                insertImage();
              } else if (e.key === 'Escape') {
                setShowImageInput(false);
              }
            }}
            autoFocus
          />
          <button onClick={insertImage}>插入</button>
          <button onClick={() => setShowImageInput(false)}>取消</button>
        </InputPanel>
      )}

      {/* 编辑器内容区 */}
      <EditorContent editor={editor} />

      {/* 斜杠命令菜单 */}
      {showCommandMenu && (
        <CommandMenu
          style={{
            top: `${commandMenuPosition.top}px`,
            left: `${commandMenuPosition.left}px`,
          }}
        >
          <CommandMenuTitle>插入内容</CommandMenuTitle>
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, index) => (
              <CommandMenuItem key={index} onClick={() => cmd.command(editor)}>
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
        </CommandMenu>
      )}
    </EditorWrapper>
  );
};

// 样式组件
const EditorWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;

  /* 编辑器内容区样式 - 只添加编辑器特有的 */
  .ProseMirror {
    flex: 1;
    overflow-y: auto;
    min-height: 100%;

    &:focus {
      outline: none;
    }

    /* placeholder 样式 */
    p.is-editor-empty:first-of-type::before {
      content: attr(data-placeholder);
      color: var(--text-secondary);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }

  /* 移动端调整 */
  @media (max-width: 768px) {
    .ProseMirror {
      padding: 1rem 1.5rem !important;
    }
  }
`;

const FloatingToolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 10;
  flex-wrap: wrap;
`;

const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  position: relative;
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: var(--border-color);
  margin: 0 4px;
`;

interface ToolbarButtonProps {
  active?: boolean;
}

const ToolbarButton = styled.button<ToolbarButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? '#fff' : 'var(--text-primary)')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
  position: relative;

  &:hover {
    background: ${(props) => (props.active ? 'var(--accent-color)' : 'var(--bg-secondary)')};
    color: ${(props) => (props.active ? '#fff' : 'var(--text-primary)')};
  }

  &:active {
    transform: scale(0.95);
  }

  /* 为选中状态添加边框和阴影增强视觉效果 */
  ${(props) =>
    props.active &&
    `
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}

  /* 深色主题下的特殊处理 */
  [data-theme='dark'] & {
    ${(props) =>
      props.active &&
      `
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
    `}
  }
`;

const HeadingDropdown = styled.div`
  position: relative;
`;

const HeadingMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 100;
  min-width: 160px;
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

const InputPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: var(--primary-color);
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }

    &:last-child {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }
`;

const CommandMenu = styled.div`
  position: absolute;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
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

export default ModernEditor;
