import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
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
  FiMoreHorizontal,
  FiEye,
  FiEdit3,
  FiBarChart,
  FiCpu,
} from 'react-icons/fi';

// 创建 lowlight 实例
const lowlight = createLowlight(common);

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { value: 'text', label: '纯文本' },
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

// 代码块语言选择器组件
const CodeBlockLanguageSelector: React.FC = () => {
  const { editor } = useCurrentEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('text');

  // 检查是否在代码块中 - 必须在所有 hooks 之后
  const isInCodeBlock = editor?.isActive('codeBlock') || false;

  // 获取当前代码块的语言
  useEffect(() => {
    if (editor && isInCodeBlock) {
      const language = editor.getAttributes('codeBlock').language || 'text';
      setCurrentLanguage(language);
    }
  }, [isInCodeBlock, editor]);

  // 点击外部关闭选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('[data-language-selector]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const setLanguage = (language: string) => {
    if (editor && editor.isActive('codeBlock')) {
      editor.chain().focus().updateAttributes('codeBlock', { language }).run();
      setCurrentLanguage(language);
      setIsOpen(false);
    }
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((lang) => lang.value === currentLanguage)?.label || '纯文本';

  // 条件渲染放在最后，确保所有 hooks 都被调用
  if (!editor || !isInCodeBlock) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} data-language-selector>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...editorStyles.toolbarButton,
          ...editorStyles.toolbarButtonActive,
          width: 'auto',
          padding: '0.5rem 0.75rem',
          fontSize: '0.85rem',
        }}
        title="选择编程语言"
      >
        <FiCode size={14} />
        <span style={{ marginLeft: '0.5rem' }}>{currentLangLabel}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            minWidth: '150px',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: currentLanguage === lang.value ? 'var(--accent-color-alpha)' : 'transparent',
                color: currentLanguage === lang.value ? 'var(--accent-color)' : 'var(--text-primary)',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
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

// 扩展配置
const extensions = [
  StarterKit.configure({
    codeBlock: false, // 禁用默认代码块，使用 lowlight 版本
  }),
  CodeBlockLowlight.configure({
    lowlight,
    defaultLanguage: 'text',
    HTMLAttributes: {
      class: 'rich-text-code-block',
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
  toolbarButtonActive: {
    background: 'var(--accent-color-alpha)',
    color: 'var(--accent-color)',
    border: '1px solid var(--accent-color)',
  },
  toolbarText: {
    fontSize: '14px',
    fontWeight: 500,
  },
};

// 工具栏组件
const MenuBar = ({ mode = 'full' }: { mode?: 'full' | 'simple' }) => {
  const { editor } = useCurrentEditor();

  if (!editor) return null;

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

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  // 添加代码块
  const addCodeBlock = () => {
    editor.chain().focus().toggleCodeBlock({ language: 'text' }).run();
  };

  return (
    <div style={editorStyles.editorToolbar}>
      {/* 格式化工具 */}
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

      {/* 标题工具 */}
      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('heading', { level: 2 }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="标题2"
        >
          <FiType size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('heading', { level: 3 }) ? editorStyles.toolbarButtonActive : {}),
          }}
          title="标题3"
        >
          <span style={editorStyles.toolbarText}>H3</span>
        </button>
      </div>

      {/* 对齐工具 */}
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
      </div>

      {/* 列表和引用工具 */}
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

      {/* 特殊元素工具 */}
      <div style={editorStyles.toolbarGroup}>
        <button
          onClick={addCodeBlock}
          style={{
            ...editorStyles.toolbarButton,
            ...(editor.isActive('codeBlock') ? editorStyles.toolbarButtonActive : {}),
          }}
          title="代码块"
        >
          <FiCode size={16} />
        </button>
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

      {/* 代码块语言选择器 */}
      <div style={editorStyles.toolbarGroup}>
        <CodeBlockLanguageSelector />
      </div>

      {/* 其他工具 */}
      <div style={{ ...editorStyles.toolbarGroup, ...editorStyles.toolbarGroupLast }}>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          style={editorStyles.toolbarButton}
          title="水平分割线"
        >
          <FiMoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};

interface TextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  mode?: 'full' | 'simple';
  showPreview?: boolean;
  showStats?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  content = '',
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

  // 监听外部内容变化
  useEffect(() => {
    if (content !== undefined && content !== value) {
      setValue(content);
    }
  }, [content]);

  // 处理编辑器内容初始化
  const editorContent = useMemo(() => {
    if (!value) return '<p></p>';

    // 如果内容已经是 HTML 格式，直接返回
    if (value.includes('<') && value.includes('>')) {
      return value;
    }

    // 如果是 Markdown 格式，先转换为 HTML
    if (value.includes('```') || value.includes('**') || value.includes('*') || value.includes('#')) {
      // 简单的 Markdown 检测，这里可以更复杂
      return value;
    }

    return value;
  }, [value]);

  // 处理编辑器更新
  const handleUpdate = useCallback(
    ({ editor }: { editor: any }) => {
      const html = editor.getHTML();
      setValue(html);
      onChange?.(html);
    },
    [onChange],
  );

  // 处理AI内容更新
  const handleAIContentUpdate = useCallback(
    (newContent: string) => {
      setValue(newContent);
      onChange?.(newContent);
    },
    [onChange],
  );

  // 额外的工具栏
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
        {/* 额外工具栏 */}
        <ExtraToolbar />

        {/* 统计面板 */}
        {showStats && showStatsPanel && value && <RichTextStats content={value} showDetailed={true} />}

        {/* AI代理控制器 */}
        {showAIAgent && <AIAgentController content={value} onContentUpdate={handleAIContentUpdate} />}

        {/* 主编辑器 */}
        {viewMode === 'edit' ? (
          <div style={{ minHeight, position: 'relative' }}>
            <EditorProvider
              key={value} // 添加 key 确保内容变化时重新渲染
              extensions={extensions}
              content={editorContent}
              onUpdate={handleUpdate}
              editorProps={{
                attributes: {
                  class: 'rich-text-content',
                  style: `outline: none; padding: 1rem; min-height: ${minHeight};`,
                },
              }}
              slotBefore={<MenuBar mode={mode} />}
            />
          </div>
        ) : (
          <div
            style={{
              padding: '1rem',
              minHeight,
              maxHeight: '500px',
              overflowY: 'auto',
              background: 'var(--bg-primary)',
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
