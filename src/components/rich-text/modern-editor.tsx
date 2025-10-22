import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import 'highlight.js/styles/github.css'; // 添加语法高亮样式
import styled from '@emotion/styled';
import '@/styles/rich-text.css';
import { API } from '@/utils/api';
import { ResizableImage } from './resizable-image';
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
  FiUpload,
  FiRotateCcw,
  FiRotateCw,
  FiCheckSquare,
  FiGrid,
  FiTrash2,
} from 'react-icons/fi';
import { MdFormatColorText, MdFormatColorFill } from 'react-icons/md';

// 创建 lowlight 实例，支持更多语言
const lowlight = createLowlight(common);

/**
 * 上传图片到服务器
 * @param file 图片文件
 * @returns 图片URL
 */
const uploadImage = async (file: File): Promise<string> => {
  try {
    const response = await API.user.batchUpload([file], 'editor');

    // 后端返回的数据结构是 { data: { data: [...] } }
    const files = response.data?.data.data;

    if (files && Array.isArray(files) && files.length > 0) {
      // 返回第一个上传成功的文件URL
      const fileUrl = files[0].url || files[0].path;
      // 修复路径中的反斜杠
      return fileUrl.replace(/\\/g, '/');
    }

    throw new Error('上传失败，请重试');
  } catch (error: any) {
    console.error('图片上传失败:', error);
    throw new Error(error.message || '图片上传失败');
  }
};

// 创建扩展配置的工厂函数（避免重复创建）
const createExtensions = () => [
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
    // 禁用 StarterKit 内置的这些扩展，因为我们要自定义配置
    strike: false,
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
  ResizableImage.configure({
    allowBase64: false,
    inline: false,
    HTMLAttributes: {
      class: 'editor-image',
    },
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
  // 文字样式扩展（TextStyle 必须在 Color 之前）
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  // 表格
  Table,
  TableRow,
  TableHeader,
  TableCell,
  // 任务列表
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  // 其他
  Underline,
  Strike,
  Subscript,
  Superscript,
];

interface ModernEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  maxHeight?: string; // 最大高度，用于限制编辑器高度
}

interface CommandItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: (editor: any) => void;
}

const ModernEditor: React.FC<ModernEditorProps> = ({ content, onChange, placeholder, maxHeight }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [languageMenuPosition, setLanguageMenuPosition] = useState({ top: 0, left: 0 });
  const [isInCodeBlock, setIsInCodeBlock] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 新增功能状态
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const [commandMenuPosition, setCommandMenuPosition] = useState({ top: 0, left: 0 });
  const [commandSearch, setCommandSearch] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 用于跟踪组件挂载状态，防止在组件卸载后更新状态
  const isMountedRef = useRef(true);

  // 使用 useMemo 确保扩展只创建一次，避免重复警告
  const extensions = React.useMemo(() => createExtensions(), []);

  const editor = useEditor({
    extensions,
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: 'ProseMirror rich-text-content',
        style: 'padding: 2rem 3rem; min-height: 400px;',
      },
      handlePaste: (view, event) => {
        // 处理粘贴的图片
        const items = Array.from(event.clipboardData?.items || []);
        const imageItems = items.filter((item) => item.type.indexOf('image') !== -1);

        if (imageItems.length > 0) {
          event.preventDefault();

          imageItems.forEach(async (item) => {
            const file = item.getAsFile();
            if (file) {
              try {
                if (isMountedRef.current) setIsUploading(true);
                const url = await uploadImage(file);

                // 插入图片到编辑器（只在组件仍挂载时）
                if (isMountedRef.current) {
                  editor?.commands.setImage({ src: url });
                }
              } catch (error: any) {
                console.error('图片上传失败:', error);
                if (isMountedRef.current) {
                  adnaan?.toast.error(error.message || '图片上传失败', '上传失败');
                }
              } finally {
                if (isMountedRef.current) setIsUploading(false);
              }
            }
          });

          return true;
        }

        return false;
      },
      handleDrop: (view, event) => {
        // 处理拖拽的图片
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((file) => file.type.indexOf('image') !== -1);

        if (imageFiles.length > 0) {
          event.preventDefault();

          const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!coords) return false;

          imageFiles.forEach(async (file) => {
            try {
              if (isMountedRef.current) setIsUploading(true);
              const url = await uploadImage(file);

              // 在拖放位置插入图片（只在组件仍挂载时）
              if (isMountedRef.current) {
                editor?.commands.setImage({ src: url });
              }
            } catch (error: any) {
              console.error('图片上传失败:', error);
              if (isMountedRef.current) {
                adnaan?.toast.error(error.message || '图片上传失败', '上传失败');
              }
            } finally {
              if (isMountedRef.current) setIsUploading(false);
            }
          });

          return true;
        }

        return false;
      },
      handleKeyDown: (view, event) => {
        // 检测输入 /
        if (event.key === '/') {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          // 获取光标位置
          const coords = view.coordsAtPos($from.pos);
          const editorRect = editorRef.current?.getBoundingClientRect();

          if (editorRect) {
            const relativeTop = coords.top - editorRect.top;
            const relativeLeft = coords.left - editorRect.left;

            // 计算可用空间
            const menuHeight = 400; // 菜单最大高度
            const spaceBelow = editorRect.bottom - coords.top;
            const spaceAbove = coords.top - editorRect.top;

            // 智能判断显示在上方还是下方
            let finalTop = relativeTop + 30;

            if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
              // 下方空间不足且上方空间更大，显示在上方
              finalTop = relativeTop - Math.min(menuHeight, spaceAbove);
            }

            setCommandMenuPosition({
              top: finalTop,
              left: relativeLeft,
            });
          }

          setCommandSearch('');
          setShowCommandMenu(true);
          return false;
        }

        // ESC 关闭菜单
        if (event.key === 'Escape') {
          if (showCommandMenu) {
            setShowCommandMenu(false);
            return true;
          }
          if (showLanguageMenu) {
            setShowLanguageMenu(false);
            return true;
          }
        }

        return false;
      },
      handleClick: (view, pos, event) => {
        // 如果不在代码块中，关闭语言菜单
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;

        const codeBlock = $from.parent.type.name === 'codeBlock';
        if (!codeBlock && showLanguageMenu) {
          setShowLanguageMenu(false);
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
    onSelectionUpdate: ({ editor }) => {
      // 检测是否在代码块中
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      const isCodeBlock = $from.parent.type.name === 'codeBlock';
      setIsInCodeBlock(isCodeBlock);
    },
  });

  // 组件卸载清理
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 同步外部内容变化
  useEffect(() => {
    if (editor && content && content !== editor.getHTML()) {
      // 确保内容被正确解析
      const trimmedContent = content.trim();
      if (trimmedContent && trimmedContent !== '<p></p>') {
        editor.commands.setContent(trimmedContent);
      }
    }
  }, [content, editor]);

  // 初始状态检查
  useEffect(() => {
    if (editor) {
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      const isCodeBlock = $from.parent.type.name === 'codeBlock';
      setIsInCodeBlock(isCodeBlock);
    }
  }, [editor]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;

      // 检查是否点击在快捷指令菜单内
      const commandMenuElement = document.querySelector('[data-command-menu]');
      if (showCommandMenu && commandMenuElement?.contains(target)) {
        return;
      }

      // 检查是否点击在语言选择菜单内
      const languageMenuElement = document.querySelector('[data-language-menu]');
      if (showLanguageMenu && languageMenuElement?.contains(target)) {
        return;
      }

      // 检查是否点击在标题菜单内
      const headingMenuElement = document.querySelector('[data-heading-menu]');
      if (showHeadingMenu && headingMenuElement?.contains(target)) {
        return;
      }

      // 检查是否点击在颜色选择器内
      const colorPickerElement = document.querySelector('[data-color-picker]');
      if (showTextColorPicker && colorPickerElement?.contains(target)) {
        return;
      }

      // 检查是否点击在高亮选择器内
      const highlightPickerElement = document.querySelector('[data-highlight-picker]');
      if (showHighlightPicker && highlightPickerElement?.contains(target)) {
        return;
      }

      // 关闭所有菜单
      if (showCommandMenu) {
        setShowCommandMenu(false);
      }
      if (showLanguageMenu) {
        setShowLanguageMenu(false);
      }
      if (showHeadingMenu) {
        setShowHeadingMenu(false);
      }
      if (showTextColorPicker) {
        setShowTextColorPicker(false);
      }
      if (showHighlightPicker) {
        setShowHighlightPicker(false);
      }
    };

    if (showCommandMenu || showLanguageMenu || showHeadingMenu || showTextColorPicker || showHighlightPicker) {
      // 立即添加事件监听器
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showCommandMenu, showLanguageMenu, showHeadingMenu, showTextColorPicker, showHighlightPicker]);

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
  const toggleCodeBlock = () => {
    editor?.chain().focus().toggleCodeBlock().run();
  };

  const setCodeBlockLanguage = (language: string) => {
    // 使用 CodeBlockLowlight 的正确方法设置语言
    editor?.chain().focus().updateAttributes('codeBlock', { language }).run();
    setShowLanguageMenu(false);
  };

  // 获取当前代码块的语言
  const getCurrentCodeBlockLanguage = () => {
    if (!editor) return 'text';

    const { state } = editor;
    const { selection } = state;
    const { $from } = selection;

    if ($from.parent.type.name === 'codeBlock') {
      return $from.parent.attrs.language || 'text';
    }

    return 'text';
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

  // 处理文件上传
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const imageFiles = files.filter((file) => file.type.indexOf('image') !== -1);

      if (imageFiles.length === 0) {
        adnaan?.toast.error('请选择图片文件', '文件类型错误');
        return;
      }

      for (const file of imageFiles) {
        try {
          if (isMountedRef.current) setIsUploading(true);
          const url = await uploadImage(file);

          // 只在组件仍挂载时插入图片
          if (isMountedRef.current) {
            editor?.chain().focus().setImage({ src: url }).run();
          }
        } catch (error: any) {
          console.error('图片上传失败:', error);
          if (isMountedRef.current) {
            adnaan?.toast.error(error.message || '图片上传失败', '上传失败');
          }
        } finally {
          if (isMountedRef.current) setIsUploading(false);
        }
      }

      // 清空文件选择
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [editor],
  );

  if (!editor) {
    return null;
  }

  return (
    <EditorWrapper ref={editorRef} maxHeight={maxHeight}>
      {/* 浮动工具栏 */}
      <FloatingToolbar>
        {/* 撤销/重做 */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="撤销 (Ctrl+Z)"
          >
            <FiRotateCcw />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="重做 (Ctrl+Shift+Z)"
          >
            <FiRotateCw />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        {/* 文本样式 */}
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
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleSubscript().run()}
            active={editor.isActive('subscript')}
            title="下标"
          >
            X<sub style={{ fontSize: '0.7em' }}>₂</sub>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleSuperscript().run()}
            active={editor.isActive('superscript')}
            title="上标"
          >
            X<sup style={{ fontSize: '0.7em' }}>²</sup>
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        {/* 文字颜色和高亮 */}
        <ToolbarGroup>
          <ColorPickerDropdown>
            <ToolbarButton onClick={() => setShowTextColorPicker(!showTextColorPicker)} title="文字颜色">
              <MdFormatColorText />
            </ToolbarButton>
            {showTextColorPicker && (
              <ColorPickerMenu data-color-picker>
                <ColorPickerTitle>文字颜色</ColorPickerTitle>
                <ColorGrid>
                  {[
                    '#000000',
                    '#e60000',
                    '#ff9900',
                    '#ffff00',
                    '#008a00',
                    '#0066cc',
                    '#9933ff',
                    '#ffffff',
                    '#facccc',
                    '#ffebcc',
                    '#ffffcc',
                    '#cce8cc',
                    '#cce0f5',
                    '#ebd6ff',
                    '#bbbbbb',
                    '#f06666',
                    '#ffc266',
                    '#ffff66',
                    '#66b966',
                    '#66a3e0',
                    '#c285ff',
                    '#888888',
                    '#a10000',
                    '#b26b00',
                    '#b2b200',
                    '#006100',
                    '#0047b2',
                    '#6b24b2',
                    '#444444',
                    '#5c0000',
                    '#663d00',
                    '#666600',
                    '#003700',
                    '#002966',
                    '#3d1466',
                  ].map((color) => (
                    <ColorOption
                      key={color}
                      color={color}
                      onClick={() => {
                        editor?.chain().focus().setColor(color).run();
                        setShowTextColorPicker(false);
                      }}
                      active={editor.getAttributes('textStyle').color === color}
                    />
                  ))}
                </ColorGrid>
                <ColorPickerAction
                  onClick={() => {
                    editor?.chain().focus().unsetColor().run();
                    setShowTextColorPicker(false);
                  }}
                >
                  清除颜色
                </ColorPickerAction>
              </ColorPickerMenu>
            )}
          </ColorPickerDropdown>

          <ColorPickerDropdown>
            <ToolbarButton
              onClick={() => setShowHighlightPicker(!showHighlightPicker)}
              active={editor.isActive('highlight')}
              title="文字高亮"
            >
              <MdFormatColorFill />
            </ToolbarButton>
            {showHighlightPicker && (
              <ColorPickerMenu data-highlight-picker>
                <ColorPickerTitle>背景高亮</ColorPickerTitle>
                <ColorGrid>
                  {[
                    '#ffeb3b',
                    '#ffc107',
                    '#ff9800',
                    '#ff5722',
                    '#f44336',
                    '#e91e63',
                    '#9c27b0',
                    '#673ab7',
                    '#3f51b5',
                    '#2196f3',
                    '#03a9f4',
                    '#00bcd4',
                    '#009688',
                    '#4caf50',
                    '#8bc34a',
                    '#cddc39',
                  ].map((color) => (
                    <ColorOption
                      key={color}
                      color={color}
                      onClick={() => {
                        editor?.chain().focus().setHighlight({ color }).run();
                        setShowHighlightPicker(false);
                      }}
                      active={editor.getAttributes('highlight').color === color}
                    />
                  ))}
                </ColorGrid>
                <ColorPickerAction
                  onClick={() => {
                    editor?.chain().focus().unsetHighlight().run();
                    setShowHighlightPicker(false);
                  }}
                >
                  清除高亮
                </ColorPickerAction>
              </ColorPickerMenu>
            )}
          </ColorPickerDropdown>
        </ToolbarGroup>

        <Divider />

        <ToolbarGroup>
          <HeadingDropdown>
            <ToolbarButton onClick={() => setShowHeadingMenu(!showHeadingMenu)} title="标题">
              <FiType />
            </ToolbarButton>
            {showHeadingMenu && (
              <HeadingMenu data-heading-menu>
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
          <ToolbarButton
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            active={editor.isActive('taskList')}
            title="任务列表"
          >
            <FiCheckSquare />
          </ToolbarButton>
          <ToolbarButton onClick={toggleBlockquote} active={editor.isActive('blockquote')} title="引用块">
            <FiMessageSquare />
          </ToolbarButton>
        </ToolbarGroup>

        <Divider />

        {/* 表格操作 */}
        <ToolbarGroup>
          <ToolbarButton
            onClick={() => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="插入表格"
          >
            <FiGrid />
          </ToolbarButton>
          {editor.isActive('table') && (
            <>
              <ToolbarButton onClick={() => editor?.chain().focus().addColumnBefore().run()} title="在左侧插入列">
                ←
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().addColumnAfter().run()} title="在右侧插入列">
                →
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().deleteColumn().run()} title="删除列">
                <FiTrash2 />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().addRowBefore().run()} title="在上方插入行">
                ↑
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().addRowAfter().run()} title="在下方插入行">
                ↓
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().deleteRow().run()} title="删除行">
                <FiMinus />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor?.chain().focus().deleteTable().run()} title="删除表格">
                <FiTrash2 style={{ color: 'var(--error-color)' }} />
              </ToolbarButton>
            </>
          )}
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
          <ToolbarButton onClick={() => setShowImageInput(!showImageInput)} title="插入图片URL">
            <FiImage />
          </ToolbarButton>
          <ToolbarButton onClick={() => fileInputRef.current?.click()} title="上传图片" disabled={isUploading}>
            {isUploading ? '...' : <FiUpload />}
          </ToolbarButton>
          <ToolbarButton onClick={toggleCodeBlock} active={isInCodeBlock} title="代码块">
            <FiCode />
          </ToolbarButton>

          {/* 语言选择按钮 - 只在代码块中显示 */}
          {isInCodeBlock && (
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

          {/* 语言选择菜单 - 固定在工具栏下方 */}
          {showLanguageMenu && (
            <LanguageMenu
              data-language-menu
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
              }}
            >
              <LanguageMenuTitle>选择语言</LanguageMenuTitle>
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
                <LanguageMenuItem
                  key={lang.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCodeBlockLanguage(lang.key);
                  }}
                  active={getCurrentCodeBlockLanguage() === lang.key}
                >
                  {lang.name}
                </LanguageMenuItem>
              ))}
            </LanguageMenu>
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

      {/* 隐藏的文件上传输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* 上传状态提示 */}
      {isUploading && (
        <UploadingIndicator>
          <FiUpload /> 正在上传图片...
        </UploadingIndicator>
      )}

      {/* 编辑器内容区 */}
      <div className="tiptap-editor-container">
        <EditorContent editor={editor} />
      </div>

      {/* 斜杠命令菜单 */}
      {showCommandMenu && (
        <CommandMenu
          data-command-menu
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
const EditorWrapper = styled.div<{ maxHeight?: string }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg-primary);
  max-height: ${(props) => props.maxHeight || 'none'};

  /* 编辑器内容容器 - 可滚动 */
  .tiptap-editor-container {
    flex: 1;
    overflow-y: auto;
    min-height: 200px;
    max-height: ${(props) => (props.maxHeight ? `calc(${props.maxHeight} - 50px)` : 'none')};

    /* 自定义滚动条 */
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
  }

  /* 编辑器内容区样式 */
  .ProseMirror {
    padding: 2rem;
    min-height: 200px;

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

  /* ===== 可调整大小的图片样式 ===== */

  /* 图片包装器 */
  .ProseMirror .resizable-image-wrapper {
    display: flex;
    margin: 1.5rem 0;
    position: relative;

    &[data-align='left'] {
      justify-content: flex-start;
    }

    &[data-align='center'] {
      justify-content: center;
    }

    &[data-align='right'] {
      justify-content: flex-end;
    }
  }

  /* 图片容器 */
  .ProseMirror .resizable-image-container {
    position: relative;
    display: inline-block;
    max-width: 100%;
    border-radius: 8px;
    overflow: visible;
    transition: all 0.2s ease;

    img {
      display: block;
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    /* 选中状态 */
    &.ProseMirror-selectednode {
      outline: 2px solid var(--accent-color);
      outline-offset: 2px;

      .resize-handle {
        opacity: 1;
        pointer-events: all;
      }

      .image-toolbar {
        opacity: 1;
        pointer-events: all;
      }
    }

    /* 悬停状态 */
    &:hover {
      .resize-handle {
        opacity: 1;
      }

      .image-toolbar {
        opacity: 1;
      }
    }
  }

  /* 调整大小手柄 */
  .ProseMirror .resize-handle {
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 16px;
    height: 16px;
    background: var(--accent-color);
    border: 2px solid var(--bg-primary);
    border-radius: 50%;
    cursor: nwse-resize;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 10;
    pointer-events: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

    &:hover {
      transform: scale(1.2);
    }
  }

  /* 图片工具栏 */
  .ProseMirror .image-toolbar {
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    z-index: 10;

    [data-theme='dark'] & {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }

    .toolbar-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: var(--text-primary);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--bg-secondary);
        color: var(--accent-color);
      }

      &[data-action='delete']:hover {
        background: var(--error-bg);
        color: var(--error-color);
      }
    }
  }

  /* 调整大小时的样式 */
  .ProseMirror .resizable-image-wrapper.resizing {
    .resizable-image-container {
      opacity: 0.7;
    }

    img {
      pointer-events: none;
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
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  width: 100%;
  flex-shrink: 0; /* 防止工具栏被压缩 */
  position: sticky;
  top: 0;
  z-index: 100; /* 确保工具栏始终在内容上方 */

  /* 增强深色模式下的视觉效果 */
  [data-theme='dark'] & {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
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
  disabled?: boolean;
}

const ToolbarButton = styled.button<ToolbarButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--text-on-accent)' : 'var(--text-primary)')};
  border-radius: 4px;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  font-size: 16px;
  position: relative;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover {
    background: ${(props) =>
      props.disabled ? 'transparent' : props.active ? 'var(--accent-color)' : 'var(--bg-secondary)'};
    color: ${(props) => (props.active ? 'var(--text-on-accent)' : 'var(--text-primary)')};
  }

  &:active {
    transform: ${(props) => (props.disabled ? 'none' : 'scale(0.95)')};
  }

  /* 为选中状态添加边框和阴影增强视觉效果 */
  ${(props) =>
    props.active &&
    !props.disabled &&
    `
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  `}

  /* 深色主题下的特殊处理 */
  [data-theme='dark'] & {
    ${(props) =>
      props.active &&
      !props.disabled &&
      `
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255, 255, 255, 0.05);
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
  box-shadow: var(--shadow-md);
  overflow: hidden;
  z-index: 200; /* 高于工具栏 */
  min-width: 160px;

  /* 增强深色模式下的阴影 */
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

const InputPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: relative;
  z-index: 90; /* 低于工具栏，但在编辑器内容之上 */

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
      border-color: var(--accent-color);
      box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
    }
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: var(--accent-color);
    color: var(--text-on-accent);
    cursor: pointer;
    font-size: 14px;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }

    &:last-child {
      background: var(--bg-tertiary);
      color: var(--text-primary);

      &:hover {
        background: var(--bg-secondary);
      }
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
  z-index: 150; /* 高于工具栏但低于子菜单 */

  /* 自定义滚动条 */
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

  /* 深色模式增强 */
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

const LanguageMenu = styled.div`
  position: absolute;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 200; /* 高于工具栏 */
  margin-top: 4px;

  /* 自定义滚动条 */
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

  /* 深色模式增强 */
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

interface LanguageMenuItemProps {
  active?: boolean;
}

const LanguageMenuItem = styled.div<LanguageMenuItemProps>`
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: var(--text-primary);
  background: ${(props) => (props.active ? 'var(--accent-color)' : 'transparent')};
  color: ${(props) => (props.active ? 'var(--text-on-accent)' : 'var(--text-primary)')};

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

// 颜色选择器样式
const ColorPickerDropdown = styled.div`
  position: relative;
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

interface ColorOptionProps {
  color: string;
  active?: boolean;
}

const ColorOption = styled.div<ColorOptionProps>`
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

const UploadingIndicator = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  font-size: 14px;
  z-index: 1000;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default ModernEditor;
