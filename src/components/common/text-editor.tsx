import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import CodeBlock from './code-block';
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
  FiChevronDown,
} from 'react-icons/fi';

// 代码块语言选择器组件
const CodeBlockLanguageSelector: React.FC<{ editor: any }> = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 常用编程语言列表
  const languages = [
    { value: '', label: '纯文本' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'sql', label: 'SQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'markdown', label: 'Markdown' },
  ];

  // 获取当前代码块的语言
  useEffect(() => {
    if (editor.isActive('codeBlock')) {
      const { node } = editor.getAttributes('codeBlock');
      const language = node?.attrs?.language || '';
      setCurrentLanguage(language);
    }
  }, [editor]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 设置代码块语言
  const setLanguage = (language: string) => {
    if (editor.isActive('codeBlock')) {
      // 更新代码块的 language 属性
      editor.chain().focus().updateAttributes('codeBlock', { language }).run();
      setCurrentLanguage(language);
      setIsOpen(false);
    }
  };

  const currentLabel = languages.find((lang) => lang.value === currentLanguage)?.label || '纯文本';

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...editorStyles.toolbarButton,
          marginLeft: '4px',
          fontSize: '12px',
          minWidth: '80px',
          justifyContent: 'space-between',
        }}
        title="选择语言"
      >
        <span>{currentLabel}</span>
        <FiChevronDown size={12} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '4px',
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: 'none',
                background: currentLanguage === lang.value ? 'var(--bg-secondary)' : 'transparent',
                color: 'var(--text-primary)',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
                borderBottom: '1px solid var(--border-color)',
              }}
              onMouseEnter={(e) => {
                if (currentLanguage !== lang.value) {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentLanguage !== lang.value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 定义扩展数组
const extensions = [
  StarterKit.configure({
    codeBlock: {
      HTMLAttributes: {
        class: 'tiptap-code-block',
      },
      languageClassPrefix: 'language-',
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
        {editor.isActive('codeBlock') && <CodeBlockLanguageSelector editor={editor} />}
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
  .rich-text-content {
    outline: none;
    width: 100%;
    min-height: ${minHeight};
    padding: 1rem;
  }
  
  /* 编辑器中的代码块样式 */
  .rich-text-content pre {
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
  
  .rich-text-content pre code {
    background: transparent;
    padding: 0;
    border: none;
    font-family: inherit;
    color: var(--text-primary);
  }
  
  /* 代码块语言标签 */
  .rich-text-content pre[data-language]::before {
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
  const [editorKey, setEditorKey] = useState(0);
  const lastExternalContentRef = useRef(content || '');
  const isInternalUpdateRef = useRef(false);

  // 验证并清理内容格式
  const sanitizeContent = useCallback((inputContent: any): string => {
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
  }, []);

  // 准备给编辑器的内容（缓存以避免不必要的重渲染）
  const editorContent = useMemo(() => {
    if (!value) return '';

    // 将 rich-text-code-block 转换为标准的 pre>code 结构
    let processedHtml = value.replace(
      /<div[^>]*class="rich-text-code-block"[^>]*data-language="([^"]*)"[^>]*><pre><code>([\s\S]*?)<\/code><\/pre><\/div>/gi,
      (match, language, code) => {
        // TipTap 的 codeBlock 使用 pre 标签包裹 code，同时保留 data-language 属性
        return `<pre data-language="${language}"><code class="language-${language}">${code}</code></pre>`;
      },
    );

    // 移除外层的 rich-text-content wrapper（如果存在）
    processedHtml = processedHtml.replace(/<div class="rich-text-content">([\s\S]*?)<\/div>$/, '$1');

    return processedHtml;
  }, [value]);

  // 监听外部 content 变化
  useEffect(() => {
    if (content !== undefined && !isInternalUpdateRef.current) {
      const sanitizedContent = sanitizeContent(content);
      // 只有当外部内容真正变化时才更新
      if (sanitizedContent !== lastExternalContentRef.current) {
        lastExternalContentRef.current = sanitizedContent;
        setValue(sanitizedContent);
        // 强制编辑器重新渲染以显示新内容
        setEditorKey((prev) => prev + 1);
      }
    }
    // 重置内部更新标记
    isInternalUpdateRef.current = false;
  }, [content, sanitizeContent]);

  const handleUpdate = useCallback(
    ({ editor }: { editor: any }) => {
      let html = editor.getHTML();

      // 将编辑器的 pre>code 结构转换回 rich-text-code-block 格式
      html = html.replace(
        /<pre[^>]*data-language="([^"]*)"[^>]*>\s*<code[^>]*class="language-[^"]*"[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
        (match: string, language: string, code: string) => {
          return `<div class="rich-text-code-block" data-language="${language}"><pre><code>${code}</code></pre></div>`;
        },
      );

      // 防止不必要的更新
      if (html !== value) {
        isInternalUpdateRef.current = true;
        lastExternalContentRef.current = html;
        setValue(html);

        if (onChange) {
          onChange(html);
        }
      }
    },
    [value, onChange],
  );

  // 处理AI内容更新
  const handleAIContentUpdate = useCallback(
    (newContent: string) => {
      const sanitizedContent = sanitizeContent(newContent);
      isInternalUpdateRef.current = true;
      lastExternalContentRef.current = sanitizedContent;
      setValue(sanitizedContent);

      if (onChange) {
        onChange(sanitizedContent);
      }
    },
    [sanitizeContent, onChange],
  );

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
            key={editorKey}
            extensions={extensions}
            content={editorContent || ''}
            onUpdate={handleUpdate}
            editorProps={{
              attributes: {
                class: 'rich-text-content',
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
