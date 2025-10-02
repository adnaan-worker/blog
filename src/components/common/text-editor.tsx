import React, { useState, useEffect } from 'react';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { Button } from '@/components/ui';
import RichTextRenderer from './rich-text-renderer';
import RichTextStats from './rich-text-stats';
import AIAgentController from './ai-agent-controller';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiLink,
  FiImage,
  FiList,
  FiCode,
  FiType,
  FiAlignJustify,
  FiMaximize2,
  FiMoreHorizontal,
  FiEye,
  FiEdit3,
  FiBarChart,
  FiSave,
  FiX,
  FiCpu,
} from 'react-icons/fi';

// 定义扩展数组
const extensions = [
  StarterKit.configure({
    codeBlock: {
      HTMLAttributes: {
        class: 'tiptap-code-block',
      },
    },
  }),
  Placeholder.configure({
    placeholder: '开始编写你的内容...',
  }),
  Image.configure({
    allowBase64: true,
    inline: true,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),
  Link.configure({
    openOnClick: false,
    validate: (href: string) => /^https?:\/\//.test(href),
  }),
  Underline,
];

// 初始内容
const initialContent = '';

interface TextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  mode?: 'full' | 'simple'; // 编辑器工具栏模式
  showPreview?: boolean; // 是否显示预览切换
  showStats?: boolean; // 是否显示统计信息
  onSave?: () => void; // 保存回调
  onCancel?: () => void; // 取消回调
}

// 工具栏样式
const editorStyles = {
  richTextEditorWrapper: {
    width: '100%',
  },
  textEditorContainer: {
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-primary)',
    overflow: 'hidden',
  },
  editorToolbar: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    padding: '0.75rem',
    gap: '0.75rem',
    borderBottom: '1px solid var(--border-color)',
    background: 'var(--bg-secondary)',
    alignItems: 'center',
  },
  toolbarGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    borderRight: '1px solid var(--border-color)',
    paddingRight: '0.75rem',
    marginRight: '0.75rem',
  },
  toolbarGroupLast: {
    borderRight: 'none',
    paddingRight: '0',
    marginRight: '0',
  },
  toolbarButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    padding: '0',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  toolbarButtonHover: {
    background: 'var(--bg-tertiary)',
  },
  toolbarButtonActive: {
    background: 'var(--accent-color-alpha)',
    color: 'var(--accent-color)',
    border: '1px solid var(--accent-color)',
  },
  toolbarText: {
    fontSize: '14px',
    fontWeight: 500,
  },
  tiptapEditor: {
    outline: 'none',
    width: '100%',
    minHeight: '400px',
    padding: '1rem',
  },
};

// 工具栏按钮组件
const MenuBar = ({ mode = 'full' }: { mode?: 'full' | 'simple' }) => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  // 插入图片
  const addImage = () => {
    const url = window.prompt('输入图片URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  // 添加链接
  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('输入链接URL', previousUrl);

    // 取消链接
    if (url === null) {
      return;
    }

    // 清空链接
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // 设置链接
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // 简化模式的工具栏
  if (mode === 'simple') {
    return (
      <div style={editorStyles.editorToolbar}>
        <div style={editorStyles.toolbarGroup}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={{
              ...editorStyles.toolbarButton,
              ...(editor.isActive('bold') ? editorStyles.toolbarButtonActive : {}),
            }}
            title="加粗"
          >
            <FiBold size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={{
              ...editorStyles.toolbarButton,
              ...(editor.isActive('italic') ? editorStyles.toolbarButtonActive : {}),
            }}
            title="斜体"
          >
            <FiItalic size={16} />
          </button>
        </div>

        <div style={editorStyles.toolbarGroup}>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            style={{
              ...editorStyles.toolbarButton,
              ...(editor.isActive('bulletList') ? editorStyles.toolbarButtonActive : {}),
            }}
            title="无序列表"
          >
            <FiList size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            style={{
              ...editorStyles.toolbarButton,
              ...(editor.isActive('blockquote') ? editorStyles.toolbarButtonActive : {}),
            }}
            title="引用"
          >
            <span style={editorStyles.toolbarText}>『』</span>
          </button>
        </div>

        <div style={{ ...editorStyles.toolbarGroup, ...editorStyles.toolbarGroupLast }}>
          <button
            onClick={setLink}
            style={{
              ...editorStyles.toolbarButton,
              ...(editor.isActive('link') ? editorStyles.toolbarButtonActive : {}),
            }}
            title="添加链接"
          >
            <FiLink size={16} />
          </button>
          <button onClick={addImage} style={editorStyles.toolbarButton} title="插入图片">
            <FiImage size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 完整模式的工具栏（原有代码）
  return (
    <div style={editorStyles.editorToolbar}>
      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('bold') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="加粗"
        >
          <FiBold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('italic') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="斜体"
        >
          <FiItalic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('underline') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="下划线"
        >
          <FiUnderline size={16} />
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('heading', { level: 2 }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="标题2"
        >
          <FiType size={16} /> 2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('heading', { level: 3 }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="标题3"
        >
          <FiType size={16} /> 3
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'left' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="左对齐"
        >
          <FiAlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'center' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="居中对齐"
        >
          <FiAlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'right' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="右对齐"
        >
          <FiAlignRight size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive({ textAlign: 'justify' }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="两端对齐"
        >
          <FiAlignJustify size={16} />
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('bulletList') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="无序列表"
        >
          <FiList size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('orderedList') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="有序列表"
        >
          <span style={editorStyles.toolbarText}>1.</span>
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('blockquote') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="引用"
        >
          <span style={editorStyles.toolbarText}>『』</span>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('codeBlock') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="代码块"
        >
          <FiCode size={16} />
        </button>
      </div>

      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={setLink}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('link') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="添加链接"
        >
          <FiLink size={16} />
        </button>
        <button onClick={addImage} style={editorStyles.toolbarButton} title="插入图片">
          <FiImage size={16} />
        </button>
      </div>

      <div style={{ ...editorStyles.toolbarGroup, ...editorStyles.toolbarGroupLast }}>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          style={editorStyles.toolbarButton}
          title="水平分割线"
        >
          <FiMoreHorizontal size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().selectAll().run()}
          style={editorStyles.toolbarButton}
          title="全选"
        >
          <FiMaximize2 size={16} />
        </button>
      </div>
    </div>
  );
};

// 编辑器样式
const getCustomStyles = (minHeight: string) => `
  .tiptap-editor {
    outline: none;
    width: 100%;
    min-height: ${minHeight};
    padding: 1rem;
  }
  
  /* 对应BlogDetail中的文章内容样式 */
  .tiptap-editor h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin: 2.5rem 0 1rem;
    position: relative;
    padding-bottom: 0.5rem;
  }
  
  .tiptap-editor h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: var(--accent-color);
    border-radius: 2px;
  }
  
  .tiptap-editor h3 {
    font-size: 1.3rem;
    font-weight: 600;
    margin: 2rem 0 1rem;
  }
  
  .tiptap-editor p {
    margin-bottom: 1.5rem;
  }
  
  .tiptap-editor ul, .tiptap-editor ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  .tiptap-editor li {
    margin-bottom: 0.5rem;
  }
  
  .tiptap-editor blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid var(--accent-color);
    background: var(--bg-secondary);
    border-radius: 0 8px 8px 0;
    font-style: italic;
  }
  
  .tiptap-editor blockquote p {
    margin-bottom: 0;
  }
  
  .tiptap-editor code {
    font-family: var(--font-code);
    background: var(--bg-secondary);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-size: 0.9em;
    color: var(--text-primary);
    border: 1px solid var(--border-color);
  }
  
  /* TipTap代码块样式 */
  .tiptap-editor .tiptap-code-block {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
    margin: 1.5rem 0;
    font-family: var(--font-code);
    font-size: 0.9rem;
    line-height: 1.5;
    overflow-x: auto;
    position: relative;
  }
  
  .tiptap-editor .tiptap-code-block code {
    background: transparent;
    padding: 0;
    border: none;
    font-family: inherit;
    color: var(--text-primary);
  }
  
  /* 普通代码块样式 */
  .tiptap-editor pre {
    background: var(--bg-secondary);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5rem 0;
    border: 1px solid var(--border-color);
    position: relative;
    font-family: var(--font-code);
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  .tiptap-editor pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    border: none;
    font-family: var(--font-code);
    color: var(--text-primary);
  }
  
  /* 为代码块添加语言标识 */
  .tiptap-editor pre[data-language]::before {
    content: attr(data-language);
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: var(--accent-color);
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
  }
  
  /* 富文本代码块样式 */
  .tiptap-editor .rich-text-code-block {
    margin: 1.5rem 0;
    border-radius: 8px;
    overflow: hidden;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
  }
  
  .tiptap-editor .rich-text-code-block pre {
    margin: 0;
    background: transparent;
    border: none;
  }
  
  .tiptap-editor img {
    max-width: 100%;
    border-radius: 8px;
    margin: 1.5rem 0;
  }
  
  /* 链接样式 */
  .tiptap-editor a {
    color: var(--accent-color);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
  }
  
  .tiptap-editor a:hover {
    border-bottom-color: var(--accent-color);
  }
  
  /* 表格样式 */
  .tiptap-editor table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
  }
  
  .tiptap-editor th,
  .tiptap-editor td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  .tiptap-editor th {
    background: var(--bg-secondary);
    font-weight: 600;
  }
  
  /* 分割线样式 */
  .tiptap-editor hr {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: 2rem 0;
  }
`;

const TextEditor: React.FC<TextEditorProps> = ({
  content = initialContent,
  onChange,
  placeholder = '开始编写你的内容...',
  minHeight = '400px',
  mode = 'full',
  showPreview = false,
  showStats = false,
  onSave,
  onCancel,
}) => {
  const [value, setValue] = useState(content || '');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [showAIAgent, setShowAIAgent] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // 用于强制重新渲染编辑器

  // 验证并清理内容格式
  const sanitizeContent = (inputContent: any): string => {
    // 如果是字符串，直接返回
    if (typeof inputContent === 'string') {
      return inputContent;
    }

    // 如果是对象，尝试提取文本内容
    if (inputContent && typeof inputContent === 'object') {
      // 处理AI写作助手返回的对象格式
      if (inputContent.result && typeof inputContent.result === 'string') {
        return inputContent.result;
      }

      // 处理可能的其他格式
      if (inputContent.content && typeof inputContent.content === 'string') {
        return inputContent.content;
      }

      // 如果是其他对象，转换为JSON字符串（仅用于调试）
      console.warn('[TextEditor] 接收到非字符串内容:', inputContent);
      return '';
    }

    // 其他类型转换为字符串
    return String(inputContent || '');
  };

  // 预处理内容，将Markdown转换为HTML以便在TipTap中显示
  const preprocessContent = (content: string): string => {
    if (!content) return '';

    // 如果内容看起来像Markdown，进行基本转换
    let processedContent = content;

    // 处理代码块
    processedContent = processedContent.replace(/```(\w+)?\s*\n([\s\S]*?)\n```/g, (match, language, code) => {
      const lang = language || 'text';
      return `<pre class="tiptap-code-block" data-language="${lang}"><code>${code.trim()}</code></pre>`;
    });

    // 处理内联代码
    processedContent = processedContent.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 处理粗体
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 处理斜体
    processedContent = processedContent.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 处理标题
    processedContent = processedContent.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    processedContent = processedContent.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    processedContent = processedContent.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 处理链接
    processedContent = processedContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // 处理段落（将连续的非HTML行包装为段落）
    const lines = processedContent.split('\n');
    const processedLines: string[] = [];
    let currentParagraph: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 如果是空行或HTML标签行，结束当前段落
      if (!trimmedLine || trimmedLine.startsWith('<')) {
        if (currentParagraph.length > 0) {
          processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
          currentParagraph = [];
        }
        if (trimmedLine) {
          processedLines.push(trimmedLine);
        }
      } else {
        // 普通文本行，添加到当前段落
        currentParagraph.push(trimmedLine);
      }
    }

    // 处理最后一个段落
    if (currentParagraph.length > 0) {
      processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
    }

    return processedLines.join('\n');
  };

  // 监听外部 content 变化 - 修复无限循环问题
  useEffect(() => {
    if (content !== undefined) {
      const sanitizedContent = sanitizeContent(content);
      // 只有当内容真正不同时才更新
      if (sanitizedContent !== value) {
        setValue(sanitizedContent);
        // 强制重新渲染编辑器以确保内容同步
        setEditorKey((prev) => prev + 1);
      }
    }
  }, [content]); // 移除 value 依赖，避免无限循环

  const handleUpdate = ({ editor }: { editor: any }) => {
    const html = editor.getHTML();

    // 防止不必要的更新
    if (html !== value) {
      setValue(html);

      if (onChange) {
        onChange(html);
      }
    }
  };

  // 处理AI内容更新
  const handleAIContentUpdate = (newContent: string) => {
    const sanitizedContent = sanitizeContent(newContent);
    setValue(sanitizedContent);
    setEditorKey((prev) => prev + 1); // 强制重新渲染编辑器

    if (onChange) {
      onChange(sanitizedContent);
    }
  };

  // 额外的工具栏（预览切换、统计、操作按钮）
  const ExtraToolbar = () => {
    if (!showPreview && !showStats && !onSave && !onCancel) {
      return null;
    }

    return (
      <div
        style={{
          padding: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* 第一行：预览、统计、AI代理功能 */}
        {(showPreview || (showStats && value) || mode === 'full') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {showPreview && (
              <>
                <button
                  onClick={() => setViewMode('edit')}
                  style={{
                    ...editorStyles.toolbarButton,
                    ...(viewMode === 'edit' ? editorStyles.toolbarButtonActive : {}),
                    width: 'auto',
                    padding: '0.5rem 0.75rem',
                  }}
                  title="编辑模式"
                >
                  <FiEdit3 size={14} />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>编辑</span>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  style={{
                    ...editorStyles.toolbarButton,
                    ...(viewMode === 'preview' ? editorStyles.toolbarButtonActive : {}),
                    width: 'auto',
                    padding: '0.5rem 0.75rem',
                  }}
                  title="预览模式"
                >
                  <FiEye size={14} />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>预览</span>
                </button>
              </>
            )}

            {showStats && value && (
              <button
                onClick={() => setShowStatsPanel(!showStatsPanel)}
                style={{
                  ...editorStyles.toolbarButton,
                  ...(showStatsPanel ? editorStyles.toolbarButtonActive : {}),
                  width: 'auto',
                  padding: '0.5rem 0.75rem',
                }}
                title="统计信息"
              >
                <FiBarChart size={14} />
                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>统计</span>
              </button>
            )}

            {/* AI代理开关按钮 */}
            {mode === 'full' && (
              <button
                onClick={() => setShowAIAgent(!showAIAgent)}
                style={{
                  ...editorStyles.toolbarButton,
                  ...(showAIAgent ? editorStyles.toolbarButtonActive : {}),
                  width: 'auto',
                  padding: '0.5rem 0.75rem',
                }}
                title="AI智能代理"
              >
                <FiCpu size={14} />
                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem' }}>AI代理</span>
              </button>
            )}
          </div>
        )}

        {/* 第二行：操作按钮 */}
        {(onSave || onCancel) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
            {onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                取消
              </Button>
            )}
            {onSave && (
              <Button variant="primary" onClick={onSave}>
                保存
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={editorStyles.richTextEditorWrapper}>
      <div style={editorStyles.textEditorContainer}>
        <style dangerouslySetInnerHTML={{ __html: getCustomStyles(minHeight) }} />

        {/* 额外工具栏 */}
        <ExtraToolbar />

        {/* 统计面板 */}
        {showStats && showStatsPanel && value && <RichTextStats content={value} showDetailed={true} />}

        {/* AI代理控制器 */}
        {showAIAgent && <AIAgentController content={value} onContentUpdate={handleAIContentUpdate} />}

        {viewMode === 'edit' ? (
          <EditorProvider
            key={editorKey} // 使用独立的key来控制重新渲染
            extensions={extensions}
            content={preprocessContent(sanitizeContent(value)) || ''}
            onUpdate={handleUpdate}
            editorProps={{
              attributes: {
                class: 'tiptap-editor',
              },
            }}
            slotBefore={<MenuBar mode={mode} />}
          />
        ) : (
          <div
            style={{
              padding: '1rem',
              minHeight,
              maxHeight: '500px',
              overflowY: 'auto',
              background: 'var(--bg-primary)',
              border: 'none',
            }}
          >
            <RichTextRenderer
              content={value || '<p>暂无内容</p>'}
              mode="note"
              enableCodeHighlight={true}
              enableImagePreview={true}
              enableTableOfContents={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextEditor;
